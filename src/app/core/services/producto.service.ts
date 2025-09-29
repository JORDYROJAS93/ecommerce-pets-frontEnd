import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private apiUrl = 'http://localhost:8096/api/productos';

  constructor(private http: HttpClient) {}

  // Obtener todos los productos
  getProducts(
    search: string = '',
    categoriaId: number | null = null,
    sortBy: string = ''
  ): Observable<Producto[]> {
    let params = new HttpParams(); // Parámetro 'search' (Búsqueda por texto)

    if (search) {
      params = params.set('search', search);
    } // Parámetro 'categoria' (Filtro por ID de categoría)

    if (categoriaId !== null) {
      // Asegúrate de que el ID de la categoría se envíe como 'categoria',
      // que es el nombre que espera tu ProductoController en Java.
      params = params.set('categoria', categoriaId.toString());
    } // Parámetro 'sort' (Ordenamiento)

    if (sortBy) {
      params = params.set('sort', sortBy);
    }

    // Envía la petición GET con los parámetros construidos
    return this.http.get<Producto[]>(this.apiUrl, { params: params });
  }

  // Obtener producto por ID
  getProductById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  // Crear producto
  createProduct(product: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, product);
  }

  // Actualizar producto
  updateProduct(id: number, product: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, product);
  }

  // Eliminar producto
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
