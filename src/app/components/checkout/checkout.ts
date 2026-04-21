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
import { Order } from '../../models/order';

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
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            address: this.fb.group({
                street: ['', Validators.required],
                city: ['', Validators.required],
                postalCode: ['', Validators.required],
                country: ['', Validators.required]
            }),
            phone: ['']
        });
    }

    ngOnInit(): void {

        this.state$ = toHttpState(this.cartService.getCartItems());
        const userId = this.userService.getUserId();
        if (userId) this.userState$ = toHttpState(this.userService.getUser()).pipe(
            tap(state => {

                if (state.status === 'success') {

                    const info = (state.data as User)?.info;
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
        const fv = this.checkoutForm.value;

        const info: UserInfo = {

            firstName: fv.name,
            lastName: fv.surname,
            phone: fv.phone ?? '',
            address: {
                street: fv.address.street ?? '',
                city: fv.address.city ?? '',
                postalCode: fv.address.postalCode ?? '',
                country: fv.address.country ?? ''
            }
        };

        const order: Order = {
            info,
            items: cart.items
        };

        const uid = this.userService.getUserId();
        if (uid) order.userId = Number(uid);

        this.state$ = toHttpState(this.checkoutService.placeOrder(order).pipe(
            switchMap(() => this.cartService.clearCart()),
            tap(() => this.router.navigate(['/products']))
        ));
    }

    private applyUserInfo(info: UserInfo): void {

        const values: UserInfo = {

            firstName: info.firstName ?? '',
            lastName: info.lastName ?? '',
            phone: info.phone ?? '',
            address: {
                street: info.address?.street ?? '',
                city: info.address?.city ?? '',
                postalCode: info.address?.postalCode ?? '',
                country: info.address?.country ?? ''
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
}
