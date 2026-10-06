import { useSyncExternalStore } from 'react';
import confetti from 'canvas-confetti';
import { soundManager } from '../sound/audioManager';

export type AccessoryType = 'none' | 'bunny_ears' | 'fairy_wings' | 'princess_crown' | 'cat_ears' | 'star_halo';
export type PetType = 'none' | 'puppy' | 'kitten' | 'fairy';
export type EmoteType = 'none' | 'wave' | 'dance' | 'cheer';
export type RideType = 'none' | 'slide' | 'swing' | 'carousel' | 'ferris' | 'train' | 'boat' | 'firetruck' | 'pool_slide' | 'flamingo';

export type TimeOfDay = 'subuh' | 'siang' | 'sore' | 'malam';

// Durasi interval waktu (dalam detik) untuk masing-masing fase secara otomatis
export const TIME_OF_DAY_INTERVALS: Record<TimeOfDay, number> = {
  subuh: 45, // 45 detik: Fajar Subuh yang sejuk & tenang
  siang: 90, // 90 detik: Siang hari ceria untuk bermain & eksplorasi
  sore: 45,  // 45 detik: Senja sore keemasan nan syahdu
  malam: 60, // 60 detik: Malam berbintang dengan lentera & kunang-kunang
};

export const TIME_OF_DAY_SEQUENCE: Record<TimeOfDay, TimeOfDay> = {
  subuh: 'siang',
  siang: 'sore',
  sore: 'malam',
  malam: 'subuh',
};

export const TIME_OF_DAY_CONFIG: Record<
  TimeOfDay,
  {
    name: string;
    badgeLabel: string;
    description: string;
    duration: number;
  }
> = {
  subuh: {
    name: 'Subuh',
    badgeLabel: 'Subuh',
    description: 'Fajar Subuh yang damai dan sejuk 🌅🕊️',
    duration: 45,
  },
  siang: {
    name: 'Siang',
    badgeLabel: 'Siang',
    description: 'Matahari siang ceria bersinar hangat ☀️🏡',
    duration: 90,
  },
  sore: {
    name: 'Sore',
    badgeLabel: 'Sore',
    description: 'Senja sore jingga keemasan nan indah 🌇✨',
    duration: 45,
  },
  malam: {
    name: 'Malam',
    badgeLabel: 'Malam',
    description: 'Malam berbintang ajaib & kunang-kunang 🌙🕯️',
    duration: 60,
  },
};

export const TIME_OF_DAY_MESSAGES: Record<TimeOfDay, string> = {
  subuh: 'Fajar Subuh yang sejuk dan damai! Waktunya bangun dan sholat Subuh, Khaulah! 🌅🕊️',
  siang: 'Matahari siang ceria bersinar hangat! Selamat beraktivitas Khaulah! ☀️🏡🎒',
  sore: 'Senja sore jingga keemasan yang indah di desa Karang Tengah! 🌇✨',
  malam: 'Malam berbintang ajaib! Kunang-kunang dan lentera mulai menyala! 🌙✨🕯️',
};

export type DialogActionType =
  | 'high_five'
  | 'take_snack'
  | 'play_ball'
  | 'cuddle_baby'
  | 'play_drumband'
  | 'play_toycar'
  | 'complete_quest'
  | 'feed_animal'
  | 'buy_icecream'
  | 'scan_grocery'
  | 'toggle_khalid_follow';

export interface FamilyDialogData {
  speaker: string;
  role: string;
  avatarBg: string;
  text: string;
  actionText?: string;
  actionType?: DialogActionType;
}

