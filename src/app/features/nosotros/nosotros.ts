import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nosotros',
  imports: [CommonModule],
  templateUrl: './nosotros.html',
  styleUrl: './nosotros.css'
})
export class NosotrosComponent implements OnInit {

  // Información clave de la empresa
  companyVision: string = "Ser la marca líder en snacks y suplementos naturales en Perú, reconocida por impulsar la salud y felicidad de las mascotas con transparencia y amor por la naturaleza.";
  
  // Miembros del equipo (ejemplo)
  teamMembers = [
    { name: 'Dr. Alejandro Soto', title: 'Fundador & Nutricionista Canino', specialty: 'Experto en dietas orgánicas y funcionales.', image: 'team-alejandro.jpg' },
    { name: 'Lucía Vásquez', title: 'Directora de Operaciones', specialty: 'Gestión de calidad y desarrollo sostenible.', image: 'team-lucia.jpg' },
  ];

  constructor() { }

  ngOnInit(): void {
    // Lógica de inicialización si es necesaria (ej. cargar datos de un servicio)
  }
}
