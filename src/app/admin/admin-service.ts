import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../app.config';
import { Product } from '../models/product';
import { User } from '../models/user';

export type ProductPayload = Pick<Product, 'name' | 'description' | 'category' | 'price' | 'stock'>;

@Injectable({ providedIn: 'root' })
export class AdminService {

    private http = inject(HttpClient);

    me(): Observable<User> {
        return this.http.get<User>(`${API_BASE_URL}/admin/me`);
    }

    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(`${API_BASE_URL}/admin/products`);
    }

    getProduct(id: number): Observable<Product> {
        return this.http.get<Product>(`${API_BASE_URL}/admin/products/${id}`);
    }

    createProduct(product: ProductPayload): Observable<Product> {
        return this.http.post<Product>(`${API_BASE_URL}/admin/products`, { product });
    }

    updateProduct(id: number, product: Partial<ProductPayload>): Observable<Product> {
        return this.http.patch<Product>(`${API_BASE_URL}/admin/products/${id}`, { product });
    }

    deleteProduct(id: number): Observable<void> {
        return this.http.delete<void>(`${API_BASE_URL}/admin/products/${id}`);
    }
}
