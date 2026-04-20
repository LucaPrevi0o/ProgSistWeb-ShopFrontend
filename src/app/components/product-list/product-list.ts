import { Component, inject, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { HttpState, toHttpState, THUMBNAIL_BASE_URL } from "../../app.config";
import { ProductService } from "../../services/product-service";
import { Product } from "../../models/product";
import { AsyncPipe } from "@angular/common";
import { PriceRangeComponent } from '../price-range/price-range';
import { Router } from "@angular/router";

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [AsyncPipe, PriceRangeComponent],
    templateUrl: './product-list.html',
    styleUrls: ['./product-list.scss']
})
export class ProductListComponent implements OnInit {

    BASE_URL = THUMBNAIL_BASE_URL;
    state$!: Observable<HttpState<Product[]>>;
    productService: ProductService;
    categoriesState$!: Observable<HttpState<string[]>>;
    router = inject(Router);
    currentPage: number = 1;
    // filter fields
    filterName: string = '';
    filterCategory: string = '';
    filterMinPrice: string = '';
    filterMaxPrice: string = '';
    categories: string[] = [];

    constructor(productService: ProductService) { this.productService = productService; }

    ngOnInit() : void { this.loadPage(); this.loadCategories(); }

    private loadCategories() : void {
        this.categoriesState$ = toHttpState(this.productService.getCategories());
    }

    loadPage(filters?: any) : void {
        this.state$ = toHttpState(this.productService.getProducts(this.currentPage, filters));
    }

    onPriceRangeChange(range: { min: number; max: number }) : void {
        this.filterMinPrice = range.min.toString();
        this.filterMaxPrice = range.max.toString();
    }

    prevPage() : void { if (this.currentPage > 1) { this.currentPage--; this.loadPage(this.currentFilters()); } }

    nextPage() : void { this.currentPage++; this.loadPage(this.currentFilters()); }

    // Build filters object from local fields
    currentFilters() {
        const f: any = {};
        if (this.filterName && this.filterName.trim().length) f.name = this.filterName.trim();
        if (this.filterCategory && this.filterCategory.trim()) f.category = this.filterCategory.trim();
        if (this.filterMinPrice) f.min_price = this.filterMinPrice;
        if (this.filterMaxPrice) f.max_price = this.filterMaxPrice;
        return f;
    }

    applyFilters() : void { this.currentPage = 1; this.loadPage(this.currentFilters()); }

    resetFilters() : void { this.filterName = ''; this.filterCategory = ''; this.filterMinPrice = ''; this.filterMaxPrice = ''; this.currentPage = 1; this.loadPage(); }

    details(product: Product) : void { this.router.navigate(['/product', product.id]); }
}