import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let currentOnlineCount = 1;

export const USERS_STORAGE_KEY = 'gameland_users_db_v1';
export const CLOUD_RUN_BACKEND_URL = 'https://ais-dev-3rkm6fobgoyytw6ll5xdqk-409276822889.us-east5.run.app';

export const BACKEND_URL = (((import.meta as any).env?.VITE_API_URL) || '').replace(/\/$/, '');

export function getEffectiveBackendUrl(): string {
  if (BACKEND_URL) return BACKEND_URL;
  if (typeof window === 'undefined') return '';
  const hostname = window.location.hostname;
  if (hostname.endsWith('github.io') || window.location.protocol === 'file:') {
    return CLOUD_RUN_BACKEND_URL;
  }
  return window.location.origin;
}

if (typeof window !== 'undefined') {
  const targetServer = getEffectiveBackendUrl();
  try {
    socket = io(targetServer, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 1500,
      timeout: 10000,
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to Gameland Real-Time Backend on Cloud Run / Node server:', targetServer);
    });

    socket.on('connect_error', (err) => {
      // Graceful fallback to client-side storage when backend is unreachable or sleeping
      console.warn('ℹ️ Backend Socket connection standby:', err.message || err);
    });

    socket.on('users:count', (data: { count: number }) => {
      if (data && typeof data.count === 'number') {
        currentOnlineCount = data.count;
        window.dispatchEvent(new CustomEvent('gameland_online_users_update', { detail: data.count }));
      }
    });

    // Receive synced users database from server
    socket.on('users:synced_all', (serverUsers: Record<string, any>) => {
      if (serverUsers && typeof serverUsers === 'object') {
        try {
          const raw = localStorage.getItem(USERS_STORAGE_KEY);
          const existing = raw ? JSON.parse(raw) : {};
          const merged: Record<string, any> = { ...existing };

          Object.entries(serverUsers).forEach(([key, rec]) => {
            const lowerKey = key.toLowerCase();
            if (rec && typeof rec === 'object') {
              merged[lowerKey] = {
                ...(merged[lowerKey] || {}),
                ...rec,
                username: (rec as any).username || (merged[lowerKey] && merged[lowerKey].username) || key,
              };
            }
          });

          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(merged));
          window.dispatchEvent(new CustomEvent('gameland_users_updated', { detail: merged }));
        } catch (e) {
          console.error('Failed to merge server synced users', e);
        }
      }
    });

    // Real-time coin updates from Cloud Run
    socket.on('user:coins_updated', (data: { username: string; points: number; operation: string; amount: number; reason?: string }) => {
      if (data && data.username) {
        try {
          const lowerKey = data.username.toLowerCase();
          const raw = localStorage.getItem(USERS_STORAGE_KEY);
          const existing = raw ? JSON.parse(raw) : {};
          if (existing[lowerKey]) {
            existing[lowerKey].points = data.points;
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(existing));
          }

          // Check if it impacts current session user
          const sessionRaw = localStorage.getItem('gameland_current_session_user_v1');
          if (sessionRaw) {
            const session = JSON.parse(sessionRaw);
            if (session && session.username && session.username.toLowerCase() === lowerKey) {
              session.points = data.points;
              localStorage.setItem('gameland_current_session_user_v1', JSON.stringify(session));
              window.dispatchEvent(new CustomEvent('gameland_session_coins_updated', { detail: data }));
            }
          }

          window.dispatchEvent(new CustomEvent('gameland_coins_updated', { detail: data }));
          window.dispatchEvent(new CustomEvent('gameland_users_updated', { detail: existing }));
        } catch (err) {
          console.error('Error handling user:coins_updated socket event', err);
        }
      }
    });

    // Real-time VIP updates from Cloud Run
    socket.on('user:vip_updated', (data: { username: string; isVip: boolean; vipLevel?: string; vipGrantedAt?: string }) => {
      if (data && data.username) {
        try {
          const lowerKey = data.username.toLowerCase();
          const raw = localStorage.getItem(USERS_STORAGE_KEY);
          const existing = raw ? JSON.parse(raw) : {};
          if (existing[lowerKey]) {
            existing[lowerKey].isVip = data.isVip;
            existing[lowerKey].vipLevel = data.vipLevel;
            existing[lowerKey].vipGrantedAt = data.vipGrantedAt;
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(existing));
          }

          const sessionRaw = localStorage.getItem('gameland_current_session_user_v1');
          if (sessionRaw) {
            const session = JSON.parse(sessionRaw);
            if (session && session.username && session.username.toLowerCase() === lowerKey) {
              session.isVip = data.isVip;
              session.vipLevel = data.vipLevel;
              session.vipGrantedAt = data.vipGrantedAt;
              localStorage.setItem('gameland_current_session_user_v1', JSON.stringify(session));
              window.dispatchEvent(new CustomEvent('gameland_session_vip_updated', { detail: data }));
            }
          }

          window.dispatchEvent(new CustomEvent('gameland_vip_updated', { detail: data }));
          window.dispatchEvent(new CustomEvent('gameland_users_updated', { detail: existing }));
        } catch (err) {
          console.error('Error handling user:vip_updated socket event', err);
        }
      }
    });

    // Mass coins bonus from Cloud Run admin
    socket.on('users:mass_coins_granted', (data: { amount: number; note?: string }) => {
      window.dispatchEvent(new CustomEvent('gameland_mass_coins_granted', { detail: data }));
    });
  } catch (err) {
    console.warn('Socket initialization standby:', err);
  }
}

