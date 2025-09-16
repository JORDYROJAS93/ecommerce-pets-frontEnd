import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();

  addToCart(): void {
    const current = this.cartCountSubject.value;
    this.cartCountSubject.next(current + 1);
  }

  removeFromCart(): void {
    const current = this.cartCountSubject.value;
    if (current > 0) {
      this.cartCountSubject.next(current - 1);
    }
  }

  getCartCount(): any {
    return this.cartCountSubject.asObservable();
  }
}