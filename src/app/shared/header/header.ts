import { RouterLink, RouterLinkActive } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CarritoService } from '../../core/services/carrito.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, AsyncPipe],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  standalone: true,
})
export class HeaderComponent implements OnInit {
  isAuthenticated = false;
  username: string | null = null;

  // Observable reactivo para el contador
  totalItems$!: Observable<number>;

  constructor(
    public authService: AuthService,
    public carritoService: CarritoService
  ) {}

  ngOnInit(): void {
    this.authService.isAuthenticated().subscribe((isAuth) => {
      this.isAuthenticated = isAuth;
      this.username = isAuth ? this.authService.getUsername() : null;
    });

    // Mapea el carrito a la cantidad total (reactivo)
    this.totalItems$ = this.carritoService.carrito$.pipe(
      map(c => (c && c.items ? c.items.reduce((s, it) => s + (it.cantidad || 0), 0) : 0))
    );
  }

  logout(): void {
    this.authService.logout();
  }
}
