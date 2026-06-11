import { Component, inject, OnInit } from "@angular/core";
import { AsyncPipe, DatePipe } from "@angular/common";
import { finalize, Observable } from "rxjs";
import { HttpState, toHttpState } from "../../app.config";
import { OrderService } from "../../services/order-service";
import { Order } from "../../models/order";
import { PaymentMethod, CreditCard, PayPal } from "../../models/payment";
import { LoginRedirectorComponent } from "../../components/login-redirector/login-redirector";
import { Router } from "@angular/router";
import { AdminService } from "../admin-service";

@Component({
    selector: 'app-admin-order-details',
    standalone: true,
    imports: [AsyncPipe, DatePipe, LoginRedirectorComponent],
    templateUrl: './admin-order-details.html',
    styleUrls: ['./admin-order-details.scss']
})
export class AdminOrderDetailsComponent implements OnInit {

    state$!: Observable<HttpState<Order>>;
    savingStatus = false;
    router = inject(Router);
    orderService = inject(OrderService);
    adminService = inject(AdminService);

    ngOnInit(): void {
        const orderId = this.router.url.split('/').pop();
        if (orderId) {
            this.state$ = toHttpState(this.orderService.getAdminOrderById(orderId));
        } else {
            // Handle error: no order ID in URL
        }
    }

    updateStatus(order: Order, status: 'completed' | 'cancelled'): void {
        if (!order.id || status === order.status || this.savingStatus) return;

        this.savingStatus = true;
        this.state$ = toHttpState(
            this.adminService.updateOrderStatus(order.id, status).pipe(
                finalize(() => this.savingStatus = false)
            )
        );
    }

    total(order: Order): number {
        return order.items.reduce((sum, it) => sum + it.product.price * it.quantity, 0);
    }

    goBack(): void {
        this.router.navigate(['/admin/orders']);
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
