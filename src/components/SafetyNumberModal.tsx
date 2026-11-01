import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, ShieldCheck, Check, Copy } from 'lucide-react';
import { Contact, UserIdentity } from '../types';
import { translations, LanguageCode } from '../i18n/translations';

interface SafetyNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  identity: UserIdentity | null;
  currentLanguage: LanguageCode;
}

export const SafetyNumberModal: React.FC<SafetyNumberModalProps> = ({
  isOpen,
  onClose,
  contact,
  identity,
  currentLanguage
}) => {
  const t = translations[currentLanguage];
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (contact && identity) {
      const qrPayload = JSON.stringify({
        app: 'TEJA',
        v: 1,
        sender: identity.tejaId,
        recipient: contact.tejaId,
        safetyNumber: contact.safetyNumber
      });

      QRCode.toDataURL(qrPayload, {
        margin: 2,
        width: 220,
        color: {
          dark: '#051E13',
          light: '#34D399'
        }
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error(err));
    }
  }, [contact, identity]);

  if (!isOpen || !contact) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contact.safetyNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="w-full max-w-lg bg-[#062618] border border-[#14472D] rounded-3xl p-6 text-white shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#051E13] border border-[#14472D] text-emerald-400 hover:text-white"
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              {t.verifyKeys}
            </h2>
            <div className="text-xs text-emerald-400 font-medium">
              {contact.privateNickname} ({contact.tejaId})
            </div>
          </div>
        </div>

        <p className="text-xs text-emerald-200/90 leading-relaxed mb-4">
          Compare this 60-digit safety number with <span className="font-semibold text-white">{contact.privateNickname}</span> or scan their QR code to verify the cryptographic authenticity of your session keys.
        </p>

        {/* QR Code Canvas Frame */}
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-emerald-400 rounded-2xl shadow-lg border-2 border-emerald-300">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Safety Number QR Code" className="w-44 h-44 rounded-xl" />
            ) : (
              <div className="w-44 h-44 flex items-center justify-center text-xs text-black">
                Generating QR...
              </div>
            )}
          </div>
        </div>

        {/* 60-Digit Safety Number Grid */}
        <div className="bg-[#051E13] border border-[#14472D] rounded-2xl p-4 mb-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-center font-mono text-xs sm:text-sm font-semibold text-emerald-300 tracking-wider">
            {contact.safetyNumber.split(' ').map((chunk, idx) => (
              <div key={idx} className="bg-[#08291B] py-1.5 px-2 rounded-lg border border-[#164E33]">
                {chunk}
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#14472D] text-[11px] font-mono">
            <span className="text-emerald-500">SHA-512 Fingerprint</span>
            <button
              onClick={handleCopy}
              className="text-emerald-400 hover:text-white flex items-center gap-1 font-sans"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy Numbers'}</span>
            </button>
          </div>
        </div>

        {/* Verified Status Toggle */}
        <div className="flex items-center justify-between p-3 bg-[#08291B] rounded-2xl border border-[#14472D]">
          <div>
            <div className="text-xs font-bold text-white">Trust & Verification</div>
            <div className="text-[11px] text-emerald-400/80">
              {isVerified ? 'Marked as verified contact' : 'Unverified key comparison'}
            </div>
          </div>
          <button
            onClick={() => setIsVerified(!isVerified)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              isVerified
                ? 'bg-emerald-500 text-black'
                : 'bg-[#051E13] border border-[#164E33] text-emerald-300 hover:border-emerald-500'
            }`}
          >
            {isVerified ? 'Verified ✓' : 'Mark as Verified'}
          </button>
        </div>
      </div>
    </div>
  );
};
