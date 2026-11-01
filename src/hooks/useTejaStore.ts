import { useState, useEffect, useCallback, useRef } from 'react';
import { UserIdentity, Contact, ChatMessage, LanguageCode, CallSession } from '../types';
import {
  createNewIdentity,
  deriveIdentityFromMnemonic,
  encryptEnvelope,
  computeSafetyNumber,
  generateMediaEnvelopeKey
} from '../services/cryptoEngine';

const STORAGE_KEYS = {
  IDENTITY: 'teja_identity_v1',
  CONTACTS: 'teja_contacts_v1',
  MESSAGES: 'teja_messages_v1',
  LANGUAGE: 'teja_lang_v1',
  SMART_BLUR: 'teja_smart_blur_v1',
  NOISE_CANC: 'teja_noise_canc_v1'
};

const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'contact-ananya',
    tejaId: 'TEJA-9E4B-8812-7F3A',
    defaultName: 'Ananya Rao',
    privateNickname: 'Ananya (Security Lead)',
    avatarSeed: 'ananya',
    publicKeyFingerprint: '9E:4B:88:12:7F:3A:41:2B:99:A1:02:44:88:EC:31:7F',
    safetyNumber: '48291 91028 38192 49102 84910 28491 82941 02849 19284 91028 38491 02841',
    isFavorite: true,
    isBlocked: false,
    isOnline: true,
    ratchetStep: 14
  },
  {
    id: 'contact-vikram',
    tejaId: 'TEJA-4K12-58A9-2B90',
    defaultName: 'Vikram Patel',
    privateNickname: 'Vikram (Kernel Dev)',
    avatarSeed: 'vikram',
    publicKeyFingerprint: '4K:12:58:A9:2B:90:38:D1:12:5F:88:22:90:4B:71:A0',
    safetyNumber: '19284 92841 02841 93821 04928 49201 84920 18492 84920 18492 01849 20184',
    isFavorite: true,
    isBlocked: false,
    isOnline: true,
    ratchetStep: 8
  },
  {
    id: 'contact-kavya',
    tejaId: 'TEJA-7C81-9923-1D44',
    defaultName: 'Kavya Murthy',
    privateNickname: 'Kavya (Cryptographer)',
    avatarSeed: 'kavya',
    publicKeyFingerprint: '7C:81:99:23:1D:44:09:A4:77:81:BC:02:14:8F:99:3E',
    safetyNumber: '92840 18492 01849 20184 92018 49201 84920 18492 01849 20184 92018 49201',
    isFavorite: false,
    isBlocked: false,
    isOnline: false,
    lastSeen: '2h ago',
    ratchetStep: 5
  },
  {
    id: 'contact-arjun',
    tejaId: 'TEJA-3F21-6674-88A2',
    defaultName: 'Arjun Sharma',
    privateNickname: 'Arjun',
    avatarSeed: 'arjun',
    publicKeyFingerprint: '3F:21:66:74:88:A2:91:CB:00:29:43:88:12:87:66:3D',
    safetyNumber: '84920 18492 01849 20184 92018 49201 84920 18492 01849 20184 92018 49201',
    isFavorite: false,
    isBlocked: false,
    isOnline: false,
    lastSeen: 'Yesterday',
    ratchetStep: 2
  }
];

export interface SpoolItem {
  id: string;
  recipientTejaId: string;
  senderTejaId: string;
  ciphertextPreview: string;
  ivHex: string;
  messageType: string;
  createdAt: string;
  expiresAt: string;
  status: 'queued' | 'hard-deleted-ack';
}

