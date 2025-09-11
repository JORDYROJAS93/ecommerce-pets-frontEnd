import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<any[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable(); // 👈 ahora sí existe

  constructor() {}

  addToCart(product: any) {
    const currentItems = this.cartItemsSubject.value;
    this.cartItemsSubject.next([...currentItems, product]);
  }

  getCartItems(): Observable<any[]> {
    return this.cartItems$; // 👈 usa el observable
  }

  clearCart() {
    this.cartItemsSubject.next([]);
  }
}
