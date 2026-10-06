import type { GameState } from './useGameStore';

export function isGameInputBlocked(state: GameState): boolean {
  return state.isWelcomeOpen || state.isClosetOpen || state.isMagicModalOpen ||
    state.isWishlistOpen || !!state.characterChatState || !!state.activeDialog || state.isDoorTransitioning;
}

export function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement &&
    (target.isContentEditable || !!target.closest('input, textarea, select'));
}
