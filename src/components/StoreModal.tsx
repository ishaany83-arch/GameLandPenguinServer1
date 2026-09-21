import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Crown,
  Sparkles,
  Zap,
  Gem,
  Award,
  Check,
  Flame,
  Gift,
  HelpCircle,
  Coins,
  ShieldCheck,
  User,
  Clock,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Fish,
} from 'lucide-react';
import { StoreItem } from '../types';
import {
  UserAccount,
  getUserPoints,
  purchaseStoreItem,
  hasVipAccess,
  getUserPendingVipPass,
  approvePendingVipPass,
  cancelPendingVipPass,
  getUserSnacksInventory,
} from '../utils/auth';

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onUserUpdated: (user: UserAccount | null) => void;
  onOpenAuthModal?: () => void;
}

const STORE_ITEMS: StoreItem[] = [
  // VIP PASSES
  {
    id: 'store-vip-gold',
    name: 'Gold VIP Pass 👑',
    description: 'Unlocks all VIP Exclusive games, 1.25x Points Multiplier & Aurora Gold BGM.',
    price: 100,
    category: 'vip',
    vipTier: 'Gold',
    icon: '👑',
    popular: true,
  },
  {
    id: 'store-vip-platinum',
    name: 'Platinum VIP Pass ⚡',
    description: 'Includes Gold + Cyber Synthwave tracks, 1.5x Points Multiplier & Panic Disguise.',
    price: 250,
    category: 'vip',
    vipTier: 'Platinum',
    icon: '⚡',
    popular: true,
  },
  {
    id: 'store-vip-diamond',
    name: 'Diamond Supreme VIP 💎',
    description: 'Supreme status! 2.0x Points Multiplier, Royal Anthem, Diamond Glow & Turbo Launch.',
    price: 500,
    category: 'vip',
    vipTier: 'Diamond',
    icon: '💎',
    popular: true,
  },

  // PROFILE FRAMES
  {
    id: 'store-frame-cyan',
    name: 'Cyan Diamond Glow Frame',
    description: 'Equip a pulsing electric cyan glow ring around your penguin avatar.',
    price: 8,
    category: 'frame',
    frameClass: 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900 animate-pulse',
    icon: '✨',
  },
  {
    id: 'store-frame-purple',
    name: 'Cyber Neon Purple Frame',
    description: 'Sleek neon purple avatar frame border inspired by retro synthwave.',
    price: 8,
    category: 'frame',
    frameClass: 'ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-900',
    icon: '👾',
  },
  {
    id: 'store-frame-gold',
    name: 'Golden Royalty Ring',
    description: 'A majestic golden ring frame fit for Gameland champions.',
    price: 12,
    category: 'frame',
    frameClass: 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900',
    icon: '🏆',
  },
  {
    id: 'store-frame-emerald',
    name: 'Emerald Pulse Matrix Frame ❇️',
    description: 'Pulsing cybernetic emerald green laser border for high-rank players.',
    price: 12,
    category: 'frame',
    frameClass: 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900 animate-pulse',
    icon: '❇️',
  },
  {
    id: 'store-frame-fire',
    name: 'Inferno Flame Aura Frame 🔥',
    description: 'Fiery orange-red glowing aura ring around your avatar.',
    price: 15,
    category: 'frame',
    frameClass: 'ring-2 ring-orange-500 ring-offset-2 ring-offset-slate-900 shadow-lg shadow-orange-500/50',
    icon: '🔥',
    popular: true,
  },
  {
    id: 'store-frame-rainbow',
    name: 'Prism Rainbow Glow Ring 🌈',
    description: 'Prismatic cycling rainbow border ring for elite arcade gamers.',
    price: 18,
    category: 'frame',
    frameClass: 'ring-2 ring-pink-500 ring-offset-2 ring-offset-slate-900 shadow-lg shadow-pink-500/50',
    icon: '🌈',
  },
  {
    id: 'store-frame-galaxy',
    name: 'Cosmic Nebula Galaxy Ring 🌌',
    description: 'Deep space indigo glowing cosmic aura with pulsing starlight energy.',
    price: 20,
    category: 'frame',
    frameClass: 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 shadow-xl shadow-indigo-500/60 animate-pulse',
    icon: '🌌',
  },

  // USER TITLES
  {
    id: 'store-title-monarch',
    name: 'Title: "Penguin Monarch 👑"',
    description: 'Display the legendary Penguin Monarch title on your user profile.',
    price: 6,
    category: 'title',
    titleBadge: 'Penguin Monarch 👑',
    icon: '🐧',
  },
  {
    id: 'store-title-master',
    name: 'Title: "Arcade Master 🕹️"',
    description: 'Display the elite Arcade Master title across all leaderboards.',
    price: 6,
    category: 'title',
    titleBadge: 'Arcade Master 🕹️',
    icon: '🕹️',
  },
  {
    id: 'store-title-champion',
    name: 'Title: "Gameland Champion 🔥"',
    description: 'The ultimate title awarded to top arcade point earners.',
    price: 10,
    category: 'title',
    titleBadge: 'Gameland Champion 🔥',
    icon: '🔥',
  },
  {
    id: 'store-title-speedrunner',
    name: 'Title: "Speedrun Legend ⚡"',
    description: 'Display "Speedrun Legend ⚡" on your user profile and leaderboards.',
    price: 8,
    category: 'title',
    titleBadge: 'Speedrun Legend ⚡',
    icon: '⚡',
  },
  {
    id: 'store-title-highscorer',
    name: 'Title: "Score Warlord 🎯"',
    description: 'Display "Score Warlord 🎯" on your user profile and rank cards.',
    price: 8,
    category: 'title',
    titleBadge: 'Score Warlord 🎯',
    icon: '🎯',
  },
  {
    id: 'store-title-stealth',
    name: 'Title: "Stealth Ninja 🥷"',
    description: 'Showcase your master stealth skills with the "Stealth Ninja 🥷" badge.',
    price: 10,
    category: 'title',
    titleBadge: 'Stealth Ninja 🥷',
    icon: '🥷',
  },
  {
    id: 'store-title-cyber',
    name: 'Title: "Cyber Overlord 👾"',
    description: 'Equip the neon synthwave "Cyber Overlord 👾" title badge.',
    price: 12,
    category: 'title',
    titleBadge: 'Cyber Overlord 👾',
    icon: '👾',
  },
  {
    id: 'store-title-godlike',
    name: 'Title: "Gameland Deity 🌟"',
    description: 'The supreme mythical title reserved for Gameland legends.',
    price: 25,
    category: 'title',
    titleBadge: 'Gameland Deity 🌟',
    icon: '🌟',
    popular: true,
  },

  // MYSTERY BOXES
  {
    id: 'store-mystery-box',
    name: 'Gameland Mystery Gift Box',
    description: 'Open for an instant surprise item, avatar frame, or bonus perk!',
    price: 5,
    category: 'mystery',
    icon: '🎁',
  },
  {
    id: 'store-mystery-mega',
    name: 'Mega VIP Mystery Chest 🧰',
    description: 'Higher chance for rare profile frames, exclusive titles, or 25+ PTS bonuses!',
    price: 15,
    category: 'mystery',
    icon: '🧰',
    popular: true,
  },
  {
    id: 'store-mystery-legend',
    name: 'Legendary Fortune Crate 🔮',
    description: 'Unlocks rare titles, ultra-glow frames, or instant 50+ PTS point windfalls!',
    price: 30,
    category: 'mystery',
    icon: '🔮',
  },

  // BOOSTERS & SPECIAL PERKS
  {
    id: 'store-booster-pts-2x',
    name: 'Double PTS Multiplier Token 🪙',
    description: 'Instantly grants +25 PTS bonus and double points rate booster on played games!',
    price: 15,
    category: 'booster',
    icon: '🪙',
    popular: true,
  },
  {
    id: 'store-booster-lucky',
    name: 'Lucky Leaderboard Charm 🍀',
    description: 'Equip a lucky charm for extra high-score flair and +20 PTS bonus points!',
    price: 10,
    category: 'booster',
    icon: '🍀',
  },
  {
    id: 'store-booster-panic',
    name: 'Instant Panic Disguise Shortcut ⌨️',
    description: 'Unlocks advanced panic keybind customizer for stealth mode switching.',
    price: 12,
    category: 'booster',
    icon: '⌨️',
  },
  {
    id: 'store-booster-music',
    name: 'Retro Synth Arcade Soundtrack 🎶',
    description: 'Unlocks custom retro 8-bit chiptune background tracks in audio synthesizer.',
    price: 15,
    category: 'booster',
    icon: '🎶',
  },

  // VIRTUAL PENGUIN SNACKS
  {
    id: 'store-snack-krill',
    name: 'Crispy Arctic Krill 🦐',
    description: "Crunchy deep-sea polar krill. Pebbles' favorite everyday snack! Boosts penguin happiness.",
    price: 3,
    category: 'snack',
    icon: '🦐',
    popular: true,
  },
  {
    id: 'store-snack-sardine',
    name: 'Glacier Sardine Skewer 🐟',
    description: 'Flash-frozen glacier sardine packed with raw arcade energy. Makes Pebbles waddle with joy!',
    price: 5,
    category: 'snack',
    icon: '🐟',
    popular: true,
  },
  {
    id: 'store-snack-icecream',
    name: 'Polar Pop Ice Cream 🍦',
    description: "Chilled blueberry-swirl arctic soft-serve ice cream cone! Cools down Pebbles' gaming brain.",
    price: 6,
    category: 'snack',
    icon: '🍦',
  },
  {
    id: 'store-snack-shrimp',
    name: 'Bioluminescent Shrimp 🦐✨',
    description: 'Glowing neon deep-water shrimp that makes Pebbles sparkle with magical arctic light!',
    price: 8,
    category: 'snack',
    icon: '🦐✨',
  },
  {
    id: 'store-snack-snowcone',
    name: 'Rainbow Glacier Snow Cone 🍧',
    description: 'Shaved polar snow drizzled with five tropical syrups! Big burst of happiness and confetti.',
    price: 10,
    category: 'snack',
    icon: '🍧',
  },
  {
    id: 'store-snack-crab',
    name: 'Royal King Crab Feast 🦀',
    description: 'Steaming king crab leg feast fit for an Arctic emperor! Pebbles bows in eternal gratitude.',
    price: 15,
    category: 'snack',
    icon: '🦀',
    popular: true,
  },
];