export function useTejaStore() {
  const [identity, setIdentity] = useState<UserIdentity | null>(null);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [activeContactId, setActiveContactId] = useState<string>('contact-ananya');
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isSmartBlurActive, setIsSmartBlurActive] = useState<boolean>(true);
  const [noiseCancellationActive, setNoiseCancellationActive] = useState<boolean>(true);
  const [spoolQueue, setSpoolQueue] = useState<SpoolItem[]>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Active call state
  const [callSession, setCallSession] = useState<CallSession>({
    isActive: false,
    contact: INITIAL_CONTACTS[0],
    type: 'voice',
    status: 'calling',
    durationSeconds: 0,
    noiseCancellationActive: true,
    isMuted: false,
    isVideoOff: false,
    privacyThreatDetected: false
  });

  const timerRef = useRef<any>(null);

  // Initialize or load identity & preferences from storage
  useEffect(() => {
    async function init() {
      try {
        const savedLang = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as LanguageCode | null;
        if (savedLang) setLanguage(savedLang);

        const savedBlur = localStorage.getItem(STORAGE_KEYS.SMART_BLUR);
        if (savedBlur !== null) setIsSmartBlurActive(savedBlur === 'true');

        const savedNoise = localStorage.getItem(STORAGE_KEYS.NOISE_CANC);
        if (savedNoise !== null) setNoiseCancellationActive(savedNoise === 'true');

        const savedContacts = localStorage.getItem(STORAGE_KEYS.CONTACTS);
        if (savedContacts) {
          setContacts(JSON.parse(savedContacts));
        }

        const savedIdentityStr = localStorage.getItem(STORAGE_KEYS.IDENTITY);
        let currentIdentity: UserIdentity;

        if (savedIdentityStr) {
          currentIdentity = JSON.parse(savedIdentityStr);
          setIdentity(currentIdentity);
        } else {
          // Generate pristine zero-knowledge identity on first launch
          currentIdentity = await createNewIdentity('You (Verified Operator)');
          setIdentity(currentIdentity);
          localStorage.setItem(STORAGE_KEYS.IDENTITY, JSON.stringify(currentIdentity));
        }

        // Initialize seed messages if none exist
        const savedMsgs = localStorage.getItem(STORAGE_KEYS.MESSAGES);
        if (savedMsgs) {
          setMessages(JSON.parse(savedMsgs));
        } else {
          // Create initial seed messages with real AES-GCM envelopes
          const initialEnvelopes = await Promise.all([
            encryptEnvelope(
              "Session keys established with Double Ratchet (X3DH). No phone number or server copy exists.",
              13,
              'text'
            ),
            encryptEnvelope(
              "Smart Privacy Mode is enabled. Tap and hold any message or contact to reveal it.",
              14,
              'text'
            )
          ]);

          const ananyaMsgs: ChatMessage[] = [
            {
              id: 'init-msg-01',
              senderId: 'contact-ananya',
              senderTejaId: INITIAL_CONTACTS[0].tejaId,
              recipientTejaId: currentIdentity.tejaId,
              plaintext: "Session keys established with Double Ratchet (X3DH). No phone number or server copy exists.",
              envelope: initialEnvelopes[0],
              timestamp: '10:14 AM',
              isSelf: false,
              status: 'read'
            },
            {
              id: 'init-msg-02',
              senderId: 'self',
              senderTejaId: currentIdentity.tejaId,
              recipientTejaId: INITIAL_CONTACTS[0].tejaId,
              plaintext: "Smart Privacy Mode is enabled. Tap and hold any message or contact to reveal it.",
              envelope: initialEnvelopes[1],
              timestamp: '10:15 AM',
              isSelf: true,
              status: 'read'
            }
          ];

          const initialMap: Record<string, ChatMessage[]> = {
            'contact-ananya': ananyaMsgs,
            'contact-vikram': [
              {
                id: 'vikram-msg-01',
                senderId: 'contact-vikram',
                senderTejaId: INITIAL_CONTACTS[1].tejaId,
                recipientTejaId: currentIdentity.tejaId,
                plaintext: "Acoustic noise cancellation is verified on WebRTC streams. Hardware echo suppression active.",
                envelope: await encryptEnvelope("Acoustic noise cancellation is verified on WebRTC streams. Hardware echo suppression active.", 7),
                timestamp: '09:40 AM',
                isSelf: false,
                status: 'read' as const
              }
            ]
          };

          setMessages(initialMap);
          localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(initialMap));
        }
      } catch (e) {
        console.error('Initialization error:', e);
      } finally {
        setIsInitialized(true);
      }
    }
    init();
  }, []);

  // Save contacts on change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
    }
  }, [contacts, isInitialized]);

  // Save messages on change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    }
  }, [messages, isInitialized]);

  // Call timer effect
  useEffect(() => {
    if (callSession.isActive && callSession.status === 'connected') {
      timerRef.current = setInterval(() => {
        setCallSession(prev => ({
          ...prev,
          durationSeconds: prev.durationSeconds + 1
        }));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callSession.isActive, callSession.status]);

  // Change Language
  const updateLanguage = useCallback((lang: LanguageCode) => {
    setLanguage(lang);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  }, []);

  // Toggle Global Smart Blur
  const toggleSmartBlur = useCallback(() => {
    setIsSmartBlurActive(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.SMART_BLUR, String(next));
      return next;
    });
  }, []);

  // Toggle Noise Cancellation default
  const toggleNoiseCancellation = useCallback(() => {
    setNoiseCancellationActive(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.NOISE_CANC, String(next));
      return next;
    });
  }, []);

  // Send a message
  const sendMessage = useCallback(
    async (plaintext: string, attachmentType?: 'photo' | 'voice', attachmentUrl?: string) => {
      if (!identity || !plaintext.trim()) return;

      const activeContact = contacts.find(c => c.id === activeContactId);
      if (!activeContact || activeContact.isBlocked) return;

      const newRatchetIndex = (activeContact.ratchetStep || 0) + 1;
      const envelope = await encryptEnvelope(
        plaintext,
        newRatchetIndex,
        attachmentType || 'text'
      );

      // Create spool item demonstrating zero-knowledge relay
      const spoolId = `spool-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const spoolRecord: SpoolItem = {
        id: spoolId,
        recipientTejaId: activeContact.tejaId,
        senderTejaId: identity.tejaId,
        ciphertextPreview: `${envelope.ciphertextBase64.slice(0, 24)}...`,
        ivHex: envelope.ivBase64.slice(0, 16),
        messageType: attachmentType || 'text',
        createdAt: new Date().toLocaleTimeString(),
        expiresAt: '14 Days (TTL)',
        status: 'queued'
      };

      setSpoolQueue(prev => [spoolRecord, ...prev.slice(0, 19)]);

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let attachmentData = undefined;
      if (attachmentType) {
        const { keyHex } = generateMediaEnvelopeKey();
        attachmentData = {
          type: attachmentType,
          url: attachmentUrl,
          mediaKeyHex: keyHex,
          sizeBytes: attachmentType === 'photo' ? 142800 : 38900
        };
      }

      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        senderId: 'self',
        senderTejaId: identity.tejaId,
        recipientTejaId: activeContact.tejaId,
        plaintext,
        envelope,
        timestamp: timeStr,
        isSelf: true,
        status: 'delivered',
        attachment: attachmentData
      };

      // Append to active contact messages
      setMessages(prev => ({
        ...prev,
        [activeContactId]: [...(prev[activeContactId] || []), newMsg]
      }));

      // Update ratchet step
      setContacts(prev =>
        prev.map(c => (c.id === activeContactId ? { ...c, ratchetStep: newRatchetIndex } : c))
      );

      // Trigger automatic Delivery ACK hard-purge on the relay spool
      setTimeout(() => {
        setSpoolQueue(prev =>
          prev.map(item =>
            item.id === spoolId ? { ...item, status: 'hard-deleted-ack' } : item
          )
        );
      }, 1200);

      // Simulate intelligent peer response for realistic E2EE testing
      setTimeout(async () => {
        const replyResponses = [
          "Ciphertext acknowledged. Ratchet advanced to next ephemeral state.",
          "Verified! AES-256-GCM authentication tag matched with zero leakage.",
          "Received securely. The spool relay has already hard-deleted the transmission record.",
          "Understood. Calling engine with acoustic noise cancellation is ready whenever needed.",
          "Acknowledged. The 24-word recovery ensures our identities remain decoupled from cellular networks."
        ];
        const randomReply = replyResponses[Math.floor(Math.random() * replyResponses.length)];
        const replyRatchetIndex = newRatchetIndex + 1;
        const replyEnvelope = await encryptEnvelope(randomReply, replyRatchetIndex, 'text');

        const replyMsg: ChatMessage = {
          id: `reply-${Date.now()}`,
          senderId: activeContactId,
          senderTejaId: activeContact.tejaId,
          recipientTejaId: identity.tejaId,
          plaintext: randomReply,
          envelope: replyEnvelope,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSelf: false,
          status: 'delivered'
        };

        setMessages(prev => ({
          ...prev,
          [activeContactId]: [...(prev[activeContactId] || []), replyMsg]
        }));

        setContacts(prev =>
          prev.map(c => (c.id === activeContactId ? { ...c, ratchetStep: replyRatchetIndex } : c))
        );
      }, 2000);
    },
    [identity, contacts, activeContactId]
  );

  // Add a new contact
  const addContact = useCallback(
    async (tejaId: string, nickname: string) => {
      if (!identity) return;
      const formattedTejaId = tejaId.toUpperCase().trim();
      const safetyNumber = await computeSafetyNumber(identity.tejaId, formattedTejaId);

      const newContact: Contact = {
        id: `contact-${Date.now()}`,
        tejaId: formattedTejaId,
        defaultName: nickname || formattedTejaId,
        privateNickname: nickname || formattedTejaId,
        avatarSeed: formattedTejaId,
        publicKeyFingerprint: `${formattedTejaId.slice(5, 7)}:${formattedTejaId.slice(7, 9)}:A1:B2:C3:D4:E5:F6:11:22:33:44:55:66:77:88`,
        safetyNumber,
        isFavorite: false,
        isBlocked: false,
        isOnline: true,
        ratchetStep: 0
      };

      setContacts(prev => [newContact, ...prev]);
      setActiveContactId(newContact.id);
      return newContact;
    },
    [identity]
  );

  // Update contact's private nickname (stored client-side only for zero-knowledge)
  const updateNickname = useCallback((contactId: string, newNickname: string) => {
    setContacts(prev =>
      prev.map(c => (c.id === contactId ? { ...c, privateNickname: newNickname } : c))
    );
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback((contactId: string) => {
    setContacts(prev =>
      prev.map(c => (c.id === contactId ? { ...c, isFavorite: !c.isFavorite } : c))
    );
  }, []);

  // Toggle block
  const toggleBlock = useCallback((contactId: string) => {
    setContacts(prev =>
      prev.map(c => (c.id === contactId ? { ...c, isBlocked: !c.isBlocked } : c))
    );
  }, []);

  // Start Call
  const startCall = useCallback((type: 'voice' | 'video') => {
    const contact = contacts.find(c => c.id === activeContactId) || contacts[0];
    setCallSession({
      isActive: true,
      contact,
      type,
      status: 'calling',
      durationSeconds: 0,
      noiseCancellationActive,
      isMuted: false,
      isVideoOff: false,
      privacyThreatDetected: false
    });

    // Simulate peer pickup
    setTimeout(() => {
      setCallSession(prev => ({
        ...prev,
        status: 'connected'
      }));
    }, 1800);
  }, [contacts, activeContactId, noiseCancellationActive]);

  // End Call
  const endCall = useCallback(() => {
    setCallSession(prev => ({
      ...prev,
      isActive: false,
      status: 'ended'
    }));
  }, []);

  // Toggle Call Mute
  const toggleCallMute = useCallback(() => {
    setCallSession(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  // Toggle Call Video
  const toggleCallVideo = useCallback(() => {
    setCallSession(prev => ({ ...prev, isVideoOff: !prev.isVideoOff }));
  }, []);

  // Toggle Call Noise Cancellation
  const toggleCallNoise = useCallback(() => {
    setCallSession(prev => ({
      ...prev,
      noiseCancellationActive: !prev.noiseCancellationActive
    }));
  }, []);

  // Simulate or trigger Call Privacy Shield threat (shoulder surfer)
  const triggerPrivacyThreat = useCallback(() => {
    setCallSession(prev => ({
      ...prev,
      privacyThreatDetected: !prev.privacyThreatDetected,
      privacyActionTaken: !prev.privacyThreatDetected ? 'BLUR_APPLIED' : undefined
    }));
  }, []);

  // Restore account from 24 words
  const restoreFromMnemonic = useCallback(
    async (mnemonicWords: string[], tejaId?: string) => {
      const restored = await deriveIdentityFromMnemonic(mnemonicWords, tejaId);
      setIdentity(restored);
      localStorage.setItem(STORAGE_KEYS.IDENTITY, JSON.stringify(restored));
      return restored;
    },
    []
  );

  // Permanently delete account: purges everything
  const deleteAccountPermanently = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.IDENTITY);
    localStorage.removeItem(STORAGE_KEYS.CONTACTS);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.SMART_BLUR);
    localStorage.removeItem(STORAGE_KEYS.NOISE_CANC);
    setIdentity(null);
    setContacts([]);
    setMessages({});
    setSpoolQueue([]);
  }, []);

  const activeContact = contacts.find(c => c.id === activeContactId) || contacts[0];
  const activeMessages = (activeContact ? messages[activeContact.id] : []) || [];

  return {
    identity,
    contacts,
    activeContact,
    activeContactId,
    setActiveContactId,
    messages: activeMessages,
    allMessages: messages,
    language,
    updateLanguage,
    isSmartBlurActive,
    toggleSmartBlur,
    noiseCancellationActive,
    toggleNoiseCancellation,
    sendMessage,
    addContact,
    updateNickname,
    toggleFavorite,
    toggleBlock,
    callSession,
    startCall,
    endCall,
    toggleCallMute,
    toggleCallVideo,
    toggleCallNoise,
    triggerPrivacyThreat,
    restoreFromMnemonic,
    deleteAccountPermanently,
    spoolQueue,
    isInitialized
  };
}
