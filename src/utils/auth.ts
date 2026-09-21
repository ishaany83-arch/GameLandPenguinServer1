import {
  emitSocketUsersSync,
  emitSocketUserRegister,
  fetchServerUsersSync,
  BACKEND_URL,
  getEffectiveBackendUrl,
  cloudRunUpdateCoins,
  cloudRunUpdateVip,
  cloudRunMassCoins,
  cloudRunPromoteAllVip,
} from './socketClient';

export interface MysteryGiftItem {
  id: string;
  milestone: 7 | 14 | 30;
  name: string;
  description: string;
  icon: string;
  category: 'frame' | 'item' | 'title';
  frameClass?: string;
  unlockedAt: string;
}

export interface PendingVipPass {
  id: string;
  name: string;
  vipTier: 'Gold' | 'Platinum' | 'Diamond';
  price: number;
  requestedAt: string;
  status: 'processing' | 'approved' | 'rejected';
}

export interface UserAccount {
  username: string;
  name?: string;
  email?: string;
  createdAt: string;
  lastLogin: string;
  isAdmin?: boolean;
  avatar?: string;
  isTestAccount?: boolean;
  testAccountUsed?: boolean;
  testAccountUsedAt?: string;
  isVip?: boolean;
  vipLevel?: 'Gold' | 'Diamond' | 'Platinum' | 'VIP';
  vipGrantedAt?: string;
  loginStreak?: number;
  lastStreakDate?: string;
  hasPenguinBadge?: boolean;
  mysteryGifts?: MysteryGiftItem[];
  activeProfileFrame?: string;
  unlockedTrophyIds?: string[];
  points?: number;
  purchasedItemIds?: string[];
  unlockedTitles?: string[];
  pendingVipPass?: PendingVipPass;
  snacksInventory?: Record<string, number>;
  penguinHappiness?: number;
  penguinFeedCount?: number;
}

export interface PenguinSnackItem {
  id: string;
  name: string;
  icon: string;
  price: number;
  description: string;
  joyMessage: string;
  hearts: number;
  tag: string;
}

export const PENGUIN_SNACKS: PenguinSnackItem[] = [
  {
    id: 'store-snack-krill',
    name: 'Crispy Arctic Krill 🦐',
    icon: '🦐',
    price: 3,
    description: "Crunchy deep-sea polar krill. Pebbles' go-to everyday snack!",
    joyMessage: "Crunch crunch! Salty and crispy, Pebbles is doing a happy waddle!",
    hearts: 2,
    tag: 'Favorite',
  },
  {
    id: 'store-snack-sardine',
    name: 'Glacier Sardine Skewer 🐟',
    icon: '🐟',
    price: 5,
    description: "Fresh flash-frozen glacier sardine, packed with raw gaming energy!",
    joyMessage: "Gulp! Fresh glacier fish gives Pebbles maximum arcade focus!",
    hearts: 3,
    tag: 'Energy',
  },
  {
    id: 'store-snack-icecream',
    name: 'Polar Pop Ice Cream 🍦',
    icon: '🍦',
    price: 6,
    description: "Chilled blueberry-swirl arctic soft-serve ice cream cone.",
    joyMessage: "Brain freeze! So sweet, icy cool, and refreshing!",
    hearts: 3,
    tag: 'Sweet Treat',
  },
  {
    id: 'store-snack-shrimp',
    name: 'Bioluminescent Shrimp 🦐✨',
    icon: '🦐✨',
    price: 8,
    description: "Glowing neon deep-water shrimp that makes Pebbles sparkle!",
    joyMessage: "Sparkle blast! Pebbles' belly is glowing with magical arctic light!",
    hearts: 4,
    tag: 'Magical',
  },
  {
    id: 'store-snack-snowcone',
    name: 'Rainbow Glacier Snow Cone 🍧',
    icon: '🍧',
    price: 10,
    description: "Shaved polar snow drizzled with five tropical fruit syrups!",
    joyMessage: "YUMMM! An explosion of rainbow flavors! Pebbles is dancing!",
    hearts: 5,
    tag: 'Deluxe',
  },
  {
    id: 'store-snack-crab',
    name: 'Royal King Crab Feast 🦀',
    icon: '🦀',
    price: 15,
    description: "Steaming king crab leg feast fit for an Arctic emperor!",
    joyMessage: "ROYAL BANQUET! Pebbles bows down in ultimate penguin gratitude! 👑",
    hearts: 6,
    tag: 'Feast',
  },
];

const USERS_KEY = 'gameland_users_db_v1';
const SESSION_KEY = 'gameland_active_session_v1';
const MY_ACCOUNTS_KEY = 'gameland_my_saved_accounts_v1';
const DEVICE_USED_TEST_KEY = 'gameland_device_used_test_account_v1';
const PASS_LIMIT_OVERRIDE_KEY = 'gameland_pass_limit_override_v1';
const PASS_LIMIT_MAX_COUNT_KEY = 'gameland_pass_limit_max_count_v1';

