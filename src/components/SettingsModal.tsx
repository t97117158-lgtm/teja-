import React, { useState } from 'react';
import {
  X,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  Globe,
  Trash2,
  Sparkles,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { translations, AVAILABLE_LANGUAGES, LanguageCode } from '../i18n/translations';
import { UserIdentity } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  identity: UserIdentity | null;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  isSmartBlurActive: boolean;
  onToggleSmartBlur: () => void;
  noiseCancellationActive: boolean;
  onToggleNoise: () => void;
  onRestoreFromMnemonic: (words: string[]) => void;
  onDeleteAccount: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  identity,
  currentLanguage,
  onLanguageChange,
  isSmartBlurActive,
  onToggleSmartBlur,
  noiseCancellationActive,
  onToggleNoise,
  onRestoreFromMnemonic,
  onDeleteAccount
}) => {
  const t = translations[currentLanguage];
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [copiedMnemonic, setCopiedMnemonic] = useState(false);
  const [copiedTejaId, setCopiedTejaId] = useState(false);
  const [showRestoreBox, setShowRestoreBox] = useState(false);
  const [restoreInput, setRestoreInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !identity) return null;

  const handleCopyMnemonic = async () => {
    try {
      await navigator.clipboard.writeText(identity.mnemonicWords.join(' '));
      setCopiedMnemonic(true);
      setTimeout(() => setCopiedMnemonic(false), 2000);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleCopyTejaId = async () => {
    try {
      await navigator.clipboard.writeText(identity.tejaId);
      setCopiedTejaId(true);
      setTimeout(() => setCopiedTejaId(false), 2000);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleRestoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const words = restoreInput
      .trim()
      .split(/\s+/)
      .map(w => w.toLowerCase());
    if (words.length >= 12) {
      onRestoreFromMnemonic(words);
      setShowRestoreBox(false);
      setRestoreInput('');
      onClose();
    }
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="w-full max-w-2xl bg-[#062618] border border-[#14472D] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#08291B] border-b border-[#14472D] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Key size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {t.accountDetails}
              </h2>
              <div className="text-xs text-emerald-400 font-mono">
                Phone-numberless Cryptographic Identity
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#051E13] border border-[#14472D] text-emerald-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Identity Card */}
          <div className="p-4 rounded-2xl bg-[#08291B] border border-[#14472D] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-500 font-mono uppercase block">
                  Primary TEJA Identifier
                </span>
                <span className="text-base font-bold font-mono text-emerald-200 tracking-wider">
                  {identity.tejaId}
                </span>
              </div>
              <button
                onClick={handleCopyTejaId}
                className="px-3 py-1.5 rounded-xl bg-[#051E13] border border-[#14472D] text-emerald-300 hover:text-white text-xs flex items-center gap-1.5"
              >
                {copiedTejaId ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedTejaId ? 'Copied' : t.copyTejaId}</span>
              </button>
            </div>

            <div className="pt-2 border-t border-[#14472D] grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-emerald-400/80">
              <div>Identity Key: {identity.identityPublicKeyHex.slice(0, 16)}...</div>
              <div>Prekey State: Verified ({identity.signedPrekeyHex.slice(0, 12)}...)</div>
            </div>
          </div>

          {/* Master 24-Word BIP-39 Recovery Phrase */}
          <div className="p-5 rounded-2xl bg-[#08291B] border border-[#14472D] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  BIP-39 Master Recovery Phrase
                </h3>
                <p className="text-xs text-emerald-300/80 mt-0.5">
                  {t.recoveryPhraseNotice}
                </p>
              </div>
              <button
                onClick={() => setShowMnemonic(!showMnemonic)}
                className="p-2 rounded-xl bg-[#051E13] border border-[#14472D] text-emerald-300 hover:text-white text-xs flex items-center gap-1.5"
              >
                {showMnemonic ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{showMnemonic ? 'Hide' : 'Reveal'}</span>
              </button>
            </div>

            {showMnemonic ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 bg-[#051E13] p-4 rounded-xl border border-[#14472D]">
                  {identity.mnemonicWords.map((word, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 text-xs font-mono py-1 px-2 rounded bg-[#08291B] text-emerald-200"
                    >
                      <span className="text-emerald-600 text-[10px] w-4">{idx + 1}.</span>
                      <span className="font-semibold">{word}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center text-xs text-emerald-400">
                  <span>Keep this offline in a physical location.</span>
                  <button
                    onClick={handleCopyMnemonic}
                    className="flex items-center gap-1 text-emerald-300 hover:text-white font-medium"
                  >
                    {copiedMnemonic ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedMnemonic ? 'Copied 24 Words' : 'Copy All 24 Words'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#051E13] border border-[#14472D] text-center text-xs text-emerald-600 font-mono">
                [24 Secret Recovery Words Hidden For Privacy · Press Reveal to View]
              </div>
            )}
          </div>

          {/* Privacy & Audio Preferences */}
          <div className="p-5 rounded-2xl bg-[#08291B] border border-[#14472D] space-y-4">
            <h3 className="text-sm font-bold text-white">App Preferences</h3>

            {/* Smart Blur Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">{t.smartBlurActive}</div>
                <div className="text-[11px] text-emerald-300/80">{t.smartBlurDesc}</div>
              </div>
              <button
                onClick={onToggleSmartBlur}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  isSmartBlurActive ? 'bg-emerald-500' : 'bg-[#051E13] border border-[#14472D]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    isSmartBlurActive ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Noise Cancellation Toggle */}
            <div className="flex items-center justify-between pt-3 border-t border-[#14472D]">
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Sparkles size={13} className="text-emerald-400" />
                  <span>{t.noiseCancellation}</span>
                </div>
                <div className="text-[11px] text-emerald-300/80">{t.noiseCancDesc}</div>
              </div>
              <button
                onClick={onToggleNoise}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  noiseCancellationActive ? 'bg-emerald-500' : 'bg-[#051E13] border border-[#14472D]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    noiseCancellationActive ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Language Selection */}
            <div className="pt-3 border-t border-[#14472D]">
              <div className="text-xs font-semibold text-white mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Globe size={13} className="text-emerald-400" />
                  <span>Display Language ({AVAILABLE_LANGUAGES.length} Languages)</span>
                </span>
                <span className="text-[10px] text-emerald-400/80 font-mono">
                  Active: {AVAILABLE_LANGUAGES.find(l => l.code === currentLanguage)?.native}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {AVAILABLE_LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => onLanguageChange(l.code)}
                    className={`py-2 px-3 rounded-xl text-left transition-all ${
                      currentLanguage === l.code
                        ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-950/40'
                        : 'bg-[#051E13] border border-[#14472D] text-emerald-300 hover:text-white hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="text-xs font-semibold">{l.native}</div>
                    <div className="text-[10px] opacity-75 font-mono">{l.label} · {l.region}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Account Recovery / Restore */}
          <div className="p-5 rounded-2xl bg-[#08291B] border border-[#14472D] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <RefreshCw size={14} className="text-emerald-400" />
                  <span>Restore Account From Mnemonic</span>
                </h3>
                <p className="text-xs text-emerald-300/80 mt-0.5">
                  Recover your TEJA account on any device using your 24 words.
                </p>
              </div>
              <button
                onClick={() => setShowRestoreBox(!showRestoreBox)}
                className="px-3 py-1.5 rounded-xl bg-[#051E13] border border-[#14472D] text-emerald-300 text-xs font-semibold"
              >
                {showRestoreBox ? 'Cancel' : 'Restore'}
              </button>
            </div>

            {showRestoreBox && (
              <form onSubmit={handleRestoreSubmit} className="space-y-3 pt-2">
                <textarea
                  rows={3}
                  required
                  placeholder="Enter your 24 words separated by spaces..."
                  value={restoreInput}
                  onChange={(e) => setRestoreInput(e.target.value)}
                  className="w-full bg-[#051E13] border border-[#14472D] rounded-xl p-3 text-xs text-white placeholder-emerald-700/80 font-mono focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400"
                >
                  Verify & Restore Identity
                </button>
              </form>
            )}
          </div>

          {/* Danger Zone: Permanent Account Deletion */}
          <div className="p-5 rounded-2xl bg-red-950/20 border border-red-900/50 space-y-3">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <AlertTriangle size={16} />
              <span>{t.deleteAccount}</span>
            </div>
            <p className="text-xs text-red-200/90 leading-relaxed">
              {t.confirmDelete}
            </p>

            {showDeleteConfirm ? (
              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 rounded-xl bg-[#08291B] text-xs font-semibold text-white"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={() => {
                    onDeleteAccount();
                    onClose();
                  }}
                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                >
                  Confirm Permanent Deletion
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 rounded-xl bg-red-900/40 hover:bg-red-900/60 border border-red-700/50 text-red-300 font-bold text-xs flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>{t.deleteAccount}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
