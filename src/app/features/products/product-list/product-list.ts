import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // ✅ Necesario para [ngModel] en el HTML
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Producto } from '../../../core/models/producto.model';
import { ProductoService } from '../../../core/services/producto.service';
import { CarritoService } from '../../../core/services/carrito.service'; // Importar CarritoService
import Swal from 'sweetalert2';
import {
  Categoria,
  CategoriaService,
} from '../../../core/services/categoria.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs'; // ✅ Importar operadores RxJS

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, RouterModule, FormsModule], // Añadido CurrencyPipe si lo usas en el template
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
  standalone: true,
})
export class ProductListComponent implements OnInit {
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  loading = true;

  searchText: string = '';
  selectedCategoriaId: number | null = null;
  selectedSort: string = '';
  private searchSubject = new Subject<string>();

  constructor(
    public authService: AuthService,
    private productoService: ProductoService,
    private carritoService: CarritoService, // Inyectar CarritoService
    private categoriaService: CategoriaService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadCombos();
    this.loadProducts();

    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.loadProducts();
      });

    const token = this.authService.getDecodedToken();
    console.log('🎯 Token decodificado:', token);
    console.log('🎯 ¿Es admin?', this.authService.isAdmin());
    console.log('🎯 ¿Es user?', this.authService.isUser());
  }

  loadCombos(): void {
    this.categoriaService.getAll().subscribe((data) => {
      this.categorias = data;
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.productoService
      .getProducts(this.searchText, this.selectedCategoriaId, this.selectedSort)
      .subscribe({
        next: (data) => {
          this.productos = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al cargar productos', err);
          this.loading = false;
        },
      });
  }

  onSearchChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.searchText = inputElement.value;
      this.searchSubject.next(this.searchText);
    }
  }

  onFilterChange(type: 'categoria' | 'sort', event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value;

    if (type === 'categoria') {
      this.selectedCategoriaId = value ? Number(value) : null;
    } else {
      this.selectedSort = value;
    }
    this.loadProducts();
  }

  // MÉTODO: Agrega producto al carrito (CORREGIDO)
  addToCart(producto: Producto): void {
    this.carritoService.agregarProductoAlCarrito(producto.id, 1).subscribe({
      next: (item) => {
        // Actualizar UI local si hace falta (el servicio refresca el carrito interno)
        this.toastr.success(`"${producto.nombre}" agregado al carrito.`, 'Producto añadido', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
          progressBar: true,
          progressAnimation: 'decreasing',
        });
      },
      error: (err) => {
        console.error('Error al agregar producto al carrito:', err);

        // Si la API responde 401 => token inválido/expirado
        if (err?.status === 401) {
          this.toastr.error('Sesión inválida. Por favor, inicie sesión nuevamente.', 'Error');
          // Opcional: forzar logout para limpiar estado y redirigir al login
          this.authService.logout();
          return;
        }

        // Mensaje genérico para otros errores
        const message = err?.error?.message || err?.message || 'Ocurrió un error al agregar el producto.';
        this.toastr.error(message, 'Error');
      }
    });
  }

  deleteProduct(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede revertir. ¡Eliminarás este producto permanentemente!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.productoService.deleteProduct(id).subscribe({
          next: () => {
            this.toastr.success(
              'Producto eliminado correctamente.',
              'Eliminado'
            );
            this.loadProducts();
          },
          error: (err) => {
            console.error('Error al eliminar el producto', err);
            this.toastr.error(
              'Ocurrió un error al eliminar el producto.',
              'Error'
            );
          },
        });
      }
    });
  }
}