import { useSyncExternalStore } from 'react';
import confetti from 'canvas-confetti';
import { soundManager } from '../sound/audioManager';

export type AccessoryType = 'none' | 'bunny_ears' | 'fairy_wings' | 'princess_crown' | 'cat_ears' | 'star_halo';
export type PetType = 'none' | 'puppy' | 'kitten' | 'fairy';
export type EmoteType = 'none' | 'wave' | 'dance' | 'cheer';

export interface FamilyDialogData {
  speaker: string;
  role: string;
  avatarBg: string;
  text: string;
  actionText?: string;
  actionType?: 'high_five' | 'take_snack' | 'play_ball' | 'cuddle_baby' | 'play_drumband' | 'play_toycar';
}

export interface GameState {
  stars: number;
  totalStars: number;
  collectedStarIds: string[];
  checkpointIndex: number;
  checkpointPosition: [number, number, number];
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
  // New Family & Playground features
  activeRide: 'none' | 'slide' | 'swing';
  speedBuffTimeLeft: number;
  nearbyInteractable: { id: string; title: string; prompt: string } | null;
  activeDialog: FamilyDialogData | null;
}

const CHECKPOINTS: [number, number, number][] = [
  [0, 0.8, -4],      // Checkpoint 0: Halaman Rumah Khaulah bersama Abi & Ummi
  [0, 0.8, 28],      // Checkpoint 1: Gerbang TK Karang Tengah 1 Atap
  [0, 6.0, 65],      // Checkpoint 2: Puncak Awan Gula-Gula Skyway
  [0, 10.0, 95],     // Checkpoint 3: Kastil Bintang Khaulah
];

let state: GameState = {
  stars: 0,
  totalStars: 25,
  collectedStarIds: [],
  checkpointIndex: 0,
  checkpointPosition: [0, 0.8, -4],
  playerPos: [0, 0.8, -4],
  joystickVector: { x: 0, y: 0 },
  isJumpPressed: false,
  activeAccessory: 'none',
  activePet: 'kitten',
  activeEmote: 'none',
  bubbleMessage: 'Selamat pagi Khaulah! Ayo sapa Abi, Ummi, dan berangkat ke TK Karang Tengah! 🎒🏡',
  isClosetOpen: false,
  isWelcomeOpen: true,
  isMuted: false,
  isBgmActive: false,
  isShiftLock: false,
  respawnTrigger: 0,
  cameraDistance: 7.5,
  playerFacingAngle: 0,
  isPlayerMoving: false,
  activeRide: 'none',
  speedBuffTimeLeft: 0,
  nearbyInteractable: null,
  activeDialog: null,
};

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
  },

  setPlayerMotion: (pos: [number, number, number], facingAngle: number, isMoving: boolean) => {
    state.playerPos = pos;
    state.playerFacingAngle = facingAngle;
    state.isPlayerMoving = isMoving;
  },

  collectStar: (starId: string) => {
    if (state.collectedStarIds.includes(starId)) return;
    const newCount = state.stars + 1;
    soundManager.playStarCollect();
    
    // Trigger festive mini confetti!
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#FF69B4', '#FFD700', '#00FFFF', '#FF6347', '#7B68EE']
    });

    let msg = `Hore! Khaulah dapat bintang ke-${newCount}! 🌟`;
    if (newCount === 5) {
      msg = 'Keren banget! 5 bintang terkumpul! 🎉';
    } else if (newCount === 10) {
      msg = 'Hebat Khaulah! Bando dan sayap baru terbuka di lemari! 👑';
    } else if (newCount >= state.totalStars) {
      msg = 'LUAR BIASA! Khaulah berhasil mengumpulkan SEMUA bintang! 🏆🌈';
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.6 }
      });
    }

    state = {
      ...state,
      stars: newCount,
      collectedStarIds: [...state.collectedStarIds, starId],
      bubbleMessage: msg
    };
    emitChange();
  },

  reachCheckpoint: (index: number) => {
    if (index > state.checkpointIndex) {
      soundManager.playCheckpoint();
      confetti({
        particleCount: 40,
        spread: 80,
        origin: { y: 0.7 }
      });
      state = {
        ...state,
        checkpointIndex: index,
        checkpointPosition: CHECKPOINTS[index] || state.checkpointPosition,
        bubbleMessage: `Checkpoint ${index + 1} tercapai! Hebat Khaulah! 🚩`
      };
      emitChange();
    }
  },

  resetToCheckpoint: () => {
    // Respawn smoothly without penalty
    return state.checkpointPosition;
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
    const active = soundManager.toggleBgm();
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
    soundManager.playCheckpoint();
    state = {
      ...state,
      respawnTrigger: state.respawnTrigger + 1,
      bubbleMessage: 'Kembali ke checkpoint aman! 🚩✨',
    };
    emitChange();
  },

  zoomCamera: (delta: number) => {
    const nextDist = Math.max(3.0, Math.min(15.0, state.cameraDistance + delta));
    state = { ...state, cameraDistance: nextDist };
    emitChange();
  },

  setNearbyInteractable: (item: { id: string; title: string; prompt: string } | null) => {
    // Only emit if changed to avoid unnecessary re-renders
    if (state.nearbyInteractable?.id !== item?.id) {
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

  executeDialogAction: (actionType: 'high_five' | 'take_snack' | 'play_ball' | 'cuddle_baby' | 'play_drumband' | 'play_toycar') => {
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
    }
  },

  setActiveRide: (ride: 'none' | 'slide' | 'swing') => {
    if (ride !== state.activeRide) {
      if (ride === 'slide') {
        soundManager.playSlideWhoosh();
      } else if (ride === 'swing') {
        soundManager.playSwingRide();
      }
      state = { ...state, activeRide: ride };
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
  }
};

export function useGameStore<T>(selector: (state: GameState) => T): T {
  return useSyncExternalStore(
    gameStore.subscribe,
    () => selector(gameStore.getState())
  );
}