export interface GameState {
  playerPos: [number, number, number];
  joystickVector: { x: number; y: number };
  isJumpPressed: boolean;
  activeAccessory: AccessoryType;
  activePet: PetType;
  activeEmote: EmoteType;
  bubbleMessage: string;
  isClosetOpen: boolean;
  isWelcomeOpen: boolean;
  isMuted: boolean;
  isBgmActive: boolean;
  isShiftLock: boolean;
  respawnTrigger: number;
  cameraDistance: number;
  // Motion tracking for Roblox Brookhaven soft follow camera
  playerFacingAngle: number;
  isPlayerMoving: boolean;
  isInWater: boolean;
  // New Family & Playground features
  activeRide: RideType;
  speedBuffTimeLeft: number;
  nearbyInteractable: { id: string; title: string; prompt: string } | null;
  activeDialog: FamilyDialogData | null;
  // Time of Day
  timeOfDay: TimeOfDay;
  timeOfDayTimeLeft: number;
  // Scooter vehicle
  isRidingScooter: boolean;
  scooterPos: [number, number, number];
  // School prep quest
  schoolQuest: {
    backpack: boolean;
    waterBottle: boolean;
    drawingBook: boolean;
    completed: boolean;
  };
  // AI Magic & Voice Controller state
  isMagicModalOpen: boolean;
  jumpBuffTimeLeft: number;
  teleportTrigger: number;
  teleportTarget: [number, number, number] | null;
  spawnedItems: SpawnedMagicItem[];
  isWishlistOpen: boolean;
  characterChatState: CharacterChatState | null;
  // Living NPC Director: Adek Khalid Follow Mode
  isKhalidFollowing: boolean;
  khalidPos: [number, number, number];
}

export interface SpawnedMagicItem {
  id: string;
  type: 'balloon' | 'cake' | 'bubble' | 'star';
  position: [number, number, number];
  color?: string;
  scale?: number;
  createdAt: number;
}

export interface CharacterChatState {
  characterId: string;
  characterName: string;
  role: string;
  avatarBg: string;
}


const STORAGE_KEY_PLAYER_POS = 'khaulah_last_player_position';

function loadSavedPlayerPos(): [number, number, number] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_KEY_PLAYER_POS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length === 3) {
          const [x, y, z] = parsed.map(Number);
          if (!isNaN(x) && !isNaN(y) && !isNaN(z) && y > -6 && y < 100) {
            return [x, Math.max(y, 0.4), z];
          }
        }
      }
    }
  } catch (e) {
    console.warn('Failed to load player position from localStorage:', e);
  }
  return [0, 0.8, -4]; // Lokasi awal default: Halaman Rumah Khaulah
}

let lastPosSaveTime = 0;
let pendingPlayerPos: [number, number, number] | null = null;

function savePlayerPos(pos: [number, number, number], force = false) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    // Hindari menyimpan posisi jika pemain sedang jatuh ke jurang (y < -2)
    if (pos[1] < -2) return;

    pendingPlayerPos = pos;
    const now = Date.now();

    if (force || now - lastPosSaveTime > 800) {
      lastPosSaveTime = now;
      localStorage.setItem(
        STORAGE_KEY_PLAYER_POS,
        JSON.stringify([
          Math.round(pos[0] * 100) / 100,
          Math.round(pos[1] * 100) / 100,
          Math.round(pos[2] * 100) / 100,
        ])
      );
    }
  } catch (e) {
    console.warn('Failed to save player position to localStorage:', e);
  }
}

// Simpan seketika jika pemain me-refresh atau menutup tab browser
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (pendingPlayerPos) savePlayerPos(pendingPlayerPos, true);
  });
  window.addEventListener('pagehide', () => {
    if (pendingPlayerPos) savePlayerPos(pendingPlayerPos, true);
  });
}

const STORAGE_KEY_TIME_OF_DAY = 'khaulah_time_of_day_state';

interface SavedTimeState {
  timeOfDay: TimeOfDay;
  timeOfDayTimeLeft: number;
}

function loadSavedTimeOfDay(): { timeOfDay: TimeOfDay; timeOfDayTimeLeft: number } {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_KEY_TIME_OF_DAY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedTimeState;
        const validTimes: TimeOfDay[] = ['subuh', 'siang', 'sore', 'malam'];
        if (parsed && validTimes.includes(parsed.timeOfDay)) {
          const maxDuration = TIME_OF_DAY_INTERVALS[parsed.timeOfDay];
          const timeLeft =
            typeof parsed.timeOfDayTimeLeft === 'number' &&
            parsed.timeOfDayTimeLeft > 0 &&
            parsed.timeOfDayTimeLeft <= maxDuration
              ? parsed.timeOfDayTimeLeft
              : maxDuration;

          return {
            timeOfDay: parsed.timeOfDay,
            timeOfDayTimeLeft: timeLeft,
          };
        }
      }
    }
  } catch (e) {
    console.warn('Failed to load timeOfDay from localStorage:', e);
  }
  return {
    timeOfDay: 'siang',
    timeOfDayTimeLeft: TIME_OF_DAY_INTERVALS['siang'],
  };
}

