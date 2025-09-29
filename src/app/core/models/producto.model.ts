export interface Producto {
  id: number;
  sku: string;
  nombre: string;
  slug: string;
  descripcionCorta?: string;
  descripcion?: string;
  precio: number;
  costo?: number;
  stock: number; 
  moneda: string;
  pesoGramos?: number;
  estaActivo: boolean;
  creadoEn: string;
  actualizadoEn: string;

// IDs para relaciones (solo números, no objetos completos)
  idMarca?: number;
  idCategoria?: number;
  idMascota?: number;


  // Relaciones simplificadas
  marca?: { id: number; nombre: string };
  categoria?: { id: number; nombre: string };
  mascota?: { id: number; especie: string };
  inventario?: { id: number; cantidad: number };
  imagenes?: { id: number; url: string; orden: number }[];
  etiquetasDietarias?: { id: number; nombre: string }[];
  ingredientes?: { id: number; nombre: string; cantidad: number }[];
}