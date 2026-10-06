import React, { useState, useEffect, useRef } from 'react';
import { useGameStore, gameStore } from '../../state/useGameStore';
import { soundManager } from '../../sound/audioManager';
import {
  processMagicPrompt,
  speakText,
  stopSpeaking,
  isSpeechRecognitionAvailable,
  createSpeechRecognizer,
  MagicActionResult,
} from '../../services/aiService';
import {
  Sparkles,
  Mic,
  MicOff,
  Send,
  X,
  Volume2,
  BookOpen,
  Wand2,
  CheckCircle2,
  Flame,
} from 'lucide-react';

interface QuickSpell {
  icon: string;
  label: string;
  prompt: string;
  color: string;
}

const QUICK_SPELLS: QuickSpell[] = [
  { icon: '🌙', label: 'Malam Berbintang', prompt: 'Tongkat ajaib, jadikan malam bertabur bintang!', color: 'from-indigo-600 to-purple-700 text-white' },
  { icon: '☀️', label: 'Siang Ceria', prompt: 'Jadikan siang hari yang ceria dan cerah!', color: 'from-amber-400 to-yellow-500 text-amber-950 font-bold' },
  { icon: '⚡', label: 'Lari Secepat Kilat', prompt: 'Aku mau lari super cepat secepat kilat pelangi!', color: 'from-pink-500 to-rose-500 text-white' },
  { icon: '🦘', label: 'Lompat Setinggi Awan', prompt: 'Bikin Khaulah bisa melompat setinggi awan di langit!', color: 'from-sky-400 to-blue-500 text-white' },
  { icon: '🎈', label: 'Hujan Balon Warna-Warni', prompt: 'Munculkan banyak balon warna-warni turun dari langit!', color: 'from-rose-400 to-pink-500 text-white' },
  { icon: '🎂', label: 'Kue Ulang Tahun Manis', prompt: 'Aku mau kue ulang tahun raksasa dengan lilin menyala!', color: 'from-pink-400 to-purple-400 text-white' },
  { icon: '🧼', label: 'Gelembung Sabun Ajaib', prompt: 'Bikin banyak gelembung sabun berkilauan melayang!', color: 'from-teal-400 to-cyan-500 text-white' },
  { icon: '👑', label: 'Mahkota Putri', prompt: 'Pasang mahkota putri kerajaan di kepala Khaulah!', color: 'from-yellow-400 to-amber-500 text-amber-950 font-bold' },
  { icon: '🧚‍♀️', label: 'Sayap Peri Terbang', prompt: 'Pasang sayap peri bercahaya di punggung Khaulah!', color: 'from-fuchsia-500 to-pink-600 text-white' },
  { icon: '🐱', label: 'Sahabat Kucing Lucu', prompt: 'Ganti temanku jadi anak kucing putih yang manis!', color: 'from-orange-400 to-amber-500 text-white' },
  { icon: '🎒', label: 'Pergi ke TK Karang Tengah', prompt: 'Bawa Khaulah terbang ke gerbang TK Karang Tengah 1 Atap!', color: 'from-emerald-500 to-teal-600 text-white' },
  { icon: '🏖️', label: 'Pergi ke Danau & Pantai', prompt: 'Bawa aku bermain ke pantai dan danau bebek!', color: 'from-cyan-500 to-blue-600 text-white' },
  { icon: '🎡', label: 'Pergi ke Karnaval', prompt: 'Bawa aku ke pasar malam komedi putar dan bianglala!', color: 'from-purple-500 to-indigo-600 text-white' },
  { icon: '👦', label: 'Ajak Khalid Ikut', prompt: 'Adek Khalid, ayo ikut Mbak Khaulah jalan-jalan berpetualang!', color: 'from-amber-500 to-rose-400 text-white font-bold' },
  { icon: '🎆', label: 'Pesta Kembang Api', prompt: 'Rayakan dengan pesta kembang api dan konfeti meriah!', color: 'from-violet-500 to-rose-500 text-white' },
  { icon: '❓', label: 'Tebak-tebakan Lucu', prompt: 'Peri ajaib, kasih aku tebak-tebakan anak yang seru dong!', color: 'from-amber-500 to-orange-500 text-white' },
];

