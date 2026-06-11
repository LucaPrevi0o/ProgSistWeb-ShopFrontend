import { Component, inject, OnInit } from "@angular/core";
import { Observable, switchMap, tap } from "rxjs";
import { HttpState, toHttpState} from "../../app.config";
import { Router } from "@angular/router";
import { AsyncPipe } from "@angular/common";
import { User, UserInfo } from "../../models/user";
import { UserService } from "../../services/user-service";
import { LoginRedirectorComponent } from "../login-redirector/login-redirector";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentMethod, CreditCard, PayPal } from '../../models/payment';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [AsyncPipe, LoginRedirectorComponent, ReactiveFormsModule],
    templateUrl: './profile.html',
    styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {

    state$!: Observable<HttpState<User>>;
    router = inject(Router);

    profileForm!: FormGroup;
    editMode: boolean = false;
    savedPaymentMethods: PaymentMethod[] = [];

    constructor(private userService: UserService, private fb: FormBuilder) {

        this.profileForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            phone: ['', Validators.required],
            street: ['', Validators.required],
            city: ['', Validators.required],
            postalCode: ['', Validators.required],
            country: ['', Validators.required],
            selectedPaymentMethod: [''],
            payment: this.fb.group({
                creditCard: this.fb.group({
                    cardNumber: [''],
                    expiryMonth: [''],
                    expiryYear: [''],
                    cvv: [''],
                    cardHolderName: ['']
                }),
                payPal: this.fb.group({
                    email: ['']
                })
            })
        });
    }

    ngOnInit() : void { this.state$ = toHttpState(this.userService.getUser()); }

    goToLogin() : void { this.router.navigate(['/login']); }

    logout() : void { 
        
        this.userService.logout();
        this.router.navigate(['/login']);
    }

    startEdit(user?: User) : void {

        this.editMode = true;

        const personalData = user?.userInfo?.data;
        const addr = personalData?.address;

        this.profileForm.patchValue({
            firstName: personalData?.firstName ?? '',
            lastName: personalData?.lastName ?? '',
            phone: personalData?.phone ?? '',
            street: addr?.street ?? '',
            city: addr?.city ?? '',
            postalCode: addr?.postalCode ?? '',
            country: addr?.country ?? ''
        });

        // Load saved payment methods for editing (keep a local copy)
        this.savedPaymentMethods = user?.userInfo?.paymentMethods ? (user!.userInfo!.paymentMethods as PaymentMethod[]).slice() : [];

        // If the user has at least one saved payment method, prefill the add-new form with the first one
        const pm = this.savedPaymentMethods?.[0];
        if (pm) {
            this.profileForm.patchValue({ selectedPaymentMethod: pm.methodType });
            if (pm.methodType === 'creditCard') {
                const cc = pm.details as CreditCard;
                this.profileForm.get('payment.creditCard')?.patchValue({
                    cardNumber: cc.cardNumber ?? '',
                    expiryMonth: cc.expiryMonth ?? '',
                    expiryYear: cc.expiryYear ?? '',
                    cvv: cc.cvv ?? '',
                    cardHolderName: cc.cardHolderName ?? ''
                });
            } else if (pm.methodType === 'payPal') {
                const pp = pm.details as PayPal;
                this.profileForm.get('payment.payPal')?.patchValue({ email: pp.email ?? '' });
            }
        }
    }

    saveInfo() : void {

        if (this.profileForm.invalid) return;

        const userIdStr = this.userService.getUserId();
        if (!userIdStr) { this.goToLogin(); return; }
        const userId = Number(userIdStr);

        const v = this.profileForm.value;
        const userInfo: Partial<UserInfo> = {
            data: {
                firstName: v.firstName,
                lastName: v.lastName,
                phone: v.phone,
                address: {
                    street: v.street,
                    city: v.city,
                    postalCode: v.postalCode,
                    country: v.country
                }
            }
        };

        // If user selected a payment method in the add-new form, validate and include it
        const selected = this.profileForm.get('selectedPaymentMethod')?.value;
        const paymentValues = this.profileForm.get('payment')?.value ?? {};

        const finalPaymentMethods: PaymentMethod[] = this.savedPaymentMethods ? this.savedPaymentMethods.slice() : [];

        if (selected === 'creditCard') {
            const cc = paymentValues.creditCard ?? this.profileForm.get('payment.creditCard')?.value;
            // basic validation
            if (!cc || !cc.cardNumber || !cc.cvv) {
                this.profileForm.get('payment.creditCard')?.markAllAsTouched();
                return;
            }

            const pm: PaymentMethod = {
                methodType: 'creditCard',
                details: {
                    cardNumber: cc.cardNumber,
                    expiryMonth: Number(cc.expiryMonth),
                    expiryYear: Number(cc.expiryYear),
                    cvv: cc.cvv,
                    cardHolderName: cc.cardHolderName
                } as CreditCard
            };

            finalPaymentMethods.push(pm);

        } else if (selected === 'payPal') {
            const pp = paymentValues.payPal ?? this.profileForm.get('payment.payPal')?.value;
            if (!pp || !pp.email) {
                this.profileForm.get('payment.payPal')?.markAllAsTouched();
                return;
            }

            const pm: PaymentMethod = { methodType: 'payPal', details: { email: pp.email } as PayPal };
            finalPaymentMethods.push(pm);
        }

        if (finalPaymentMethods.length) userInfo.paymentMethods = finalPaymentMethods;

        this.state$ = toHttpState(
            this.userService.updateUserInfo(userId, userInfo).pipe(
                switchMap(() => this.userService.getUser()),
                tap((user: User) => {
                    this.editMode = false;
                    this.profileForm.markAsPristine();
                    this.profileForm.markAsUntouched();
                    // update local cache of saved payment methods
                    this.savedPaymentMethods = (user.userInfo?.paymentMethods as PaymentMethod[]) || [];
                })
            )
        );
    }

    cancelEdit() : void {

        this.editMode = false;
        this.profileForm.reset();
    }

    removeSavedMethod(id?: number): void {

        const userIdStr = this.userService.getUserId();
        if (!userIdStr) { this.goToLogin(); return; }
        const userId = Number(userIdStr);

        const remaining = (this.savedPaymentMethods || []).filter(pm => pm.id !== id);

        this.state$ = toHttpState(
            this.userService.updateUserInfo(userId, { paymentMethods: remaining }).pipe(
                switchMap(() => this.userService.getUser()),
                tap((user: User) => {
                    this.savedPaymentMethods = (user.userInfo?.paymentMethods as PaymentMethod[]) || [];
                })
            )
        );
    }

    // Called from the template when the user changes the payment method selection
    onPaymentMethodChange(method: string): void {
        const ccGroup = this.profileForm.get('payment.creditCard') as FormGroup;
        const ppGroup = this.profileForm.get('payment.payPal') as FormGroup;

        if (method === 'creditCard') {
            this.setGroupRequired(ccGroup, true);
            this.setGroupRequired(ppGroup, false);
        } else if (method === 'payPal') {
            this.setGroupRequired(ccGroup, false);
            this.setGroupRequired(ppGroup, true);
        } else {
            this.setGroupRequired(ccGroup, false);
            this.setGroupRequired(ppGroup, false);
        }
    }

    private setGroupRequired(group: FormGroup, required: boolean) {
        if (!group) return;
        Object.keys(group.controls).forEach(key => {
            const control = group.get(key);
            if (!control) return;
            if (required) control.setValidators([Validators.required]);
            else control.clearValidators();
            control.updateValueAndValidity();
        });
    }

    asPayPal(paymentMethod: PaymentMethod): PayPal | null {
        return (paymentMethod.methodType === 'payPal' || String(paymentMethod.methodType).toLowerCase() === 'paypal') ? paymentMethod.details as PayPal : null;
    }

    asCreditCard(paymentMethod: PaymentMethod): CreditCard | null {
        return (paymentMethod.methodType === 'creditCard' || String(paymentMethod.methodType).toLowerCase().includes('credit')) ? paymentMethod.details as CreditCard : null;
    }

    last4Digits(cardNumber: string): string {
        return cardNumber.slice(-4);
    }
}