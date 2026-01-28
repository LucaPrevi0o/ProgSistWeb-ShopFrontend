import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { HttpState, toHttpState} from "../../app.config";
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

    state$!: Observable<HttpState<Product[]>>;
    productService: ProductService;

    constructor(productService: ProductService) { this.productService = productService; }

    ngOnInit() : void { this.list(); }

    list() : Observable<HttpState<Product[]>> {

        const data = this.productService.getAllProducts();
        this.state$ = toHttpState(data);
        return this.state$;
    }

    details(productId: number) : void { this.productService.router.navigate(['/products', productId]); }
}