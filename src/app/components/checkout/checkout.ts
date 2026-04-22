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
            selectedPaymentMethod: ['']
        });

        this.paymentMethodForm = this.fb.group({
            creditCard: this.fb.group({
                cardNumber: ['', Validators.required],
                expiryMonth: ['', Validators.required],
                expiryYear: ['', Validators.required],
                cvv: ['', Validators.required],
                cardholderName: ['', Validators.required]
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

                    const personalData = (state.data as User)?.info?.data;
                    if (personalData) this.applyPersonalData(personalData);
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

        const method = fv.selectedPaymentMethod;
        const paymentValues = fv.payment ?? {};

        if (method === 'creditCard') {
            const cc = paymentValues.creditCard ?? this.paymentMethodForm.get('creditCard')!.value;
            selectedPaymentMethod = {
                type: 'creditCard',
                details: {
                    cardNumber: cc.cardNumber,
                    expiryMonth: Number(cc.expiryMonth),
                    expiryYear: Number(cc.expiryYear),
                    cvv: cc.cvv,
                    cardholderName: cc.cardholderName
                } as CreditCard
            };
        } else if (method === 'payPal') {
            const pp = paymentValues.payPal ?? this.paymentMethodForm.get('payPal')!.value;
            selectedPaymentMethod = {
                type: 'payPal',
                details: {
                    email: pp.email
                } as PayPal
            };
        } else {
            selectedPaymentMethod = {
                type: method ?? '',
                details: {} as any
            };
        }

        const order: Order = {
            personalData: personalData,
            items: cart.items,
            paymentMethod: selectedPaymentMethod
        };

        const uid = this.userService.getUserId();
        if (uid) order.userId = Number(uid);

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
        this.setPaymentValidators(method);
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
}
