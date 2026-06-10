import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpState, toHttpState } from '../../app.config';
import { Order } from '../../models/order';
import { OrderService } from '../../services/order-service';

@Component({
    selector: 'app-admin-orders',
    standalone: true,
    imports: [AsyncPipe, RouterLink],
    templateUrl: './admin-orders.html',
    styleUrls: ['./admin-orders.scss']
})
export class AdminOrdersComponent {

    private orderService = inject(OrderService);

    ordersState$: Observable<HttpState<Order[]>> = toHttpState(this.orderService.getAllOrders());

    total(order: Order): number {
        if (order