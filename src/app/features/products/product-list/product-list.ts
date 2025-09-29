import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // ✅ Necesario para [ngModel] en el HTML
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Producto } from '../../../core/models/producto.model';
import { ProductoService } from '../../../core/services/producto.service';
import { CarritoService } from '../../../core/services/carrito.service';
import Swal from 'sweetalert2';
import {
  Categoria,
  CategoriaService,
} from '../../../core/services/categoria.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs'; // ✅ Importar operadores RxJS

@Component({
  selector: 'app-product-list', // ✅ Añadir FormsModule para los enlaces de datos bidireccionales ([ngModel])
  imports: [CommonModule, CurrencyPipe, RouterModule, FormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
  standalone: true,
})
export class ProductListComponent implements OnInit {
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  loading = true; //  VARIABLES DE ESTADO PARA FILTROS

  searchText: string = '';
  selectedCategoriaId: number | null = null;
  selectedSort: string = ''; // Sujeto para el Debounce (mejora el rendimiento de la búsqueda)

  private searchSubject = new Subject<string>();

  constructor(
    public authService: AuthService,
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private categoriaService: CategoriaService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Carga de Combos (Categorías)
    this.loadCombos(); // ✅ INICIALIZACIÓN: Cargar productos al inicio (sin filtros)

    this.loadProducts(); // ✅ CONFIGURAR DEBOUNCE: Lógica para la caja de búsqueda

    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.loadProducts(); // Ejecuta la carga después de que el usuario deja de escribir
      }); // Lógica de debug del token (mantenida)

    const token = this.authService.getDecodedToken();
    console.log('🎯 Token decodificado:', token);
    console.log('🎯 ¿Es admin?', this.authService.isAdmin());
    console.log('🎯 ¿Es user?', this.authService.isUser());
  }

  // METODO: Cargar categorías para el filtro
  loadCombos(): void {
    this.categoriaService.getAll().subscribe((data) => {
      this.categorias = data;
    });
  } // ✅ FUNCIÓN CENTRAL: Carga los productos usando los parámetros de búsqueda/filtro/orden

  loadProducts(): void {
    this.loading = true; // Llama al servicio con todos los parámetros de estado
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
  } // ✅ EVENTO: Maneja la entrada de texto de la caja de búsqueda

  // ✅ EVENTO: Maneja la entrada de texto de la caja de búsqueda (con debounce)
  onSearchChange(event: Event): void {
    // 💡 CORRECCIÓN: Usar un cast explícito a HTMLInputElement
    const inputElement = event.target as HTMLInputElement;

    // Verifica si el elemento es válido antes de acceder al valor
    if (inputElement) {
      this.searchText = inputElement.value;
      this.searchSubject.next(this.searchText); // Envía el valor al Subject
    }
  }

  // ✅ EVENTO: Maneja el cambio en los selects de Categoría y Orden
  onFilterChange(type: 'categoria' | 'sort', event: Event): void {
    // 💡 CORRECCIÓN: Usar un cast explícito a HTMLSelectElement
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value;

    if (type === 'categoria') {
      // CORRECCIÓN: El valor del select puede ser una cadena vacía (''), que en el template
      // está mapeada a 'Todas las categorías' y debe ser null en el TS.
      this.selectedCategoriaId = value ? Number(value) : null;
    } else {
      // type === 'sort'
      this.selectedSort = value;
    }

    // El error de 'Object is possibly null' a veces puede ocurrir aquí
    // si el valor de la categoría no es manejado correctamente,
    // pero al usar 'value ? Number(value) : null;' se resuelve la mayoría de las veces.
    this.loadProducts();
  }

  // MÉTODO: Agrega producto al carrito (Mantenido)
  addToCart(producto: Producto): void {
    // ... (código mantenido) ...
    this.carritoService.addToCart(producto);
    this.toastr.success(
      `"${producto.nombre}" agregado al carrito.`,
      'Producto añadido',
      {
        timeOut: 3000,
        positionClass: 'toast-top-right',
        progressBar: true,
        progressAnimation: 'decreasing',
      }
    );
  } //METODO PARA ELIMINAR PRODUCTO (Mantenido)

  deleteProduct(id: number): void {
    // ... (código mantenido) ...
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
            ); // 💡 OPTIMIZACIÓN: Llama a loadProducts para recargar la lista con los filtros aplicados
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
