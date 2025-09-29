import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Mascota {
  id: number;
  especie: string;
}

@Injectable({
  providedIn: 'root'
})
export class MascotaService {
  private apiUrl = 'http://localhost:8096/api/mascotas';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Mascota[]> {
    const token = localStorage.getItem('authToken'); // Obtener el token del almacenamiento local
    const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}` // Incluir el token en el encabezado Authorization
    });

    return this.http.get<Mascota[]>(this.apiUrl, { headers } );
  }
}