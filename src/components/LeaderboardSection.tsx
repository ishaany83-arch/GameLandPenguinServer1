import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
  Crown,
  Sparkles,
  PlusCircle,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  User,
  Zap,
  Trash2,
  RotateCcw,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { Game } from '../types';
import { UserAccount } from '../utils/auth';
import {
  HighScoreEntry,
  getGameLeaderboard,
  submitHighScore,
  getUserPersonalBest,
  resetGameLeaderboardToZero,
  resetAllLeaderboardsToZero,
  deleteHighScoreEntry,
} from '../utils/leaderboards';
import { getAvatarById } from '../utils/penguinAvatars';

interface LeaderboardSectionProps {
  game: Game;
  currentUser: UserAccount | null;
}

const renderEntryAvatar = (avatarValue?: string, size: 'sm' | 'md' | 'lg' = 'sm') => {
  if (!avatarValue) return <span className="text-base">🎮</span>;
  if (avatarValue.startsWith('data:image/') || avatarValue.startsWith('http') || avatarValue.startsWith('blob:')) {
    const sizeClasses = size === 'lg' ? 'w-10 h-10' : size === 'md' ? 'w-8 h-8' : 'w-5 h-5';
    return (
      <img
        src={avatarValue}
        alt="Avatar"
        className={`${sizeClasses} rounded-full object-cover border border-slate-700 shadow-xs shrink-0`}
        referrerPolicy="no-referrer"
      />
    );
  }
  const avatarObj = getAvatarById(avatarValue);
  if (avatarObj.imageUrl) {
    const sizeClasses = size === 'lg' ? 'w-10 h-10' : size === 'md' ? 'w-8 h-8' : 'w-5 h-5';
    return (
      <img
        src={avatarObj.imageUrl}
        alt="Avatar"
        className={`${sizeClasses} rounded-full object-cover border border-slate-700 shadow-xs shrink-0`}
        referrerPolicy="no-referrer"
      />
    );
  }
  return <span className={size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-base'}>{avatarObj.emoji || avatarValue}</span>;
};

export const LeaderboardSection: React.FC<LeaderboardSectionProps> = ({ game, currentUser }) => {
  const [leaderboard, setLeaderboard] = useState<HighScoreEntry[]>([]);
  const [playerName, setPlayerName] = useState<string>('');
  const [scoreInput, setScoreInput] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; rank?: number; isError?: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [personalBest, setPersonalBest] = useState<HighScoreEntry | null>(null);

  // Load leaderboard on mount or when game changes
  useEffect(() => {
    loadLeaderboard();
  }, [game.id]);

  // Set default player name from logged-in user
  useEffect(() => {
    if (currentUser) {
      setPlayerName(currentUser.name || currentUser.username);
    } else {
      setPlayerName('Arctic Player');
    }
  }, [currentUser]);

  const loadLeaderboard = () => {
    const list = getGameLeaderboard(game.id);
    setLeaderboard(list);
    if (currentUser) {
      const best = getUserPersonalBest(game.id, currentUser.name || currentUser.username);
      setPersonalBest(best);
    }
  };

  const handleSubmitScore = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    let scoreNum = parseInt(scoreInput, 10);
    if (isNaN(scoreNum) || scoreNum < 0) {
      setFeedbackMsg({ text: 'Please enter a valid non-negative score number.', isError: true });
      return;
    }

    if (!playerName.trim()) {
      setFeedbackMsg({ text: 'Please enter a player name.', isError: true });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const isVipUser = currentUser?.isVip || currentUser?.isAdmin;
      
      // VIP Perks: 20% Bonus Score multiplier for VIP Diamond/Platinum/Gold members
      if (isVipUser && scoreNum > 0) {
        scoreNum = Math.floor(scoreNum * 1.2);
      }

      const userDetails = {
        avatar: currentUser?.avatar || '🐧',
        isVip: isVipUser,
        vipLevel: currentUser?.vipLevel || (currentUser?.isAdmin ? 'Platinum' : undefined),
      };

      const result = submitHighScore(game.id, playerName, scoreNum, userDetails);
      setLeaderboard(result.updatedList);
      setScoreInput('');

      // Check personal best
      const updatedBest = getUserPersonalBest(game.id, playerName);
      setPersonalBest(updatedBest);

      setFeedbackMsg({
        text: `Awesome! ${isVipUser ? 'VIP 1.2x Boost applied! ' : ''}High score of ${scoreNum.toLocaleString()} recorded!`,
        rank: result.newRank,
        isError: false,
      });

      setIsSubmitting(false);
    }, 400);
  };

  const handleResetCurrentGameToZero = () => {
    if (confirm(`Reset all high scores for "${game.title}" to zero?`)) {
      const reset = resetGameLeaderboardToZero(game.id);
      setLeaderboard(reset);
      setFeedbackMsg({ text: `Leaderboard for ${game.title} has been reset to 0!`, isError: false });
    }
  };

  const handleResetAllGamesToZero = () => {
    if (confirm(`Reset ALL scores across ALL games in GameLand to zero?`)) {
      resetAllLeaderboardsToZero();
      loadLeaderboard();
      setFeedbackMsg({ text: 'All high scores across every game have been reset to 0!', isError: false });
    }
  };

  const handleDeleteEntry = (entryId: string, name: string) => {
    if (confirm(`Delete score entry for "${name}"?`)) {
      const updated = deleteHighScoreEntry(game.id, entryId);
      setLeaderboard(updated);
      setFeedbackMsg({ text: `Removed entry for ${name}.`, isError: false });
    }
  };

  const top3 = leaderboard.slice(0, 3);

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffHours < 48) return 'Yesterday';
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Leaderboard Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-950 p-5 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/30 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                Local Leaderboards
              </span>
              <span className="text-xs text-slate-400">• Reset to 0 Available</span>
            </div>
            <h2 className="text-lg font-black text-white mt-0.5 flex items-center gap-2">
              <span>{game.title} Hall of Fame</span>
            </h2>
          </div>
        </div>

        {/* User Personal Best Banner */}
        {personalBest && (
          <div className="bg-slate-950/80 px-3.5 py-2 rounded-xl border border-amber-500/30 flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Your Personal Best</span>
              <span className="text-sm font-black text-amber-300">
                {personalBest.score.toLocaleString()} pts
              </span>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Zap className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Top 3 Podium & Leaderboard List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top 3 Podium Cards */}
          {top3.length > 0 && (
            <div className="grid grid-cols-3 gap-3 pt-2">
              {/* 2nd Place */}
              {top3[1] ? (
                <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3.5 flex flex-col items-center text-center relative mt-4 shadow-lg">
                  <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-600 text-slate-300 text-[10px] font-black flex items-center gap-1">
                    <Medal className="w-3 h-3 text-slate-300" />
                    <span>2nd</span>
                  </div>
                  <div className="mt-2 flex items-center justify-center">{renderEntryAvatar(top3[1].avatar, 'md')}</div>
                  <h4 className="text-xs font-bold text-slate-200 mt-1 line-clamp-1 w-full">{top3[1].playerName}</h4>
                  <p className="text-xs font-extrabold text-slate-300 mt-0.5">{top3[1].score.toLocaleString()}</p>
                </div>
              ) : (
                <div className="opacity-40 border border-dashed border-slate-800 rounded-2xl p-3" />
              )}

              {/* 1st Place */}
              {top3[0] && (
                <div className="bg-gradient-to-b from-amber-950/80 to-slate-900 border-2 border-amber-500/60 rounded-2xl p-4 flex flex-col items-center text-center relative shadow-xl shadow-amber-500/10">
                  <div className="absolute -top-3 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-md">
                    <Crown className="w-3 h-3 fill-slate-950 text-slate-950" />
                    <span>#1 CHAMP</span>
                  </div>
                  <div className="mt-1 animate-bounce flex items-center justify-center">{renderEntryAvatar(top3[0].avatar, 'lg')}</div>
                  <h4 className="text-xs font-extrabold text-amber-200 mt-1 line-clamp-1 w-full">{top3[0].playerName}</h4>
                  <p className="text-sm font-black text-amber-400 mt-0.5">{top3[0].score.toLocaleString()} pts</p>
                </div>
              )}

              {/* 3rd Place */}
              {top3[2] ? (
                <div className="bg-slate-900/90 border border-amber-900/40 rounded-2xl p-3.5 flex flex-col items-center text-center relative mt-4 shadow-lg">
                  <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-amber-950 border border-amber-700/60 text-amber-400 text-[10px] font-black flex items-center gap-1">
                    <Medal className="w-3 h-3 text-amber-500" />
                    <span>3rd</span>
                  </div>
                  <div className="mt-2 flex items-center justify-center">{renderEntryAvatar(top3[2].avatar, 'md')}</div>
                  <h4 className="text-xs font-bold text-slate-200 mt-1 line-clamp-1 w-full">{top3[2].playerName}</h4>
                  <p className="text-xs font-extrabold text-amber-300/80 mt-0.5">{top3[2].score.toLocaleString()}</p>
                </div>
              ) : (
                <div className="opacity-40 border border-dashed border-slate-800 rounded-2xl p-3" />
              )}
            </div>
          )}

          {/* Leaderboard Table List */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Rankings Table ({leaderboard.length} entries)</span>
              </h3>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadLeaderboard}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-bold flex items-center gap-1 transition-colors"
                  title="Refresh Leaderboard"
                  id="refresh-leaderboard-btn"
                >
                  <RefreshCw className="w-3 h-3 text-cyan-400" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-800/60 max-h-[380px] overflow-y-auto scrollbar-thin">
              {leaderboard.map((entry, idx) => {
                const rank = idx + 1;
                const isUserEntry =
                  currentUser &&
                  entry.playerName.toLowerCase() === (currentUser.name || currentUser.username).toLowerCase();

                return (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-3.5 text-xs transition-colors ${
                      isUserEntry
                        ? 'bg-amber-500/10 border-l-4 border-amber-400'
                        : idx < 3
                        ? 'bg-slate-900/40 hover:bg-slate-800/60'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Rank & Player Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                          rank === 1
                            ? 'bg-amber-500 text-slate-950'
                            : rank === 2
                            ? 'bg-slate-300 text-slate-950'
                            : rank === 3
                            ? 'bg-amber-800 text-amber-100'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {rank}
                      </span>

                      <div className="shrink-0 flex items-center justify-center">
                        {renderEntryAvatar(entry.avatar, 'sm')}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`font-bold truncate ${isUserEntry ? 'text-amber-300 font-black' : 'text-slate-200'}`}>
                            {entry.playerName}
                          </span>
                          {entry.isVip && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-extrabold flex items-center gap-0.5">
                              <Crown className="w-2.5 h-2.5 text-amber-400" />
                              <span>VIP {entry.vipLevel || 'Gold'}</span>
                            </span>
                          )}
                          {isUserEntry && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded font-bold">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 block">{formatDate(entry.date)}</span>
                      </div>
                    </div>

                    {/* Score & Admin Delete */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="font-mono font-black text-sm text-cyan-300">
                          {entry.score.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500 block">pts</span>
                      </div>

                      {currentUser?.isAdmin && (
                        <button
                          onClick={() => handleDeleteEntry(entry.id, entry.playerName)}
                          className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors"
                          title="Admin: Delete Score Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Submit Score Form */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                <PlusCircle className="w-4 h-4" />
                <span>Submit New High Score</span>
              </div>
              {(currentUser?.isVip || currentUser?.isAdmin) && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black uppercase flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>1.2x VIP Boost</span>
                </span>
              )}
            </div>

            <form onSubmit={handleSubmitScore} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Player Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    maxLength={24}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 pl-8 focus:outline-none focus:border-amber-500"
                    id="leaderboard-player-name-input"
                  />
                  <User className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Your High Score
                </label>
                <input
                  type="number"
                  value={scoreInput}
                  onChange={(e) => setScoreInput(e.target.value)}
                  placeholder="e.g. 12500"
                  min="0"
                  max="99999999"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 font-mono"
                  id="leaderboard-score-input"
                />
              </div>

              {/* Quick score addition helper buttons */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-semibold">Quick set:</span>
                {[0, 500, 2500, 10000].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setScoreInput(num.toString())}
                    className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono font-bold transition-colors"
                  >
                    {num === 0 ? '0 (Reset)' : `+${num}`}
                  </button>
                ))}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
                id="submit-high-score-btn"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-slate-950" />
                    <span>Submit Score to Leaderboard</span>
                  </>
                )}
              </button>
            </form>

            {/* Feedback Alert */}
            {feedbackMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-start gap-2 animate-fadeIn ${
                  feedbackMsg.isError
                    ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                    : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p>{feedbackMsg.text}</p>
                  {feedbackMsg.rank && (
                    <p className="font-black text-amber-300 mt-1">
                      🎉 Rank #{feedbackMsg.rank} on the Leaderboard!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Leaderboard & VIP Perks Info Box */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-2">
            <h4 className="font-bold text-slate-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>👑 VIP Leaderboard Perks</span>
            </h4>
            <p className="leading-relaxed text-[11px]">
              VIP Diamond & Gold members enjoy a +20% score bonus on all leaderboard submissions, exclusive golden badges, and ad-free instant play!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
