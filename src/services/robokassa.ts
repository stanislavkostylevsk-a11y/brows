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

/**
 * Перенаправляет пользователя на официальную защищенную страницу оплаты Robokassa
 */
export function redirectToRobokassaPayment(): void {
  try {
    window.location.href = ROBOKASSA_CONFIG.directPaymentUrl;
  } catch {
    window.open(ROBOKASSA_CONFIG.directPaymentUrl, '_blank');
  }
}
