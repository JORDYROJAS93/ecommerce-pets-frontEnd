import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Producto } from '../models/producto.model';


@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private cart: Producto[] = [];

  addToCart(product: Producto): void {
    this.cart.push(product);
    console.log('Carrito actualizado:', this.cart);
  }

  getCart(): Producto[] {
    return [...this.cart];
  }

  clearCart(): void {
    this.cart = [];
  }

  getTotalItems(): number {
    return this.cart.length;
  }
}