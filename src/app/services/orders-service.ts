import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_BASE_URL } from "../app.config";
import { Order } from "../models/order";

@Injectable({ providedIn: 'root' })
export class OrdersService {

    http = inject(HttpClient);

    getOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(API_BASE_URL + '/orders');
    }

    getOrderById(id: string): Observable<Order> {
        return this.http.get<Order>(API_BASE_URL + '/orders/' + id);
    }
}
