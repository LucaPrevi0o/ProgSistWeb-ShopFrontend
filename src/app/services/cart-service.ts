import { inject, Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product';
import { API_BASE_URL } from "../app.config";

@Injectable({ providedIn: 'root' })
export class CartService {
    
    http = inject(HttpClient);
    //router = inject(Router);

    getCartItems() : Observable<Product[]> { return this.http.get<Product[]>(API_BASE_URL + '/carts'); }

    addToCart(productId: number, quantity: number = 1) : Observable<Product> {

        const body = { cart: { product_id: productId, quantity } };
        return this.http.post<Product>(API_BASE_URL + '/carts', body);
    }

    updateCartItem(productId: number, quantity: number) : Observable<Product> {

        const body = { cart: { quantity } };
        return this.http.patch<Product>(API_BASE_URL + '/carts/' + productId, body);
    }

    removeCartItem(productId: number) : Observable<void> {
        return this.http.delete<void>(API_BASE_URL + '/carts/' + productId);
    }

    clearCart() : Observable<void> {
        return this.http.delete<void>(API_BASE_URL + '/carts/clear');
    }
}