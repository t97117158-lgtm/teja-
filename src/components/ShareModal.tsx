import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Share2, Copy, Check, MessageSquare, ExternalLink, Sparkles } from 'lucide-react';
import { translations, LanguageCode } from '../i18n/translations';
import { shareTejaApp } from '../utils/shareApp';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  myTejaId?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  language,
  myTejaId
}) => {
  const t = translations[language];
  const [copied, setCopied] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string>('');

  const appUrl = window.location.origin;

  useEffect(() => {
    if (isOpen) {
      const shareUrl = `${appUrl}?ref=${myTejaId || ''}`;
      QRCode.toDataURL(shareUrl, {
        margin: 2,
        width: 200,
        color: {
          dark: '#051E13',
          light: '#34D399'
        }
      })
        .then(url => setQrUrl(url))
        .catch(err => console.error(err));
    }
  }, [isOpen, appUrl, myTejaId]);

  if (!isOpen) return null;

  const handleNativeShare = async () => {
    const res = await shareTejaApp({
      title: t.appName,
      text: t.tagline,
      url: appUrl,
      tejaId: myTejaId
    });
    setFeedbackMessage(res.message);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleCopyLink = async () => {
    try {
      const text = `${t.appName} - ${t.tagline}\nJoin me on TEJA with my ID: ${myTejaId || ''}\n${appUrl}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setFeedbackMessage(t.copied);
      setTimeout(() => {
        setCopied(false);
        setFeedbackMessage(null);
      }, 2500);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleWhatsApp = () => {
    const shareText = `${t.appName}: Zero-knowledge, phone-numberless messaging. 100% Free Forever.\nConnect with my TEJA ID: ${myTejaId || ''}\n${appUrl}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="w-full max-w-md bg-[#062618] border border-[#14472D] rounded-3xl p-6 text-white shadow-2xl relative flex flex-col max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#051E13] border border-[#14472D] text-emerald-400 hover:text-white"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Share2 size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              {t.shareApp}
            </h2>
            <div className="text-xs text-emerald-400 font-medium">
              Invite friends to phone-numberless security
            </div>
          </div>
        </div>

        {/* Feedback alert toast */}
        {feedbackMessage && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
            <Sparkles size={14} className="text-emerald-400" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* QR Code */}
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-emerald-400 rounded-2xl shadow-lg border border-emerald-300">
            {qrUrl ? (
              <img src={qrUrl} alt="TEJA Invite QR" className="w-40 h-40 rounded-xl" />
            ) : (
              <div className="w-40 h-40 flex items-center justify-center text-xs text-black">
                Loading...
              </div>
            )}
          </div>
        </div>

        {/* My TEJA ID Card */}
        {myTejaId && (
          <div className="bg-[#051E13] border border-[#14472D] rounded-2xl p-3 mb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-500 font-mono block">YOUR TEJA ID</span>
              <span className="text-xs font-mono font-bold text-emerald-300 tracking-wider">
                {myTejaId}
              </span>
            </div>
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-lg bg-[#08291B] border border-[#14472D] text-emerald-300 hover:text-white"
              title="Copy ID & Link"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        )}

        {/* Share Action Buttons */}
        <div className="space-y-2">
          {/* Native System Share */}
          <button
            onClick={handleNativeShare}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Share2 size={15} />
            <span>Open System Share Sheet</span>
          </button>

          {/* WhatsApp Direct Share */}
          <button
            onClick={handleWhatsApp}
            className="w-full py-2.5 bg-[#08291B] hover:bg-[#0A3320] border border-[#14472D] text-emerald-300 hover:text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare size={15} className="text-emerald-400" />
            <span>Share via WhatsApp</span>
            <ExternalLink size={12} className="opacity-60" />
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="w-full py-2.5 bg-[#051E13] border border-[#14472D] text-emerald-400 hover:text-white text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Copy size={14} />
            <span>{copied ? t.copied : 'Copy Invitation Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
