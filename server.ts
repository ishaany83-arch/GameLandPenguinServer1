import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { Server as SocketIOServer } from 'socket.io';

const app = express();
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'DELETE'],
  },
});

const PORT = Number(process.env.PORT) || 3000;
const USERS_FILE_PATH = path.join(process.cwd(), 'users_registry_data.json');
const PERMANENT_ARCHIVE_PATH = path.join(process.cwd(), 'users_permanent_archive.json');
const USERS_BACKUP_PATH = path.join(process.cwd(), 'users_registry_data.backup.json');
const USERS_LEDGER_PATH = path.join(process.cwd(), 'users_permanent_ledger.jsonl');

let onlineUsersCount = 1;

// Global User Registry store on server to sync across all computers/browsers
const serverUsersStore: Record<string, any> = {
  pebblesthepenguinishaany83: {
    username: 'Pebblesthepenguinishaany83',
    passwordHash: 'Pebblesthepenguinneedsagepoop',
    name: 'Pebbles (Ishaan)',
    email: 'ishaany83@gmail.com',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isAdmin: true,
    isVip: true,
    vipLevel: 'Diamond',
  },
};

// Persistence functions - Multi-layer redundancy to ensure accounts are NEVER deleted or lost
function loadPersistedUsers() {
  const fileSources = [USERS_FILE_PATH, PERMANENT_ARCHIVE_PATH, USERS_BACKUP_PATH];
  let loadedCount = 0;

  fileSources.forEach((filePath) => {
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object') {
          Object.entries(parsed).forEach(([key, val]) => {
            if (val && typeof val === 'object') {
              const lowerKey = key.toLowerCase();
              serverUsersStore[lowerKey] = {
                ...(serverUsersStore[lowerKey] || {}),
                ...(val as Record<string, any>),
                username: (val as any).username || (serverUsersStore[lowerKey] && serverUsersStore[lowerKey].username) || key,
              };
              loadedCount++;
            }
          });
        }
      }
    } catch (err) {
      console.error(`⚠️ Could not read user store from ${filePath}:`, err);
    }
  });

  console.log(`✅ Loaded & unified ${Object.keys(serverUsersStore).length} permanent accounts from disk storage.`);
  // Immediately synchronize all persistent storage files so all backups contain the unified accounts
  savePersistedUsers(false);
}

function savePersistedUsers(appendLedger: boolean = true) {
  try {
    const serialized = JSON.stringify(serverUsersStore, null, 2);
    // Write primary registry
    fs.writeFileSync(USERS_FILE_PATH, serialized, 'utf-8');
    // Write permanent archive
    fs.writeFileSync(PERMANENT_ARCHIVE_PATH, serialized, 'utf-8');
    // Write hot backup
    fs.writeFileSync(USERS_BACKUP_PATH, serialized, 'utf-8');

    // Append to immutable append-only ledger for extra safety
    if (appendLedger) {
      try {
        const ledgerEntry = JSON.stringify({
          timestamp: new Date().toISOString(),
          totalAccounts: Object.keys(serverUsersStore).length,
          accounts: Object.keys(serverUsersStore),
        }) + '\n';
        fs.appendFileSync(USERS_LEDGER_PATH, ledgerEntry, 'utf-8');
      } catch (lErr) {
        // Ledger non-blocking
      }
    }
  } catch (err) {
    console.error('⚠️ Failed to save users to permanent disk storage:', err);
  }
}

// Initial load
loadPersistedUsers();

