import { inject, Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product } from '../models/product';
import { API_BASE_URL } from "../app.config";

@Injectable({ providedIn: 'root' })
export class ProductService {
    
    http = inject(HttpClient);

    getProducts(page: number = 1, filters?: { name?: string; category?: string; minPrice?: string | number; maxPrice?: string | number }) : Observable<{ items: Product[]; totalPages: number }> {

        const params: any = { page: page.toString() };
        if (filters) {
            
            if (filters.name) params.name = filters.name;
            if (filters.category) params.category = filters.category;
            if (filters.minPrice !== undefined && filters.minPrice !== null) params.minPrice = filters.minPrice.toString();
            if (filters.maxPrice !== undefined && filters.maxPrice !== null) params.maxPrice = filters.maxPrice.toString();
        }

        return this.http.get<Product[]>(API_BASE_URL + '/products', { params, observe: 'response' }).pipe(
            map(resp => {
                const items = resp.body ?? [];
                const totalPagesHeader = resp.headers.get('X-Total-Pages');
                if (totalPagesHeader) {
                    console.log('Received total pages from header:', totalPagesHeader);
                } else {
                    console.warn('X-Total-Pages header is missing in the response');
                }
                const totalPages = totalPagesHeader ? parseInt(totalPagesHeader, 10) : 1;
                return { items, totalPages } as { items: Product[]; totalPages: number };
            })
        );
    }

    getProduct(id: number) : Observable<Product> {
        return this.http.get<Product>(API_BASE_URL + '/products/' + id);
    }

    getCategories() : Observable<string[]> {
        return this.http.get<string[]>(API_BASE_URL + '/categories');
    }
}
