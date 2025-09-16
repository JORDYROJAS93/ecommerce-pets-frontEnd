import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';



@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.html',
  styleUrls: ['./product-form.css'],
  imports: [ReactiveFormsModule], // 👈 ¡Importante!
  standalone: true
})
export class ProductFormComponent implements OnInit {
  @Input() producto: Product | null = null;
  productForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      sku: ['', Validators.required],
      shortDescription: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      cost: [0, [Validators.required, Validators.min(0)]],
      currency: ['PEN', Validators.required],
      weightGrams: [0, [Validators.required, Validators.min(0)]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      // Modo edición: cargar producto por ID
      this.productService.getProductById(+id).subscribe({
        next: (product) => {
          this.producto = product;
          this.productForm.patchValue(product);
        },
        error: (err) => {
          console.error('Error al cargar producto:', err);
          this.router.navigate(['/products']);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched(); // Marca todos como tocados para mostrar errores
      return;
    }

    const formData = this.productForm.value;

    if (this.producto?.id) {
      // Editar producto existente
      this.productService.updateProduct(this.producto.id, formData).subscribe({
        next: () => {
          alert('Producto actualizado con éxito');
          this.router.navigate(['/products']);
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          alert('Error al actualizar el producto');
        }
      });
    } else {
      // Crear nuevo producto
      this.productService.createProduct(formData).subscribe({
        next: () => {
          alert('Producto creado con éxito');
          this.router.navigate(['/products']);
        },
        error: (err) => {
          console.error('Error al crear:', err);
          alert('Error al crear el producto');
        }
      });
    }
  }

  resetForm(): void {
    this.productForm.reset();
  }
}