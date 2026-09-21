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
