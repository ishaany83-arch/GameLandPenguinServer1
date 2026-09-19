import React from 'react';
import {
  Gamepad2,
  Flame,
  Zap,
  Swords,
  Gamepad,
  Puzzle,
  Trophy,
  Car,
  Compass,
  Heart,
  Globe,
  PanelLeftClose,
  Lightbulb,
  Activity,
  ShieldCheck,
  Mail,
  LogOut,
  Snowflake,
  ShieldAlert,
  Rocket,
  Sparkles,
  Crown,
  ShoppingBag,
} from 'lucide-react';
import { CategoryType, FilterState } from '../types';
import { UserAccount, getUserPoints } from '../utils/auth';
import { PenguinMascot } from './PenguinMascot';
import { getAvatarById } from '../utils/penguinAvatars';

interface SidebarProps {
  filterState: FilterState;
  onSelectCategory: (cat: CategoryType) => void;
  onFilterChange: (updated: Partial<FilterState>) => void;
  favoritesCount: number;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenSuggestForm?: () => void;
  onOpenGameStatus?: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onOpenContact?: () => void;
  onOpenPanicKey?: () => void;
  onOpenProfile?: () => void;
  onOpenStore?: () => void;
  currentUser?: UserAccount | null;
  onSignOut?: () => void;
}

