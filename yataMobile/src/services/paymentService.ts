// src/services/paymentService.ts
// Helper para llamar al microservicio de Pagos desde cualquier pantalla
import { API_URLS } from '../config/apiConfig';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'cash';

export interface Payment {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  card_last4: string | null;
  generate_receipt: boolean;
  gateway_reference: string | null;
  failure_reason: string | null;
}

const BASE = `${API_URLS.PAYMENT_SERVICE}/payments`;

/** Consultar un pago por su ID */
export async function getPayment(paymentId: string): Promise<Payment> {
  const res = await fetch(`${BASE}/${paymentId}`);
  if (!res.ok) throw new Error(`Pago no encontrado: ${res.status}`);
  return res.json();
}

/** Consultar el pago asociado a una orden */
export async function getPaymentByOrder(orderId: string): Promise<Payment | null> {
  const res = await fetch(`${BASE}/order/${orderId}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Error al buscar pago: ${res.status}`);
  return res.json();
}

/** Historial de pagos de un usuario (para HistorialScreen) */
export async function getUserPaymentHistory(userId: string): Promise<Payment[]> {
  const res = await fetch(`${BASE}/user/${userId}/history`);
  if (!res.ok) throw new Error(`Error al obtener historial: ${res.status}`);
  return res.json();
}

/** Staff: confirmar pago en efectivo */
export async function confirmCashPayment(paymentId: string): Promise<Payment> {
  const res = await fetch(`${BASE}/${paymentId}/confirm-cash`, { method: 'PATCH' });
  if (!res.ok) throw new Error(`Error al confirmar efectivo: ${res.status}`);
  return res.json();
}

/** Reembolsar un pago completado */
export async function refundPayment(paymentId: string): Promise<Payment> {
  const res = await fetch(`${BASE}/${paymentId}/refund`, { method: 'PATCH' });
  if (!res.ok) throw new Error(`Error al reembolsar: ${res.status}`);
  return res.json();
}

/** Etiqueta legible del estado del pago */
export function getPaymentStatusLabel(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    pending:   'Pendiente (efectivo)',
    completed: 'Pago completado',
    failed:    'Pago fallido',
    refunded:  'Reembolsado',
  };
  return labels[status] ?? status;
}