// Client Exported Functions
export function emitSocketUserJoin(username: string) {
  if (socket && socket.connected) {
    socket.emit('user:join', { username });
  }
}

export function getSocketOnlineUserCount(): number {
  return currentOnlineCount;
}

export function emitSocketUserRegister(userRecord: Record<string, any>) {
  if (socket && socket.connected) {
    socket.emit('users:sync_register', { user: userRecord });
  }
  const backend = getEffectiveBackendUrl();
  if (typeof window !== 'undefined' && backend) {
    fetch(`${backend}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: userRecord }),
    }).catch(() => {});
  }
}

export function emitSocketUsersSync(users: Record<string, any>) {
  if (socket && socket.connected) {
    socket.emit('users:sync_register', { users });
  }
  // Also perform HTTP backup POST
  const backend = getEffectiveBackendUrl();
  if (typeof window !== 'undefined' && backend) {
    fetch(`${backend}/api/users/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users }),
    }).catch(() => {});
  }
}

export async function fetchServerUsersSync(): Promise<Record<string, any> | null> {
  if (typeof window === 'undefined') return null;
  const backend = getEffectiveBackendUrl();
  try {
    const res = await fetch(`${backend}/api/users`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        const raw = localStorage.getItem(USERS_STORAGE_KEY);
        const existing = raw ? JSON.parse(raw) : {};
        const merged: Record<string, any> = { ...existing };

        Object.entries(data).forEach(([key, rec]) => {
          const lowerKey = key.toLowerCase();
          if (rec && typeof rec === 'object') {
            merged[lowerKey] = {
              ...(merged[lowerKey] || {}),
              ...(rec as any),
              username: (rec as any).username || (merged[lowerKey] && merged[lowerKey].username) || key,
            };
          }
        });

        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent('gameland_users_updated', { detail: merged }));
        return merged;
      }
    }
  } catch (err) {
    console.error('Failed to fetch user accounts sync from server', err);
  }
  return null;
}

// Cloud Run Authoritative Coin Operations
export async function cloudRunUpdateCoins(
  username: string,
  amount: number,
  operation: 'add' | 'deduct' | 'set' = 'add',
  reason?: string
): Promise<{ success: boolean; points?: number; error?: string }> {
  if (typeof window === 'undefined') return { success: false, error: 'No window context' };
  const backend = getEffectiveBackendUrl();
  try {
    const res = await fetch(`${backend}/api/users/${encodeURIComponent(username.toLowerCase())}/coins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, operation, reason }),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    console.warn('Cloud Run coin update standby:', err.message || err);
    return { success: false, error: err.message || 'Network error' };
  }
}

// Cloud Run Authoritative VIP Operations
export async function cloudRunUpdateVip(
  username: string,
  isVip: boolean,
  vipLevel?: string
): Promise<{ success: boolean; user?: any; error?: string }> {
  if (typeof window === 'undefined') return { success: false, error: 'No window context' };
  const backend = getEffectiveBackendUrl();
  try {
    const res = await fetch(`${backend}/api/users/${encodeURIComponent(username.toLowerCase())}/vip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVip, vipLevel, vipGrantedAt: new Date().toISOString() }),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    console.warn('Cloud Run VIP update standby:', err.message || err);
    return { success: false, error: err.message || 'Network error' };
  }
}

// Cloud Run Authoritative Mass Coins Airdrop
export async function cloudRunMassCoins(
  amount: number,
  note?: string
): Promise<{ success: boolean; count?: number; error?: string }> {
  if (typeof window === 'undefined') return { success: false, error: 'No window context' };
  const backend = getEffectiveBackendUrl();
  try {
    const res = await fetch(`${backend}/api/users/mass-coins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, note }),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    console.warn('Cloud Run mass coins standby:', err.message || err);
    return { success: false, error: err.message || 'Network error' };
  }
}

// Cloud Run Authoritative Promote All VIP
export async function cloudRunPromoteAllVip(
  vipLevel: string = 'Gold'
): Promise<{ success: boolean; count?: number; error?: string }> {
  if (typeof window === 'undefined') return { success: false, error: 'No window context' };
  const backend = getEffectiveBackendUrl();
  try {
    const res = await fetch(`${backend}/api/users/promote-all-vip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vipLevel }),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    console.warn('Cloud Run mass VIP standby:', err.message || err);
    return { success: false, error: err.message || 'Network error' };
  }
}

