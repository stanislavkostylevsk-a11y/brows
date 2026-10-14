import { useState, useEffect } from 'react';
import { Check, Sparkles, Clock, ShieldCheck, ArrowRight, Send, BookOpen, Video } from 'lucide-react';
import { TARIFFS } from '../data/courseData';
import { ROBOKASSA_CONFIG } from '../services/robokassa';
import Logo from './Logo';

interface TariffsSectionProps {
  onSelectTariff: (tariffId: string) => void;
}

export default function TariffsSection({ onSelectTariff }: TariffsSectionProps) {
  // Instagram promo countdown timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 42,
    seconds: 19
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (val: number) => String(val).padStart(2, '0');
  const singleTariff = TARIFFS[0];

  return (
    <section id="tariffs" className="py-16 md:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-block px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#D8C7B5] text-[#886C56] text-xs font-semibold uppercase tracking-widest mb-3">
            Стоимость обучения
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#1C1714] mb-4">
            Тариф курса «Сама себе бровист»
          </h2>
          <p className="text-sm sm:text-base text-[#665040] leading-relaxed mb-6">
            Один понятный и честный тариф со всеми материалами, теорией и практическими видео-уроками без скрытых доплат.
          </p>

          {/* Urgency Badge */}
          <div className="inline-flex items-center gap-2 bg-[#FAF7F2] border border-[#C2A992] px-4 py-2 rounded-full text-xs text-[#251D17] shadow-xs">
            <Clock className="w-4 h-4 text-[#E07A5F]" />
            <span>Спеццена для Instagram сгорает через:</span>
            <span className="font-mono font-bold text-[#D05A3F]">
              {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
            </span>
          </div>
        </div>

        {/* Single Pricing Card (Centered, high-impact) */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="rounded-3xl p-6 sm:p-10 bg-[#1C1714] text-white shadow-2xl relative border-2 border-[#E07A5F]">
            
            {/* Promo Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#E07A5F] text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase shadow-md flex items-center gap-1.5 whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ЕДИНЫЙ ТАРИФ • СПЕЦЦЕНА</span>
            </div>

            {/* Header info */}
            <div className="text-center mb-8 pt-3">
              <div className="flex justify-center mb-3">
                <Logo variant="dark" size="sm" showSubtitle={false} showText={false} />
              </div>
              <h3 className="font-editorial text-3xl sm:text-4xl font-bold text-[#FAF7F2] mb-2">
                {singleTariff.name}
              </h3>
              <p className="text-sm text-[#D8C7B5] max-w-md mx-auto">
                {singleTariff.tagline}
              </p>

              {/* Price */}
              <div className="mt-6 flex items-center justify-center gap-3">
                <span className="font-editorial text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                  {singleTariff.price.toLocaleString('ru-RU')} ₽
                </span>
                <span className="text-lg text-white/50 line-through">
                  {singleTariff.oldPrice.toLocaleString('ru-RU')} ₽
                </span>
                <span className="px-2 py-0.5 rounded bg-[#E07A5F] text-white text-xs font-bold">
                  -50%
                </span>
              </div>
              <div className="text-xs text-[#F4A261] mt-2 font-medium">
                {singleTariff.accessDuration} • Старт сразу после оплаты
              </div>
            </div>

            {/* Format quick highlights */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 mb-8 text-center text-xs">
              <div>
                <Send className="w-4 h-4 text-[#2AABEE] mx-auto mb-1" />
                <span className="text-[#FAF7F2] block font-semibold">Telegram-канал</span>
                <span className="text-[10px] text-white/60">Без платформ</span>
              </div>
              <div className="border-x border-white/10">
                <BookOpen className="w-4 h-4 text-[#E07A5F] mx-auto mb-1" />
                <span className="text-[#FAF7F2] block font-semibold">Ясная теория</span>
                <span className="text-[10px] text-white/60">Без воды</span>
              </div>
              <div>
                <Video className="w-4 h-4 text-[#E07A5F] mx-auto mb-1" />
                <span className="text-[#FAF7F2] block font-semibold">2 видео урока</span>
                <span className="text-[10px] text-white/60">Практика HD</span>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-3 mb-8">
              <div className="text-xs font-bold uppercase tracking-wider text-white/70 mb-4">
                Что включено в ваш доступ:
              </div>
              
              {singleTariff.features.map((feat, i) => (
                <div key={i} className="flex items-start gap-3 text-xs sm:text-sm">
                  <Check className="w-4 h-4 shrink-0 mt-0.5 text-[#F4A261]" />
                  <span className="text-[#FAF7F2] leading-relaxed">
                    {feat}
                  </span>
                </div>
              ))}
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                id="tariff-single-buy-btn"
                onClick={() => onSelectTariff(singleTariff.id)}
                className="w-full py-4 px-6 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg bg-[#FAF7F2] hover:bg-white text-[#1C1714] active:scale-[0.98] cursor-pointer"
              >
                <span>{singleTariff.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="text-center text-[11px] mt-3 text-white/70">
                Моментальное открытие доступа в Telegram-канал сразу после оплаты
              </div>

              {/* Official Robokassa FormSS embedded widget */}
              <div className="mt-5 pt-4 border-t border-white/15 flex flex-col items-center justify-center">
                <span className="text-[11px] uppercase tracking-wider text-white/80 font-semibold mb-2">
                  Быстрая оплата картой или СБП через Robokassa:
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
            </div>

          </div>
        </div>

        {/* Payment Safety & Guarantees */}
        <div className="max-w-2xl mx-auto p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#D8C7B5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#665040]">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#886C56] shrink-0" />
            <div>
              <strong className="text-[#1C1714] block">Официальная оплата через платежный сервис Robokassa</strong>
              <span>Банковские карты МИР, Visa, Mastercard, СБП. Электронный чек отправляется на email.</span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-[#886C56] bg-white px-3 py-1.5 rounded-lg border border-[#D8C7B5] whitespace-nowrap">
            Robokassa • Чек и гарантия
          </span>
        </div>

      </div>
    </section>
  );
}