// Socket.IO Real-time Connection Handling
io.on('connection', (socket) => {
  onlineUsersCount++;
  io.emit('users:count', { count: Math.max(1, onlineUsersCount) });

  // Send server master user accounts database to newly connected client
  socket.emit('users:synced_all', serverUsersStore);

  socket.on('user:join', (user: { username: string }) => {
    socket.data.username = user.username;
    socket.broadcast.emit('user:joined_announcement', {
      username: user.username,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  });

  // User Account Registration & Sync Socket Event
  socket.on('users:sync_register', (payload: { users?: Record<string, any>; user?: any }) => {
    let updated = false;
    if (payload.users && typeof payload.users === 'object') {
      Object.entries(payload.users).forEach(([key, rec]) => {
        const lowerKey = key.toLowerCase();
        if (rec && typeof rec === 'object') {
          serverUsersStore[lowerKey] = {
            ...(serverUsersStore[lowerKey] || {}),
            ...rec,
            username: (rec as any).username || key,
          };
          updated = true;
        }
      });
    }
    if (payload.user && payload.user.username) {
      const lowerKey = payload.user.username.toLowerCase();
      serverUsersStore[lowerKey] = {
        ...(serverUsersStore[lowerKey] || {}),
        ...payload.user,
        username: payload.user.username,
      };
      updated = true;
    }
    if (updated) {
      savePersistedUsers();
      io.emit('users:synced_all', serverUsersStore);
    }
  });

  socket.on('disconnect', () => {
    onlineUsersCount = Math.max(1, onlineUsersCount - 1);
    io.emit('users:count', { count: onlineUsersCount });
  });
});

// REST Healthcheck & User Accounts APIs
app.use(express.json());

// CORS middleware for cross-origin requests (from GitHub Pages or custom domains)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    onlineUsers: onlineUsersCount,
    totalAccounts: Object.keys(serverUsersStore).length,
    uptime: process.uptime(),
  });
});

// Get all registered users
app.get('/api/users', (req, res) => {
  res.json(serverUsersStore);
});

// Single user registration endpoint
app.post('/api/users/register', (req, res) => {
  const { user, username, password, email, name, passwordHash } = req.body;
  const targetUser = user || {
    username,
    passwordHash: passwordHash || password,
    email,
    name,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };

  if (targetUser && targetUser.username) {
    const rawUsername = String(targetUser.username).trim();
    const lowerKey = rawUsername.toLowerCase();
    
    serverUsersStore[lowerKey] = {
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      points: 10,
      ...(serverUsersStore[lowerKey] || {}),
      ...targetUser,
      username: rawUsername,
    };

    savePersistedUsers();
    console.log(`💾 Permanent account registered & saved to backend disk: "${rawUsername}" (Total: ${Object.keys(serverUsersStore).length})`);
    io.emit('users:synced_all', serverUsersStore);
    return res.json({ success: true, user: serverUsersStore[lowerKey], total: Object.keys(serverUsersStore).length });
  }

  return res.status(400).json({ success: false, error: 'Invalid username or user data provided.' });
});

// Bulk sync endpoint
app.post('/api/users/sync', (req, res) => {
  const { users, user } = req.body;
  let updated = false;

  if (users && typeof users === 'object') {
    Object.entries(users).forEach(([key, rec]) => {
      if (rec && typeof rec === 'object') {
        const lowerKey = key.toLowerCase();
        serverUsersStore[lowerKey] = {
          points: 10,
          ...(serverUsersStore[lowerKey] || {}),
          ...(rec as Record<string, any>),
          username: (rec as any).username || (serverUsersStore[lowerKey] && serverUsersStore[lowerKey].username) || key,
        };
        updated = true;
      }
    });
  }

  if (user && user.username) {
    const rawUsername = String(user.username).trim();
    const lowerKey = rawUsername.toLowerCase();
    serverUsersStore[lowerKey] = {
      points: 10,
      ...(serverUsersStore[lowerKey] || {}),
      ...user,
      username: rawUsername,
    };
    updated = true;
  }

  if (updated) {
    savePersistedUsers();
    io.emit('users:synced_all', serverUsersStore);
  }

  res.json({ success: true, count: Object.keys(serverUsersStore).length });
});

// User deletion endpoint - PERMANENTLY DISABLED
// User accounts are saved in the backend and can never be deleted
app.delete('/api/users/:username', (req, res) => {
  const username = (req.params.username || '').toLowerCase();
  console.warn(`🛑 Rejected account deletion attempt for "${username}". Account deletion is permanently disabled.`);
  return res.status(403).json({
    success: false,
    error: 'Account deletion is permanently disabled. All registered accounts are permanently saved in the backend and can never be deleted.',
  });
});

// --- Cloud Run Authoritative Endpoints for Coins & VIP ---

// Get specific user coins and VIP info
app.get('/api/users/:username/status', (req, res) => {
  const username = (req.params.username || '').toLowerCase();
  const record = serverUsersStore[username];
  if (!record) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  res.json({
    success: true,
    username,
    points: typeof record.points === 'number' ? record.points : 10,
    isVip: !!record.isVip,
    vipLevel: record.vipLevel || null,
    vipGrantedAt: record.vipGrantedAt || null,
  });
});

