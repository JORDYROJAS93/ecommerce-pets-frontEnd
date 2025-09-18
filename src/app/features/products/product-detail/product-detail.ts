import { Component, OnInit } from '@angular/core';
import { Product } from '../../../core/models/product.model';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-product-detail',
  imports: [CurrencyPipe],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetailComponent implements OnInit {

  producto: Product | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public authService: AuthService // 👈 ¡CLAVE: PUBLIC!
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // Aquí cargas el producto desde el servicio
      // this.productService.getProductById(+id).subscribe(...)
    }
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  editProduct(): void {
    this.router.navigate(['/products/edit', this.producto?.id]);
  }

  // 👇 NUEVA PROPIEDAD: Etiquetas seguras
  get dietaryTags(): any[] {
    return this.producto?.dietaryTags || [];
  }

}
