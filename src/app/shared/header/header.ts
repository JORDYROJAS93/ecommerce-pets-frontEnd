
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CarritoService } from '../../core/services/carrito.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  standalone: true,
})
export class HeaderComponent implements OnInit {
  cartCount: number = 0;
  isAuthenticated = false;
  username: string | null = null;

  constructor(
    public authService: AuthService,
    public carritoService: CarritoService) {}

  ngOnInit(): void {
    // Suscribirse al estado de autenticación
    this.authService.isAuthenticated().subscribe((isAuth) => {
      this.isAuthenticated = isAuth;
      this.username = isAuth ? this.authService.getUsername() : null;
    });

    
  }

  logout(): void {
    this.authService.logout();
  }
}
