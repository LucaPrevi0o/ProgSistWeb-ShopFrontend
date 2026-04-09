import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_BASE_URL } from "../app.config";

@Injectable({ providedIn: 'root' })
export class CheckoutService {

    http = inject(HttpClient);

    placeOrder(payload: any) : Observable<any> {
        return this.http.post(API_BASE_URL + '/checkout', payload);
    }
}
