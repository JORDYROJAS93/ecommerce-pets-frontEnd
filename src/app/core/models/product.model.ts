export interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  price: number;
  cost?: number;
  currency: string;
  weightGrams?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Relaciones (puedes definirlas como any o crear sus modelos)
  brand?: any;
  category?: any;
  pet?: any;
  dietaryTags?: any[];
}
