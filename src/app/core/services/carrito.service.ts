import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Producto } from '../models/producto.model';

export interface ItemCarrito {
  id: number;
  idCarrito: number;
  idProducto: number;
  cantidad: number;
  precioUnitario: number;
  precioTotal: number;
  producto?: Producto;
}

export interface Carrito {
  id: number;
  idUsuario?: number;
  tokenInvitado?: string;
  estado: 'ABIERTO' | 'CONVERTIDO' | 'ABANDONADO';
  creadoEn: string;
  actualizadoEn: string;
  items: ItemCarrito[];
  subtotal?: number;
  totalFinal?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private apiUrl = 'http://localhost:8096/api';
  private carritoSubject = new BehaviorSubject<Carrito | null>(null);
  public carrito$ = this.carritoSubject.asObservable();

  private readonly TOKEN_INVITADO_KEY = 'carritoTokenInvitado';
  private readonly CARRITO_ID_INVITADO_KEY = 'carritoIdInvitado';

  constructor(private http: HttpClient, private authService: AuthService) {
    // Intentar cargar carrito inicial
    this.cargarCarritoActual();
  }

  // --- Helpers para invitado ---
  private generarTokenInvitado(): string {
    return 't-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
  }

  private guardarTokenInvitado(token: string) {
    localStorage.setItem(this.TOKEN_INVITADO_KEY, token);
  }
  private obtenerTokenInvitado(): string | null {
    return localStorage.getItem(this.TOKEN_INVITADO_KEY);
  }
  private guardarCarritoIdInvitado(id: string) {
    localStorage.setItem(this.CARRITO_ID_INVITADO_KEY, id);
  }
  private obtenerCarritoIdInvitado(): string | null {
    return localStorage.getItem(this.CARRITO_ID_INVITADO_KEY);
  }
  private eliminarTokenInvitado() {
    localStorage.removeItem(this.TOKEN_INVITADO_KEY);
  }
  private eliminarCarritoIdInvitado() {
    localStorage.removeItem(this.CARRITO_ID_INVITADO_KEY);
  }

