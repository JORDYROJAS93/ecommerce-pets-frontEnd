import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Marca {
  id: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class MarcaService {
  private apiUrl = 'http://localhost:8096/api/marcas';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Marca[]> {
    const token = localStorage.getItem('authToken'); // Obtener el token del almacenamiento local
    const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}` // Incluir el token en el encabezado Authorization
    });
    return this.http.get<Marca[]>(this.apiUrl, { headers });
  }
}