import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable, switchMap, tap } from 'rxjs';
import { HttpState, toHttpState } from '../../app.config';
import { Product } from '../../models/product';
import { Cart, CartItem } from '../../models/cart';
import { CartService } from '../../services/cart-service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [AsyncPipe],
    templateUrl: './cart.html',
    styleUrls: ['./cart.scss']
})
export class CartComponent implements OnInit {

    state$!: Observable<HttpState<Cart>>;
    router = inject(Router);

    constructor(private cartService: CartService) {}

    ngOnInit() : void { this.state$ = toHttpState(this.cartService.getCartItems()); }

    createCart() : void { 
        
        this.state$ = toHttpState(this.cartService.createCart().pipe(
            tap(() => console.log('Cart created')),
            switchMap(() => this.cartService.getCartItems())
        ));
    }

    removeFromCart(product: Product) : void {

        this.state$ = toHttpState(this.cartService.removeCartItem(product).pipe(
            switchMap(() => this.cartService.getCartItems())
        ));
    }
    
    getSubtotal(cart: Cart) : number {
        return cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    }

    checkout() : void { this.router.navigate(['/checkout']); }

    goToLogin() : void { this.router.navigate(['/login']); }
}