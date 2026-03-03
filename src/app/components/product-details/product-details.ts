import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';
import { HttpState, toHttpState } from '../../app.config';
import { ProductService } from '../../services/product-service';
import { CartService } from '../../services/cart-service';
import { Product } from '../../models/product';
import { UserService } from '../../services/user-service';

@Component({
    selector: 'app-product-details',
    standalone: true,
    imports: [AsyncPipe],
    templateUrl: './product-details.html',
    styleUrls: ['./product-details.scss']
})
export class ProductDetailsComponent implements OnInit {

    state$!: Observable<HttpState<Product>>;
    quantity = new BehaviorSubject<number>(1);
    router = inject(Router);

    constructor(
        private productService: ProductService,
        private cartService: CartService,
        private userService: UserService,
        private route: ActivatedRoute) {}

    ngOnInit(): void {

        const idParam = this.route.snapshot.paramMap.get('id');
        const id = idParam ? Number(idParam) : NaN;
        if (isNaN(id)) { this.goBack(); return; }
        this.state$ = toHttpState(this.productService.getProduct(id));
    }

    increaseQuantity() : void { this.quantity.next(this.quantity.value + 1); }

    decreaseQuantity() : void { this.quantity.next(this.quantity.value - 1); }

    goBack() : void { this.router.navigate(['/products']); }

    addToCart(product: Product, quantity: number = 1) : void { 
        
        this.state$ = toHttpState(this.cartService.addToCart(product, quantity.valueOf()).pipe(
            switchMap(() => this.productService.getProduct(product.id))
        ));
    }

    isLoggedIn() : boolean { return this.userService.isLoggedIn(); }

    goToLogin() : void { this.router.navigate(['/login']); }
}