const CATEGORY_ITEMS: { name: CategoryType; icon: React.ReactNode; color: string }[] = [
  { name: 'All', icon: <Compass className="w-4 h-4" />, color: 'text-cyan-400' },
  { name: 'Proxies', icon: <Globe className="w-4 h-4" />, color: 'text-emerald-400' },
  { name: 'Action', icon: <Zap className="w-4 h-4" />, color: 'text-amber-400' },
  { name: 'Arcade', icon: <Gamepad className="w-4 h-4" />, color: 'text-emerald-400' },
  { name: 'Puzzle', icon: <Puzzle className="w-4 h-4" />, color: 'text-purple-400' },
  { name: 'Sports', icon: <Trophy className="w-4 h-4" />, color: 'text-indigo-400' },
  { name: 'Racing', icon: <Car className="w-4 h-4" />, color: 'text-rose-400' },
  { name: 'Strategy', icon: <Swords className="w-4 h-4" />, color: 'text-blue-400' },
  { name: 'Retro', icon: <Gamepad2 className="w-4 h-4" />, color: 'text-fuchsia-400' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  filterState,
  onSelectCategory,
  onFilterChange,
  favoritesCount,
  isOpen = true,
  onClose,
  onOpenSuggestForm,
  onOpenGameStatus,
  onOpenPrivacy,
  onOpenTerms,
  onOpenContact,
  onOpenPanicKey,
  onOpenProfile,
  onOpenStore,
  currentUser,
  onSignOut,
}) => {
  if (!isOpen) return null;

  const currentPoints = getUserPoints(currentUser);

  return (
    <aside className="w-full md:w-64 bg-slate-900/60 border-b md:border-b-0 md:border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0 transition-all">
      <div className="space-y-5">
        
        {/* Sidebar Header / Close bar */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-300">
            <Snowflake className="w-4 h-4 text-cyan-400" />
            <span>Arctic Navigation</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition-all"
              title="Close sidebar"
              id="close-sidebar-header-btn"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Pebbles Penguin Companion Widget */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/20 shadow-md">
          <div className="flex items-center gap-3">
            <PenguinMascot pose="happy" size="md" showSpeechBubble={false} />
            <div>
              <h4 className="text-xs font-black text-cyan-300 flex items-center gap-1">
                <span>Pebbles The Penguin</span>
              </h4>
              <p className="text-[10px] text-slate-400">Portal Mascot & Curator</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-300 mt-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80 leading-snug">
            "Tap my avatar anytime for pro gaming tips & arctic jokes! 🐧❄️"
          </p>
        </div>

        {/* Main Categories */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Categories
          </div>
          <nav className="space-y-1">
            {CATEGORY_ITEMS.map((item) => {
              const isSelected = filterState.category === item.name && !filterState.favoritesOnly;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    onFilterChange({ favoritesOnly: false, searchQuery: '' });
                    onSelectCategory(item.name);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100'
                  }`}
                  id={`cat-btn-${item.name.toLowerCase()}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={item.color}>{item.icon}</span>
                    <span>{item.name === 'Proxies' ? 'Web Proxies' : item.name === 'All' ? 'All Games & Tools' : `${item.name} Games`}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Collections */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Library
          </div>
          <nav className="space-y-1">
            {/* Point Shop & VIP Store */}
            {onOpenStore && (
              <button
                onClick={onOpenStore}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all shadow-xs my-1"
                id="sidebar-point-shop-btn"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>Point Shop & Store</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/25 text-amber-300 font-black border border-amber-500/40">
                  🪙 {currentPoints.toLocaleString()}
                </span>
              </button>
            )}

            {/* Favorites */}
            <button
              onClick={() => onFilterChange({ favoritesOnly: true, searchQuery: '' })}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                filterState.favoritesOnly
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100'
              }`}
              id="sidebar-favorites-btn"
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500/30" />
                <span>Favorites</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                {favoritesCount}
              </span>
            </button>

            {/* Popular */}
            <button
              onClick={() => {
                onFilterChange({ favoritesOnly: false, category: 'All', sortBy: 'popular', searchQuery: '' });
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800/70 hover:text-slate-100 transition-all"
              id="sidebar-popular-btn"
            >
              <div className="flex items-center gap-2.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Top Trending</span>
              </div>
            </button>

            {/* Newest Arrivals */}
            <button
              onClick={() => {
                onFilterChange({ favoritesOnly: false, category: 'All', sortBy: 'newest', searchQuery: '' });
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                !filterState.favoritesOnly && filterState.sortBy === 'newest'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100'
              }`}
              id="sidebar-newest-btn"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Newest Arrivals</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                NEW
              </span>
            </button>

            {/* VIP Early Access */}
            <button
              onClick={() => {
                onFilterChange({ favoritesOnly: false, category: 'All', selectedTag: 'VIP', searchQuery: '' });
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                !filterState.favoritesOnly && filterState.selectedTag === 'VIP'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-amber-300'
              }`}
              id="sidebar-vip-access-btn"
            >
              <div className="flex items-center gap-2.5">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>VIP Early Access</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/25 text-amber-300 font-black uppercase border border-amber-500/40">
                VIP 👑
              </span>
            </button>

            {/* Coming Soon */}
            <button
              onClick={() => {
                const el = document.getElementById('coming-soon-catalog-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 transition-all"
              id="sidebar-coming-soon-btn"
            >
              <div className="flex items-center gap-2.5">
                <Rocket className="w-4 h-4 text-cyan-400" />
                <span>Coming Soon</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold uppercase">
                VOTE
              </span>
            </button>
          </nav>
        </div>

        {/* Action Links: Suggest a Game, Panic Key & Game Status */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          {onOpenPanicKey && (
            <button
              onClick={onOpenPanicKey}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-all shadow-sm group"
              id="sidebar-panic-key-btn"
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                <span>Panic Key & Disguise</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-200 font-mono font-black">
                ~
              </span>
            </button>
          )}
          {onOpenGameStatus && (
            <button
              onClick={onOpenGameStatus}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 transition-all shadow-sm group"
              id="sidebar-game-status-btn"
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Game Status Tracker</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          )}

          {onOpenSuggestForm && (
            <button
              onClick={onOpenSuggestForm}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition-all shadow-sm group"
              id="sidebar-suggest-game-btn"
            >
              <div className="flex items-center gap-2.5">
                <Lightbulb className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Suggest a Game</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 font-extrabold">
                NEW
              </span>
            </button>
          )}

          {onOpenPrivacy && (
            <button
              onClick={onOpenPrivacy}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-emerald-400 border border-slate-700/60 transition-all shadow-sm group"
              id="sidebar-privacy-btn"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Privacy Policy</span>
              </div>
            </button>
          )}

          {onOpenTerms && (
            <button
              onClick={onOpenTerms}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition-all shadow-sm group"
              id="sidebar-terms-btn"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>Terms of Service</span>
              </div>
            </button>
          )}

          {onOpenContact && (
            <button
              onClick={onOpenContact}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition-all shadow-sm group"
              id="sidebar-contact-btn"
            >
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>Contact Us</span>
              </div>
            </button>
          )}

          {currentUser && onSignOut && (() => {
            const sidebarAvatar = getAvatarById(currentUser.avatar);

            return (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="w-full p-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between text-left transition-all group"
                  id="sidebar-user-profile-btn"
                  title="Customize penguin avatar icon & settings"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className={`w-7 h-7 rounded-lg ${sidebarAvatar.bgColor} border ${sidebarAvatar.borderColor} flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform`}>
                      <span>{sidebarAvatar.emoji}</span>
                    </div>
                    <div className="truncate">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Signed In As</p>
                      <p className="text-xs font-bold text-slate-100 truncate group-hover:text-cyan-300 transition-colors">{currentUser.username}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 shrink-0">
                    Avatar
                  </span>
                </button>

                <button
                  onClick={onSignOut}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-all"
                  id="sidebar-signout-btn"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            );
          })()}
        </div>

      </div>
    </aside>
  );
};
