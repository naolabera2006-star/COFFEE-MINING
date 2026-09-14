import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';
import { Home, Layers, Building2, Gift, FileSpreadsheet, Share2, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentTab, setCurrentTab, activeOrders, user, t } = useApp();

  const allTabs: { id: NavigationTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; badgeCount?: number; adminOnly?: boolean }[] = [
    { id: 'home', label: t('tabHome', 'Home'), icon: Home },
    { id: 'plans', label: t('tabPlans', 'Plans'), icon: Layers, badgeCount: activeOrders.length > 0 ? activeOrders.length : undefined },
    { id: 'properties', label: t('tabProperties', 'Estates'), icon: Building2 },
    { id: 'bonus', label: t('tabBonus', 'Bonus'), icon: Gift },
    { id: 'report', label: t('tabReport', 'Report'), icon: FileSpreadsheet, adminOnly: true },
    { id: 'share', label: t('tabShare', 'Share'), icon: Share2 },
    { id: 'mine', label: t('tabMine', 'Mine'), icon: User }
  ];

  const visibleTabs = allTabs.filter(tab => !tab.adminOnly || user.role === 'admin');

  return (
    <div
      id="bottom-navigation-bar"
      className="sticky bottom-0 left-0 right-0 z-30 bg-[#0e2a1e]/95 border-t border-[#1b4e36] shadow-[0_-8px_25px_rgba(0,0,0,0.85)] px-1.5 py-1.5 backdrop-blur-xl"
    >
      <div className={`max-w-md mx-auto grid ${visibleTabs.length === 7 ? 'grid-cols-7' : visibleTabs.length === 6 ? 'grid-cols-6' : 'grid-cols-5'} items-center justify-items-center`}>
        {visibleTabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const IconComponent = tab.icon;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 group relative w-full ${
                isActive ? 'scale-105' : 'hover:opacity-85'
              }`}
            >
              {/* Elegant Round icon badge */}
              <div
                className={`relative w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full flex items-center justify-center transition-all duration-300 shadow-xs border ${
                  isActive
                    ? 'border-emerald-300/80 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.45)] scale-110'
                    : 'border-[#1b4e36]/70 bg-[#103324] text-emerald-200/70'
                }`}
              >
                {/* Inner shine */}
                <div className="absolute inset-[1.5px] rounded-full border border-white/20 pointer-events-none" />
                
                <IconComponent
                  size={isActive ? 16 : 14}
                  className={`transition-transform duration-200 stroke-[2.2] ${
                    isActive ? 'text-black font-black scale-105' : 'text-emerald-200 group-hover:text-white'
                  }`}
                />

                {/* Badge indicator if any */}
                {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-400 text-black font-black text-[8.5px] w-3.5 h-3.5 rounded-full flex items-center justify-center border border-black shadow-xs animate-pulse">
                    {tab.badgeCount}
                  </span>
                )}
              </div>

              {/* Label matching Elegant style */}
              <span
                className={`text-[9.5px] sm:text-[10px] font-semibold mt-1 tracking-tight transition-colors duration-200 truncate max-w-full ${
                  isActive ? 'text-emerald-300 font-bold' : 'text-zinc-400'
                }`}
              >
                {tab.label}
              </span>

              {/* Active subtle bottom dot */}
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5 animate-pulse-subtle shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
