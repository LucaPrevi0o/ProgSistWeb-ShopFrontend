import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart-service';
import { CheckoutService } from '../../services/checkout-service';
import { UserService } from '../../services/user-service';
import { HttpState, toHttpState } from '../../app.config';
import { Observable, tap, switchMap } from 'rxjs';
import { Cart } from '../../models/cart';
import { PaymentMethod } from '../../models/payment';
import { User } from '../../models/user';
import { OrderPayload } from '../../models/order';
import { buildPaymentData, mapUserInfoToFormPatch, computeAutofilled, isPayPalDetails, isDebitCardDetails, isCreditCardDetails, maskCardNumber } from '../../utils/checkout-helpers';

@Component({
    selector: 'app-checkout',
    standalone: true,
    templateUrl: './checkout.html',
    styleUrls: ['./checkout.scss'],
    imports: [AsyncPipe, ReactiveFormsModule]
})
export class CheckoutComponent implements OnInit {

    state$!: Observable<HttpState<Cart>>;
    userState$?: Observable<HttpState<User>>;
    checkoutForm: FormGroup;
    autofilled: Record<string, boolean> = {};
    router = inject(Router);
    availablePaymentMethods: PaymentMethod[] = [];
    selectedPaymentMethod: PaymentMethod | null = null;
    paymentMode: 'saved' | 'manual' = 'saved';
    manualPaymentType: 'paypal' | 'debit_card' | 'credit_card' | null = null;

    constructor(private fb: FormBuilder, private cartService: CartService, private checkoutService: CheckoutService, private userService: UserService) {
        this.checkoutForm = this.fb.group({
            name: ['', Validators.required],
            surname: ['', Validators.required],
            address: ['', Validators.required],
            city: ['', Validators.required],
            postal_code: ['', Validators.required],
            country: ['', Validators.required],
            phone: [''],
            paymentMethodId: [''],
            manualPaymentType: [''],
            paypalEmail: [''],
            paypalPassword: [''],
            cardNumber: [''],
            expiryDate: [''],
            cvv: [''],
            creditLimit: ['']
        });
    }

    ngOnInit(): void {
        this.state$ = toHttpState(this.cartService.getCartItems());

        try {
            if (this.userService.isLoggedIn()) {
                this.userState$ = toHttpState(
                    this.userService.getUser().pipe(
                        tap((user) => {
                            const info = user?.info;
                            if (info) {
                                const patch = mapUserInfoToFormPatch(info);
                                this.checkoutForm.patchValue(patch);
                                this.autofilled = computeAutofilled(patch);

                                // Load available payment methods
                                if (info.paymentMethods && info.paymentMethods.length > 0) {
                                    this.availablePaymentMethods = info.paymentMethods;
                                    this.paymentMode = 'saved';
                                } else {
                                    this.paymentMode = 'manual';
                                }
                            }
                        })
                    )
                );
            }
        } catch (e) {
            // getUser may throw if no user id in storage; ignore in that case
            console.warn('Could not attempt to load saved user info', e);
        }
    }

    getSubtotal(cart: Cart) : number { return cart.items.reduce((s,i) => s + i.product.price * i.quantity, 0); }

    submit(cart: Cart) : void {
        if (this.checkoutForm.invalid) return;
        if (this.paymentMode === 'saved' && !this.selectedPaymentMethod) return;
        if (this.paymentMode === 'manual' && !this.manualPaymentType) return;

        const paymentData = buildPaymentData(this.checkoutForm.value, this.paymentMode, this.selectedPaymentMethod, this.manualPaymentType);

        const orderPayload = {
            order: {
                name: this.checkoutForm.value.name,
                surname: this.checkoutForm.value.surname,
                address: this.checkoutForm.value.address,
                city: this.checkoutForm.value.city,
                postal_code: this.checkoutForm.value.postal_code,
                country: this.checkoutForm.value.country,
                phone: this.checkoutForm.value.phone,
                payment_method_id: this.selectedPaymentMethod?.id || null,
                payment: paymentData,
                items: cart.items.map(i => ({ product_id: i.product.id, quantity: i.quantity }))
            }
        };

        const call$ = this.checkoutService.placeOrder(orderPayload as OrderPayload).pipe(
            switchMap(() => this.cartService.clearCart()),
            tap(() => this.router.navigate(['/products']))
        );

        this.state$ = toHttpState(call$);
    }

    clearAutofill(field: string): void {
        if (this.autofilled[field]) {
            this.checkoutForm.get(field)?.setValue('');
            this.autofilled[field] = false;
        }
    }

    setPaymentMode(mode: 'saved' | 'manual'): void {
        this.paymentMode = mode;
        this.selectedPaymentMethod = null;
        this.manualPaymentType = null;
        this.checkoutForm.patchValue({
            paymentMethodId: '',
            manualPaymentType: '',
            paypalEmail: '',
            paypalPassword: '',
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            creditLimit: ''
        });
    }

    onPaymentMethodChange(): void {
        const methodId = this.checkoutForm.get('paymentMethodId')?.value;
        this.selectedPaymentMethod = this.availablePaymentMethods.find(m => m.id === parseInt(methodId)) || null;
        
        // Reset payment fields when method changes
        this.checkoutForm.patchValue({
            paypalEmail: '',
            paypalPassword: '',
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            creditLimit: ''
        });

        // Pre-fill payment method fields if using a saved method
        if (this.selectedPaymentMethod) {
            const details = this.selectedPaymentMethod.details as any;
            if (isPayPalDetails(details)) {
                this.checkoutForm.patchValue({ paypalEmail: details.email });
            } else if (isDebitCardDetails(details) || isCreditCardDetails(details)) {
                this.checkoutForm.patchValue({
                    cardNumber: details.cardNumber,
                    expiryDate: details.expiryDate,
                    cvv: details.cvv,
                    creditLimit: (details as any).creditLimit || ''
                });
            }
        }
    }

    onManualPaymentTypeChange(): void {
        const type = this.checkoutForm.get('manualPaymentType')?.value;
        this.manualPaymentType = type || null;
        // Reset payment fields
        this.checkoutForm.patchValue({
            paypalEmail: '',
            paypalPassword: '',
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            creditLimit: ''
        });
    }

    isPayPal(method: PaymentMethod): boolean { return isPayPalDetails(method.details); }
    isDebitCard(method: PaymentMethod): boolean { return isDebitCardDetails(method.details); }
    isCreditCard(method: PaymentMethod): boolean { return isCreditCardDetails(method.details); }

    getPaymentMethodLabel(method: PaymentMethod): string {
        const details = method.details as any;
        if (isPayPalDetails(details)) return `PayPal - ${details.email}`;
        const masked = maskCardNumber(details?.cardNumber);
        const type = isCreditCardDetails(details) ? 'Carta di Credito' : 'Carta di Debito';
        return `${type} - ${masked}`;
    }
}