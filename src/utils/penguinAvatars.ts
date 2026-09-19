export interface PenguinAvatar {
  id: string;
  name: string;
  emoji: string;
  description: string;
  bgColor: string;
  borderColor: string;
  tagline: string;
  imageUrl?: string;
}

export const PENGUIN_AVATARS: PenguinAvatar[] = [
  {
    id: 'classic',
    name: 'Classic Penguin',
    emoji: '🐧',
    description: 'The iconic Pebbles GameLand mascot.',
    bgColor: 'bg-cyan-500/15',
    borderColor: 'border-cyan-500/40 text-cyan-300',
    tagline: 'Standard Igloo Gamer',
  },
  {
    id: 'gamer',
    name: 'Gamer Penguin',
    emoji: '🐧🎮',
    description: 'Headset on, 100% focused on arcade high scores.',
    bgColor: 'bg-purple-500/15',
    borderColor: 'border-purple-500/40 text-purple-300',
    tagline: 'Arcade Champion',
  },
  {
    id: 'king',
    name: 'Emperor Penguin',
    emoji: '🐧👑',
    description: 'Royal ruler of the Antarctic gaming realm.',
    bgColor: 'bg-amber-500/15',
    borderColor: 'border-amber-500/40 text-amber-300',
    tagline: 'Royal Royalty',
  },
  {
    id: 'ninja',
    name: 'Ninja Penguin',
    emoji: '🐧🥷',
    description: 'Swift, silent, and master of unblocked stealth.',
    bgColor: 'bg-slate-700/30',
    borderColor: 'border-slate-500/40 text-slate-200',
    tagline: 'Shadow Operative',
  },
  {
    id: 'wizard',
    name: 'Frost Wizard Penguin',
    emoji: '🐧🧙',
    description: 'Casts ice spells to freeze lag instantly.',
    bgColor: 'bg-sky-500/15',
    borderColor: 'border-sky-500/40 text-sky-300',
    tagline: 'Magic Coder',
  },
  {
    id: 'astronaut',
    name: 'Astro Penguin',
    emoji: '🐧🚀',
    description: 'Exploring unblocked games across outer space.',
    bgColor: 'bg-blue-600/15',
    borderColor: 'border-blue-500/40 text-blue-300',
    tagline: 'Cosmic Explorer',
  },
  {
    id: 'spy',
    name: 'Secret Agent Penguin',
    emoji: '🐧🕶️',
    description: 'Equipped with emergency panic keys and disguises.',
    bgColor: 'bg-rose-500/15',
    borderColor: 'border-rose-500/40 text-rose-300',
    tagline: 'Disguise Expert',
  },
  {
    id: 'dj',
    name: 'DJ Beats Penguin',
    emoji: '🐧🎧',
    description: 'Dropping frosty 8-bit chiptune gaming tracks.',
    bgColor: 'bg-emerald-500/15',
    borderColor: 'border-emerald-500/40 text-emerald-300',
    tagline: 'Music Maestro',
  },
  {
    id: 'hockey',
    name: 'Hockey Penguin',
    emoji: '🐧🏒',
    description: 'Slapshotting pucks on the icy rink like an ice hockey MVP.',
    bgColor: 'bg-red-500/15',
    borderColor: 'border-red-500/40 text-red-300',
    tagline: 'Ice Rink MVP',
  },
  {
    id: 'ski',
    name: 'Skiing Penguin',
    emoji: '🐧🎿',
    description: 'Gliding through game levels at breakneck speeds.',
    bgColor: 'bg-teal-500/15',
    borderColor: 'border-teal-500/40 text-teal-300',
    tagline: 'Glacier Speedrunner',
  },
  {
    id: 'chill',
    name: 'Chill Ice Penguin',
    emoji: '🐧🧊',
    description: 'Cool, relaxed, and enjoying casual puzzle games.',
    bgColor: 'bg-pink-500/15',
    borderColor: 'border-pink-500/40 text-pink-300',
    tagline: 'Casual Ice Cruiser',
  },
  {
    id: 'chef',
    name: 'Chef Penguin',
    emoji: '🐧🍳',
    description: 'Serving up delicious fish snacks & snow cones.',
    bgColor: 'bg-orange-500/15',
    borderColor: 'border-orange-500/40 text-orange-300',
    tagline: 'Igloo Gourmet',
  },
  {
    id: 'detective',
    name: 'Detective Penguin',
    emoji: '🐧🔍',
    description: 'Investigating and uncovering secret unblocked games.',
    bgColor: 'bg-indigo-500/15',
    borderColor: 'border-indigo-500/40 text-indigo-300',
    tagline: 'Mystery Solver',
  },
];

export function getAvatarById(id?: string): PenguinAvatar {
  if (!id) return PENGUIN_AVATARS[0];
  if (id.startsWith('data:image/') || id.startsWith('http://') || id.startsWith('https://') || id.startsWith('blob:')) {
    return {
      id,
      name: 'Custom Photo',
      emoji: '🖼️',
      imageUrl: id,
      description: 'Your uploaded custom avatar image (PNG, JPG, or JPEG).',
      bgColor: 'bg-slate-900',
      borderColor: 'border-cyan-400 text-cyan-300',
      tagline: 'Custom Photo',
    };
  }
  return PENGUIN_AVATARS.find((a) => a.id === id) || PENGUIN_AVATARS[0];
}

/**
 * Processes an uploaded avatar image file (PNG, JPG, JPEG) and resizes it to a sharp, compact square avatar data URL.
 */
export function processAvatarImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    const isValidExt = extension === 'png' || extension === 'jpg' || extension === 'jpeg';

    if (!validTypes.includes(file.type) && !isValidExt) {
      reject(new Error('Please select a valid image file in PNG, JPG, or JPEG format.'));
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      reject(new Error('Image file is too large (maximum 12MB).'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Unable to read image file from disk.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('The uploaded file is not a valid or readable image.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 240;
        canvas.width = MAX_DIM;
        canvas.height = MAX_DIM;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not process canvas.'));
          return;
        }

        // Center square crop
        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        // Smooth image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, MAX_DIM, MAX_DIM);

        const outputFormat = (file.type === 'image/png' || extension === 'png') ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputFormat, 0.9);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

