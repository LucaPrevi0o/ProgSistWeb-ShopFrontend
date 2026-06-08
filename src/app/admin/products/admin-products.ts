import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject, catchError, EMPTY, finalize, map, Observable, Subject, switchMap, tap } from 'rxjs';
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
    private deleteProduct$ = new Subject<Product>();

    productsState$: Observable<HttpState<Product[]>> = this.refreshProducts$.pipe(
        switchMap(() => toHttpState(this.adminService.getProducts()))
    );

    categoriesState$: Observable<HttpState<string[]>> = toHttpState(this.adminService.getCategories()).pipe(
        tap(state => {
            if (state.status === 'success' && state.data.length > 0 && !this.productForm.controls.category.value) {
                this.productForm.patchValue({ category: state.data[0] });
            }
        })
    );

    createAction$ = this.createProduct$.pipe(
        switchMap(() => {
            if (this.productForm.invalid || this.saving) return EMPTY;

            this.saving = true;
            this.saveError = null;

            return this.adminService.createProduct(this.productForm.getRawValue()).pipe(
                tap(() => {
                    this.productForm.reset({
                        name: '',
                        description: '',
                        category: this.lastKnownCategories[0] ?? '',
                        price: 0,
                        stock: 0
                    });
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

    deleteAction$ = this.deleteProduct$.pipe(
        switchMap(product => {
            if (this.deletingId !== null) return EMPTY;

            const confirmed = window.confirm(`Eliminare il prodotto "${product.name}"?`);
            if (!confirmed) return EMPTY;

            this.deletingId = product.id;
            this.deleteError = null;

            return this.adminService.deleteProduct(product.id).pipe(
                tap(() => this.refreshProducts$.next()),
                catchError(err => {
                    this.deleteError = err?.error?.error || 'Impossibile eliminare il prodotto';
                    return EMPTY;
                }),
                finalize(() => this.deletingId = null)
            );
        })
    );

    actions$ = new BehaviorSubject<null>(null).pipe(
        switchMap(() => this.createAction$.pipe(catchError(() => EMPTY)))
    );

    showCreateForm = false;
    saving = false;
    deletingId: number | null = null;
    saveError: string | null = null;
    deleteError: string | null = null;
    lastKnownCategories: string[] = [];

    categoriesForTemplate$ = this.categoriesState$.pipe(
        tap(state => {
            if (state.status === 'success') this.lastKnownCategories = state.data;
        }),
        map(state => state)
    );

    productForm = this.fb.nonNullable.group({
        name: ['', Validators.required],
        description: ['', Validators.required],
        category: ['', Validators.required],
        price: [0, [Validators.required, Validators.min(0)]],
        stock: [0, [Validators.required, Validators.min(0)]]
    });

    toggleCreateForm(): void {
        this.showCreateForm = !this.showCreateForm;
        this.saveError = null;
    }

    createProduct(): void {
        this.createProduct$.next();
    }

    deleteProduct(product: Product): void {
        this.deleteProduct$.next(product);
    }
}
