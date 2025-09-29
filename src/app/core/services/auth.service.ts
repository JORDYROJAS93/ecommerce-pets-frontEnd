import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface DecodedToken {
  sub: string;
  roles: string[];
  iat: number;
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8096/auth';
  private tokenKey = 'authToken';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this.setToken(response.token);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
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
    const decodedToken = this.getDecodedToken();
    if (!decodedToken) return true;

    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
  }

  getUsername(): string | null {
    const decodedToken = this.getDecodedToken();
    return decodedToken ? decodedToken.sub : null;
  }

hasRole(role: string): boolean {
  const decodedToken = this.getDecodedToken();
  if (!decodedToken || !Array.isArray(decodedToken.roles)) {
    return false;
  }
  return decodedToken.roles.includes(role);
}

isAdmin(): boolean {
  const decodedToken = this.getDecodedToken();
  if (!decodedToken || !Array.isArray(decodedToken.roles)) return false;
  return decodedToken.roles.includes('ROLE_ADMIN'); 
}

isUser(): boolean {
  const decodedToken = this.getDecodedToken();
  if (!decodedToken || !Array.isArray(decodedToken.roles)) return false;
  return decodedToken.roles.includes('ROLE_CLIENTE'); // 👈 ¡IMPORTANTE!
}

}