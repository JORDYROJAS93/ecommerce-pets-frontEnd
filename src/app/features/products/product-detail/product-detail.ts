import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Producto } from '../../../core/models/producto.model';
import { ProductoService } from '../../../core/services/producto.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-detail',
  imports: [CurrencyPipe],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetailComponent implements OnInit {

  producto: Producto | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoService: ProductoService,
    private toastr: ToastrService,
    public authService: AuthService // 👈 ¡CLAVE: PUBLIC!
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productoService.getProductById(+id).subscribe({
        next: (product) => {
          this.producto = product;
          this.loading = false;
        },
        error: () => {
          this.toastr.error('Producto no encontrado', 'Error');
          this.router.navigate(['/products']);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  editProduct(): void {
    if (this.producto?.id) {
      this.router.navigate(['/products/edit', this.producto.id]);
    }
  }

  // 👇 NUEVA PROPIEDAD: Etiquetas seguras
  get dietaryTags(): any[] {
    return this.producto?.etiquetasDietarias || [];
  }

}