function saveTimeOfDay(timeOfDay: TimeOfDay, timeOfDayTimeLeft: number) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(
        STORAGE_KEY_TIME_OF_DAY,
        JSON.stringify({
          timeOfDay,
          timeOfDayTimeLeft: Math.round(timeOfDayTimeLeft * 10) / 10,
        })
      );
    }
  } catch (e) {
    console.warn('Failed to save timeOfDay from localStorage:', e);
  }
}

const initialTime = loadSavedTimeOfDay();
const initialPos = loadSavedPlayerPos();

let state: GameState = {
  playerPos: initialPos,
  joystickVector: { x: 0, y: 0 },
  isJumpPressed: false,
  activeAccessory: 'none',
  activePet: 'kitten',
  activeEmote: 'none',
  bubbleMessage: TIME_OF_DAY_MESSAGES[initialTime.timeOfDay],
  isClosetOpen: false,
  isWelcomeOpen: true,
  isMuted: false,
  isBgmActive: false,
  isShiftLock: false,
  respawnTrigger: 0,
  cameraDistance: 8.5,
  playerFacingAngle: 0,
  isPlayerMoving: false,
  isInWater: false,
  activeRide: 'none',
  speedBuffTimeLeft: 0,
  nearbyInteractable: null,
  activeDialog: null,
  timeOfDay: initialTime.timeOfDay,
  timeOfDayTimeLeft: initialTime.timeOfDayTimeLeft,
  isRidingScooter: false,
  scooterPos: [3.8, 0.2, -4.0],
  schoolQuest: {
    backpack: false,
    waterBottle: false,
    drawingBook: false,
    completed: false,
  },
  isMagicModalOpen: false,
  jumpBuffTimeLeft: 0,
  teleportTrigger: 0,
  teleportTarget: null,
  spawnedItems: [],
  isWishlistOpen: false,
  characterChatState: null,
  isKhalidFollowing: false,
  khalidPos: [-1.8, 0.2, -1.8],
};

