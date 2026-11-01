import { useState } from 'react';
import { useTejaStore } from './hooks/useTejaStore';
import { Header } from './components/Header';
import { ContactsList } from './components/ContactsList';
import { ChatScreen } from './components/ChatScreen';
import { CallModal } from './components/CallModal';
import { CryptoInspectorModal } from './components/CryptoInspectorModal';
import { SafetyNumberModal } from './components/SafetyNumberModal';
import { DonationModal } from './components/DonationModal';
import { ShareModal } from './components/ShareModal';
import { SettingsModal } from './components/SettingsModal';
import { SpoolInspectorModal } from './components/SpoolInspectorModal';
import { ChatMessage, Contact } from './types';
import { Shield, Sparkles, MessageSquare, Users, Lock } from 'lucide-react';

export default function App() {
  const {
    identity,
    contacts,
    activeContact,
    activeContactId,
    setActiveContactId,
    messages,
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
  } = useTejaStore();

  // Modals state
  const [activeTab, setActiveTab] = useState<'chats' | 'contacts'>('chats');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [isCryptoInspectorOpen, setIsCryptoInspectorOpen] = useState(false);
  const [inspectedMessage, setInspectedMessage] = useState<ChatMessage | null>(null);
  const [isSafetyNumbersOpen, setIsSafetyNumbersOpen] = useState(false);
  const [safetyContact, setSafetyContact] = useState<Contact | null>(null);
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSpoolOpen, setIsSpoolOpen] = useState(false);

  // When a message envelope is inspected
  const handleInspectMessage = (msg: ChatMessage) => {
    setInspectedMessage(msg);
    setIsCryptoInspectorOpen(true);
  };

  // Inspect the latest message envelope or a generic one
  const handleOpenGeneralCryptoInspector = () => {
    if (messages.length > 0) {
      setInspectedMessage(messages[messages.length - 1]);
    } else {
      setInspectedMessage(null);
    }
    setIsCryptoInspectorOpen(true);
  };

  // When verifying safety numbers
  const handleOpenSafetyNumbers = (contact?: Contact) => {
    setSafetyContact(contact || activeContact);
    setIsSafetyNumbersOpen(true);
  };

  // Select contact & switch to chat on mobile
  const handleSelectContact = (id: string) => {
    setActiveContactId(id);
    setMobileView('chat');
  };

  if (!isInitialized || !identity) {
    return (
      <div className="h-screen w-screen bg-[#051E13] flex flex-col items-center justify-center text-white select-none">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 animate-pulse">
          <Shield size={32} />
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-2">TEJA Secure Messaging</h1>
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
          <Lock size={12} />
          <span>Deriving Zero-Knowledge Cryptographic Identity...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[#051E13] text-[#F0FDF4] overflow-hidden font-sans">
      {/* Top Bar adhering to the Top Bar Contract */}
      <Header
        currentLanguage={language}
        onLanguageChange={updateLanguage}
        isSmartBlurActive={isSmartBlurActive}
        onToggleSmartBlur={toggleSmartBlur}
        onOpenContacts={() => {
          setActiveTab('contacts');
          setMobileView('list');
        }}
        onOpenCryptoInspector={handleOpenGeneralCryptoInspector}
        onOpenSpool={() => setIsSpoolOpen(true)}
        onOpenDonation={() => setIsDonationOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        identity={identity}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'contacts') setMobileView('list');
        }}
      />

      {/* Main Multi-Column Interface */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Column: Contacts Directory & Chats */}
        <div
          className={`w-full md:w-80 lg:w-96 flex-shrink-0 h-full ${
            mobileView === 'chat' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <ContactsList
            currentLanguage={language}
            contacts={contacts}
            activeContactId={activeContactId}
            onSelectContact={handleSelectContact}
            onToggleFavorite={toggleFavorite}
            onToggleBlock={toggleBlock}
            onUpdateNickname={updateNickname}
            onAddContact={addContact}
            onInitiateCall={(contactId, type) => {
              setActiveContactId(contactId);
              startCall(type);
            }}
            onOpenSafetyNumbers={handleOpenSafetyNumbers}
            isGlobalBlurActive={isSmartBlurActive}
          />
        </div>

        {/* Right Column: Active Chat Stream */}
        <div
          className={`flex-1 h-full flex flex-col ${
            mobileView === 'list' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeContact ? (
            <ChatScreen
              currentLanguage={language}
              activeContact={activeContact}
              messages={messages}
              identity={identity}
              isGlobalBlurActive={isSmartBlurActive}
              onSendMessage={sendMessage}
              onInitiateCall={startCall}
              onOpenSafetyNumbers={() => handleOpenSafetyNumbers(activeContact)}
              onInspectMessageCrypto={handleInspectMessage}
              onBackToContacts={() => setMobileView('list')}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-emerald-400/80">
              <Shield size={48} className="mb-4 text-emerald-500/40" />
              <h3 className="text-lg font-bold text-white mb-2">No Active Chat</h3>
              <p className="text-xs text-emerald-300/70 max-w-sm">
                Select a contact from the list or add a peer by their TEJA ID to begin zero-knowledge end-to-end encrypted messaging.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation (Visible on small screens only) */}
      <div className="md:hidden flex items-center justify-around bg-[#062618] border-t border-[#14472D] py-2 px-4 shrink-0 z-20">
        <button
          onClick={() => setMobileView('list')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            mobileView === 'list' ? 'text-emerald-400 font-bold' : 'text-emerald-400/60'
          }`}
        >
          <Users size={18} />
          <span>Contacts</span>
        </button>

        <button
          onClick={() => setMobileView('chat')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            mobileView === 'chat' ? 'text-emerald-400 font-bold' : 'text-emerald-400/60'
          }`}
        >
          <MessageSquare size={18} />
          <span>Chat</span>
        </button>

        <button
          onClick={() => setIsCryptoInspectorOpen(true)}
          className="flex flex-col items-center gap-1 text-[11px] font-medium text-emerald-400/60 hover:text-emerald-300"
        >
          <Lock size={18} />
          <span>Ciphertext</span>
        </button>

        <button
          onClick={() => setIsShareOpen(true)}
          className="flex flex-col items-center gap-1 text-[11px] font-medium text-emerald-400/60 hover:text-emerald-300"
        >
          <Sparkles size={18} />
          <span>Share</span>
        </button>
      </div>

      {/* WebRTC Calling Modal */}
      {callSession.isActive && (
        <CallModal
          callSession={callSession}
          currentLanguage={language}
          onEndCall={endCall}
          onToggleMute={toggleCallMute}
          onToggleVideo={toggleCallVideo}
          onToggleNoise={toggleCallNoise}
          onTriggerPrivacyThreat={triggerPrivacyThreat}
        />
      )}

      {/* Ciphertext Envelope Inspector Modal */}
      {isCryptoInspectorOpen && (
        <CryptoInspectorModal
          isOpen={isCryptoInspectorOpen}
          onClose={() => setIsCryptoInspectorOpen(false)}
          message={inspectedMessage || (messages.length > 0 ? messages[messages.length - 1] : null)}
          currentLanguage={language}
        />
      )}

      {/* Safety Numbers & Key Verification Modal */}
      {isSafetyNumbersOpen && safetyContact && (
        <SafetyNumberModal
          isOpen={isSafetyNumbersOpen}
          onClose={() => setIsSafetyNumbersOpen(false)}
          contact={safetyContact}
          identity={identity}
          currentLanguage={language}
        />
      )}

      {/* Voluntary Support / Donation Modal */}
      <DonationModal
        isOpen={isDonationOpen}
        onClose={() => setIsDonationOpen(false)}
        language={language}
      />

      {/* Native Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        language={language}
        myTejaId={identity?.tejaId}
      />

      {/* Settings & Master Recovery Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        identity={identity}
        currentLanguage={language}
        onLanguageChange={updateLanguage}
        isSmartBlurActive={isSmartBlurActive}
        onToggleSmartBlur={toggleSmartBlur}
        noiseCancellationActive={noiseCancellationActive}
        onToggleNoise={toggleNoiseCancellation}
        onRestoreFromMnemonic={restoreFromMnemonic}
        onDeleteAccount={deleteAccountPermanently}
      />

      {/* Spool Queue & Automatic Hard-Pruning Inspector */}
      <SpoolInspectorModal
        isOpen={isSpoolOpen}
        onClose={() => setIsSpoolOpen(false)}
        spoolQueue={spoolQueue}
        currentLanguage={language}
      />
    </div>
  );
}
