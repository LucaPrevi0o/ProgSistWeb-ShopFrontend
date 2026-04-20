import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_BASE_URL } from "../app.config";
import { Order, OrderPayload } from '../models/order';

@Injectable({ providedIn: 'root' })
export class CheckoutService {

    http = inject(HttpClient);

    placeOrder(payload: OrderPayload) : Observable<Order> {
        return this.http.post<Order>(API_BASE_URL + '/checkout', payload);
    }
}
