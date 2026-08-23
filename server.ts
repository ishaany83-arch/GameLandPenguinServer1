import express from 'express';
import http from 'http';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';

const app = express();
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = Number(process.env.PORT) || 3000;

let onlineUsersCount = 1;

// Global User Registry store on server to sync across all computers/browsers
const serverUsersStore: Record<string, any> = {
  pebblesthepenguinishaany83: {
    passwordHash: 'Pebbles2026!AdminAccess',
    name: 'Pebbles (Ishaan)',
    email: 'ishaany83@gmail.com',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isAdmin: true,
    isVip: true,
    vipLevel: 'Diamond',
  },
};

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
    if (payload.users) {
      Object.entries(payload.users).forEach(([key, rec]) => {
        const lowerKey = key.toLowerCase();
        if (rec) {
          serverUsersStore[lowerKey] = { ...serverUsersStore[lowerKey], ...rec };
          updated = true;
        }
      });
    }
    if (payload.user && payload.user.username) {
      const lowerKey = payload.user.username.toLowerCase();
      serverUsersStore[lowerKey] = { ...serverUsersStore[lowerKey], ...payload.user };
      updated = true;
    }
    if (updated) {
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

// CORS middleware for cross-origin requests (from GitHub Pages)
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
  res.json({ status: 'ok', onlineUsers: onlineUsersCount, uptime: process.uptime() });
});

app.get('/api/users', (req, res) => {
  res.json(serverUsersStore);
});

app.post('/api/users/sync', (req, res) => {
  const { users } = req.body;
  if (users && typeof users === 'object') {
    Object.entries(users).forEach(([key, rec]) => {
      if (rec) {
        serverUsersStore[key.toLowerCase()] = { ...(serverUsersStore[key.toLowerCase()] || {}), ...(rec as Record<string, any>) };
      }
    });
    io.emit('users:synced_all', serverUsersStore);
  }
  res.json({ success: true, count: Object.keys(serverUsersStore).length });
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