// Sinkronkan tema audio awal sesuai waktu yang tersimpan di localStorage tanpa chime
soundManager.setTimeOfDay(initialTime.timeOfDay, false);

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export const gameStore = {
  getState: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  setJoystick: (vector: { x: number; y: number }) => {
    state = { ...state, joystickVector: vector };
    emitChange();
  },

  setJumpPressed: (pressed: boolean) => {
    if (pressed !== state.isJumpPressed) {
      state = { ...state, isJumpPressed: pressed };
      emitChange();
    }
  },

  setPlayerPos: (pos: [number, number, number]) => {
    state.playerPos = pos;
    savePlayerPos(pos);
  },

  setPlayerMotion: (pos: [number, number, number], facingAngle: number, isMoving: boolean, inWater = false) => {
    state.playerPos = pos;
    state.playerFacingAngle = facingAngle;
    state.isPlayerMoving = isMoving;
    if (state.isInWater !== inWater) {
      state = { ...state, isInWater: inWater };
      emitChange();
    }
    savePlayerPos(pos);
  },

  setIsInWater: (inWater: boolean) => {
    if (state.isInWater !== inWater) {
      state = { ...state, isInWater: inWater };
      emitChange();
    }
  },

  getLastSafePosition: (): [number, number, number] => {
    return loadSavedPlayerPos();
  },

  savePosition: (pos: [number, number, number], force = false) => {
    savePlayerPos(pos, force);
  },

  setAccessory: (acc: AccessoryType) => {
    state = { ...state, activeAccessory: acc };
    emitChange();
  },

  setPet: (pet: PetType) => {
    state = { ...state, activePet: pet };
    emitChange();
  },

  triggerEmote: (emote: EmoteType) => {
    state = { ...state, activeEmote: emote };
    emitChange();
    if (emote === 'dance' || emote === 'cheer') {
      confetti({
        particleCount: 30,
        spread: 70,
        origin: { y: 0.8 }
      });
    }
    setTimeout(() => {
      if (state.activeEmote === emote) {
        state = { ...state, activeEmote: 'none' };
        emitChange();
      }
    }, 2500);
  },

  setMessage: (msg: string) => {
    state = { ...state, bubbleMessage: msg };
    emitChange();
  },

  setClosetOpen: (open: boolean) => {
    state = { ...state, isClosetOpen: open };
    emitChange();
  },

  setWelcomeOpen: (open: boolean) => {
    state = { ...state, isWelcomeOpen: open };
    emitChange();
  },

  toggleSound: () => {
    const nextMuted = !state.isMuted;
    soundManager.setMuted(nextMuted);
    state = { ...state, isMuted: nextMuted };
    emitChange();
  },

  toggleBgm: () => {
    const active = soundManager.toggleBgm(state.timeOfDay);
    state = { ...state, isBgmActive: active };
    emitChange();
  },

  toggleShiftLock: () => {
    const nextVal = !state.isShiftLock;
    state = {
      ...state,
      isShiftLock: nextVal,
      bubbleMessage: nextVal ? 'Mode Kunci Kamera Aktif (Shift Lock) 🎯' : 'Mode Kamera Bebas 🔓',
    };
    emitChange();
  },

  triggerRespawn: () => {
    soundManager.playFamilyChord();
    state = {
      ...state,
      respawnTrigger: state.respawnTrigger + 1,
      bubbleMessage: 'Khaulah kembali ke Halaman Rumah! 🏡✨',
    };
    emitChange();
  },

  zoomCamera: (delta: number) => {
    const nextDist = Math.max(3.0, Math.min(22.0, state.cameraDistance + delta));
    state = { ...state, cameraDistance: nextDist };
    emitChange();
  },

  setNearbyInteractable: (item: { id: string; title: string; prompt: string } | null) => {
    // Only emit if changed to avoid unnecessary re-renders
    if (state.nearbyInteractable?.id !== item?.id || state.nearbyInteractable?.prompt !== item?.prompt) {
      state = { ...state, nearbyInteractable: item };
      emitChange();
    }
  },

  openDialog: (dialog: FamilyDialogData) => {
    soundManager.playFamilyChord();
    state = { ...state, activeDialog: dialog };
    emitChange();
  },

  closeDialog: () => {
    state = { ...state, activeDialog: null };
    emitChange();
  },

  executeDialogAction: (actionType: DialogActionType) => {
    if (actionType === 'high_five') {
      soundManager.playHighFive();
      soundManager.playKeyboardTyping();
      confetti({ particleCount: 40, spread: 75, origin: { y: 0.7 } });
      state = {
        ...state,
        bubbleMessage: 'Tos hebat sama Abi! "Khaulah anak cerdas & shalihah kebanggaan Abi!" 💻✨',
        activeDialog: null,
      };
      emitChange();
    } else if (actionType === 'take_snack') {
      soundManager.playBroomSweep();
      soundManager.playSnackBuff();
      confetti({ particleCount: 50, spread: 85, origin: { y: 0.7 } });
      state = {
        ...state,
        speedBuffTimeLeft: 20, // 20 seconds of speed buff
        bubbleMessage: 'Alhamdulillah! Ummi bercadar tersenyum bahagia. Bekal Cinta & Berkah Ummi memberi Khaulah energi super cepat! 🧕🧹⚡',
        activeDialog: null,
      };
      emitChange();
    } else if (actionType === 'play_drumband' || actionType === 'play_ball') {
      soundManager.playDrumband();
      confetti({ particleCount: 45, spread: 70, origin: { y: 0.75 } });
      state = {
        ...state,
        bubbleMessage: 'Ratatat! Adek Khalid dan Mbak Khaulah asyik memainkan irama drumband penuh semangat! 🥁🎶',
        activeDialog: null,
      };
      emitChange();
    } else if (actionType === 'play_toycar' || actionType === 'cuddle_baby') {
      soundManager.playToyCar();
      confetti({ particleCount: 35, spread: 65, origin: { y: 0.8 } });
      state = {
        ...state,
        bubbleMessage: 'Brum brum pip pip! Adek Faqih tertawa riang balapan mobilan bareng Mbak Khaulah! 🚗💨👶',
        activeDialog: null,
      };
      emitChange();
    } else if (actionType === 'feed_animal') {
      soundManager.playAnimalSound('bunny');
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
      state = {
        ...state,
        bubbleMessage: 'Nyam.. nyam! Kelinci dan domba senang sekali diberi makan oleh Khaulah! 🐰🥕🐑',
        activeDialog: null,
      };
      emitChange();
    } else if (actionType === 'buy_icecream') {
      soundManager.playSnackBuff();
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.8 } });
      state = {
        ...state,
        speedBuffTimeLeft: 20.0,
        bubbleMessage: 'Slurp! Gulali pelangi dan es krim lezat memberikan energi kilau bintang untuk Khaulah! 🍦🍭✨',
        activeDialog: null,
      };
      emitChange();
    } else if (actionType === 'scan_grocery') {
      soundManager.playCashRegister();
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
      state = {
        ...state,
        bubbleMessage: 'Tiiit! Kasir berbunyi: Belanjaan susu kotak dan kue Khaulah sudah beres! 🛒🍓✨',
        activeDialog: null,
      };
      emitChange();
    } else if (actionType === 'complete_quest') {
      gameStore.completeSchoolQuest();
    } else if (actionType === 'toggle_khalid_follow') {
      const nextFollow = !state.isKhalidFollowing;
      soundManager.playHighFive();
      confetti({ particleCount: 50, spread: 80, origin: { y: 0.75 } });
      state = {
        ...state,
        isKhalidFollowing: nextFollow,
        activeDialog: null,
        bubbleMessage: nextFollow
          ? 'Horeee! Adek Khalid ikut Mbak Khaulah berpetualang! "Ayo kita lari bareng Mbak!" 👦🏃‍♂️💨'
          : 'Adek Khalid istirahat di sini: "Nanti main lagi bareng Khalid ya Mbak Khaulah!" 👦🌸',
      };
      emitChange();
    }
  },

  toggleKhalidFollow: () => {
    const nextFollow = !state.isKhalidFollowing;
    soundManager.playHighFive();
    confetti({ particleCount: 45, spread: 75, origin: { y: 0.75 } });
    state = {
      ...state,
      isKhalidFollowing: nextFollow,
      bubbleMessage: nextFollow
        ? 'Horeee! Adek Khalid ikut Mbak Khaulah berpetualang! 👦🏃‍♂️💨'
        : 'Adek Khalid istirahat dulu di sini ya! 👦🌸',
    };
    emitChange();
  },

  setKhalidFollow: (following: boolean) => {
    if (state.isKhalidFollowing !== following) {
      state = { ...state, isKhalidFollowing: following };
      emitChange();
    }
  },

  setKhalidPos: (pos: [number, number, number]) => {
    state.khalidPos = pos;
  },

  setActiveRide: (ride: RideType) => {
    if (ride !== state.activeRide) {
      if (ride === 'slide') {
        soundManager.playSlideWhoosh();
      } else if (ride === 'swing') {
        soundManager.playSwingRide();
      } else if (ride === 'carousel' || ride === 'ferris') {
        soundManager.playCarnivalTune();
      } else if (ride === 'train') {
        soundManager.playTrainWhistle();
      } else if (ride === 'boat') {
        soundManager.playWaterSplash();
      } else if (ride === 'firetruck') {
        soundManager.playFireSiren();
      }
      state = {
        ...state,
        activeRide: ride,
        nearbyInteractable: ride !== 'none' ? null : state.nearbyInteractable,
      };
      emitChange();
    }
  },

  tickSpeedBuff: (dt: number) => {
    if (state.speedBuffTimeLeft > 0) {
      const remaining = Math.max(0, state.speedBuffTimeLeft - dt);
      state = { ...state, speedBuffTimeLeft: remaining };
      // Only emit if it expired
      if (remaining === 0) {
        emitChange();
      }
    }
  },

  addSpeedBuff: (seconds = 25) => {
    soundManager.playSnackBuff();
    state = {
      ...state,
      speedBuffTimeLeft: Math.max(state.speedBuffTimeLeft, seconds),
      bubbleMessage: 'Wuzzz! Khaulah lari secepat kilat pelangi! ⚡🏃‍♀️✨',
    };
    emitChange();
  },

  addJumpBuff: (seconds = 25) => {
    soundManager.playTrampoline();
    state = {
      ...state,
      jumpBuffTimeLeft: Math.max(state.jumpBuffTimeLeft, seconds),
      bubbleMessage: 'Boiiing! Khaulah bisa melompat setinggi awan! 🦘☁️✨',
    };
    emitChange();
  },

  tickJumpBuff: (dt: number) => {
    if (state.jumpBuffTimeLeft > 0) {
      const remaining = Math.max(0, state.jumpBuffTimeLeft - dt);
      state = { ...state, jumpBuffTimeLeft: remaining };
      if (remaining === 0) {
        emitChange();
      }
    }
  },

  // --- AI MAGIC & VOICE CONTROLLER ---
  openMagicModal: () => {
    soundManager.playMagicSpell();
    state = { ...state, isMagicModalOpen: true };
    emitChange();
  },

  closeMagicModal: () => {
    state = { ...state, isMagicModalOpen: false };
    emitChange();
  },

  openWishlistModal: () => {
    soundManager.playFamilyChord();
    state = { ...state, isWishlistOpen: true };
    emitChange();
  },

  closeWishlistModal: () => {
    state = { ...state, isWishlistOpen: false };
    emitChange();
  },

  openCharacterChat: (char: CharacterChatState) => {
    soundManager.playFamilyChord();
    state = { ...state, characterChatState: char, activeDialog: null };
    emitChange();
  },

  closeCharacterChat: () => {
    state = { ...state, characterChatState: null };
    emitChange();
  },

  teleportPlayerTo: (coords: [number, number, number], locationName?: string) => {
    soundManager.playMagicSpell();
    confetti({
      particleCount: 50,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#A78BFA', '#F472B6', '#38BDF8', '#FBBF24'],
    });
    state = {
      ...state,
      teleportTrigger: state.teleportTrigger + 1,
      teleportTarget: coords,
      bubbleMessage: locationName
        ? `Wuuush! Khaulah berpindah ke ${locationName}! ✨`
        : 'Wuuush! Khaulah berpindah tempat seketika! ✨',
    };
    emitChange();
  },

  teleportToPreset: (preset: string) => {
    const locations: Record<string, { coords: [number, number, number]; name: string }> = {
      rumah: { coords: [0, 0.8, -4], name: 'Halaman Rumah Khaulah 🏡' },
      tk: { coords: [0, 0.8, 38], name: 'TK Karang Tengah 1 Atap 🎒🏫' },
      pantai: { coords: [-50, 0.8, 35], name: 'Danau & Pantai Pasir Emas 🏖️' },
      karnaval: { coords: [55, 0.8, 35], name: 'Karnaval & Pasar Malam Ceria 🎡' },
      kebun: { coords: [-35, 0.8, -10], name: 'Taman Hewan & Kebun Buah 🐑🍎' },
      waterpark: { coords: [2, 0.8, -25], name: 'Waterpark Halaman Belakang 🌊' },
      obby: { coords: [0, 1.2, 58], name: 'Gerbang Jalur Pelangi ke Langit 🌈⭐' },
    };

    const target = locations[preset] || locations['rumah'];
    gameStore.teleportPlayerTo(target.coords, target.name);
  },

  spawnMagicItems: (type: 'balloon' | 'cake' | 'bubble' | 'star', options?: any) => {
    soundManager.playMagicSpell();
    const playerPos = state.playerPos;
    const now = Date.now();
    const newItems: SpawnedMagicItem[] = [];

    if (type === 'cake') {
      // Spawn a birthday cake right in front of player
      newItems.push({
        id: `cake_${now}`,
        type: 'cake',
        position: [playerPos[0], Math.max(0.4, playerPos[1]), playerPos[2] + 1.6],
        scale: 1.2,
        createdAt: now,
      });
    } else if (type === 'balloon') {
      const count = options?.count || 14;
      const colors = ['#FF6B8B', '#FFD166', '#06D6A0', '#118AB2', '#9D4EDD', '#FF9F1C'];
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const radius = 1.2 + Math.random() * 2.8;
        newItems.push({
          id: `balloon_${now}_${i}`,
          type: 'balloon',
          position: [
            playerPos[0] + Math.cos(angle) * radius,
            Math.max(0.6, playerPos[1] + 0.3 + Math.random() * 1.5),
            playerPos[2] + Math.sin(angle) * radius,
          ],
          color: colors[i % colors.length],
          scale: 0.8 + Math.random() * 0.4,
          createdAt: now,
        });
      }
    } else if (type === 'bubble') {
      const count = options?.count || 20;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.8 + Math.random() * 3.5;
        newItems.push({
          id: `bubble_${now}_${i}`,
          type: 'bubble',
          position: [
            playerPos[0] + Math.cos(angle) * radius,
            Math.max(0.5, playerPos[1] + Math.random() * 2.2),
            playerPos[2] + Math.sin(angle) * radius,
          ],
          scale: 0.4 + Math.random() * 0.6,
          createdAt: now,
        });
      }
    } else if (type === 'star') {
      const count = options?.count || 12;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const radius = 1.5 + Math.random() * 2.0;
        newItems.push({
          id: `star_${now}_${i}`,
          type: 'star',
          position: [
            playerPos[0] + Math.cos(angle) * radius,
            Math.max(0.7, playerPos[1] + 0.5 + Math.random() * 1.2),
            playerPos[2] + Math.sin(angle) * radius,
          ],
          scale: 0.7 + Math.random() * 0.5,
          createdAt: now,
        });
      }
    }

    state = {
      ...state,
      spawnedItems: [...state.spawnedItems.slice(-30), ...newItems],
    };
    emitChange();
  },

  removeSpawnedItem: (id: string) => {
    soundManager.playBalloonPop();
    state = {
      ...state,
      spawnedItems: state.spawnedItems.filter((item) => item.id !== id),
    };
    emitChange();
  },

  clearSpawnedItems: () => {
    state = { ...state, spawnedItems: [] };
    emitChange();
  },

  celebrateFireworks: () => {
    soundManager.playQuestComplete();
    const colors = ['#FF1493', '#00FFFF', '#FFD700', '#7B68EE', '#FF4500'];
    confetti({ particleCount: 60, spread: 100, origin: { x: 0.3, y: 0.6 }, colors });
    setTimeout(() => {
      confetti({ particleCount: 70, spread: 100, origin: { x: 0.7, y: 0.6 }, colors });
    }, 250);
    setTimeout(() => {
      confetti({ particleCount: 90, spread: 120, origin: { x: 0.5, y: 0.5 }, colors });
    }, 500);
    state = {
      ...state,
      bubbleMessage: 'Horeee! Pesta kembang api megah untuk Khaulah! 🎆🎉🥳',
    };
    emitChange();
  },

  // --- TIME OF DAY AUTOMATION & CONTROLS ---
  setTimeOfDay: (time: TimeOfDay) => {
    const timeLeft = TIME_OF_DAY_INTERVALS[time];
    state = {
      ...state,
      timeOfDay: time,
      timeOfDayTimeLeft: timeLeft,
      bubbleMessage: TIME_OF_DAY_MESSAGES[time],
    };
    saveTimeOfDay(time, timeLeft);
    soundManager.setTimeOfDay(time);
    emitChange();
  },

  tickTimeOfDay: (dt: number) => {
    const safeDt = Math.min(dt, 0.2); // Cegah lonjakan waktu jika window lag/unfocused
    const prevSec = Math.ceil(state.timeOfDayTimeLeft);
    const newTimeLeft = Math.max(0, state.timeOfDayTimeLeft - safeDt);

    if (newTimeLeft <= 0) {
      // Waktu interval habis, berganti otomatis ke fase berikutnya (Subuh ➔ Siang ➔ Sore ➔ Malam)
      const nextTime = TIME_OF_DAY_SEQUENCE[state.timeOfDay];
      gameStore.setTimeOfDay(nextTime);
    } else {
      state = {
        ...state,
        timeOfDayTimeLeft: newTimeLeft,
      };
      const newSec = Math.ceil(newTimeLeft);
      // Emit perubahan per detik dan simpan progres waktu ke localStorage
      if (prevSec !== newSec) {
        saveTimeOfDay(state.timeOfDay, newTimeLeft);
        emitChange();
      }
    }
  },

  cycleTimeOfDay: () => {
    gameStore.setTimeOfDay(TIME_OF_DAY_SEQUENCE[state.timeOfDay]);
  },

  // --- SCOOTER VEHICLE CONTROLS ---
  mountScooter: () => {
    soundManager.playBicycleBell();
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
    state = {
      ...state,
      isRidingScooter: true,
      nearbyInteractable: null,
      bubbleMessage: 'Ngebuuut! Khaulah naik Skuter Pink kesayangan! 🛴💨✨ (Tekan [E] untuk turun, [H] untuk bel)',
    };
    emitChange();
  },

  dismountScooter: () => {
    soundManager.playBicycleBell();
    const currentFeet = [state.playerPos[0], 0.2, state.playerPos[2]] as [number, number, number];
    state = {
      ...state,
      isRidingScooter: false,
      scooterPos: currentFeet,
      bubbleMessage: 'Khaulah memarkir skuter pink dengan rapi! 🛴🌸',
    };
    emitChange();
  },

  toggleScooter: () => {
    if (state.isRidingScooter) {
      gameStore.dismountScooter();
    } else {
      gameStore.mountScooter();
    }
  },

  ringBell: () => {
    soundManager.playBicycleBell();
    state = {
      ...state,
      bubbleMessage: 'Kring.. kring.. kring! Permisi, Khaulah mau lewat! 🔔🛴✨',
    };
    emitChange();
  },

  // --- SCHOOL PREP QUEST CONTROLS ---
  collectQuestItem: (item: 'backpack' | 'waterBottle' | 'drawingBook') => {
    if (state.schoolQuest[item]) return;
    soundManager.playQuestItemCollect();
    confetti({ particleCount: 35, spread: 70, origin: { y: 0.75 } });

    const newQuest = {
      ...state.schoolQuest,
      [item]: true,
    };

    const count = (newQuest.backpack ? 1 : 0) + (newQuest.waterBottle ? 1 : 0) + (newQuest.drawingBook ? 1 : 0);
    const itemNames = {
      backpack: 'Tas Ransel TK Karang Tengah 🎒',
      waterBottle: 'Botol Minum Lucu 🍼',
      drawingBook: 'Buku Gambar Ceria 🎨',
    };

    let msg = `Alhamdulillah! Khaulah menemukan ${itemNames[item]}! (${count}/3) ✨`;
    if (count === 3) {
      msg = 'Hore! Semua perlengkapan sekolah lengkap (3/3)! Ayo bawa ke Ibu Santi di gerbang TK! 🎒🎉';
    }

    state = {
      ...state,
      schoolQuest: newQuest,
      bubbleMessage: msg,
    };
    emitChange();
  },

  completeSchoolQuest: () => {
    if (state.schoolQuest.completed) return;
    soundManager.playQuestComplete();
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FF69B4', '#00FFFF', '#FF6347', '#7B68EE'],
    });

    state = {
      ...state,
      schoolQuest: {
        ...state.schoolQuest,
        completed: true,
      },
      activeDialog: null,
      bubbleMessage: 'MasyaAllah Khaulah murid teladan! Mendapat Piagam Siswa Teladan dari Ibu Santi! 🏅🎒🌸',
    };
    emitChange();
  },
};

export function useGameStore<T>(selector: (state: GameState) => T): T {
  return useSyncExternalStore(
    gameStore.subscribe,
    () => selector(gameStore.getState())
  );
}
