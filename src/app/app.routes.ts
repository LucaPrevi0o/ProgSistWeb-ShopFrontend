import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list';
import { ProductDetailsComponent } from './components/product-details/product-details';
import { CartComponent } from './components/cart/cart';
import { CheckoutComponent } from './components/checkout/checkout';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { HomeComponent } from './components/home/home';
import { ProfileComponent } from './components/profile/profile';
import { LoginRedirectorComponent } from './components/login-redirector/login-redirector';

export const routes: Routes = [
    
    { path: '', component: HomeComponent },
    { path: 'products', component: ProductListComponent },
    { path: 'product/:id', component: ProductDetailsComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'logout', component: LoginComponent },
    { path: 'cart', component: CartComponent },
    { path: 'checkout', component: CheckoutComponent },
    { path: 'users/:id', component: ProfileComponent },
    { path: 'login-redirect', component: LoginRedirectorComponent }
];
