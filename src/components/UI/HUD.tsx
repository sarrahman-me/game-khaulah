import React from 'react';
import { useGameStore, gameStore, TIME_OF_DAY_CONFIG } from '../../state/useGameStore';
import { soundManager } from '../../sound/audioManager';
import {
  Shirt,
  Volume2,
  VolumeX,
  Music,
  HelpCircle,
  Heart,
  Sparkles,
  X,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Bell,
} from 'lucide-react';
import { MagicWandModal } from './MagicWandModal';
import { CharacterChatModal } from './CharacterChatModal';
import { WishlistModal } from './WishlistModal';
import { FAMILY_SCHEDULE } from '../3d/Environment/FamilyMembers';

export const HUD: React.FC = () => {
  const bubbleMessage = useGameStore((s) => s.bubbleMessage);
  const isMuted = useGameStore((s) => s.isMuted);
  const isBgmActive = useGameStore((s) => s.isBgmActive);
  const isShiftLock = useGameStore((s) => s.isShiftLock);
  const speedBuffTimeLeft = useGameStore((s) => s.speedBuffTimeLeft);
  const nearbyInteractable = useGameStore((s) => s.nearbyInteractable);
  const activeDialog = useGameStore((s) => s.activeDialog);
  const activeRide = useGameStore((s) => s.activeRide);
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const timeOfDayTimeLeft = useGameStore((s) => s.timeOfDayTimeLeft);
  const isRidingScooter = useGameStore((s) => s.isRidingScooter);
  const schoolQuest = useGameStore((s) => s.schoolQuest);
  const isKhalidFollowing = useGameStore((s) => s.isKhalidFollowing);

  const handleInteract = () => {
    if (!nearbyInteractable) return;
    const id = nearbyInteractable.id;
    if (id === 'scooter') {
      gameStore.mountScooter();
    } else if (id === 'bu_guru') {
      const allCollected = schoolQuest.backpack && schoolQuest.waterBottle && schoolQuest.drawingBook;
      if (schoolQuest.completed) {
        gameStore.openDialog({
          speaker: 'Ibu Santi',
          role: 'Guru TK Karang Tengah 1 Atap 👩‍🏫',
          avatarBg: 'bg-emerald-600',
          text: 'Assalamu\'alaikum Khaulah bidadari shalihah! MasyaAllah, Khaulah murid teladan TK Karang Tengah 1 Atap! Selamat belajar dan bermain ya sayang! 🌸🎒',
        });
      } else if (allCollected) {
        gameStore.openDialog({
          speaker: 'Ibu Santi',
          role: 'Guru TK Karang Tengah 1 Atap 👩‍🏫',
          avatarBg: 'bg-emerald-600',
          text: 'MasyaAllah Khaulah hebat sekali! Tas Ransel TK, Botol Minum, dan Buku Gambar semuanya sudah lengkap dibawa! Khaulah murid teladan TK Karang Tengah 1 Atap! Ini Piagam Penghargaan untuk Khaulah!',
          actionText: '🏅 Terima Piagam Penghargaan Murid Teladan! 🌸',
          actionType: 'complete_quest',
        });
      } else {
        const missing: string[] = [];
        if (!schoolQuest.backpack) missing.push('Tas Ransel TK 🎒');
        if (!schoolQuest.waterBottle) missing.push('Botol Minum 🍼');
        if (!schoolQuest.drawingBook) missing.push('Buku Gambar 🎨');
        gameStore.openDialog({
          speaker: 'Ibu Santi',
          role: 'Guru TK Karang Tengah 1 Atap 👩‍🏫',
          avatarBg: 'bg-emerald-600',
          text: `Assalamu'alaikum Khaulah sayang! Sebelum mulai belajar, ayo cari perlengkapan yang belum lengkap dulu ya: ${missing.join(', ')}. Ada di sekitar teras rumah dan taman!`,
        });
      }
    } else if (id === 'abi') {
      const schedule = FAMILY_SCHEDULE[timeOfDay] || FAMILY_SCHEDULE.siang;
      gameStore.openDialog({
        speaker: 'Abi',
        role: `Ayah Tercinta 💻 (${schedule.abi.status})`,
        avatarBg: 'bg-blue-600',
        text: schedule.abi.text,
        actionText: '💻 Tos Semangat sama Abi! ✨',
        actionType: 'high_five',
      });
    } else if (id === 'ummi') {
      const schedule = FAMILY_SCHEDULE[timeOfDay] || FAMILY_SCHEDULE.siang;
      gameStore.openDialog({
        speaker: 'Ummi',
        role: `Ibu Tercinta Bercadar 🧕 (${schedule.ummi.status})`,
        avatarBg: 'bg-rose-500',
        text: schedule.ummi.text,
        actionText: '🧹 Ambil Bekal Berkah Ummi! (+Speed Boost ⚡)',
        actionType: 'take_snack',
      });
    } else if (id === 'khalid') {
      const schedule = FAMILY_SCHEDULE[timeOfDay] || FAMILY_SCHEDULE.siang;
      const isFollowing = gameStore.getState().isKhalidFollowing;
      gameStore.openDialog({
        speaker: 'Adek Khalid',
        role: isFollowing ? 'Sahabat Petualang Cilik 👦🏃‍♂️' : `Pemain Drumband Cilik 👦🥁 (${schedule.khalid.status})`,
        avatarBg: 'bg-amber-500',
        text: isFollowing
          ? 'Mbak Khaulah! Khalid senang banget ikut lari-larian keliling desa! Mau Khalid terus ikut petualangan, atau istirahat di sini dulu?'
          : schedule.khalid.text,
        actionText: isFollowing
          ? '🏠 Adek Khalid Istirahat di Teras Dulu 🌸'
          : '🏃‍♂️ Ajak Adek Khalid Ikut Petualangan! ✨',
        actionType: 'toggle_khalid_follow',
      });
    } else if (id === 'faqih') {
      const schedule = FAMILY_SCHEDULE[timeOfDay] || FAMILY_SCHEDULE.siang;
      gameStore.openDialog({
        speaker: 'Adek Faqih',
        role: `Adik Gemas Balap Mobilan 👶🚗 (${schedule.faqih.status})`,
        avatarBg: 'bg-emerald-500',
        text: schedule.faqih.text,
        actionText: '🚗 Balapan Mobilan bareng Faqih! 💨',
        actionType: 'play_toycar',
      });
    } else if (id === 'slide') {
      const playerPos = gameStore.getState().playerPos;
      const distSq = Math.pow(playerPos[0] - 8, 2) + Math.pow(playerPos[2] - 25.5, 2);
      if (distSq < 16.0) {
        gameStore.setActiveRide('slide');
      }
    } else if (id === 'swing') {
      const playerPos = gameStore.getState().playerPos;
      const distSq = Math.pow(playerPos[0] - (-8), 2) + Math.pow(playerPos[2] - 26, 2);
      if (distSq < 16.0) {
        gameStore.setActiveRide('swing');
      }
    } else if (id === 'farm_bunny') {
      gameStore.executeDialogAction('feed_animal');
    } else if (id === 'farm_sheep') {
      soundManager.playAnimalSound('sheep');
      gameStore.setMessage('Mbaaa~ Domba berbulu awan kapas dielus lembut oleh Khaulah! 🐑💖');
    } else if (id === 'pak_tani') {
      gameStore.openDialog({
        speaker: 'Pak Tani Ceria',
        role: 'Sahabat Hewan & Kebun 👨‍🌾',
        avatarBg: 'bg-emerald-600',
        text: 'Assalamu\'alaikum Khaulah sayang! Senang sekali Khaulah berkunjung ke peternakan desa. Hewan-hewan jinak ini suka sekali makan wortel segar dan apel manis! Ayo beri makan kelinci lucunya ya!',
        actionText: '🥕 Beri Wortel Segar ke Kelinci! ✨',
        actionType: 'feed_animal',
      });
    } else if (id === 'swan_boat') {
      gameStore.setActiveRide('boat');
    } else if (id === 'mart_cashier') {
      gameStore.executeDialogAction('scan_grocery');
    } else if (id === 'bakery_cake') {
      gameStore.openDialog({
        speaker: 'Chef Bakery Ceria',
        role: 'Pembuat Kue Manis 🧁',
        avatarBg: 'bg-rose-500',
        text: 'Assalamu\'alaikum Khaulah bidadari manis! Ini Chef baru saja memanggang donat meses pelangi dan kue ulang tahun lezat! Mau cicipi donatnya?',
        actionText: '🍩 Cicipi Donat Pelangi! (+Speed Boost ⚡)',
        actionType: 'buy_icecream',
      });
    } else if (id === 'firetruck') {
      gameStore.setActiveRide('firetruck');
    } else if (id === 'carousel') {
      gameStore.setActiveRide('carousel');
    } else if (id === 'ferris_wheel') {
      gameStore.setActiveRide('ferris');
    } else if (id === 'carnival_candy') {
      gameStore.executeDialogAction('buy_icecream');
    } else if (id === 'village_train') {
      gameStore.setActiveRide('train');
    } else if (id === 'pool_slide') {
      gameStore.setActiveRide('pool_slide');
    } else if (id === 'flamingo_float') {
      gameStore.setActiveRide('flamingo');
    } else if (id === 'treehouse') {
      gameStore.setPlayerMotion([-20, 3.8, -28], 0, false);
      soundManager.playJump();
      gameStore.setMessage('Khaulah memanjat ke Rumah Pohon Rahasia! Pemandangannya indah sekali! 🏡🌳✨');
    } else if (id === 'marshmallow') {
      gameStore.executeDialogAction('take_snack');
      gameStore.setMessage('Nyam nyam! Khaulah menikmati marshmallow bakar manis! (+Speed Boost ⚡🍡)');
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
              Khaulah
            </div>
          </div>

          {/* School Prep Quest Pill */}
          <div className="pointer-events-auto bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border-2 border-emerald-300 shadow-md flex items-center gap-2 text-xs font-bubble font-bold text-emerald-800">
            {schoolQuest.completed ? (
              <div className="flex items-center gap-1.5 text-emerald-700">
                <span>🏅</span>
                <span>Siswa Teladan TK! ⭐</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span>🎒</span>
                <span>
                  Perlengkapan TK (
                  {(schoolQuest.backpack ? 1 : 0) +
                    (schoolQuest.waterBottle ? 1 : 0) +
                    (schoolQuest.drawingBook ? 1 : 0)}
                  /3)
                </span>
                <span className="flex items-center gap-0.5 ml-0.5 text-sm">
                  <span className={schoolQuest.backpack ? 'opacity-100' : 'opacity-25'}>🎒</span>
                  <span className={schoolQuest.waterBottle ? 'opacity-100' : 'opacity-25'}>🍼</span>
                  <span className={schoolQuest.drawingBook ? 'opacity-100' : 'opacity-25'}>🎨</span>
                </span>
              </div>
            )}
          </div>

          {/* Scooter Active Pill */}
          {isRidingScooter && (
            <div className="pointer-events-auto bg-gradient-to-r from-pink-500 to-rose-400 text-white px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-pulse border-2 border-white text-xs font-bubble font-bold">
              <span>🛴</span>
              <span>Skuter Pink ⚡</span>
            </div>
          )}

          {/* Speed Buff Pill (Bekal Cinta Ummi) */}
          {speedBuffTimeLeft > 0 && (
            <div className="pointer-events-auto bg-gradient-to-r from-amber-400 to-pink-500 text-white px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-pulse border-2 border-white text-xs font-bubble font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Bekal Ummi ({Math.ceil(speedBuffTimeLeft)}s ⚡)</span>
            </div>
          )}

          {/* Adek Khalid Following Pill */}
          {isKhalidFollowing && (
            <button
              onClick={() => gameStore.toggleKhalidFollow()}
              title="Adek Khalid sedang ikut Mbak Khaulah! Klik untuk istirahat"
              className="pointer-events-auto bg-gradient-to-r from-amber-400 to-rose-400 text-white px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce-slow border-2 border-white text-xs font-bubble font-bold active:scale-95 transition-transform"
            >
              <span>👦</span>
              <span>Khalid Ikut! 🏃‍♂️</span>
            </button>
          )}
        </div>

        {/* Right: Menu & Audio Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Time of Day Indicator (Otomatis: Subuh ➔ Siang ➔ Sore ➔ Malam) */}
          <div
            title={`Waktu Otomatis: ${TIME_OF_DAY_CONFIG[timeOfDay].name} (${Math.ceil(timeOfDayTimeLeft)}s tersisa) — Siklus berganti otomatis: Subuh ➔ Siang ➔ Sore ➔ Malam`}
            className={`h-11 px-3 rounded-2xl flex items-center gap-2 border-2 border-white shadow-md select-none transition-all duration-300 ${
              timeOfDay === 'subuh'
                ? 'bg-gradient-to-r from-indigo-900 to-purple-900 text-indigo-100'
                : timeOfDay === 'siang'
                ? 'bg-gradient-to-r from-amber-300 to-yellow-300 text-amber-950 font-bold'
                : timeOfDay === 'sore'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                : 'bg-gradient-to-r from-slate-900 to-indigo-950 text-yellow-300'
            }`}
          >
            {timeOfDay === 'subuh' ? (
              <Sunrise className="w-5 h-5 text-indigo-200" />
            ) : timeOfDay === 'siang' ? (
              <Sun className="w-5 h-5 text-amber-600 fill-amber-400" />
            ) : timeOfDay === 'sore' ? (
              <Sunset className="w-5 h-5 text-yellow-200" />
            ) : (
              <Moon className="w-5 h-5 fill-yellow-300" />
            )}
            <div className="flex flex-col text-left leading-none pr-0.5">
              <span className="text-[11px] font-bubble font-bold">
                {TIME_OF_DAY_CONFIG[timeOfDay].badgeLabel}
              </span>
              <span className="text-[10px] font-mono font-semibold opacity-85 mt-0.5">
                {Math.ceil(timeOfDayTimeLeft)}s
              </span>
            </div>
          </div>

          {/* Background Music Toggle */}
          <button
            onClick={() => gameStore.toggleBgm()}
            title={
              isBgmActive
                ? `Matikan Musik (${TIME_OF_DAY_CONFIG[timeOfDay].name})`
                : `Nyalakan Musik (${TIME_OF_DAY_CONFIG[timeOfDay].name}) 🎵`
            }
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

          {/* Magic Wand Button (AI Voice Controller) */}
          <button
            onClick={() => gameStore.openMagicModal()}
            title="Tongkat Suara Ajaib Khaulah [M] — Ucapkan mantra apa saja!"
            className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400 text-white font-bubble font-bold text-sm border-2 border-white shadow-lg flex items-center gap-1.5 active:scale-95 transition-transform animate-pulse-gentle hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-yellow-200 fill-yellow-200" />
            <span className="hidden sm:inline">Tongkat Ajaib [M]</span>
            <span className="sm:hidden">🪄</span>
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
        {/* Scooter Riding Controls (Bell & Dismount) */}
        {isRidingScooter && (
          <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 animate-fade-in">
            <button
              onClick={() => gameStore.ringBell()}
              className="bg-amber-400 hover:bg-amber-500 text-amber-950 px-4 sm:px-5 py-2.5 rounded-full font-bubble font-bold text-xs sm:text-sm border-2 border-white shadow-xl flex items-center gap-1.5 active:scale-90 transition-transform"
            >
              <Bell className="w-4 h-4 fill-amber-900" />
              <span>Bel Kring! [H]</span>
            </button>
            <button
              onClick={() => gameStore.dismountScooter()}
              className="bg-rose-500 hover:bg-rose-600 text-white px-4 sm:px-5 py-2.5 rounded-full font-bubble font-bold text-xs sm:text-sm border-2 border-white shadow-xl flex items-center gap-1.5 active:scale-90 transition-transform"
            >
              <span>🛴 Turun Skuter [E]</span>
            </button>
          </div>
        )}

        {/* Universal Active Ride Exit & Controls Prompt */}
        {activeRide !== 'none' && activeRide !== 'slide' && (
          <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2.5 animate-bounce-slow">
            {(activeRide === 'train' || activeRide === 'firetruck' || activeRide === 'boat') && (
              <button
                onClick={() => {
                  if (activeRide === 'train') {
                    soundManager.playTrainWhistle();
                    gameStore.setMessage('Tuut.. tuuut! Kereta Mini Khaulah berangkat! 🚂💨');
                  } else if (activeRide === 'firetruck') {
                    soundManager.playFireSiren();
                    gameStore.setMessage('Niu.. niu.. niu! Pasukan Damkar Cilik Khaulah siap menolong! 🚒🚨');
                  } else if (activeRide === 'boat') {
                    soundManager.playWaterSplash();
                    gameStore.setMessage('Kecipak kecipuk! Perahu bebek Khaulah mendayung riang! 🦢🌊');
                  }
                }}
                className="bg-amber-400 hover:bg-amber-500 text-amber-950 px-4 sm:px-5 py-2.5 rounded-full font-bubble font-bold text-xs sm:text-sm border-2 border-white shadow-xl flex items-center gap-1.5 active:scale-90 transition-transform"
              >
                <span>
                  {activeRide === 'train'
                    ? '🔔 Peluit Kereta [H]'
                    : activeRide === 'firetruck'
                    ? '🚨 Sirine Damkar [H]'
                    : '🌊 Ciprat Air [H]'}
                </span>
              </button>
            )}
            <button
              onClick={() => gameStore.setActiveRide('none')}
              className="bg-rose-500 hover:bg-rose-600 text-white px-5 sm:px-6 py-2.5 rounded-full font-bubble font-bold text-xs sm:text-sm border-2 border-white shadow-xl flex items-center gap-1.5 active:scale-90 transition-transform"
            >
              <span>
                {activeRide === 'swing'
                  ? 'Turun dari Ayunan [SPASI / E]'
                  : activeRide === 'carousel'
                  ? '🎠 Turun Komedi Putar [E]'
                  : activeRide === 'ferris'
                  ? '🎡 Turun Bianglala [E]'
                  : activeRide === 'train'
                  ? '🚂 Turun Kereta [E]'
                  : activeRide === 'boat'
                  ? '🦢 Turun Perahu [E]'
                  : activeRide === 'pool_slide'
                  ? '🛝 Turun dari Seluncuran [E]'
                  : activeRide === 'flamingo'
                  ? '🦩 Turun Pelampung [SPASI / E]'
                  : '🚒 Turun Damkar [E]'}
              </span>
            </button>
          </div>
        )}

        {/* Nearby Interactable Action Button */}
        {nearbyInteractable && activeRide === 'none' && !activeDialog && !isRidingScooter && (
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
              {activeDialog.speaker.includes('Abi') && '💻👨‍👧'}
              {activeDialog.speaker.includes('Ummi') && '🧕🧹'}
              {activeDialog.speaker.includes('Khalid') && '👦🥁'}
              {activeDialog.speaker.includes('Faqih') && '👶🚗'}
              {(activeDialog.speaker.includes('Bu Guru') || activeDialog.speaker.includes('Santi')) && '👩‍🏫🎒'}
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
                className="w-full mt-4 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-bubble font-bold text-base shadow-lg hover:shadow-xl border-2 border-white active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>{activeDialog.actionText}</span>
              </button>
            )}

            {/* Freeform AI Voice Chat Button */}
            <button
              onClick={() => {
                let charId = 'other';
                if (activeDialog.speaker.includes('Khalid')) charId = 'khalid';
                else if (activeDialog.speaker.includes('Abi')) charId = 'abi';
                else if (activeDialog.speaker.includes('Ummi')) charId = 'ummi';
                else if (activeDialog.speaker.includes('Faqih')) charId = 'faqih';
                else if (activeDialog.speaker.includes('Santi') || activeDialog.speaker.includes('Guru')) charId = 'bu_guru';

                gameStore.openCharacterChat({
                  characterId: charId,
                  characterName: activeDialog.speaker,
                  role: activeDialog.role,
                  avatarBg: activeDialog.avatarBg,
                });
              }}
              className="w-full mt-2.5 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 text-white font-bubble font-bold text-sm shadow-md hover:shadow-lg border-2 border-white active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-yellow-200" />
              <span>Ajak Ngobrol Bebas / Suara 🎙️✨</span>
            </button>

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

      {/* AI Voice Magic Wand Modal */}
      <MagicWandModal />

      {/* Living AI Character Conversation Modal */}
      <CharacterChatModal />

      {/* Secret Wishlist Modal (Buku Impian Khaulah untuk Abi) */}
      <WishlistModal />
    </div>
  );
};
