/**
 * Официальная интеграция платежного сервиса Robokassa
 * Онлайн-курс «Сама себе бровист» (Тариф «Я сама» — 1 490 ₽)
 */

export const ROBOKASSA_CONFIG = {
  // Идентификатор инвойса в системе Robokassa
  encodedInvoiceId: 'TwY703ZivEKOThvUrgb5Dw',
  
  // Официальный скрипт платежного виджета Robokassa FormSS
  scriptSrc: 'https://auth.robokassa.ru/Merchant/PaymentForm/FormSS.js?EncodedInvoiceId=TwY703ZivEKOThvUrgb5Dw',
  
  // Прямой URL фрейма платежной формы Robokassa
  iframeSrc: 'https://auth.robokassa.ru/Merchant/PaymentForm/FormSS.if?EncodedInvoiceId=TwY703ZivEKOThvUrgb5Dw',
  
  // Прямая платежная ссылка на защищенную страницу оплаты Robokassa
  directPaymentUrl: 'https://auth.robokassa.ru/merchant/Invoice/TwY703ZivEKOThvUrgb5Dw',

  // Параметры курса
  courseTitle: 'Онлайн-курс «Сама себе бровист»',
  tariffName: 'Тариф «Я сама»',
  price: 1490,
  currency: 'RUB',
};

export interface PendingOrderData {
  orderNumber: string;
  name: string;
  phone: string;
  email: string;
  tariffId?: string;
  amount?: number;
}

export interface OrderStatusResponse {
  orderNumber: string;
  status: 'pending' | 'paid';
  email: string;
  emailSent: boolean;
  emailDelivered: boolean;
  telegramChannelUrl?: string;
}

export interface ConfirmSuccessPayload {
  outSum?: string;
  invId?: string;
  signatureValue?: string;
  shpParams?: Record<string, string>;
  orderNumber?: string;
  email?: string;
  name?: string;
}

export interface ConfirmSuccessResponse {
  success: boolean;
  alreadySent?: boolean;
  emailSent: boolean;
  emailDelivered: boolean;
  email: string;
  orderNumber: string;
  telegramChannelUrl: string;
}

const PENDING_ORDER_KEY = 'amaliya_pending_order';

export function savePendingOrderLocal(order: PendingOrderData): void {
  try {
    localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(order));
  } catch {
    // Ignore storage quota / privacy mode errors
  }
}

export function getPendingOrderLocal(): PendingOrderData | null {
  try {
    const raw = localStorage.getItem(PENDING_ORDER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingOrderData;
  } catch {
    return null;
  }
}

export function clearPendingOrderLocal(): void {
  try {
    localStorage.removeItem(PENDING_ORDER_KEY);
  } catch {
    // Ignore
  }
}

export async function registerPendingOrder(
  order: PendingOrderData
): Promise<{ success: boolean; orderNumber: string }> {
  savePendingOrderLocal(order);
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (res.status === 400) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Проверьте корректность введенных данных');
    }
    if (res.ok) {
      return res.json();
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('Проверьте')) {
      throw err;
    }
  }
  return { success: true, orderNumber: order.orderNumber };
}

export async function fetchOrderStatus(
  orderNumber: string
): Promise<OrderStatusResponse | null> {
  const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}/status`);
  if (!res.ok) return null;
  return res.json();
}

export async function confirmRobokassaSuccess(
  payload: ConfirmSuccessPayload
): Promise<ConfirmSuccessResponse> {
  const res = await fetch('/api/robokassa/confirm-success', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Не удалось подтвердить оплату');
  }
  return res.json();
}

/**
 * Перенаправляет пользователя на официальную защищенную страницу оплаты Robokassa
 */
export function redirectToRobokassaPayment(): void {
  window.location.href = ROBOKASSA_CONFIG.directPaymentUrl;
}
