import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject, Observable, switchMap, tap, map, of } from 'rxjs';
import { HttpState, toHttpState, PRODUCT_BASE_URL } from '../../app.config';
import { ProductService } from '../../services/product-service';
import { CartService } from '../../services/cart-service';
import { Product } from '../../models/product';
import { UserService } from '../../services/user-service';
import { LoginRedirectorComponent } from '../login-redirector/login-redirector';

@Component({
    selector: 'app-product-details',
    standalone: true,
    imports: [AsyncPipe, LoginRedirectorComponent],
    templateUrl: './product-details.html',
    styleUrls: ['./product-details.scss']
})
export class ProductDetailsComponent implements OnInit {

    BASE_URL = PRODUCT_BASE_URL;
    state$!: Observable<HttpState<Product>>;
    quantity = new BehaviorSubject<number>(1);
    existingQuantity$!: Observable<number>;
    private cartRefresh$ = new BehaviorSubject<void>(undefined);
    private productId?: number;
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
        this.productId = id;
        this.state$ = toHttpState(this.productService.getProduct(id));

        this.existingQuantity$ = this.cartRefresh$.pipe(
            switchMap(() => this.userService.isLoggedIn()
                ? this.cartService.getCartItems()
                : of({ id: 0, user: {} as any, items: [] } as any)
            ),
            map((cart: any) => {
                const item = cart.items.find((i: any) => i.product.id === this.productId);
                return item ? item.quantity : 0;
            })
        );
    }

    increaseQuantity() : void { this.quantity.next(this.quantity.value + 1); }

    decreaseQuantity() : void { this.quantity.next(this.quantity.value - 1); }

    goBack() : void { this.router.navigate(['/products']); }

    addToCart(product: Product, quantity: number = 1) : void { 

        const obs$ = this.cartService.addToCart(product, quantity.valueOf()).pipe(
            tap(() => this.cartRefresh$.next()),
            switchMap(() => this.productService.getProduct(product.id))
        );

        this.state$ = toHttpState(obs$);
    }

    isLoggedIn() : boolean { return this.userService.isLoggedIn(); }

    goToLogin() : void { this.router.navigate(['/login']); }
}