export const StoreModal: React.FC<StoreModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated,
  onOpenAuthModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  if (!isOpen) return null;

  const currentPoints = getUserPoints(currentUser);
  const pendingVip = getUserPendingVipPass(currentUser);
  const userSnacks = getUserSnacksInventory(currentUser);

  const filteredItems = STORE_ITEMS.filter((item) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'vip') return item.category === 'vip';
    if (selectedCategory === 'snack') return item.category === 'snack';
    if (selectedCategory === 'frame') return item.category === 'frame';
    if (selectedCategory === 'title') return item.category === 'title';
    if (selectedCategory === 'mystery') return item.category === 'mystery';
    if (selectedCategory === 'booster') return item.category === 'booster';
    return true;
  });

  const handleBuy = (item: StoreItem) => {
    setFeedback(null);
    const result = purchaseStoreItem(currentUser, item);

    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      onUserUpdated(result.user);
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  const handleApproveVip = () => {
    setIsProcessingAction(true);
    setTimeout(() => {
      const res = approvePendingVipPass(currentUser);
      setIsProcessingAction(false);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        onUserUpdated(res.user);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    }, 1200);
  };

  const handleCancelVip = () => {
    setIsProcessingAction(true);
    setTimeout(() => {
      const res = cancelPendingVipPass(currentUser);
      setIsProcessingAction(false);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        onUserUpdated(res.user);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-amber-500/10 text-slate-100 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Top Header Background Glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">Gameland Point Shop</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black border border-amber-500/40 uppercase">
                  Arcade Rewards
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Earn points by playing games! Spend points to unlock VIP passes, frames & titles.
              </p>
            </div>
          </div>

          {/* User Points Badge */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-amber-500/40 flex items-center gap-3 shrink-0 shadow-inner">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-black text-lg">
              🪙
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                Your Balance
              </span>
              <span className="text-lg font-black text-amber-300 tracking-tight">
                {currentPoints.toLocaleString()} <span className="text-xs text-amber-400/80">PTS</span>
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {feedback && (
          <div
            className={`mt-3 p-3 rounded-2xl border text-xs font-bold flex items-center justify-between gap-2 shrink-0 animate-fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
            }`}
          >
            <span>{feedback.message}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs opacity-70 hover:opacity-100 font-black"
            >
              ✕
            </button>
          </div>
        )}

        {/* Pending VIP Pass Order Processing Card */}
        {pendingVip && (
          <div className="mt-3 p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-950 to-yellow-950/80 border border-amber-500/60 shadow-xl shrink-0 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                      ⏳ Order Status: Processing Request
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/30 text-amber-200 border border-amber-500/40">
                      Pending VIP Grant
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white mt-0.5">
                    {pendingVip.name} (🪙 {pendingVip.price} PTS)
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Your order was submitted and is undergoing Gameland security verification.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {currentUser?.isAdmin || currentUser?.username?.toLowerCase() === 'pebblesthepenguinishaany83' ? (
                  <button
                    type="button"
                    onClick={handleApproveVip}
                    disabled={isProcessingAction}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessingAction ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>Admin Approve ⚡</span>
                  </button>
                ) : (
                  <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Awaiting Admin Review</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCancelVip}
                  disabled={isProcessingAction}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel & Refund
                </button>
              </div>
            </div>

            {/* Processing Steps Indicator */}
            <div className="mt-3 pt-2.5 border-t border-amber-500/20 grid grid-cols-3 gap-2 text-[10px] text-slate-300">
              <div className="flex items-center gap-1.5 text-amber-300 font-extrabold">
                <span className="w-4 h-4 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-[9px]">1</span>
                <span>Points Reserved ✓</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400 font-extrabold animate-pulse">
                <span className="w-4 h-4 rounded-full bg-amber-500/40 border border-amber-400 flex items-center justify-center text-[9px]">2</span>
                <span>Processing Verification... ⏳</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
                <span className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px]">3</span>
                <span>VIP Access Grant</span>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 my-3 overflow-x-auto custom-scrollbar pb-1 shrink-0">
          {[
            { id: 'all', label: 'All Items', icon: <Coins className="w-3.5 h-3.5" /> },
            { id: 'snack', label: 'Penguin Snacks 🐟', icon: <Fish className="w-3.5 h-3.5 text-cyan-400" /> },
            { id: 'vip', label: 'VIP Passes', icon: <Crown className="w-3.5 h-3.5 text-amber-400" /> },
            { id: 'frame', label: 'Profile Frames', icon: <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> },
            { id: 'title', label: 'User Titles', icon: <Award className="w-3.5 h-3.5 text-purple-400" /> },
            { id: 'mystery', label: 'Mystery Boxes', icon: <Gift className="w-3.5 h-3.5 text-rose-400" /> },
            { id: 'booster', label: 'Boosters & Perks', icon: <Zap className="w-3.5 h-3.5 text-emerald-400" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                selectedCategory === tab.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Store Grid Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pr-1 my-1 flex-1">
          {filteredItems.map((item) => {
            const isSnack = item.category === 'snack';
            const snackOwnedCount = userSnacks[item.id] || 0;

            const isVipOwned =
              item.category === 'vip' &&
              item.vipTier &&
              hasVipAccess(currentUser, item.vipTier);

            const isItemProcessing = pendingVip && pendingVip.id === item.id;

            const isAlreadyPurchased =
              !isSnack &&
              (isVipOwned ||
                (currentUser?.purchasedItemIds && currentUser.purchasedItemIds.includes(item.id)));

            const canAfford = currentPoints >= item.price;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                  isItemProcessing
                    ? 'bg-amber-950/30 border-amber-500/60'
                    : isSnack
                    ? 'bg-gradient-to-br from-cyan-950/30 via-slate-950 to-slate-900 border-cyan-500/30 hover:border-cyan-500/60'
                    : item.popular
                    ? 'bg-gradient-to-br from-amber-950/40 via-slate-950 to-slate-900 border-amber-500/50'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Snack Bag Count or Popular Tag */}
                {isSnack && snackOwnedCount > 0 ? (
                  <div className="absolute top-0 right-0 bg-cyan-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-bl-xl shadow-md flex items-center gap-1">
                    <span>In Bag: {snackOwnedCount} 🎒</span>
                  </div>
                ) : item.popular && !isItemProcessing ? (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-yellow-400 text-slate-950 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-xl shadow-md">
                    Featured
                  </div>
                ) : null}

                {isItemProcessing && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-xl shadow-md flex items-center gap-1">
                    <Clock className="w-3 h-3 animate-spin" />
                    <span>Processing</span>
                  </div>
                )}

                <div>
                  {/* Top Item Info */}
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl shrink-0 shadow-inner ${
                      isSnack
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    }`}>
                      {item.icon}
                    </div>

                    <div className="flex-1 pr-4">
                      <h4 className="text-sm font-extrabold text-slate-100 flex items-center gap-1.5">
                        <span>{item.name}</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-snug">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Price & Action */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400 font-black text-sm">🪙 {item.price}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">PTS</span>
                  </div>

                  {isItemProcessing ? (
                    <button
                      type="button"
                      onClick={handleApproveVip}
                      disabled={isProcessingAction}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 text-xs font-black flex items-center gap-1.5 transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing Order...</span>
                    </button>
                  ) : isAlreadyPurchased ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Unlocked</span>
                    </span>
                  ) : isSnack ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleBuy(item)}
                        disabled={!canAfford}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 shadow-sm ${
                          canAfford
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 shadow-cyan-500/20 active:scale-95'
                            : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed'
                        }`}
                      >
                        <Fish className="w-3.5 h-3.5" />
                        <span>{canAfford ? (snackOwnedCount > 0 ? 'Buy More (+1)' : 'Buy Snack') : 'Need Points'}</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford}
                      className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/20 active:scale-95'
                          : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{canAfford ? 'Buy Now' : 'Need Points'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Tip Bar */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Earn <strong className="text-amber-300">+1 PTS</strong> every time you play any game! VIP users earn up to 2.0x points!</span>
          </div>

          {!currentUser && onOpenAuthModal && (
            <button
              onClick={() => {
                onClose();
                onOpenAuthModal();
              }}
              className="text-cyan-400 hover:underline font-bold text-xs"
            >
              Sign in to save points permanently ➔
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
