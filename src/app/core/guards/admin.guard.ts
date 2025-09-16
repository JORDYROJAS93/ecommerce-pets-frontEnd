import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    // Si no está autenticado o no es admin → bloquea
    if (!this.authService.isAuthenticated() || !this.authService.isAdmin()) {
      alert('Acceso denegado: solo los administradores pueden acceder.');
      this.router.navigate(['/products']); // Redirige a lista pública
      return false;
    }

    return true;
  }
}