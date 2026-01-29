import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { HttpState, toHttpState } from '../../app.config';
import { ProductService } from '../../services/product-service';
import { Product } from '../../models/product';
import { filter, map, switchMap } from 'rxjs/operators';
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
    router = inject(Router);

    constructor(private productService: ProductService, private userService: UserService, private route: ActivatedRoute) {}

    ngOnInit() : void {

        this.state$ = this.route.paramMap.pipe(
            map(params => params.get('id')),
            filter(id => !!id),
            map(id => Number(id)),
            filter(id => !isNaN(id)),
            switchMap(id => (toHttpState(this.productService.getProduct(id))))
        );
    }

    goBack() : void { this.router.navigate(['/products']); }

    isLoggedIn() : boolean { return this.userService.isLoggedIn(); }

    goToLogin() : void { this.router.navigate(['/login']); }
}