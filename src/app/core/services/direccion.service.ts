import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Direccion {
  id: number;
  idUsuario?: number;
  tipo: 'FACTURACION' | 'ENVIO';
  nombreCompleto: string;
  telefono?: string;
  linea1: string;
  linea2?: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
  codigoPostal?: string;
  pais: string;
  referencia?: string;
  esPredeterminada: boolean;
  creadoEn: string;
}

@Injectable({
  providedIn: 'root'
})
export class DireccionService {
  private apiUrl = 'http://localhost:8096/api/direcciones';

  constructor(private http: HttpClient) {}

  getDireccionesUsuario(idUsuario: number): Observable<Direccion[]> {
    return this.http.get<Direccion[]>(`${this.apiUrl}/usuario/${idUsuario}`);
  }

  getDireccionPredeterminada(idUsuario: number, tipo: 'FACTURACION' | 'ENVIO'): Observable<Direccion | null> {
    return this.http.get<Direccion>(`${this.apiUrl}/usuario/${idUsuario}/predeterminada/${tipo}`);
  }

  crearDireccion(direccion: Partial<Direccion>): Observable<Direccion> {
    return this.http.post<Direccion>(`${this.apiUrl}`, direccion);
  }

  // Opcional: Otros métodos como actualizar, eliminar, etc.
}