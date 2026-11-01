/**
 * WebRTC Calling Engine & Acoustic Processing Service
 * Manages media streams, echo cancellation, noise suppression constraints,
 * and Call Privacy Shield integration.
 */

export interface CallMediaState {
  hasRealStream: boolean;
  stream: MediaStream | null;
  audioContext: AudioContext | null;
  analyser: AnalyserNode | null;
  isNoiseSuppressed: boolean;
}

export class TejaCallManager {
  private localStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private isMuted: boolean = false;
  private isVideoMuted: boolean = false;

  async acquireMedia(video: boolean, noiseCancellation: boolean): Promise<CallMediaState> {
    try {
      const audioConstraints: MediaTrackConstraints = noiseCancellation
        ? {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000,
            channelCount: 1
          }
        : {
            echoCancellation: true,
            noiseSuppression: false
          };

      const videoConstraints: MediaTrackConstraints | boolean = video
        ? {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            facingMode: 'user'
          }
        : false;

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          audio: audioConstraints,
          video: videoConstraints
        });

        // Initialize AudioContext & AnalyserNode for live visualizer
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            this.audioContext = new AudioContextClass();
            const source = this.audioContext.createMediaStreamSource(this.localStream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 64;
            source.connect(this.analyser);
          }
        } catch (audioErr) {
          console.warn('AudioContext init error:', audioErr);
        }

        return {
          hasRealStream: true,
          stream: this.localStream,
          audioContext: this.audioContext,
          analyser: this.analyser,
          isNoiseSuppressed: noiseCancellation
        };
      }
    } catch (err) {
      console.warn('Real media stream unavailable or denied, falling back to simulated stream:', err);
    }

    return {
      hasRealStream: false,
      stream: null,
      audioContext: null,
      analyser: null,
      isNoiseSuppressed: noiseCancellation
    };
  }

  toggleAudio(forceMute?: boolean): boolean {
    if (this.localStream) {
      const track = this.localStream.getAudioTracks()[0];
      if (track) {
        track.enabled = forceMute !== undefined ? !forceMute : !track.enabled;
        this.isMuted = !track.enabled;
        return this.isMuted;
      }
    }
    this.isMuted = forceMute !== undefined ? forceMute : !this.isMuted;
    return this.isMuted;
  }

  toggleVideo(forceVideoOff?: boolean): boolean {
    if (this.localStream) {
      const track = this.localStream.getVideoTracks()[0];
      if (track) {
        track.enabled = forceVideoOff !== undefined ? !forceVideoOff : !track.enabled;
        this.isVideoMuted = !track.enabled;
        return this.isVideoMuted;
      }
    }
    this.isVideoMuted = forceVideoOff !== undefined ? forceVideoOff : !this.isVideoMuted;
    return this.isVideoMuted;
  }

  cleanup() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.analyser = null;
  }
}
