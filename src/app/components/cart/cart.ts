import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { HttpState, toHttpState } from '../../app.config';
import { Product } from '../../models/product';
import { filter, map, switchMap, tap } from 'rxjs/operators';
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

    state$!: Observable<HttpState<Product[]>>;
    router = inject(Router);

    constructor(private cartService: CartService) {}

    ngOnInit() : void { this.state$ = this.viewCart(); }

    viewCart() : Observable<HttpState<Product[]>> { return toHttpState(this.cartService.getCartItems()); }

    removeFromCart(productId: number) : void {

        this.cartService.removeCartItem(productId);
        this.state$ = this.viewCart();
    }

    goToLogin() : void { this.router.navigate(['/login']); }
}