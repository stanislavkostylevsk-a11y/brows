import React from 'react';
import { ShieldCheck, CreditCard, Sparkles, ExternalLink } from 'lucide-react';
import { ROBOKASSA_CONFIG, redirectToRobokassaPayment } from '../services/robokassa';

interface RobokassaPaymentWidgetProps {
  variant?: 'card' | 'compact' | 'modal' | 'iframe-only';
  showIframe?: boolean;
  className?: string;
  buttonText?: string;
}

export const RobokassaPaymentWidget: React.FC<RobokassaPaymentWidgetProps> = ({
  variant = 'compact',
  showIframe = true,
  className = '',
  buttonText = 'Оплатить 1 490 ₽ через Robokassa'
}) => {
  if (variant === 'iframe-only') {
    return (
      <div className={`flex justify-center items-center py-2 ${className}`}>
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
          title="Оплата через Robokassa"
        />
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div className={`space-y-4 rounded-2xl bg-white p-4 sm:p-5 border border-[#EAE1D7] shadow-xs text-center ${className}`}>
        <div className="flex items-center justify-between border-b border-[#EAE1D7] pb-3 text-left">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E07A5F]/10 text-[#E07A5F] flex items-center justify-center font-bold text-xs">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#1C1714]">Официальная оплата Robokassa</div>
              <div className="text-[10px] text-[#886C56]">Карты МИР, Visa, Mastercard, СБП</div>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#2E7D32] bg-[#2E7D32]/10 px-2 py-0.5 rounded-full">
            1 490 ₽
          </span>
        </div>

        {/* Primary Robokassa direct payment button */}
        <a
          href={ROBOKASSA_CONFIG.directPaymentUrl}
          className="w-full py-3.5 px-5 rounded-xl bg-[#1C1714] hover:bg-[#322A24] text-[#FAF7F2] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4 text-[#E07A5F]" />
          <span>{buttonText}</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </a>

        {/* Official embedded Robokassa FormSS iframe button */}
        {showIframe && (
          <div className="pt-2 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase tracking-wider text-[#886C56] font-semibold mb-1">
              Или нажмите официальную кнопку Robokassa:
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
        )}

        <div className="flex items-center justify-center gap-2 text-[10px] text-[#886C56] pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
          <span>Платежи защищены по стандарту PCI DSS и протоколу 3D-Secure</span>
        </div>
      </div>
    );
  }

  // Default / compact variant
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <a
        href={ROBOKASSA_CONFIG.directPaymentUrl}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FAF7F2] hover:bg-white text-[#1C1714] font-bold text-xs uppercase tracking-wider border border-[#D8C7B5] shadow-xs hover:shadow transition-all active:scale-[0.98]"
      >
        <CreditCard className="w-4 h-4 text-[#E07A5F]" />
        <span>{buttonText}</span>
        <ExternalLink className="w-3.5 h-3.5 opacity-60" />
      </a>

      {showIframe && (
        <div className="w-[280px] h-[70px] overflow-hidden flex items-center justify-center">
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
            title="Официальная форма Robokassa"
          />
        </div>
      )}
    </div>
  );
};

export default RobokassaPaymentWidget;
