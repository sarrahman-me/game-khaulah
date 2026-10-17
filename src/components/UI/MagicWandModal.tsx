import React, { useState, useEffect, useRef } from 'react';
import { useGameStore, gameStore } from '../../state/useGameStore';
import { soundManager } from '../../sound/audioManager';
import {
  processMagicPrompt,
  speakText,
  stopSpeaking,
  isSpeechRecognitionAvailable,
  createSpeechRecognizer,
  subscribeTTSState,
  resolveCharacterGender,
  AI_MODEL_NAME,
  TTS_VOICES,
  VoiceGender,
  MagicActionResult,
} from '../../services/aiService';
import {
  Sparkles,
  Mic,
  Send,
  X,
  Volume2,
  VolumeX,
  BookOpen,
  CheckCircle2,
  Radio,
  RotateCcw,
  Compass,
  Zap,
  Gift,
  Crown,
  Heart,
  CloudSun,
} from 'lucide-react';

export type SpellCategory = 'semua' | 'waktu' | 'kekuatan' | 'benda' | 'dandan' | 'teleport' | 'sahabat';

interface QuickSpell {
  icon: string;
  label: string;
  prompt: string;
  category: SpellCategory;
  color: string;
  badge?: string;
}

const QUICK_SPELLS: QuickSpell[] = [
  // Waktu & Cuaca
  { icon: '🌙', label: 'Malam Berbintang', prompt: 'Tongkat ajaib, jadikan malam bertabur bintang!', category: 'waktu', color: 'from-indigo-600 via-purple-700 to-indigo-800 text-white' },
  { icon: '☀️', label: 'Siang Ceria', prompt: 'Jadikan siang hari yang ceria dan cerah!', category: 'waktu', color: 'from-amber-400 to-yellow-500 text-amber-950 font-bold' },
  { icon: '🌅', label: 'Fajar Subuh Damai', prompt: 'Jadikan fajar subuh yang sejuk dan damai!', category: 'waktu', color: 'from-emerald-500 to-teal-600 text-white' },
  { icon: '🌇', label: 'Senja Sore Jingga', prompt: 'Jadikan senja sore jingga yang indah!', category: 'waktu', color: 'from-orange-500 to-rose-500 text-white' },
  { icon: '🌈', label: 'Lengkungan Pelangi', prompt: 'Munculkan lengkungan pelangi indah di langit!', category: 'waktu', color: 'from-pink-500 via-purple-500 to-sky-500 text-white' },
  { icon: '🌧️', label: 'Rintik Hujan Lembut', prompt: 'Turunkan rintik hujan lembut menyegarkan bunga!', category: 'waktu', color: 'from-blue-500 to-cyan-600 text-white' },
  { icon: '❄️', label: 'Salju Berhamburan', prompt: 'Turunkan butiran salju lembut dari langit!', category: 'waktu', color: 'from-sky-300 to-blue-400 text-blue-950 font-bold' },

  // Kekuatan Super
  { icon: '⚡', label: 'Lari Secepat Kilat', prompt: 'Aku mau lari super cepat secepat kilat pelangi!', category: 'kekuatan', color: 'from-pink-500 to-rose-500 text-white', badge: '+25s' },
  { icon: '🦘', label: 'Lompat Setinggi Awan', prompt: 'Bikin Khaulah bisa melompat setinggi awan di langit!', category: 'kekuatan', color: 'from-sky-400 to-blue-600 text-white', badge: '+25s' },
  { icon: '🎆', label: 'Pesta Kembang Api', prompt: 'Rayakan dengan pesta kembang api dan konfeti meriah!', category: 'kekuatan', color: 'from-violet-600 to-rose-500 text-white' },

  // Benda Ajaib
  { icon: '🎈', label: 'Hujan Balon Warna-Warni', prompt: 'Munculkan banyak balon warna-warni turun dari langit!', category: 'benda', color: 'from-rose-400 to-pink-500 text-white' },
  { icon: '🎂', label: 'Kue Ulang Tahun Manis', prompt: 'Aku mau kue ulang tahun raksasa dengan lilin menyala!', category: 'benda', color: 'from-pink-400 to-purple-400 text-white' },
  { icon: '🧼', label: 'Gelembung Sabun Ajaib', prompt: 'Bikin banyak gelembung sabun berkilauan melayang!', category: 'benda', color: 'from-teal-400 to-cyan-500 text-white' },
  { icon: '⭐', label: 'Hujan Bintang Emas', prompt: 'Munculkan hujan bintang keemasan mengelilingiku!', category: 'benda', color: 'from-amber-400 to-yellow-500 text-amber-950 font-bold' },

  // Berdandan & Sahabat Hewan
  { icon: '👑', label: 'Mahkota Putri Cantik', prompt: 'Pasang mahkota putri kerajaan di kepala Khaulah!', category: 'dandan', color: 'from-yellow-400 to-amber-500 text-amber-950 font-bold' },
  { icon: '🧚‍♀️', label: 'Sayap Peri Terbang', prompt: 'Pasang sayap peri bercahaya di punggung Khaulah!', category: 'dandan', color: 'from-fuchsia-500 to-pink-600 text-white' },
  { icon: '🐰', label: 'Bando Telinga Kelinci', prompt: 'Pasang bando telinga kelinci yang lucu di kepalaku!', category: 'dandan', color: 'from-pink-400 to-rose-400 text-white' },
  { icon: '🐱', label: 'Sahabat Kucing Putih', prompt: 'Ganti temanku jadi anak kucing putih yang manis!', category: 'dandan', color: 'from-orange-400 to-amber-500 text-white' },
  { icon: '🐶', label: 'Sahabat Anak Anjing', prompt: 'Aku mau ditemani anak anjing cokelat yang setia!', category: 'dandan', color: 'from-amber-500 to-orange-600 text-white' },

  // Teleport Cepat
  { icon: '🏡', label: 'Halaman Rumah Khaulah', prompt: 'Bawa aku pulang ke halaman rumah tercinta!', category: 'teleport', color: 'from-emerald-500 to-teal-600 text-white' },
  { icon: '🎒', label: 'TK Karang Tengah 1 Atap', prompt: 'Bawa Khaulah terbang ke gerbang TK Karang Tengah 1 Atap!', category: 'teleport', color: 'from-blue-500 to-indigo-600 text-white' },
  { icon: '🏖️', label: 'Danau & Pantai Pasir', prompt: 'Bawa aku bermain ke pantai dan danau bebek!', category: 'teleport', color: 'from-cyan-500 to-blue-600 text-white' },
  { icon: '🎡', label: 'Karnaval Pasar Malam', prompt: 'Bawa aku ke pasar malam komedi putar dan bianglala!', category: 'teleport', color: 'from-purple-500 to-indigo-600 text-white' },
  { icon: '🌈', label: 'Puncak Bukit Pelangi', prompt: 'Bawa aku meluncur ke puncak Bukit Pelangi!', category: 'teleport', color: 'from-pink-500 to-rose-500 text-white' },
  { icon: '🌊', label: 'Waterpark Halaman Belakang', prompt: 'Bawa aku meluncur di perosotan Waterpark!', category: 'teleport', color: 'from-teal-500 to-cyan-600 text-white' },
  { icon: '⛄', label: 'Lembah Salju & Es', prompt: 'Bawa aku bermain salju di Lembah Salju!', category: 'teleport', color: 'from-sky-400 to-blue-500 text-white' },

  // Sahabat & Cerita
  { icon: '👦', label: 'Ajak Adek Khalid Ikut', prompt: 'Adek Khalid, ayo ikut Kak Khaulah jalan-jalan berpetualang!', category: 'sahabat', color: 'from-amber-500 to-rose-500 text-white font-bold' },
  { icon: '🌸', label: 'Adek Khalid Istirahat', prompt: 'Adek Khalid istirahat di sini dulu ya!', category: 'sahabat', color: 'from-purple-400 to-pink-500 text-white' },
  { icon: '❓', label: 'Tebak-tebakan Ceria', prompt: 'Peri ajaib, kasih aku tebak-tebakan anak yang seru dong!', category: 'sahabat', color: 'from-amber-400 to-orange-500 text-white' },
  { icon: '🚒', label: 'Sirine Damkar Cilik', prompt: 'Bunyikan sirine mobil pemadam kebakaran!', category: 'sahabat', color: 'from-red-500 to-rose-600 text-white' },
  { icon: '🚂', label: 'Peluit Kereta Uap', prompt: 'Bunyikan peluit kereta api uap nyaring!', category: 'sahabat', color: 'from-indigo-500 to-blue-600 text-white' },
];

