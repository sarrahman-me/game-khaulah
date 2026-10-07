import React, { useState, useEffect } from 'react';
import { useGameStore, gameStore, STICKER_CATALOG } from '../../state/useGameStore';
import { DAILY_MISSIONS, useDailyMissions, refreshDailyMissions } from '../../state/dailyMissions';
import { soundManager } from '../../sound/audioManager';
import { X, Award, Sparkles, Lock, CheckCircle2 } from 'lucide-react';

export const StickerBookModal: React.FC = () => {
  const isStickerModalOpen = useGameStore((s) => s.isStickerModalOpen);
  const unlockedStickers = useGameStore((s) => s.unlockedStickers);
  const daily = useDailyMissions();
  useEffect(() => {
    refreshDailyMissions();
    const timer = setInterval(refreshDailyMissions, 30000);
    return () => clearInterval(timer);
  }, []);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  if (!isStickerModalOpen) return null;

  const totalStickers = STICKER_CATALOG.length;
  const unlockedCount = STICKER_CATALOG.filter((s) => unlockedStickers[s.id]).length;
  const progressPercent = Math.round((unlockedCount / totalStickers) * 100);

  const categories = ['Semua', ...Array.from(new Set(STICKER_CATALOG.map((s) => s.category)))];

  const displayedStickers =
    selectedCategory === 'Semua'
      ? STICKER_CATALOG
      : STICKER_CATALOG.filter((s) => s.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-gradient-to-b from-amber-50 via-pink-50 to-purple-50 w-full max-w-4xl max-h-[92vh] rounded-3xl border-4 border-yellow-300 shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 p-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-inner border border-white/30">
              📖
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bubble font-bold tracking-wide flex items-center gap-2">
                Buku Album Stiker Khaulah
                <span className="text-xs font-bold bg-yellow-300 text-yellow-950 px-2.5 py-0.5 rounded-full shadow">
                  {unlockedCount} / {totalStickers}
                </span>
              </h2>
              <p className="text-xs text-pink-100 font-medium">
                Koleksi stiker ajaib dengan menjelajahi dan mencoba semua aktivitas di pulau! ✨
              </p>
            </div>
          </div>
          <button
            onClick={() => gameStore.closeStickerModal()}
            className="w-9 h-9 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center border-2 border-white shadow-md active:scale-90 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-3 bg-amber-100 text-amber-950 text-sm">
          <p className="font-bold mb-2">Misi Hari Ini · {daily.completed.length}/3</p>
          <div className="flex flex-wrap gap-2">
            {DAILY_MISSIONS.map((mission) => <span key={mission.id} className="rounded-xl bg-white px-3 py-1">
              {daily.completed.includes(mission.id) ? '✅' : mission.icon} {mission.label}
            </span>)}
          </div>
          {daily.completed.length === 3 && <p className="mt-2 font-bold">🌟 Hebat! Semua misi hari ini selesai!</p>}
        </div>
        {/* Progress Bar Banner */}
        <div className="bg-white/90 px-4 py-3 border-b border-pink-100 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Award className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="flex-1 sm:w-64">
              <div className="flex justify-between text-xs font-bubble font-bold text-gray-700 mb-1">
                <span>Progres Koleksi</span>
                <span>{progressPercent}% Lengkap</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  soundManager.playHighFive();
                  setSelectedCategory(cat);
                }}
                className={`text-xs font-bubble font-bold px-3 py-1 rounded-full whitespace-nowrap transition-all shadow-sm ${
                  selectedCategory === cat
                    ? 'bg-rose-500 text-white shadow-rose-200 scale-105'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-pink-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 100% Congratulations Banner */}
        {unlockedCount === totalStickers && (
          <div className="bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-300 px-4 py-2 border-b-2 border-yellow-400 flex items-center justify-center gap-2 text-yellow-950 font-bubble font-bold text-xs sm:text-sm animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>MasyaAllah Tabarakallah! Semua 16 Stiker Pulau Impian Terkumpul Lengkap! 🏆👑🎉</span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
        )}

        {/* Grid of Sticker Cards */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {displayedStickers.map((sticker) => {
              const isUnlocked = !!unlockedStickers[sticker.id];

              return (
                <div
                  key={sticker.id}
                  className={`relative rounded-3xl p-3.5 flex flex-col items-center text-center transition-all duration-300 select-none ${
                    isUnlocked
                      ? 'bg-gradient-to-b from-white via-amber-50/50 to-pink-50 border-3 border-amber-300 shadow-md hover:shadow-xl hover:-translate-y-1'
                      : 'bg-white/60 border-2 border-dashed border-gray-300 opacity-75 shadow-inner'
                  }`}
                >
                  {/* Category Pill */}
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full mb-1.5 ${
                      isUnlocked
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {sticker.category}
                  </span>

                  {/* Icon Circle */}
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-inner border-2 my-1 transition-transform ${
                      isUnlocked
                        ? 'bg-gradient-to-tr from-yellow-100 via-pink-100 to-sky-100 border-white hover:scale-110 rotate-1'
                        : 'bg-gray-100 border-gray-200 grayscale opacity-40'
                    }`}
                  >
                    {isUnlocked ? sticker.icon : <Lock className="w-6 h-6 text-gray-400" />}
                  </div>

                  {/* Title */}
                  <h4
                    className={`text-xs sm:text-sm font-bubble font-bold mt-1 line-clamp-1 ${
                      isUnlocked ? 'text-purple-950' : 'text-gray-500'
                    }`}
                  >
                    {sticker.title}
                  </h4>

                  {/* Description / Hint */}
                  <p className="text-[10px] sm:text-[11px] text-gray-600 font-bubble mt-1 leading-snug line-clamp-2">
                    {isUnlocked ? sticker.description : `Petunjuk: ${sticker.description}`}
                  </p>

                  {/* Status Badge */}
                  <div className="mt-2.5">
                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shadow-xs">
                        <CheckCircle2 className="w-3 h-3" /> Terbuka! ✨
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        <Lock className="w-2.5 h-2.5" /> Belum Terbuka
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
