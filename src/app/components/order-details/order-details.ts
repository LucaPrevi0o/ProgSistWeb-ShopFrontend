import { Component, inject, OnInit } from "@angular/core";
import { AsyncPipe, DatePipe } from "@angular/common";
import { Observable } from "rxjs";
import { HttpState, toHttpState } from "../../app.config";
import { OrderService } from "../../services/order-service";
import { Order } from "../../models/order";
import { PaymentMethod, CreditCard, PayPal } from "../../models/payment";
import { LoginRedirectorComponent } from "../login-redirector/login-redirector";
import { Router } from "@angular/router";

@Component({
    selector: 'app-order-details',
    standalone: true,
    imports: [AsyncPipe, DatePipe, LoginRedirectorComponent],
    templateUrl: './order-details.html',
    styleUrls: ['./order-details.scss']
})
export class OrderDetailsComponent implements OnInit {

    state$!: Observable<HttpState<Order>>;
    router = inject(Router);
    orderService = inject(OrderService);

    ngOnInit(): void {
        const orderId = this.router.url.split('/').pop();
        if (orderId) {
            this.state$ = toHttpState(this.orderService.getOrderById(orderId));
        } else {
            // Handle error: no order ID in URL
        }
    }

    total(order: Order): number {
        return order.items.reduce((sum, it) => sum + it.product.price * it.quantity, 0);
    }

    goBack(): void {
        this.router.navigate(['/orders']);
    }

    asCreditCard(paymentMethod: PaymentMethod): CreditCard | null {
        return (paymentMethod.methodType === 'creditCard' || String(paymentMethod.methodType).toLowerCase().includes('credit')) ? paymentMethod.details as CreditCard : null;
    }

    last4Digits(cardNumber: string): string {
        return cardNumber.slice(-4);
    }

    asPayPal(paymentMethod: PaymentMethod): PayPal | null {
        return (paymentMethod.methodType === 'payPal' || String(paymentMethod.methodType).toLowerCase() === 'paypal') ? paymentMethod.details as PayPal : null;
    }

    statusClass(status?: string): string {
        if (!status) return 'status-unknown';
        return `status-${status.toLowerCase()}`;
    }
}