const CATEGORY_TABS: Array<{ id: SpellCategory; label: string; icon: React.ReactNode }> = [
  { id: 'semua', label: 'Semua Mantra', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'waktu', label: 'Waktu & Langit', icon: <CloudSun className="w-3.5 h-3.5" /> },
  { id: 'kekuatan', label: 'Kekuatan', icon: <Zap className="w-3.5 h-3.5" /> },
  { id: 'benda', label: 'Keajaiban', icon: <Gift className="w-3.5 h-3.5" /> },
  { id: 'dandan', label: 'Berdandan', icon: <Crown className="w-3.5 h-3.5" /> },
  { id: 'teleport', label: 'Terbang Cepat', icon: <Compass className="w-3.5 h-3.5" /> },
  { id: 'sahabat', label: 'Sahabat & Cerita', icon: <Heart className="w-3.5 h-3.5" /> },
];

export const MagicWandModal: React.FC = () => {
  const isOpen = useGameStore((s) => s.isMagicModalOpen);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [responseResult, setResponseResult] = useState<MagicActionResult | null>(null);
  const [speechRecognizedText, setSpeechRecognizedText] = useState('');
  const [activeCategory, setActiveCategory] = useState<SpellCategory>('semua');
  const [selectedVoiceGender, setSelectedVoiceGender] = useState<VoiceGender>('female');
  const [isSpeakingNow, setIsSpeakingNow] = useState(false);
  const [recentSpells, setRecentSpells] = useState<string[]>([
    'Tongkat ajaib, jadikan malam bertabur bintang!',
    'Aku mau lari super cepat secepat kilat pelangi!',
    'Munculkan banyak balon warna-warni turun dari langit!',
  ]);

  const requestVersion = useRef(0);
  const recognizerRef = useRef<any>(null);

  useEffect(() => {
    const unsub = subscribeTTSState((speaking) => {
      setIsSpeakingNow(speaking);
    });
    return unsub;
  }, []);

  useEffect(() => {
    requestVersion.current++;
    setIsLoading(false);
    if (!isOpen) {
      stopSpeaking();
      if (recognizerRef.current) {
        try {
          recognizerRef.current.abort();
        } catch {}
      }
      setIsListening(false);
    } else {
      // Default greeting if first time opened
      if (!responseResult) {
        const welcome: MagicActionResult = {
          speech: 'Halo Putri Khaulah bidadari shalihah! Ucapkan mantra apa saja atau pilih di bawah ya! Simsalabim! 🪄✨',
          action: 'chat_only',
        };
        setResponseResult(welcome);
        speakText(welcome.speech, { gender: selectedVoiceGender });
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExecuteAction = (res: MagicActionResult) => {
    const act = res.action;
    const param = res.actionParam;

    if (act === 'set_time') {
      gameStore.setTimeOfDay(param);
    } else if (act === 'speed_buff') {
      gameStore.addSpeedBuff(typeof param === 'number' ? param : 25);
    } else if (act === 'super_jump') {
      gameStore.addJumpBuff(typeof param === 'number' ? param : 25);
    } else if (act === 'teleport') {
      gameStore.teleportToPreset(param);
    } else if (act === 'set_accessory') {
      gameStore.setAccessory(param);
      soundManager.playMagicSpell();
    } else if (act === 'set_pet') {
      gameStore.setPet(param);
      soundManager.playMagicSpell();
    } else if (act === 'spawn_balloons') {
      gameStore.spawnMagicItems('balloon', param);
    } else if (act === 'spawn_cake') {
      gameStore.spawnMagicItems('cake', param);
    } else if (act === 'spawn_bubbles') {
      gameStore.spawnMagicItems('bubble', param);
    } else if (act === 'spawn_stars') {
      gameStore.spawnMagicItems('star', param);
    } else if (act === 'celebrate') {
      gameStore.celebrateFireworks();
    } else if (act === 'play_sound') {
      if (param === 'fire_siren') soundManager.playFireSiren();
      else if (param === 'train') soundManager.playTrainWhistle();
      else if (param === 'bell') gameStore.ringBell();
    } else if (act === 'khalid_follow') {
      gameStore.setKhalidFollow(param !== false);
    }
  };

  const handleCastSpell = async (promptToUse: string) => {
    if (!promptToUse.trim() || isLoading) return;

    const version = ++requestVersion.current;
    setIsLoading(true);
    setSpeechRecognizedText('');
    soundManager.playMagicSpell();

    // Track in recent spells
    setRecentSpells((prev) => [promptToUse, ...prev.filter((p) => p !== promptToUse)].slice(0, 4));

    try {
      const result = await processMagicPrompt(promptToUse);
      if (version !== requestVersion.current || !gameStore.getState().isMagicModalOpen) return;
      setResponseResult(result);
      handleExecuteAction(result);

      // Determine voice gender based on action or character
      let voiceToUse = selectedVoiceGender;
      if (result.action === 'khalid_follow' && result.speech.toLowerCase().includes('khalid')) {
        voiceToUse = 'male'; // Adek Khalid speaks with Ardi's voice
      }

      speakText(result.speech, { gender: voiceToUse });
    } catch (e) {
      console.warn('Error casting spell:', e);
    } finally {
      if (version === requestVersion.current) {
        setIsLoading(false);
        setInputText('');
      }
    }
  };

  const toggleMicListening = () => {
    if (isListening) {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionAvailable()) {
      alert('Browser ini belum mendukung mikrofon suara langsung. Khaulah bisa langsung klik tombol mantra ajaib di bawah ya!');
      return;
    }

    try {
      const rec = createSpeechRecognizer(
        (transcript: string) => {
          setIsListening(false);
          setSpeechRecognizedText(transcript);
          handleCastSpell(transcript);
        },
        (err: any) => {
          console.warn('Speech recognition error:', err);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );

      if (rec) {
        recognizerRef.current = rec;
        rec.start();
        setIsListening(true);
        soundManager.playMagicSpell();
      }
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const filteredSpells =
    activeCategory === 'semua'
      ? QUICK_SPELLS
      : QUICK_SPELLS.filter((spell) => spell.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center p-2 sm:p-4 bg-indigo-950/70 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-gradient-to-b from-purple-50 via-pink-50/60 to-white w-full max-w-2xl max-h-[94vh] rounded-3xl border-4 border-yellow-300 shadow-2xl flex flex-col overflow-hidden relative">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-purple-700 via-pink-600 to-amber-500 p-3.5 sm:p-4 text-white flex items-center justify-between shadow-md relative overflow-hidden">
          {/* Subtle background sparkles */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent animate-pulse" />

          <div className="flex items-center gap-2.5 sm:gap-3 z-10">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-yellow-200 flex items-center justify-center text-2xl shadow-inner animate-pulse-gentle">
              🪄
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-lg sm:text-2xl font-bubble font-bold text-white drop-shadow-md">
                  Tongkat Suara Ajaib Khaulah ✨
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs text-yellow-100 font-semibold tracking-wide">
                Ucapkan mantra apa saja — AI langsung mengabulkannya di dunia 3D!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 z-10">
            <button
              onClick={() => {
                gameStore.closeMagicModal();
                gameStore.openWishlistModal();
              }}
              title="Buku Impian Rahasia Khaulah"
              className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white border border-white/50 shadow flex items-center gap-1.5 text-xs font-bubble font-bold active:scale-95 transition-transform"
            >
              <BookOpen className="w-4 h-4 text-yellow-200" />
              <span className="hidden sm:inline">Buku Impian</span>
            </button>
            <button
              onClick={() => gameStore.closeMagicModal()}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center border-2 border-white shadow-md active:scale-90 transition-transform"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Indicators Pill Bar */}
        <div className="bg-purple-900/90 text-white px-4 py-1.5 flex items-center justify-between text-[11px] border-b border-purple-800 flex-wrap gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-emerald-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              9Router AI
            </span>
            <span className="bg-white/10 px-2 py-0.5 rounded-full text-purple-200 font-mono text-[10px]">
              Model: {AI_MODEL_NAME}
            </span>
          </div>

          {/* Voice Switcher Pill */}
          <div className="flex items-center gap-1.5">
            <span className="text-yellow-200 text-[10px] font-bold">Suara Peri:</span>
            <button
              onClick={() => {
                setSelectedVoiceGender('female');
                speakText('Halo Khaulah sayang! Ini suara Gadis!', { voice: TTS_VOICES.female });
              }}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                selectedVoiceGender === 'female'
                  ? 'bg-pink-500 text-white shadow-xs'
                  : 'bg-white/20 text-purple-200 hover:bg-white/30'
              }`}
            >
              👧 Gadis (Perempuan)
            </button>
            <button
              onClick={() => {
                setSelectedVoiceGender('male');
                speakText('Halo Kak Khaulah! Ini suara Ardi!', { voice: TTS_VOICES.male });
              }}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                selectedVoiceGender === 'male'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-white/20 text-purple-200 hover:bg-white/30'
              }`}
            >
              👦 Ardi (Laki-laki)
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {/* Main Magical Voice Interaction Card */}
          <div className="bg-gradient-to-r from-violet-100 via-pink-100 to-amber-100 rounded-3xl p-4 sm:p-5 border-2 border-pink-200/90 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            {/* Live Audio Equalizer Waves when speaking or listening */}
            {(isListening || isSpeakingNow) && (
              <div className="absolute top-2 right-3 flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-full border border-purple-200">
                <Radio className="w-3.5 h-3.5 text-pink-600 animate-pulse" />
                <span className="text-[10px] font-bubble font-bold text-purple-900">
                  {isListening ? 'Mendengarkan...' : 'Bersuara...'}
                </span>
                <span className="flex items-center gap-0.5 ml-1">
                  <span className="w-1 h-3 bg-pink-500 rounded-full animate-bounce" />
                  <span className="w-1 h-4 bg-purple-600 rounded-full animate-pulse" />
                  <span className="w-1 h-2 bg-pink-500 rounded-full animate-bounce" />
                </span>
              </div>
            )}

            {/* Glowing Big Mic Button */}
            <div className="relative mt-1">
              {isListening && (
                <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 opacity-75 blur-md animate-ping" />
              )}
              <button
                onClick={toggleMicListening}
                disabled={isLoading}
                title={isListening ? 'Klik untuk berhenti mendengar' : 'Tekan & bicara'}
                className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center border-4 border-white shadow-2xl transition-all active:scale-95 ${
                  isListening
                    ? 'bg-gradient-to-tr from-rose-500 to-pink-500 text-white scale-105 animate-pulse ring-4 ring-rose-300'
                    : isLoading
                    ? 'bg-gradient-to-tr from-amber-400 to-yellow-500 text-white animate-spin'
                    : 'bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 text-white hover:scale-105 hover:shadow-pink-300/60 ring-2 ring-purple-200'
                }`}
              >
                {isLoading ? (
                  <Sparkles className="w-10 h-10 animate-spin" />
                ) : isListening ? (
                  <Mic className="w-10 h-10 sm:w-11 sm:h-11" />
                ) : (
                  <Mic className="w-10 h-10 sm:w-11 sm:h-11" />
                )}
              </button>
            </div>

            {/* Instruction Labels */}
            <div className="mt-2.5">
              <span className="font-bubble text-base sm:text-lg font-bold text-purple-950 block">
                {isListening
                  ? '🎙️ Sedang mendengarkan Khaulah... Ayo bicara!'
                  : isLoading
                  ? '✨ Tongkat Ajaib sedang meracik mantramu...'
                  : 'Tekan Mikrofon & Ucapkan Mantramu! 🎙️✨'}
              </span>
              <p className="text-xs text-purple-800/80 mt-0.5">
                {isListening
                  ? 'Katakan apa saja: "Malam berbintang", "Lari kilat", "Hujan balon", atau "Ajak Khalid"!'
                  : 'Gunakan suara lewat mikrofon atau pilih tombol mantra di bawah ini!'}
              </p>
            </div>

            {/* Live speech feedback pill if available */}
            {speechRecognizedText && (
              <div className="mt-2 text-xs bg-white/90 px-3.5 py-1.5 rounded-full text-purple-900 border border-purple-300 font-semibold shadow-xs">
                "{speechRecognizedText}"
              </div>
            )}
          </div>

          {/* Fairy Dialogue Response Bubble */}
          {responseResult && (
            <div className="bg-white/95 rounded-3xl p-4 sm:p-5 border-2 border-purple-200/90 shadow-md flex items-start gap-3 sm:gap-4 animate-fade-in relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-300 via-pink-400 to-purple-500 flex items-center justify-center text-2xl shadow-md border-2 border-white shrink-0 animate-bounce-slow">
                🧚‍♀️
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="font-bubble font-bold text-sm text-purple-950 flex items-center gap-1.5">
                    Peri Bintang Ajaib
                    <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
                    <span className="text-[10px] bg-pink-100 text-pink-700 font-semibold px-2 py-0.5 rounded-full">
                      Suara: {selectedVoiceGender === 'male' ? 'Ardi 👦' : 'Gadis 👧'}
                    </span>
                  </span>

                  <div className="flex items-center gap-1">
                    {isSpeakingNow ? (
                      <button
                        onClick={() => stopSpeaking()}
                        title="Hentikan Suara"
                        className="px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bubble font-bold flex items-center gap-1 active:scale-95 transition-transform"
                      >
                        <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                        <span>Hentikan</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => speakText(responseResult.speech, { gender: selectedVoiceGender })}
                        title="Dengarkan Ulang Suara"
                        className="px-2.5 py-1 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bubble font-bold flex items-center gap-1 active:scale-95 transition-transform"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-purple-600" />
                        <span>Dengarkan</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="font-bubble text-gray-800 text-sm sm:text-base mt-1.5 leading-relaxed font-semibold">
                  "{responseResult.speech}"
                </p>

                {/* Wishlist Notification Badge */}
                {responseResult.isWishRecorded && (
                  <div className="mt-2.5 inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-300 text-xs font-bubble font-bold shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Tercatat rapi di Buku Impian Khaulah untuk Abi! ✨📖</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Spells Tap Bar (Quick Re-cast) */}
          {recentSpells.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              <span className="text-[11px] font-bubble font-bold text-purple-900 flex items-center gap-1 shrink-0">
                <RotateCcw className="w-3 h-3 text-purple-500" />
                <span>Terakhir:</span>
              </span>
              {recentSpells.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCastSpell(prompt)}
                  disabled={isLoading}
                  className="bg-white hover:bg-pink-50 text-purple-800 text-[11px] font-bubble font-semibold px-3 py-1 rounded-full border border-purple-200 shadow-xs shrink-0 active:scale-95 transition-transform truncate max-w-[200px]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Spell Category Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bubble text-sm font-bold text-purple-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-500" />
                <span>Katalog Mantra Sekali Sentuh:</span>
              </h3>
            </div>

            {/* Filter Tabs Horizontal Scroll */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-2xl text-xs font-bubble font-bold flex items-center gap-1.5 shrink-0 transition-all active:scale-95 shadow-xs ${
                    activeCategory === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-sm border border-white'
                      : 'bg-white hover:bg-purple-100 text-purple-800 border border-purple-200'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Quick Spell Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
              {filteredSpells.map((spell, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCastSpell(spell.prompt)}
                  disabled={isLoading}
                  className={`p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r ${spell.color} shadow-sm hover:shadow-md border border-white/60 flex items-center justify-between text-left active:scale-95 transition-all hover:scale-[1.02]`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-xl sm:text-2xl shrink-0">{spell.icon}</span>
                    <span className="font-bubble text-xs sm:text-sm font-bold leading-tight truncate">
                      {spell.label}
                    </span>
                  </div>
                  {spell.badge && (
                    <span className="text-[10px] font-bold bg-white/30 text-white px-1.5 py-0.5 rounded-full shrink-0 ml-1">
                      {spell.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Typed Spell Input Bar */}
          <div className="pt-2 border-t border-purple-100">
            <h3 className="font-bubble text-xs font-bold text-purple-950 mb-1.5 flex items-center gap-1">
              <span>Atau Ketik Mantra Sendiri:</span>
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCastSpell(inputText);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Contoh: Bikin dinosaurus ramah, istana pelangi, atau mobil terbang..."
                className="flex-1 bg-white border-2 border-purple-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:border-purple-500 shadow-inner"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white px-4 py-2.5 rounded-2xl font-bubble font-bold text-xs sm:text-sm border-2 border-white shadow-md active:scale-95 transition-transform disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Kirim</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
