import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { HttpState, toHttpState } from '../../app.config';
import { ProductService } from '../../services/product-service';
import { Product } from '../../models/product';
import { filter, map, switchMap, tap } from 'rxjs/operators';

@Component({
    selector: 'app-product-details',
    standalone: true,
    imports: [AsyncPipe],
    templateUrl: './product-details.html',
    styleUrls: ['./product-details.scss']
})
export class ProductDetailsComponent implements OnInit {

    stateItem$!: Observable<HttpState<Product>>;

    constructor(private productService: ProductService, private route: ActivatedRoute) {}

    ngOnInit(): void {

        this.stateItem$ = this.route.paramMap.pipe(
            map(params => params.get('id')),
            filter(id => !!id),
            map(id => Number(id)),
            filter(id => !isNaN(id)),
            switchMap(id => (toHttpState(this.productService.getProduct(id))))
        );
    }

    goBack(): void { this.productService.router.navigate(['/products']); }
}