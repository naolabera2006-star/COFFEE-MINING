import React from 'react';
import { useApp } from '../../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../../i18n/translations';
import {
  Menu,
  HelpCircle,
  User,
  Home,
  Zap,
  Gift,
  Users
} from 'lucide-react';
import { NavigationTab } from '../../types';

export const TopHeader: React.FC = () => {
  const { openModal, language, currentTab, setCurrentTab, t, user } = useApp();

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const navLinks: { id: NavigationTab; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'plans', label: 'Plan', icon: Zap },
    { id: 'bonus', label: 'Reward', icon: Gift },
    { id: 'share', label: 'Team', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#0e2a1e]/95 backdrop-blur-md border-b border-[#1b4e36] select-none shadow-sm">
      {/* Top Bar: Profile & Controls */}
      <div className="px-3.5 sm:px-4 py-2.5 flex items-center justify-between">
        {/* Logged in User Profile Info & Profile Picture */}
        <button
          id="btn-top-user-profile"
          onClick={() => setCurrentTab('mine')}
          className="flex items-center gap-2.5 text-left group cursor-pointer hover:opacity-90 transition-opacity"
          title="View Profile Account"
        >
          {/* User Profile Avatar / Picture */}
          <div className="relative shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName || user.email || 'Profile'}
                className="w-9 h-9 rounded-full object-cover border-2 border-emerald-400/80 ring-2 ring-emerald-500/20 shadow-md"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 text-black flex items-center justify-center font-black shadow-md shadow-emerald-500/20">
                <User size={18} className="stroke-[2.5]" />
              </div>
            )}
            {/* Active Status indicator dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-zinc-950 rounded-full" />
          </div>

          {/* User Details: Logged Name & ID */}
          <div className="flex flex-col text-left min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-xs sm:text-sm tracking-tight font-['Outfit'] group-hover:text-emerald-300 transition-colors max-w-[150px] sm:max-w-[220px] truncate">
                {user.displayName || user.email || user.phone || 'User Account'}
              </span>
              {user.role === 'admin' && (
                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Admin
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] text-emerald-300 font-mono font-semibold flex items-center gap-1">
              <span>ID: {user.userId}</span>
            </span>
          </div>
        </button>

        {/* Action icons: Guide Button, Fast Language Switcher, Settings */}
        <div className="flex items-center gap-1.5">
          {/* Quick User Guide Button */}
          <button
            id="btn-top-guide"
            onClick={() => openModal('guide')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#103324] hover:bg-[#16422f] text-emerald-200 hover:text-white border border-[#1b4e36] text-[11px] font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
            title="User Guide & Tutorials"
          >
            <HelpCircle size={13} className="text-emerald-400" />
            <span className="hidden xs:inline">{t('guide', 'Guide')}</span>
          </button>

          {/* Fast Language Switcher Pill */}
          <button
            id="btn-top-language"
            onClick={() => openModal('settings')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#103324] hover:bg-[#16422f] text-emerald-200 hover:text-white border border-[#1b4e36] text-[11px] font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
            title="Switch Language (English / አማርኛ / Oromoo)"
          >
            <span className="text-xs">{currentLangObj.flag}</span>
            <span className="font-bold">{currentLangObj.code.toUpperCase()}</span>
          </button>

          {/* Settings Menu */}
          <button
            id="btn-top-settings-menu"
            onClick={() => openModal('settings')}
            className="w-8 h-8 rounded-xl bg-[#103324] hover:bg-[#16422f] text-emerald-200 hover:text-white border border-[#1b4e36] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 group"
            title={t('settings', 'Settings')}
            aria-label="Settings Menu"
          >
            <Menu size={16} className="text-emerald-300 group-hover:text-emerald-100 transition-colors" />
          </button>
        </div>
      </div>

      {/* Top Panel Navigation Bar: Home, Plan, Reward, Team */}
      <nav aria-label="Top navigation" className="px-2 pb-2 pt-0.5 grid grid-cols-4 gap-1.5 border-t border-[#1b4e36]/60 bg-[#0a2318]/60">
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`top-nav-${item.id}`}
              onClick={() => setCurrentTab(item.id)}
              className={`py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-400 text-black shadow-md shadow-emerald-400/25 font-black scale-[1.02]'
                  : 'bg-[#0e2a1e]/80 text-zinc-300 hover:text-emerald-300 hover:bg-[#103324] border border-[#1b4e36]/80'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-black' : 'text-emerald-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
