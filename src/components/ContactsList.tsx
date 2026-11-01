import React, { useState } from 'react';
import { Search, UserPlus, Star, ShieldAlert, Phone, Video, Edit2, Check, X, ShieldCheck } from 'lucide-react';
import { Contact } from '../types';
import { translations, LanguageCode } from '../i18n/translations';

interface ContactsListProps {
  currentLanguage: LanguageCode;
  contacts: Contact[];
  activeContactId: string;
  onSelectContact: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onToggleBlock: (id: string) => void;
  onUpdateNickname: (id: string, newNickname: string) => void;
  onAddContact: (tejaId: string, nickname: string) => void;
  onInitiateCall: (contactId: string, type: 'voice' | 'video') => void;
  onOpenSafetyNumbers: (contact: Contact) => void;
  isGlobalBlurActive: boolean;
}

export const ContactsList: React.FC<ContactsListProps> = ({
  currentLanguage,
  contacts,
  activeContactId,
  onSelectContact,
  onToggleFavorite,
  onToggleBlock,
  onUpdateNickname,
  onAddContact,
  onInitiateCall,
  onOpenSafetyNumbers,
  isGlobalBlurActive
}) => {
  const t = translations[currentLanguage];
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTejaId, setNewTejaId] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNickname, setEditingNickname] = useState('');
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  const startReveal = (id: string) => {
    if (!isGlobalBlurActive) return;
    setRevealedIds(prev => ({ ...prev, [id]: true }));
  };

  const endReveal = (id: string) => {
    if (!isGlobalBlurActive) return;
    setRevealedIds(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const isItemBlurred = (id: string) => {
    if (!isGlobalBlurActive) return false;
    return !revealedIds[id];
  };

  const filteredContacts = contacts.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.privateNickname.toLowerCase().includes(q) ||
      c.defaultName.toLowerCase().includes(q) ||
      c.tejaId.toLowerCase().includes(q)
    );
  });

  const favorites = filteredContacts.filter(c => c.isFavorite && !c.isBlocked);
  const others = filteredContacts.filter(c => !c.isFavorite && !c.isBlocked);
  const blocked = filteredContacts.filter(c => c.isBlocked);

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTejaId.trim()) return;
    onAddContact(newTejaId.trim(), newNickname.trim() || newTejaId.trim());
    setNewTejaId('');
    setNewNickname('');
    setShowAddModal(false);
  };

  const handleSaveNickname = (contactId: string) => {
    if (editingNickname.trim()) {
      onUpdateNickname(contactId, editingNickname.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#062618] border-r border-[#14472D] text-white select-none overflow-hidden">
      {/* Top Search & Add Contact Header */}
      <div className="p-4 border-b border-[#14472D] space-y-3 shrink-0 bg-[#08291B]">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <span>{t.contacts}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono">
              {contacts.length}
            </span>
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <UserPlus size={14} />
            <span>{t.addContact}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-2.5 text-emerald-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchTejaId}
            className="w-full bg-[#051E13] border border-[#14472D] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-emerald-700/80 focus:outline-none focus:border-emerald-500 transition-all font-sans"
          />
        </div>
      </div>

      {/* Contacts List Stream */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div>
            <div className="px-3 py-1 text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Star size={11} className="fill-emerald-400" />
              <span>{t.favorites}</span>
            </div>
            <div className="space-y-1 mt-1">
              {favorites.map(c => renderContactCard(c))}
            </div>
          </div>
        )}

        {/* General Contacts Section */}
        <div>
          {favorites.length > 0 && others.length > 0 && (
            <div className="px-3 py-1 text-[11px] font-semibold text-emerald-400/80 uppercase tracking-wider">
              <span>{t.chats}</span>
            </div>
          )}
          <div className="space-y-1 mt-1">
            {others.map(c => renderContactCard(c))}
          </div>
        </div>

        {/* Blocked Section */}
        {blocked.length > 0 && (
          <div className="pt-2 border-t border-[#14472D]/50">
            <div className="px-3 py-1 text-[11px] font-semibold text-red-400/80 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert size={12} />
              <span>Blocked Contacts</span>
            </div>
            <div className="space-y-1 mt-1">
              {blocked.map(c => renderContactCard(c))}
            </div>
          </div>
        )}

        {filteredContacts.length === 0 && (
          <div className="p-8 text-center text-xs text-emerald-600">
            No contacts found matching &ldquo;{searchQuery}&rdquo;.
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0C3E27] border border-[#164E33] rounded-2xl p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#093522] text-emerald-400 hover:text-white"
            >
              <X size={16} />
            </button>

            <h3 className="text-base font-bold text-white mb-1">{t.addContact}</h3>
            <p className="text-xs text-emerald-300/80 mb-4">
              Add a peer by their unique TEJA ID. Zero servers track this contact association.
            </p>

            <form onSubmit={handleCreateContact} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-emerald-300 mb-1">
                  {t.contactTejaId}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TEJA-7F9A-4B21-8812"
                  value={newTejaId}
                  onChange={(e) => setNewTejaId(e.target.value)}
                  className="w-full bg-[#051E13] border border-[#14472D] rounded-xl px-4 py-2 text-sm text-white font-mono placeholder-emerald-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-300 mb-1">
                  {t.contactNickname}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alice (Security)"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  className="w-full bg-[#051E13] border border-[#14472D] rounded-xl px-4 py-2 text-sm text-white placeholder-emerald-700 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-emerald-400/70 mt-1 block">
                  Nicknames are stored client-side only for zero-knowledge privacy.
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl bg-[#093522] text-xs font-semibold hover:bg-[#14472D]"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  function renderContactCard(contact: Contact) {
    const isSelected = activeContactId === contact.id;
    const blurred = isItemBlurred(contact.id);
    const isEditing = editingId === contact.id;

    return (
      <div
        key={contact.id}
        onClick={() => onSelectContact(contact.id)}
        className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer border flex items-center justify-between group ${
          isSelected
            ? 'bg-[#093522] border-emerald-500/50 shadow-sm'
            : 'bg-[#08291B]/60 border-transparent hover:bg-[#08291B] hover:border-[#14472D]'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Avatar with touch-to-reveal */}
          <div
            onMouseDown={(e) => {
              e.stopPropagation();
              startReveal(contact.id);
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
              endReveal(contact.id);
            }}
            onMouseLeave={(e) => {
              e.stopPropagation();
              endReveal(contact.id);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              startReveal(contact.id);
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              endReveal(contact.id);
            }}
            className={`w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-sm text-emerald-300 shrink-0 relative transition-all duration-150 ${
              blurred ? 'filter blur-sm' : 'filter-none'
            }`}
          >
            {contact.privateNickname.charAt(0) || contact.defaultName.charAt(0)}
            {contact.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#062618]" />
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <div
                className="flex items-center gap-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="text"
                  value={editingNickname}
                  onChange={(e) => setEditingNickname(e.target.value)}
                  className="bg-[#051E13] border border-emerald-500 rounded px-2 py-0.5 text-xs text-white"
                />
                <button
                  onClick={() => handleSaveNickname(contact.id)}
                  className="p-1 bg-emerald-500 text-black rounded"
                >
                  <Check size={12} />
                </button>
              </div>
            ) : (
              <div
                onMouseDown={(e) => {
                  e.stopPropagation();
                  startReveal(contact.id);
                }}
                onMouseUp={(e) => {
                  e.stopPropagation();
                  endReveal(contact.id);
                }}
                onMouseLeave={(e) => {
                  e.stopPropagation();
                  endReveal(contact.id);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  startReveal(contact.id);
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  endReveal(contact.id);
                }}
                className={`text-xs font-semibold text-white truncate transition-all duration-150 ${
                  blurred ? 'filter blur-sm select-none' : 'filter-none'
                }`}
              >
                {contact.privateNickname}
              </div>
            )}
            <div className="text-[10px] text-emerald-400/80 font-mono truncate">
              {contact.tejaId}
            </div>
          </div>
        </div>

        {/* Hover / Context Actions */}
        <div
          className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Favorite Toggle */}
          <button
            onClick={() => onToggleFavorite(contact.id)}
            className={`p-1.5 rounded-lg hover:bg-[#14472D] transition-colors ${
              contact.isFavorite ? 'text-emerald-400' : 'text-emerald-600'
            }`}
            title="Toggle Favorite"
          >
            <Star size={13} className={contact.isFavorite ? 'fill-emerald-400' : ''} />
          </button>

          {/* Quick Voice Call */}
          <button
            onClick={() => onInitiateCall(contact.id, 'voice')}
            className="p-1.5 rounded-lg text-emerald-400 hover:bg-[#14472D] transition-colors"
            title="Voice Call"
          >
            <Phone size={13} />
          </button>

          {/* Safety Numbers */}
          <button
            onClick={() => onOpenSafetyNumbers(contact)}
            className="p-1.5 rounded-lg text-emerald-400 hover:bg-[#14472D] transition-colors"
            title="Verify Safety Numbers"
          >
            <ShieldCheck size={13} />
          </button>

          {/* Edit Nickname */}
          <button
            onClick={() => {
              setEditingId(contact.id);
              setEditingNickname(contact.privateNickname);
            }}
            className="p-1.5 rounded-lg text-emerald-400 hover:bg-[#14472D] transition-colors"
            title="Edit Private Nickname"
          >
            <Edit2 size={13} />
          </button>
        </div>
      </div>
    );
  }
};
