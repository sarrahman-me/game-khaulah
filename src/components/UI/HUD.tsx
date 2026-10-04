import React from 'react';
import { useGameStore, gameStore } from '../../state/useGameStore';
import { Star, Shirt, Volume2, VolumeX, Music, HelpCircle, Heart, Flag, Sparkles, X } from 'lucide-react';

const ZONE_NAMES = [
  'Rumah Hangat Khaulah 🏡',
  'TK Karang Tengah 1 Atap 🎒',
  'Puncak Awan Gula-Gula ☁️',
  'Istana Bintang Khaulah 🏰',
];

export const HUD: React.FC = () => {
  const stars = useGameStore((s) => s.stars);
  const totalStars = useGameStore((s) => s.totalStars);
  const bubbleMessage = useGameStore((s) => s.bubbleMessage);
  const isMuted = useGameStore((s) => s.isMuted);
  const isBgmActive = useGameStore((s) => s.isBgmActive);
  const checkpointIndex = useGameStore((s) => s.checkpointIndex);
  const isShiftLock = useGameStore((s) => s.isShiftLock);
  const speedBuffTimeLeft = useGameStore((s) => s.speedBuffTimeLeft);
  const nearbyInteractable = useGameStore((s) => s.nearbyInteractable);
  const activeDialog = useGameStore((s) => s.activeDialog);
  const activeRide = useGameStore((s) => s.activeRide);

  const handleInteract = () => {
    if (!nearbyInteractable) return;
    const id = nearbyInteractable.id;
    if (id === 'abi') {
      gameStore.openDialog({
        speaker: 'Abi',
        role: 'Ayah Hebat',
        avatarBg: 'bg-blue-600',
        text: 'Assalamu\'alaikum Khaulah sayang! Semangat belajar dan bermain di TK Karang Tengah ya. Khaulah adalah anak shalihah kebanggaan Abi!',
        actionText: '✋ Tos Hebat sama Abi!',
        actionType: 'high_five',
      });
    } else if (id === 'ummi') {
      gameStore.openDialog({
        speaker: 'Ummi',
        role: 'Ibu Tercinta',
        avatarBg: 'bg-rose-500',
        text: 'Khaulah sayang, Ummi sudah siapkan kue pelangi lezat untuk bekal Khaulah. Habiskan ya sayang, supaya Khaulah bertenaga dan lari super cepat!',
        actionText: '🍰 Ambil Bekal Cinta Ummi (+Speed Boost!)',
        actionType: 'take_snack',
      });
    } else if (id === 'khalid') {
      gameStore.openDialog({
        speaker: 'Adek Khalid',
        role: 'Adik Periang',
        avatarBg: 'bg-amber-500',
        text: 'Mbak Khaulah! Ayo main bola bareng Khalid! Nanti kita main ayunan bareng di TK ya!',
        actionText: '⚽ Main Bola Bersama Khalid!',
        actionType: 'play_ball',
      });
    } else if (id === 'faqih') {
      gameStore.openDialog({
        speaker: 'Adek Faqih',
        role: 'Adik Bayi Lucu',
        avatarBg: 'bg-emerald-500',
        text: 'Ciluk... BAAA! Adek Faqih tersenyum gembira sambil menggoyangkan mainan kerincingan melihat Mbak Khaulah!',
        actionText: '👶 Peluk Sayang Adek Faqih!',
        actionType: 'cuddle_baby',
      });
    } else if (id === 'slide') {
      gameStore.setActiveRide('slide');
    } else if (id === 'swing') {
      gameStore.setActiveRide('swing');
    }
  };

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
                <rect width="100" height="100" fill="#E0F2FE" />
                <path d="M 18 78 L 24 100 L 76 100 L 82 78 Z" fill="#1E88E5" />
                <polygon points="38,78 50,90 62,78" fill="#FFFFFF" />
                <circle cx="50" cy="85" r="2.2" fill="#0D47A1" />
                <circle cx="50" cy="92" r="2.2" fill="#0D47A1" />
                <rect x="60" y="82" width="8" height="6" rx="1" fill="#00897B" />
                <path d="M 14 62 Q 50 82 86 62 Q 90 85 50 90 Q 10 85 14 62 Z" fill="#FFFFFF" />
                <ellipse cx="50" cy="44" rx="34" ry="35" fill="#FFFFFF" />
                <ellipse cx="50" cy="36" rx="22" ry="12" fill="#1F1F24" />
                <ellipse cx="50" cy="48" rx="20" ry="20" fill="#F2C49B" />
                <ellipse cx="42" cy="46" rx="3.5" ry="4" fill="#1A1520" />
                <circle cx="43.5" cy="44.5" r="1.2" fill="#FFFFFF" />
                <ellipse cx="58" cy="46" rx="3.5" ry="4" fill="#1A1520" />
                <circle cx="59.5" cy="44.5" r="1.2" fill="#FFFFFF" />
                <path d="M 37 40 Q 42 37 47 40" stroke="#2B2024" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                <path d="M 53 40 Q 58 37 63 40" stroke="#2B2024" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                <circle cx="36" cy="52" r="3.5" fill="#F48FB1" opacity="0.8" />
                <circle cx="64" cy="52" r="3.5" fill="#F48FB1" opacity="0.8" />
                <path d="M 43 54 Q 50 64 57 54 Z" fill="#C2185B" />
                <path d="M 44.5 54 Q 50 58 55.5 54 Z" fill="#FFFFFF" />
              </svg>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-yellow-950 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border border-white shadow">
              Khaulah (6th)
            </div>
          </div>

          {/* Star Counter Pill */}
          <div className="pointer-events-auto bg-white/85 backdrop-blur-md px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border-2 border-yellow-300 shadow-md flex items-center gap-2.5">
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

          {/* Checkpoint / Zone Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 bg-white/85 backdrop-blur-md px-3.5 py-2 rounded-full border border-purple-200 text-purple-800 text-xs font-bold shadow-sm">
            <Flag className="w-4 h-4 text-purple-500 fill-purple-300" />
            <span>{ZONE_NAMES[checkpointIndex] || `Zona ${checkpointIndex + 1}`}</span>
          </div>

          {/* Speed Buff Pill (Bekal Cinta Ummi) */}
          {speedBuffTimeLeft > 0 && (
            <div className="pointer-events-auto bg-gradient-to-r from-amber-400 to-pink-500 text-white px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-pulse border-2 border-white text-xs font-bubble font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Bekal Ummi ({Math.ceil(speedBuffTimeLeft)}s ⚡)</span>
            </div>
          )}
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

      {/* Bottom Center: Interactive Prompts & Speech Bubbles */}
      <div className="w-full flex flex-col items-center gap-3 pb-24 sm:pb-8">
        {/* Swing Exit Prompt */}
        {activeRide === 'swing' && (
          <div className="pointer-events-auto bg-amber-400 text-amber-950 px-5 py-2 rounded-full font-bubble font-bold text-sm sm:text-base border-2 border-white shadow-xl animate-bounce">
            Tekan [SPASI] untuk Lompat Turun dari Ayunan! 🎡
          </div>
        )}

        {/* Nearby Interactable Action Button */}
        {nearbyInteractable && activeRide === 'none' && !activeDialog && (
          <button
            onClick={handleInteract}
            className="pointer-events-auto bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-bubble font-bold text-sm sm:text-base border-3 border-white shadow-2xl active:scale-95 transition-transform flex items-center gap-2 animate-bounce-slow"
          >
            <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
            <span>{nearbyInteractable.prompt}</span>
          </button>
        )}

        {/* Friendly Bubble Speech */}
        <div className="bg-white/90 backdrop-blur-md px-5 py-2 sm:px-7 sm:py-2.5 rounded-full border-2 border-pink-300 shadow-xl max-w-lg text-center transform transition-all flex items-center gap-2.5">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-400 animate-pulse shrink-0" />
          <p className="text-gray-800 font-bubble text-sm sm:text-base font-semibold leading-snug">
            {bubbleMessage}
          </p>
        </div>
      </div>

      {/* ============================================================== */}
      {/* FAMILY DIALOG MODAL (Abi, Ummi, Adek Khalid, Adek Faqih)      */}
      {/* ============================================================== */}
      {activeDialog && (
        <div className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center p-4 bg-purple-950/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-gradient-to-b from-sky-50 via-pink-50 to-white w-full max-w-md rounded-3xl border-4 border-yellow-300 shadow-2xl p-6 relative text-center">
            {/* Close Button */}
            <button
              onClick={() => gameStore.closeDialog()}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center border-2 border-white shadow-md active:scale-90 transition-transform"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Avatar Badge */}
            <div className={`w-20 h-20 mx-auto -mt-14 rounded-3xl ${activeDialog.avatarBg} border-4 border-white shadow-xl flex items-center justify-center text-3xl`}>
              {activeDialog.speaker === 'Abi' && '👨‍👧'}
              {activeDialog.speaker === 'Ummi' && '🧕💕'}
              {activeDialog.speaker === 'Adek Khalid' && '👦⚽'}
              {activeDialog.speaker === 'Adek Faqih' && '👶🍼'}
            </div>

            {/* Speaker Name & Role */}
            <h2 className="text-2xl font-bubble font-bold text-purple-900 mt-2">
              {activeDialog.speaker}
            </h2>
            <span className="inline-block bg-pink-100 text-pink-700 text-xs font-bold px-3 py-0.5 rounded-full mt-0.5">
              {activeDialog.role}
            </span>

            {/* Dialogue Message */}
            <p className="text-gray-700 font-bubble text-base sm:text-lg font-medium mt-4 px-2 leading-relaxed bg-white/70 rounded-2xl p-4 border border-pink-100 shadow-inner">
              "{activeDialog.text}"
            </p>

            {/* Special Action Button */}
            {activeDialog.actionText && activeDialog.actionType && (
              <button
                onClick={() => gameStore.executeDialogAction(activeDialog.actionType!)}
                className="w-full mt-5 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-bubble font-bold text-base shadow-lg hover:shadow-xl border-2 border-white active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>{activeDialog.actionText}</span>
              </button>
            )}

            {/* Dismiss Button */}
            <button
              onClick={() => gameStore.closeDialog()}
              className="mt-3 text-xs text-gray-500 hover:text-gray-700 font-semibold"
            >
              Lanjut Bermain ✨
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
