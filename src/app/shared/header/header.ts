import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { navbarComponent } from "../navbar/navbar";

@Component({
  selector: 'app-header',
  imports: [navbarComponent, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class headerComponent implements OnInit  {

cartCount: number = 0;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.getCartItems().subscribe(items => {
      this.cartCount = items.length;
    });
  }

}