  // --- Carga inicial del carrito ---
  private cargarCarritoActual(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.obtenerCarritoUsuario(userId).subscribe({
        next: c => this.carritoSubject.next(c),
        error: () => {
          // crear uno si no existe o fallback a invitado
          this.crearCarritoUsuario(userId).subscribe({
            next: nc => this.carritoSubject.next(nc),
            error: () => this.cargarCarritoInvitado()
          });
        }
      });
    } else {
      this.cargarCarritoInvitado();
    }
  }

  private cargarCarritoInvitado(): void {
    let token = this.obtenerTokenInvitado();
    if (!token) {
      token = this.generarTokenInvitado();
      this.guardarTokenInvitado(token);
    }

    const carritoIdStr = this.obtenerCarritoIdInvitado();
    if (carritoIdStr) {
      const idNum = Number(carritoIdStr);
      if (!isNaN(idNum)) {
        this.obtenerCarritoPorId(idNum).subscribe({
          next: c => this.carritoSubject.next(c),
          error: () => {
            // crear nuevo carrito invitado si falla
            this.crearCarritoInvitado().subscribe(cc => {
              this.carritoSubject.next(cc);
              this.guardarCarritoIdInvitado(String(cc.id));
            });
          }
        });
        return;
      }
    }

    // crear carrito invitado si no existe id
    this.crearCarritoInvitado().subscribe(cc => {
      this.carritoSubject.next(cc);
      this.guardarCarritoIdInvitado(String(cc.id));
    });
  }

  private obtenerCarritoPorId(id: number): Observable<Carrito> {
    return this.http.get<Carrito>(`${this.apiUrl}/carritos/${id}`);
  }

  // --- API públicas ---

  getCarrito(): Observable<Carrito | null> {
    return this.carrito$;
  }

  // Endpoint para obtener carrito de usuario (asumiendo que existe en el backend)
  obtenerCarritoUsuario(idUsuario: number): Observable<Carrito> {
    return this.http.get<Carrito>(`${this.apiUrl}/carritos/usuario/${idUsuario}`);
  }

  // Endpoint para crear carrito de usuario (asumiendo que existe en el backend)
  crearCarritoUsuario(idUsuario: number): Observable<Carrito> {
    return this.http.post<Carrito>(`${this.apiUrl}/carritos/usuario/${idUsuario}`, {});
  }

  crearCarritoInvitado(): Observable<Carrito> {
    const tokenInv = this.obtenerTokenInvitado() ?? this.generarTokenInvitado();
    this.guardarTokenInvitado(tokenInv);
    return this.http.post<Carrito>(`${this.apiUrl}/carritos/invitado`, { tokenInvitado: tokenInv });
  }

  // 🔹 CORREGIDO: Usar endpoint correcto del backend
  agregarProductoAlCarrito(idProducto: number, cantidad: number = 1) {
    const userId = this.authService.getUserId();
    if (userId) {
      return this.obtenerCarritoUsuario(userId).pipe(
        switchMap(carrito => {
          const body = { idCarrito: carrito.id, idProducto, cantidad };
          return this.http.post<ItemCarrito>(`${this.apiUrl}/items-carrito`, body).pipe(
            tap(() => {
              // refrescar carrito
              this.obtenerCarritoUsuario(userId).subscribe(c => this.carritoSubject.next(c));
            })
          );
        })
      );
    }

    // invitado
    let tokenInv = this.obtenerTokenInvitado();
    if (!tokenInv) {
      tokenInv = this.generarTokenInvitado();
      this.guardarTokenInvitado(tokenInv);
    }

    const carritoIdStr = this.obtenerCarritoIdInvitado();
    if (carritoIdStr) {
      const carritoId = Number(carritoIdStr);
      if (!isNaN(carritoId)) {
        // 🔹 CORREGIDO: Usar endpoint correcto del backend
        const body = { idCarrito: carritoId, idProducto, cantidad };
        return this.http.post<ItemCarrito>(`${this.apiUrl}/items-carrito`, body)
          .pipe(tap(() => {
            this.obtenerCarritoPorId(carritoId).subscribe(c => this.carritoSubject.next(c));
          }));
      }
    }

    // no hay carritoId → crear carrito invitado y luego agregar
    return this.crearCarritoInvitado().pipe(
      switchMap(carrito => {
        this.guardarCarritoIdInvitado(String(carrito.id));
        // 🔹 CORREGIDO: Usar endpoint correcto del backend
        const body = { idCarrito: carrito.id, idProducto, cantidad };
        return this.http.post<ItemCarrito>(`${this.apiUrl}/items-carrito`, body).pipe(
          tap(() => this.obtenerCarritoPorId(carrito.id).subscribe(c => this.carritoSubject.next(c)))
        );
      })
    );
  }

  // 🔹 CORREGIDO: Usar endpoint correcto del backend
  actualizarCantidadItem(idItem: number, nuevaCantidad: number) {
    return this.http.put<void>(`${this.apiUrl}/items-carrito/${idItem}/cantidad`, { cantidad: nuevaCantidad })
      .pipe(tap(() => this.cargarCarritoActual()));
  }

  // 🔹 CORREGIDO: Usar endpoint correcto del backend
  eliminarItem(idItem: number) {
    return this.http.delete<void>(`${this.apiUrl}/items-carrito/${idItem}`)
      .pipe(tap(() => this.cargarCarritoActual()));
  }

  // 🔹 CORREGIDO: Usar endpoint correcto del backend
  vaciarCarrito() {
    const current = this.carritoSubject.getValue();
    if (!current) return of(void 0);
    // 🔹 Elimina todos los items del carrito, no el carrito en sí
    return this.http.delete<void>(`${this.apiUrl}/items-carrito/carrito/${current.id}`)
      .pipe(tap(() => {
        this.carritoSubject.next(null);
        this.eliminarCarritoIdInvitado();
        this.eliminarTokenInvitado();
      }));
  }

  // getTotalItems(): number {
  //   const c = this.carritoSubject.getValue();
  //   if (!c || !c.items) return 0;
  //   return c.items.reduce((s, it) => s + (it.cantidad || 0), 0);
  // }

  // getSubtotal(): number {
  //   const c = this.carritoSubject.getValue();
  //   if (!c || !c.items) return 0;
  //   return c.items.reduce((s, it) => s + (it.precioTotal || 0), 0);
  // }

  // Finalizar compra (cambiar estado del carrito a CONVERTIDO)
  finalizarCompra(idCarrito: number): Observable<void> {
    const params = { nuevoEstado: 'CONVERTIDO' };
    return this.http.put<void>(`${this.apiUrl}/carritos/${idCarrito}/estado`, {}, { params }).pipe(
      tap(() => {
        console.log('Compra finalizada, carrito marcado como CONVERTIDO');
        this.carritoSubject.next(null); // Limpiar carrito local
        this.eliminarTokenInvitado(); // Si era un carrito de invitado
        this.eliminarCarritoIdInvitado(); // Limpiar ID de carrito de invitado
      }),
      catchError(error => {
        console.error('Error al finalizar compra:', error);
        return throwError(error);
      })
    );
  }

  // Calcular total de items en el carrito actual
  getTotalItems(): Observable<number> {
    return this.carrito$.pipe(
      map(carrito => carrito?.items?.reduce((sum, item) => sum + item.cantidad, 0) || 0)
    );
  }

  // Calcular subtotal del carrito actual
  getSubtotal(): Observable<number> {
    return this.carrito$.pipe(
      map(carrito => carrito?.items?.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0) || 0)
    );
  }

  
}