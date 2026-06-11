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

    getCartItems() : Observable<Cart> { return this.http.get<Cart>(API_BASE_URL + '/cart'); }

    addToCart(product: Product, quantity: number = 1) : Observable<Cart> {
        
        const body = { cartItem: { productId: product.id, quantity } };
        return this.http.post<Cart>(API_BASE_URL + '/cart/items', body);
    }

    updateCartItem(product: Product, quantity: number) : Observable<Cart> {

        const body = { cartItem: { quantity } };
        return this.http.patch<Cart>(API_BASE_URL + `/cart/items/${product.id}`, body);
    }

    removeCartItem(product: Product) : Observable<Cart> {

        return this.http.delete<Cart>(API_BASE_URL + `/cart/items/${product.id}`);
    }

    clearCart() : Observable<Cart> {

        return this.http.delete(API_BASE_URL + '/cart', { observe: 'response' }).pipe(
            switchMap((resp: any) => {

                if (resp.status === 204) return this.createCart();
                return of(resp.body as Cart);
            }),
            catchError(err => { return throwError(() => err); })
        );
    }
}
