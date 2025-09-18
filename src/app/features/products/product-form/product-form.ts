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
  
  
  productForm: FormGroup;
  producto: Product | null = null;
  loading = false;

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
      weightGrams: [0, [Validators.required, Validators.min(1)]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loading = true;
      this.productService.getProductById(+id).subscribe({
        next: (product) => {
          this.producto = product;
          this.productForm.patchValue(product);
          this.loading = false;
        },
        error: () => {
          this.router.navigate(['/products']);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formData = this.productForm.value;

    if (this.producto?.id) {
      this.productService.updateProduct(this.producto.id, formData).subscribe({
        next: () => {
          this.loading = false;
          alert('Producto actualizado con éxito');
          this.router.navigate(['/products']);
        },
        error: () => {
          this.loading = false;
          alert('Error al actualizar el producto');
        }
      });
    } else {
      this.productService.createProduct(formData).subscribe({
        next: () => {
          this.loading = false;
          alert('Producto creado con éxito');
          this.router.navigate(['/products']);
        },
        error: () => {
          this.loading = false;
          alert('Error al crear el producto');
        }
      });
    }
  }

  resetForm(): void {
    this.productForm.reset();
    this.loading = false;
  }
  
}