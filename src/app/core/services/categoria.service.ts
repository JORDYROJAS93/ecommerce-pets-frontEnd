import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Categoria {
  id: number;
  nombre: string;
  slug: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = 'http://localhost:8096/api/categorias';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Categoria[]> {
    const token = localStorage.getItem('authToken'); // Obtener el token del almacenamiento local
    const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}` // Incluir el token en el encabezado Authorization
    });

    return this.http.get<Categoria[]>(this.apiUrl, { headers } );
  }
}