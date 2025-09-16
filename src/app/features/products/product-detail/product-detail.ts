import { Component, OnInit } from '@angular/core';
import { Product } from '../../../core/models/product.model';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';

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
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // Aquí puedes hacer una petición al backend para obtener el producto por ID
      // Por ahora, solo lo mostramos con datos ficticios
      this.producto = {
        id: +id,
        sku: 'NP-CHICK-001',
        name: 'Snack de Pollo Deshidratado',
        slug: 'snack-pollo-deshidratado-perros-200g',
        brand: { id: 1, name: 'NutriPaws' },
        category: { id: 1, name: 'Snacks Deshidratados', slug: 'snacks-deshidratados', description: 'Snacks naturales deshidratados para mascotas', children: [] },
        pet: { id: 1, species: 'Dog' },
        shortDescription: 'Snack 100% natural, alto en proteína.',
        description: 'Elaborado con pechuga de pollo deshidratada, sin preservantes ni granos.',
        price: 29.90,
        cost: 15.00,
        currency: 'PEN',
        weightGrams: 200,
        isActive: true,
        createdAt: '2025-08-22 20:23:28',
        updatedAt: '2025-08-22 20:23:28',
        dietaryTags: [
          { id: 1, name: 'Grain-Free' },
          { id: 2, name: 'Sin preservantes' }
        ]
      };
    }
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  editProduct(): void {
    this.router.navigate(['/products/edit', this.producto?.id]);
  }

}