export const MagicWandModal: React.FC = () => {
  const isOpen = useGameStore((s) => s.isMagicModalOpen);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [responseResult, setResponseResult] = useState<MagicActionResult | null>(null);
  const [speechRecognizedText, setSpeechRecognizedText] = useState('');
  const recognizerRef = useRef<any>(null);

  useEffect(() => {
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
          speech: 'Halo Putri Khaulah! Tekan mikrofon atau pilih mantra ajaibmu di bawah ini ya! Simsalabim! 🪄✨',
          action: 'chat_only',
        };
        setResponseResult(welcome);
        speakText(welcome.speech);
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

    setIsLoading(true);
    setSpeechRecognizedText('');
    soundManager.playMagicSpell();

    try {
      const result = await processMagicPrompt(promptToUse);
      setResponseResult(result);
      handleExecuteAction(result);
      speakText(result.speech);
    } catch (e) {
      console.warn('Error casting spell:', e);
    } finally {
      setIsLoading(false);
      setInputText('');
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
      alert('Browser ini belum mendukung mikrofon suara. Khaulah bisa klik tombol mantra di bawah atau mengetik ya!');
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

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center p-3 sm:p-5 bg-indigo-950/60 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-gradient-to-b from-purple-50 via-pink-50 to-white w-full max-w-2xl max-h-[92vh] rounded-3xl border-4 border-yellow-300 shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400 p-4 sm:p-5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white flex items-center justify-center text-2xl shadow-inner animate-pulse-gentle">
              🪄
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bubble font-bold text-white drop-shadow">
                Tongkat Suara Ajaib Khaulah ✨
              </h2>
              <p className="text-xs sm:text-sm text-yellow-100 font-semibold">
                Ucapkan mantra apa saja, dunia game langsung mengabulkannya!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                gameStore.closeMagicModal();
                gameStore.openWishlistModal();
              }}
              title="Buku Impian Khaulah"
              className="p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white border border-white/50 shadow flex items-center gap-1.5 text-xs font-bubble font-bold active:scale-95 transition-transform"
            >
              <BookOpen className="w-4 h-4 text-yellow-200" />
              <span className="hidden sm:inline">Buku Impian</span>
            </button>
            <button
              onClick={() => gameStore.closeMagicModal()}
              className="w-10 h-10 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center border-2 border-white shadow-md active:scale-90 transition-transform"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Main Microphone Action Card */}
          <div className="bg-gradient-to-r from-violet-100 via-pink-100 to-amber-100 rounded-3xl p-5 border-2 border-pink-200 shadow-inner flex flex-col items-center text-center">
            {/* Big Mic Button */}
            <div className="relative">
              {isListening && (
                <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 opacity-75 blur-md animate-ping" />
              )}
              <button
                onClick={toggleMicListening}
                disabled={isLoading}
                className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center border-4 border-white shadow-2xl transition-all active:scale-95 ${
                  isListening
                    ? 'bg-gradient-to-tr from-rose-500 to-pink-500 text-white scale-105 animate-pulse'
                    : isLoading
                    ? 'bg-amber-400 text-white animate-spin'
                    : 'bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 text-white hover:scale-105'
                }`}
              >
                {isLoading ? (
                  <Sparkles className="w-10 h-10 animate-spin" />
                ) : isListening ? (
                  <Mic className="w-10 h-10 sm:w-12 sm:h-12" />
                ) : (
                  <Mic className="w-10 h-10 sm:w-12 sm:h-12" />
                )}
              </button>
            </div>

            {/* Mic Instruction Text */}
            <div className="mt-3">
              <span className="font-bubble text-base sm:text-lg font-bold text-purple-900 block">
                {isListening
                  ? '🎙️ Sedang mendengarkan Khaulah... Ayo bicara!'
                  : isLoading
                  ? '✨ Tongkat Ajaib sedang mengabulkan mantramu...'
                  : 'Tekan Mikrofon & Ucapkan Mantramu! 🎙️'}
              </span>
              <p className="text-xs text-purple-700/80 mt-0.5">
                {isListening
                  ? 'Katakan apa saja: "Jadikan malam bertabur bintang", "Lari cepat", atau "Hujan balon"!'
                  : 'Bisa lewat suara langsung atau pilih tombol di bawah ya!'}
              </p>
            </div>

            {/* Live speech feedback if any */}
            {speechRecognizedText && (
              <div className="mt-2 text-xs bg-white/80 px-3 py-1 rounded-full text-purple-900 border border-purple-200 font-medium">
                "{speechRecognizedText}"
              </div>
            )}
          </div>

          {/* Fairy Response Bubble */}
          {responseResult && (
            <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-purple-200 shadow-md flex items-start gap-3 sm:gap-4 animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-300 via-pink-400 to-purple-500 flex items-center justify-center text-2xl shadow border-2 border-white shrink-0 animate-bounce-slow">
                🧚‍♀️
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bubble font-bold text-sm text-purple-900 flex items-center gap-1">
                    Peri Bintang Ajaib
                    <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
                  </span>
                  <button
                    onClick={() => speakText(responseResult.speech)}
                    title="Dengarkan Ulang Suara"
                    className="p-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 active:scale-90 transition-transform"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="font-bubble text-gray-800 text-sm sm:text-base mt-1 leading-relaxed font-semibold">
                  "{responseResult.speech}"
                </p>

                {/* Wishlist Notification Badge if recorded */}
                {responseResult.isWishRecorded && (
                  <div className="mt-2.5 inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-300 text-xs font-bubble font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Tercatat di Buku Impian Khaulah untuk Abi! ✨📖</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Spell Buttons Grid */}
          <div>
            <h3 className="font-bubble text-sm font-bold text-purple-900 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span>Pilihan Mantra Cepat Sekali Sentuh:</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {QUICK_SPELLS.map((spell, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCastSpell(spell.prompt)}
                  disabled={isLoading}
                  className={`p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r ${spell.color} shadow-sm hover:shadow-md border border-white/60 flex items-center gap-2 text-left active:scale-95 transition-transform`}
                >
                  <span className="text-xl sm:text-2xl shrink-0">{spell.icon}</span>
                  <span className="font-bubble text-xs sm:text-sm font-bold leading-tight">
                    {spell.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Text Spell Input (for parent or child typing) */}
          <div className="pt-2">
            <h3 className="font-bubble text-xs font-bold text-purple-900 mb-1.5">
              Atau Ketik Mantra Sendiri:
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
                placeholder="Contoh: Bikin dinosaurus ramah, atau ganti baju ungu..."
                className="flex-1 bg-white border-2 border-purple-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:border-purple-500 shadow-inner"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2.5 rounded-2xl font-bubble font-bold text-xs sm:text-sm border-2 border-white shadow-md active:scale-95 transition-transform disabled:opacity-50 flex items-center gap-1.5"
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
