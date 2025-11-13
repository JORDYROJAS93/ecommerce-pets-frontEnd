import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-modal.html',
  styleUrl: './payment-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentModalComponent {
  @Input() isVisible: boolean = false; // Controla la visibilidad del modal
   @Input() metodoPagoSeleccionado: string = '';
  @Input() totalAmount: number = 0;
  @Output() onClose = new EventEmitter<void>(); // Emite evento cuando se cierra
  @Output() onPaymentSuccess = new EventEmitter<{ provider: string, transactionId: string, amount: number }>(); // Emite datos cuando se completa el pago


  yapePhone: string = '';
  plinPhone: string = '';
  cardNumber: string = '';
  cardExpiry: string = '';
  cardCvc: string = '';
  cardName: string = '';


  closeModal() {
    this.isVisible = false;
    this.onClose.emit(); // Emitir evento de cierre
  }

  confirmPayment() {
    // Lógica para confirmar el pago según el método seleccionado
    // Aquí iría la integración real con Culqi, PayPal, Yape, Plin, etc.
    // Por ahora, simulamos un pago exitoso

    let paymentData = {
      provider: this.metodoPagoSeleccionado,
      transactionId: `TXN_${Date.now()}`, // ID de transacción simulado
      amount: this.totalAmount
    };

    console.log('Confirmar pago para:', this.metodoPagoSeleccionado, 'con datos:', paymentData);

    // Simular éxito del pago
    setTimeout(() => {
      this.onPaymentSuccess.emit(paymentData); // Emitir datos del pago exitoso
      this.closeModal(); // Cerrar el modal
    }, 1000); // Simular demora
  }

}
