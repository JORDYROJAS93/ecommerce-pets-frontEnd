import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Carrito, CarritoService, ItemCarrito } from '../../core/services/carrito.service';
import { CheckoutComponent } from '../checkout/checkout';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  imports: [ CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class CartComponent implements OnInit {
  carrito$: Observable<Carrito | null>;
  carrito: Carrito | null = null;
  isLoading = true;

  constructor(private carritoService: CarritoService, private router: Router) {
    this.carrito$ = carritoService.carrito$;
  }

  ngOnInit(): void {
    this.carrito$.subscribe({
      next: (carrito) => {
        this.carrito = carrito;
        this.isLoading = false;
        console.log('Carrito actualizado en CartComponent:', carrito);
      },
      error: (err) => {
        console.error('Error al cargar carrito en CartComponent:', err);
        this.isLoading = false;
      }
    });
  }

  // Método para actualizar la cantidad de un item
  actualizarCantidad(item: ItemCarrito, nuevaCantidad: number) {
    if (nuevaCantidad < 1) {
      // Si la cantidad es menor a 1, eliminar el item
      this.eliminarItem(item.id);
      return;
    }

    // Llamar al servicio para actualizar la cantidad
    this.carritoService.actualizarCantidadItem(item.id, nuevaCantidad).subscribe({
      next: () => {
        // El servicio ya recarga el carrito, por lo tanto, no necesitamos hacer nada más aquí
        console.log(`Cantidad actualizada para item ${item.id} a ${nuevaCantidad}`);
      },
      error: (err) => {
        console.error('Error al actualizar cantidad:', err);
        // Opcional: Mostrar un mensaje de error con Toastr
      }
    });
  }

  // Método para eliminar un item
  eliminarItem(idItem: number) {
    this.carritoService.eliminarItem(idItem).subscribe({
      next: () => {
        console.log(`Item ${idItem} eliminado`);
        // El servicio ya recarga el carrito
      },
      error: (err) => {
        console.error('Error al eliminar item:', err);
        // Opcional: Mostrar un mensaje de error con Toastr
      }
    });
  }

  // Método para calcular el subtotal del carrito (opcional, si no se calcula en el backend)
  getSubtotal(): number {
    if (!this.carrito || !this.carrito.items) return 0;
    return this.carrito.items.reduce((sum, item) => sum + (item.precioTotal || 0), 0);
  }

  finalizarCompra() {
    this.router.navigate(['/checkout']);
  }
}
