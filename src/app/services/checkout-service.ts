import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_BASE_URL } from "../app.config";
import { CheckoutResponse, Order } from "../models/order";

@Injectable({ providedIn: 'root' })
export class CheckoutService {

    http = inject(HttpClient);

    placeOrder(payload: Order) : Observable<CheckoutResponse> {
        return this.http.post<CheckoutResponse>(API_BASE_URL + '/orders', { order: payload });
    }
}
