import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart-service';
import { CheckoutService } from '../../services/checkout-service';
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
    router = inject(Router);

    constructor(private fb: FormBuilder, private cartService: CartService, private checkoutService: CheckoutService) {
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
}
