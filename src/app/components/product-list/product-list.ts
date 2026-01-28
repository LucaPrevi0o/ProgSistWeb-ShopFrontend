import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { HttpState, toHttpStateItem, toHttpStateList } from "../../app.config";
import { ProductService } from "../../services/product-service";
import { Product } from "../../models/product";
import { AsyncPipe } from "@angular/common";

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [AsyncPipe],
    templateUrl: './product-list.html',
    styleUrls: ['./product-list.scss']
})
export class ProductListComponent implements OnInit {

    stateList$!: Observable<HttpState<Product[]>>;
    productService: ProductService;

    constructor(productService: ProductService) { this.productService = productService; }

    ngOnInit(): void { this.list(); }

    list(): Observable<HttpState<Product[]>> {

        const data = this.productService.getAllProducts();
        this.stateList$ = toHttpStateList(data);
        return this.stateList$;
    }

    details(productId: number): void { this.productService.router.navigate(['/products', productId]); }
}