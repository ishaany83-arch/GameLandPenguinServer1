import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Heart,
  Smile,
  RefreshCw,
  ShoppingBag,
  Fish,
  Utensils,
  X,
  Flame,
  Award,
} from 'lucide-react';
import {
  UserAccount,
  PENGUIN_SNACKS,
  PenguinSnackItem,
  getUserSnacksInventory,
  getPenguinStats,
  feedPenguinSnack,
} from '../utils/auth';

export interface PenguinMascotProps {
  pose?: 'gaming' | 'happy' | 'chill' | 'compact' | 'fed';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSpeechBubble?: boolean;
  interactive?: boolean;
  className?: string;
  currentUser?: UserAccount | null;
  onOpenStore?: () => void;
  showFeedControls?: boolean;
}

const PENGUIN_QUOTES = [
  "Slide into fun! What are we playing today? 🐧🎮",
  "Nook nook! Pebbles tested all 100+ games for zero lag!",
  "Pro tip: Hit the Stealth Panic key (P) if you need a quick Google Docs cover!",
  "Fun fact: Penguins can't fly, but our frame-rate sure soars! 🚀",
  "Chilling out in the Igloo Arcade is the best way to spend the day!",
  "Don't forget to star your favorite games so Pebbles can keep 'em handy!",
  "Glacier approved! 100% unblocked and ready to play! 🧊",
  "Waddling into the high scores! Let's break some records!",
];

// Lightweight client-side Web Audio synthesizer for tactile munching & celebration sound effects
function playFeedingAudio(type: 'munch' | 'cheer' | 'throw') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
      // 3 crispy chewing crunchy frequencies
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
      // Joyful 4-note chime arpeggio: C5, E5, G5, C6
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
    // AudioContext safely ignored if restricted
  }
}

