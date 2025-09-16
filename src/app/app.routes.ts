import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home';
import { ProductListComponent } from './features/products/product-list/product-list';
import { ProductDetailComponent } from './features/products/product-detail/product-detail';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { CartComponent } from './features/cart/cart';
import { CheckoutComponent } from './features/checkout/checkout';
import { ProfileComponent } from './features/profile/profile';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'products', component: ProductListComponent },
    { path: 'products/:id', component: ProductDetailComponent },
    { path: 'products/new', component: ProductListComponent, canActivate: [AdminGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'cart', component: CartComponent, canActivate: [AdminGuard] },
    { path: 'checkout', component: CheckoutComponent, canActivate: [AdminGuard] },
    { path: 'profile', component: ProfileComponent, canActivate: [AdminGuard] },
  //  { path: 'nosotros', loadComponent: () => import('./features/nosotros/nosotros').then(m => m.NosotrosComponent) },
  //  { path: 'contacto', loadComponent: () => import('./features/contacto/contacto').then(m => m.ContactoComponent) }

  { path: '**', redirectTo: '' }
];
