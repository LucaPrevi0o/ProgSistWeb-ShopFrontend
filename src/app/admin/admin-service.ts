import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../app.config';
import { Order } from '../models/order';
import { Product } from '../models/product';
import { AdminUser, User } from '../models/user';

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

    getCategories(): Observable<string[]> {
        return this.http.get<string[]>(`${API_BASE_URL}/categories`);
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
    
    getUsers(): Observable<AdminUser[]> {
        return this.http.get<AdminUser[]>(`${API_BASE_URL}/admin/users`);
    }

    getUser(id: number): Observable<AdminUser> {
        return this.http.get<AdminUser>(`${API_BASE_URL}/admin/users/${id}`);
    }

    updateOrderStatus(id: number, status: string): Observable<Order> {
        return this.http.patch<Order>(`${API_BASE_URL}/admin/orders/${id}/status`, { status });
    }
}
