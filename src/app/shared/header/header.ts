import { RouterLink, RouterLinkActive } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { count } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterLink,RouterLinkActive], 
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  standalone: true
})
export class HeaderComponent implements OnInit {

  cartCount: number = 0;
  isAuthenticated = false;
  username: string | null = null;

  constructor(
    public authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    // Suscribirse al estado de autenticación
    this.authService.isAuthenticated().subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      this.username = isAuth ? this.authService.getUsername() : null;
    });

    // Obtener conteo del carrito
    this.cartService.getCartCount().subscribe((count: number) => {
  this.cartCount = count;
});
  }

  logout(): void {
    this.authService.logout();
  }
}