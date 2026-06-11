import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpState, toHttpState } from '../../app.config';
import { Order } from '../../models/order';
import { OrderService } from '../../services/order-service';

@Component({
    selector: 'app-admin-orders',
    standalone: true,
    imports: [AsyncPipe, DatePipe, RouterLink],
    templateUrl: './admin-orders.html',
    styleUrls: ['./admin-orders.scss']
})
export class AdminOrdersComponent {

    private orderService = inject(OrderService);

    ordersState$: Observable<HttpState<Order[]>> = toHttpState(this.orderService.getAllOrders());

    total(order: Order): number {

        if (order.total !== undefined)
            return order.total;

        return order.items.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
        );
    }

    statusClass(status?: string): string {
        if (!status) return 'status-unknown';
        return `status-${status.toLowerCase()}`;
    }
}
