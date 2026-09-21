import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  Smile,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Heart,
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Radio,
  Disc,
  Crown,
  Lock,
  Lightbulb,
  Gamepad2,
  Snowflake,
  ShoppingBag,
  ShieldAlert,
  Fish,
  Utensils,
  Award,
  Flame,
} from 'lucide-react';
import { PenguinSvg } from './PenguinMascot';
import { bgMusicEngine, MUSIC_TRACKS, TrackInfo } from '../utils/audioMusic';
import {
  UserAccount,
  awardGamePoints,
  hasVipAccess,
  PENGUIN_SNACKS,
  PenguinSnackItem,
  getUserSnacksInventory,
  getPenguinStats,
  feedPenguinSnack,
} from '../utils/auth';

export interface PebblesCornerHubProps {
  currentUser?: UserAccount | null;
  onUserUpdated?: (user: UserAccount) => void;
  onOpenStore?: () => void;
  onOpenPanicModal?: () => void;
  onOpenVipModal?: (trackTitle?: string, requiredTier?: 'Gold' | 'Platinum' | 'Diamond') => void;
}

type HubTab = 'says' | 'jokes' | 'feed' | 'music';

// --- PEBBLES SAYS QUOTES ---
const PEBBLES_SAYS_QUOTES = [
  {
    text: "Slide into fun! What game are we conquering today? 🐧🎮",
    tag: "Welcome Tip",
    icon: "🎮",
  },
  {
    text: "Nook nook! Pebbles tested all 100+ games for zero lag and 100% unblocked play!",
    tag: "Unblocked Speed",
    icon: "🚀",
  },
  {
    text: "Pro Tip: Press 'P' key anytime to activate the Google Docs Panic Stealth Disguise!",
    tag: "Stealth Mode",
    icon: "🥷",
  },
  {
    text: "Fun Fact: Penguins can't fly, but our arcade high scores sure soar through the roof! 🏆",
    tag: "High Scores",
    icon: "🏆",
  },
  {
    text: "Need extra PTS points? Visit the Store to unlock rare profile frames, titles, and penguin snacks!",
    tag: "Store Perk",
    icon: "🪙",
  },
  {
    text: "Don't forget to star your favorite games so Pebbles keeps 'em at the top of your list!",
    tag: "Favorites",
    icon: "⭐",
  },
  {
    text: "Glacier Approved! All games run on pure client-side code for maximum school safety!",
    tag: "Safe & Unblocked",
    icon: "🧊",
  },
  {
    text: "Waddling into the leaderboards! Earn 1 PTS every single time you complete a game session!",
    tag: "Economy",
    icon: "🪙",
  },
];

// --- PEBBLES JOKES ---
interface JokeItem {
  id: string;
  category: 'gaming' | 'ice' | 'stealth' | 'school';
  question: string;
  punchline: string;
  emoji: string;
}

const PEBBLES_JOKES: JokeItem[] = [
  {
    id: 'j1',
    category: 'gaming',
    question: "What's a penguin's favorite video game?",
    punchline: 'Mario Kart-ic! 🏎️❄️',
    emoji: '🏎️',
  },
  {
    id: 'j2',
    category: 'gaming',
    question: 'Why did the gamer penguin wear a thick scarf?',
    punchline: 'Because his gaming PC had too much cool-ing! 💻❄️',
    emoji: '💻',
  },
  {
    id: 'j3',
    category: 'ice',
    question: 'What do penguins wear to gaming tournaments?',
    punchline: 'Their formal TUX-edos! 🐧🎮',
    emoji: '🐧',
  },
  {
    id: 'j4',
    category: 'gaming',
    question: 'How do gamer penguins catch fish online?',
    punchline: 'With their high-speed net-work connection! 🌐🐟',
    emoji: '🌐',
  },
  {
    id: 'j5',
    category: 'stealth',
    question: "What is Pebbles' favorite key on the keyboard?",
    punchline: 'The ICE-cape key (ESC)! ⌨️🧊',
    emoji: '⌨️',
  },
  {
    id: 'j6',
    category: 'stealth',
    question: 'Why are penguins so good at stealth games in class?',
    punchline: 'Because they always play it cool under pressure! 🥷🐧',
    emoji: '🥷',
  },
  {
    id: 'j7',
    category: 'ice',
    question: 'What kind of math do arcade penguins excel at?',
    punchline: 'Al-ICE-bra! 📐❄️',
    emoji: '📐',
  },
  {
    id: 'j8',
    category: 'gaming',
    question: "What's Pebbles' favorite dessert after beating a boss level?",
    punchline: 'Ice cream sundaes with extra point toppings! 🍨🏆',
    emoji: '🍨',
  },
  {
    id: 'j9',
    category: 'ice',
    question: 'Why did the penguin refuse to play local co-op?',
    punchline: 'He wanted to be a solo flipper! 🎮🐧',
    emoji: '🎮',
  },
  {
    id: 'j10',
    category: 'gaming',
    question: 'What do you call a penguin with an unbreakable high score?',
    punchline: 'A FLIPPER CHAMPION! 🥇🏆',
    emoji: '🥇',
  },
  {
    id: 'j11',
    category: 'gaming',
    question: 'What happens when a penguin gets rage-quitted?',
    punchline: 'He gives the keyboard the cold shoulder! 🧊😤',
    emoji: '🧊',
  },
  {
    id: 'j12',
    category: 'gaming',
    question: "What's a penguin's favorite retro 8-bit console?",
    punchline: 'The Nintendo SNES (Snow Entertainment System)! 🕹️❄️',
    emoji: '🕹️',
  },
  {
    id: 'j13',
    category: 'ice',
    question: 'Why do gamer penguins love cold winter weather?',
    punchline: 'Free unlimited natural cooling for maximum overclocking! ⚡❄️',
    emoji: '⚡',
  },
  {
    id: 'j14',
    category: 'school',
    question: 'Where do penguins keep their gaming high scores at school?',
    punchline: 'In a snow bank! 🏦❄️',
    emoji: '🏦',
  },
  {
    id: 'j15',
    category: 'stealth',
    question: 'How do you know when a penguin is disguised as a student?',
    punchline: 'He is sliding across Google Docs with 120 FPS! 📄🛷',
    emoji: '📄',
  },
];

