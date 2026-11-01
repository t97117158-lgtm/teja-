import React from 'react';
import { X, Server, Trash2, CheckCircle, ShieldAlert, Clock, Database } from 'lucide-react';
import { SpoolItem } from '../hooks/useTejaStore';
import { translations, LanguageCode } from '../i18n/translations';

interface SpoolInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  spoolQueue: SpoolItem[];
  currentLanguage: LanguageCode;
}

export const SpoolInspectorModal: React.FC<SpoolInspectorModalProps> = ({
  isOpen,
  onClose,
  spoolQueue,
  currentLanguage
}) => {
  const t = translations[currentLanguage];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="w-full max-w-3xl bg-[#062618] border border-[#14472D] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#08291B] border-b border-[#14472D] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Server size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {t.spoolQueue}
              </h2>
              <div className="text-xs text-emerald-400 font-mono">
                PostgreSQL Ephemeral Store-and-Forward Spool (TTL: 14 Days)
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

        {/* Informational Banner */}
        <div className="p-4 bg-[#051E13] border-b border-[#14472D] text-xs text-emerald-200/90 leading-relaxed space-y-1 shrink-0">
          <div className="flex items-center gap-2 font-bold text-white">
            <Database size={14} className="text-emerald-400" />
            <span>Blind Ciphertext Queue & Automatic Hard-Pruning Architecture</span>
          </div>
          <p>
            The backend server only stores raw ciphertext envelopes while the recipient is offline. As soon as the recipient device transmits an ACK signal, the corresponding rows in <code className="text-emerald-400 font-mono">ephemeral_messages</code> are <strong>HARD-DELETED</strong> permanently with zero remnants.
          </p>
        </div>

        {/* Live Spool Queue Records */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {spoolQueue.length === 0 ? (
            <div className="py-12 text-center text-xs text-emerald-600 font-mono">
              [Queue is Empty - All recent messages have been verified & hard-purged upon ACK]
            </div>
          ) : (
            spoolQueue.map(item => (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  item.status === 'hard-deleted-ack'
                    ? 'bg-[#04160E] border-emerald-950 text-emerald-600/70'
                    : 'bg-[#08291B] border-[#164E33] text-emerald-200'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{item.id}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                      {item.messageType.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-400 truncate">
                    To: {item.recipientTejaId} · From: {item.senderTejaId}
                  </div>
                  <div className="text-[10px] text-emerald-500/80 truncate">
                    CIPHERTEXT: {item.ciphertextPreview} (IV: {item.ivHex})
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right text-[10px] text-emerald-500 font-sans">
                    <div className="flex items-center gap-1 justify-end">
                      <Clock size={11} /> {item.createdAt}
                    </div>
                    <div>TTL: {item.expiresAt}</div>
                  </div>

                  {item.status === 'hard-deleted-ack' ? (
                    <div className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-[10px] font-bold flex items-center gap-1 font-sans">
                      <CheckCircle size={12} />
                      <span>HARD-PURGED (ACK)</span>
                    </div>
                  ) : (
                    <div className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[10px] font-bold flex items-center gap-1 font-sans animate-pulse">
                      <Trash2 size={12} />
                      <span>SPOOLED IN RELAY</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#08291B] border-t border-[#14472D] flex items-center justify-between text-xs text-emerald-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert size={14} />
            <span>Row-Level Security (RLS) restricts access strictly to verified JWT recipient claims.</span>
          </div>
          <span className="font-mono text-[11px]">{spoolQueue.length} Relayed Entries</span>
        </div>
      </div>
    </div>
  );
};
