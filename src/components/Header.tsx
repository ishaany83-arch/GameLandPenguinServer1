import React, { useState, useEffect } from 'react';
import { Search, PanelLeftClose, PanelLeftOpen, ShieldCheck, Mail, LogOut, Snowflake, Settings, Crown, Flame, ShoppingBag, Megaphone } from 'lucide-react';
import { FilterState } from '../types';
import { UserAccount, getUserPoints } from '../utils/auth';
import { PenguinMascot } from './PenguinMascot';
import { getAvatarById } from '../utils/penguinAvatars';
import { getGlobalAdminSettings, GlobalAdminSettings } from '../utils/adminVipPerks';

interface HeaderProps {
  filterState: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  onRandomGame: () => void;
  favoritesCount: number;
  totalGamesCount: number;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenSuggestForm?: () => void;
  onOpenGameStatus?: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onOpenContact?: () => void;
  onOpenAdmin?: () => void;
  onOpenPanicKey?: () => void;
  onOpenProfile?: () => void;
  onOpenStore?: () => void;
  onOpenVipLounge?: () => void;
  currentUser?: UserAccount | null;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  filterState,
  onFilterChange,
  onRandomGame,
  favoritesCount,
  totalGamesCount,
  isSidebarOpen,
  onToggleSidebar,
  onOpenSuggestForm,
  onOpenGameStatus,
  onOpenPrivacy,
  onOpenTerms,
  onOpenContact,
  onOpenAdmin,
  onOpenPanicKey,
  onOpenProfile,
  onOpenStore,
  onOpenVipLounge,
  currentUser,
  onSignOut,
}) => {
  const userPoints = getUserPoints(currentUser);
  const [adminSettings, setAdminSettings] = useState<GlobalAdminSettings>(getGlobalAdminSettings());

  useEffect(() => {
    const handleAdminUpdate = () => {
      setAdminSettings(getGlobalAdminSettings());
    };
    window.addEventListener('gameland_admin_settings_updated', handleAdminUpdate);
    return () => {
      window.removeEventListener('gameland_admin_settings_updated', handleAdminUpdate);
    };
  }, [currentUser]);

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3.5 transition-all">
      {/* Global Admin Broadcast Banner */}
      {adminSettings.announcementActive && adminSettings.announcementText && (
        <div className="mb-3 p-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black text-xs shadow-lg flex items-center justify-between gap-2 border border-amber-300 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 overflow-hidden">
            <Megaphone className="w-4 h-4 shrink-0 animate-bounce" />
            <span className="truncate">{adminSettings.announcementText}</span>
          </div>
          {adminSettings.doublePointsActive && (
            <span className="px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px] uppercase font-black shrink-0 border border-amber-300">
              ⚡ 2x XP ACTIVE
            </span>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
        
        {/* Brand & Logo + Sidebar Toggle */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-cyan-400 transition-all flex items-center gap-1.5 focus:outline-none"
              title={isSidebarOpen ? 'Close sidebar menu' : 'Open sidebar menu'}
              id="header-toggle-sidebar-btn"
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="w-5 h-5 text-cyan-400" />
              ) : (
                <PanelLeftOpen className="w-5 h-5 text-slate-300" />
              )}
              <span className="hidden sm:inline text-xs font-bold">
                {isSidebarOpen ? 'Sidebar' : 'Menu'}
              </span>
            </button>

            <button
              onClick={() => onFilterChange({ category: 'All', searchQuery: '', favoritesOnly: false })}
              className="flex items-center gap-2.5 group text-left focus:outline-none"
              id="brand-logo-btn"
            >
              <div className="shrink-0 group-hover:scale-105 transition-transform">
                <PenguinMascot pose="gaming" size="md" interactive={false} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg sm:text-xl tracking-tight text-slate-100 group-hover:text-cyan-400 transition-colors flex items-center gap-1">
                    <span>GAMELAND</span>
                    <span className="text-cyan-400 font-mono text-sm">🐧</span>
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                    <Snowflake className="w-3 h-3 text-cyan-400" />
                    <span>{totalGamesCount} Games</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">By Pebbles The Penguin</p>
              </div>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search games, tags, categories..."
              value={filterState.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 text-sm rounded-xl pl-10 pr-9 py-2.5 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-500"
              id="game-search-input"
            />
            {filterState.searchQuery && (
              <button
                onClick={() => onFilterChange({ searchQuery: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs font-bold bg-slate-800 rounded-full w-5 h-5 flex items-center justify-center"
                id="clear-search-btn"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Contact Button */}
          {onOpenContact && (
            <button
              onClick={onOpenContact}
              title="Contact Ishaan Yadav / Support"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-cyan-400 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              id="header-contact-btn"
            >
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Contact</span>
            </button>
          )}

          {/* Privacy Policy Button */}
          {onOpenPrivacy && (
            <button
              onClick={onOpenPrivacy}
              title="View Privacy Policy & COPPA Protection"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              id="header-privacy-btn"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Privacy</span>
            </button>
          )}

          {/* Terms & Conditions Button */}
          {onOpenTerms && (
            <button
              onClick={onOpenTerms}
              title="View Terms of Service & Website Rules"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-cyan-400 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              id="header-terms-btn"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Terms</span>
            </button>
          )}

          {/* VIP Lounge Button */}
          {onOpenVipLounge && (
            <button
              onClick={onOpenVipLounge}
              title="Open VIP Elite Lounge & Customizer"
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border-2 border-amber-400/80 text-amber-200 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20 active:scale-95 group cursor-pointer"
              id="header-vip-lounge-btn"
            >
              <Crown className="w-4 h-4 text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform" />
              <span className="tracking-tight uppercase">VIP Lounge</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black">
                👑
              </span>
            </button>
          )}

          {/* Gameland Point Shop Button */}
          {onOpenStore && (
            <button
              onClick={onOpenStore}
              title="Open Gameland Point Shop & VIP Store"
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/50 text-amber-300 text-xs font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95 group"
              id="header-store-btn"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="font-mono text-sm tracking-tight text-amber-300">🪙 {userPoints.toLocaleString()}</span>
              <span className="hidden sm:inline bg-amber-500/30 px-1.5 py-0.2 rounded text-[10px] uppercase font-black">
                Shop
              </span>
            </button>
          )}

          {/* User Account & Sign Out */}
          {currentUser && (() => {
            const userAvatarObj = getAvatarById(currentUser.avatar);
            const isAdmin = currentUser.isAdmin || currentUser.username.toLowerCase() === 'pebblesthepenguinishaany83';

            return (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
                {isAdmin && onOpenAdmin && (
                  <button
                    onClick={onOpenAdmin}
                    title="Open Pebbles Master Admin Control Panel"
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-indigo-500/20 hover:from-amber-500/30 hover:to-indigo-500/30 border border-amber-500/50 text-amber-300 text-xs font-black flex items-center gap-1.5 transition-all shadow-md animate-pulse hover:animate-none"
                    id="header-admin-panel-btn"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Admin Panel</span>
                  </button>
                )}

                {/* Interactive Profile & Penguin Avatar Button */}
                <button
                  onClick={onOpenProfile}
                  title="Click to view profile & change penguin avatar icon"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border text-xs font-bold shadow-sm transition-all hover:border-cyan-400 hover:scale-[1.02] active:scale-95 group ${
                    isAdmin ? 'border-amber-500/50 text-amber-300' : 'border-cyan-500/30 text-cyan-300'
                  }`}
                  id="header-user-profile-btn"
                >
                  <div className={`w-6 h-6 rounded-lg ${userAvatarObj.bgColor} border ${userAvatarObj.borderColor} flex items-center justify-center text-sm shrink-0 shadow-xs group-hover:scale-110 transition-transform ${currentUser.activeProfileFrame || ''}`}>
                    <span>{userAvatarObj.emoji}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="max-w-[100px] truncate text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {currentUser.username}
                    </span>
                    {(currentUser.hasPenguinBadge || (currentUser.loginStreak || 0) >= 2) && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded font-black flex items-center gap-0.5" title="Penguin Badge Earned!">
                        <span>🐧</span>
                      </span>
                    )}
                    <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-black flex items-center gap-0.5" title={`Daily Streak: ${currentUser.loginStreak || 1} Days`}>
                      <Flame className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                      <span>{currentUser.loginStreak || 1}d</span>
                    </span>
                    {isAdmin ? (
                      <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-black tracking-wider uppercase">
                        ADMIN
                      </span>
                    ) : currentUser.isVip ? (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-black tracking-wider uppercase flex items-center gap-0.5 border ${
                        currentUser.vipLevel === 'Diamond'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : currentUser.vipLevel === 'Platinum'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        <Crown className="w-2.5 h-2.5 text-amber-400" />
                        <span>VIP</span>
                      </span>
                    ) : currentUser.isTestAccount ? (
                      <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded font-black tracking-wider uppercase flex items-center gap-0.5">
                        🧪 TEST PASS
                      </span>
                    ) : (
                      <Settings className="w-3 h-3 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                    )}
                  </div>
                </button>

                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    title="Sign out of GameLand"
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-bold flex items-center gap-1 transition-all"
                    id="header-signout-btn"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Sign Out</span>
                  </button>
                )}
              </div>
            );
          })()}
        </div>

      </div>
    </header>
  );
};
