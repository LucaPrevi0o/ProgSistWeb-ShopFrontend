import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_BASE_URL } from "../app.config";
import { Order } from "../models/order";

export interface OrderFilters {
    status?: string;
    fromDate?: string;
    toDate?: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {

    http = inject(HttpClient);

    getOrders(filters?: OrderFilters): Observable<Order[]> {
        const params: Record<string, string> = {};

        if (filters?.status) params['status'] = filters.status;
        if (filters?.fromDate) params['fromDate'] = filters.fromDate;
        if (filters?.toDate) params['toDate'] = filters.toDate;

        return this.http.get<Order[]>(API_BASE_URL + '/orders', { params });
    }

    getOrderById(id: string): Observable<Order> {
        return this.http.get<Order>(API_BASE_URL + '/orders/' + id);
    }
    
    getAllOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(API_BASE_URL + '/admin/orders');
    }

    getAdminOrderById(id: string): Observable<Order> {
        return this.http.get<Order>(
            API_BASE_URL + '/admin/orders/' + id
        );
    }
}