// Update user coins (add, deduct, set)
app.post('/api/users/:username/coins', (req, res) => {
  const username = (req.params.username || '').toLowerCase();
  const { amount, operation = 'add', reason } = req.body;
  const numAmount = Number(amount);

  if (isNaN(numAmount)) {
    return res.status(400).json({ success: false, error: 'Invalid amount provided.' });
  }

  // Auto-create or get user record
  if (!serverUsersStore[username]) {
    serverUsersStore[username] = {
      username,
      points: 10,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
  }

  const record = serverUsersStore[username];
  const currentPoints = typeof record.points === 'number' ? record.points : 10;
  let newPoints = currentPoints;

  if (operation === 'add') {
    newPoints = currentPoints + Math.max(0, numAmount);
  } else if (operation === 'deduct') {
    if (currentPoints < numAmount) {
      return res.status(400).json({
        success: false,
        error: `Insufficient coins. Current balance: ${currentPoints}, required: ${numAmount}`,
        points: currentPoints,
      });
    }
    newPoints = Math.max(0, currentPoints - numAmount);
  } else if (operation === 'set') {
    newPoints = Math.max(0, numAmount);
  }

  record.points = newPoints;
  savePersistedUsers();

  // Real-time broadcast
  io.emit('user:coins_updated', {
    username,
    points: newPoints,
    operation,
    amount: numAmount,
    reason: reason || 'balance_update',
  });
  io.emit('users:synced_all', serverUsersStore);

  return res.json({
    success: true,
    username,
    points: newPoints,
    operation,
    amount: numAmount,
  });
});

// Update user VIP status and tier
app.post('/api/users/:username/vip', (req, res) => {
  const username = (req.params.username || '').toLowerCase();
  const { isVip, vipLevel, vipGrantedAt } = req.body;

  if (!serverUsersStore[username]) {
    serverUsersStore[username] = {
      username,
      points: 10,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
  }

  const record = serverUsersStore[username];
  record.isVip = !!isVip;
  if (isVip) {
    record.vipLevel = vipLevel || 'Gold';
    record.vipGrantedAt = vipGrantedAt || new Date().toISOString();
  } else {
    delete record.vipLevel;
    delete record.vipGrantedAt;
  }

  savePersistedUsers();

  io.emit('user:vip_updated', {
    username,
    isVip: record.isVip,
    vipLevel: record.vipLevel || null,
    vipGrantedAt: record.vipGrantedAt || null,
  });
  io.emit('users:synced_all', serverUsersStore);

  return res.json({
    success: true,
    username,
    isVip: record.isVip,
    vipLevel: record.vipLevel,
  });
});

// Mass coins airdrop to all accounts
app.post('/api/users/mass-coins', (req, res) => {
  const { amount, note } = req.body;
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ success: false, error: 'Invalid mass coin amount' });
  }

  let count = 0;
  Object.keys(serverUsersStore).forEach((key) => {
    const record = serverUsersStore[key];
    const current = typeof record.points === 'number' ? record.points : 10;
    record.points = current + numAmount;
    count++;
  });

  savePersistedUsers();

  io.emit('users:mass_coins_granted', {
    amount: numAmount,
    note: note || 'Admin bonus',
    timestamp: new Date().toISOString(),
  });
  io.emit('users:synced_all', serverUsersStore);

  return res.json({ success: true, count, amount: numAmount });
});

// Mass promote all users to VIP
app.post('/api/users/promote-all-vip', (req, res) => {
  const { vipLevel = 'Gold' } = req.body;
  const now = new Date().toISOString();
  let count = 0;

  Object.keys(serverUsersStore).forEach((key) => {
    const record = serverUsersStore[key];
    record.isVip = true;
    record.vipLevel = vipLevel;
    if (!record.vipGrantedAt) {
      record.vipGrantedAt = now;
    }
    count++;
  });

  savePersistedUsers();
  io.emit('users:synced_all', serverUsersStore);

  return res.json({ success: true, count, vipLevel });
});

// Serve frontend via Vite in dev mode or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn('Vite dev server middleware not loaded:', e);
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      res.sendFile(indexPath, (err) => {
        if (err) {
          res.status(200).json({ status: 'ok', service: 'Gameland Penguin API', port: PORT });
        }
      });
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Gameland Penguin Real-Time Server running on port ${PORT}`);
  });
}

startServer();