export const PenguinSvg: React.FC<{
  pose?: string;
  sizeClass?: string;
  isEating?: boolean;
  isFed?: boolean;
}> = ({ pose = 'gaming', sizeClass = 'w-12 h-12', isEating = false, isFed = false }) => {
  const isJoyous = pose === 'fed' || isFed;
  const isChewing = isEating;

  return (
    <svg
      className={`${sizeClass} filter drop-shadow-md transition-all duration-300 ${
        isJoyous ? 'scale-110' : ''
      }`}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Glow / Aura */}
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="url(#iceGlow)"
        opacity={isJoyous ? '0.6' : '0.3'}
        className={isJoyous ? 'animate-pulse' : ''}
      />

      <defs>
        <radialGradient id="iceGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={isJoyous ? '#f43f5e' : '#38bdf8'} stopOpacity="0.9" />
          <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="bodyGrad" x1="50" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        <linearGradient id="bellyGrad" x1="50" y1="30" x2="50" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>

        <linearGradient id="beakGrad" x1="50" y1="42" x2="50" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>

      {/* Feet */}
      <ellipse cx="38" cy="85" rx="8" ry="4" fill="#f97316" />
      <ellipse cx="62" cy="85" rx="8" ry="4" fill="#f97316" />

      {/* Main Body */}
      <path
        d="M50 12 C 28 12 20 30 20 56 C 20 78 30 86 50 86 C 70 86 80 78 80 56 C 80 30 72 12 50 12 Z"
        fill="url(#bodyGrad)"
        stroke={isJoyous ? '#f43f5e' : '#38bdf8'}
        strokeWidth={isJoyous ? '2' : '1.5'}
      />

      {/* White Belly */}
      <path
        d="M50 32 C 34 32 30 48 30 64 C 30 78 38 82 50 82 C 62 82 70 78 70 64 C 70 48 66 32 50 32 Z"
        fill="url(#bellyGrad)"
      />

      {/* Flippers */}
      {isJoyous ? (
        // Flippers raised high in pure victory and joy!
        <>
          <path
            d="M19 44 C 9 30 9 16 18 14 C 25 18 27 32 23 47 Z"
            fill="#0f172a"
            stroke="#f43f5e"
            strokeWidth="1.5"
          />
          <path
            d="M81 44 C 91 30 91 16 82 14 C 75 18 73 32 77 47 Z"
            fill="#0f172a"
            stroke="#f43f5e"
            strokeWidth="1.5"
          />
        </>
      ) : pose === 'happy' || isChewing ? (
        // Flippers extended outwards
        <>
          <path
            d="M20 45 C 10 35 8 20 16 18 C 22 22 24 35 21 48 Z"
            fill="#0f172a"
            stroke="#38bdf8"
            strokeWidth="1"
          />
          <path
            d="M80 45 C 90 35 92 20 84 18 C 78 22 76 35 79 48 Z"
            fill="#0f172a"
            stroke="#38bdf8"
            strokeWidth="1"
          />
        </>
      ) : (
        // Standard flippers
        <>
          <path
            d="M21 45 C 12 52 10 65 18 68 C 22 62 24 52 22 45 Z"
            fill="#0f172a"
            stroke="#38bdf8"
            strokeWidth="1"
          />
          <path
            d="M79 45 C 88 52 90 65 82 68 C 78 62 76 52 78 45 Z"
            fill="#0f172a"
            stroke="#38bdf8"
            strokeWidth="1"
          />
        </>
      )}

      {/* Eyes */}
      {isJoyous ? (
        // Happy closed eyes (^ ^)
        <>
          <path
            d="M37 36 Q 41 30 45 36"
            fill="none"
            stroke="#0f172a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M55 36 Q 59 30 63 36"
            fill="none"
            stroke="#0f172a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </>
      ) : isChewing ? (
        // Chewing / blinking eyes (> <)
        <>
          <path
            d="M37 33 L 44 36 L 37 39"
            fill="none"
            stroke="#0f172a"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M63 33 L 56 36 L 63 39"
            fill="none"
            stroke="#0f172a"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      ) : (
        // Open gamer eyes
        <>
          <circle cx="41" cy="35" r="4.5" fill="#0f172a" />
          <circle cx="59" cy="35" r="4.5" fill="#0f172a" />
          <circle cx="42.5" cy="33.5" r="1.5" fill="#ffffff" />
          <circle cx="60.5" cy="33.5" r="1.5" fill="#ffffff" />
        </>
      )}

      {/* Blushing Cheeks */}
      <ellipse
        cx="34"
        cy="40"
        rx={isJoyous ? '4' : '3'}
        ry={isJoyous ? '3' : '2'}
        fill="#f43f5e"
        opacity={isJoyous ? '0.7' : '0.4'}
      />
      <ellipse
        cx="66"
        cy="40"
        rx={isJoyous ? '4' : '3'}
        ry={isJoyous ? '3' : '2'}
        fill="#f43f5e"
        opacity={isJoyous ? '0.7' : '0.4'}
      />

      {/* Beak */}
      {isChewing ? (
        // Open chewing beak
        <>
          <ellipse cx="50" cy="46" rx="6" ry="4" fill="#ea580c" />
          <path d="M44 44 L56 44 L50 49 Z" fill="url(#beakGrad)" />
        </>
      ) : isJoyous ? (
        // Happy smiling wide beak
        <path d="M43 43 L57 43 Q50 53 43 43 Z" fill="url(#beakGrad)" />
      ) : (
        // Regular beak
        <path d="M44 42 L56 42 L50 51 Z" fill="url(#beakGrad)" />
      )}

      {/* Cozy Winter Beanie Hat */}
      <path d="M28 22 C 32 10 68 10 72 22 C 74 24 26 24 28 22 Z" fill="#0284c7" />
      <rect x="25" y="20" width="50" height="6" rx="3" fill="#38bdf8" />
      <circle cx="50" cy="8" r="5" fill="#e0f2fe" />

      {/* Gamer Accessories (Headset) for 'gaming' pose */}
      {pose === 'gaming' && !isJoyous && (
        <>
          <path
            d="M26 28 C 26 12 74 12 74 28"
            fill="none"
            stroke="#a855f7"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <rect x="18" y="28" width="8" height="14" rx="4" fill="#a855f7" />
          <rect x="74" y="28" width="8" height="14" rx="4" fill="#a855f7" />
          <circle cx="22" cy="35" r="2" fill="#38bdf8" />
          <circle cx="78" cy="35" r="2" fill="#38bdf8" />
          <path
            d="M22 40 C 22 50 35 52 42 50"
            fill="none"
            stroke="#a855f7"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="43" cy="50" r="2.5" fill="#22c55e" />
        </>
      )}

      {/* Cozy Scarf */}
      <path d="M30 48 Q50 52 70 48 C72 56 28 56 30 48 Z" fill="#f43f5e" />
      <path d="M58 52 L58 68 C58 70 64 70 64 68 L64 52 Z" fill="#e11d48" />

      {/* Little Heart on Belly when Fed */}
      {isJoyous && (
        <path
          d="M50 58 C 50 58 45 53 45 50 C 45 47 48 45 50 48 C 52 45 55 47 55 50 C 55 53 50 58 50 58 Z"
          fill="#f43f5e"
          className="animate-pulse"
        />
      )}
    </svg>
  );
};

