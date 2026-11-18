import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Sparkles,
  ShieldCheck,
  Instagram,
  Send,
  ArrowRight,
  BookOpen,
  Video,
  CreditCard,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { TARIFFS, AUTHOR_INFO } from '../data/courseData';
import {
  ROBOKASSA_CONFIG,
  registerPendingOrder,
  fetchOrderStatus,
  clearPendingOrderLocal,
} from '../services/robokassa';
import Logo from './Logo';

export interface PaymentSuccessState {
  orderNumber: string;
  email: string;
  emailDelivered: boolean;
  telegramChannelUrl: string;
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTariffId?: string;
  onOpenLegal?: (type: 'offer' | 'refund' | 'privacy' | 'requisites') => void;
  paymentSuccessState?: PaymentSuccessState | null;
}

export default function OrderModal({
  isOpen,
  onClose,
  onOpenLegal,
  paymentSuccessState,
}: OrderModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [promoCode] = useState('INSTA50');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isOrderCreated, setIsOrderCreated] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [confirmedPayment, setConfirmedPayment] =
    useState<PaymentSuccessState | null>(paymentSuccessState || null);

  useEffect(() => {
    if (paymentSuccessState) {
      setConfirmedPayment(paymentSuccessState);
    }
  }, [paymentSuccessState]);

  // Poll order status while waiting for Robokassa ResultURL callback
  useEffect(() => {
    if (!isOpen || !isOrderCreated || !orderNumber || confirmedPayment) return;

    const interval = setInterval(async () => {
      try {
        const statusData = await fetchOrderStatus(orderNumber);
        if (
          statusData &&
          statusData.status === 'paid' &&
          statusData.telegramChannelUrl
        ) {
          clearPendingOrderLocal();
          setConfirmedPayment({
            orderNumber: statusData.orderNumber,
            email: statusData.email || email,
            emailDelivered: statusData.emailDelivered,
            telegramChannelUrl: statusData.telegramChannelUrl,
          });
        }
      } catch {
        // Ignore transient polling errors
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen, isOrderCreated, orderNumber, confirmedPayment, email]);

  if (!isOpen) return null;

  const currentTariff = TARIFFS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const generatedOrder = 'AM-' + Math.floor(100000 + Math.random() * 900000);

    try {
      const response = await registerPendingOrder({
        orderNumber: generatedOrder,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        tariffId: currentTariff.id,
        amount: currentTariff.price,
      });

      setOrderNumber(response.orderNumber || generatedOrder);
      setIsOrderCreated(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Не удалось оформить заявку';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildMessengerUrl = (platform: 'instagram' | 'telegram') => {
    if (platform === 'telegram') {
      const text = encodeURIComponent(
        `Здравствуйте, Амалия! Хочу занять место на курсе «Сама себе бровист». Тариф: «${currentTariff.name}» (${currentTariff.price} ₽). Мой контакт: ${phone || 'не указан'}, Email: ${email || 'не указан'}`
      );
      return `https://t.me/AmiAmii23?text=${text}`;
    }
    return AUTHOR_INFO.instagramUrl;
  };

  const handleClose = () => {
    if (confirmedPayment) {
      setConfirmedPayment(null);
      setIsOrderCreated(false);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#D8C7B5] overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close button & Logo */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#EAE1D7] flex items-center justify-between shrink-0">
          <Logo variant="light" size="sm" showSubtitle={false} />

          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-[#FAF7F2] hover:bg-[#EAE1D7] text-[#251D17] flex items-center justify-center transition-colors border border-[#D8C7B5]"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {confirmedPayment ? (
            /* Post-payment confirmed screen */
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center mx-auto border-2 border-[#2E7D32]">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-[#2E7D32] font-semibold">
                  Оплата заказа № {confirmedPayment.orderNumber} подтверждена
                </span>
                <h4 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1C1714] mt-1">
                  Рады приветствовать вас!
                </h4>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#D8C7B5] text-left space-y-3 shadow-xs">
                <p className="text-xs sm:text-sm text-[#251D17] leading-relaxed">
                  Спасибо, что стали частью нашего курса! ✨
                  <br />
                  Скоро вы будете с лёгкостью оформлять брови и уверенно применять новые навыки.
                </p>

                {confirmedPayment.email && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE1D7] text-xs text-[#554336]">
                    <Mail className="w-4 h-4 text-[#886C56] shrink-0 mt-0.5" />
                    <span>
                      {confirmedPayment.emailDelivered
                        ? 'Ссылка в закрытый Telegram‑канал продублирована на ваш email: '
                        : 'Доступ подготовлен для вашего email: '}
                      <strong className="text-[#1C1714]">
                        {confirmedPayment.email}
                      </strong>
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <a
                  href={confirmedPayment.telegramChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-[#1C1714] hover:bg-[#322A24] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <Send className="w-4 h-4 text-[#2AABEE]" />
                  <span>Присоединиться к закрытому Telegram‑каналу</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                <button
                  onClick={handleClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#D8C7B5] text-[#251D17] text-xs font-semibold hover:bg-[#FAF7F2] transition-colors"
                >
                  Вернуться на сайт
                </button>
              </div>
            </div>
          ) : isOrderCreated ? (
            /* Awaiting payment confirmation screen */
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center mx-auto border-2 border-[#2E7D32]">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-[#886C56] font-semibold">
                  Заказ № {orderNumber} оформлен
                </span>
                <h4 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1C1714] mt-1">
                  Завершите оплату, {name}
                </h4>
                <p className="text-xs sm:text-sm text-[#665040] mt-2 max-w-md mx-auto leading-relaxed">
                  Мы зафиксировали за вами спеццену{' '}
                  <strong>{currentTariff.price.toLocaleString('ru-RU')} ₽</strong>{' '}
                  по тарифу «{currentTariff.name}».
                </p>
              </div>

              {/* Next steps card */}
              <div className="bg-white p-5 rounded-2xl border border-[#D8C7B5] text-left space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1C1714]">
                  <Sparkles className="w-4 h-4 text-[#E07A5F]" />
                  <span>Что происходит после оплаты:</span>
                </div>

                <div className="text-xs text-[#554336] space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[#886C56]">1.</span>
                    <span>
                      Перейдите к оплате через защищённый сервис Robokassa (Карта РФ или СБП).
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[#886C56]">2.</span>
                    <span>
                      Сразу после подтверждения оплаты ссылка-приглашение в закрытый Telegram‑канал курса будет автоматически отправлена на ваш email{' '}
                      <strong className="text-[#1C1714]">{email}</strong>.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[#886C56]">3.</span>
                    <span>
                      В канале уже закреплены теоретические материалы, 2 практических видео, таблицы готовых миксов и список материалов.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <a
                  href={ROBOKASSA_CONFIG.directPaymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-[#1C1714] hover:bg-[#322A24] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <CreditCard className="w-4 h-4 text-[#E07A5F]" />
                  <span>Перейти к защищенной оплате Robokassa • 1 490 ₽</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <div className="p-3 rounded-2xl bg-white border border-[#EAE1D7] flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] uppercase tracking-wider text-[#886C56] font-semibold mb-1">
                    Или используйте кнопку быстрой оплаты Robokassa:
                  </span>
                  <div className="w-[280px] h-[70px] overflow-hidden flex items-center justify-center bg-transparent">
                    <iframe
                      src={ROBOKASSA_CONFIG.iframeSrc}
                      width="280"
                      height="70"
                      style={{
                        border: 0,
                        width: '280px',
                        height: '70px',
                        overflow: 'hidden',
                        backgroundColor: 'transparent',
                      }}
                      title="Официальная форма оплаты Robokassa"
                    />
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#D8C7B5] text-[#251D17] text-xs font-semibold hover:bg-[#FAF7F2] transition-colors"
                >
                  Вернуться на сайт
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Tariff summary box */}
              <div className="bg-[#1C1714] text-white rounded-2xl p-4 sm:p-5 border border-[#1C1714] shadow-md">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F4A261] bg-white/10 px-2.5 py-0.5 rounded-full">
                      Тариф обучения
                    </span>
                    <h4 className="font-editorial text-2xl font-bold text-[#FAF7F2] mt-1.5">
                      {currentTariff.name}
                    </h4>
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-bold font-editorial text-white">
                      {currentTariff.price.toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="text-xs text-white/50 line-through">
                      {currentTariff.oldPrice.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#D8C7B5] mb-3">
                  {currentTariff.tagline}
                </p>

                <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-[#FAF7F2]">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#E07A5F]" />
                    Ясная теория
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-[#E07A5F]" />
                    2 видео урока
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-[#2AABEE]" />
                    В Telegram-канале
                  </span>
                </div>
              </div>

              {/* Contact info inputs */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#886C56]">
                  Данные для открытия доступа к курсу:
                </label>

                <div>
                  <input
                    type="text"
                    required
                    placeholder="Ваше имя *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#D8C7B5] focus:outline-hidden focus:border-[#1C1714] text-sm text-[#1C1714] placeholder:text-[#A88B72]"
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    required
                    placeholder="Телефон для Telegram / SMS *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#D8C7B5] focus:outline-hidden focus:border-[#1C1714] text-sm text-[#1C1714] placeholder:text-[#A88B72]"
                  />
                </div>

                <div>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="Ваш Email *"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 rounded-xl bg-white border border-[#D8C7B5] focus:outline-hidden focus:border-[#1C1714] text-sm text-[#1C1714] placeholder:text-[#A88B72]"
                    />
                    <Mail className="w-4 h-4 text-[#886C56] absolute left-3 top-3.5" />
                  </div>
                  <span className="text-[10px] text-[#886C56] mt-1 block pl-1">
                    На этот email после оплаты придет чек и ссылка на закрытый Telegram‑канал
                  </span>
                </div>
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  {submitError}
                </div>
              )}

              {/* Promo code bar */}
              <div className="bg-white p-3 rounded-xl border border-[#EAE1D7] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#665040]">
                    Спеццена:
                  </span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#EAE1D7] rounded text-[#251D17]">
                    {promoCode}
                  </span>
                </div>
                <span className="text-xs font-bold text-[#2E7D32]">
                  Скидка 50% применена
                </span>
              </div>

              {/* Primary Online Checkout Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-xl bg-[#1C1714] hover:bg-[#322A24] active:scale-[0.98] text-[#FAF7F2] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#E07A5F]" />
                    <span>
                      Оплатить {currentTariff.price.toLocaleString('ru-RU')} ₽ через Robokassa
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Official Robokassa FormSS embedded widget */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#EAE1D7] flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase tracking-wider text-[#886C56] font-semibold mb-1">
                  Официальная форма быстрой оплаты Robokassa:
                </span>
                <div className="w-[280px] h-[70px] overflow-hidden flex items-center justify-center bg-transparent">
                  <iframe
                    src={ROBOKASSA_CONFIG.iframeSrc}
                    width="280"
                    height="70"
                    style={{
                      border: 0,
                      width: '280px',
                      height: '70px',
                      overflow: 'hidden',
                      backgroundColor: 'transparent',
                    }}
                    title="Официальная форма оплаты Robokassa"
                  />
                </div>
              </div>

              {/* Alternative Instagram & Messenger Booking */}
              <div className="pt-2 border-t border-[#EAE1D7]">
                <div className="text-center text-xs text-[#886C56] mb-3">
                  Или напишите напрямую автору для оплаты:
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={buildMessengerUrl('telegram')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl border border-[#D8C7B5] bg-white hover:bg-[#FAF7F2] text-xs font-semibold text-[#251D17] flex items-center justify-center gap-2 transition-colors"
                  >
                    <Send className="w-4 h-4 text-[#2AABEE]" />
                    <span>В Telegram</span>
                  </a>

                  <a
                    href={buildMessengerUrl('instagram')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl border border-[#D8C7B5] bg-white hover:bg-[#FAF7F2] text-xs font-semibold text-[#251D17] flex items-center justify-center gap-2 transition-colors"
                  >
                    <Instagram className="w-4 h-4 text-[#C13584]" />
                    <span>В Instagram Direct</span>
                  </a>
                </div>
              </div>

              <div className="text-center text-[11px] text-[#886C56] flex flex-wrap items-center justify-center gap-1 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Нажимая кнопку, вы соглашаетесь с</span>
                <button
                  type="button"
                  onClick={() => onOpenLegal?.('offer')}
                  className="underline hover:text-[#1C1714] font-medium"
                >
                  офертой
                </button>
                <span>,</span>
                <button
                  type="button"
                  onClick={() => onOpenLegal?.('refund')}
                  className="underline hover:text-[#1C1714] font-medium"
                >
                  условиями возврата
                </button>
                <span>и</span>
                <button
                  type="button"
                  onClick={() => onOpenLegal?.('privacy')}
                  className="underline hover:text-[#1C1714] font-medium"
                >
                  политикой конфиденциальности
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
