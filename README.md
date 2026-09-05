# 🐧 GameLand Penguin

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue?style=for-the-badge&logo=github)](https://ishaany83-arch.github.io/GameLandPenguinServer1/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)

A responsive, feature-packed online arcade and unblocked gaming portal hosted by **Pebbles The Penguin**. Features an extensive collection of retro and browser mini-games, real-time multiplayer lobbies, student-friendly stealth panic keys, user accounts, customizable avatars, and a fish coins reward economy.

---

## 🌟 Key Features

### 🎮 Huge Arcade Library
- Curated retro classics, physics simulators, driving games, puzzles, 2-player showdowns, and action titles.
- Clean iframe sandboxing, seamless fullscreen mode, and game favorite bookmarking.
- Category filtering and instant fuzzy search across all titles.

### 🛡️ Panic Key & Tab Cloaking (Stealth Mode)
- **Emergency Panic Key**: Instantly redirects to a safe educational site (e.g., Google Classroom, Google Docs, or Khan Academy) at the press of a key (`~`, `Esc`, or custom).
- **Tab Disguise Mask**: Changes the browser favicon and page title to Google Drive, Canvas, or Google Docs to stay disguised in classroom tabs.
- **Disguise Overlay**: Press a quick shortcut to render an interactive mock spreadsheet or text document over the screen.

### 🐧 VIP Penguin Lounge & Fish Coins Store
- **Fish Coin Economy**: Earn coins simply by playing games and completing daily challenges.
- **Store & Cosmetics**: Unlock exclusive penguin avatars, animated name tags, special cursor trails, and chat bubbles.
- **VIP Lounge**: Exclusive high-roller titles, bonus daily login multipliers, and golden badges.

### 🏆 Accounts, Trophies & Daily Streaks
- **User Accounts**: Create an account, customize your penguin profile, and track your high scores.
- **Daily Login Streaks**: Return every day to build consecutive streaks and earn bonus coins.
- **Trophies & Achievements**: Unlock awards for mastering games, exploring categories, and reaching high scores.

### ⚡ Real-Time Multiplayer & Live Sync
- **Socket.io Integration**: Live online player count and real-time multiplayer synchronization.
- **Admin Control Panel**: Real-time moderation tools, announcements banner, and user rank management.

### ❄️ Aesthetic & Accessible UI
- Winter ice theme with togglable animated snowfall particle effect.
- Fully mobile-responsive layout for desktop, Chromebooks, tablets, and phones.
- Interactive mascot **Pebbles The Penguin** who tells jokes and reacts to your achievements!

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons
- **Backend**: Node.js, Express, Socket.io
- **Bundler & Build Tooling**: Vite 6, esbuild, tsx
- **Deployment**: GitHub Pages (Static Client) + Docker / Cloud Run (Full-Stack Socket Server)

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) (version 20 or higher recommended)
- `npm` (included with Node.js)

### 1. Clone the Repository
```bash
git clone https://github.com/ishaany83-arch/GameLandPenguinServer1.git
cd GameLandPenguinServer1
```

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Start the Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:3000` (or the port specified in your terminal).

### 4. Build for Production
```bash
npm run build
```
This compiles the Vite frontend into `dist/` and bundles `server.ts` into `dist/server.cjs`.

---

## 🚢 Deployment

### Deploying to GitHub Pages (Automated via GitHub Actions)
The repository includes an automated GitHub Actions workflow (`.github/workflows/deploy.yml`). Whenever changes are pushed to `main`, GitHub Actions automatically installs dependencies, builds the Vite production bundle, and deploys the site.

Live Site: [https://ishaany83-arch.github.io/GameLandPenguinServer1/](https://ishaany83-arch.github.io/GameLandPenguinServer1/)

To trigger a manual deploy:
```bash
npm run deploy
```

### Deploying the Backend to Docker / Google Cloud Run
A production-ready multi-stage `Dockerfile` is included in the project root:

```bash
# Build the Docker container
docker build -t gameland-penguin .

# Run the container locally on port 3000
docker run -p 3000:3000 gameland-penguin
```

For Google Cloud Run:
```bash
gcloud run deploy gameland-penguin --source . --port 3000 --allow-unauthenticated
```

---

## 📁 Project Structure

```text
├── .github/workflows/deploy.yml   # GitHub Actions CI/CD for GitHub Pages
├── public/                        # Static assets, icons, and audio
├── src/
│   ├── components/                # React UI components (Arcade frame, Modals, Store, VIP)
│   ├── data/                      # Game catalogs, templates, and categories
│   ├── utils/                     # Auth, trophies, panic disguise settings, socket client
│   ├── types.ts                   # TypeScript interfaces and game schemas
│   ├── App.tsx                    # Primary application component & view manager
│   ├── index.css                  # Global Tailwind CSS styles
│   └── main.tsx                   # React DOM entry point
├── Dockerfile                     # Multi-stage production container build
├── server.ts                      # Express API + Socket.io multiplayer server
├── package.json                   # Project scripts and dependencies
└── vite.config.ts                 # Vite bundler configuration
```

---

## 📜 License & Acknowledgements

Created with ❤️ by **Pebbles The Penguin** and contributors.
Arcade games and embeds belong to their respective creators and copyright holders.
