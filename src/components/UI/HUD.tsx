import React from 'react';
import { useGameStore, gameStore } from '../../state/useGameStore';
import { Star, Shirt, Volume2, VolumeX, Music, HelpCircle, Heart, Flag } from 'lucide-react';

export const HUD: React.FC = () => {
  const stars = useGameStore((s) => s.stars);
  const totalStars = useGameStore((s) => s.totalStars);
  const bubbleMessage = useGameStore((s) => s.bubbleMessage);
  const isMuted = useGameStore((s) => s.isMuted);
  const isBgmActive = useGameStore((s) => s.isBgmActive);
  const checkpointIndex = useGameStore((s) => s.checkpointIndex);
  const isShiftLock = useGameStore((s) => s.isShiftLock);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Roblox Shift Lock Center Reticle */}
      {isShiftLock && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-white/90 bg-indigo-900/30 backdrop-blur-xs flex items-center justify-center shadow-lg animate-pulse-gentle">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-md" />
          </div>
        </div>
      )}
      {/* Top Bar */}
      <div className="flex items-start justify-between w-full">
        {/* Left: Star Counter & Avatar Banner */}
        <div className="flex items-center gap-3">
          {/* Avatar Icon */}
          <div className="relative pointer-events-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 p-0.5 shadow-lg border-2 border-white flex items-center justify-center overflow-hidden animate-pulse-gentle">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Background sky */}
                <rect width="100" height="100" fill="#E0F2FE" />
                {/* Blue School Vest Torso */}
                <path d="M 18 78 L 24 100 L 76 100 L 82 78 Z" fill="#1E88E5" />
                {/* White Inner Shirt Neck */}
                <polygon points="38,78 50,90 62,78" fill="#FFFFFF" />
                {/* 3 Blue Buttons */}
                <circle cx="50" cy="85" r="2.2" fill="#0D47A1" />
                <circle cx="50" cy="92" r="2.2" fill="#0D47A1" />
                {/* School Green Badge */}
                <rect x="60" y="82" width="8" height="6" rx="1" fill="#00897B" />
                {/* White Hijab Shoulders Drape */}
                <path d="M 14 62 Q 50 82 86 62 Q 90 85 50 90 Q 10 85 14 62 Z" fill="#FFFFFF" />
                {/* White Hijab Head */}
                <ellipse cx="50" cy="44" rx="34" ry="35" fill="#FFFFFF" />
                {/* Black Inner Ciput */}
                <ellipse cx="50" cy="36" rx="22" ry="12" fill="#1F1F24" />
                {/* Face sawo matang manis */}
                <ellipse cx="50" cy="48" rx="20" ry="20" fill="#F2C49B" />
                {/* Eyes */}
                <ellipse cx="42" cy="46" rx="3.5" ry="4" fill="#1A1520" />
                <circle cx="43.5" cy="44.5" r="1.2" fill="#FFFFFF" />
                <ellipse cx="58" cy="46" rx="3.5" ry="4" fill="#1A1520" />
                <circle cx="59.5" cy="44.5" r="1.2" fill="#FFFFFF" />
                {/* Eyebrows */}
                <path d="M 37 40 Q 42 37 47 40" stroke="#2B2024" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                <path d="M 53 40 Q 58 37 63 40" stroke="#2B2024" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                {/* Blushing Cheeks */}
                <circle cx="36" cy="52" r="3.5" fill="#F48FB1" opacity="0.8" />
                <circle cx="64" cy="52" r="3.5" fill="#F48FB1" opacity="0.8" />
                {/* Sweet Open Smile with Teeth */}
                <path d="M 43 54 Q 50 64 57 54 Z" fill="#C2185B" />
                <path d="M 44.5 54 Q 50 58 55.5 54 Z" fill="#FFFFFF" />
              </svg>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-yellow-950 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border border-white shadow">
              Khaulah (6th)
            </div>
          </div>

          {/* Star Counter Pill */}
          <div className="pointer-events-auto bg-white/80 backdrop-blur-md px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border-2 border-yellow-300 shadow-md flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center shadow-inner">
              <Star className="w-5 h-5 text-yellow-950 fill-yellow-100 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Bintang Ajaib</span>
              <span className="text-lg sm:text-xl font-bubble font-bold text-pink-600 leading-tight">
                {stars} <span className="text-gray-400 text-sm font-medium">/ {totalStars}</span>
              </span>
            </div>
          </div>

          {/* Checkpoint Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-2 rounded-full border border-purple-200 text-purple-700 text-xs font-bold shadow-sm">
            <Flag className="w-4 h-4 text-purple-500 fill-purple-300" />
            <span>Zona {checkpointIndex + 1}</span>
          </div>
        </div>

        {/* Right: Menu & Audio Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Background Music Toggle */}
          <button
            onClick={() => gameStore.toggleBgm()}
            title={isBgmActive ? 'Matikan Musik' : 'Nyalakan Musik Marimba'}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center border-2 border-white shadow-md active:scale-90 transition-transform ${
              isBgmActive ? 'bg-pink-500 text-white' : 'bg-white/80 text-gray-600'
            }`}
          >
            <Music className="w-5 h-5" />
          </button>

          {/* Mute SFX Toggle */}
          <button
            onClick={() => gameStore.toggleSound()}
            title={isMuted ? 'Nyalakan Efek Suara' : 'Matikan Suara'}
            className="w-11 h-11 rounded-2xl bg-white/80 text-gray-700 flex items-center justify-center border-2 border-white shadow-md active:scale-90 transition-transform"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5 text-emerald-600" />}
          </button>

          {/* Wardrobe / Closet Button */}
          <button
            onClick={() => gameStore.setClosetOpen(true)}
            className="px-3 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bubble font-bold text-sm border-2 border-white shadow-lg flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <Shirt className="w-4 h-4" />
            <span className="hidden sm:inline">Lemari</span>
          </button>

          {/* Help Button */}
          <button
            onClick={() => gameStore.setWelcomeOpen(true)}
            className="w-11 h-11 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center border-2 border-white shadow-md active:scale-90 transition-transform font-bold"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center: Friendly Bubble Speech Prompts for Khaulah */}
      <div className="w-full flex justify-center items-center pb-20 sm:pb-8">
        <div className="bg-white/90 backdrop-blur-md px-5 py-2.5 sm:px-7 sm:py-3 rounded-full border-2 border-pink-300 shadow-xl max-w-lg text-center transform transition-all animate-bounce-slow flex items-center gap-2.5">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-400 animate-pulse shrink-0" />
          <p className="text-gray-800 font-bubble text-sm sm:text-base font-semibold leading-snug">
            {bubbleMessage}
          </p>
        </div>
      </div>
    </div>
  );
};