// Lightweight client-side Web Audio synthesizer for tactile munching & celebration sound effects
function playFeedingAudio(type: 'munch' | 'cheer' | 'throw', enabled: boolean = true) {
  if (!enabled) return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;

    if (type === 'throw') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(560, now + 0.18);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.19);
    } else if (type === 'munch') {
      [0, 0.08, 0.16].forEach((delay, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(360 - idx * 40, now + delay);
        osc.frequency.exponentialRampToValueAtTime(120, now + delay + 0.07);
        gain.gain.setValueAtTime(0.14, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.07);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.08);
      });
    } else if (type === 'cheer') {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.12, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.29);
      });
    }
  } catch {
    // AudioContext ignored if restricted
  }
}

export const PebblesCornerHub: React.FC<PebblesCornerHubProps> = ({
  currentUser,
  onUserUpdated,
  onOpenStore,
  onOpenPanicModal,
  onOpenVipModal,
}) => {
  // Widget Open/Minimize State
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<HubTab>('says');
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState<boolean>(true);
  const [isWaddling, setIsWaddling] = useState<boolean>(false);

  // Background Music Engine State
  const [isPlaying, setIsPlaying] = useState<boolean>(bgMusicEngine.getIsPlaying());
  const [isMuted, setIsMuted] = useState<boolean>(bgMusicEngine.getIsMuted());
  const [volume, setVolume] = useState<number>(bgMusicEngine.getVolume());
  const [currentTrack, setCurrentTrack] = useState<TrackInfo>(bgMusicEngine.getCurrentTrack());
  const [vipNotice, setVipNotice] = useState<string>('');

  // Pebbles Says State
  const [quoteIndex, setQuoteIndex] = useState<number>(0);

  // Pebbles Jokes State
  const [jokeIndex, setJokeIndex] = useState<number>(0);
  const [jokeCategory, setJokeCategory] = useState<string>('all');
  const [showPunchline, setShowPunchline] = useState<boolean>(false);
  const [likedJokes, setLikedJokes] = useState<Record<string, boolean>>({});
  const [copiedJoke, setCopiedJoke] = useState<boolean>(false);
  const [jokeFeedback, setJokeFeedback] = useState<string>('');

  // Feed Pebbles State
  const [snackInventory, setSnackInventory] = useState<Record<string, number>>(() =>
    getUserSnacksInventory(currentUser)
  );
  const [happiness, setHappiness] = useState<number>(() => getPenguinStats(currentUser).happiness);
  const [totalFedCount, setTotalFedCount] = useState<number>(() => getPenguinStats(currentUser).totalFed);
  const [feedPhase, setFeedPhase] = useState<'idle' | 'throwing' | 'eating' | 'celebrating'>('idle');
  const [activeSnack, setActiveSnack] = useState<PenguinSnackItem | null>(null);
  const [reactionQuote, setReactionQuote] = useState<string | null>(null);
  const [crumbs, setCrumbs] = useState<{ id: number; symbol: string }[]>([]);
  const [hearts, setHearts] = useState<{ id: number; left: number; delay: number }[]>([]);

  // Update snack inventory and stats on user change or window events
  const refreshSnackStats = () => {
    setSnackInventory(getUserSnacksInventory(currentUser));
    const stats = getPenguinStats(currentUser);
    setHappiness(stats.happiness);
    setTotalFedCount(stats.totalFed);
  };

  useEffect(() => {
    refreshSnackStats();
  }, [currentUser]);

  useEffect(() => {
    const handleSnacksUpdated = () => refreshSnackStats();
    const handlePenguinFed = () => refreshSnackStats();

    window.addEventListener('gameland_snacks_updated', handleSnacksUpdated);
    window.addEventListener('gameland_penguin_fed', handlePenguinFed);

    return () => {
      window.removeEventListener('gameland_snacks_updated', handleSnacksUpdated);
      window.removeEventListener('gameland_penguin_fed', handlePenguinFed);
    };
  }, [currentUser]);

  const totalSnacksAvailable = Object.values(snackInventory).reduce<number>(
    (a, b) => a + (Number(b) || 0),
    0
  );

  const handleFeedSnack = (snack: PenguinSnackItem) => {
    if (feedPhase !== 'idle') return;

    const result = feedPenguinSnack(currentUser || null, snack.id);
    if (!result.success) {
      alert(result.message);
      return;
    }

    if (result.user && onUserUpdated) {
      onUserUpdated(result.user);
    }
    setHappiness(result.happiness);
    setTotalFedCount(result.totalFed);
    refreshSnackStats();

    setActiveSnack(snack);
    setReactionQuote(snack.joyMessage);

    // Phase 1: Throwing
    setFeedPhase('throwing');
    playFeedingAudio('throw', soundEffectsEnabled);

    setTimeout(() => {
      // Phase 2: Munching & Chewing
      setFeedPhase('eating');
      playFeedingAudio('munch', soundEffectsEnabled);
      setCrumbs([
        { id: 1, symbol: '✨' },
        { id: 2, symbol: '❄️' },
        { id: 3, symbol: '😋' },
        { id: 4, symbol: '⭐' },
      ]);

      setTimeout(() => {
        // Phase 3: Joyful Celebration
        setFeedPhase('celebrating');
        playFeedingAudio('cheer', soundEffectsEnabled);
        setCrumbs([]);
        setHearts(
          Array.from({ length: 6 }, (_, i) => ({
            id: Date.now() + i,
            left: 20 + Math.random() * 60,
            delay: i * 0.12,
          }))
        );

        // Phase 4: Idle Return
        setTimeout(() => {
          setFeedPhase('idle');
          setHearts([]);
          setActiveSnack(null);
        }, 2200);
      }, 950);
    }, 450);
  };

  // Subscribe to Background Music Engine changes
  useEffect(() => {
    const unsubscribe = bgMusicEngine.subscribe(() => {
      setIsPlaying(bgMusicEngine.getIsPlaying());
      setIsMuted(bgMusicEngine.getIsMuted());
      setVolume(bgMusicEngine.getVolume());
      setCurrentTrack(bgMusicEngine.getCurrentTrack());
    });
    return () => unsubscribe();
  }, []);

  // Filtered jokes
  const filteredJokes =
    jokeCategory === 'all'
      ? PEBBLES_JOKES
      : PEBBLES_JOKES.filter((j) => j.category === jokeCategory);
  const currentJoke = filteredJokes[jokeIndex % filteredJokes.length] || PEBBLES_JOKES[0];
  const currentQuote = PEBBLES_SAYS_QUOTES[quoteIndex % PEBBLES_SAYS_QUOTES.length];

  // Sound effect synthesizer (for tips & jokes)
  const playSfx = (freq1: number, freq2: number) => {
    if (!soundEffectsEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq1, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq2, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch {
      // Audio context safely ignored if blocked
    }
  };

  // --- ACTIONS: PEBBLES SAYS ---
  const handleNextQuote = () => {
    setIsWaddling(true);
    setQuoteIndex((prev) => (prev + 1) % PEBBLES_SAYS_QUOTES.length);
    playSfx(587.33, 880);
    setTimeout(() => setIsWaddling(false), 500);
  };

  // --- ACTIONS: PEBBLES JOKES ---
  const handleNextJoke = () => {
    setShowPunchline(false);
    setIsWaddling(true);
    setJokeIndex((prev) => (prev + 1) % filteredJokes.length);
    playSfx(523, 659);
    setTimeout(() => setIsWaddling(false), 500);
  };

  const handleTogglePunchline = () => {
    const nextState = !showPunchline;
    setShowPunchline(nextState);
    if (nextState) {
      playSfx(660, 880);
    }
  };

  const handleCopyJoke = () => {
    const text = `🐧 Pebbles Joke: ${currentJoke.question} -> ${currentJoke.punchline}`;
    navigator.clipboard.writeText(text);
    setCopiedJoke(true);
    setTimeout(() => setCopiedJoke(false), 2500);
  };

  const handleLikeJoke = () => {
    if (likedJokes[currentJoke.id]) return;
    setLikedJokes((prev) => ({ ...prev, [currentJoke.id]: true }));

    const res = awardGamePoints(currentUser?.username, 1);
    if (res.user && onUserUpdated) {
      onUserUpdated(res.user);
    }

    if (res.earned > 0) {
      setJokeFeedback(`🎉 +${res.earned} PTS Earned!`);
    } else {
      setJokeFeedback('🛑 Daily 10 PTS reached! Reset tomorrow.');
    }
    setTimeout(() => setJokeFeedback(''), 3000);
    playSfx(523, 784);
  };

  // --- ACTIONS: MUSIC PLAYER ---
  const handleTogglePlay = () => {
    bgMusicEngine.togglePlay();
  };

  const handleToggleMute = () => {
    bgMusicEngine.toggleMute();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    bgMusicEngine.setVolume(newVol);
  };

  const handleSelectTrack = (track: TrackInfo) => {
    const requiredTier = track.vipLevel || 'Gold';
    const canAccess = hasVipAccess(currentUser, requiredTier);

    if (track.isVip && !canAccess) {
      setVipNotice(`👑 "${track.title}" requires VIP ${requiredTier} access!`);
      setTimeout(() => setVipNotice(''), 4000);
      if (onOpenVipModal) {
        onOpenVipModal(track.title, requiredTier);
      }
      return;
    }

    bgMusicEngine.setTrack(track.id);
    if (!isPlaying) {
      bgMusicEngine.play();
    }
  };

  const handleNextTrack = () => {
    bgMusicEngine.nextTrack();
  };

  const handlePrevTrack = () => {
    bgMusicEngine.prevTrack();
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-40 select-none font-sans flex flex-col items-end"
      id="pebbles-unified-corner-sight"
    >
      {!isExpanded ? (
        /* ========================================================================= */
        /* MINIMIZED CONSOLIDATED SIGHT (Single elegant bottom-right floating pill)   */
        /* ========================================================================= */
        <div className="flex items-center gap-2 animate-fadeIn">
          {/* Quick Play/Pause Disc Button */}
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`p-2.5 rounded-full border shadow-2xl flex items-center justify-center transition-all duration-300 focus:outline-none group active:scale-95 ${
              isPlaying
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400 text-white shadow-cyan-500/40 ring-2 ring-cyan-400/50'
                : 'bg-slate-900/95 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:text-cyan-400 shadow-slate-950/80'
            }`}
            title={isPlaying ? `Pause BGM (${currentTrack.title})` : `Play BGM (${currentTrack.title})`}
            id="pebbles-hub-min-play-btn"
          >
            {isPlaying ? (
              <div className="flex items-center justify-center w-5 h-5 relative">
                <Disc className="w-5 h-5 animate-spin text-cyan-200" style={{ animationDuration: '3s' }} />
                <span className="absolute text-[9px] font-black">{currentTrack.icon}</span>
              </div>
            ) : (
              <Music className="w-5 h-5 group-hover:scale-110 transition-transform" />
            )}
          </button>

          {/* Quick Feed Treat Button if snacks available */}
          {totalSnacksAvailable > 0 && (
            <button
              type="button"
              onClick={() => {
                setIsExpanded(true);
                setActiveTab('feed');
                playSfx(587.33, 880);
              }}
              className="p-2.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 shadow-lg flex items-center justify-center transition-all active:scale-95 group relative"
              title={`Feed Pebbles! You have ${totalSnacksAvailable} snacks.`}
              id="pebbles-hub-min-feed-btn"
            >
              <Fish className="w-5 h-5 text-cyan-300 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 bg-cyan-400 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-full border border-slate-950 shadow">
                {totalSnacksAvailable}
              </span>
            </button>
          )}

          {/* Unified Hub Capsule Pill */}
          <button
            type="button"
            onClick={() => {
              setIsExpanded(true);
              playSfx(587.33, 880);
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-cyan-950/90 hover:from-slate-900/95 hover:to-cyan-900/90 border border-cyan-500/40 text-slate-100 text-xs font-bold flex items-center gap-2.5 shadow-2xl backdrop-blur-md transition-all active:scale-95 group hover:border-cyan-400"
            id="pebbles-unified-hub-expand-btn"
            title="Open Pebbles Hub: Tips, Jokes, Feed & Music Player!"
          >
            {/* Mascot Avatar */}
            <div className={`shrink-0 relative transition-transform ${isWaddling ? 'animate-bounce' : 'group-hover:scale-110'}`}>
              <PenguinSvg pose="happy" sizeClass="w-8 h-8" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500 border border-slate-900"></span>
              </span>
            </div>

            {/* Hub Title & Status Marquee */}
            <div className="flex flex-col text-left max-w-[130px] sm:max-w-[170px]">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-cyan-300 font-extrabold uppercase tracking-wider leading-none flex items-center gap-1">
                  <span>Pebbles Hub</span>
                </span>
                {isPlaying && !isMuted && (
                  <span className="flex items-end gap-0.5 h-2.5 w-3">
                    <span className="w-0.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDuration: '0.6s' }} />
                    <span className="w-0.5 bg-cyan-300 rounded-full animate-bounce" style={{ animationDuration: '0.9s', animationDelay: '0.1s' }} />
                    <span className="w-0.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDuration: '0.7s', animationDelay: '0.2s' }} />
                  </span>
                )}
              </div>
              <span className="text-xs font-black text-slate-100 truncate group-hover:text-cyan-200 mt-0.5">
                {isPlaying ? `🎵 ${currentTrack.title}` : totalSnacksAvailable > 0 ? `🐟 Feed Pebbles (${totalSnacksAvailable})` : `💡 ${currentQuote.text}`}
              </span>
            </div>

            {/* Quick Badges in Pill */}
            <div className="hidden sm:flex items-center gap-1 shrink-0">
              <span className="px-1.5 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 text-[10px] font-black border border-sky-500/30">
                Tips
              </span>
              <span className="px-1.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
                Jokes
              </span>
              <span className="px-1.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 text-[10px] font-black border border-cyan-500/30 flex items-center gap-0.5">
                <Fish className="w-2.5 h-2.5" />
                <span>Feed{totalSnacksAvailable > 0 ? ` (${totalSnacksAvailable})` : ''}</span>
              </span>
              <span className="px-1.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-black border border-slate-700 flex items-center gap-0.5">
                <Music className="w-2.5 h-2.5" />
                <span>BGM</span>
              </span>
            </div>

            <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-cyan-300 transition-transform shrink-0" />
          </button>
        </div>
      ) : (
        /* ========================================================================= */
        /* EXPANDED UNIFIED SIGHT CARD (Tips, Jokes & Music Player in 1 sight)       */
        /* ========================================================================= */
        <div className="w-84 sm:w-96 max-w-[calc(100vw-2rem)] rounded-3xl bg-slate-900/98 border border-cyan-500/40 shadow-2xl shadow-slate-950 p-4 backdrop-blur-xl animate-fadeIn space-y-3.5">
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsWaddling(true);
                  playSfx(659, 880);
                  setTimeout(() => setIsWaddling(false), 500);
                }}
                className="shrink-0 transition-transform active:scale-90 hover:scale-105"
                title="Pebbles The Mascot"
              >
                <PenguinSvg pose="happy" sizeClass="w-9 h-9" />
              </button>
              <div>
                <h4 className="text-xs font-black text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Pebbles Arcade Hub</span>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                </h4>
                <p className="text-[10px] text-cyan-300 font-semibold">
                  Tips • Jokes • Feed • Polar BGM 🐧
                </p>
              </div>
            </div>

            {/* Controls: Mute SFX + Minimize */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSoundEffectsEnabled(!soundEffectsEnabled)}
                className={`p-1.5 rounded-xl border transition-all ${
                  soundEffectsEnabled
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
                title={soundEffectsEnabled ? 'Mute Hub SFX' : 'Enable Hub SFX'}
                id="pebbles-hub-sfx-toggle-btn"
              >
                {soundEffectsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-100 transition-all active:scale-95"
                title="Minimize Hub"
                id="pebbles-hub-minimize-btn"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Unified Tab Switcher (1 Sight Navigation) */}
          <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-950/80 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setActiveTab('says');
                playSfx(587.33, 784);
              }}
              className={`py-1.5 px-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 ${
                activeTab === 'says'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
              id="tab-btn-pebbles-says"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Tips</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('jokes');
                playSfx(659, 880);
              }}
              className={`py-1.5 px-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 ${
                activeTab === 'jokes'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
              id="tab-btn-pebbles-jokes"
            >
              <Smile className="w-3.5 h-3.5" />
              <span>Jokes</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('feed');
                playSfx(659.25, 783.99);
              }}
              className={`py-1.5 px-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 relative ${
                activeTab === 'feed'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
              id="tab-btn-pebbles-feed"
            >
              <Fish className="w-3.5 h-3.5" />
              <span>Feed</span>
              {totalSnacksAvailable > 0 && (
                <span className={`px-1 py-0.2 rounded-full text-[9px] font-black leading-none ${
                  activeTab === 'feed' ? 'bg-slate-950 text-cyan-300' : 'bg-cyan-500 text-slate-950'
                }`}>
                  {totalSnacksAvailable}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('music');
                playSfx(523, 1046);
              }}
              className={`py-1.5 px-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 ${
                activeTab === 'music'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
              id="tab-btn-pebbles-music"
            >
              <Music className="w-3.5 h-3.5" />
              <span>Music</span>
              {isPlaying && !isMuted && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping" />
              )}
            </button>
          </div>

          {/* ======================================================================= */}
          {/* TAB 1: PEBBLES SAYS (TIPS & WISDOM)                                     */}
          {/* ======================================================================= */}
          {activeTab === 'says' && (
            <div className="space-y-3 animate-fadeIn">
              {/* Tip Bubble */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950/40 border border-sky-500/30 shadow-inner space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/40 font-mono font-bold flex items-center gap-1">
                    <span>{currentQuote.icon}</span>
                    <span>{currentQuote.tag}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Tip #{quoteIndex + 1}/{PEBBLES_SAYS_QUOTES.length}
                  </span>
                </div>

                <p className="text-xs font-black text-slate-100 leading-relaxed pt-0.5">
                  "{currentQuote.text}"
                </p>
              </div>

              {/* Action Buttons for Tips */}
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <div className="flex items-center gap-1.5">
                  {onOpenPanicModal && currentQuote.tag === 'Stealth Mode' && (
                    <button
                      type="button"
                      onClick={onOpenPanicModal}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-[10px] font-black border border-rose-500/30 flex items-center gap-1 transition-colors"
                    >
                      <ShieldAlert className="w-3 h-3 text-rose-400" />
                      <span>Panic Settings</span>
                    </button>
                  )}
                  {onOpenStore && currentQuote.tag === 'Store Perk' && (
                    <button
                      type="button"
                      onClick={onOpenStore}
                      className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-black border border-amber-500/30 flex items-center gap-1 transition-colors"
                    >
                      <ShoppingBag className="w-3 h-3 text-amber-400" />
                      <span>Open Store</span>
                    </button>
                  )}
                  <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                    Tap for more tips
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleNextQuote}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5 active:scale-95 shrink-0"
                  id="pebbles-next-tip-btn"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Next Tip 💡</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* TAB 2: PEBBLES JOKES                                                    */}
          {/* ======================================================================= */}
          {activeTab === 'jokes' && (
            <div className="space-y-3 animate-fadeIn">
              {/* Category selector pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'All Jokes' },
                  { id: 'gaming', label: 'Gaming 🎮' },
                  { id: 'ice', label: 'Arctic ❄️' },
                  { id: 'stealth', label: 'Stealth 🥷' },
                  { id: 'school', label: 'School 🎒' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setJokeCategory(cat.id);
                      setJokeIndex(0);
                      setShowPunchline(false);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold shrink-0 transition-all ${
                      jokeCategory === cat.id
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Joke Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30 border border-amber-500/30 shadow-inner space-y-2.5">
                <div className="flex items-center justify-between text-[10px] text-amber-300 font-bold">
                  <span className="flex items-center gap-1">
                    <span>{currentJoke.emoji}</span>
                    <span className="uppercase tracking-wider font-mono">{currentJoke.category}</span>
                  </span>
                  <span className="text-slate-500 font-mono">
                    Joke #{jokeIndex + 1}/{filteredJokes.length}
                  </span>
                </div>

                {/* Question */}
                <p className="text-xs font-black text-slate-100 leading-snug">
                  "{currentJoke.question}"
                </p>

                {/* Punchline or Reveal Button */}
                {showPunchline ? (
                  <div className="pt-2 border-t border-slate-800 animate-fadeIn">
                    <p className="text-xs font-black text-amber-300 leading-snug flex items-center gap-1.5">
                      <span>🐧</span>
                      <span>{currentJoke.punchline}</span>
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleTogglePunchline}
                    className="w-full py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-black transition-all flex items-center justify-center gap-1 active:scale-95"
                    id="pebbles-joke-reveal-btn"
                  >
                    <span>Click to Reveal Punchline 🎭</span>
                  </button>
                )}
              </div>

              {/* Feedback toast */}
              {jokeFeedback && (
                <div className="text-[10px] font-black text-emerald-400 text-center animate-fadeIn">
                  {jokeFeedback}
                </div>
              )}

              {/* Joke Action Controls */}
              <div className="flex items-center justify-between gap-1.5 pt-0.5">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleLikeJoke}
                    disabled={!!likedJokes[currentJoke.id]}
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all active:scale-95 ${
                      likedJokes[currentJoke.id]
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                        : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-rose-400'
                    }`}
                    title="Laugh at this joke & earn points!"
                  >
                    <Heart className={`w-3 h-3 ${likedJokes[currentJoke.id] ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span className="text-[10px]">{likedJokes[currentJoke.id] ? 'Liked!' : 'Haha (+1 PTS)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyJoke}
                    className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-cyan-300 transition-all active:scale-95"
                    title="Copy Joke"
                  >
                    {copiedJoke ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleNextJoke}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5 active:scale-95"
                  id="pebbles-next-joke-btn"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Next Joke 😂</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* TAB 3: FEED PEBBLES (INTERACTIVE FEEDING, JOY METER & SNACK BAG)         */}
          {/* ======================================================================= */}
          {activeTab === 'feed' && (
            <div className="space-y-3 animate-fadeIn" id="pebbles-hub-feed-tab">
              {/* Interactive Arctic Mascot Ice Stage */}
              <div className="relative p-3 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 border border-cyan-500/30 flex flex-col items-center justify-center text-center overflow-hidden shadow-inner">
                {/* Floating Hearts Animation during celebration */}
                {feedPhase === 'celebrating' && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                    {hearts.map((h) => (
                      <div
                        key={h.id}
                        className="absolute text-lg animate-bounce"
                        style={{
                          left: `${h.left}%`,
                          top: '15%',
                          animationDuration: '1.2s',
                          animationDelay: `${h.delay}s`,
                        }}
                      >
                        💖
                      </div>
                    ))}
                  </div>
                )}

                {/* Chewing Crumbs & Sparkles */}
                {feedPhase === 'eating' && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                    <div className="flex gap-2 text-base animate-ping">
                      {crumbs.map((c) => (
                        <span key={c.id}>{c.symbol}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Throwing Snack Flying Indicator */}
                {feedPhase === 'throwing' && activeSnack && (
                  <div className="absolute top-2 text-2xl animate-bounce z-20">
                    {activeSnack.icon}
                  </div>
                )}

                {/* Mascot Pose & Interactive Penguin */}
                <div className={`my-1 transition-transform duration-300 ${feedPhase === 'celebrating' ? 'scale-110' : ''}`}>
                  <PenguinSvg
                    pose={feedPhase === 'celebrating' ? 'fed' : feedPhase === 'eating' ? 'happy' : 'happy'}
                    sizeClass="w-16 h-16"
                    isEating={feedPhase === 'eating'}
                    isFed={feedPhase === 'celebrating'}
                  />
                </div>

                {/* Speech Bubble / Dynamic Reaction */}
                <div className="mt-1 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-xs font-bold text-slate-200 max-w-[280px]">
                  {reactionQuote ? (
                    <span className="text-cyan-300 animate-fadeIn">"{reactionQuote}"</span>
                  ) : happiness >= 90 ? (
                    <span className="text-pink-300">"Pebbles is overjoyed and totally stuffed! 💖"</span>
                  ) : totalSnacksAvailable > 0 ? (
                    <span className="text-slate-300">"Nook nook! Choose a snack below to feed Pebbles! 🐟"</span>
                  ) : (
                    <span className="text-amber-300">"Pebbles' snack pouch is empty! Visit Store for treats! 🛒"</span>
                  )}
                </div>

                {/* Joy Happiness Meter */}
                <div className="mt-2 w-full px-2">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider mb-1">
                    <span className="text-cyan-300 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                      <span>Happiness Level</span>
                    </span>
                    <span className="text-slate-300 font-mono font-bold">
                      {happiness}% •{' '}
                      {happiness >= 90
                        ? 'Overjoyed 💖'
                        : happiness >= 70
                        ? 'Happy 🐟'
                        : happiness >= 40
                        ? 'Content 🎮'
                        : 'Hungry ❄️'}
                    </span>
                  </div>

                  {/* Meter bar */}
                  <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-rose-400 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(5, happiness))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Snacks Bag List */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">
                  <span className="flex items-center gap-1">
                    <Fish className="w-3 h-3 text-cyan-400" />
                    <span>Treats in Bag ({totalSnacksAvailable})</span>
                  </span>
                  <span className="text-amber-400 flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    <span>{totalFedCount} Fed Total</span>
                  </span>
                </div>

                {totalSnacksAvailable > 0 ? (
                  <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto custom-scrollbar pr-0.5">
                    {PENGUIN_SNACKS.map((snack) => {
                      const count = snackInventory[snack.id] || 0;
                      if (count <= 0) return null;

                      return (
                        <div
                          key={snack.id}
                          className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between gap-2 transition-all group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                              {snack.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-black text-slate-100 truncate">{snack.name}</p>
                                <span className="px-1.5 py-0.2 rounded-md bg-cyan-500/20 text-cyan-300 font-mono font-bold text-[10px] shrink-0 border border-cyan-500/30">
                                  x{count}
                                </span>
                              </div>
                              <p className="text-[10px] text-cyan-400 font-bold truncate">
                                +{snack.hearts * 4}% Joy • {'❤️'.repeat(snack.hearts)}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={feedPhase !== 'idle'}
                            onClick={() => handleFeedSnack(snack)}
                            className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1 shadow-md active:scale-95 shrink-0 ${
                              feedPhase !== 'idle'
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/20'
                            }`}
                            id={`hub-feed-snack-btn-${snack.id}`}
                          >
                            <Utensils className="w-3 h-3 text-slate-950" />
                            <span>Feed</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center space-y-2">
                    <div className="text-2xl">🥣❄️</div>
                    <p className="text-xs font-bold text-slate-300">
                      Your snack pouch is empty!
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Earn PTS playing games and buy delicious arctic snacks for Pebbles in the Store.
                    </p>
                    {onOpenStore && (
                      <button
                        type="button"
                        onClick={onOpenStore}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 mx-auto active:scale-95"
                        id="hub-open-store-empty-snacks-btn"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Open Store to Buy Snacks</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Store shortcut if user has snacks */}
                {totalSnacksAvailable > 0 && onOpenStore && (
                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={onOpenStore}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 transition-colors"
                      id="hub-open-store-shortcut-btn"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Buy More Snacks in Store 🛒</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* TAB 4: MUSIC PLAYER (FULL POLAR SYNTH DASHBOARD)                        */}
          {/* ======================================================================= */}
          {activeTab === 'music' && (
            <div className="space-y-3 animate-fadeIn">
              {/* Current Track Banner */}
              <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 border border-cyan-500/30 shadow-inner flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-xl shrink-0 ${isPlaying ? 'animate-pulse' : ''}`}>
                    <span>{currentTrack.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-black text-cyan-200 truncate">{currentTrack.title}</h5>
                    <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                      {currentTrack.genre} • {currentTrack.bpm} BPM
                    </p>
                  </div>
                </div>

                {/* Animated visualizer */}
                {isPlaying && !isMuted && (
                  <div className="flex items-end gap-0.5 h-5 w-5 shrink-0 pr-1">
                    <span className="w-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDuration: '0.5s' }} />
                    <span className="w-1 bg-cyan-300 rounded-full animate-bounce" style={{ animationDuration: '0.8s', animationDelay: '0.1s' }} />
                    <span className="w-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDuration: '0.6s', animationDelay: '0.2s' }} />
                    <span className="w-1 bg-cyan-200 rounded-full animate-bounce" style={{ animationDuration: '0.9s', animationDelay: '0.15s' }} />
                  </div>
                )}
              </div>

              {/* Main Audio Transport Controls */}
              <div className="flex items-center justify-between gap-2 px-1">
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className={`p-2 rounded-xl border transition-all ${
                    isMuted
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:text-cyan-300'
                  }`}
                  title={isMuted ? 'Unmute BGM' : 'Mute BGM'}
                  id="hub-music-mute-btn"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevTrack}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-cyan-300 transition-all active:scale-95"
                    title="Previous Track"
                    id="hub-music-prev-btn"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className={`px-4 py-2 rounded-xl border font-black text-xs flex items-center gap-1.5 shadow-lg transition-all active:scale-95 ${
                      isPlaying
                        ? 'bg-cyan-500 hover:bg-cyan-400 border-cyan-400 text-slate-950 shadow-cyan-500/30'
                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border-cyan-400 text-white shadow-cyan-500/20'
                    }`}
                    id="hub-music-play-pause-btn"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-slate-950" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Play Loop</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleNextTrack}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-cyan-300 transition-all active:scale-95"
                    title="Next Track"
                    id="hub-music-next-btn"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Volume Level Indicator */}
                <span className="text-[11px] text-cyan-300 font-mono font-bold w-9 text-right">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>

              {/* Volume Slider */}
              <div className="px-1">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  id="hub-music-volume-slider"
                />
              </div>

              {/* VIP Notice Banner */}
              {vipNotice && (
                <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-black flex items-center justify-between gap-2 animate-fadeIn">
                  <span className="truncate text-[11px]">{vipNotice}</span>
                  {onOpenVipModal && (
                    <button
                      type="button"
                      onClick={() => onOpenVipModal()}
                      className="px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 text-[10px] font-black shrink-0 hover:bg-amber-300 transition-colors"
                    >
                      UPGRADE
                    </button>
                  )}
                </div>
              )}

              {/* Track Selection Catalog */}
              <div className="space-y-1.5 pt-1 border-t border-slate-800">
                <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider px-0.5">
                  <span>Soundtrack Loops ({MUSIC_TRACKS.length})</span>
                  <span className="text-amber-400 flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    <span>{MUSIC_TRACKS.filter((t) => t.isVip).length} VIP</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-0.5">
                  {MUSIC_TRACKS.map((t) => {
                    const isSelected = t.id === currentTrack.id;
                    const requiredTier = t.vipLevel || 'Gold';
                    const isLocked = t.isVip && !hasVipAccess(currentUser, requiredTier);

                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSelectTrack(t)}
                        className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 relative group ${
                          isSelected
                            ? t.isVip
                              ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/50'
                              : 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200 shadow-sm'
                            : t.isVip
                            ? 'bg-amber-950/20 hover:bg-amber-950/40 border-amber-500/40 text-amber-200/80 hover:text-amber-200'
                            : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-base shrink-0">{t.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <p className="text-[11px] font-black truncate">{t.title}</p>
                            {t.isVip && (
                              <span className="text-[8px] px-1 py-0.2 rounded font-black shrink-0 uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                {t.vipLevel || 'VIP'}
                              </span>
                            )}
                          </div>
                          <p className="text-[9px] text-slate-400 font-medium truncate">{t.genre}</p>
                        </div>

                        {isLocked && (
                          <div className="p-1 rounded-md bg-slate-900/90 border border-slate-700 text-slate-400 shrink-0">
                            <Lock className="w-3 h-3 text-amber-400" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* PERSISTENT MINI-MUSIC DOCK (Always available when on Tips or Jokes tab)   */}
          {/* ======================================================================= */}
          {activeTab !== 'music' && (
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('music')}
                className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity text-left group"
                title="Switch to full Music Player"
              >
                <div className={`w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xs shrink-0 ${isPlaying ? 'animate-pulse' : ''}`}>
                  <span>{currentTrack.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                    {isPlaying ? 'Now Playing' : 'BGM Radio'}
                  </p>
                  <p className="text-xs font-bold text-slate-200 truncate group-hover:text-cyan-300">
                    {currentTrack.title}
                  </p>
                </div>
              </button>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handlePrevTrack}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
                  title="Previous Track"
                >
                  <SkipBack className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isPlaying
                      ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-black'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                </button>

                <button
                  type="button"
                  onClick={handleNextTrack}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
                  title="Next Track"
                >
                  <SkipForward className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