export function isPassLimitOverrideActive(): boolean {
  try {
    return localStorage.getItem(PASS_LIMIT_OVERRIDE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setPassLimitOverride(active: boolean): void {
  try {
    localStorage.setItem(PASS_LIMIT_OVERRIDE_KEY, active ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to set pass limit override', e);
  }
}

export function getPassLimitMaxCount(): number {
  try {
    const val = localStorage.getItem(PASS_LIMIT_MAX_COUNT_KEY);
    return val ? parseInt(val, 10) || 1 : 1;
  } catch {
    return 1;
  }
}

export function setPassLimitMaxCount(count: number): void {
  try {
    localStorage.setItem(PASS_LIMIT_MAX_COUNT_KEY, count.toString());
  } catch (e) {
    console.error('Failed to set pass limit max count', e);
  }
}

export function resetSingleAccountPassLock(username: string): boolean {
  const users = getStoredUsers();
  const key = username.toLowerCase();
  if (users[key]) {
    users[key].testAccountUsed = false;
    delete users[key].testAccountUsedAt;
    saveUsers(users);
    return true;
  }
  return false;
}

export function getMySavedAccounts(): (UserAccount & { passwordHash: string })[] {
  try {
    const raw = localStorage.getItem(MY_ACCOUNTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveToMyAccounts(account: UserAccount & { passwordHash: string }) {
  try {
    const existing = getMySavedAccounts();
    const updated = [
      account,
      ...existing.filter((a) => a.username.toLowerCase() !== account.username.toLowerCase()),
    ];
    localStorage.setItem(MY_ACCOUNTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save user account locally', e);
  }
}

// Seed default users including the primary admin account
const ADMIN_USERNAME = 'Pebblesthepenguinishaany83';
const ADMIN_PASSWORD = 'Pebblesthepenguinneedsagepoop';

type StoredUserRecord = {
  passwordHash: string;
  name?: string;
  email?: string;
  createdAt: string;
  lastLogin: string;
  isAdmin?: boolean;
  avatar?: string;
  isTestAccount?: boolean;
  testAccountUsed?: boolean;
  testAccountUsedAt?: string;
  isVip?: boolean;
  vipLevel?: 'Gold' | 'Diamond' | 'Platinum' | 'VIP';
  vipGrantedAt?: string;
  loginStreak?: number;
  lastStreakDate?: string;
  hasPenguinBadge?: boolean;
  mysteryGifts?: MysteryGiftItem[];
  activeProfileFrame?: string;
  unlockedTrophyIds?: string[];
  points?: number;
  purchasedItemIds?: string[];
  unlockedTitles?: string[];
  pendingVipPass?: PendingVipPass;
  snacksInventory?: Record<string, number>;
  penguinHappiness?: number;
  penguinFeedCount?: number;
};

const DEFAULT_USERS: Record<string, StoredUserRecord> = {
  [ADMIN_USERNAME.toLowerCase()]: {
    passwordHash: ADMIN_PASSWORD,
    name: 'Pebbles (Ishaan)',
    email: 'ishaany83@gmail.com',
    createdAt: '2026-08-25T16:23:21.287Z',
    lastLogin: '2026-08-25T16:36:45.304Z',
    isAdmin: true,
    isVip: true,
    vipLevel: 'Diamond',
    points: 13,
    vipGrantedAt: '2026-09-20T12:25:12.905Z',
    purchasedItemIds: ['store-title-monarch', 'store-mystery-mega'],
    loginStreak: 1,
    lastStreakDate: '2026-09-20',
    hasPenguinBadge: true,
    mysteryGifts: [
      {
        id: 'title-champion-14',
        milestone: 14,
        name: 'Arctic Champion Title',
        description: 'Honorary title awarded for 14 consecutive days of check-ins.',
        icon: '👑',
        category: 'title',
        unlockedAt: '2026-09-14T00:17:59.743Z',
      },
      {
        id: 'item-scepter-7',
        milestone: 7,
        name: 'Glacier Scepter',
        description: 'A magical frozen wand carved from ancient polar ice.',
        icon: '🪄',
        category: 'item',
        unlockedAt: '2026-09-16T00:23:44.831Z',
      },
    ],
    unlockedTrophyIds: ['first_game', 'vip_unlocked', 'playtime_1m'],
    unlockedTitles: ['Penguin Monarch 👑', 'Arctic Champion Title'],
    avatar: 'king',
  },
  test_pass_alpha: {
    passwordHash: 'testpass123',
    name: 'Alpha Tester Pass #1',
    email: 'alpha@gameland.test',
    createdAt: '2026-08-25T16:23:14.638Z',
    lastLogin: '2026-08-25T16:24:25.981Z',
    isAdmin: false,
    isTestAccount: true,
    testAccountUsed: true,
    testAccountUsedAt: '2026-08-25T16:24:25.981Z',
    points: 11,
    unlockedTrophyIds: ['first_game', 'playtime_1m'],
    loginStreak: 1,
    lastStreakDate: '2026-08-25',
    hasPenguinBadge: false,
    mysteryGifts: [],
    avatar: 'hockey',
  },
  test_pass_beta: {
    passwordHash: 'testpass123',
    name: 'Beta Tester Pass #2',
    email: 'beta@gameland.test',
    createdAt: '2026-08-25T16:23:14.638Z',
    lastLogin: '2026-08-25T16:23:14.638Z',
    isAdmin: false,
    isTestAccount: true,
    testAccountUsed: false,
    points: 260,
  },
  test_pass_vip: {
    passwordHash: 'testpass123',
    name: 'VIP Guest Pass #3',
    email: 'vip@gameland.test',
    createdAt: '2026-08-25T16:23:14.638Z',
    lastLogin: '2026-08-25T16:23:14.638Z',
    isAdmin: false,
    isTestAccount: true,
    testAccountUsed: false,
    isVip: true,
    vipLevel: 'Gold',
    vipGrantedAt: '2026-08-25T16:23:14.638Z',
    points: 260,
    testAccountUsedAt: '2026-09-13T21:23:25.465Z',
  },
  gamer: {
    passwordHash: 'gameland123',
    name: 'Alex Gamer',
    email: 'gamer@gameland.com',
    createdAt: '2026-08-25T16:23:14.638Z',
    lastLogin: '2026-08-25T16:23:14.638Z',
    isAdmin: false,
    points: 260,
  },
  pebbles: {
    passwordHash: 'penguin2026',
    name: 'Penguin Pebbles',
    email: 'pebbles@gameland.com',
    createdAt: '2026-08-25T16:23:14.638Z',
    lastLogin: '2026-08-25T16:23:14.638Z',
    isAdmin: false,
    points: 260,
  },
  moksh: {
    passwordHash: 'Sabers5759',
    name: 'moksh',
    email: 'Moksh.Kakarla@franklinsabers.org',
    createdAt: '2026-09-03T16:57:44.273Z',
    lastLogin: '2026-09-03T16:57:44.273Z',
    points: 14,
    unlockedTrophyIds: ['first_game', 'playtime_1m', 'play_5_games', 'playtime_10m'],
    loginStreak: 1,
    lastStreakDate: '2026-09-09',
    hasPenguinBadge: false,
    mysteryGifts: [],
  },
  helloooooooo: {
    passwordHash: 'rata',
    name: 'Jackson',
    email: 'jackson.mauga@franklinsabers.org',
    createdAt: '2026-09-03T17:04:46.914Z',
    lastLogin: '2026-09-03T17:04:46.914Z',
    points: 15,
    unlockedTrophyIds: ['first_game', 'playtime_1m', 'playtime_10m', 'playtime_30m', 'streak_3d', 'play_5_games'],
    loginStreak: 3,
    lastStreakDate: '2026-09-09',
    hasPenguinBadge: true,
    mysteryGifts: [],
    purchasedItemIds: ['store-mystery-box'],
    activeProfileFrame: 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 shadow-lg shadow-amber-500/50 animate-pulse',
    unlockedTitles: ['Ice Explorer Title'],
  },
  guy333: {
    passwordHash: 'Sabers5622',
    name: 'Alex',
    email: 'alexander.romo@franklinsabers.org',
    createdAt: '2026-09-09T19:35:51.154Z',
    lastLogin: '2026-09-09T19:35:51.154Z',
    points: 11,
    unlockedTrophyIds: ['first_game'],
    loginStreak: 1,
    lastStreakDate: '2026-09-09',
    hasPenguinBadge: false,
    mysteryGifts: [],
  },
  gdkid: {
    passwordHash: 'HIII',
    name: 'GDKID',
    email: 'dalakjdfhkajdfhlk@gmail.com',
    createdAt: '2026-08-25T16:47:26.212Z',
    lastLogin: '2026-08-25T16:52:58.693Z',
    points: 265,
    unlockedTrophyIds: ['first_game', 'playtime_1m', 'vip_unlocked'],
    loginStreak: 1,
    lastStreakDate: '2026-08-25',
    hasPenguinBadge: false,
    mysteryGifts: [],
    isAdmin: false,
    isVip: true,
    vipLevel: 'Gold',
    vipGrantedAt: '2026-08-25T16:51:23.073Z',
  },
  vip_member_3339: {
    passwordHash: 'vippass123',
    name: 'VIP Gold Player #3339',
    email: 'vip_3339@gameland.vip',
    createdAt: '2026-08-25T16:51:50.525Z',
    lastLogin: '2026-08-25T16:51:50.525Z',
    isAdmin: false,
    isVip: true,
    vipLevel: 'Gold',
    vipGrantedAt: '2026-08-25T16:51:50.525Z',
  },
  gamerthegamemcbooootay: {
    passwordHash: 'Password',
    name: 'Fart McBooty',
    email: 'butt.yayyy@gmail.com',
    createdAt: '2026-09-09T19:37:39.526Z',
    lastLogin: '2026-09-09T19:37:39.526Z',
    points: 13,
    unlockedTrophyIds: ['first_game'],
    loginStreak: 2,
    lastStreakDate: '2026-09-10',
    hasPenguinBadge: true,
    mysteryGifts: [],
    avatar: 'gamer',
  },
  gunveersingh: {
    passwordHash: 'Gunveer',
    name: 'Gunveer Singh',
    email: 'Gunveer.Singh@FranklinSabers.org',
    createdAt: '2026-08-25T16:56:42.890Z',
    lastLogin: '2026-08-25T16:56:42.890Z',
    loginStreak: 1,
    lastStreakDate: '2026-09-09',
    hasPenguinBadge: false,
    mysteryGifts: [],
    avatar: 'ninja',
    points: 11,
    unlockedTrophyIds: ['first_game', 'playtime_1m', 'playtime_10m'],
  },
  easton: {
    passwordHash: 'Easton22!',
    name: 'Easton',
    email: 'eaton.gray@franklinsabers.org',
    createdAt: '2026-09-09T19:39:35.528Z',
    lastLogin: '2026-09-09T19:39:35.528Z',
    points: 12,
    unlockedTrophyIds: ['first_game'],
    loginStreak: 2,
    lastStreakDate: '2026-09-10',
    hasPenguinBadge: true,
    mysteryGifts: [],
    isVip: true,
    vipLevel: 'Gold',
    vipGrantedAt: '2026-09-10T16:29:34.811Z',
  },
  everett: {
    passwordHash: '3133',
    name: 'everett',
    email: 'everett.zielinski@franklinsabers.org',
    createdAt: '2026-09-09T19:42:25.057Z',
    lastLogin: '2026-09-09T19:42:25.057Z',
    points: 12,
    unlockedTrophyIds: ['first_game', 'playtime_1m'],
    loginStreak: 1,
    lastStreakDate: '2026-09-09',
    hasPenguinBadge: false,
    mysteryGifts: [],
    isVip: true,
    vipLevel: 'Gold',
    vipGrantedAt: '2026-09-09T19:51:15.372Z',
    avatar: 'classic',
  },
  esmr: {
    passwordHash: 'ghiodshsfh',
    name: 'Esmr',
    email: 'esme.priestaf@franklinsabers.org',
    createdAt: '2026-09-09T19:52:26.895Z',
    lastLogin: '2026-09-09T19:52:26.895Z',
    points: 11,
    unlockedTrophyIds: ['first_game'],
    loginStreak: 1,
    lastStreakDate: '2026-09-10',
    hasPenguinBadge: false,
    mysteryGifts: [],
    avatar: 'king',
  },
  rsmr: {
    passwordHash: '123456789',
    name: 'Rsmr',
    email: 'reya.mees@franklinsabers.org',
    createdAt: '2026-09-09T19:52:55.081Z',
    lastLogin: '2026-09-09T19:52:55.081Z',
    points: 12,
    unlockedTrophyIds: ['first_game', 'playtime_1m', 'playtime_10m'],
    loginStreak: 1,
    lastStreakDate: '2026-09-10',
    hasPenguinBadge: false,
    mysteryGifts: [],
  },
  vip_member_9144: {
    passwordHash: 'vippass123',
    name: 'VIP Gold Player #9144',
    email: 'vip_9144@gameland.vip',
    createdAt: '2026-09-09T19:54:05.797Z',
    lastLogin: '2026-09-09T19:54:05.797Z',
    isAdmin: false,
    isVip: true,
    vipLevel: 'Gold',
    vipGrantedAt: '2026-09-09T19:54:05.797Z',
  },
  imdagoat: {
    passwordHash: '123456789987654321',
    name: 'Allison Gannon',
    email: 'allison.gannon@franklinsabers.org',
    createdAt: '2026-09-10T16:11:53.481Z',
    lastLogin: '2026-09-10T16:11:53.481Z',
    points: 11,
    unlockedTrophyIds: ['first_game', 'playtime_1m', 'playtime_10m'],
    loginStreak: 1,
    lastStreakDate: '2026-09-10',
    hasPenguinBadge: false,
    mysteryGifts: [],
  },
  tyler: {
    passwordHash: 'Sabers7021',
    name: 'tyler',
    email: 'tyler.nelson@franklin.com',
    createdAt: '2026-09-10T16:13:41.426Z',
    lastLogin: '2026-09-10T16:13:41.426Z',
    points: 12,
    unlockedTrophyIds: ['first_game', 'playtime_1m'],
    loginStreak: 1,
    lastStreakDate: '2026-09-10',
    hasPenguinBadge: false,
    mysteryGifts: [],
  },
  landon: {
    passwordHash: 'stinkycostco2015',
    name: 'l.g',
    email: 'landon.gannon@franklinsabers.org',
    createdAt: '2026-09-10T16:25:11.221Z',
    lastLogin: '2026-09-10T16:25:11.221Z',
    points: 11,
    unlockedTrophyIds: ['first_game', 'playtime_1m', 'playtime_10m'],
  },
  gru: {
    passwordHash: 'Sabers2458',
    name: 'gru',
    email: 'scarlett.stamborski@franklinsabers.org',
    createdAt: '2026-09-11T16:35:20.713Z',
    lastLogin: '2026-09-11T16:35:20.713Z',
    points: 14,
    unlockedTrophyIds: ['first_game', 'playtime_1m', 'play_5_games'],
    loginStreak: 1,
    lastStreakDate: '2026-09-18',
    hasPenguinBadge: false,
    mysteryGifts: [],
  },
  gfvbyfrbv: {
    passwordHash: 'win1',
    name: 'wahgfdx',
    email: 'waleed.raed@franklinsabers.org',
    createdAt: '2026-09-11T16:43:31.747Z',
    lastLogin: '2026-09-11T16:43:31.747Z',
    unlockedTrophyIds: ['first_game', 'playtime_1m', 'playtime_10m'],
    loginStreak: 1,
    lastStreakDate: '2026-09-11',
    hasPenguinBadge: false,
    mysteryGifts: [],
    points: 11,
    avatar: 'classic',
  },
  sabers6414: {
    passwordHash: '523247',
    name: 'firewolf',
    email: 'logan.gradall@franklinsabers.org',
    createdAt: '2026-09-11T19:44:33.038Z',
    lastLogin: '2026-09-11T19:44:33.038Z',
    points: 11,
    unlockedTrophyIds: ['first_game'],
    purchasedItemIds: ['store-title-monarch'],
    unlockedTitles: ['Penguin Monarch 👑'],
    loginStreak: 1,
    lastStreakDate: '2026-09-14',
    hasPenguinBadge: false,
    mysteryGifts: [],
  },
  life: {
    passwordHash: '1156',
    name: 'Emilia',
    email: 'emilia.awe@franklinsabers.org',
    createdAt: '2026-09-11T19:53:41.337Z',
    lastLogin: '2026-09-11T19:53:41.337Z',
    points: 13,
    unlockedTrophyIds: ['first_game', 'playtime_1m', 'playtime_10m'],
    loginStreak: 2,
    lastStreakDate: '2026-09-18',
    hasPenguinBadge: true,
    mysteryGifts: [],
  },
  girl23: {
    passwordHash: '1234',
    name: 'Tocool4u',
    email: 'ishwarya.suresh@franklinsabers.org',
    createdAt: '2026-09-11T19:54:52.333Z',
    lastLogin: '2026-09-11T19:54:52.333Z',
    points: 11,
    unlockedTrophyIds: ['first_game'],
    loginStreak: 1,
    lastStreakDate: '2026-09-18',
    hasPenguinBadge: false,
    mysteryGifts: [],
  },
  kingboy: {
    passwordHash: '1234',
    name: 'kingboy',
    email: 'Kousthub.nethi@frankilnsabers.org',
    createdAt: '2026-09-12T16:11:42.249Z',
    lastLogin: '2026-09-12T16:11:42.249Z',
    points: 11,
    unlockedTrophyIds: ['first_game'],
  },
  pky: {
    passwordHash: 'Qwert!23456',
    name: 'PKY',
    email: 'pravinky@gmail.com',
    createdAt: '2026-08-09T01:08:22.112Z',
    lastLogin: '2026-08-09T14:38:53.031Z',
    loginStreak: 2,
    lastStreakDate: '2026-08-09',
    hasPenguinBadge: true,
    mysteryGifts: [],
    points: 135,
  },
  micah9081: {
    passwordHash: '2301',
    name: 'Micah Romo',
    email: 'micah.romo@franklinsabers.org',
    createdAt: '2026-09-13T23:32:37.296Z',
    lastLogin: '2026-09-13T23:32:37.296Z',
    points: 11,
    unlockedTrophyIds: ['first_game', 'playtime_1m', 'playtime_10m', 'playtime_30m'],
    loginStreak: 2,
    lastStreakDate: '2026-09-14',
    hasPenguinBadge: true,
    mysteryGifts: [],
    purchasedItemIds: ['store-mystery-mega'],
    unlockedTitles: ['Arctic Champion Title'],
  },
};

export function hasDeviceUsedTestAccount(): boolean {
  if (isPassLimitOverrideActive()) {
    return false; // Pass limit override is active -> bypass device restriction
  }
  try {
    return localStorage.getItem(DEVICE_USED_TEST_KEY) === 'true';
  } catch {
    return false;
  }
}

export function resetDeviceTestAccountFlag(): void {
  try {
    localStorage.removeItem(DEVICE_USED_TEST_KEY);
  } catch (e) {
    console.error('Failed to reset device test account flag', e);
  }
}

export function getStoredUsers(): Record<string, StoredUserRecord> {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    let users = raw ? JSON.parse(raw) : { ...DEFAULT_USERS };
    
    // Always ensure the admin account exists with the designated password & admin flag
    const adminKey = ADMIN_USERNAME.toLowerCase();
    if (!users[adminKey]) {
      users[adminKey] = { ...DEFAULT_USERS[adminKey] };
      saveUsers(users);
    } else {
      let updated = false;
      if (!users[adminKey].email) {
        users[adminKey].email = 'ishaany83@gmail.com';
        updated = true;
      }
      if (!users[adminKey].name) {
        users[adminKey].name = 'Pebbles (Ishaan)';
        updated = true;
      }
      if (users[adminKey].passwordHash !== ADMIN_PASSWORD) {
        users[adminKey].passwordHash = ADMIN_PASSWORD;
        users[adminKey].isAdmin = true;
        updated = true;
      }
      if (updated) saveUsers(users);
    }

    // Ensure all restored users are seeded into storage if missing
    let restoredUsersUpdated = false;
    Object.keys(DEFAULT_USERS).forEach((key) => {
      if (!users[key]) {
        users[key] = { ...DEFAULT_USERS[key] };
        restoredUsersUpdated = true;
      }
    });
    if (restoredUsersUpdated) saveUsers(users);

    return users;
  } catch {
    return { ...DEFAULT_USERS };
  }
}

export function saveUsers(users: Record<string, StoredUserRecord>) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gameland_users_updated', { detail: users }));
      emitSocketUsersSync(users);
      const backend = getEffectiveBackendUrl();
      if (backend) {
        fetch(`${backend}/api/users/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ users }),
        }).catch(() => {});
      }
    }
  } catch (e) {
    console.error('Failed to save users to localStorage', e);
  }
}

export async function syncUsersWithServer(): Promise<Record<string, StoredUserRecord>> {
  const backend = getEffectiveBackendUrl();
  try {
    const res = await fetch(`${backend}/api/users`);
    if (res.ok) {
      const serverUsers = await res.json();
      if (serverUsers && typeof serverUsers === 'object') {
        const localUsers = getStoredUsers();
        const merged: Record<string, StoredUserRecord> = { ...localUsers };
        Object.entries(serverUsers).forEach(([key, sUser]) => {
          const lowerKey = key.toLowerCase();
          if (sUser && typeof sUser === 'object') {
            merged[lowerKey] = {
              ...(merged[lowerKey] || {}),
              ...(sUser as StoredUserRecord),
            };
          }
        });
        localStorage.setItem(USERS_KEY, JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent('gameland_users_updated', { detail: merged }));
        return merged;
      }
    }
  } catch (e) {
    // Network fallback
  }
  return getStoredUsers();
}

export function hasVipAccess(
  user: UserAccount | null | undefined,
  requiredTier: 'Gold' | 'Platinum' | 'Diamond' = 'Gold'
): boolean {
  if (!user) return false;
  if (user.isAdmin || user.username.toLowerCase() === 'pebblesthepenguinishaany83') return true;
  if (!user.isVip) return false;

  const currentLevel = user.vipLevel || 'Gold';
  if (requiredTier === 'Gold') return true;
  if (requiredTier === 'Platinum') return currentLevel === 'Platinum' || currentLevel === 'Diamond';
  if (requiredTier === 'Diamond') return currentLevel === 'Diamond';
  return true;
}

export function getCurrentSessionUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentSessionUser(user: UserAccount | null) {
  try {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch (e) {
    console.error('Failed to update session state', e);
  }
}

export function registerAccount(
  usernameInput: string,
  passwordInput: string,
  nameInput?: string,
  emailInput?: string
): { success: boolean; error?: string; user?: UserAccount } {
  const username = usernameInput.trim();
  const password = passwordInput.trim();
  const name = nameInput?.trim() || undefined;
  const email = emailInput?.trim() || undefined;

  if (!username || username.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters long.' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { success: false, error: 'Username can only contain letters, numbers, and underscores.' };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!password || password.length < 4) {
    return { success: false, error: 'Password must be at least 4 characters long.' };
  }

  const users = getStoredUsers();
  const lowerKey = username.toLowerCase();

  if (users[lowerKey]) {
    return { success: false, error: 'An account with this username already exists.' };
  }

  const now = new Date().toISOString();
  const userRec: StoredUserRecord = {
    passwordHash: password,
    name,
    email,
    createdAt: now,
    lastLogin: now,
  };
  users[lowerKey] = userRec;

  saveUsers(users);

  // Broadcast single user registration to all other connected clients
  emitSocketUserRegister({
    username,
    ...userRec,
  });

  const backend = getEffectiveBackendUrl();
  if (typeof window !== 'undefined' && backend) {
    fetch(`${backend}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        user: {
          username,
          ...userRec,
        },
      }),
    }).catch((err) => {
      console.warn('Backend user registration sync standby:', err);
    });
  }

  const newUser: UserAccount = {
    username,
    name,
    email,
    createdAt: now,
    lastLogin: now,
  };

  setCurrentSessionUser(newUser);
  saveToMyAccounts({
    username,
    name,
    email,
    createdAt: now,
    lastLogin: now,
    isAdmin: false,
    passwordHash: password,
  });
  return { success: true, user: newUser };
}

export function loginAccount(usernameInput: string, passwordInput: string): { success: boolean; error?: string; user?: UserAccount } {
  const username = usernameInput.trim();
  const password = passwordInput.trim();

  if (!username || !password) {
    return { success: false, error: 'Please enter both username and password.' };
  }

  const users = getStoredUsers();
  const lowerKey = username.toLowerCase();
  const record = users[lowerKey];

  if (!record) {
    return { success: false, error: 'Account not found. Please check your username or sign up for a new account.' };
  }

  if (record.passwordHash !== password) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  // Single-use test account validation
  if (record.isTestAccount && !isPassLimitOverrideActive()) {
    if (hasDeviceUsedTestAccount()) {
      const active = getCurrentSessionUser();
      if (!active || active.username.toLowerCase() !== lowerKey) {
        return {
          success: false,
          error: 'You have already used your 1-time test account pass on this browser. Test passes are limited to 1 use per user.',
        };
      }
    }

    if (record.testAccountUsed) {
      const active = getCurrentSessionUser();
      if (!active || active.username.toLowerCase() !== lowerKey) {
        return {
          success: false,
          error: 'This single-use test account pass has already been consumed and cannot be reused.',
        };
      }
    }

    // Mark test account as consumed
    record.testAccountUsed = true;
    if (!record.testAccountUsedAt) {
      record.testAccountUsedAt = new Date().toISOString();
    }
    try {
      localStorage.setItem(DEVICE_USED_TEST_KEY, 'true');
    } catch (e) {
      console.error('Failed to set device test pass flag', e);
    }
  }

  const now = new Date().toISOString();
  record.lastLogin = now;
  saveUsers(users);

  const user: UserAccount = {
    username: username, // Keep case from user input or original registration
    name: record.name,
    email: record.email,
    createdAt: record.createdAt,
    lastLogin: now,
    isAdmin: record.isAdmin || lowerKey === ADMIN_USERNAME.toLowerCase(),
    avatar: record.avatar,
    isTestAccount: record.isTestAccount,
    testAccountUsed: record.testAccountUsed,
    testAccountUsedAt: record.testAccountUsedAt,
    isVip: record.isVip || lowerKey === ADMIN_USERNAME.toLowerCase(),
    vipLevel: record.vipLevel || (lowerKey === ADMIN_USERNAME.toLowerCase() ? 'Diamond' : undefined),
    vipGrantedAt: record.vipGrantedAt,
    loginStreak: record.loginStreak || 1,
    lastStreakDate: record.lastStreakDate,
    hasPenguinBadge: record.hasPenguinBadge || (record.loginStreak ? record.loginStreak >= 2 : false),
    mysteryGifts: record.mysteryGifts || [],
    activeProfileFrame: record.activeProfileFrame,
    snacksInventory: record.snacksInventory || {},
    penguinHappiness: record.penguinHappiness ?? 85,
    penguinFeedCount: record.penguinFeedCount ?? 0,
  };

  setCurrentSessionUser(user);
  saveToMyAccounts({
    ...user,
    passwordHash: record.passwordHash,
  });
  return { success: true, user };
}

export function logoutAccount() {
  setCurrentSessionUser(null);
}

export function getAllUserRecords(): (UserAccount & { passwordHash: string })[] {
  const users = getStoredUsers();
  return Object.entries(users).map(([key, record]) => ({
    username: key === ADMIN_USERNAME.toLowerCase() ? ADMIN_USERNAME : key,
    name: record.name,
    email: record.email,
    createdAt: record.createdAt,
    lastLogin: record.lastLogin,
    isAdmin: record.isAdmin || key === ADMIN_USERNAME.toLowerCase(),
    isVip: record.isVip || key === ADMIN_USERNAME.toLowerCase(),
    vipLevel: record.vipLevel || (key === ADMIN_USERNAME.toLowerCase() ? 'Diamond' : undefined),
    vipGrantedAt: record.vipGrantedAt,
    avatar: record.avatar,
    passwordHash: record.passwordHash,
    isTestAccount: record.isTestAccount,
    testAccountUsed: record.testAccountUsed,
    testAccountUsedAt: record.testAccountUsedAt,
    loginStreak: record.loginStreak || 1,
    lastStreakDate: record.lastStreakDate,
    hasPenguinBadge: record.hasPenguinBadge || (record.loginStreak ? record.loginStreak >= 2 : false),
    mysteryGifts: record.mysteryGifts || [],
    activeProfileFrame: record.activeProfileFrame,
    snacksInventory: record.snacksInventory || {},
    penguinHappiness: record.penguinHappiness ?? 85,
    penguinFeedCount: record.penguinFeedCount ?? 0,
  }));
}

export function toggleUserVipStatus(username: string, defaultLevel: 'Gold' | 'Diamond' | 'Platinum' | 'VIP' = 'Gold'): boolean {
  const users = getStoredUsers();
  const key = username.toLowerCase();
  if (!users[key]) return false;

  const nextVip = !users[key].isVip;
  users[key].isVip = nextVip;
  if (nextVip) {
    users[key].vipLevel = defaultLevel;
    users[key].vipGrantedAt = new Date().toISOString();
  } else {
    delete users[key].vipLevel;
    delete users[key].vipGrantedAt;
  }
  saveUsers(users);

  // Sync VIP change directly to Google Cloud Run backend
  cloudRunUpdateVip(key, nextVip, nextVip ? defaultLevel : undefined);

  const session = getCurrentSessionUser();
  if (session && session.username.toLowerCase() === key) {
    const updatedSession: UserAccount = {
      ...session,
      isVip: nextVip,
      vipLevel: nextVip ? defaultLevel : undefined,
      vipGrantedAt: nextVip ? new Date().toISOString() : undefined,
    };
    setCurrentSessionUser(updatedSession);
  }
  return true;
}

export function setUserVipLevel(username: string, level: 'Gold' | 'Diamond' | 'Platinum' | 'VIP'): boolean {
  const users = getStoredUsers();
  const key = username.toLowerCase();
  if (!users[key]) return false;

  users[key].isVip = true;
  users[key].vipLevel = level;
  if (!users[key].vipGrantedAt) {
    users[key].vipGrantedAt = new Date().toISOString();
  }
  saveUsers(users);

  // Sync VIP tier directly to Google Cloud Run backend
  cloudRunUpdateVip(key, true, level);

  const session = getCurrentSessionUser();
  if (session && session.username.toLowerCase() === key) {
    const updatedSession: UserAccount = {
      ...session,
      isVip: true,
      vipLevel: level,
    };
    setCurrentSessionUser(updatedSession);
  }
  return true;
}

export function promoteAllUsersToVip(level: 'Gold' | 'Diamond' | 'Platinum' | 'VIP' = 'Gold'): void {
  const users = getStoredUsers();
  const now = new Date().toISOString();
  Object.keys(users).forEach((k) => {
    users[k].isVip = true;
    users[k].vipLevel = level;
    if (!users[k].vipGrantedAt) {
      users[k].vipGrantedAt = now;
    }
  });
  saveUsers(users);

  // Sync mass VIP status directly to Google Cloud Run backend
  cloudRunPromoteAllVip(level);

  const session = getCurrentSessionUser();
  if (session) {
    setCurrentSessionUser({
      ...session,
      isVip: true,
      vipLevel: level,
    });
  }
}

export function generateNewVipAccount(level: 'Gold' | 'Diamond' | 'Platinum' | 'VIP' = 'Gold'): UserAccount & { passwordHash: string } {
  const users = getStoredUsers();
  const randomId = Math.floor(1000 + Math.random() * 9000);
  const username = `vip_member_${randomId}`;
  const now = new Date().toISOString();
  const pass = 'vippass123';

  users[username] = {
    passwordHash: pass,
    name: `VIP ${level} Player #${randomId}`,
    email: `vip_${randomId}@gameland.vip`,
    createdAt: now,
    lastLogin: now,
    isAdmin: false,
    isVip: true,
    vipLevel: level,
    vipGrantedAt: now,
  };

  saveUsers(users);

  return {
    username,
    name: users[username].name,
    email: users[username].email,
    createdAt: now,
    lastLogin: now,
    isAdmin: false,
    isVip: true,
    vipLevel: level,
    vipGrantedAt: now,
    passwordHash: pass,
  };
}

export function deleteUserAccount(username: string): boolean {
  if (username.toLowerCase() === ADMIN_USERNAME.toLowerCase()) {
    return false; // Protect main admin account from deletion
  }
  const users = getStoredUsers();
  delete users[username.toLowerCase()];
  saveUsers(users);
  const backend = getEffectiveBackendUrl();
  if (typeof window !== 'undefined' && backend) {
    fetch(`${backend}/api/users/${encodeURIComponent(username.toLowerCase())}`, {
      method: 'DELETE',
    }).catch(() => {});
  }
  return true;
}

export function updateUserPassword(username: string, newPassword: string): boolean {
  if (!newPassword || newPassword.length < 4) return false;
  const users = getStoredUsers();
  const key = username.toLowerCase();
  if (!users[key]) return false;
  users[key].passwordHash = newPassword;
  saveUsers(users);
  return true;
}

export function toggleUserAdminStatus(username: string): boolean {
  if (username.toLowerCase() === ADMIN_USERNAME.toLowerCase()) {
    return false; // Primary admin is permanently admin
  }
  const users = getStoredUsers();
  const key = username.toLowerCase();
  if (!users[key]) return false;
  users[key].isAdmin = !users[key].isAdmin;
  saveUsers(users);
  return true;
}

export function updateUserAvatar(username: string, avatarId: string): UserAccount | null {
  const users = getStoredUsers();
  const key = username.toLowerCase();
  
  if (!users[key]) {
    const session = getCurrentSessionUser();
    if (session) {
      const updatedSession: UserAccount = {
        ...session,
        avatar: avatarId,
      };
      setCurrentSessionUser(updatedSession);
      return updatedSession;
    }
    return null;
  }
  
  users[key] = {
    ...users[key],
    avatar: avatarId,
  };
  saveUsers(users);

  const baseAccount: UserAccount = {
    username: key,
    name: users[key].name,
    email: users[key].email,
    createdAt: users[key].createdAt,
    lastLogin: users[key].lastLogin,
    isAdmin: users[key].isAdmin,
    avatar: avatarId,
    isTestAccount: users[key].isTestAccount,
    testAccountUsed: users[key].testAccountUsed,
    testAccountUsedAt: users[key].testAccountUsedAt,
    isVip: users[key].isVip,
    vipLevel: users[key].vipLevel,
    vipGrantedAt: users[key].vipGrantedAt,
    loginStreak: users[key].loginStreak,
    lastStreakDate: users[key].lastStreakDate,
    hasPenguinBadge: users[key].hasPenguinBadge,
    mysteryGifts: users[key].mysteryGifts,
    activeProfileFrame: users[key].activeProfileFrame,
    unlockedTrophyIds: users[key].unlockedTrophyIds,
    points: users[key].points,
    purchasedItemIds: users[key].purchasedItemIds,
    unlockedTitles: users[key].unlockedTitles,
    pendingVipPass: users[key].pendingVipPass,
  };

  // Update current session user if matching or if session exists
  const session = getCurrentSessionUser();
  if (session && session.username.toLowerCase() === key) {
    const updatedSession: UserAccount = {
      ...session,
      avatar: avatarId,
    };
    setCurrentSessionUser(updatedSession);

    // Also update saved account in my saved accounts list
    saveToMyAccounts({
      ...updatedSession,
      passwordHash: users[key].passwordHash,
    });

    return updatedSession;
  }

  return baseAccount;
}

export function getTestAccountsList(): (UserAccount & { passwordHash: string; used: boolean; usedAt?: string })[] {
  const users = getStoredUsers();
  return Object.entries(users)
    .filter(([_, record]) => record.isTestAccount)
    .map(([key, record]) => ({
      username: key,
      name: record.name,
      email: record.email,
      createdAt: record.createdAt,
      lastLogin: record.lastLogin,
      isAdmin: false,
      avatar: record.avatar,
      passwordHash: record.passwordHash,
      isTestAccount: true,
      used: !!record.testAccountUsed,
      usedAt: record.testAccountUsedAt,
    }));
}

export function claimOneTimeTestAccount(): { success: boolean; error?: string; user?: UserAccount } {
  if (hasDeviceUsedTestAccount()) {
    return {
      success: false,
      error: 'You have already used your 1-time test account pass on this browser. Test account passes are strictly limited to one use per user.',
    };
  }

  const users = getStoredUsers();
  
  // Find an available unused test account
  let testKey = Object.keys(users).find(
    (k) => users[k].isTestAccount && (!users[k].testAccountUsed || isPassLimitOverrideActive())
  );

  // If no preset test accounts are free, create a new one dynamically
  if (!testKey) {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    testKey = `test_pass_${randomId}`;
    const now = new Date().toISOString();
    users[testKey] = {
      passwordHash: 'testpass123',
      name: `Single-Use Test Pass #${randomId}`,
      email: `test_${randomId}@gameland.test`,
      createdAt: now,
      lastLogin: now,
      isAdmin: false,
      isTestAccount: true,
      testAccountUsed: false,
    };
  }

  const record = users[testKey];
  const now = new Date().toISOString();
  record.testAccountUsed = true;
  record.testAccountUsedAt = now;
  record.lastLogin = now;

  saveUsers(users);

  try {
    localStorage.setItem(DEVICE_USED_TEST_KEY, 'true');
  } catch (e) {
    console.error('Failed to set device test account flag', e);
  }

  const user: UserAccount = {
    username: testKey,
    name: record.name,
    email: record.email,
    createdAt: record.createdAt,
    lastLogin: now,
    isAdmin: false,
    isTestAccount: true,
    testAccountUsed: true,
    testAccountUsedAt: now,
    avatar: record.avatar,
  };

  setCurrentSessionUser(user);
  saveToMyAccounts({
    ...user,
    passwordHash: record.passwordHash,
  });

  return { success: true, user };
}

export function resetAllTestAccountsAdmin(): void {
  const users = getStoredUsers();
  Object.keys(users).forEach((key) => {
    if (users[key].isTestAccount) {
      users[key].testAccountUsed = false;
      delete users[key].testAccountUsedAt;
    }
  });
  saveUsers(users);
  resetDeviceTestAccountFlag();
}

export function generateNewTestPass(nameInput?: string): UserAccount & { passwordHash: string } {
  const users = getStoredUsers();
  const randomId = Math.floor(1000 + Math.random() * 9000);
  const username = `test_pass_${randomId}`;
  const now = new Date().toISOString();
  const pass = 'testpass123';

  users[username] = {
    passwordHash: pass,
    name: nameInput?.trim() || `Single-Use Test Pass #${randomId}`,
    email: `test_${randomId}@gameland.test`,
    createdAt: now,
    lastLogin: now,
    isAdmin: false,
    isTestAccount: true,
    testAccountUsed: false,
  };

  saveUsers(users);

  return {
    username,
    name: users[username].name,
    email: users[username].email,
    createdAt: now,
    lastLogin: now,
    isAdmin: false,
    isTestAccount: true,
    testAccountUsed: false,
    passwordHash: pass,
  };
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const MYSTERY_GIFT_POOLS: Record<7 | 14 | 30, Omit<MysteryGiftItem, 'unlockedAt'>[]> = {
  7: [
    {
      id: 'frame-frost-7',
      milestone: 7,
      name: 'Frost Diamond Frame',
      description: 'An icy cyan glowing border that surrounds your profile avatar.',
      icon: '❄️',
      category: 'frame',
      frameClass: 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900 shadow-lg shadow-cyan-500/50',
    },
    {
      id: 'item-scepter-7',
      milestone: 7,
      name: 'Glacier Scepter',
      description: 'A magical frozen wand carved from ancient polar ice.',
      icon: '🪄',
      category: 'item',
    },
    {
      id: 'title-explorer-7',
      milestone: 7,
      name: 'Ice Explorer Title',
      description: 'Exclusive title awarded for 7-day login streak dedication.',
      icon: '🧊',
      category: 'title',
    },
  ],
  14: [
    {
      id: 'frame-aurora-14',
      milestone: 14,
      name: 'Golden Aurora Halo',
      description: 'A radiant golden aura with subtle pulsing glow for your avatar.',
      icon: '✨',
      category: 'frame',
      frameClass: 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 shadow-lg shadow-amber-500/50 animate-pulse',
    },
    {
      id: 'item-feather-14',
      milestone: 14,
      name: 'Phoenix Feather',
      description: 'A mythical glowing feather symbolizing passion and resilience.',
      icon: '🪶',
      category: 'item',
    },
    {
      id: 'title-champion-14',
      milestone: 14,
      name: 'Arctic Champion Title',
      description: 'Honorary title awarded for 14 consecutive days of check-ins.',
      icon: '👑',
      category: 'title',
    },
  ],
  30: [
    {
      id: 'frame-cosmic-30',
      milestone: 30,
      name: 'Neon Cosmic Nova',
      description: 'A brilliant fuchsia & neon violet cosmic ring for elite legends.',
      icon: '🌌',
      category: 'frame',
      frameClass: 'ring-2 ring-fuchsia-400 ring-offset-2 ring-offset-slate-900 shadow-xl shadow-fuchsia-500/70',
    },
    {
      id: 'item-orb-30',
      milestone: 30,
      name: 'Emperor Golden Orb',
      description: 'The legendary royal orb of the Penguin Kingdom.',
      icon: '🔮',
      category: 'item',
    },
    {
      id: 'title-overlord-30',
      milestone: 30,
      name: 'Penguin Overlord Title',
      description: 'The supreme title granted to monthly streak conquerors.',
      icon: '🐧',
      category: 'title',
    },
  ],
};

export function evaluateMysteryGifts(user: UserAccount): { updatedUser: UserAccount; newGift?: MysteryGiftItem } {
  const streak = user.loginStreak || 0;
  const milestones: (7 | 14 | 30)[] = [7, 14, 30];
  const existingGifts = user.mysteryGifts || [];

  let newlyGranted: MysteryGiftItem | undefined = undefined;
  const giftsToSet = [...existingGifts];
  let activeFrame = user.activeProfileFrame;

  for (const milestone of milestones) {
    if (streak >= milestone) {
      const alreadyHasMilestone = giftsToSet.some((g) => g.milestone === milestone);
      if (!alreadyHasMilestone) {
        const pool = MYSTERY_GIFT_POOLS[milestone];
        const randomIndex = Math.floor(Math.random() * pool.length);
        const selectedGift = pool[randomIndex];

        const giftToAward: MysteryGiftItem = {
          ...selectedGift,
          unlockedAt: new Date().toISOString(),
        };

        giftsToSet.push(giftToAward);
        newlyGranted = giftToAward;

        if (giftToAward.category === 'frame' && !activeFrame) {
          activeFrame = giftToAward.frameClass || giftToAward.id;
        }
      }
    }
  }

  const updatedUser: UserAccount = {
    ...user,
    mysteryGifts: giftsToSet,
    activeProfileFrame: activeFrame,
  };

  const users = getStoredUsers();
  const key = user.username.toLowerCase();
  if (users[key]) {
    users[key].mysteryGifts = giftsToSet;
    users[key].activeProfileFrame = activeFrame;
    saveUsers(users);
  }
  setCurrentSessionUser(updatedUser);

  return { updatedUser, newGift: newlyGranted };
}

export function setActiveProfileFrame(username: string, frameClass: string | undefined): UserAccount | null {
  const users = getStoredUsers();
  const key = username.toLowerCase();
  if (!users[key]) return null;

  users[key].activeProfileFrame = frameClass;
  saveUsers(users);

  const session = getCurrentSessionUser();
  if (session && session.username.toLowerCase() === key) {
    const updated: UserAccount = {
      ...session,
      activeProfileFrame: frameClass,
    };
    setCurrentSessionUser(updated);
    return updated;
  }
  return null;
}

export function processDailyLoginStreak(user: UserAccount): { user: UserAccount; newGift?: MysteryGiftItem } {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  let currentStreak = user.loginStreak || 0;
  let lastDate = user.lastStreakDate || '';
  let hasBadge = !!user.hasPenguinBadge;

  if (lastDate === today) {
    if (currentStreak === 0) {
      currentStreak = 1;
    }
  } else if (lastDate === yesterday) {
    currentStreak += 1;
    lastDate = today;
  } else {
    currentStreak = 1;
    lastDate = today;
  }

  if (currentStreak >= 2) {
    hasBadge = true;
  }

  const updatedUser: UserAccount = {
    ...user,
    loginStreak: currentStreak,
    lastStreakDate: lastDate,
    hasPenguinBadge: hasBadge,
  };

  const users = getStoredUsers();
  const key = user.username.toLowerCase();
  if (users[key]) {
    users[key].loginStreak = currentStreak;
    users[key].lastStreakDate = lastDate;
    users[key].hasPenguinBadge = hasBadge;
    saveUsers(users);
  }

  setCurrentSessionUser(updatedUser);

  const { updatedUser: finalUser, newGift } = evaluateMysteryGifts(updatedUser);

  return { user: finalUser, newGift };
}

export function simulateNextDayLoginStreak(username: string): { user: UserAccount | null; newGift?: MysteryGiftItem } {
  const users = getStoredUsers();
  const key = username.toLowerCase();
  if (!users[key]) return { user: null };

  const currentStreak = (users[key].loginStreak || 1) + 1;
  const today = getTodayDateString();
  const hasBadge = currentStreak >= 2 ? true : !!users[key].hasPenguinBadge;

  users[key].loginStreak = currentStreak;
  users[key].lastStreakDate = today;
  users[key].hasPenguinBadge = hasBadge;
  saveUsers(users);

  const session = getCurrentSessionUser();
  let baseUser: UserAccount;
  if (session && session.username.toLowerCase() === key) {
    baseUser = {
      ...session,
      loginStreak: currentStreak,
      lastStreakDate: today,
      hasPenguinBadge: hasBadge,
    };
  } else {
    baseUser = {
      username: username,
      createdAt: users[key].createdAt,
      lastLogin: users[key].lastLogin,
      loginStreak: currentStreak,
      lastStreakDate: today,
      hasPenguinBadge: hasBadge,
      mysteryGifts: users[key].mysteryGifts || [],
      activeProfileFrame: users[key].activeProfileFrame,
    };
  }

  setCurrentSessionUser(baseUser);
  const { updatedUser, newGift } = evaluateMysteryGifts(baseUser);

  return { user: updatedUser, newGift };
}

// ==========================================
// GAMELAND POINT SYSTEM & STORE PERSISTENCE
// ==========================================

const GUEST_POINTS_KEY = 'gameland_guest_points_v1';

export function getUserPoints(user?: UserAccount | null): number {
  if (user) {
    return typeof user.points === 'number' ? user.points : 10; // Default 10 bonus points
  }
  try {
    const raw = localStorage.getItem(GUEST_POINTS_KEY);
    if (raw === null) {
      localStorage.setItem(GUEST_POINTS_KEY, '10'); // Welcome bonus
      return 10;
    }
    return parseInt(raw, 10) || 0;
  } catch {
    return 10;
  }
}

export function getDailyPointsEarned(username?: string): number {
  try {
    const today = new Date().toISOString().split('T')[0];
    const key = `PEBBLES_DAILY_POINTS_${username ? username.toLowerCase() : 'guest'}_${today}`;
    return parseInt(localStorage.getItem(key) || '0', 10) || 0;
  } catch {
    return 0;
  }
}

export function awardGamePoints(
  username?: string,
  baseAmount: number = 1
): { earned: number; totalPoints: number; multiplier: number; user: UserAccount | null; dailyCapReached?: boolean } {
  const MAX_DAILY_POINTS = 10;
  let multiplier = 1.0;
  let activeUser: UserAccount | null = null;

  const userKey = username ? username.toLowerCase() : 'guest';
  const today = new Date().toISOString().split('T')[0];
  const storageKey = `PEBBLES_DAILY_POINTS_${userKey}_${today}`;
  const alreadyEarnedToday = getDailyPointsEarned(username);

  if (alreadyEarnedToday >= MAX_DAILY_POINTS) {
    const currentPoints = getUserPoints(username ? ({ username } as UserAccount) : null);
    return {
      earned: 0,
      totalPoints: currentPoints,
      multiplier: 1,
      user: username ? getCurrentSessionUser() : null,
      dailyCapReached: true,
    };
  }

  if (username) {
    const users = getStoredUsers();
    const key = username.toLowerCase();
    const record = users[key];
    const session = getCurrentSessionUser();

    if (record) {
      const currentLevel = record.vipLevel || 'Gold';
      if (record.isAdmin || username.toLowerCase() === 'pebblesthepenguinishaany83') {
        multiplier = 2.5;
      } else if (record.isVip) {
        if (currentLevel === 'Diamond') multiplier = 2.0;
        else if (currentLevel === 'Platinum') multiplier = 1.5;
        else multiplier = 1.25;
      }

      try {
        const rawAdmin = localStorage.getItem('gameland_admin_global_settings_v1');
        if (rawAdmin) {
          const parsed = JSON.parse(rawAdmin);
          if (parsed && parsed.doublePointsActive) {
            multiplier *= 2.0;
          }
        }
      } catch (e) {
        // ignore
      }

      const calculatedEarned = Math.max(1, Math.ceil(baseAmount * multiplier));
      const earned = Math.min(calculatedEarned, MAX_DAILY_POINTS - alreadyEarnedToday);
      const currentPoints = typeof record.points === 'number' ? record.points : 10;
      const totalPoints = currentPoints + earned;

      record.points = totalPoints;
      saveUsers(users);

      // Persist coins to Google Cloud Run authoritative backend
      cloudRunUpdateCoins(key, earned, 'add', 'game_reward');

      try {
        localStorage.setItem(storageKey, (alreadyEarnedToday + earned).toString());
      } catch (e) {
        console.error('Failed to save daily points', e);
      }

      if (session && session.username.toLowerCase() === key) {
        activeUser = {
          ...session,
          points: totalPoints,
          isVip: record.isVip,
          vipLevel: record.vipLevel,
        };
        setCurrentSessionUser(activeUser);
      }

      return {
        earned,
        totalPoints,
        multiplier,
        user: activeUser,
        dailyCapReached: alreadyEarnedToday + earned >= MAX_DAILY_POINTS,
      };
    }
  }

  // Guest Points Fallback
  const currentGuest = getUserPoints(null);
  const calculatedEarned = Math.max(1, Math.ceil(baseAmount * multiplier));
  const earned = Math.min(calculatedEarned, MAX_DAILY_POINTS - alreadyEarnedToday);
  const totalPoints = currentGuest + earned;

  try {
    localStorage.setItem(GUEST_POINTS_KEY, totalPoints.toString());
    localStorage.setItem(storageKey, (alreadyEarnedToday + earned).toString());
  } catch (e) {
    console.error('Failed to update guest points', e);
  }

  return {
    earned,
    totalPoints,
    multiplier,
    user: null,
    dailyCapReached: alreadyEarnedToday + earned >= MAX_DAILY_POINTS,
  };
}

export const VIP_TIER_PRICES = {
  Gold: 100,
  Platinum: 250,
  Diamond: 500,
};

export function upgradeVipLevelWithPoints(
  user: UserAccount | null,
  targetTier: 'Gold' | 'Platinum' | 'Diamond'
): { success: boolean; message: string; user: UserAccount | null; newPoints: number } {
  if (!user) {
    return { success: false, message: 'Please sign in to upgrade your VIP level.', user: null, newPoints: 0 };
  }

  const currentPoints = getUserPoints(user);
  const currentTier = user.isVip ? (user.vipLevel || 'Gold') : null;

  const targetPrice = VIP_TIER_PRICES[targetTier];
  const currentTierVal = currentTier ? VIP_TIER_PRICES[currentTier as keyof typeof VIP_TIER_PRICES] || 0 : 0;

  if (currentTier === targetTier) {
    return { success: false, message: `You are already on VIP ${targetTier} level!`, user, newPoints: currentPoints };
  }

  const upgradeCost = Math.max(0, targetPrice - currentTierVal);

  if (currentPoints < upgradeCost) {
    const missing = upgradeCost - currentPoints;
    return {
      success: false,
      message: `Insufficient points! VIP ${targetTier} upgrade costs 🪙 ${upgradeCost} PTS (you have 🪙 ${currentPoints} PTS). You need 🪙 ${missing} more points. Play games to earn points!`,
      user,
      newPoints: currentPoints,
    };
  }

  const newPoints = currentPoints - upgradeCost;
  const users = getStoredUsers();
  const key = user.username.toLowerCase();
  const record = users[key];

  if (!record) {
    return { success: false, message: 'User record not found.', user, newPoints: currentPoints };
  }

  if (record.pendingVipPass) {
    return {
      success: false,
      message: `⏳ You already have a pending VIP request ("${record.pendingVipPass.name}") under Admin review! Please wait for an Admin to approve it.`,
      user,
      newPoints: currentPoints,
    };
  }

  // Admins get instant VIP activation
  if (user.isAdmin || user.username.toLowerCase() === 'pebblesthepenguinishaany83') {
    record.points = newPoints;
    record.isVip = true;
    record.vipLevel = targetTier;
    if (!record.vipGrantedAt) {
      record.vipGrantedAt = new Date().toISOString();
    }
    const storeItemId = `store-vip-${targetTier.toLowerCase()}`;
    const purchased = record.purchasedItemIds || [];
    if (!purchased.includes(storeItemId)) {
      purchased.push(storeItemId);
    }
    record.purchasedItemIds = purchased;

    saveUsers(users);

    const updatedUser: UserAccount = {
      ...user,
      points: newPoints,
      isVip: true,
      vipLevel: targetTier,
    };

    const session = getCurrentSessionUser();
    if (session && session.username.toLowerCase() === key) {
      setCurrentSessionUser(updatedUser);
    }

    return {
      success: true,
      message: `⚡ Admin override: VIP ${targetTier} Level activated for 🪙 ${upgradeCost} PTS!`,
      user: updatedUser,
      newPoints,
    };
  }

  // Regular Users: Deduct points & submit Pending VIP order for Admin Approval
  record.points = newPoints;
  const storeItemId = `store-vip-${targetTier.toLowerCase()}`;
  const purchased = record.purchasedItemIds || [];
  if (!purchased.includes(storeItemId)) {
    purchased.push(storeItemId);
  }
  record.purchasedItemIds = purchased;

  const pending: PendingVipPass = {
    id: storeItemId,
    name: `VIP ${targetTier} Pass Upgrade`,
    vipTier: targetTier,
    price: upgradeCost,
    requestedAt: new Date().toISOString(),
    status: 'processing',
  };
  record.pendingVipPass = pending;

  saveUsers(users);

  const updatedUser: UserAccount = {
    ...user,
    points: newPoints,
    pendingVipPass: pending,
  };

  const session = getCurrentSessionUser();
  if (session && session.username.toLowerCase() === key) {
    setCurrentSessionUser(updatedUser);
  }

  return {
    success: true,
    message: `⏳ VIP ${targetTier} Upgrade Order Submitted for 🪙 ${upgradeCost} PTS! An Admin must review and approve your VIP tier request in the Admin Control Panel.`,
    user: updatedUser,
    newPoints,
  };
}

export function purchaseStoreItem(
  user: UserAccount | null,
  item: {
    id: string;
    name: string;
    price: number;
    category: 'vip' | 'frame' | 'booster' | 'title' | 'mystery' | 'snack';
    vipTier?: 'Gold' | 'Platinum' | 'Diamond';
    frameClass?: string;
    titleBadge?: string;
  }
): { success: boolean; message: string; user?: UserAccount | null; newPoints: number } {
  const currentPoints = getUserPoints(user);

  if (currentPoints < item.price) {
    return {
      success: false,
      message: `Insufficient points! You need 🪙 ${item.price - currentPoints} more points to unlock "${item.name}". Play more games to earn points!`,
      newPoints: currentPoints,
      user,
    };
  }

  let newPoints = currentPoints - item.price;

  if (user) {
    const users = getStoredUsers();
    const key = user.username.toLowerCase();
    const record = users[key];

    if (!record) {
      return { success: false, message: 'User record not found.', newPoints: currentPoints, user };
    }

    if (item.category === 'vip' && item.vipTier && record.pendingVipPass) {
      return {
        success: false,
        message: `⏳ You already have a pending VIP order ("${record.pendingVipPass.name}") under Admin review!`,
        newPoints: currentPoints,
        user,
      };
    }

    record.points = newPoints;
    const purchased = record.purchasedItemIds || [];
    if (!purchased.includes(item.id)) {
      purchased.push(item.id);
    }
    record.purchasedItemIds = purchased;

    // Deduct coins on Google Cloud Run authoritative backend
    cloudRunUpdateCoins(key, item.price, 'deduct', `store_purchase_${item.id}`);

    // Apply Specific Category Benefits
    let successMsg = `Successfully purchased "${item.name}" for 🪙 ${item.price} PTS!`;

    if (item.category === 'vip' && item.vipTier) {
      if (user.isAdmin || user.username.toLowerCase() === 'pebblesthepenguinishaany83') {
        record.isVip = true;
        record.vipLevel = item.vipTier;
        record.vipGrantedAt = new Date().toISOString();
        delete record.pendingVipPass;
        successMsg = `👑 Admin override: VIP ${item.vipTier} Pass activated!`;
      } else {
        const pending: PendingVipPass = {
          id: item.id,
          name: item.name,
          vipTier: item.vipTier,
          price: item.price,
          requestedAt: new Date().toISOString(),
          status: 'processing',
        };
        record.pendingVipPass = pending;
        successMsg = `⏳ VIP Pass Order Submitted for 🪙 ${item.price} PTS! An Admin must review & approve your VIP ${item.vipTier} upgrade before it takes effect.`;
      }
    } else if (item.category === 'frame' && item.frameClass) {
      record.activeProfileFrame = item.frameClass;
      successMsg = `✨ Unlocked and equipped "${item.name}" profile frame!`;
    } else if (item.category === 'title' && item.titleBadge) {
      const titles = record.unlockedTitles || [];
      if (!titles.includes(item.titleBadge)) titles.push(item.titleBadge);
      record.unlockedTitles = titles;
      successMsg = `👑 Claimed "${item.titleBadge}" exclusive user title!`;
    } else if (item.category === 'mystery') {
      let poolKey: 7 | 14 | 30 = 7;
      if (item.id === 'store-mystery-legend') poolKey = 30;
      else if (item.id === 'store-mystery-mega') poolKey = 14;

      const pool = MYSTERY_GIFT_POOLS[poolKey];
      const randomGift = pool[Math.floor(Math.random() * pool.length)];
      const gifts = record.mysteryGifts || [];
      const newGiftItem: MysteryGiftItem = {
        ...randomGift,
        unlockedAt: new Date().toISOString(),
      };
      gifts.push(newGiftItem);
      record.mysteryGifts = gifts;

      if (newGiftItem.category === 'frame' && newGiftItem.frameClass) {
        record.activeProfileFrame = newGiftItem.frameClass;
      } else if (newGiftItem.category === 'title' && newGiftItem.name) {
        const titles = record.unlockedTitles || [];
        if (!titles.includes(newGiftItem.name)) titles.push(newGiftItem.name);
        record.unlockedTitles = titles;
      }

      successMsg = `🎁 Unboxed "${item.name}"! Received: "${newGiftItem.name}" (${newGiftItem.icon})!`;
    } else if (item.category === 'booster') {
      let bonusGain = 15;
      if (item.id === 'store-booster-pts-2x') bonusGain = 25;
      else if (item.id === 'store-booster-lucky') bonusGain = 20;

      record.points = (record.points || 0) + bonusGain;
      newPoints = record.points;
      successMsg = `⚡ Activated "${item.name}"! Bonus windfall 🪙 +${bonusGain} PTS credited to balance!`;
    } else if (item.category === 'snack') {
      const inv = { ...(record.snacksInventory || {}) };
      inv[item.id] = (inv[item.id] || 0) + 1;
      record.snacksInventory = inv;
      successMsg = `🐟 Packed 1x "${item.name}" into your Snack Bag! Click Pebbles on your screen to feed him!`;
    }

    saveUsers(users);

    const updatedSessionUser: UserAccount = {
      ...user,
      points: newPoints,
      isVip: record.isVip,
      vipLevel: record.vipLevel,
      activeProfileFrame: record.activeProfileFrame,
      purchasedItemIds: record.purchasedItemIds,
      unlockedTitles: record.unlockedTitles,
      mysteryGifts: record.mysteryGifts,
      pendingVipPass: record.pendingVipPass,
      snacksInventory: record.snacksInventory,
      penguinHappiness: record.penguinHappiness,
      penguinFeedCount: record.penguinFeedCount,
    };

    setCurrentSessionUser(updatedSessionUser);

    window.dispatchEvent(new CustomEvent('gameland_snacks_updated', {
      detail: { inventory: record.snacksInventory }
    }));

    return {
      success: true,
      message: successMsg,
      newPoints,
      user: updatedSessionUser,
    };
  }

  // Guest Purchase Handling
  try {
    localStorage.setItem(GUEST_POINTS_KEY, newPoints.toString());
  } catch (e) {
    console.error('Failed to update guest points', e);
  }

  let guestMsg = `Purchased "${item.name}" for 🪙 ${item.price} PTS!`;
  if (item.category === 'snack') {
    try {
      const raw = localStorage.getItem('gameland_guest_snacks_inventory_v1');
      const inv = raw ? JSON.parse(raw) : {};
      inv[item.id] = (inv[item.id] || 0) + 1;
      localStorage.setItem('gameland_guest_snacks_inventory_v1', JSON.stringify(inv));
      window.dispatchEvent(new CustomEvent('gameland_snacks_updated', {
        detail: { inventory: inv }
      }));
    } catch (e) {
      console.error('Failed to save guest snack', e);
    }
    guestMsg = `🐟 Packed 1x "${item.name}"! Click Pebbles on your screen to feed him!`;
  } else if (item.category === 'vip' && item.vipTier) {
    const guestPending: PendingVipPass = {
      id: item.id,
      name: item.name,
      vipTier: item.vipTier,
      price: item.price,
      requestedAt: new Date().toISOString(),
      status: 'processing',
    };
    try {
      localStorage.setItem('gameland_guest_pending_vip', JSON.stringify(guestPending));
    } catch (e) {
      console.error('Failed to set guest pending vip', e);
    }
    guestMsg = `⏳ VIP Pass Order Submitted! Your order for "${item.name}" is now PROCESSING.`;
  }

  return {
    success: true,
    message: guestMsg,
    newPoints,
    user: null,
  };
}

export function getUserSnacksInventory(user?: UserAccount | null): Record<string, number> {
  if (user) {
    const users = getStoredUsers();
    const record = users[user.username.toLowerCase()];
    return record?.snacksInventory || user.snacksInventory || {};
  }
  try {
    const raw = localStorage.getItem('gameland_guest_snacks_inventory_v1');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getPenguinStats(user?: UserAccount | null): { happiness: number; totalFed: number } {
  if (user) {
    const users = getStoredUsers();
    const record = users[user.username.toLowerCase()];
    return {
      happiness: record?.penguinHappiness ?? user.penguinHappiness ?? 85,
      totalFed: record?.penguinFeedCount ?? user.penguinFeedCount ?? 0,
    };
  }
  try {
    const hap = parseInt(localStorage.getItem('gameland_guest_penguin_happiness') || '85', 10);
    const fed = parseInt(localStorage.getItem('gameland_guest_penguin_feed_count') || '0', 10);
    return { happiness: hap, totalFed: fed };
  } catch {
    return { happiness: 85, totalFed: 0 };
  }
}

export function feedPenguinSnack(
  user: UserAccount | null,
  snackId: string
): {
  success: boolean;
  message: string;
  user: UserAccount | null;
  remaining: number;
  snackItem?: PenguinSnackItem;
  happiness: number;
  totalFed: number;
} {
  const snack = PENGUIN_SNACKS.find((s) => s.id === snackId);
  if (!snack) {
    return { success: false, message: 'Unknown snack item.', user, remaining: 0, happiness: 85, totalFed: 0 };
  }

  if (user) {
    const users = getStoredUsers();
    const key = user.username.toLowerCase();
    const record = users[key];
    if (!record) {
      return { success: false, message: 'User account record not found.', user, remaining: 0, happiness: 85, totalFed: 0 };
    }

    const inv = { ...(record.snacksInventory || {}) };
    const currentCount = inv[snackId] || 0;
    if (currentCount <= 0) {
      return {
        success: false,
        message: `You don't have any "${snack.name}" to feed Pebbles. Visit the Store to grab some!`,
        user,
        remaining: 0,
        happiness: record.penguinHappiness ?? 85,
        totalFed: record.penguinFeedCount ?? 0,
      };
    }

    const remaining = currentCount - 1;
    if (remaining <= 0) {
      delete inv[snackId];
    } else {
      inv[snackId] = remaining;
    }
    record.snacksInventory = inv;
    const newTotalFed = (record.penguinFeedCount || 0) + 1;
    record.penguinFeedCount = newTotalFed;
    const newHappiness = Math.min(100, (record.penguinHappiness ?? 85) + snack.hearts * 4);
    record.penguinHappiness = newHappiness;

    saveUsers(users);

    const updatedUser: UserAccount = {
      ...user,
      snacksInventory: record.snacksInventory,
      penguinHappiness: newHappiness,
      penguinFeedCount: newTotalFed,
    };
    setCurrentSessionUser(updatedUser);

    window.dispatchEvent(
      new CustomEvent('gameland_penguin_fed', {
        detail: {
          snack,
          happiness: newHappiness,
          totalFed: newTotalFed,
          remaining,
          username: user.username,
        },
      })
    );
    window.dispatchEvent(
      new CustomEvent('gameland_snacks_updated', {
        detail: { inventory: inv },
      })
    );

    return {
      success: true,
      message: snack.joyMessage,
      user: updatedUser,
      remaining,
      snackItem: snack,
      happiness: newHappiness,
      totalFed: newTotalFed,
    };
  }

  // Guest feeding logic
  let guestInv: Record<string, number> = {};
  let happiness = 85;
  let totalFed = 0;
  try {
    const raw = localStorage.getItem('gameland_guest_snacks_inventory_v1');
    guestInv = raw ? JSON.parse(raw) : {};
    happiness = parseInt(localStorage.getItem('gameland_guest_penguin_happiness') || '85', 10);
    totalFed = parseInt(localStorage.getItem('gameland_guest_penguin_feed_count') || '0', 10);
  } catch (e) {
    console.error('Failed to parse guest snacks', e);
  }

  const currentCount = guestInv[snackId] || 0;
  if (currentCount <= 0) {
    return {
      success: false,
      message: `You don't have any "${snack.name}" to feed Pebbles. Visit the Store to grab some!`,
      user: null,
      remaining: 0,
      happiness,
      totalFed,
    };
  }

  const remaining = currentCount - 1;
  if (remaining <= 0) {
    delete guestInv[snackId];
  } else {
    guestInv[snackId] = remaining;
  }
  totalFed += 1;
  happiness = Math.min(100, happiness + snack.hearts * 4);

  try {
    localStorage.setItem('gameland_guest_snacks_inventory_v1', JSON.stringify(guestInv));
    localStorage.setItem('gameland_guest_penguin_happiness', happiness.toString());
    localStorage.setItem('gameland_guest_penguin_feed_count', totalFed.toString());
  } catch (e) {
    console.error('Failed to save guest snack feed', e);
  }

  window.dispatchEvent(
    new CustomEvent('gameland_penguin_fed', {
      detail: {
        snack,
        happiness,
        totalFed,
        remaining,
        username: 'Guest',
      },
    })
  );
  window.dispatchEvent(
    new CustomEvent('gameland_snacks_updated', {
      detail: { inventory: guestInv },
    })
  );

  return {
    success: true,
    message: snack.joyMessage,
    user: null,
    remaining,
    snackItem: snack,
    happiness,
    totalFed,
  };
}

export function getUserPendingVipPass(user?: UserAccount | null): PendingVipPass | null {
  if (user?.pendingVipPass) {
    return user.pendingVipPass;
  }
  try {
    const raw = localStorage.getItem('gameland_guest_pending_vip');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse guest pending vip', e);
  }
  return null;
}

export function approvePendingVipPass(user?: UserAccount | null): { success: boolean; message: string; user: UserAccount | null } {
  if (user) {
    const users = getStoredUsers();
    const key = user.username.toLowerCase();
    const record = users[key];
    const session = getCurrentSessionUser();

    if (record && record.pendingVipPass) {
      const pending = record.pendingVipPass;
      record.isVip = true;
      record.vipLevel = pending.vipTier;
      record.vipGrantedAt = new Date().toISOString();
      delete record.pendingVipPass;

      saveUsers(users);

      const updatedUser: UserAccount = {
        ...user,
        isVip: true,
        vipLevel: pending.vipTier,
        pendingVipPass: undefined,
      };

      if (session && session.username.toLowerCase() === key) {
        setCurrentSessionUser(updatedUser);
      }

      return {
        success: true,
        message: `🎉 VIP Pass Activated! You are now VIP ${pending.vipTier} Status!`,
        user: updatedUser,
      };
    }
  }

  // Guest handling
  try {
    const raw = localStorage.getItem('gameland_guest_pending_vip');
    if (raw) {
      const pending: PendingVipPass = JSON.parse(raw);
      localStorage.removeItem('gameland_guest_pending_vip');
      return {
        success: true,
        message: `🎉 VIP Pass Activated! VIP ${pending.vipTier} Status enabled!`,
        user: null,
      };
    }
  } catch (e) {
    console.error('Failed to approve guest pending vip', e);
  }

  return { success: false, message: 'No pending VIP pass to approve.', user: user || null };
}

export function cancelPendingVipPass(user?: UserAccount | null): { success: boolean; message: string; user: UserAccount | null; newPoints: number } {
  if (user) {
    const users = getStoredUsers();
    const key = user.username.toLowerCase();
    const record = users[key];
    const session = getCurrentSessionUser();

    if (record && record.pendingVipPass) {
      const pending = record.pendingVipPass;
      const refundedPoints = (record.points || 0) + pending.price;
      record.points = refundedPoints;
      if (record.purchasedItemIds) {
        record.purchasedItemIds = record.purchasedItemIds.filter((id) => id !== pending.id);
      }
      delete record.pendingVipPass;

      saveUsers(users);

      const updatedUser: UserAccount = {
        ...user,
        points: refundedPoints,
        pendingVipPass: undefined,
        purchasedItemIds: record.purchasedItemIds,
      };

      if (session && session.username.toLowerCase() === key) {
        setCurrentSessionUser(updatedUser);
      }

      return {
        success: true,
        message: `Refunded 🪙 ${pending.price} PTS for canceled VIP request.`,
        user: updatedUser,
        newPoints: refundedPoints,
      };
    }
  }

  // Guest cancel
  let currentGuestPts = getUserPoints(null);
  try {
    const raw = localStorage.getItem('gameland_guest_pending_vip');
    if (raw) {
      const pending: PendingVipPass = JSON.parse(raw);
      currentGuestPts += pending.price;
      localStorage.setItem(GUEST_POINTS_KEY, currentGuestPts.toString());
      localStorage.removeItem('gameland_guest_pending_vip');
      return {
        success: true,
        message: `Refunded 🪙 ${pending.price} PTS for canceled VIP request.`,
        user: null,
        newPoints: currentGuestPts,
      };
    }
  } catch (e) {
    console.error('Failed to cancel guest pending vip', e);
  }

  return { success: false, message: 'No pending VIP pass found.', user: user || null, newPoints: currentGuestPts };
}

export function grantAdminPointsToUser(
  username: string,
  amount: number
): { success: boolean; newTotal: number; user: UserAccount | null } {
  if (!username || username.toLowerCase() === 'guest') {
    const currentGuest = getUserPoints(null);
    const newTotal = currentGuest + amount;
    try {
      localStorage.setItem(GUEST_POINTS_KEY, newTotal.toString());
    } catch (e) {
      console.error('Failed to update guest points', e);
    }
    return { success: true, newTotal, user: null };
  }

  const users = getStoredUsers();
  const key = username.toLowerCase();
  const record = users[key];

  if (!record) {
    // If user record wasn't found in db, fallback to guest or create
    const currentGuest = getUserPoints(null);
    const newTotal = currentGuest + amount;
    try {
      localStorage.setItem(GUEST_POINTS_KEY, newTotal.toString());
    } catch (e) {
      console.error(e);
    }
    return { success: true, newTotal, user: null };
  }

  const current = typeof record.points === 'number' ? record.points : 10;
  const newTotal = current + amount;
  record.points = newTotal;
  saveUsers(users);

  // Sync granted coins to Google Cloud Run authoritative backend
  cloudRunUpdateCoins(key, amount, 'add', 'admin_grant');

  const session = getCurrentSessionUser();
  let updatedSessionUser: UserAccount | null = null;
  if (session && session.username.toLowerCase() === key) {
    updatedSessionUser = {
      ...session,
      points: newTotal,
    };
    setCurrentSessionUser(updatedSessionUser);
  }

  const userAccount: UserAccount = {
    username: key,
    name: record.name,
    email: record.email,
    points: newTotal,
    isAdmin: record.isAdmin,
    isVip: record.isVip,
    vipLevel: record.vipLevel,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };

  return { success: true, newTotal, user: updatedSessionUser || userAccount };
}

export function setUserPointsBalance(username: string, newPoints: number): boolean {
  const users = getStoredUsers();
  const key = username.toLowerCase();
  const record = users[key];
  if (!record) return false;

  record.points = Math.max(0, newPoints);
  saveUsers(users);

  // Set coins on Google Cloud Run authoritative backend
  cloudRunUpdateCoins(key, Math.max(0, newPoints), 'set', 'admin_set_balance');

  const session = getCurrentSessionUser();
  if (session && session.username.toLowerCase() === key) {
    setCurrentSessionUser({
      ...session,
      points: Math.max(0, newPoints),
    });
  }
  return true;
}

export function grantMassPointBonus(amount: number): number {
  const users = getStoredUsers();
  let count = 0;
  Object.keys(users).forEach((key) => {
    const record = users[key];
    const current = typeof record.points === 'number' ? record.points : 10;
    record.points = current + amount;
    count++;
  });
  saveUsers(users);

  // Airdrop mass coins across all accounts on Google Cloud Run authoritative backend
  cloudRunMassCoins(amount, 'admin_mass_bonus');

  const session = getCurrentSessionUser();
  if (session) {
    const current = typeof session.points === 'number' ? session.points : 10;
    setCurrentSessionUser({
      ...session,
      points: current + amount,
    });
  }
  return count;
}

export function getAllPendingVipOrders(): { username: string; name?: string; email?: string; pending: PendingVipPass }[] {
  const users = getStoredUsers();
  const list: { username: string; name?: string; email?: string; pending: PendingVipPass }[] = [];

  Object.entries(users).forEach(([key, record]) => {
    if (record.pendingVipPass) {
      list.push({
        username: key,
        name: record.name,
        email: record.email,
        pending: record.pendingVipPass,
      });
    }
  });

  // Include guest pending if present
  try {
    const guestRaw = localStorage.getItem('gameland_guest_pending_vip');
    if (guestRaw) {
      list.push({
        username: 'Guest User (Unregistered)',
        name: 'Guest Player',
        pending: JSON.parse(guestRaw),
      });
    }
  } catch (e) {
    console.error('Failed to read guest pending vip', e);
  }

  return list;
}

export function adminApproveVipOrderByUsername(targetUsername: string): boolean {
  if (targetUsername.startsWith('Guest User')) {
    try {
      localStorage.removeItem('gameland_guest_pending_vip');
      return true;
    } catch {
      return false;
    }
  }

  const users = getStoredUsers();
  const key = targetUsername.toLowerCase();
  const record = users[key];
  if (!record || !record.pendingVipPass) return false;

  const pending = record.pendingVipPass;
  record.isVip = true;
  record.vipLevel = pending.vipTier;
  record.vipGrantedAt = new Date().toISOString();
  delete record.pendingVipPass;

  saveUsers(users);

  // Sync approved VIP tier to Google Cloud Run backend
  cloudRunUpdateVip(key, true, pending.vipTier);

  const session = getCurrentSessionUser();
  if (session && session.username.toLowerCase() === key) {
    setCurrentSessionUser({
      ...session,
      isVip: true,
      vipLevel: pending.vipTier,
      pendingVipPass: undefined,
    });
  }
  return true;
}

export function adminRejectVipOrderByUsername(targetUsername: string): boolean {
  if (targetUsername.startsWith('Guest User')) {
    try {
      const raw = localStorage.getItem('gameland_guest_pending_vip');
      if (raw) {
        const pending = JSON.parse(raw);
        const currentPts = getUserPoints(null);
        localStorage.setItem(GUEST_POINTS_KEY, (currentPts + pending.price).toString());
        localStorage.removeItem('gameland_guest_pending_vip');
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }

  const users = getStoredUsers();
  const key = targetUsername.toLowerCase();
  const record = users[key];
  if (!record || !record.pendingVipPass) return false;

  const pending = record.pendingVipPass;
  const current = typeof record.points === 'number' ? record.points : 0;
  record.points = current + pending.price;
  if (record.purchasedItemIds) {
    record.purchasedItemIds = record.purchasedItemIds.filter((id) => id !== pending.id);
  }
  delete record.pendingVipPass;

  saveUsers(users);

  // Refund coins on Google Cloud Run backend
  cloudRunUpdateCoins(key, pending.price, 'add', 'vip_order_refund');

  const session = getCurrentSessionUser();
  if (session && session.username.toLowerCase() === key) {
    setCurrentSessionUser({
      ...session,
      points: record.points,
      pendingVipPass: undefined,
      purchasedItemIds: record.purchasedItemIds,
    });
  }
  return true;
}

// Auto-sync users database with backend server on module load
if (typeof window !== 'undefined') {
  fetchServerUsersSync();
}


