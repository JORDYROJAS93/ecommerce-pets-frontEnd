import { Component, OnInit, Input } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Producto } from '../../../core/models/producto.model';
import { ProductoService } from '../../../core/services/producto.service';
import { ToastrService } from 'ngx-toastr';
import { Marca, MarcaService } from '../../../core/services/marca.service';
import {
  Categoria,
  CategoriaService,
} from '../../../core/services/categoria.service';
import {
  Mascota,
  MascotaService,
} from '../../../core/services/mascota.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.html',
  styleUrls: ['./product-form.css'],
  imports: [ReactiveFormsModule], // 👈 ¡Importante!
  standalone: true,
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  producto: Producto | null = null;
  loading = false;

  marcas: Marca[] = [];
  categorias: Categoria[] = [];
  mascotas: Mascota[] = [];

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private marcaService: MarcaService,
    private categoriaService: CategoriaService,
    private mascotaService: MascotaService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.productForm = this.fb.group({
      nombre: ['', Validators.required],
      sku: ['', Validators.required],
      idMarca: [null, Validators.required],
      idCategoria: [null, Validators.required],
      idMascota: [null, Validators.required],
      descripcionCorta: ['', Validators.required],
      descripcion: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(0)]],
      costo: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      pesoGramos: [0, [Validators.required, Validators.min(1)]],
      estaActivo: [true],
      imagenes: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.loadCombos();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loading = true;
      this.productoService.getProductById(+id).subscribe({
        next: (product) => {
          this.producto = product;
          
          //  Rellenar imágenes
          this.imagenesFormArray.clear();
          if (product.imagenes && product.imagenes.length > 0) {
            product.imagenes.forEach((img) => {
              this.imagenesFormArray.push(
                this.fb.group({
                  url: [
                    img.url || '',
                    [Validators.required, Validators.pattern(/^https?:\/\/.+/)],
                  ],
                  orden: [img.orden || this.imagenesFormArray.length + 1],
                })
              );
            });
          } else {
            // Opcional: añadir un campo vacío al inicio
            this.agregarImagen();
          }

          this.productForm.patchValue({
            nombre: product.nombre,
            sku: product.sku,
            idMarca: product.marca ? product.marca.id : null,
            idCategoria: product.categoria ? product.categoria.id : null,
            idMascota: product.mascota ? product.mascota.id : null,
            stock: product.stock,
            descripcionCorta: product.descripcionCorta,
            descripcion: product.descripcion,
            precio: product.precio,
            costo: product.costo,
            pesoGramos: product.pesoGramos,
            estaActivo: product.estaActivo,
          });
          this.loading = false;
        },
        error: () => {
          this.toastr.error('Producto no encontrado', 'Error');
          this.router.navigate(['/products']);
        },
      });
    }

    this.productForm.statusChanges.subscribe((status) => {
      console.log('🎯 Formulario status:', status);
      console.log('🎯 Errores del formulario:', this.productForm.errors);
      console.log('🎯 Estado de los campos:', {
        nombre: this.productForm.get('nombre')?.errors,
        sku: this.productForm.get('sku')?.errors,
        descripcionCorta: this.productForm.get('descripcionCorta')?.errors,
        descripcion: this.productForm.get('descripcion')?.errors,
        precio: this.productForm.get('precio')?.errors,
        costo: this.productForm.get('costo')?.errors,
        pesoGramos: this.productForm.get('pesoGramos')?.errors,
        estaActivo: this.productForm.get('estaActivo')?.errors,
      });
    });
  }

  private loadCombos(): void {
    this.marcaService.getAll().subscribe((data) => (this.marcas = data));
    this.categoriaService
      .getAll()
      .subscribe((data) => (this.categorias = data));
    this.mascotaService.getAll().subscribe((data) => (this.mascotas = data));
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.toastr.warning(
        'Por favor completa todos los campos requeridos',
        'Formulario inválido'
      );
      return;
    }

    this.loading = true;
    const formData = this.productForm.value;

    // 👇 Convierte números a string para que Spring Boot los convierta a BigDecimal
    const payload = {
      ...formData,
      idMarca: Number(formData.idMarca),
      idCategoria: Number(formData.idCategoria),
      idMascota: Number(formData.idMascota),
      precio: formData.precio.toString(),
      costo: formData.costo.toString(),
      stock: formData.stock, // ← Integer, no necesita conversión

      // Crea los objetos anidados con solo el ID
      marca: { id: Number(formData.idMarca) },
      categoria: { id: Number(formData.idCategoria) },
      mascota: { id: Number(formData.idMascota) },
    };
    console.log('🎯 Datos enviados al backend:', payload);

    if (this.producto?.id) {
      // Actualizar
      this.productoService.updateProduct(this.producto.id, payload).subscribe({
        next: (producto: Producto) => {
          console.log('🎯 Producto actualizado:', producto);
          this.loading = false;
          this.toastr.success('Producto actualizado con éxito', 'Éxito');
          this.router.navigate(['/products']);
        },
        error: (error: any) => {
          console.error('❌ Error al actualizar:', error);
          console.error('❌ Detalle de error:', error.error);
          this.loading = false;
          this.toastr.error('Error al actualizar el producto', 'Error');
        },
      });
    } else {
      // Crear
      this.productoService.createProduct(payload).subscribe({
        next: (producto: Producto) => {
          console.log('🎯 Producto creado:', producto);
          this.loading = false;
          this.toastr.success('Producto creado con éxito', 'Éxito');
          this.router.navigate(['/products']);
        },
        error: (error: any) => {
          console.error('❌ Error al crear:', error);
          console.error('❌ Detalle de error:', error.error);
          this.loading = false;
          this.toastr.error('Error al crear el producto', 'Error');
        },
      });
    }
  }

  resetForm(): void {
    this.productForm.reset({
      estaActivo: true,
      precio: 0,
      costo: 0,
      pesoGramos: 0,
    });
    this.loading = false;
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  get imagenesFormArray(): FormArray {
    return this.productForm.get('imagenes') as FormArray;
  }

  crearImagenFormGroup(url: string = ''): FormGroup {
    return this.fb.group({
      url: [url, [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      orden: [this.imagenesFormArray.length + 1],
    });
  }

  agregarImagen(): void {
    this.imagenesFormArray.push(this.crearImagenFormGroup());
  }

  eliminarImagen(index: number): void {
    this.imagenesFormArray.removeAt(index);
    // Opcional: reordenar los "orden" si lo usas en el backend
  }
}
