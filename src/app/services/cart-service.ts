import { inject, Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { Product } from '../models/product';
import { Cart } from '../models/cart';
import { API_BASE_URL } from "../app.config";

@Injectable({ providedIn: 'root' })
export class CartService {
    
    http = inject(HttpClient);

    createCart() : Observable<Cart> { return this.http.post<Cart>(API_BASE_URL + '/cart', {}); }

    getCartItems() : Observable<Cart> {
        return this.http.get<Cart>(API_BASE_URL + '/cart').pipe(
            tap(cart => console.log('Fetched cart items:', cart))
        );
    }

    addToCart(product: Product, quantity: number = 1) : Observable<Cart> {
        
        const body = { cart_item: { product_id: product.id, quantity } };
        return this.http.post<Cart>(API_BASE_URL + '/cart/new', body).pipe(
            tap(cart => console.log(`Added ${quantity} product(s) (ID: ${product.id}) to cart:`, cart))
        );
    }

    updateCartItem(product: Product, quantity: number) : Observable<Cart> {

        const body = { cart_item: { product_id: product.id, quantity } };
        return this.http.patch<Cart>(API_BASE_URL + '/cart/item', body).pipe(
            tap(cart => console.log(`Updated product (ID: ${product.id}) to quantity ${quantity}:`, cart))
        );
    }

    removeCartItem(product: Product) : Observable<Cart> {

        const params = { product_id: product.id.toString() };
        return this.http.delete<Cart>(API_BASE_URL + '/cart/item', { params }).pipe(
            tap(cart => console.log(`Removed product (ID: ${product.id}) from cart:`, cart))
        );
    }

    clearCart() : Observable<Cart> {

        return this.http.delete(API_BASE_URL + '/cart', { observe: 'response' }).pipe(
            switchMap((resp: any) => {

                if (resp.status === 204) return this.createCart();
                return of(resp.body as Cart);
            }),
            tap(cart => console.log('Cleared cart, current cart:', cart)),
            catchError(err => {
                
                console.error('Error clearing cart', err);
                return throwError(() => err);
            })
        );
    }
}