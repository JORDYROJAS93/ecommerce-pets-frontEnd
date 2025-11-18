import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-contactanos',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './contactanos.html',
  styleUrl: './contactanos.css'
})
export class ContactanosComponent implements OnInit {

  // Declaración del grupo de formulario
  contactForm!: FormGroup;

  // Información de contacto estática para mostrar en la vista
  contactInfo = {
    email: 'contacto@boostersnack.com',
    phone: '+51 923 234 678',
    address: 'Av. Las Flores 123, Puente Piedra, Perú',
    schedule: 'Lunes - Viernes: 9:00 - 18:00 hrs.'
  };

  // Inyectamos FormBuilder para construir el formulario
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    // Inicialización del formulario reactivo con validaciones
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  // Método que se llama al enviar el formulario
  onSubmit(): void {
    if (this.contactForm.valid) {
      // Aquí se enviaría la data a un servicio (ej: EmailJS, Firebase Function, etc.)
      console.log('Formulario de Contacto Enviado:', this.contactForm.value);
      
      // Simulación de éxito (en un caso real, esto sería manejado por un servicio)
      alert('¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.');
      
      this.contactForm.reset(); // Limpiar el formulario después del envío
    } else {
      // Marcar todos los campos como 'touched' para mostrar errores de validación
      this.contactForm.markAllAsTouched();
      console.log('Formulario inválido. Revise los campos.');
    }
  }

  // Getter para acceder fácilmente a los controles del formulario en el HTML
  get formControls() {
    return this.contactForm.controls;
  }
}
