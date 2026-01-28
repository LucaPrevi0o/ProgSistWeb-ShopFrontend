import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list';
import { ProductDetailsComponent } from './components/product-details/product-details';
import { LoginComponent } from './components/login/login';
import { HomeComponent } from './components/home/home';

export const routes: Routes = [
    
    { path: '', component: HomeComponent },
    { path: 'products', component: ProductListComponent },
    { path: 'products/:id', component: ProductDetailsComponent },
    { path: 'login', component: LoginComponent },
    { path: 'logout', component: LoginComponent }
];
