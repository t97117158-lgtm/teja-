import React, { useState } from 'react';
import { Heart, X, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { translations, LanguageCode } from '../i18n/translations';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
}

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose, language }) => {
  const t = translations[language];
  const [selectedAmount, setSelectedAmount] = useState<number | null>(250);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const amounts = [100, 250, 500, 1000];

  const handleContribute = () => {
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2800);
  };

  const currentAmt = customAmount ? customAmount : selectedAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="w-full max-w-md bg-[#062618] border border-[#14472D] rounded-3xl p-6 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#051E13] border border-[#14472D] text-emerald-400 hover:text-white"
        >
          <X size={16} />
        </button>

        {isSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-lg font-bold text-white">Thank You for Supporting TEJA!</h3>
            <p className="text-xs text-emerald-300 leading-relaxed max-w-xs">
              Your voluntary contribution of ₹{currentAmt} keeps TEJA 100% free, open, and private for everyone with zero telemetry.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Heart size={24} className="fill-emerald-400/30" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  {t.supportUs}
                </h2>
                <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                  <Sparkles size={11} />
                  <span>{t.freeForeverBadge}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-emerald-200/90 leading-relaxed mb-5">
              {t.donationsNotice}
            </p>

            {/* Presets Grid */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {amounts.map(amt => (
                <button
                  key={amt}
                  onClick={() => {
                    setSelectedAmount(amt);
                    setCustomAmount('');
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                    selectedAmount === amt && !customAmount
                      ? 'bg-emerald-500 text-black shadow-md'
                      : 'bg-[#08291B] border border-[#14472D] text-emerald-200 hover:border-emerald-500/50'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            {/* Custom Amount Input */}
            <div className="mb-6">
              <input
                type="number"
                placeholder="Custom Amount (₹)"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                className="w-full bg-[#051E13] border border-[#14472D] rounded-xl px-4 py-2.5 text-xs text-white placeholder-emerald-700/80 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Submit Action */}
            <button
              onClick={handleContribute}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 cursor-pointer"
            >
              <ShieldCheck size={16} />
              <span>Contribute ₹{currentAmt || 250} Securely</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
