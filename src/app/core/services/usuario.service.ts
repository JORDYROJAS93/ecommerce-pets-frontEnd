import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interfaces para tipar los datos
export interface Usuario {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  estado?: string;
  creadoEn?: string;
  actualizadoEn?: string;
}

// DTO para actualizar perfil (sin contraseña)
export interface ActualizarUsuarioRequest {
  nombre: string;
  apellido: string;
  telefono?: string;
}

// DTO para actualizar solo contraseña
export interface ActualizarContraseñaRequest {
  password: string;
  currentPassword?: string; // Opcional: si el backend lo requiere
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = 'http://localhost:8096/api/usuarios';

  constructor(private http: HttpClient) {}

  // Obtener usuario por ID
  obtenerUsuarioPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Actualizar perfil (sin contraseña)
  actualizarUsuario(id: number, data: ActualizarUsuarioRequest): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, data).pipe(
      catchError(this.handleError)
    );
  }

  // Actualizar contraseña
  actualizarContraseña(id: number, data: ActualizarContraseñaRequest): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, data).pipe(
      catchError(this.handleError)
    );
  }

  // Opcional: Obtener usuario por email
  obtenerUsuarioPorEmail(email: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/email/${email}`).pipe(
      catchError(this.handleError)
    );
  }

  // Opcional: Listar todos los usuarios
  listarUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}`).pipe(
      catchError(this.handleError)
    );
  }

  // Manejo de errores
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código: ${error.status}, Mensaje: ${error.error?.message || error.message}`;
    }
    console.error('UsuariosService error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}