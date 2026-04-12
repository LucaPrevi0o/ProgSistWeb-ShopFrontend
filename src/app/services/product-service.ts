import { inject, Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product';
import { API_BASE_URL } from "../app.config";

@Injectable({ providedIn: 'root' })
export class ProductService {
    
    http = inject(HttpClient);

    getAllProducts() : Observable<Product[]> { return this.http.get<Product[]>(API_BASE_URL + '/products'); }

    getProducts(page: number = 1, filters?: { name?: string; category?: string; min_price?: string | number; max_price?: string | number }) : Observable<Product[]> {

        const params: any = { page: page.toString() };
        if (filters) {
            
            if (filters.name) params.name = filters.name;
            if (filters.category) params.category = filters.category;
            if (filters.min_price !== undefined && filters.min_price !== null) params.min_price = filters.min_price.toString();
            if (filters.max_price !== undefined && filters.max_price !== null) params.max_price = filters.max_price.toString();
        }
        return this.http.get<Product[]>(API_BASE_URL + '/products', { params });
    }

    getProduct(id: number) : Observable<Product> {
        return this.http.get<Product>(API_BASE_URL + '/products/' + id);
    }

    getCategories() : Observable<string[]> {
        return this.http.get<string[]>(API_BASE_URL + '/categories');
    }
}