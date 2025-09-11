import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = false;
  private userName: string = '';

  constructor() {}

  login(username: string, password: string): boolean {
    // 🔹 Aquí simulas login, pero después conectarás al backend
    if (username === 'admin' && password === '1234') {
      this.loggedIn = true;
      this.userName = username;
      return true;
    }
    return false;
  }

  logout(): void {
    this.loggedIn = false;
    this.userName = '';
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  getUserName(): string {
    return this.userName;
  }
}
