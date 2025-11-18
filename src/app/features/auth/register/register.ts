import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule,RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent implements OnInit {
  
  registerForm!: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService // Inyectamos el AuthService
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      // Campos requeridos
      nombre: ['', Validators.required], 
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      
      // Campos opcionales añadidos
      telefono: ['', [Validators.minLength(9)]]
    }, { validators: this.passwordMatchValidator });
  }

  // Validador personalizado para confirmar que las contraseñas coinciden
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      // Extraemos TODOS los campos requeridos por el SignupRequest
      const { nombre, email, password, apellido, telefono } = this.registerForm.value;
      
      this.authService.register({ nombre, email, password, apellido, telefono }).subscribe({
        next: (response) => {
          this.loading = false;
          alert(`Registro exitoso! Ahora puedes iniciar sesión.`); 
          this.router.navigate(['/login']); 
        },
        error: (error) => {
          this.loading = false;
          const serverError = error.error?.message || error.error || 'El email ya está registrado o hay un error desconocido.';
          
          this.errorMessage = serverError;
          console.error('Register error:', error);
        }
      });

    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}