export const PenguinMascot: React.FC<PenguinMascotProps> = ({
  pose = 'gaming',
  size = 'md',
  showSpeechBubble = false,
  interactive = true,
  className = '',
  currentUser,
  onOpenStore,
  showFeedControls = false,
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isWaddling, setIsWaddling] = useState(false);

  // Feeding & Snack State
  const [isFeedDialogOpen, setIsFeedDialogOpen] = useState(false);
  const [feedPhase, setFeedPhase] = useState<'idle' | 'throwing' | 'eating' | 'celebrating'>('idle');
  const [activeSnack, setActiveSnack] = useState<PenguinSnackItem | null>(null);
  const [snackInventory, setSnackInventory] = useState<Record<string, number>>({});
  const [happiness, setHappiness] = useState<number>(85);
  const [totalFedCount, setTotalFedCount] = useState<number>(0);
  const [flyingSnackIcon, setFlyingSnackIcon] = useState<string | null>(null);
  const [hearts, setHearts] = useState<Array<{ id: number; left: number; delay: number }>>([]);
  const [crumbs, setCrumbs] = useState<Array<{ id: number; symbol: string }>>([]);
  const [reactionQuote, setReactionQuote] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Load and refresh snacks inventory & happiness
  const refreshStats = () => {
    const inv = getUserSnacksInventory(currentUser);
    const stats = getPenguinStats(currentUser);
    setSnackInventory(inv);
    setHappiness(stats.happiness);
    setTotalFedCount(stats.totalFed);
  };

  useEffect(() => {
    refreshStats();

    const handleFedEvent = (e: any) => {
      if (e.detail) {
        setHappiness(e.detail.happiness ?? 85);
        setTotalFedCount(e.detail.totalFed ?? 0);
        if (e.detail.snack) {
          triggerFeedingSequence(e.detail.snack, false);
        }
      }
    };

    const handleSnacksUpdated = (e: any) => {
      if (e.detail?.inventory) {
        setSnackInventory(e.detail.inventory);
      } else {
        refreshStats();
      }
    };

    window.addEventListener('gameland_penguin_fed', handleFedEvent);
    window.addEventListener('gameland_snacks_updated', handleSnacksUpdated);

    return () => {
      window.removeEventListener('gameland_penguin_fed', handleFedEvent);
      window.removeEventListener('gameland_snacks_updated', handleSnacksUpdated);
    };
  }, [currentUser]);

  const totalSnacksAvailable = Object.values(snackInventory).reduce<number>(
    (a, b) => a + (Number(b) || 0),
    0
  );

  // Feeding Animation Sequence
  const triggerFeedingSequence = (snack: PenguinSnackItem, performDeduct: boolean = true) => {
    if (performDeduct) {
      const result = feedPenguinSnack(currentUser || null, snack.id);
      if (!result.success) {
        alert(result.message);
        return;
      }
      setHappiness(result.happiness);
      setTotalFedCount(result.totalFed);
      refreshStats();
    }

    setActiveSnack(snack);
    setFlyingSnackIcon(snack.icon);
    setReactionQuote(snack.joyMessage);

    // Phase 1: Throwing / flying snack arc
    setFeedPhase('throwing');
    playFeedingAudio('throw');

    setTimeout(() => {
      // Phase 2: Munching & Chewing
      setFeedPhase('eating');
      setFlyingSnackIcon(null);
      playFeedingAudio('munch');

      // Create burst of crumbs and chew sparks
      const newCrumbs = [
        { id: 1, symbol: '✨' },
        { id: 2, symbol: '❄️' },
        { id: 3, symbol: '😋' },
        { id: 4, symbol: '⭐' },
      ];
      setCrumbs(newCrumbs);

      setTimeout(() => {
        // Phase 3: Joyful celebration with floating hearts & fanfare
        setFeedPhase('celebrating');
        playFeedingAudio('cheer');
        setCrumbs([]);

        // Generate 6 floating hearts
        const newHearts = Array.from({ length: 6 }, (_, i) => ({
          id: Date.now() + i,
          left: 15 + Math.random() * 70,
          delay: i * 0.12,
        }));
        setHearts(newHearts);

        // Phase 4: Idle return
        setTimeout(() => {
          setFeedPhase('idle');
          setHearts([]);
          setActiveSnack(null);
        }, 2000);
      }, 950);
    }, 450);
  };

  const nextQuote = () => {
    setIsWaddling(true);
    setQuoteIndex((prev) => (prev + 1) % PENGUIN_QUOTES.length);
    setReactionQuote(null);
    setTimeout(() => setIsWaddling(false), 500);
  };

  const handleOpenStoreClicked = () => {
    setIsFeedDialogOpen(false);
    if (onOpenStore) {
      onOpenStore();
    } else {
      window.dispatchEvent(new CustomEvent('gameland_open_store_modal'));
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const isEating = feedPhase === 'eating';
  const isJoyous = feedPhase === 'celebrating';

  return (
    <div ref={containerRef} className={`inline-flex items-center gap-3 relative select-none ${className}`}>
      {/* Flying Snack Animation Element */}
      {feedPhase === 'throwing' && flyingSnackIcon && (
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 text-2xl z-50 animate-bounce pointer-events-none transition-all duration-500 scale-125"
          style={{
            animationDuration: '0.4s',
          }}
        >
          {flyingSnackIcon}
        </div>
      )}

      {/* Floating Hearts Animation */}
      {hearts.map((h) => (
        <div
          key={h.id}
          className="absolute z-50 pointer-events-none text-rose-400 font-black animate-out fade-out slide-out-to-top-12 duration-1000"
          style={{
            left: `${h.left}%`,
            top: '-20px',
            animationDelay: `${h.delay}s`,
            animationFillMode: 'forwards',
          }}
        >
          <Heart className="w-5 h-5 fill-rose-500 text-rose-400 animate-pulse drop-shadow-md" />
        </div>
      ))}

      {/* Food Crumbs / Sparkles */}
      {crumbs.map((c, i) => (
        <span
          key={c.id}
          className="absolute z-40 text-xs animate-ping pointer-events-none"
          style={{
            left: `${35 + (i % 2) * 30}%`,
            top: `${25 + (i > 1 ? 15 : 0)}%`,
          }}
        >
          {c.symbol}
        </span>
      ))}

      {/* Mascot Avatar Button */}
      {interactive ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsFeedDialogOpen((prev) => !prev)}
            className={`relative focus:outline-none group cursor-pointer transition-transform active:scale-90 ${
              isWaddling || isEating || isJoyous ? 'animate-bounce' : ''
            }`}
            title="Click Pebbles to feed snacks or inspect happiness!"
            id="penguin-mascot-avatar-btn"
          >
            <PenguinSvg
              pose={isJoyous ? 'fed' : isEating ? 'happy' : pose}
              sizeClass={sizeClasses[size]}
              isEating={isEating}
              isFed={isJoyous}
            />

            {/* Snack Bag Badge indicator */}
            {totalSnacksAvailable > 0 ? (
              <span
                className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-full border border-slate-950 shadow-md flex items-center gap-0.5"
                title={`${totalSnacksAvailable} snacks in bag! Click to feed.`}
              >
                <span>🐟</span>
                <span>{totalSnacksAvailable}</span>
              </span>
            ) : (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 border border-slate-900"></span>
              </span>
            )}
          </button>

          {/* Quick Feed Floating Button pill if showFeedControls is enabled */}
          {showFeedControls && (
            <button
              type="button"
              onClick={() => setIsFeedDialogOpen((prev) => !prev)}
              className="mt-1.5 w-full text-[10px] font-black px-2 py-0.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm"
              id="mascot-quick-feed-btn"
            >
              <Utensils className="w-3 h-3 text-cyan-400" />
              <span>Feed Pebbles</span>
            </button>
          )}
        </div>
      ) : (
        <div
          className={`relative ${isWaddling || isEating || isJoyous ? 'animate-bounce' : ''}`}
          title="Pebbles The Penguin"
        >
          <PenguinSvg
            pose={isJoyous ? 'fed' : isEating ? 'happy' : pose}
            sizeClass={sizeClasses[size]}
            isEating={isEating}
            isFed={isJoyous}
          />
        </div>
      )}

      {/* Speech Bubble / Reaction display */}
      {(showSpeechBubble || reactionQuote) && (
        <div className="bg-slate-900/95 border border-cyan-500/40 backdrop-blur-md p-3 rounded-2xl shadow-xl max-w-xs text-xs text-slate-200 relative animate-in fade-in slide-in-from-left-2 duration-300 z-20">
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-slate-900" />
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-cyan-400 text-[11px] mb-0.5">
                {isJoyous ? <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" /> : <Smile className="w-3.5 h-3.5" />}
                <span>{isJoyous ? 'Pebbles is overjoyed!' : 'Pebbles Says:'}</span>
              </div>
              <p className="leading-snug text-slate-300 font-medium">
                {reactionQuote || PENGUIN_QUOTES[quoteIndex]}
              </p>
            </div>
            {interactive && !reactionQuote && (
              <button
                onClick={nextQuote}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 shrink-0 transition-colors"
                title="Next Penguin Tip"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* FEEDING & SNACK BAG INTERACTIVE POPOVER / MODAL */}
      {isFeedDialogOpen && (
        <div className="absolute top-full left-0 mt-3 z-50 w-72 sm:w-80 bg-slate-950/95 border border-cyan-500/40 rounded-2xl shadow-2xl p-4 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 text-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-base">
                🐟
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-100 flex items-center gap-1">
                  <span>Feed Pebbles</span>
                  <span className="text-[10px] text-cyan-400 font-semibold">(Snack Bag)</span>
                </h4>
                <p className="text-[10px] text-slate-400">
                  {totalFedCount > 0 ? `Fed ${totalFedCount}x total` : 'Ready for a tasty treat!'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsFeedDialogOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Close snack bag"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Happiness Meter */}
          <div className="my-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-[11px] mb-1 font-bold">
              <span className="text-slate-300 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>Happiness Level</span>
              </span>
              <span className="text-cyan-400 font-extrabold">{happiness}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-rose-400 to-pink-500 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, Math.max(10, happiness))}%` }}
              />
            </div>
          </div>

          {/* Snack Bag Inventory List */}
          <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
              <span>Your Treats</span>
              <span>{totalSnacksAvailable} available</span>
            </div>

            {totalSnacksAvailable > 0 ? (
              PENGUIN_SNACKS.map((snack) => {
                const count = snackInventory[snack.id] || 0;
                if (count <= 0) return null;

                return (
                  <div
                    key={snack.id}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between gap-2 transition-all group"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="text-2xl shrink-0 p-1 rounded-lg bg-slate-800/80 border border-slate-700">
                        {snack.icon}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-200 truncate">{snack.name}</span>
                          <span className="text-[10px] font-black text-cyan-400 px-1.5 py-0.2 rounded bg-cyan-500/10 border border-cyan-500/20">
                            x{count}
                          </span>
                        </div>
                        <p className="text-[10px] text-rose-400 flex items-center gap-1 mt-0.5">
                          <span>+{snack.hearts * 4}% Joy</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400 truncate">{snack.tag}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => triggerFeedingSequence(snack, true)}
                      disabled={feedPhase !== 'idle'}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 text-xs font-black shadow-md shadow-cyan-500/20 active:scale-95 transition-all shrink-0 flex items-center gap-1 disabled:opacity-50"
                    >
                      <span>Feed</span>
                      <span>🐟</span>
                    </button>
                  </div>
                );
              })
            ) : (
              /* Empty Bag State */
              <div className="p-3 text-center rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                <div className="text-3xl">🥣</div>
                <p className="text-xs font-bold text-slate-300">Your Snack Bag is Empty!</p>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Pebbles loves Arctic Krill, Glacier Sardines, and King Crab Feasts from the Arcade Store.
                </p>
              </div>
            )}
          </div>

          {/* Store CTA & Penguin Tips Button */}
          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenStoreClicked}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20 active:scale-95"
              id="mascot-visit-store-btn"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Buy Snacks in Store</span>
            </button>

            <button
              type="button"
              onClick={nextQuote}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 hover:border-slate-700 transition-colors"
              title="Hear another tip from Pebbles"
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
