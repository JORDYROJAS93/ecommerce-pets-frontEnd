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
import { ProductFormComponent } from './features/products/product-form/product-form';
import { NosotrosComponent } from './features/nosotros/nosotros';
import { ContactanosComponent } from './features/contactanos/contactanos';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'products', component: ProductListComponent },

    // RUTAS ESPECÍFICAS (primero)
  { path: 'products/new', component: ProductFormComponent, canActivate: [AdminGuard] },
  { path: 'products/edit/:id', component: ProductFormComponent, canActivate: [AdminGuard] },

  // LUEGO LAS RUTAS CON PARÁMETROS
  { path: 'products/detail/:id', component: ProductDetailComponent },
  { path: 'products', component: ProductListComponent },

    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'cart', component: CartComponent, canActivate: [AdminGuard] },
    { path: 'checkout', component: CheckoutComponent, canActivate: [AdminGuard] },
    { path: 'profile', component: ProfileComponent, canActivate: [AdminGuard] },
    { path: 'nosotros', component: NosotrosComponent},
    { path: 'contacto', component: ContactanosComponent },
    { path: '**', redirectTo: '' }
];
