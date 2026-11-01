import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Shield,
  ShieldAlert,
  Volume2,
  Sparkles,
  EyeOff,
  Lock
} from 'lucide-react';
import { translations, LanguageCode } from '../i18n/translations';
import { CallSession } from '../types';
import { TejaCallManager, CallMediaState } from '../services/webrtcService';

interface CallModalProps {
  callSession: CallSession;
  currentLanguage: LanguageCode;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleNoise: () => void;
  onTriggerPrivacyThreat: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  callSession,
  currentLanguage,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onToggleNoise,
  onTriggerPrivacyThreat
}) => {
  const t = translations[currentLanguage];
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [mediaState, setMediaState] = useState<CallMediaState | null>(null);
  const callManagerRef = useRef<TejaCallManager | null>(null);
  const [audioBars, setAudioBars] = useState<number[]>([15, 30, 45, 70, 85, 60, 40, 20]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const manager = new TejaCallManager();
    callManagerRef.current = manager;

    async function initMedia() {
      const state = await manager.acquireMedia(
        callSession.type === 'video',
        callSession.noiseCancellationActive
      );
      setMediaState(state);

      if (state.hasRealStream && localVideoRef.current && state.stream) {
        localVideoRef.current.srcObject = state.stream;
      }
    }

    initMedia();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      manager.cleanup();
    };
  }, [callSession.type, callSession.noiseCancellationActive]);

  // Audio frequency simulation & visualizer loop
  useEffect(() => {
    let phase = 0;
    const updateBars = () => {
      phase += 0.15;
      if (callSession.isMuted) {
        setAudioBars([5, 5, 5, 5, 5, 5, 5, 5]);
      } else {
        const suppressionDamping = callSession.noiseCancellationActive ? 0.75 : 1.0;
        setAudioBars([
          Math.sin(phase) * 35 * suppressionDamping + 45,
          Math.sin(phase + 1) * 45 * suppressionDamping + 50,
          Math.sin(phase + 2) * 25 * suppressionDamping + 35,
          Math.sin(phase + 3) * 50 * suppressionDamping + 55,
          Math.sin(phase + 4) * 30 * suppressionDamping + 40,
          Math.sin(phase + 5) * 40 * suppressionDamping + 45,
          Math.sin(phase + 6) * 20 * suppressionDamping + 30,
          Math.sin(phase + 7) * 30 * suppressionDamping + 35
        ]);
      }
      animationFrameRef.current = requestAnimationFrame(updateBars);
    };

    animationFrameRef.current = requestAnimationFrame(updateBars);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [callSession.isMuted, callSession.noiseCancellationActive]);

  // Format call duration
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isThreatActive = callSession.privacyThreatDetected;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 select-none">
      <div className="w-full max-w-2xl bg-[#062618] border border-[#14472D] rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh] max-h-[720px] relative">
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#08291B] border-b border-[#14472D] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-300">
              {callSession.contact.privateNickname.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                {callSession.contact.privateNickname}
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <span>{callSession.contact.tejaId}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Lock size={11} /> E2EE WebRTC
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-full bg-[#051E13] border border-[#14472D] text-emerald-300">
            {callSession.status === 'calling' ? (
              <span className="animate-pulse">{t.connecting}</span>
            ) : (
              <span>{formatDuration(callSession.durationSeconds)}</span>
            )}
          </div>
        </div>

        {/* Video / Visualizer Display Area */}
        <div className="flex-1 bg-[#04160E] relative overflow-hidden flex flex-col items-center justify-center p-6">
          {/* Main Visualizer or Camera View */}
          {callSession.type === 'video' && !callSession.isVideoOff ? (
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black border border-emerald-900/40 flex items-center justify-center">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-all duration-300 ${
                  isThreatActive ? 'filter blur-2xl scale-105' : 'filter-none'
                }`}
              />

              {/* Simulated Remote Peer Overlay */}
              <div className="absolute top-4 right-4 w-32 h-24 rounded-xl overflow-hidden bg-[#08291B] border border-emerald-500/40 shadow-lg flex flex-col items-center justify-center p-2">
                <div className="text-[10px] font-mono text-emerald-400 mb-1">Peer Stream</div>
                <div className="w-8 h-8 rounded-full bg-emerald-500/30 flex items-center justify-center text-xs text-emerald-300 font-bold">
                  {callSession.contact.privateNickname.charAt(0)}
                </div>
              </div>
            </div>
          ) : (
            /* Audio Visualizer Stage */
            <div
              className={`flex flex-col items-center justify-center transition-all duration-300 ${
                isThreatActive ? 'filter blur-xl' : 'filter-none'
              }`}
            >
              <div className="w-28 h-28 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center mb-6 relative">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-3xl font-extrabold text-emerald-300">
                  {callSession.contact.privateNickname.charAt(0)}
                </div>
                {callSession.status === 'connected' && (
                  <span className="absolute -bottom-1 px-2 py-0.5 rounded-full bg-emerald-500 text-[10px] font-bold text-black font-mono">
                    LIVE
                  </span>
                )}
              </div>

              {/* Live Audio Visualizer Frequency Bars */}
              <div className="flex items-end gap-1.5 h-14 mb-4">
                {audioBars.map((height, idx) => (
                  <div
                    key={idx}
                    className="w-2 rounded-full bg-emerald-400 transition-all duration-75"
                    style={{ height: `${Math.max(6, height)}%` }}
                  />
                ))}
              </div>

              <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <Volume2 size={13} />
                <span>Opus 48kHz Stereo · AES-256-GCM SRTP</span>
              </div>
            </div>
          )}

          {/* Call Privacy Shield Threat Overlay (Shoulder Surfer Alert) */}
          {isThreatActive && (
            <div className="absolute inset-0 bg-red-950/70 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-red-400 mb-4 animate-bounce">
                <EyeOff size={32} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {t.threatDetected}
              </h3>
              <p className="text-xs text-red-200 max-w-md mb-6 leading-relaxed">
                {t.privacyShield}
              </p>
              <button
                onClick={onTriggerPrivacyThreat}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-black font-bold text-xs shadow-lg"
              >
                {t.threatCleared}
              </button>
            </div>
          )}
        </div>

        {/* Status Indicators & Acoustic Filter Badge */}
        <div className="px-6 py-2.5 bg-[#08291B] border-t border-[#14472D] flex flex-wrap items-center justify-between text-xs text-emerald-300 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-[#051E13] border border-[#14472D]">
              <Sparkles size={11} className={callSession.noiseCancellationActive ? 'text-emerald-400' : 'text-emerald-700'} />
              <span>
                {callSession.noiseCancellationActive
                  ? 'Acoustic AI Suppression: Active'
                  : 'Suppression: Raw'}
              </span>
            </span>
          </div>

          {/* Shoulder Surfer Simulator Trigger */}
          <button
            onClick={onTriggerPrivacyThreat}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isThreatActive
                ? 'bg-red-500 text-black font-bold'
                : 'bg-[#093522] border border-[#164E33] text-emerald-300 hover:text-white'
            }`}
          >
            <ShieldAlert size={13} />
            <span>{isThreatActive ? t.threatCleared : t.threatSimulate}</span>
          </button>
        </div>

        {/* Bottom Call Control Action Dock */}
        <div className="p-6 bg-[#062618] border-t border-[#14472D] flex items-center justify-center gap-4 shrink-0">
          {/* Mute Audio */}
          <button
            onClick={onToggleMute}
            className={`p-3.5 rounded-2xl border transition-all ${
              callSession.isMuted
                ? 'bg-red-500/20 border-red-500 text-red-400'
                : 'bg-[#08291B] border-[#14472D] text-emerald-300 hover:text-white hover:border-emerald-500'
            }`}
            title={callSession.isMuted ? t.unmute : t.mute}
          >
            {callSession.isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Toggle Video */}
          {callSession.type === 'video' && (
            <button
              onClick={onToggleVideo}
              className={`p-3.5 rounded-2xl border transition-all ${
                callSession.isVideoOff
                  ? 'bg-red-500/20 border-red-500 text-red-400'
                  : 'bg-[#08291B] border-[#14472D] text-emerald-300 hover:text-white hover:border-emerald-500'
              }`}
              title="Toggle Camera"
            >
              {callSession.isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
            </button>
          )}

          {/* Toggle Acoustic Noise Cancellation */}
          <button
            onClick={onToggleNoise}
            className={`p-3.5 rounded-2xl border transition-all ${
              callSession.noiseCancellationActive
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                : 'bg-[#08291B] border-[#14472D] text-emerald-600 hover:text-emerald-400'
            }`}
            title={t.noiseCancDesc}
          >
            <Sparkles size={20} />
          </button>

          {/* End Call Button */}
          <button
            onClick={onEndCall}
            className="p-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-lg shadow-red-950 flex items-center gap-2 px-6"
            title={t.endCall}
          >
            <PhoneOff size={20} />
            <span className="text-sm font-semibold">{t.endCall}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
