import { CartService } from './../../../core/services/cart.service';
import { Component } from '@angular/core';
import { ProductService  } from '../../../core/services/product.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-product-list',
  imports: [CommonModule,CurrencyPipe, RouterModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
  standalone: true
})
export class ProductListComponent {

  products: Product[] = [];
  loading = true;

  constructor(
    public authService: AuthService,
    private productService: ProductService,
    private cartService: CartService) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar productos', err);
        this.loading = false;
      }
    });
  }

// MÉTODO: Agrega producto al carrito
  addToCart(product: Product): void {
    this.cartService.addToCart(product);
    alert(`"${product.name}" agregado al carrito.`);
  }

}
