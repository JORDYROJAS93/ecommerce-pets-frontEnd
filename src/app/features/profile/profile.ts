import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ActualizarContraseñaRequest, ActualizarUsuarioRequest, UsuariosService } from '../../core/services/usuario.service';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  changePasswordForm!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  showPasswordForm = false; // Nuevo: controla visibilidad del formulario de contraseña
  showCurrentPassword = false; // Nuevo: mostrar/ocultar contraseña actual
  showNewPassword = false; // Nuevo: mostrar/ocultar nueva contraseña
  showConfirmPassword = false; // Nuevo: mostrar/ocultar confirmar contraseña

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private usuariosService: UsuariosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(80)]],
      apellido: ['', [Validators.required, Validators.maxLength(80)]],
      email: [{ value: '', disabled: true }],
      telefono: ['', [Validators.maxLength(30)]]
    });

    this.changePasswordForm = this.fb.group({
      currentPassword: [''],
      newPassword: ['', [Validators.minLength(6)]],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });

    this.cargarPerfil();
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  cargarPerfil(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.usuariosService.obtenerUsuarioPorId(userId).subscribe({
        next: (usuario) => {
          this.profileForm.patchValue({
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            telefono: usuario.telefono || '',
          });
        },
        error: (err) => {
          console.error('Error al cargar perfil:', err);
          this.errorMessage = 'Error al cargar los datos del perfil.';
        }
      });
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      this.successMessage = '';
      this.errorMessage = '';

      const datos = this.profileForm.value;
      const userId = this.authService.getUserId();

      if (userId) {
        const payload: ActualizarUsuarioRequest = {
          nombre: datos.nombre,
          apellido: datos.apellido,
          telefono: datos.telefono || null,
        };

        this.usuariosService.actualizarUsuario(userId, payload).subscribe({
          next: (usuarioActualizado) => {
            this.loading = false;
            this.successMessage = 'Perfil actualizado correctamente.';
            this.authService.setUserName(usuarioActualizado.nombre);
          },
          error: (err) => {
            this.loading = false;
            console.error('Error al actualizar perfil:', err);
            this.errorMessage = err.message || 'Error al actualizar el perfil.';
          }
        });
      }
    } else {
      this.profileForm.markAllAsTouched();
    }
  }

  onChangePasswordSubmit(): void {
    if (this.changePasswordForm.valid) {
      this.loading = true;
      this.successMessage = '';
      this.errorMessage = '';

      const datos = this.changePasswordForm.value;
      const userId = this.authService.getUserId();

      if (userId) {
        const payload: ActualizarContraseñaRequest = {
          password: datos.newPassword,
          currentPassword: datos.currentPassword || undefined,
        };

        this.usuariosService.actualizarContraseña(userId, payload).subscribe({
          next: () => {
            this.loading = false;
            this.successMessage = 'Contraseña actualizada correctamente.';
            this.changePasswordForm.reset();
            this.showPasswordForm = false; // Ocultar formulario después de éxito
          },
          error: (err) => {
            this.loading = false;
            console.error('Error al cambiar contraseña:', err);
            this.errorMessage = err.message || 'Error al cambiar la contraseña.';
          }
        });
      }
    } else {
      this.changePasswordForm.markAllAsTouched();
    }
  }

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    this.errorMessage = ''; // Limpiar error al abrir/cerrar
    this.successMessage = '';
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    switch (field) {
      case 'current':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }
}