import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart: Product[] = [];

  addToCart(product: Product): void {
    this.cart.push(product);
    console.log('Carrito actualizado:', this.cart);
  }

  getCart(): Product[] {
    return [...this.cart];
  }

  clearCart(): void {
    this.cart = [];
  }

  getTotalItems(): number {
    return this.cart.length;
  }
}