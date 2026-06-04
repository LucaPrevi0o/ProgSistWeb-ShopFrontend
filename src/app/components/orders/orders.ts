import { Component, inject, OnInit } from "@angular/core";
import { AsyncPipe } from "@angular/common";
import { Observable } from "rxjs";
import { HttpState, toHttpState } from "../../app.config";
import { OrdersService } from "../../services/orders-service";
import { Order } from "../../models/order";
import { PaymentMethod, CreditCard, PayPal } from "../../models/payment";
import { LoginRedirectorComponent } from "../login-redirector/login-redirector";

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [AsyncPipe, LoginRedirectorComponent],
    templateUrl: './orders.html',
    styleUrls: ['./orders.scss']
})
export class OrdersComponent implements OnInit {

    state$!: Observable<HttpState<Order[]>>;
    ordersService = inject(OrdersService);

    ngOnInit(): void {
        this.state$ = toHttpState(this.ordersService.getOrders());
    }

    total(order: Order): number {
        return order.items.reduce((sum, it) => sum + it.product.price * it.quantity, 0);
    }

    asPayPal(paymentMethod: PaymentMethod): PayPal | null {
        return (paymentMethod.type === 'payPal' || String(paymentMethod.type).toLowerCase() === 'paypal') ? paymentMethod.details as PayPal : null;
    }

    asCreditCard(paymentMethod: PaymentMethod): CreditCard | null {
        return (paymentMethod.type === 'creditCard' || String(paymentMethod.type).toLowerCase().includes('credit')) ? paymentMethod.details as CreditCard : null;
    }

    last4Digits(cardNumber: string): string {
        return cardNumber.slice(-4);
    }

    itemTotal(item: any): number {
        return (item.product?.price || 0) * (item.quantity || 0);
    }
}