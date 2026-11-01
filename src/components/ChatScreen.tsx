import React, { useState, useRef, useEffect } from 'react';
import {
  Phone,
  Video,
  ShieldCheck,
  Send,
  Mic,
  Paperclip,
  KeyRound,
  Play,
  Pause,
  Image as ImageIcon,
  CheckCheck,
  Lock,
  ArrowLeft,
  X
} from 'lucide-react';
import { translations, LanguageCode } from '../i18n/translations';
import { Contact, ChatMessage, UserIdentity } from '../types';

interface ChatScreenProps {
  currentLanguage: LanguageCode;
  activeContact: Contact;
  messages: ChatMessage[];
  identity: UserIdentity | null;
  isGlobalBlurActive: boolean;
  onSendMessage: (text: string, attachmentType?: 'photo' | 'voice', attachmentUrl?: string) => void;
  onInitiateCall: (type: 'voice' | 'video') => void;
  onOpenSafetyNumbers: () => void;
  onInspectMessageCrypto: (msg: ChatMessage) => void;
  onBackToContacts?: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  currentLanguage,
  activeContact,
  messages,
  identity,
  isGlobalBlurActive,
  onSendMessage,
  onInitiateCall,
  onOpenSafetyNumbers,
  onInspectMessageCrypto,
  onBackToContacts
}) => {
  const t = translations[currentLanguage];
  const [inputMessage, setInputMessage] = useState('');
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordTimerRef = useRef<any>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Handle voice recording timer
  useEffect(() => {
    if (isRecording) {
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds(s => s + 1);
      }, 1000);
    } else {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    }
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, [isRecording]);

  // Touch and hold reveal logic (0ms instant re-blur on release)
  const startReveal = (id: string) => {
    if (!isGlobalBlurActive) return;
    setRevealedIds(prev => ({ ...prev, [id]: true }));
  };

  const endReveal = (id: string) => {
    if (!isGlobalBlurActive) return;
    setRevealedIds(prev => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const isItemBlurred = (id: string) => {
    if (!isGlobalBlurActive) return false;
    return !revealedIds[id];
  };

  const handleSendText = () => {
    if (!inputMessage.trim()) return;
    onSendMessage(inputMessage.trim());
    setInputMessage('');
  };

  const handleStopRecordingAndSend = () => {
    setIsRecording(false);
    const duration = recordSeconds || 3;
    onSendMessage(`Voice message (${duration}s)`, 'voice');
    setRecordSeconds(0);
  };

  const handleSendTestPhoto = (sampleUrl: string) => {
    setShowAttachMenu(false);
    onSendMessage("Encrypted photo attachment", 'photo', sampleUrl);
  };

  return (
    <div className="flex flex-col h-full bg-[#051E13] text-[#F0FDF4] select-none overflow-hidden relative">
      {/* Contact Header */}
      <div className="px-4 py-3 bg-[#08291B] border-b border-[#14472D] flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          {onBackToContacts && (
            <button
              onClick={onBackToContacts}
              className="md:hidden p-2 -ml-1 text-emerald-300 hover:text-white rounded-lg"
              aria-label="Back to contacts"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          {/* Contact Avatar with touch reveal */}
          <div
            onMouseDown={() => startReveal('header-avatar')}
            onMouseUp={() => endReveal('header-avatar')}
            onMouseLeave={() => endReveal('header-avatar')}
            onTouchStart={() => startReveal('header-avatar')}
            onTouchEnd={() => endReveal('header-avatar')}
            className={`w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold text-base transition-all duration-150 cursor-pointer ${
              isItemBlurred('header-avatar') ? 'filter blur-sm' : 'filter-none'
            }`}
            title="Hold to reveal avatar"
          >
            {activeContact.privateNickname.charAt(0) || activeContact.defaultName.charAt(0)}
          </div>

          <div>
            <div
              onMouseDown={() => startReveal('header-name')}
              onMouseUp={() => endReveal('header-name')}
              onMouseLeave={() => endReveal('header-name')}
              onTouchStart={() => startReveal('header-name')}
              onTouchEnd={() => endReveal('header-name')}
              className={`font-semibold text-sm sm:text-base text-white tracking-tight cursor-pointer transition-all duration-150 ${
                isItemBlurred('header-name') ? 'filter blur-sm select-none' : 'filter-none'
              }`}
              title="Hold to reveal nickname"
            >
              {activeContact.privateNickname}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
              <span>{activeContact.tejaId}</span>
              <span className="text-emerald-600">·</span>
              <span className={activeContact.isOnline ? 'text-emerald-400' : 'text-emerald-600'}>
                {activeContact.isOnline ? t.online : t.offline}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Safety Numbers Verification */}
          <button
            onClick={onOpenSafetyNumbers}
            className="p-2 rounded-lg bg-[#093522] border border-[#164E33] text-emerald-300 hover:text-white hover:border-emerald-500/50 transition-colors"
            title={t.safetyNumbers}
            aria-label={t.safetyNumbers}
          >
            <ShieldCheck size={18} />
          </button>

          {/* Voice Call */}
          <button
            onClick={() => onInitiateCall('voice')}
            className="p-2 rounded-lg bg-[#093522] border border-[#164E33] text-emerald-300 hover:text-white hover:border-emerald-500/50 transition-colors"
            title={t.callVoice}
            aria-label={t.callVoice}
          >
            <Phone size={18} />
          </button>

          {/* Video Call */}
          <button
            onClick={() => onInitiateCall('video')}
            className="p-2 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 font-semibold transition-colors"
            title={t.callVideo}
            aria-label={t.callVideo}
          >
            <Video size={18} />
          </button>
        </div>
      </div>

      {/* Zero-Trust Notice & Smart Privacy Status Bar */}
      <div className="bg-[#093220] px-4 py-1.5 text-center text-xs text-emerald-300/90 flex items-center justify-center gap-3 border-b border-[#14472D] shrink-0">
        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-300">
          <Lock size={12} className="text-emerald-400" />
          <span>{t.freeForeverBadge}</span>
        </span>
        <span className="text-emerald-600">·</span>
        <span className="text-[11px] text-emerald-400/90">
          {isGlobalBlurActive ? t.smartBlurActive : 'Standard View'}
        </span>
        <span className="text-emerald-600 hidden sm:inline">·</span>
        <span className="text-[11px] text-emerald-500 font-mono hidden sm:inline">
          Ratchet #{activeContact.ratchetStep}
        </span>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => {
          const blurred = isItemBlurred(msg.id);
          const isSelf = msg.isSelf;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
            >
              {/* Message Bubble with Touch & Hold to Reveal */}
              <div
                onMouseDown={() => startReveal(msg.id)}
                onMouseUp={() => endReveal(msg.id)}
                onMouseLeave={() => endReveal(msg.id)}
                onTouchStart={() => startReveal(msg.id)}
                onTouchEnd={() => endReveal(msg.id)}
                onTouchCancel={() => endReveal(msg.id)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') startReveal(msg.id);
                }}
                onKeyUp={() => endReveal(msg.id)}
                className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 shadow-md select-none cursor-pointer transition-all duration-150 relative group ${
                  isSelf
                    ? 'bg-emerald-500 text-black font-medium'
                    : 'bg-[#093522] border border-[#164E33] text-emerald-100'
                } ${blurred ? 'filter blur-md' : 'filter-none'}`}
              >
                {/* Photo attachment display */}
                {msg.attachment?.type === 'photo' && (
                  <div className="mb-2 rounded-xl overflow-hidden bg-black/30 border border-emerald-900/40">
                    <div className="p-3 flex items-center gap-2 text-xs font-mono">
                      <ImageIcon size={16} />
                      <span>AES-256-GCM Photo Envelope</span>
                    </div>
                    <div className="h-40 w-full bg-emerald-950/60 flex flex-col items-center justify-center p-4 text-center">
                      <Lock size={24} className="mb-2 text-emerald-400" />
                      <span className="text-xs font-mono text-emerald-300">
                        {blurred ? 'Encrypted Media (Hold to view)' : 'Decrypted Client Buffer'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Voice note attachment display */}
                {msg.attachment?.type === 'voice' && (
                  <div className="flex items-center gap-3 py-1 mb-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlayingAudioId(playingAudioId === msg.id ? null : msg.id);
                      }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        isSelf ? 'bg-black/20 text-black hover:bg-black/30' : 'bg-emerald-500 text-black'
                      }`}
                    >
                      {playingAudioId === msg.id ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 h-6">
                        {[40, 70, 45, 90, 60, 80, 50, 75, 95, 60, 40, 85, 55].map((h, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-full ${
                              playingAudioId === msg.id ? 'bg-current animate-pulse' : 'bg-current opacity-60'
                            }`}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                      <div className="text-[10px] font-mono opacity-80 mt-0.5">
                        Encrypted Voice (AES-GCM Envelope)
                      </div>
                    </div>
                  </div>
                )}

                {/* Plaintext Content */}
                <div className="text-sm break-words leading-relaxed">
                  {msg.plaintext}
                </div>

                {/* Message Footer with Timestamp & Crypto Inspector Trigger */}
                <div
                  className={`flex items-center justify-between gap-3 text-[10px] mt-2 pt-1 border-t ${
                    isSelf ? 'border-black/10 text-emerald-950 font-mono' : 'border-[#164E33] text-emerald-400/80 font-mono'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span>{msg.timestamp}</span>
                    {isSelf && <CheckCheck size={12} className="inline opacity-80" />}
                  </div>

                  {/* Inspect Ciphertext Envelope Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInspectMessageCrypto(msg);
                    }}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                      isSelf
                        ? 'bg-black/10 hover:bg-black/20 text-black'
                        : 'bg-[#062618] hover:bg-[#0C3E27] text-emerald-300'
                    }`}
                    title={t.cryptoInspector}
                  >
                    <KeyRound size={10} />
                    <span>Envelope</span>
                  </button>
                </div>
              </div>

              {/* Hold to reveal hint if currently blurred */}
              {blurred && (
                <span className="text-[11px] text-emerald-400/70 tracking-wide mt-1 select-none font-medium">
                  {t.holdToReveal}
                </span>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Selector Drawer (when clicked) */}
      {showAttachMenu && (
        <div className="mx-4 mb-2 p-3 bg-[#08291B] border border-[#14472D] rounded-2xl flex items-center justify-between shadow-xl shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSendTestPhoto('/sample-doc.jpg')}
              className="flex items-center gap-2 px-3 py-2 bg-[#093522] border border-[#164E33] hover:border-emerald-500/50 rounded-xl text-xs text-emerald-200 transition-colors"
            >
              <ImageIcon size={15} className="text-emerald-400" />
              <span>Send Encrypted Photo</span>
            </button>
          </div>
          <button
            onClick={() => setShowAttachMenu(false)}
            className="p-1.5 text-emerald-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Bottom Composer & Voice Dock */}
      <div className="p-3 bg-[#08291B] border-t border-[#14472D] flex items-center gap-2 shrink-0">
        {isRecording ? (
          /* Live Recording Interface */
          <div className="flex-1 flex items-center justify-between bg-[#051E13] border border-red-500/50 rounded-full px-4 py-2 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="font-mono text-red-400 text-xs">
                {t.recording} ({recordSeconds}s)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRecording(false)}
                className="text-xs text-emerald-400 hover:text-white px-2 py-1"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleStopRecordingAndSend}
                className="px-3 py-1 bg-emerald-500 text-black text-xs font-bold rounded-full hover:bg-emerald-400"
              >
                {t.stopRecord}
              </button>
            </div>
          </div>
        ) : (
          /* Standard Composer */
          <>
            <button
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="p-2.5 rounded-full bg-[#093522] border border-[#164E33] text-emerald-300 hover:text-white hover:border-emerald-500/50 transition-colors"
              title={t.attachPhoto}
              aria-label={t.attachPhoto}
            >
              <Paperclip size={18} />
            </button>

            <button
              onClick={() => setIsRecording(true)}
              className="p-2.5 rounded-full bg-[#093522] border border-[#164E33] text-emerald-300 hover:text-white hover:border-emerald-500/50 transition-colors"
              title={t.voiceNote}
              aria-label={t.voiceNote}
            >
              <Mic size={18} />
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendText();
              }}
              placeholder={t.typeMessage}
              className="flex-1 bg-[#051E13] border border-[#14472D] rounded-full px-4 py-2.5 text-sm text-white placeholder-emerald-700/80 focus:outline-none focus:border-emerald-500 transition-all font-sans"
            />

            <button
              onClick={handleSendText}
              disabled={!inputMessage.trim()}
              className="p-2.5 rounded-full bg-emerald-500 text-black hover:bg-emerald-400 font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-emerald-950"
              title={t.send}
              aria-label={t.send}
            >
              <Send size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
