import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Carrito, CarritoService } from '../../core/services/carrito.service';
import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http'; // Importar HttpErrorResponse
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Direccion, DireccionService } from '../../core/services/direccion.service';
import { AuthService } from '../../core/services/auth.service';
import { PaymentModalComponent } from './payment-modal/payment-modal';

@Component({
  selector: 'app-checkout',
  imports: [FormsModule,CommonModule,PaymentModalComponent],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class CheckoutComponent implements OnInit {

  carrito$: Observable<Carrito | null>;
  carrito: Carrito | null = null;
  isLoading = true;
  isFinalizing = false; // Estado para mostrar spinner al finalizar
  errorMessage: string | null = null; // Mensaje de error

  direcciones: Direccion[] = [];
  direccionSeleccionada: Direccion | null = null;
  mostrarFormularioDireccion = false;
  nuevaDireccion: Partial<Direccion> = {
    tipo: 'ENVIO',
    pais: 'Perú' // Valor por defecto
  };

  metodosPago = [
    { id: 'tarjeta', nombre: 'Tarjeta de Crédito/Débito' },
    { id: 'paypal', nombre: 'PayPal' },
    { id: 'yape', nombre: 'Yape' },
    { id: 'plin', nombre: 'Plin' },
    { id: 'efectivo', nombre: 'Pago en Efectivo (contra entrega)' }
  ];

  metodoSeleccionado: string = 'tarjeta';

  // Propiedades para el modal
  mostrarModalPago = false;
  metodoPagoModal: string = '';
  totalModal: number = 0;

  constructor(
    private carritoService: CarritoService,
    private direccionService: DireccionService,
    private authService: AuthService,
    private router: Router
  ) {
    this.carrito$ = carritoService.carrito$;
  }

  ngOnInit(): void {
    this.carrito$.subscribe({
      next: (carrito) => {
        this.carrito = carrito;
        this.isLoading = false;
        console.log('Carrito en CheckoutComponent:', carrito);

        if (!carrito) {
          console.warn('No hay carrito activo para finalizar.');
        } else if (!carrito.items || carrito.items.length === 0) {
          console.warn('El carrito está vacío.');
        } else {
          // Cargar direcciones del usuario
          this.cargarDireccionesUsuario();
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar carrito en CheckoutComponent:', err);
        this.isLoading = false;
        this.errorMessage = 'Hubo un error al cargar los detalles del carrito.';
      }
    });
  }

  // Método para calcular el subtotal
  getSubtotal(): number {
    if (!this.carrito || !this.carrito.items) return 0;
    return this.carrito.items.reduce((sum, item) => sum + (item.precioTotal || 0), 0);
  }

  // Método para calcular el total (subtota + envío + impuestos)
  getTotal(): number {
    const subtotal = this.getSubtotal();
    const envio = 10; // Asumiendo que el envío es gratis por ahora
    const impuestos = 0; // Asumiendo que los impuestos son 0 por ahora
    return subtotal + envio + impuestos;
  }

  
  cargarDireccionesUsuario() {
    const idUsuario = this.authService.getUserId();
    if (idUsuario) {
      this.direccionService.getDireccionesUsuario(idUsuario).subscribe({
        next: (direcciones) => {
          this.direcciones = direcciones;
          // Intentar seleccionar la predeterminada
          this.seleccionarDireccionPredeterminada(idUsuario);
        },
        error: (err) => {
          console.error('Error al cargar direcciones:', err);
          this.errorMessage = 'No se pudieron cargar las direcciones.';
        }
      });
    } else {
      console.warn('Usuario no logueado, no se pueden cargar direcciones.');
      // Si no está logueado, podría mostrar un formulario para ingresar dirección
      // o redirigir al login.
      this.mostrarFormularioDireccion = true;
    }
  }

  seleccionarDireccionPredeterminada(idUsuario: number) {
    this.direccionService.getDireccionPredeterminada(idUsuario, 'ENVIO').subscribe({
      next: (direccion) => {
        if (direccion) {
          this.direccionSeleccionada = direccion;
        } else if (this.direcciones.length > 0) {
          // Si no hay predeterminada, selecciona la primera
          this.direccionSeleccionada = this.direcciones[0];
        }
      },
      error: (err) => {
        console.error('Error al obtener dirección predeterminada:', err);
        // Si falla, selecciona la primera si existe
        if (this.direcciones.length > 0) {
          this.direccionSeleccionada = this.direcciones[0];
        }
      }
    });
  }

  crearNuevaDireccion() {
    // 🔹 Obtener el ID del usuario
    const idUsuario = this.authService.getUserId();

    // 🔹 Asignar el ID solo si no es null, de lo contrario, dejarlo como undefined
    this.nuevaDireccion.idUsuario = idUsuario ?? undefined;

    // 🔹 Ahora, verifica si el ID es válido antes de continuar
    if (this.nuevaDireccion.idUsuario !== undefined) {
      this.direccionService.crearDireccion(this.nuevaDireccion).subscribe({
        next: (direccionCreada) => {
          console.log('Nueva dirección creada:', direccionCreada);
          this.direcciones.push(direccionCreada);
          this.direccionSeleccionada = direccionCreada;
          this.mostrarFormularioDireccion = false;
          this.nuevaDireccion = { tipo: 'ENVIO', pais: 'Perú' }; // Resetear formulario
        },
        error: (err) => {
          console.error('Error al crear dirección:', err);
          this.errorMessage = 'No se pudo crear la nueva dirección.';
        }
      });
    } else {
      console.error('Usuario no logueado, no se puede crear dirección.');
      this.errorMessage = 'Debe iniciar sesión para guardar una nueva dirección.';
    }
  }


  // Método para finalizar la compra
  finalizarCompra() {
    if (this.isFinalizing) return;

    if (!this.carrito || !this.carrito.id) {
      console.error('No hay carrito para finalizar o no tiene ID.');
      this.errorMessage = 'No hay un carrito activo para finalizar.';
      return;
    }

    if (!this.direccionSeleccionada) {
      console.error('No se ha seleccionado una dirección.');
      this.errorMessage = 'Por favor, seleccione una dirección de envío.';
      return;
    }

    if (this.metodoSeleccionado === 'efectivo') {
      // Si es contra entrega, se puede finalizar directamente
      this.realizarPagoYFinalizar();
    } else {
      // Para otros métodos, abrir modal de pago
      this.abrirModalPago();
    }
  }

  

  realizarPagoYFinalizar() {
    if (this.carrito && this.carrito.id) {
      this.isFinalizing = true;
      this.errorMessage = null;

      // Aquí llamarías a un endpoint para crear el pedido
      // y asociarlo al carrito, dirección y método de pago.
      // Por ahora, simulamos la finalización del carrito
      this.carritoService.finalizarCompra(this.carrito.id).subscribe({
        next: () => {
          console.log('Compra finalizada exitosamente');
          this.router.navigate(['/']); // O a una página de éxito
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error al finalizar la compra:', err);
          this.isFinalizing = false;
          if (err.status === 400 || err.status === 404) {
            this.errorMessage = 'El carrito ya no es válido o no se pudo encontrar.';
          } else if (err.status === 403) {
            this.errorMessage = 'No tienes permisos para finalizar esta compra.';
          } else {
            this.errorMessage = 'Ocurrió un error inesperado al finalizar la compra.';
          }
        }
      });
    }
  }

  abrirModalPago() {
    console.log('abrirModalPago() llamado. Metodo:', this.metodoSeleccionado, 'Total:', this.getTotal()); 
    this.metodoPagoModal = this.metodoSeleccionado;
    this.totalModal = this.getTotal(); // Calcular total
    this.mostrarModalPago = true;
    console.log('mostrarModalPago ahora es:', this.mostrarModalPago);
  }

  // Método para manejar el cierre del modal
  onModalClose() {
    this.mostrarModalPago = false;
  }


  // 🔹 Método para manejar el éxito del pago desde el modal
  onPaymentSuccess(paymentData: { provider: string, transactionId: string, amount: number }) {
    console.log('Pago completado exitosamente:', paymentData);
    this.crearRegistroPago(paymentData);
  }

  // Método para crear el registro de pago (simulado por ahora)
  crearRegistroPago(paymentData: { provider: string, transactionId: string, amount: number }) {
    // Aquí llamarías a un servicio que haga la llamada HTTP a tu backend
    // para crear el pago en la tabla 'pagos'.
    console.log('Creando registro de pago en backend con datos:', paymentData);

    // Simular éxito
    setTimeout(() => {
      this.realizarPagoYFinalizar(); // Finalizar carrito después de crear el pago
    }, 500);
  }

  // Método para redirigir de vuelta al carrito
  volverAlCarrito() {
    this.router.navigate(['/cart']);
  }
}