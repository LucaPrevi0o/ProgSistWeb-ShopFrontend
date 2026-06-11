import { Component, inject, OnInit } from "@angular/core";
import { AsyncPipe, DatePipe } from "@angular/common";
import { Observable } from "rxjs";
import { HttpState, toHttpState } from "../../app.config";
import { OrderFilters, OrderService } from "../../services/order-service";
import { Order } from "../../models/order";
import { PaymentMethod, CreditCard, PayPal } from "../../models/payment";
import { LoginRedirectorComponent } from "../login-redirector/login-redirector";
import { Router } from "@angular/router";

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [AsyncPipe, DatePipe, LoginRedirectorComponent],
    templateUrl: './orders.html',
    styleUrls: ['./orders.scss']
})
export class OrdersComponent implements OnInit {

    state$!: Observable<HttpState<Order[]>>;
    filterStatus = '';
    filterFromDate = '';
    filterToDate = '';
    router = inject(Router);
    orderService = inject(OrderService);

    ngOnInit(): void {
        this.loadOrders();
    }

    loadOrders(filters?: OrderFilters): void {
        this.state$ = toHttpState(this.orderService.getOrders(filters));
    }

    applyFilters(): void {
        this.loadOrders(this.currentFilters());
    }

    resetFilters(): void {
        this.filterStatus = '';
        this.filterFromDate = '';
        this.filterToDate = '';
        this.loadOrders();
    }

    currentFilters(): OrderFilters {
        return {
            status: this.filterStatus || undefined,
            fromDate: this.filterFromDate || undefined,
            toDate: this.filterToDate || undefined
        };
    }

    total(order: Order): number {
        return order.items.reduce((sum, it) => sum + it.product.price * it.quantity, 0);
    }

    asPayPal(paymentMethod: PaymentMethod): PayPal | null {
        return (paymentMethod.methodType === 'payPal' || String(paymentMethod.methodType).toLowerCase() === 'paypal') ? paymentMethod.details as PayPal : null;
    }

    viewOrderDetails(order: Order): void {
        this.router.navigate(['/orders', order.id]);
    }

    asCreditCard(paymentMethod: PaymentMethod): CreditCard | null {
        return (paymentMethod.methodType === 'creditCard' || String(paymentMethod.methodType).toLowerCase().includes('credit')) ? paymentMethod.details as CreditCard : null;
    }

    last4Digits(cardNumber: string): string {
        return cardNumber.slice(-4);
    }

    itemTotal(item: any): number {
        return (item.product?.price || 0) * (item.quantity || 0);
    }

    statusClass(status?: string): string {
        if (!status) return 'status-unknown';
        return `status-${status.toLowerCase()}`;
    }
}
