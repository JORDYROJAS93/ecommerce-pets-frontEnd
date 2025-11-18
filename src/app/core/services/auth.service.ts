import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  userId?: number;
  username?: string;
  email?: string;
}

export interface DecodedToken {
  sub?: string;
  id?: number;
  userId?: number;
  roles?: string[];
  iat?: number;
  exp?: number;
}

// DTO para la respuesta de registro (del backend Spring: message, userId)
interface SignupResponse {
  message: string;
  userId: string;
}

// DTO para la solicitud de registro (debe coincidir con el DTO de Spring)
export interface SignupRequest {
  nombre: string; // Coincide con el campo 'name' de tu formulario
  email: string;
  password: string;
  apellido?: string;
  telefono?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8096/auth';
  private tokenKey = 'authToken';
  private userIdKey = 'userId';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.hasToken()
  );

  constructor(private http: HttpClient, private router: Router) {}

  // --- Método de REGISTRO (NUEVO) ---
  register(signupData: SignupRequest): Observable<SignupResponse> {
    const url = `${this.apiUrl}/signup`;
    return this.http.post<SignupResponse>(url, signupData);
  }
  // -----------------------------------

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          console.log('Respuesta del login:', response);
          // Guardar token siempre que venga
          if (response.token) {
            this.setToken(response.token);
          }
          if (response.username) {
            localStorage.setItem('userName', response.username);
          }

          // Si el backend retorna userId, lo guardamos; si no, intentamos extraerlo del token
          if (response.userId) {
            this.setUserId(response.userId);
          } else {
            const decoded: any = this.getDecodedToken();
            const possibleId = decoded?.userId ?? decoded?.id ?? null;
            if (possibleId && !isNaN(Number(possibleId))) {
              this.setUserId(Number(possibleId));
            } else {
              // No forzar logout por falta de userId; permitir flujo de invitado si aplica
              console.warn(
                "AuthService: 'userId' no encontrado en respuesta ni en token. Continuando sin userId en localStorage."
              );
              this.removeUserId();
            }
          }

          this.isAuthenticatedSubject.next(true);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.removeUserId();
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  getDecodedToken(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error('Error decoding token', error);
      return null;
    }
  }

  isTokenExpired(): boolean {
    const decoded = this.getDecodedToken();
    if (!decoded || !decoded.exp) return true;
    const now = Date.now() / 1000;
    return decoded.exp < now;
  }

  // Getter sincrónico útil en templates
  isLoggedIn(): boolean {
    return this.hasToken() && !this.isTokenExpired();
  }

  getUsername(): string | null {
    const decoded = this.getDecodedToken();
    // algunos tokens usan 'sub' como email/username
    return (decoded?.sub as string) ?? null;
  }
  getUserName(): string | null {
    return localStorage.getItem('userName');
  }

  setUserName(name: string): void {
  localStorage.setItem('userName', name);
}

  getUserId(): number | null {
    const v = localStorage.getItem(this.userIdKey);
    if (!v) return null;
    const n = Number(v);
    return isNaN(n) ? null : n;
  }

  private setUserId(id: number): void {
    localStorage.setItem(this.userIdKey, id.toString());
  }

  private removeUserId(): void {
    localStorage.removeItem(this.userIdKey);
  }

  hasRole(role: string): boolean {
    const decoded = this.getDecodedToken();
    if (!decoded || !Array.isArray(decoded.roles)) return false;
    return decoded.roles.includes(role);
  }

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN') || this.hasRole('ADMIN');
  }

  isUser(): boolean {
    return (
      this.hasRole('ROLE_CLIENTE') ||
      this.hasRole('CLIENTE') ||
      this.hasRole('ROLE_USER')
    );
  }
}
