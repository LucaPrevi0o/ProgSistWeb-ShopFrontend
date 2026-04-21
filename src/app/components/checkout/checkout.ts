import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart-service';
import { CheckoutService } from '../../services/checkout-service';
import { UserService } from '../../services/user-service';
import { HttpState, toHttpState } from '../../app.config';
import { Observable, tap, switchMap } from 'rxjs';
import { User, UserInfo } from '../../models/user';
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
    userState$!: Observable<HttpState<User>>;
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
        const userId = this.userService.getUserId();
        if (userId) this.userState$ = toHttpState(this.userService.getUser()).pipe(
            tap(state => {

                if (state.status === 'success') {

                    const info = (state.data as any)?.info;
                    if (info) this.applyUserInfo(info);
                }
            })
        );
    }

    getSubtotal(cart: Cart) : number {
        return cart.items.reduce((s,i) => s + i.product.price * i.quantity, 0);
    }

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

        this.state$ = toHttpState(this.checkoutService.placeOrder(orderPayload).pipe(
            switchMap(() => this.cartService.clearCart()),
            tap(() => this.router.navigate(['/products']))
        ));
    }

    private applyUserInfo(info: UserInfo): void {

        const values: Record<string, string> = {

            name: info.firstName ?? '',
            surname: info.lastName ?? '',
            phone: info.phone ?? '',
            address: info.address?.street ?? '',
            city: info.address?.city ?? '',
            postal_code: info.address?.postalCode ?? '',
            country: info.address?.country ?? ''
        };

        this.checkoutForm.patchValue(values);

        Object.entries(values).forEach(([k, v]) => {
            if (v && v.toString().trim().length) this.autofilled[k] = true;
        });
    }

    clearAutofill(field: string): void {

        if (this.autofilled[field]) {

            this.checkoutForm.get(field)?.setValue('');
            this.autofilled[field] = false;
        }
    }
}
