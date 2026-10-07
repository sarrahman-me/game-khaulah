import { useSyncExternalStore } from 'react';

export const DAILY_MISSIONS = [
  { id: 'gol', label: 'Cetak satu gol di lapangan TK', icon: '⚽' },
  { id: 'sawah', label: 'Panen padi di Desa Sawah', icon: '🌾' },
  { id: 'foto', label: 'Ambil satu foto kenangan', icon: '📸' },
] as const;
const STORAGE_KEY = 'khaulah_daily_missions';
const listeners = new Set<() => void>();
export function dailyDate(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
interface DailyProgress { date: string; completed: string[] }
function load(): DailyProgress {
  const fresh = { date: dailyDate(), completed: [] as string[] };
  try {
    if (typeof localStorage === 'undefined') return fresh;
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved?.date === fresh.date && Array.isArray(saved.completed)) {
      fresh.completed = DAILY_MISSIONS.filter(({ id }) => saved.completed.includes(id)).map(({ id }) => id);
    }
  } catch { /* A damaged or unavailable save should never stop the game. */ }
  return fresh;
}
let progress = load();
function notify() { for (const listener of listeners) listener(); }
export function refreshDailyMissions(): void {
  if (progress.date === dailyDate()) return;
  progress = { date: dailyDate(), completed: [] };
  notify();
}
export function recordDailyActivity(id: string): void {
  refreshDailyMissions();
  if (!DAILY_MISSIONS.some((mission) => mission.id === id) || progress.completed.includes(id)) return;
  progress = { ...progress, completed: [...progress.completed, id] };
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { /* Keep in-memory progress. */ }
  notify();
}
export function getDailyMissionProgress(): DailyProgress { return progress; }
export function useDailyMissions(): DailyProgress {
  return useSyncExternalStore((listener) => { listeners.add(listener); return () => { listeners.delete(listener); }; }, getDailyMissionProgress);
}
