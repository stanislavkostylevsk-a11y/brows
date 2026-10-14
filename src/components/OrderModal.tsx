import React, { useState } from 'react';
import { X, Check, Sparkles, ShieldCheck, Instagram, Send, ArrowRight, BookOpen, Video, CreditCard } from 'lucide-react';
import { TARIFFS, AUTHOR_INFO } from '../data/courseData';
import { ROBOKASSA_CONFIG } from '../services/robokassa';
import Logo from './Logo';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTariffId?: string;
  onOpenLegal?: (type: 'offer' | 'refund' | 'privacy' | 'requisites') => void;
}

export default function OrderModal({ isOpen, onClose, onOpenLegal }: OrderModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [promoCode] = useState('INSTA50');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  if (!isOpen) return null;

  const currentTariff = TARIFFS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setIsSubmitting(true);

    const generatedOrder = 'AM-' + Math.floor(100000 + Math.random() * 900000);
    setOrderNumber(generatedOrder);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      // Open Robokassa payment invoice for the user
      window.open(ROBOKASSA_CONFIG.directPaymentUrl, '_blank');
    }, 600);
  };

  const handleMessengerCheckout = (platform: 'instagram' | 'telegram') => {
    const text = encodeURIComponent(
      `Здравствуйте, Амалия! Хочу занять место на курсе «Сама себе бровист». Тариф: «${currentTariff.name}» (${currentTariff.price} ₽). Мой контакт: ${phone || 'не указан'}, Instagram: ${instagram || 'не указан'}`
    );

    if (platform === 'telegram') {
      window.open(`https://t.me/AmiAmii23?text=${text}`, '_blank');
    } else {
      window.open(AUTHOR_INFO.instagramUrl, '_blank');
    }
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
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#FAF7F2] hover:bg-[#EAE1D7] text-[#251D17] flex items-center justify-center transition-colors border border-[#D8C7B5]"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {isSuccess ? (
            /* Success confirmation screen */
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center mx-auto border-2 border-[#2E7D32]">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-[#886C56] font-semibold">
                  Заказ № {orderNumber} успешно оформлен!
                </span>
                <h4 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1C1714] mt-1">
                  Добро пожаловать на курс, {name}!
                </h4>
                <p className="text-xs sm:text-sm text-[#665040] mt-2 max-w-md mx-auto leading-relaxed">
                  Мы забронировали за вами спеццену <strong>{currentTariff.price.toLocaleString('ru-RU')} ₽</strong> по тарифу «{currentTariff.name}».
                </p>
              </div>

              {/* Instant access card */}
              <div className="bg-white p-5 rounded-2xl border border-[#D8C7B5] text-left space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1C1714]">
                  <Sparkles className="w-4 h-4 text-[#E07A5F]" />
                  <span>Что происходит дальше:</span>
                </div>
                
                <div className="text-xs text-[#554336] space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[#886C56]">1.</span>
                    <span>Ссылка-приглашение в закрытый Telegram-канал с материалами курса и 2 практическими видео отправлена на номер <strong>{phone}</strong> в WhatsApp/Telegram.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[#886C56]">2.</span>
                    <span>Таблицы готовых миксов, выдержки и список материалов со ссылками уже закреплены в канале.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[#886C56]">3.</span>
                    <span>Вы можете вступить в закрытый канал и приступать к первому теоретическому уроку прямо сейчас!</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
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

                <a
                  href={AUTHOR_INFO.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#2AABEE] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-105 transition-all shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Открыть закрытый Telegram-канал</span>
                </a>

                <button
                  onClick={onClose}
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
                      type="text"
                      placeholder="Ваш ник в Instagram (например, @amaliya)"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 rounded-xl bg-white border border-[#D8C7B5] focus:outline-hidden focus:border-[#1C1714] text-sm text-[#1C1714] placeholder:text-[#A88B72]"
                    />
                    <Instagram className="w-4 h-4 text-[#C13584] absolute left-3 top-3.5" />
                  </div>
                  <span className="text-[10px] text-[#886C56] mt-1 block pl-1">
                    Для связи и персональных рекомендаций от Амалии
                  </span>
                </div>
              </div>

              {/* Promo code bar */}
              <div className="bg-white p-3 rounded-xl border border-[#EAE1D7] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#665040]">Спеццена:</span>
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
                    <span>Оплатить {currentTariff.price.toLocaleString('ru-RU')} ₽ через Robokassa</span>
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
                      backgroundColor: 'transparent'
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
                  <button
                    type="button"
                    onClick={() => handleMessengerCheckout('telegram')}
                    className="py-2.5 px-3 rounded-xl border border-[#D8C7B5] bg-white hover:bg-[#FAF7F2] text-xs font-semibold text-[#251D17] flex items-center justify-center gap-2 transition-colors"
                  >
                    <Send className="w-4 h-4 text-[#2AABEE]" />
                    <span>В Telegram</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMessengerCheckout('instagram')}
                    className="py-2.5 px-3 rounded-xl border border-[#D8C7B5] bg-white hover:bg-[#FAF7F2] text-xs font-semibold text-[#251D17] flex items-center justify-center gap-2 transition-colors"
                  >
                    <Instagram className="w-4 h-4 text-[#C13584]" />
                    <span>В Instagram Direct</span>
                  </button>
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

