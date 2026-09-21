import React, { useState, useEffect, useMemo } from 'react';
import {
  FilterState,
  Game,
} from './types';
import {
  getAllGames,
  getFavoriteIds,
  toggleFavoriteId,
  getRecentlyPlayedIds,
  addRecentlyPlayedId,
  incrementPlayCount,
  getSiteAnnouncement,
} from './data/gamesData';
import { trackGamePlay } from './utils/analytics';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GameCard } from './components/GameCard';
import { GamePlayer } from './components/GamePlayer';
import { SuggestGameModal } from './components/SuggestGameModal';
import { GameStatusModal } from './components/GameStatusModal';
import { TermsModal, TermsTab } from './components/TermsModal';
import { ContactModal } from './components/ContactModal';
import { AdminControlModal } from './components/AdminControlModal';
import { PanicKeyModal } from './components/PanicKeyModal';
import { UserProfileModal } from './components/UserProfileModal';
import { StoreModal } from './components/StoreModal';
import { VipLockModal } from './components/VipLockModal';
import { VipLoungeModal } from './components/VipLoungeModal';
import { AdminQuickDock } from './components/AdminQuickDock';
import { DisguiseOverlay } from './components/DisguiseOverlay';
import { ComingSoonSection } from './components/ComingSoonSection';
import { getPanicSettings, applyTabMask, triggerPanicRedirect } from './utils/panicSettings';
import { AuthEntry } from './components/AuthEntry';
import { getCurrentSessionUser, logoutAccount, processDailyLoginStreak, UserAccount, awardGamePoints, syncUsersWithServer } from './utils/auth';
import { recordFavoritesChange, evaluateTrophies } from './utils/trophies';
import { PenguinMascot } from './components/PenguinMascot';
import { SnowfallEffect } from './components/SnowfallEffect';
import { PebblesCornerHub } from './components/PebblesCornerHub';
import {
  Gamepad2,
  Sparkles,
  Shuffle,
  SearchX,
  ArrowUpDown,
  PanelLeftOpen,
  Snowflake,
  ShieldCheck,
  X,
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [termsModalTab, setTermsModalTab] = useState<TermsTab>('all');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isPanicModalOpen, setIsPanicModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isVipLoungeOpen, setIsVipLoungeOpen] = useState(false);
  const [snowPartyActive, setSnowPartyActive] = useState(false);

  useEffect(() => {
    syncUsersWithServer();
  }, [currentUser]);
  const [pointsBanner, setPointsBanner] = useState<{ earned: number; total: number; multiplier: number; title: string } | null>(null);
  const [isDisguiseActive, setIsDisguiseActive] = useState(false);
  const [vipLockedModalData, setVipLockedModalData] = useState<{
    game?: Game | null;
    itemName?: string | null;
    requiredTier?: 'Gold' | 'Platinum' | 'Diamond';
  } | null>(null);
  const [announcement, setAnnouncement] = useState<{ message: string; active: boolean }>({ message: '', active: false });

  const isVipUser = !!(currentUser?.isVip || currentUser?.isAdmin);

  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    category: 'All',
    sortBy: 'popular',
    selectedTag: null,
    favoritesOnly: false,
  });

  // Initial Load & Panic Listener Setup
  useEffect(() => {
    const active = getCurrentSessionUser();
    if (active) {
      const { user: processed } = processDailyLoginStreak(active);
      setCurrentUser(processed);
      evaluateTrophies(processed.username);
    } else {
      setCurrentUser(null);
    }
    const loadedGames = getAllGames();
    setGames(loadedGames);
    setFavoriteIds(getFavoriteIds());
    setRecentIds(getRecentlyPlayedIds());
    setAnnouncement(getSiteAnnouncement());

    // Apply custom tab title & favicon mask on mount
    const initialPanic = getPanicSettings();
    applyTabMask(initialPanic.tabMask);

    // Global Panic Key Listener
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const settings = getPanicSettings();
      if (!settings.enabled) return;

      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = targetTag === 'input' || targetTag === 'textarea' || (e.target as HTMLElement)?.isContentEditable;

      const configuredKey = settings.panicKey;
      const isMatch =
        e.key === configuredKey ||
        e.code === configuredKey ||
        (configuredKey === '`' && (e.key === '`' || e.key === '~' || e.code === 'Backquote')) ||
        (configuredKey === 'Escape' && (e.key === 'Escape' || e.code === 'Escape'));

      if (isMatch) {
        if (isInput && configuredKey !== '`' && configuredKey !== 'Escape') {
          return;
        }
        e.preventDefault();
        e.stopPropagation();

        if (settings.mode === 'disguise') {
          setIsDisguiseActive((prev) => !prev);
        } else {
          triggerPanicRedirect(settings.redirectUrl);
        }
      }
    };

    // Real-time Cloud Run Coins & VIP listeners
    const handleSessionCoinsUpdated = () => {
      const updatedUser = getCurrentSessionUser();
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }
    };
    const handleSessionVipUpdated = () => {
      const updatedUser = getCurrentSessionUser();
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }
    };
    const handleMassCoinsGranted = (e: any) => {
      const updatedUser = getCurrentSessionUser();
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }
      setPointsBanner({
        earned: e.detail?.amount || 50,
        total: updatedUser?.points || 0,
        multiplier: 1,
        title: e.detail?.note ? `Cloud Run Bonus: ${e.detail.note}` : 'Cloud Run Mass Airdrop Bonus!',
      });
    };

    window.addEventListener('gameland_session_coins_updated', handleSessionCoinsUpdated);
    window.addEventListener('gameland_session_vip_updated', handleSessionVipUpdated);
    window.addEventListener('gameland_mass_coins_granted', handleMassCoinsGranted);

    const handleOpenStoreModal = () => setIsStoreModalOpen(true);
    window.addEventListener('gameland_open_store_modal', handleOpenStoreModal);

    window.addEventListener('keydown', handleGlobalKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown, { capture: true });
      window.removeEventListener('gameland_session_coins_updated', handleSessionCoinsUpdated);
      window.removeEventListener('gameland_session_vip_updated', handleSessionVipUpdated);
      window.removeEventListener('gameland_mass_coins_granted', handleMassCoinsGranted);
      window.removeEventListener('gameland_open_store_modal', handleOpenStoreModal);
    };
  }, []);

  const handleSignOut = () => {
    logoutAccount();
    setCurrentUser(null);
  };

  // Toggle Favorite
  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = toggleFavoriteId(id);
    setFavoriteIds(updated);
    recordFavoritesChange(updated.length, currentUser?.username);
  };

  // Select Game to Play
  const handleSelectGame = (game: Game) => {
    if (game.isVipExclusive && !isVipUser) {
      setVipLockedModalData({ game, itemName: game.title, requiredTier: game.vipLevel || 'Gold' });
      return;
    }
    trackGamePlay(game.id, game.title, game.category);
    const updatedCount = incrementPlayCount(game.id);
    const updatedGame = { ...game, playCount: updatedCount };
    setSelectedGame(updatedGame);
    setGames((prevGames) =>
      prevGames.map((g) => (g.id === game.id ? { ...g, playCount: updatedCount } : g))
    );
    addRecentlyPlayedId(game.id);
    setRecentIds(getRecentlyPlayedIds());

    // Award Points for playing game!
    const ptsResult = awardGamePoints(currentUser?.username, 1);
    if (ptsResult.user) {
      setCurrentUser(ptsResult.user);
    }
    setPointsBanner({
      earned: ptsResult.earned,
      total: ptsResult.totalPoints,
      multiplier: ptsResult.multiplier,
      title: game.title,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Random Game Selection
  const handleRandomGame = () => {
    if (games.length === 0) return;
    const randomIndex = Math.floor(Math.random() * games.length);
    handleSelectGame(games[randomIndex]);
  };

  // Filter & Sort Logic
  const filteredGames = useMemo(() => {
    return games
      .filter((game) => {
        // Search Query
        if (filterState.searchQuery) {
          const q = filterState.searchQuery.toLowerCase();
          const matchTitle = game.title.toLowerCase().includes(q);
          const matchDesc = game.description.toLowerCase().includes(q);
          const matchCategory = game.category.toLowerCase().includes(q);
          const matchTags = game.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchCategory && !matchTags) return false;
        }

        // Favorites Only
        if (filterState.favoritesOnly) {
          if (!favoriteIds.includes(game.id)) return false;
        }

        // Category Filter
        if (filterState.category !== 'All') {
          if (game.category !== filterState.category) return false;
        }

        // Tag Filter
        if (filterState.selectedTag) {
          if (filterState.selectedTag === 'VIP') {
            if (!game.isVipExclusive) return false;
          } else if (!game.tags.includes(filterState.selectedTag)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filterState.sortBy === 'popular') return b.playCount - a.playCount;
        if (filterState.sortBy === 'rating') return b.rating - a.rating;
        if (filterState.sortBy === 'name') return a.title.localeCompare(b.title);
        if (filterState.sortBy === 'newest') {
          const aNew = (a.isNew || a.isCustom) ? 1 : 0;
          const bNew = (b.isNew || b.isCustom) ? 1 : 0;
          if (bNew !== aNew) return bNew - aNew;
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [games, filterState, favoriteIds]);

  // Popular Tags Collection
  const popularTags = useMemo(() => {
    const all = games.flatMap((g) => g.tags);
    const counts = all.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.keys(counts)
      .sort((a, b) => counts[b] - counts[a])
      .slice(0, 8);
  }, [games]);

  if (!currentUser) {
    return <AuthEntry onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 overflow-x-hidden">
      
      {/* Broadcast Announcement Banner */}
      {announcement.active && announcement.message && (
        <div className="bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-indigo-500/20 border-b border-amber-500/30 px-4 py-2 text-center text-xs font-bold text-amber-200 flex items-center justify-center gap-2 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
          <span className="truncate">{announcement.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <Header
        filterState={filterState}
        onFilterChange={(updated) => setFilterState((prev) => ({ ...prev, ...updated }))}
        onRandomGame={handleRandomGame}
        favoritesCount={favoriteIds.length}
        totalGamesCount={games.length}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onOpenSuggestForm={() => setIsSuggestModalOpen(true)}
        onOpenGameStatus={() => setIsStatusModalOpen(true)}
        onOpenPrivacy={() => {
          setTermsModalTab('privacy');
          setIsTermsModalOpen(true);
        }}
        onOpenTerms={() => {
          setTermsModalTab('terms');
          setIsTermsModalOpen(true);
        }}
        onOpenContact={() => setIsContactModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onOpenPanicKey={() => setIsPanicModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenStore={() => setIsStoreModalOpen(true)}
        onOpenVipLounge={() => {
          const isVip = !!(
            currentUser?.isVip ||
            currentUser?.isAdmin ||
            currentUser?.username?.toLowerCase() === 'pebblesthepenguinishaany83'
          );
          if (isVip) {
            setIsVipLoungeOpen(true);
          } else {
            setVipLockedModalData({
              game: null,
              itemName: 'VIP Elite Lounge',
              requiredTier: 'Gold',
            });
          }
        }}
        currentUser={currentUser}
        onSignOut={handleSignOut}
      />

      {/* Main Container Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row relative">
        
        {/* Sidebar */}
        <Sidebar
          filterState={filterState}
          onSelectCategory={(cat) => setFilterState((prev) => ({ ...prev, category: cat, selectedTag: null }))}
          onFilterChange={(updated) => setFilterState((prev) => ({ ...prev, ...updated }))}
          favoritesCount={favoriteIds.length}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenSuggestForm={() => setIsSuggestModalOpen(true)}
          onOpenGameStatus={() => setIsStatusModalOpen(true)}
          onOpenPrivacy={() => {
            setTermsModalTab('privacy');
            setIsTermsModalOpen(true);
          }}
          onOpenTerms={() => {
            setTermsModalTab('terms');
            setIsTermsModalOpen(true);
          }}
          onOpenContact={() => setIsContactModalOpen(true)}
          onOpenPanicKey={() => setIsPanicModalOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenStore={() => setIsStoreModalOpen(true)}
          currentUser={currentUser}
          onSignOut={handleSignOut}
        />

        {/* Floating Open Sidebar Button when closed */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed bottom-6 left-6 z-40 px-4 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-cyan-400 font-bold text-xs shadow-2xl backdrop-blur-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95 group"
            title="Open Sidebar Navigation"
            id="floating-open-sidebar-btn"
          >
            <PanelLeftOpen className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
            <span>Open Menu</span>
          </button>
        )}

        {/* Content View Area */}
        <main className="flex-1 p-4 sm:p-6 space-y-6 overflow-x-hidden">
          
          {/* If a game is selected, show Game Player View */}
          {selectedGame ? (
            <GamePlayer
              game={selectedGame}
              isFavorite={favoriteIds.includes(selectedGame.id)}
              onToggleFavorite={handleToggleFavorite}
              onBack={() => setSelectedGame(null)}
              relatedGames={games.filter((g) => g.id !== selectedGame.id && g.category === selectedGame.category).slice(0, 4)}
              onSelectGame={handleSelectGame}
              favoriteIds={favoriteIds}
              currentUser={currentUser}
            />
          ) : (
            <>
              {/* Featured Banner Hero (Only when on 'All' category and no active search) */}
              {filterState.category === 'All' &&
                !filterState.searchQuery &&
                !filterState.favoritesOnly &&
                !filterState.selectedTag && (
                  <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-cyan-500/30 p-6 sm:p-8 overflow-hidden shadow-2xl">
                    <SnowfallEffect density={20} />
                    <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/15 via-transparent to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="max-w-xl space-y-4">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-extrabold tracking-wide shadow-sm">
                          <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
                          <span>PEBBLES' PENGUIN ARCADE</span>
                        </div>

                        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                          Instant Arctic Gaming, Zero Restrictions. 🐧
                        </h1>

                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          Welcome to the Igloo Arcade! Play over 100+ unblocked HTML5, arcade, puzzle, and 3D games directly in your browser curated by Pebbles The Penguin.
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          {games.length > 0 && (
                            <button
                              onClick={handleRandomGame}
                              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                              id="hero-play-random-btn"
                            >
                              <Shuffle className="w-4 h-4" />
                              <span>Slide Into Random Game 🐧</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setTermsModalTab('privacy');
                              setIsTermsModalOpen(true);
                            }}
                            className="px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-2 transition-all shadow-sm active:scale-95 group cursor-pointer"
                            id="hero-privacy-shield-btn"
                            title="Read how GameLand guarantees zero tracking and COPPA privacy protection"
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                            <span>100% Privacy & COPPA Protected</span>
                          </button>
                        </div>
                      </div>

                      {/* Mascot Banner Card */}
                      <div className="shrink-0 bg-slate-950/80 border border-cyan-500/30 p-4 rounded-2xl shadow-xl backdrop-blur-md hidden sm:flex items-center gap-3 max-w-sm">
                        <PenguinMascot
                          pose="gaming"
                          size="lg"
                          interactive
                          showSpeechBubble={false}
                          currentUser={currentUser}
                          onOpenStore={() => setIsStoreModalOpen(true)}
                          showFeedControls
                        />
                        <div>
                          <p className="text-xs font-bold text-cyan-300">Pebbles The Penguin</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Click Pebbles to feed snacks from the Store or inspect happiness! 🐟</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* Tag Chips & Sorting Controls Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
                
                {/* Popular Tags */}
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                  <span className="text-xs text-slate-400 font-bold shrink-0">Tags:</span>
                  <button
                    onClick={() => setFilterState((prev) => ({ ...prev, selectedTag: null }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                      filterState.selectedTag === null
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    All
                  </button>
                  {popularTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() =>
                        setFilterState((prev) => ({
                          ...prev,
                          selectedTag: prev.selectedTag === tag ? null : tag,
                        }))
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                        filterState.selectedTag === tag
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-400 font-bold">Sort:</span>
                  <select
                    value={filterState.sortBy}
                    onChange={(e) =>
                      setFilterState((prev) => ({
                        ...prev,
                        sortBy: e.target.value as FilterState['sortBy'],
                      }))
                    }
                    className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
                    id="sort-select-dropdown"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="newest">Newest / Recently Added ⚡</option>
                    <option value="rating">Highest Rated</option>
                    <option value="name">Name (A-Z)</option>
                  </select>
                </div>

              </div>

              {/* Category Title & Count Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
                    <span>
                      {filterState.favoritesOnly
                        ? 'Favorite Games'
                        : filterState.category === 'All'
                        ? 'All Unblocked Games'
                        : `${filterState.category} Games`}
                    </span>
                    {filterState.selectedTag && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                        #{filterState.selectedTag}
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Showing {filteredGames.length} available games
                  </p>
                </div>
              </div>

              {/* Games Grid */}
              {filteredGames.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      isFavorite={favoriteIds.includes(game.id)}
                      isVipUser={isVipUser}
                      currentUser={currentUser}
                      onSelectGame={handleSelectGame}
                      onToggleFavorite={handleToggleFavorite}
                      onVipLockClick={(g) =>
                        setVipLockedModalData({ game: g, itemName: g.title, requiredTier: g.vipLevel || 'Gold' })
                      }
                    />
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="py-16 text-center space-y-4 bg-slate-900/40 rounded-3xl border border-slate-800/80">
                  <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 mx-auto">
                    <SearchX className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-200">No games available</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      {games.length === 0
                        ? 'The games catalog is currently empty. Add entries to games.json to display games.'
                        : 'Try adjusting your search query or clearing active filters.'}
                    </p>
                  </div>
                  {games.length > 0 && (
                    <button
                      onClick={() =>
                        setFilterState({
                          searchQuery: '',
                          category: 'All',
                          sortBy: 'popular',
                          selectedTag: null,
                          favoritesOnly: false,
                        })
                      }
                      className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold hover:bg-cyan-500/30 transition-all"
                      id="clear-all-filters-btn"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              )}

              {/* Coming Soon Section */}
              <ComingSoonSection onOpenSuggestForm={() => setIsSuggestModalOpen(true)} />
            </>
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className="mt-12 bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-400">GameLand By Pebbles The Penguin</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors flex items-center gap-1"
              id="footer-game-status-btn"
            >
              <span>Game Status Tracker</span>
            </button>
            <button
              onClick={() => setIsSuggestModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-bold transition-colors flex items-center gap-1"
              id="footer-suggest-game-btn"
            >
              <span>Suggest a Game / Proxy</span>
            </button>
            <button
              onClick={() => {
                setTermsModalTab('privacy');
                setIsTermsModalOpen(true);
              }}
              className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors flex items-center gap-1"
              id="footer-privacy-btn"
            >
              <span>Privacy Policy</span>
            </button>
            <button
              onClick={() => {
                setTermsModalTab('terms');
                setIsTermsModalOpen(true);
              }}
              className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors flex items-center gap-1"
              id="footer-terms-btn"
            >
              <span>Terms of Service</span>
            </button>
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors flex items-center gap-1"
              id="footer-contact-btn"
            >
              <span>Contact Us</span>
            </button>
            <p>© {new Date().getFullYear()} Fast, Unblocked Game & Proxy Portal</p>
          </div>
        </div>
      </footer>

      {/* Suggest Game Form Modal */}
      <SuggestGameModal
        isOpen={isSuggestModalOpen}
        onClose={() => setIsSuggestModalOpen(false)}
        currentUser={currentUser}
      />

      {/* Game Status Spreadsheet Modal */}
      <GameStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
      />

      {/* Terms of Service & Rules Modal */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onOpenSuggestForm={() => setIsSuggestModalOpen(true)}
        initialTab={termsModalTab}
      />

      {/* Contact Page Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onOpenSuggestForm={() => setIsSuggestModalOpen(true)}
      />

      {/* Admin Control Panel Modal */}
      <AdminControlModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onGamesUpdated={() => setGames(getAllGames())}
        onAnnouncementUpdated={() => setAnnouncement(getSiteAnnouncement())}
      />

      {/* Panic Key Modal */}
      <PanicKeyModal
        isOpen={isPanicModalOpen}
        onClose={() => setIsPanicModalOpen(false)}
        onTriggerDisguise={() => setIsDisguiseActive(true)}
      />

      {/* User Profile & Avatar Settings Modal */}
      {currentUser && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          onUserUpdated={(updatedUser) => setCurrentUser(updatedUser)}
          onOpenStore={() => setIsStoreModalOpen(true)}
        />
      )}

      {/* Gameland Point Shop & Store Modal */}
      <StoreModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        currentUser={currentUser}
        onUserUpdated={(updated) => setCurrentUser(updated)}
      />

      {/* VIP Elite Lounge & Customizer Modal */}
      <VipLoungeModal
        isOpen={isVipLoungeOpen}
        onClose={() => setIsVipLoungeOpen(false)}
        currentUser={currentUser}
        onUserUpdated={(updated) => setCurrentUser(updated)}
        onOpenStore={() => setIsStoreModalOpen(true)}
      />

      {/* Floating Admin Quick Control Dock */}
      <AdminQuickDock
        currentUser={currentUser}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onTriggerSnowstorm={() => setSnowPartyActive((prev) => !prev)}
      />

      {/* Admin Triggered Snowstorm Party Effect */}
      {snowPartyActive && (
        <SnowfallEffect density={75} className="pointer-events-none fixed inset-0 z-50" />
      )}

      {/* Points Award Floating Toast Banner */}
      {pointsBanner && (
        <div className="fixed bottom-24 right-4 z-50 bg-slate-900 border border-amber-500/50 text-slate-100 p-3.5 sm:p-4 rounded-2xl shadow-2xl shadow-amber-500/10 flex items-center gap-3 max-w-sm animate-bounce">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-xl flex items-center justify-center shrink-0">
            {pointsBanner.earned > 0 ? '🪙' : '🛑'}
          </div>
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                {pointsBanner.earned > 0
                  ? `+${pointsBanner.earned} Points Earned!`
                  : 'Daily 10 PTS Limit Reached!'}
              </span>
              {pointsBanner.earned > 0 && pointsBanner.multiplier > 1.0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 font-extrabold">
                  {pointsBanner.multiplier}x VIP
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 truncate mt-0.5">
              {pointsBanner.earned > 0 ? (
                <>Playing <strong>{pointsBanner.title}</strong></>
              ) : (
                <>Max 10 PTS/day reached! Reset tomorrow.</>
              )}
            </p>
            <p className="text-[10px] text-amber-400/90 font-mono mt-0.5">
              Total Balance: {pointsBanner.total.toLocaleString()} PTS
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsStoreModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-colors"
            >
              Shop
            </button>
            <button
              type="button"
              onClick={() => setPointsBanner(null)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors border border-slate-700"
              title="Close notification"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Disguise Overlay (Fake Google Docs) */}
      {isDisguiseActive && (
        <DisguiseOverlay onExit={() => setIsDisguiseActive(false)} />
      )}

      {/* VIP Exclusive Locked Modal */}
      <VipLockModal
        isOpen={!!vipLockedModalData}
        onClose={() => setVipLockedModalData(null)}
        game={vipLockedModalData?.game || null}
        itemName={vipLockedModalData?.itemName || null}
        requiredTier={vipLockedModalData?.requiredTier || 'Gold'}
        currentUser={currentUser}
        onOpenAdminModal={currentUser?.isAdmin ? () => setIsAdminModalOpen(true) : undefined}
        onOpenProfile={currentUser ? () => setIsProfileModalOpen(true) : undefined}
        onOpenStore={() => setIsStoreModalOpen(true)}
      />

      {/* Unified Bottom-Right Sight: Pebbles Says + Pebbles Jokes + Background Music Player */}
      <PebblesCornerHub
        currentUser={currentUser}
        onUserUpdated={(updated) => setCurrentUser(updated)}
        onOpenStore={() => setIsStoreModalOpen(true)}
        onOpenPanicModal={() => setIsPanicModalOpen(true)}
        onOpenVipModal={(trackTitle, requiredTier) =>
          setVipLockedModalData({
            itemName: trackTitle ? `"${trackTitle}" Track` : 'VIP Exclusive Music Track',
            requiredTier: requiredTier || 'Gold',
          })
        }
      />

    </div>
  );
}
