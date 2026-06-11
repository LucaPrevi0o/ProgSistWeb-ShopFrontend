import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart-service';
import { CheckoutService } from '../../services/checkout-service';
import { UserService } from '../../services/user-service';
import { HttpState, toHttpState } from '../../app.config';
import { Observable, tap, switchMap } from 'rxjs';
import { PersonalData, User } from '../../models/user';
import { Cart } from '../../models/cart';
import { Order } from '../../models/order';
import { PaymentMethod, CreditCard, PayPal } from '../../models/payment';

@Component({
    selector: 'app-checkout',
    standalone: true,
    templateUrl: './checkout.html',
    styleUrls: ['./checkout.scss'],
    imports: [AsyncPipe, ReactiveFormsModule]
})
export class CheckoutComponent implements OnInit {

    state$!: Observable<HttpState<Cart>>;
    userState$!: Observable<HttpState<User>>;
    checkoutForm: FormGroup;
    paymentMethodForm: FormGroup;
    autofilled: Record<string, boolean> = {};
    savedPaymentMethods: PaymentMethod[] = [];
    router = inject(Router);

    constructor(private fb: FormBuilder, private cartService: CartService, private checkoutService: CheckoutService, private userService: UserService) {

        this.checkoutForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            address: this.fb.group({
                street: ['', Validators.required],
                city: ['', Validators.required],
                postalCode: ['', Validators.required],
                country: ['', Validators.required]
            }),
            phone: [''],
            selectedPaymentMethod: [''],
            paymentSource: ['new'],
            selectedSavedPaymentId: ['']
        });

        this.paymentMethodForm = this.fb.group({
            creditCard: this.fb.group({
                cardNumber: ['', Validators.required],
                expiryMonth: ['', Validators.required],
                expiryYear: ['', Validators.required],
                cvv: ['', Validators.required],
                cardHolderName: ['', Validators.required]
            }),
            payPal: this.fb.group({
                email: ['', Validators.required]
            })
        });
    }

    ngOnInit(): void {

        this.state$ = toHttpState(this.cartService.getCartItems());
        const userId = this.userService.getUserId();
        if (userId) this.userState$ = toHttpState(this.userService.getUser()).pipe(
            tap(state => {

                if (state.status === 'success') {

                    const personalData = (state.data as User)?.userInfo?.data;
                    if (personalData) this.applyPersonalData(personalData);
                    // store saved payment methods for the checkout UI
                    const paymentMethods = (state.data as User)?.userInfo?.paymentMethods;
                    this.savedPaymentMethods = paymentMethods ? (paymentMethods as PaymentMethod[]).slice() : [];
                }
            })
        );

        // Include the payment sub-form into the main checkout form so overall validity
        // reflects the selected payment details.
        this.checkoutForm.addControl('payment', this.paymentMethodForm);

        // Initialize validators according to current selection (may be empty)
        const selected = this.checkoutForm.get('selectedPaymentMethod')?.value;
        this.setPaymentValidators(selected);

        // Validator updates are triggered from the template change handler
        // to avoid manual subscriptions in the component class.
    }

    getSubtotal(cart: Cart) : number {
        return cart.items.reduce((s,i) => s + i.product.price * i.quantity, 0);
    }

    submit(cart: Cart) : void {

        if (this.checkoutForm.invalid) return;
        const fv = this.checkoutForm.value;

        const personalData: PersonalData = {
            firstName: fv.firstName,
            lastName: fv.lastName,
            phone: fv.phone ?? '',
            address: {
                street: fv.address.street ?? '',
                city: fv.address.city ?? '',
                postalCode: fv.address.postalCode ?? '',
                country: fv.address.country ?? ''
            }
        };

        let selectedPaymentMethod: PaymentMethod;

        const paymentSource = fv.paymentSource ?? 'new';
        const method = fv.selectedPaymentMethod;
        const paymentValues = fv.payment ?? {};

        // If user chose a saved payment method, use it
        if (paymentSource === 'saved') {
            const selectedId = fv.selectedSavedPaymentId;
            const pm = this.savedPaymentMethods.find(p => String(p.id) === String(selectedId));
            if (pm) {
                selectedPaymentMethod = pm;
            } else {
                // no saved method selected; abort
                return;
            }
        } else if (method === 'creditCard') {
            const cc = paymentValues.creditCard ?? this.paymentMethodForm.get('creditCard')!.value;
            selectedPaymentMethod = {
                methodType: 'creditCard',
                details: {
                    cardNumber: cc.cardNumber,
                    expiryMonth: Number(cc.expiryMonth),
                    expiryYear: Number(cc.expiryYear),
                    cvv: cc.cvv,
                    cardHolderName: cc.cardHolderName
                } as CreditCard
            };
        } else if (method === 'payPal') {
            const pp = paymentValues.payPal ?? this.paymentMethodForm.get('payPal')!.value;
            selectedPaymentMethod = {
                methodType: 'payPal',
                details: {
                    email: pp.email
                } as PayPal
            };
        } else {
            selectedPaymentMethod = {
                methodType: method ?? '',
                details: {} as any
            };
        }

        const order: Order = {
            personalData: personalData,
            items: cart.items,
            paymentMethod: selectedPaymentMethod
        };

        this.state$ = toHttpState(this.checkoutService.placeOrder(order).pipe(
            switchMap(() => this.cartService.clearCart()),
            tap(() => this.router.navigate(['/products']))
        ));
    }

    private applyPersonalData(personalData: PersonalData): void {

        const values: PersonalData = {

            firstName: personalData.firstName ?? '',
            lastName: personalData.lastName ?? '',
            phone: personalData.phone ?? '',
            address: {
                street: personalData.address?.street ?? '',
                city: personalData.address?.city ?? '',
                postalCode: personalData.address?.postalCode ?? '',
                country: personalData.address?.country ?? ''
            }
        };

        this.checkoutForm.patchValue(values);

        if (values.firstName && values.firstName.toString().trim().length) this.autofilled['firstName'] = true;
        if (values.lastName && values.lastName.toString().trim().length) this.autofilled['lastName'] = true;
        if (values.phone && values.phone.toString().trim().length) this.autofilled['phone'] = true;

        Object.entries(values.address).forEach(([k, v]) => {
            if (v && v.toString().trim().length) this.autofilled[`address.${k}`] = true;
        });
    }

    clearAutofill(field: string): void {

        if (this.autofilled[field]) {

            this.checkoutForm.get(field)?.setValue('');
            this.autofilled[field] = false;
        }
    }

    // Called from the template when the user changes the payment method
    onPaymentMethodChange(method: string): void {
        // Only apply validators for the "new" payment source
        const source = this.checkoutForm.get('paymentSource')?.value;
        if (source === 'new') this.setPaymentValidators(method);
    }

    // Called when the user toggles between entering a new payment method or using a saved one
    onPaymentSourceChange(source: string): void {
        if (source === 'new') {
            const selected = this.checkoutForm.get('selectedPaymentMethod')?.value;
            this.setPaymentValidators(selected);
        } else {
            // clear validators for new payment details
            this.setPaymentValidators(null);
        }
    }

    private setPaymentValidators(method?: string | null): void {

        const ccGroup = this.paymentMethodForm.get('creditCard') as FormGroup;
        const ppGroup = this.paymentMethodForm.get('payPal') as FormGroup;

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

        this.checkoutForm.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    }

    private setGroupRequired(group: FormGroup, required: boolean) {
        Object.keys(group.controls).forEach(key => {
            const control = group.get(key);
            if (!control) return;
            if (required) control.setValidators([Validators.required]);
            else control.clearValidators();
            control.updateValueAndValidity();
        });
    }

    private applySavedPaymentMethod(pm: PaymentMethod): void {

        if (!pm) return;

        const method = pm.methodType;
        this.checkoutForm.patchValue({ selectedPaymentMethod: method });

        if (method === 'creditCard') {
            const cc = pm.details as CreditCard;
            this.paymentMethodForm.get('creditCard')?.patchValue({
                cardNumber: cc.cardNumber ?? '',
                expiryMonth: cc.expiryMonth ?? '',
                expiryYear: cc.expiryYear ?? '',
                cvv: cc.cvv ?? '',
                cardHolderName: cc.cardHolderName ?? ''
            });

            if (cc.cardNumber && cc.cardNumber.toString().trim().length) this.autofilled['payment.creditCard.cardNumber'] = true;
            if (cc.cardHolderName && cc.cardHolderName.toString().trim().length) this.autofilled['payment.creditCard.cardHolderName'] = true;

        } else if (method === 'payPal') {
            const pp = pm.details as PayPal;
            this.paymentMethodForm.get('payPal')?.patchValue({ email: pp.email ?? '' });
            if (pp.email && pp.email.toString().trim().length) this.autofilled['payment.payPal.email'] = true;
        }

        this.setPaymentValidators(method);
    }

    asPayPal(paymentMethod: PaymentMethod): PayPal | null {
        return (paymentMethod.methodType === 'payPal' || String(paymentMethod.methodType).toLowerCase() === 'paypal') ? paymentMethod.details as PayPal : null;
    }

    asCreditCard(paymentMethod: PaymentMethod): CreditCard | null {
        return (paymentMethod.methodType === 'creditCard' || String(paymentMethod.methodType).toLowerCase().includes('credit')) ? paymentMethod.details as CreditCard : null;
    }

    last4Digits(cardNumber: string): string {
        return (cardNumber || '').toString().slice(-4);
    }
}
