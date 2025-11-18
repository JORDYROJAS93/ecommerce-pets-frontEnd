import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  
  welcomeMessage: string = 'Nutrición 100% Natural para tu Mascota';
  
  // Lista de testimonios ficticios para la nueva sección
  testimonials = [
    { name: 'Sofía R.', text: 'Mi perro Max ama las barritas de calabaza. ¡Menos gases y más energía!', rating: 5 },
    { name: 'Carlos M.', text: 'El mejor servicio al cliente y mis gatos están fascinados con el snack de pollo.', rating: 5 },
    { name: 'Laura G.', text: '¡Por fin una marca que realmente es natural! Los resultados se notan en su pelaje.', rating: 4.5 },
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    // No se necesita inicializar productos
  }

  // Método para navegar al catálogo completo
  goToProducts(): void {
    this.router.navigate(['/products']);
  }
}