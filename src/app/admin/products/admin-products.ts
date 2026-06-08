import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject, catchError, EMPTY, finalize, merge, Observable, Subject, switchMap, tap } from 'rxjs';
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
    private refreshProducts$ = new BehaviorSubject<void>(undefined);
    private createProduct$ = new Subject<void>();
    private updateProduct$ = new Subject<void>();
    private deleteProduct$ = new Subject<Product>();

    showCreateForm = false;
    saving = false;
    deletingId: number | null = null;
    editingProduct: Product | null = null;
    saveError: string | null = null;
    deleteError: string | null = null;
    lastKnownCategories: string[] = [];

    productForm = this.fb.nonNullable.group({
        name: ['', Validators.required],
        description: ['', Validators.required],
        category: ['', Validators.required],
        price: [0, [Validators.required, Validators.min(0)]],
        stock: [0, [Validators.required, Validators.min(0)]]
    });

    productsState$: Observable<HttpState<Product[]>> = this.refreshProducts$.pipe(
        switchMap(() => toHttpState(this.adminService.getProducts()))
    );

    categoriesState$: Observable<HttpState<string[]>> = toHttpState(this.adminService.getCategories()).pipe(
        tap(state => {
            if (state.status !== 'success') return;

            this.lastKnownCategories = state.data;

            if (state.data.length > 0 && !this.productForm.controls.category.value) {
                this.productForm.patchValue({ category: state.data[0] });
            }
        })
    );

    private createAction$ = this.createProduct$.pipe(
        switchMap(() => {
            if (this.productForm.invalid || this.saving) return EMPTY;

            this.saving = true;
            this.saveError = null;

            return this.adminService.createProduct(this.productForm.getRawValue()).pipe(
                tap(() => {
                    this.resetForm();
                    this.showCreateForm = false;
                    this.refreshProducts$.next();
                }),
                catchError(err => {
                    this.saveError = err?.error?.details?.join(', ') || err?.error?.error || 'Failed to create product';
                    return EMPTY;
                }),
                finalize(() => this.saving = false)
            );
        })
    );

    private updateAction$ = this.updateProduct$.pipe(
        switchMap(() => {
            if (!this.editingProduct || this.productForm.invalid || this.saving) return EMPTY;

            this.saving = true;
            this.saveError = null;

            return this.adminService.updateProduct(this.editingProduct.id, this.productForm.getRawValue()).pipe(
                tap(() => {
                    this.cancelEdit();
                    this.refreshProducts$.next();
                }),
                catchError(err => {
                    this.saveError = err?.error?.details?.join(', ') || err?.error?.error || 'Failed to update product';
                    return EMPTY;
                }),
                finalize(() => this.saving = false)
            );
        })
    );

    private deleteAction$ = this.deleteProduct$.pipe(
        switchMap(product => {
            if (this.deletingId !== null) return EMPTY;

            const confirmed = window.confirm(`Eliminare il prodotto "${product.name}"?`);
            if (!confirmed) return EMPTY;

            this.deletingId = product.id;
            this.deleteError = null;

            return this.adminService.deleteProduct(product.id).pipe(
                tap(() => {
                    if (this.editingProduct?.id === product.id) this.cancelEdit();
                    this.refreshProducts$.next();
                }),
                catchError(err => {
                    this.deleteError = err?.error?.error || 'Impossibile eliminare il prodotto';
                    return EMPTY;
                }),
                finalize(() => this.deletingId = null)
            );
        })
    );

    actions$ = merge(this.createAction$, this.updateAction$, this.deleteAction$);

    toggleCreateForm(): void {
        this.showCreateForm = !this.showCreateForm;
        this.editingProduct = null;
        this.saveError = null;

        if (this.showCreateForm) this.resetForm();
    }

    startEdit(product: Product): void {
        this.editingProduct = product;
        this.showCreateForm = true;
        this.saveError = null;

        this.productForm.setValue({
            name: product.name,
            description: product.description,
            category: product.category,
            price: Number(product.price),
            stock: Number(product.stock)
        });
    }

    cancelEdit(): void {
        this.editingProduct = null;
        this.showCreateForm = false;
        this.saveError = null;
        this.resetForm();
    }

    submitProductForm(): void {
        if (this.editingProduct) {
            this.updateProduct$.next();
        } else {
            this.createProduct$.next();
        }
    }

    deleteProduct(product: Product): void {
        this.deleteProduct$.next(product);
    }

    private resetForm(): void {
        this.productForm.reset({
            name: '',
            description: '',
            category: this.lastKnownCategories[0] ?? '',
            price: 0,
            stock: 0
        });
    }
}
