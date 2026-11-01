import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Heart, Shield, Share2, Settings, Users, KeyRound, Server, Globe, ChevronDown, Check } from 'lucide-react';
import { translations, AVAILABLE_LANGUAGES, LanguageCode } from '../i18n/translations';
import { UserIdentity } from '../types';

interface HeaderProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  isSmartBlurActive: boolean;
  onToggleSmartBlur: () => void;
  onOpenContacts: () => void;
  onOpenCryptoInspector: () => void;
  onOpenSpool: () => void;
  onOpenDonation: () => void;
  onOpenShare: () => void;
  onOpenSettings: () => void;
  identity: UserIdentity | null;
  activeTab: 'chats' | 'contacts';
  setActiveTab: (tab: 'chats' | 'contacts') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  isSmartBlurActive,
  onToggleSmartBlur,
  onOpenContacts,
  onOpenCryptoInspector,
  onOpenSpool,
  onOpenDonation,
  onOpenShare,
  onOpenSettings,
  identity,
  activeTab,
  setActiveTab
}) => {
  const t = translations[currentLanguage];
  const [isLangOpen, setIsLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangObj = AVAILABLE_LANGUAGES.find(l => l.code === currentLanguage) || AVAILABLE_LANGUAGES[0];

  return (
    <header className="flex items-center justify-between gap-3 md:gap-8 px-4 md:px-6 py-3 bg-[#062618] border-b border-[#14472D] select-none shrink-0 sticky top-0 z-40 backdrop-blur-md">
      {/* Zone 1: Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
          <Shield size={18} />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap">
            TEJA
          </span>
          <span className="text-[10px] text-emerald-400/80 font-mono tracking-wider -mt-1 hidden sm:inline">
            E2EE ZERO-TRUST
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-emerald-200/80">
        <button
          onClick={() => setActiveTab('chats')}
          className={`hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'chats' ? 'text-white border-b-2 border-emerald-400 font-semibold' : ''
          }`}
        >
          {t.chats}
        </button>

        <button
          onClick={onOpenContacts}
          className="hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
        >
          <Users size={15} />
          <span>{t.contacts}</span>
        </button>

        <button
          onClick={onOpenCryptoInspector}
          className="hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
        >
          <KeyRound size={15} />
          <span>{t.cryptoInspector}</span>
        </button>

        <button
          onClick={onOpenSpool}
          className="hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
        >
          <Server size={15} />
          <span>{t.spoolQueue}</span>
        </button>
      </nav>

      {/* Zone 3: Interactive Action Controls */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Language Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#093522] border border-[#164E33] hover:border-emerald-500/50 text-xs font-semibold text-emerald-200 hover:text-white transition-colors"
            title="Switch Language / ഭാഷ മാറ്റുക / भाषा बदलें / ভাষা পরিবর্তন"
            aria-label="Select Language"
          >
            <Globe size={14} className="text-emerald-400 shrink-0" />
            <span className="font-sans whitespace-nowrap">{currentLangObj.native}</span>
            <ChevronDown size={12} className={`transition-transform opacity-70 ${isLangOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Languages Dropdown Menu */}
          {isLangOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#08291B] border border-[#164E33] rounded-2xl shadow-2xl overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-96 overflow-y-auto">
              <div className="px-3 py-2 border-b border-[#14472D] text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                Select Language ({AVAILABLE_LANGUAGES.length})
              </div>
              <div className="divide-y divide-[#14472D]/40">
                {AVAILABLE_LANGUAGES.map(lang => {
                  const isSelected = currentLanguage === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs transition-colors ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                          : 'text-white hover:bg-[#0A3423] hover:text-emerald-200'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{lang.native}</span>
                        <span className="text-[10px] text-emerald-400/80 font-mono">
                          {lang.label} · {lang.region}
                        </span>
                      </div>
                      {isSelected && <Check size={14} className="text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Smart Privacy Blur Toggle */}
        <button
          onClick={onToggleSmartBlur}
          className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium ${
            isSmartBlurActive
              ? 'bg-emerald-500 text-black shadow-sm'
              : 'bg-[#093522] border border-[#164E33] text-emerald-300 hover:text-white hover:border-emerald-500/50'
          }`}
          title={isSmartBlurActive ? t.smartBlurActive : t.smartBlurDesc}
          aria-label="Toggle Smart Privacy Blur"
        >
          {isSmartBlurActive ? <EyeOff size={16} /> : <Eye size={16} />}
          <span className="hidden xl:inline">{isSmartBlurActive ? 'Blur ON' : 'Blur OFF'}</span>
        </button>

        {/* Share App Trigger */}
        <button
          onClick={onOpenShare}
          className="p-2 rounded-lg bg-[#093522] border border-[#164E33] text-emerald-300 hover:text-white hover:border-emerald-500/50 transition-colors"
          title={t.shareApp}
          aria-label={t.shareApp}
        >
          <Share2 size={16} />
        </button>

        {/* Voluntary Support Button */}
        <button
          onClick={onOpenDonation}
          className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-colors flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap"
          title={t.supportUs}
        >
          <Heart size={14} className="text-emerald-400 fill-emerald-400/40" />
          <span className="hidden sm:inline">Support</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg bg-[#093522] border border-[#164E33] text-emerald-300 hover:text-white hover:border-emerald-500/50 transition-colors flex items-center gap-1.5"
          title="Account Settings & BIP-39 Recovery"
          aria-label="Settings"
        >
          <Settings size={16} />
          {identity && (
            <span className="hidden md:inline font-mono text-[11px] text-emerald-400">
              {identity.tejaId.slice(5, 14)}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
