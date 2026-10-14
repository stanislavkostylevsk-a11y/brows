import { Sparkles, CheckCircle2, Instagram, ArrowRight, ShieldCheck } from 'lucide-react';
import { AUTHOR_INFO, AUTHOR_PHOTOS, COURSE_ABOUT } from '../data/courseData';
import Logo from './Logo';

interface HeroProps {
  onOpenOrder: (tariffId?: string) => void;
  onOpenDirectChat: () => void;
  onPlayVideoModal?: () => void;
}

export default function Hero({ onOpenOrder, onOpenDirectChat }: HeroProps) {
  return (
    <section id="hero-section" className="relative pt-6 pb-16 md:py-20 overflow-hidden bg-radial from-[#FAF7F2] via-[#F4EFEA] to-[#EAE1D7]/50">
      {/* Subtle organic background elements */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#E8D7C8]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-32 w-80 h-80 bg-[#DFCFBE]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Offer, Copy & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-center text-center">
            
            {/* Instagram Story pill badge with Logo emblem */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#1C1714] text-[#FAF7F2] text-xs font-semibold mb-6 shadow-sm mx-auto border border-[#3A2F27]">
              <Logo variant="dark" size="xs" showSubtitle={false} showText={false} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F] animate-pulse" />
              <span>AMALIA BROWS • Онлайн мини-курс</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-bold text-[#1C1714] leading-[1.15] tracking-tight mb-5 text-center">
              Мини-курс <br className="hidden sm:inline" />
              <span className="italic font-normal text-[#886C56]">«Сама себе бровист»</span>
            </h1>

            {/* Subtitle with user exact description */}
            <p className="text-base sm:text-lg text-[#554336] leading-relaxed max-w-2xl mb-7 font-normal text-center">
              {COURSE_ABOUT.description}
            </p>

            {/* Value bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl mb-8 text-left">
              {[
                'Подбор идеальной формы без трафаретов',
                'Разбор колористики: окрашивание краской и хной',
                'Готовые миксы оттенков и точные выдержки',
                'Закрытый Telegram-канал + 2 видео материала',
                'Безопасная коррекция без перещипывания',
                'Возможность аккуратно оформлять брови близким'
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#382C23] justify-start sm:justify-start">
                  <CheckCircle2 className="w-4 h-4 text-[#886C56] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Price & Primary CTAs */}
            <div className="w-full max-w-lg bg-[#FAF7F2] p-4 sm:p-5 rounded-2xl border border-[#D8C7B5] shadow-xs mb-6 mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 pb-3 border-b border-[#EAE1D7] text-center sm:text-left">
                <div className="flex flex-col items-center sm:items-start">
                  <div className="text-xs text-[#886C56] font-medium">Тариф «Я сама»:</div>
                  <div className="flex items-baseline gap-2.5 justify-center sm:justify-start">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#1C1714]">1 490 ₽</span>
                    <span className="text-sm text-[#A88B72] line-through">2 990 ₽</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-[#E07A5F]/15 text-[#D05A3F] font-bold">
                      -50%
                    </span>
                  </div>
                </div>
                <div className="text-center sm:text-right text-[11px] text-[#665040]">
                  <span className="inline-block px-2 py-1 rounded bg-[#EAE1D7] font-semibold text-[#251D17]">
                    Старт сразу после оплаты
                  </span>
                  <div className="mt-1 text-[#886C56]">Теория + 2 видео-урока</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  id="hero-enroll-btn"
                  onClick={() => onOpenOrder('solo')}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#1C1714] text-[#FAF7F2] font-bold text-sm tracking-wide uppercase hover:bg-[#322A24] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#E07A5F]" />
                  <span>Купить курс за 1 490 ₽</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Trust and Guarantee indicator */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs text-[#665040] mx-auto">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#886C56]" />
                <span>Четкий пошаговый алгоритм</span>
              </div>
              <span className="hidden sm:inline text-[#D8C7B5]">•</span>
              <div className="flex items-center gap-1.5 text-[#251D17]">
                <span>Оплата Robokassa (СБП, Карты РФ)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Showcase (Amaliya Portrait + Studio Showcase) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none">
              
              {/* Main Photo Card */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-[#EAE1D7] aspect-3/4">
                <img
                  src={AUTHOR_PHOTOS.portrait}
                  onError={(e) => {
                    e.currentTarget.src = AUTHOR_PHOTOS.portraitFallback;
                  }}
                  alt="Амалия — автор курса Сама себе бровист"
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1714]/85 via-transparent to-black/15" />

                {/* Top Instagram Handle Pill */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <a
                    href={AUTHOR_INFO.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-black/60 hover:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 text-white text-xs border border-white/20 transition-colors"
                    title={`Instagram: @${AUTHOR_INFO.instagram}`}
                  >
                    <div className="w-2 h-2 rounded-full bg-[#25D366]" />
                    <span className="font-medium">Амалия • @{AUTHOR_INFO.instagram}</span>
                  </a>
                  <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[#1C1714] text-[11px] font-bold">
                    6 лет опыта
                  </div>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-xs text-[#EAE1D7] uppercase tracking-widest font-semibold mb-1">
                    Автор курса «Сама себе бровист»
                  </p>
                  <h3 className="font-editorial text-2xl font-bold leading-tight">
                    Амалия
                  </h3>
                  <p className="text-xs text-white/90 mt-1">
                    «Научу вас оформлять брови самостоятельно: подбирать форму, делать коррекцию и окрашивание».
                  </p>
                </div>
              </div>

              {/* Floating Studio Card */}
              <div className="absolute -bottom-6 -left-4 sm:-left-6 bg-white rounded-2xl p-3.5 shadow-xl border border-[#EAE1D7] max-w-[240px] z-20 hidden sm:block">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#FAF7F2] text-[10px] font-bold uppercase text-[#886C56]">
                    Практика в студии
                  </span>
                  <span className="text-[10px] text-[#A88B72] font-mono">2 видео</span>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-[#EAE1D7]">
                    <img
                      src={AUTHOR_PHOTOS.studioWork}
                      onError={(e) => {
                        e.currentTarget.src = AUTHOR_PHOTOS.studioWorkFallback;
                      }}
                      alt="Амалия за работой"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-[#1C1714]">Понятные видео-уроки</div>
                    <div className="text-[11px] text-[#886C56]">Краска + хна + форма</div>
                  </div>
                </div>
              </div>

              {/* Floating Instagram Direct Badge */}
              <div className="absolute -top-4 -right-2 sm:-right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-[#EAE1D7] max-w-[190px] z-20">
                <button
                  onClick={onOpenDirectChat}
                  className="flex items-center gap-2 text-left w-full hover:opacity-85 transition-opacity"
                >
                  <div className="w-8 h-8 rounded-full bg-[#E07A5F]/15 flex items-center justify-center text-[#C13584] shrink-0">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#886C56] font-semibold">Связь с Амалией</div>
                    <div className="text-xs font-bold text-[#1C1714]">Написать в Direct</div>
                  </div>
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
