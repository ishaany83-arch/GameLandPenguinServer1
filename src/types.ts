export type CategoryType =
  | 'All'
  | 'Action'
  | 'Arcade'
  | 'Puzzle'
  | 'Sports'
  | 'Racing'
  | 'Strategy'
  | 'Retro'
  | 'Proxies';

export interface GameControl {
  key: string;
  action: string;
}

export interface Game {
  id: string;
  title: string;
  slug: string;
  category: CategoryType;
  description: string;
  thumbnailUrl: string;
  embedUrl: string;
  embedType?: 'iframe' | 'srcDoc';
  srcDocContent?: string;
  tags: string[];
  rating: number; // e.g. 4.8
  playCount: number;
  controls: GameControl[];
  author?: string;
  isFeatured?: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  isCustom?: boolean;
  isVipExclusive?: boolean;
  vipLevel?: 'Gold' | 'Platinum' | 'Diamond';
  aspectRatio?: '16/9' | '4/3' | '1/1';
}

export interface FilterState {
  searchQuery: string;
  category: CategoryType;
  sortBy: 'popular' | 'rating' | 'name' | 'newest';
  selectedTag: string | null;
  favoritesOnly: boolean;
}

export type DisguiseType = 'google_docs' | 'wikipedia' | 'canvas_lms' | 'calculator';

export interface StealthConfig {
  isActive: boolean;
  disguiseType: DisguiseType;
  panicKey: string;
}

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'vip' | 'frame' | 'booster' | 'title' | 'mystery' | 'snack';
  icon: string;
  vipTier?: 'Gold' | 'Platinum' | 'Diamond';
  frameClass?: string;
  titleBadge?: string;
  popular?: boolean;
  snackHearts?: number;
  snackJoyMessage?: string;
}

export interface GameFeedback {
  id: string;
  gameId: string;
  gameTitle: string;
  username: string;
  submittedBy?: string;
  category?: string;
  feedbackType: 'bug' | 'suggestion' | 'gameplay' | 'praise' | 'other' | string;
  rating?: number;
  message?: string;
  comment: string;
  upfrontPoints: number;
  adminBonusPoints?: number;
  status: 'pending' | 'processed' | 'bonus_awarded' | string;
  submittedAt: string;
  processedAt?: string;
  adminNotes?: string;
}
