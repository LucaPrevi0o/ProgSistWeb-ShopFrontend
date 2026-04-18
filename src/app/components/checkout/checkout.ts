import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart-service';
import { CheckoutService } from '../../services/checkout-service';
import { UserService } from '../../services/user-service';
import { HttpState, toHttpState } from '../../app.config';
import { Observable, tap } from 'rxjs';
import { Cart } from '../../models/cart';

@Component({
    selector: 'app-checkout',
    standalone: true,
    templateUrl: './checkout.html',
    styleUrls: ['./checkout.scss'],
    imports: [AsyncPipe, ReactiveFormsModule]
})
export class CheckoutComponent implements OnInit {

    state$!: Observable<HttpState<Cart>>;
    checkoutForm: FormGroup;
    autofilled: Record<string, boolean> = {};
    router = inject(Router);

    constructor(private fb: FormBuilder, private cartService: CartService, private checkoutService: CheckoutService, private userService: UserService) {
        this.checkoutForm = this.fb.group({
            name: ['', Validators.required],
            surname: ['', Validators.required],
            address: ['', Validators.required],
            city: ['', Validators.required],
            postal_code: ['', Validators.required],
            country: ['', Validators.required],
            phone: ['']
        });
    }

    ngOnInit(): void {
        this.state$ = toHttpState(this.cartService.getCartItems());

        try {
            if (this.userService.isLoggedIn()) {
                this.userService.getUser().subscribe({
                    next: (user) => {
                        const info = (user as any)?.info;
                        if (info) {
                            this.checkoutForm.patchValue({
                                name: info.firstName ?? '',
                                surname: info.lastName ?? '',
                                phone: info.phone ?? '',
                                address: info.address?.street ?? '',
                                city: info.address?.city ?? '',
                                postal_code: info.address?.postalCode ?? '',
                                country: info.address?.country ?? ''
                            });
                            // mark autofilled fields when we actually populated them
                            const payload: any = {
                                name: info.firstName ?? '',
                                surname: info.lastName ?? '',
                                phone: info.phone ?? '',
                                address: info.address?.street ?? '',
                                city: info.address?.city ?? '',
                                postal_code: info.address?.postalCode ?? '',
                                country: info.address?.country ?? ''
                            };
                            Object.keys(payload).forEach(k => {
                                const v = payload[k];
                                if (v && v.toString().trim().length) this.autofilled[k] = true;
                            });
                        }
                    },
                    error: (e) => console.warn('Failed to load user info', e)
                });
            }
        } catch (e) {
            // getUser may throw if no user id in storage; ignore in that case
            console.warn('Could not attempt to load saved user info', e);
        }
    }

    getSubtotal(cart: Cart) : number { return cart.items.reduce((s,i) => s + i.product.price * i.quantity, 0); }

    submit(cart: Cart) : void {
        if (this.checkoutForm.invalid) return;

        const orderPayload = {
            order: {
                name: this.checkoutForm.value.name,
                surname: this.checkoutForm.value.surname,
                address: this.checkoutForm.value.address,
                city: this.checkoutForm.value.city,
                postal_code: this.checkoutForm.value.postal_code,
                country: this.checkoutForm.value.country,
                phone: this.checkoutForm.value.phone,
                items: cart.items.map(i => ({ product_id: i.product.id, quantity: i.quantity }))
            }
        };

        this.checkoutService.placeOrder(orderPayload).pipe(
            tap(() => {
                this.cartService.clearCart().subscribe(() => this.router.navigate(['/products']));
            })
        ).subscribe({ next: () => {}, error: (e) => console.error('Order failed', e) });
    }

    clearAutofill(field: string): void {
        if (this.autofilled[field]) {
            this.checkoutForm.get(field)?.setValue('');
            this.autofilled[field] = false;
        }
    }
}
