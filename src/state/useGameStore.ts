import { useSyncExternalStore } from 'react';
import confetti from 'canvas-confetti';
import { soundManager } from '../sound/audioManager';

export type AccessoryType = 'none' | 'bunny_ears' | 'fairy_wings' | 'princess_crown' | 'cat_ears' | 'star_halo';
export type PetType = 'none' | 'puppy' | 'kitten' | 'fairy';
export type EmoteType = 'none' | 'wave' | 'dance' | 'cheer';

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
}

const CHECKPOINTS: [number, number, number][] = [
  [0, 1, 0],         // Checkpoint 0: Taman Awal (Spawn)
  [0, 3, 24],        // Checkpoint 1: Awal Jalur Balok Pelangi
  [0, 6, 48],        // Checkpoint 2: Puncak Awan Gula-Gula
  [0, 10, 75],       // Checkpoint 3: Kastil Bintang Khaulah
];

let state: GameState = {
  stars: 0,
  totalStars: 25,
  collectedStarIds: [],
  checkpointIndex: 0,
  checkpointPosition: [0, 1, 0],
  playerPos: [0, 1, 0],
  joystickVector: { x: 0, y: 0 },
  isJumpPressed: false,
  activeAccessory: 'none',
  activePet: 'kitten',
  activeEmote: 'none',
  bubbleMessage: 'Halo Khaulah! Ayo kumpulkan semua bintang pelangi! ✨',
  isClosetOpen: false,
  isWelcomeOpen: true,
  isMuted: false,
  isBgmActive: false,
  isShiftLock: false,
  respawnTrigger: 0,
  cameraDistance: 7.5,
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
    state = { ...state, playerPos: pos };
    // Not emitting change on high-frequency playerPos to avoid React rerender spam;
    // playerPos is read directly via getState() in 3D frame loops.
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
  }
};

export function useGameStore<T>(selector: (state: GameState) => T): T {
  return useSyncExternalStore(
    gameStore.subscribe,
    () => selector(gameStore.getState())
  );
}
