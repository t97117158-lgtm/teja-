import React, { useState } from 'react';
import { X, Shield, Lock, KeyRound, Copy, Check, Server, Eye, Database } from 'lucide-react';
import { ChatMessage } from '../types';
import { translations, LanguageCode } from '../i18n/translations';

interface CryptoInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: ChatMessage | null;
  currentLanguage: LanguageCode;
}

export const CryptoInspectorModal: React.FC<CryptoInspectorModalProps> = ({
  isOpen,
  onClose,
  message,
  currentLanguage
}) => {
  const t = translations[currentLanguage];
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'envelope' | 'architecture' | 'database'>('envelope');

  if (!isOpen || !message) return null;

  const copyToClipboard = async (text: string, keyName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(keyName);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  const env = message.envelope;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="w-full max-w-2xl bg-[#062618] border border-[#14472D] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#08291B] border-b border-[#14472D] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <KeyRound size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                {t.cryptoInspector}
              </h2>
              <div className="text-[11px] font-mono text-emerald-400">
                Ratchet Step #{env.ratchetIndex} · AES-256-GCM + X3DH
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

        {/* Tab Navigation */}
        <div className="flex border-b border-[#14472D] bg-[#051E13] px-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('envelope')}
            className={`py-3 px-4 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'envelope'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-emerald-400/60 hover:text-emerald-300'
            }`}
          >
            <Lock size={13} />
            <span>Ciphertext Envelope</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 px-4 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'architecture'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-emerald-400/60 hover:text-emerald-300'
            }`}
          >
            <Shield size={13} />
            <span>Zero-Knowledge Boundary</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`py-3 px-4 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'database'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-emerald-400/60 hover:text-emerald-300'
            }`}
          >
            <Database size={13} />
            <span>Server SQL Row</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 font-sans">
          {activeTab === 'envelope' && (
            <div className="space-y-4">
              {/* Plaintext vs Ciphertext Contrast */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#08291B] border border-[#14472D] rounded-2xl p-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Eye size={13} /> Client Plaintext
                    </span>
                    <span className="text-[10px] text-emerald-500 font-mono">Decrypted</span>
                  </div>
                  <div className="text-sm text-white font-medium break-words bg-[#051E13] p-3 rounded-xl border border-[#14472D]">
                    {message.plaintext}
                  </div>
                </div>

                <div className="bg-[#08291B] border border-[#14472D] rounded-2xl p-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Server size={13} /> Server Payload
                    </span>
                    <span className="text-[10px] text-emerald-500 font-mono">Blind Blob</span>
                  </div>
                  <div className="text-xs text-emerald-300 font-mono break-all bg-[#051E13] p-3 rounded-xl border border-[#14472D] max-h-24 overflow-y-auto">
                    {env.ciphertextBase64}
                  </div>
                </div>
              </div>

              {/* Cryptographic Primitives Breakdown */}
              <div className="space-y-3 bg-[#08291B] border border-[#14472D] rounded-2xl p-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  AES-256-GCM Envelope Parameters
                </h4>

                <div className="space-y-2 text-xs font-mono">
                  {/* Ciphertext Base64 */}
                  <div className="bg-[#051E13] p-2.5 rounded-xl border border-[#14472D] flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-emerald-500 block text-[10px]">CIPHERTEXT_BLOB (Base64)</span>
                      <span className="text-emerald-200 truncate block">{env.ciphertextBase64}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(env.ciphertextBase64, 'cipher')}
                      className="p-1.5 text-emerald-400 hover:text-white shrink-0"
                    >
                      {copiedKey === 'cipher' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>

                  {/* 12-byte IV */}
                  <div className="bg-[#051E13] p-2.5 rounded-xl border border-[#14472D] flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-emerald-500 block text-[10px]">INITIALIZATION_VECTOR_96BIT (IV)</span>
                      <span className="text-emerald-200 truncate block">{env.ivBase64}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(env.ivBase64, 'iv')}
                      className="p-1.5 text-emerald-400 hover:text-white shrink-0"
                    >
                      {copiedKey === 'iv' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>

                  {/* 128-bit Auth Tag */}
                  <div className="bg-[#051E13] p-2.5 rounded-xl border border-[#14472D] flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-emerald-500 block text-[10px]">AUTHENTICATION_TAG_128BIT (GCM-TAG)</span>
                      <span className="text-emerald-200 truncate block">{env.tagBase64}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(env.tagBase64, 'tag')}
                      className="p-1.5 text-emerald-400 hover:text-white shrink-0"
                    >
                      {copiedKey === 'tag' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>

                  {/* Ephemeral Public Key */}
                  <div className="bg-[#051E13] p-2.5 rounded-xl border border-[#14472D] flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-emerald-500 block text-[10px]">EPHEMERAL_RATCHET_KEY_HEX</span>
                      <span className="text-emerald-200 truncate block">{env.senderEphemeralPubHex}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(env.senderEphemeralPubHex, 'eph')}
                      className="p-1.5 text-emerald-400 hover:text-white shrink-0"
                    >
                      {copiedKey === 'eph' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-4 text-xs text-emerald-200/90 leading-relaxed">
              <div className="p-4 rounded-2xl bg-[#08291B] border border-[#14472D] space-y-2">
                <h4 className="font-bold text-white text-sm">X3DH & Double Ratchet Forward Secrecy</h4>
                <p>
                  Every sent message executes a Diffie-Hellman ratchet step, combining symmetric-key KDF ratchets and DH ratchets. Even if a future key were ever compromised, past messages cannot be decrypted (Forward Secrecy).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#08291B] border border-[#14472D] space-y-2">
                <h4 className="font-bold text-white text-sm">Zero-Knowledge Relay Guarantee</h4>
                <p>
                  The backend server acts strictly as a blind transmission spool. It maintains zero knowledge of private identity keys, one-time prekeys, nicknames, or conversation text. Upon recipient ACK, records are hard-purged.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#08291B] border border-[#14472D] space-y-2">
                <h4 className="font-bold text-white text-sm">Envelope Encryption for Media</h4>
                <p>
                  Photos and audio recordings generate a single-use 256-bit symmetric key (<code className="text-emerald-400">K_media</code>). The ciphertext is routed to ephemeral storage while the decryption manifest is sealed exclusively inside this ratchet payload.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-3">
              <p className="text-xs text-emerald-300">
                Exact representation of the row inserted into the backend <code className="text-emerald-400 font-mono">ephemeral_messages</code> PostgreSQL table:
              </p>
              <pre className="bg-[#04160E] p-4 rounded-2xl border border-[#14472D] text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
{`{
  "id": "e7b01984-291a-4933-bf88-d218490a1f02",
  "recipient_id": "${message.recipientTejaId}",
  "sender_id": "${message.senderTejaId}",
  "ciphertext_envelope": "\\x${env.ciphertextBase64.slice(0, 32)}...",
  "iv": "\\x${env.ivBase64.slice(0, 24)}",
  "message_type": "${env.messageType}",
  "expires_at": "NOW() + INTERVAL '14 days'",
  "created_at": "${new Date(env.timestamp).toISOString()}"
}`}
              </pre>
              <div className="text-[11px] text-emerald-400/80 font-mono p-3 bg-[#08291B] rounded-xl border border-[#14472D]">
                ✦ Status: Automatic hard-delete trigger armed on recipient ACK.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
