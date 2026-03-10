import { Component, inject, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { HttpState, toHttpState, THUMBNAIL_BASE_URL } from "../../app.config";
import { ProductService } from "../../services/product-service";
import { Product } from "../../models/product";
import { AsyncPipe } from "@angular/common";
import { Router } from "@angular/router";

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [AsyncPipe],
    templateUrl: './product-list.html',
    styleUrls: ['./product-list.scss']
})
export class ProductListComponent implements OnInit {

    BASE_URL = THUMBNAIL_BASE_URL;
    state$!: Observable<HttpState<Product[]>>;
    productService: ProductService;
    router = inject(Router);
    currentPage: number = 1;

    constructor(productService: ProductService) { this.productService = productService; }

    ngOnInit() : void { this.loadPage(); }

    loadPage() : void { this.state$ = toHttpState(this.productService.getProducts(this.currentPage)); }

    prevPage() : void { if (this.currentPage > 1) { this.currentPage--; this.loadPage(); } }

    nextPage() : void { this.currentPage++; this.loadPage(); }

    details(product: Product) : void { this.router.navigate(['/product', product.id]); }
}