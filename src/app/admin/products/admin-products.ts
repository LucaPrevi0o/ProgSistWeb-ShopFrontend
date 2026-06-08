import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { toHttpState, HttpState } from '../../app.config';
import { Product } from '../../models/product';
import { AdminService } from '../admin-service';

@Component({
    selector: 'app-admin-products',
    standalone: true,
    imports: [AsyncPipe, ReactiveFormsModule],
    templateUrl: './admin-products.html',
    styleUrls: ['./admin-products.scss']
})
export class AdminProductsComponent {

    private adminService = inject(AdminService);
    private fb = inject(FormBuilder);

    productsState$: Observable<HttpState<Product[]>> = this.loadProducts();
    showCreateForm = false;
    saving = false;
    saveError: string | null = null;

    productForm = this.fb.nonNullable.group({
        name: ['', Validators.required],
        description: ['', Validators.required],
        category: ['Elettronica', Validators.required],
        price: [0, [Validators.required, Validators.min(0)]],
        stock: [0, [Validators.required, Validators.min(0)]]
    });

    toggleCreateForm(): void {
        this.showCreateForm = !this.showCreateForm;
        this.saveError = null;
    }

    createProduct(): void {
        if (this.productForm.invalid || this.saving) return;

        this.saving = true;
        this.saveError = null;

        this.adminService.createProduct(this.productForm.getRawValue()).subscribe({
            next: () => {
                this.productForm.reset({
                    name: '',
                    description: '',
                    category: 'Elettronica',
                    price: 0,
                    stock: 0
                });
                this.showCreateForm = false;
                this.productsState$ = this.loadProducts();
                this.saving = false;
            },
            error: err => {
                this.saveError = err?.error?.details?.join(', ') || err?.error?.error || 'Failed to create product';
                this.saving = false;
            }
        });
    }

    private loadProducts(): Observable<HttpState<Product[]>> {
        return toHttpState(this.adminService.getProducts());
    }
}
