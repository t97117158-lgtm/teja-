export type LanguageCode =
  | 'en'
  | 'te'
  | 'kn'
  | 'hi'
  | 'ta'
  | 'ml'
  | 'bn'
  | 'mr'
  | 'es'
  | 'fr'
  | 'de'
  | 'ja'
  | 'ar';

export interface UserIdentity {
  tejaId: string; // TEJA-XXXX-XXXX-XXXX
  displayName: string;
  avatarSeed: string;
  mnemonicWords: string[]; // 24-word BIP-39 mnemonic
  identityPublicKeyHex: string;
  signedPrekeyHex: string;
  createdAt: number;
}

export interface Contact {
  id: string;
  tejaId: string;
  defaultName: string;
  privateNickname: string;
  avatarSeed: string;
  publicKeyFingerprint: string;
  safetyNumber: string;
  isFavorite: boolean;
  isBlocked: boolean;
  isOnline: boolean;
  lastSeen?: string;
  ratchetStep: number;
}

export interface EncryptedEnvelope {
  ciphertextBase64: string;
  ivBase64: string;
  tagBase64: string;
  ratchetIndex: number;
  senderEphemeralPubHex: string;
  messageType: 'text' | 'voice' | 'photo';
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  senderId: string; // 'self' or contactId
  senderTejaId: string;
  recipientTejaId: string;
  plaintext: string; // Decrypted on client
  envelope: EncryptedEnvelope; // Real crypto envelope
  timestamp: string;
  isSelf: boolean;
  status: 'sent' | 'delivered' | 'read';
  attachment?: {
    type: 'photo' | 'voice';
    url?: string;
    mediaKeyHex: string;
    durationSeconds?: number;
    sizeBytes: number;
  };
}

export interface CallOptions {
  video: boolean;
  audio: boolean;
  noiseCancellationEnabled: boolean;
  privacyShieldAction: 'blur' | 'mute' | 'terminate' | 'warning';
}

export interface CallSession {
  isActive: boolean;
  contact: Contact;
  type: 'voice' | 'video';
  status: 'calling' | 'connected' | 'ended';
  durationSeconds: number;
  noiseCancellationActive: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  privacyThreatDetected: boolean;
  privacyActionTaken?: string;
}
