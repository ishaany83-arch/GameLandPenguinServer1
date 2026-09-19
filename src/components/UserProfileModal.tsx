import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  User,
  ShieldCheck,
  Check,
  Sparkles,
  Snowflake,
  Calendar,
  Mail,
  Crown,
  Zap,
  Star,
  Award,
  Flame,
  ShieldAlert,
  Gift,
  Package,
  CheckCircle2,
  Trophy,
  Gamepad2,
  Clock,
  Medal,
  Gem,
  ShoppingBag,
  Upload,
  Image as ImageIcon,
  Trash2,
  Camera,
  AlertCircle,
  Link as LinkIcon,
} from 'lucide-react';
import { UserAccount, updateUserAvatar, simulateNextDayLoginStreak, setActiveProfileFrame, MYSTERY_GIFT_POOLS, MysteryGiftItem, getUserPoints } from '../utils/auth';
import { PENGUIN_AVATARS, getAvatarById } from '../utils/penguinAvatars';
import { PENGUIN_TROPHIES, evaluateTrophies, getUserStats } from '../utils/trophies';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onUserUpdated: (user: UserAccount) => void;
  onOpenStore?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated,
  onOpenStore,
}) => {
  const currentAvatarObj = getAvatarById(currentUser.avatar);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(currentUser.avatar || currentAvatarObj.id);
  const [uploadedCustomPhoto, setUploadedCustomPhoto] = useState<string | null>(
    currentUser.avatar && (currentUser.avatar.startsWith('data:image/') || currentUser.avatar.startsWith('http') || currentUser.avatar.startsWith('blob:'))
      ? currentUser.avatar
      : null
  );
  const [customImageError, setCustomImageError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'vip'>('profile');
  const [vipMsg, setVipMsg] = useState('');
  const [streakMsg, setStreakMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      const avatar = currentUser.avatar || 'classic';
      setSelectedAvatarId(avatar);
      if (avatar.startsWith('data:image/') || avatar.startsWith('http') || avatar.startsWith('blob:')) {
        setUploadedCustomPhoto(avatar);
      }
      setCustomImageError(null);
    }
  }, [isOpen, currentUser.avatar]);

  const processImageFile = (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const validExtensions = /\.(png|jpe?g)$/i;

    if (!validTypes.includes(file.type.toLowerCase()) && !validExtensions.test(file.name)) {
      setCustomImageError('Invalid format! Please upload a PNG, JPG, or JPEG image file.');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setCustomImageError('Image file is too large (max 12MB). Please select a smaller photo.');
      return;
    }

    setIsUploading(true);
    setCustomImageError(null);

    const reader = new FileReader();
    reader.onerror = () => {
      setCustomImageError('Failed to read image file. Please try another image.');
      setIsUploading(false);
    };

    reader.onload = (e) => {
      const resultStr = e.target?.result as string;
      if (!resultStr) {
        setCustomImageError('Could not process image.');
        setIsUploading(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_DIM = 256;
          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;

          canvas.width = Math.min(minDim, MAX_DIM);
          canvas.height = Math.min(minDim, MAX_DIM);

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Canvas not available');
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, canvas.width, canvas.height);

          const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
          const optimizedDataUrl = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.88);

          setUploadedCustomPhoto(optimizedDataUrl);
          setSelectedAvatarId(optimizedDataUrl);
          setIsUploading(false);
          setCustomImageError(null);
        } catch {
          setUploadedCustomPhoto(resultStr);
          setSelectedAvatarId(resultStr);
          setIsUploading(false);
          setCustomImageError(null);
        }
      };
      img.onerror = () => {
        setCustomImageError('Failed to parse image data. Please ensure it is a valid PNG, JPG, or JPEG file.');
        setIsUploading(false);
      };
      img.src = resultStr;
    };

    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
    e.target.value = '';
  };

  const handleApplyUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:image/')) {
      setCustomImageError('URL must begin with https:// or http:// and point to a valid PNG, JPG, or JPEG image.');
      return;
    }
    setUploadedCustomPhoto(trimmed);
    setSelectedAvatarId(trimmed);
    setImageUrlInput('');
    setShowUrlInput(false);
    setCustomImageError(null);
  };

  const handleRemoveCustomPhoto = () => {
    setUploadedCustomPhoto(null);
    setSelectedAvatarId(PENGUIN_AVATARS[0].id);
    setCustomImageError(null);
  };

  if (!isOpen) return null;

  const handleSimulateStreak = () => {
    const { user: updated, newGift } = simulateNextDayLoginStreak(currentUser.username);
    if (updated) {
      onUserUpdated(updated);
      if (newGift) {
        setStreakMsg(`🎁 MYSTERY GIFT UNLOCKED! Milestone ${newGift.milestone} Days: ${newGift.name} (${newGift.icon})!`);
      } else if (updated.hasPenguinBadge && !currentUser.hasPenguinBadge) {
        setStreakMsg(`🎉 Consecutive Day Check-In Recorded! Streak: ${updated.loginStreak} Days! 🐧 PENGUIN BADGE UNLOCKED!`);
      } else {
        setStreakMsg(`🔥 Consecutive Day Check-In Recorded! Streak: ${updated.loginStreak} ${updated.loginStreak === 1 ? 'Day' : 'Days'}!`);
      }
      setTimeout(() => setStreakMsg(''), 5000);
    }
  };

  const handleEquipFrame = (frameClass: string | undefined) => {
    const updated = setActiveProfileFrame(currentUser.username, frameClass);
    if (updated) {
      onUserUpdated(updated);
    }
  };

  const handleSave = () => {
    const updated = updateUserAvatar(currentUser.username, selectedAvatarId);
    if (updated) {
      onUserUpdated(updated);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 600);
    }
  };

  const selectedAvatarObj = getAvatarById(selectedAvatarId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-2">
                <span>User Profile & VIP Membership</span>
              </h2>
              <p className="text-xs text-slate-400">Customize your avatar, check account perks & VIP benefits</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Close modal"
            id="close-profile-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-2 px-5 bg-slate-950 border-b border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
              activeTab === 'profile'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Avatars</span>
          </button>

          <button
            onClick={() => setActiveTab('vip')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
              activeTab === 'vip'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-amber-400 hover:text-amber-300 hover:bg-slate-900'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>VIP Lounge & Perks</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-extrabold uppercase border border-amber-500/40">
              {currentUser.isVip ? currentUser.vipLevel || 'ACTIVE' : 'PERKS'}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 custom-scrollbar">

          {/* Account Overview Card */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl ${selectedAvatarObj.bgColor} border ${selectedAvatarObj.borderColor} flex items-center justify-center text-2xl shadow-inner shrink-0 relative transition-all overflow-hidden ${currentUser.activeProfileFrame || ''}`}>
                {selectedAvatarObj.imageUrl ? (
                  <img
                    src={selectedAvatarObj.imageUrl}
                    alt="Avatar Preview"
                    className="w-full h-full object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span>{selectedAvatarObj.emoji}</span>
                )}
                {currentUser.isVip && (
                  <div className="absolute -top-2 -right-2 p-1 rounded-full bg-amber-500 text-slate-950 shadow-md z-10">
                    <Crown className="w-3 h-3 fill-slate-950" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-black text-slate-100">
                    {currentUser.name ? currentUser.name : currentUser.username}
                  </h3>
                  {currentUser.name && (
                    <span className="text-xs text-slate-400 font-medium">@{currentUser.username}</span>
                  )}
                  {currentUser.isAdmin && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black tracking-wider uppercase flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-amber-400" />
                      ADMIN
                    </span>
                  )}
                  {currentUser.isVip && (
                    <span className={`text-[10px] px-2 py-0.5 rounded font-black tracking-wider uppercase flex items-center gap-1 border shadow-xs ${
                      currentUser.vipLevel === 'Diamond'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-cyan-500/20'
                        : currentUser.vipLevel === 'Platinum'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-purple-500/20'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-500/20'
                    }`}>
                      <Crown className="w-3 h-3 text-amber-400" />
                      VIP {currentUser.vipLevel || 'Gold'}
                    </span>
                  )}
                  {(currentUser.hasPenguinBadge || (currentUser.loginStreak || 0) >= 2) && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-black tracking-wider flex items-center gap-1 shadow-md animate-pulse">
                      <span className="text-sm">🐧</span>
                      <span>PENGUIN BADGE</span>
                    </span>
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-black tracking-wider flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{currentUser.loginStreak || 1}D STREAK</span>
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{selectedAvatarObj.name} ({selectedAvatarObj.tagline})</span>
                </p>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1">
                  {currentUser.email && (
                    <span className="flex items-center gap-1 text-slate-400 font-medium">
                      <Mail className="w-3 h-3 text-cyan-400" />
                      <span>{currentUser.email}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>Joined: {new Date(currentUser.createdAt).toLocaleDateString()}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {activeTab === 'profile' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Gameland Points Balance Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-950 to-yellow-950/60 border border-amber-500/40 flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-black text-xl shrink-0">
                    🪙
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">
                      Gameland Arcade Points Balance
                    </h4>
                    <p className="text-base font-black text-slate-100 mt-0.5">
                      {getUserPoints(currentUser).toLocaleString()} <span className="text-xs text-amber-400">PTS Earned</span>
                    </p>
                  </div>
                </div>

                {onOpenStore && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenStore();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 shrink-0 active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Open Point Shop</span>
                  </button>
                )}
              </div>

              {/* Toast Message for Streak */}
              {streakMsg && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-indigo-500/20 border border-cyan-400/50 text-cyan-200 text-xs font-black flex items-center justify-between gap-2 shadow-lg animate-bounce">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                    <span>{streakMsg}</span>
                  </div>
                </div>
              )}

              {/* Daily Login Streak & Penguin Badge Card */}
              <div className="p-4.5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 border border-cyan-500/30 shadow-xl space-y-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                      <Flame className="w-5 h-5 fill-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-100 flex items-center gap-2">
                        <span>Daily Login Streak</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                          🔥 {currentUser.loginStreak || 1} {currentUser.loginStreak === 1 ? 'Day' : 'Days'}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400">Visit GameLand on consecutive days to unlock the Penguin Badge!</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSimulateStreak}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
                    title="Check in for today or simulate consecutive day visit"
                    id="check-in-streak-btn"
                  >
                    <Flame className="w-3.5 h-3.5 fill-amber-400" />
                    <span>Check In / +1 Day</span>
                  </button>
                </div>

                {/* Penguin Badge Reward Display */}
                {(currentUser.hasPenguinBadge || (currentUser.loginStreak || 0) >= 2) ? (
                  <div className="p-3.5 rounded-xl bg-cyan-950/80 border border-cyan-400/60 flex items-center gap-3 shadow-lg shadow-cyan-500/10">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-3xl shrink-0 shadow-inner animate-pulse">
                      🐧
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-cyan-300 uppercase tracking-wider">
                          Penguin Badge Unlocked!
                        </span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-cyan-400 text-slate-950 font-black">
                          EARNED 🏆
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                        You completed consecutive daily visits and earned the official 🐧 Penguin Badge displayed on your profile!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl shrink-0 text-slate-600 grayscale">
                      🐧
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
                          Penguin Badge (Locked)
                        </span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-400 font-bold">
                          {currentUser.loginStreak || 1} / 2 Days
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        Visit again tomorrow to reach a 2-day streak and unlock your official Penguin Badge on your profile!
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mystery Gift Milestone Reward System */}
              <div className="p-4.5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/50 border border-indigo-500/30 shadow-xl space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-100 flex items-center gap-2">
                        <span>Mystery Gift Rewards</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold uppercase tracking-wider">
                          7 / 14 / 30 Days
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Unlock a random virtual item, title, or animated profile frame when you reach streak milestones!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Milestones Track Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {([7, 14, 30] as const).map((milestone) => {
                    const streak = currentUser.loginStreak || 1;
                    const isReached = streak >= milestone;
                    const gifts = currentUser.mysteryGifts || [];
                    const milestoneGift = gifts.find((g) => g.milestone === milestone);

                    return (
                      <div
                        key={milestone}
                        className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 transition-all ${
                          isReached
                            ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                            : 'bg-slate-950/60 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-indigo-300 flex items-center gap-1">
                            <Gift className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{milestone}-DAY MILESTONE</span>
                          </span>
                          {isReached ? (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>UNLOCKED</span>
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-bold">
                              {streak}/{milestone} DAYS
                            </span>
                          )}
                        </div>

                        {milestoneGift ? (
                          <div className="p-2 rounded-lg bg-slate-900/90 border border-indigo-500/30 flex items-center gap-2">
                            <span className="text-2xl shrink-0">{milestoneGift.icon}</span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-black text-slate-100 truncate">{milestoneGift.name}</p>
                              <p className="text-[10px] text-indigo-300 font-semibold capitalize">{milestoneGift.category}</p>
                            </div>
                          </div>
                        ) : isReached ? (
                          <p className="text-[11px] text-amber-300 font-bold">🎁 Claiming Mystery Gift...</p>
                        ) : (
                          <p className="text-[11px] text-slate-500 italic">
                            Reach a {milestone}-day streak to receive a random virtual gift!
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Inventory of Unlocked Gifts */}
                {currentUser.mysteryGifts && currentUser.mysteryGifts.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 space-y-2.5">
                    <h5 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Your Unlocked Mystery Gifts & Profile Frames ({currentUser.mysteryGifts.length})</span>
                    </h5>

                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                      {currentUser.mysteryGifts.map((gift) => {
                        const isEquipped = gift.category === 'frame' && currentUser.activeProfileFrame === (gift.frameClass || gift.id);

                        return (
                          <div
                            key={gift.id}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                              isEquipped
                                ? 'bg-cyan-950/40 border-cyan-500/60 shadow-md'
                                : 'bg-slate-950/80 border-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl shrink-0">
                                {gift.icon}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h6 className="text-xs font-black text-slate-200 truncate">{gift.name}</h6>
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase font-black">
                                    {gift.category}
                                  </span>
                                  <span className="text-[9px] text-slate-500">
                                    {gift.milestone}d Streak
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 truncate mt-0.5">{gift.description}</p>
                              </div>
                            </div>

                            {gift.category === 'frame' && (
                              <button
                                type="button"
                                onClick={() => handleEquipFrame(isEquipped ? undefined : (gift.frameClass || gift.id))}
                                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all shrink-0 ${
                                  isEquipped
                                    ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                                }`}
                              >
                                {isEquipped ? (
                                  <>
                                    <Check className="w-3 h-3 stroke-[3]" />
                                    <span>Equipped</span>
                                  </>
                                ) : (
                                  <span>Equip Frame</span>
                                )}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Penguin Trophies & Milestones System */}
              <div className="p-4.5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 border border-amber-500/30 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-100 flex items-center gap-2">
                        <span>Penguin Trophies</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase tracking-wider">
                          {evaluateTrophies(currentUser.username).unlockedTrophies.length} / {PENGUIN_TROPHIES.length} Unlocked
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Earn exclusive polar trophies as you launch games, clock playtime, and save favorites!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Player Quick Stats Bar */}
                {(() => {
                  const stats = getUserStats(currentUser.username);
                  return (
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Games Launched</span>
                        <span className="font-mono font-black text-cyan-300 text-sm">{stats.totalGamesPlayed}</span>
                      </div>
                      <div className="space-y-0.5 border-x border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Playtime</span>
                        <span className="font-mono font-black text-emerald-300 text-sm">{stats.totalPlaytimeMinutes} Mins</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Favorites</span>
                        <span className="font-mono font-black text-rose-300 text-sm">{stats.favoriteCount} Saved</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Trophy Grid */}
                {(() => {
                  const trophyData = evaluateTrophies(currentUser.username);
                  const unlockedSet = new Set(trophyData.unlockedTrophies.map((t) => t.id));
                  const stats = getUserStats(currentUser.username);
                  const streak = currentUser.loginStreak || 1;
                  const isVip = !!(currentUser.isVip || currentUser.activeProfileFrame);

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                      {PENGUIN_TROPHIES.map((trophy) => {
                        const isUnlocked = unlockedSet.has(trophy.id);

                        // Calculate current progress
                        let currentVal = 0;
                        switch (trophy.requirementType) {
                          case 'games_played':
                            currentVal = stats.totalGamesPlayed;
                            break;
                          case 'playtime_minutes':
                            currentVal = stats.totalPlaytimeMinutes;
                            break;
                          case 'favorite_count':
                            currentVal = stats.favoriteCount;
                            break;
                          case 'streak_days':
                            currentVal = streak;
                            break;
                          case 'vip_status':
                            currentVal = isVip ? 1 : 0;
                            break;
                        }

                        const progressPct = Math.min(100, Math.round((currentVal / trophy.requirementValue) * 100));

                        return (
                          <div
                            key={trophy.id}
                            className={`p-3 rounded-xl border flex items-start gap-3 transition-all relative ${
                              isUnlocked
                                ? 'bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border-amber-400/60 shadow-md shadow-amber-500/10'
                                : 'bg-slate-950/60 border-slate-800/80 opacity-75'
                            }`}
                          >
                            <div
                              className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xl shrink-0 ${
                                isUnlocked
                                  ? 'bg-amber-500/20 border-amber-400/60 text-amber-200 animate-pulse'
                                  : 'bg-slate-900 border-slate-800 text-slate-500 grayscale'
                              }`}
                            >
                              <span>{trophy.icon}</span>
                            </div>

                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center justify-between gap-1">
                                <h5 className="text-xs font-black text-slate-100 truncate flex items-center gap-1">
                                  <span>{trophy.title}</span>
                                </h5>
                                {isUnlocked ? (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black shrink-0 flex items-center gap-0.5">
                                    <Trophy className="w-2.5 h-2.5 text-amber-400" />
                                    <span>UNLOCKED</span>
                                  </span>
                                ) : (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-bold shrink-0">
                                    {currentVal}/{trophy.requirementValue}
                                  </span>
                                )}
                              </div>

                              <p className="text-[10px] text-slate-400 font-medium leading-relaxed line-clamp-2">
                                {trophy.description}
                              </p>

                              {/* Progress bar for locked trophies */}
                              {!isUnlocked && (
                                <div className="space-y-1 pt-0.5">
                                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                                      style={{ width: `${progressPct}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Custom Image Avatar Upload Section (PNG, JPG, JPEG) */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/jpg, .png, .jpg, .jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                  id="custom-avatar-file-input"
                />

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <span>Upload Custom Avatar Photo:</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 font-extrabold border border-cyan-500/20">
                      PNG
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 font-extrabold border border-blue-500/20">
                      JPG
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 font-extrabold border border-indigo-500/20">
                      JPEG
                    </span>
                  </div>
                </div>

                {customImageError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{customImageError}</span>
                  </div>
                )}

                {/* Custom Photo Active / Upload Box */}
                {uploadedCustomPhoto ? (
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div
                      onClick={() => setSelectedAvatarId(uploadedCustomPhoto)}
                      className={`flex items-center gap-3 cursor-pointer group p-1.5 rounded-xl transition-all ${
                        selectedAvatarId === uploadedCustomPhoto ? 'ring-2 ring-cyan-400/50 bg-cyan-500/10' : 'hover:bg-slate-800/50'
                      }`}
                      title="Click to select this custom avatar"
                    >
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-cyan-400 shadow-md shrink-0">
                        <img
                          src={uploadedCustomPhoto}
                          alt="Custom Avatar"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {selectedAvatarId === uploadedCustomPhoto && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-black text-slate-100 group-hover:text-cyan-300 transition-colors">
                            Custom Image Avatar
                          </p>
                          {selectedAvatarId === uploadedCustomPhoto && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-extrabold border border-cyan-500/40">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {selectedAvatarId === uploadedCustomPhoto ? 'Active photo for your profile' : 'Click to equip this custom photo'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        id="change-custom-avatar-btn"
                      >
                        <Upload className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Change Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveCustomPhoto}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                        title="Remove custom photo and reset to preset avatar"
                        id="remove-custom-avatar-btn"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-5 rounded-2xl border-2 border-dashed cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-2 group ${
                      isDragging
                        ? 'border-cyan-400 bg-cyan-500/15 scale-[1.01]'
                        : 'border-slate-700 hover:border-cyan-400/60 bg-slate-900/60 hover:bg-slate-900'
                    }`}
                    id="avatar-upload-dropzone"
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {isUploading ? (
                        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                        {isUploading ? 'Optimizing photo...' : 'Click to browse or drag & drop image'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Accepts PNG, JPG, or JPEG (auto-cropped to square & compressed for speed)
                      </p>
                    </div>
                  </div>
                )}

                {/* Optional Image Link URL Input */}
                <div className="pt-1">
                  {!showUrlInput ? (
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(true)}
                      className="text-[11px] text-slate-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
                      id="toggle-url-avatar-btn"
                    >
                      <LinkIcon className="w-3 h-3 text-cyan-400" />
                      <span>Or paste an image web URL (.png, .jpg, .jpeg)</span>
                    </button>
                  ) : (
                    <div className="space-y-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <LinkIcon className="w-3 h-3 text-cyan-400" />
                          <span>Image Web Link:</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowUrlInput(false)}
                          className="text-slate-500 hover:text-slate-300"
                        >
                          Cancel
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          placeholder="https://example.com/avatar.png"
                          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                        />
                        <button
                          type="button"
                          onClick={handleApplyUrl}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors"
                        >
                          Apply URL
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Penguin Avatar Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Snowflake className="w-4 h-4 text-cyan-400" />
                    <span>Or Choose a Classic Penguin Mascot Avatar:</span>
                  </label>
                  <span className="text-[11px] text-cyan-400 font-semibold">{PENGUIN_AVATARS.length} Presets</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {uploadedCustomPhoto && (
                    <button
                      type="button"
                      onClick={() => setSelectedAvatarId(uploadedCustomPhoto)}
                      className={`relative p-3 rounded-2xl border flex flex-col items-center text-center transition-all group focus:outline-none ${
                        selectedAvatarId === uploadedCustomPhoto
                          ? 'bg-cyan-500/20 border-cyan-400 ring-2 ring-cyan-400/50 scale-105 shadow-lg'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950 text-slate-400'
                      }`}
                      id="avatar-preset-btn-custom-photo"
                      title="Select your uploaded custom photo"
                    >
                      {selectedAvatarId === uploadedCustomPhoto && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                      <div className="w-9 h-9 rounded-xl overflow-hidden mb-1 border border-cyan-400/50 shadow-inner group-hover:scale-105 transition-transform shrink-0">
                        <img
                          src={uploadedCustomPhoto}
                          alt="My Custom Avatar"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className={`text-[11px] font-bold truncate w-full ${selectedAvatarId === uploadedCustomPhoto ? 'text-cyan-300' : 'text-slate-300'}`}>
                        Custom Photo
                      </span>
                      <span className="text-[9px] text-slate-500 truncate w-full mt-0.5">
                        PNG/JPG/JPEG
                      </span>
                    </button>
                  )}
                  {PENGUIN_AVATARS.map((avatar) => {
                    const isSelected = selectedAvatarId === avatar.id;
                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => setSelectedAvatarId(avatar.id)}
                        className={`relative p-3 rounded-2xl border flex flex-col items-center text-center transition-all group focus:outline-none ${
                          isSelected
                            ? `${avatar.bgColor} ${avatar.borderColor} ring-2 ring-cyan-400/50 scale-105 shadow-lg`
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950 text-slate-400'
                        }`}
                        id={`avatar-preset-btn-${avatar.id}`}
                      >
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                        <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{avatar.emoji}</span>
                        <span className={`text-[11px] font-bold truncate w-full ${isSelected ? 'text-slate-100' : 'text-slate-300'}`}>
                          {avatar.name}
                        </span>
                        <span className="text-[9px] text-slate-500 truncate w-full mt-0.5">
                          {avatar.tagline}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vip' && (
            <div className="space-y-4 animate-fadeIn">
              {vipMsg && (
                <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{vipMsg}</span>
                </div>
              )}

              {/* Status Header Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-950 to-cyan-950/60 border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                    <Crown className="w-5 h-5 fill-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">
                      Your Active VIP Membership Level
                    </h4>
                    <p className="text-sm font-extrabold text-slate-100 mt-0.5">
                      {currentUser.isAdmin
                        ? 'Supreme Admin Status (All VIP Diamond Perks Active)'
                        : currentUser.isVip
                        ? `VIP ${currentUser.vipLevel || 'Gold'} Tier Member`
                        : 'Regular Member (No Active VIP Pass)'}
                    </p>
                  </div>
                </div>

                {!currentUser.isVip && !currentUser.isAdmin && (
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-bold border border-slate-700 shrink-0">
                    Free Tier
                  </span>
                )}
              </div>

              {/* 3 VIP Tiers Detailed Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Gameland VIP Level Comparison & Perks:</span>
                </h4>

                {/* Tier 1: Gold */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  (currentUser.isVip && (currentUser.vipLevel === 'Gold' || !currentUser.vipLevel)) || currentUser.isAdmin
                    ? 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/60 ring-1 ring-amber-500/40'
                    : 'bg-slate-950/80 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        <Crown className="w-4 h-4 fill-amber-400" />
                      </span>
                      <div>
                        <h5 className="text-xs font-black text-amber-300 uppercase tracking-wider">
                          Gold VIP Tier
                        </h5>
                        <p className="text-[10px] text-slate-400">Entry Level VIP Access</p>
                      </div>
                    </div>

                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/40">
                      1.25x Multiplier ⚡
                    </span>
                  </div>

                  <ul className="text-xs space-y-1.5 text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Unlocks all standard VIP Exclusive Games in catalog</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Aurora Gold Symphony Ambient Lo-Fi BGM Track</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Gold VIP Badge on header and high scores</span>
                    </li>
                  </ul>
                </div>

                {/* Tier 2: Platinum */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  (currentUser.isVip && currentUser.vipLevel === 'Platinum') || currentUser.isAdmin
                    ? 'bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border-purple-500/60 ring-1 ring-purple-500/40'
                    : 'bg-slate-950/80 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between gap-2 border-b border-purple-500/20 pb-2.5 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        <Zap className="w-4 h-4" />
                      </span>
                      <div>
                        <h5 className="text-xs font-black text-purple-300 uppercase tracking-wider">
                          Platinum VIP Tier
                        </h5>
                        <p className="text-[10px] text-slate-400">Enhanced Audio & Customizer Tier</p>
                      </div>
                    </div>

                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-extrabold border border-purple-500/40">
                      1.5x Multiplier ⚡
                    </span>
                  </div>

                  <ul className="text-xs space-y-1.5 text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Includes all Gold VIP perks & games</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Cyber Polar Synthwave BGM Loop & Audio EQ</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Custom Panic Disguise Config & Platinum Frame</span>
                    </li>
                  </ul>
                </div>

                {/* Tier 3: Diamond */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  (currentUser.isVip && currentUser.vipLevel === 'Diamond') || currentUser.isAdmin
                    ? 'bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border-cyan-500/60 ring-1 ring-cyan-500/40'
                    : 'bg-slate-950/80 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between gap-2 border-b border-cyan-500/20 pb-2.5 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        <Gem className="w-4 h-4" />
                      </span>
                      <div>
                        <h5 className="text-xs font-black text-cyan-300 uppercase tracking-wider">
                          Diamond VIP Tier (Supreme)
                        </h5>
                        <p className="text-[10px] text-slate-400">Ultimate Performance & Custom Glow</p>
                      </div>
                    </div>

                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-extrabold border border-cyan-500/40">
                      2.0x Multiplier ⚡
                    </span>
                  </div>

                  <ul className="text-xs space-y-1.5 text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Includes all Gold & Platinum VIP perks</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Emperor Diamond Royal Anthem Chiptune Track</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Turbo Zero-Delay Game Launcher & Diamond Shimmer Frame</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
            id="cancel-profile-btn"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={savedSuccess}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shadow-lg ${
              savedSuccess
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20 active:scale-95'
            }`}
            id="save-profile-avatar-btn"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Profile Updated!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{selectedAvatarObj.imageUrl ? 'Save Custom Photo Avatar' : 'Save Avatar Icon'}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
