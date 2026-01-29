import { inject, Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product';
import { API_BASE_URL } from "../app.config";

@Injectable({ providedIn: 'root' })
export class ProductService {
    
    http = inject(HttpClient);

    getAllProducts() : Observable<Product[]> { return this.http.get<Product[]>(API_BASE_URL + '/products'); }

    getProduct(id: number) : Observable<Product> {
        return this.http.get<Product>(API_BASE_URL + '/products/' + id);
    }
}