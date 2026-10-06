import React from 'react';
import { useGameStore, gameStore } from '../../state/useGameStore';
import { Play, Sparkles, Laptop, Gamepad2 } from 'lucide-react';

export const WelcomeModal: React.FC = () => {
  const isWelcomeOpen = useGameStore((s) => s.isWelcomeOpen);

  React.useEffect(() => {
    if (!isWelcomeOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        gameStore.setWelcomeOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWelcomeOpen]);

  if (!isWelcomeOpen) return null;

  const handleStart = () => {
    gameStore.setWelcomeOpen(false);
    // Start cheerful background music upon child's first click
    gameStore.toggleBgm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-md animate-fade-in">
      <div className="bg-gradient-to-b from-sky-50 via-pink-50 to-white w-full max-w-md rounded-3xl border-4 border-yellow-300 shadow-2xl p-6 relative text-center">
        {/* Animated Badge with Khaulah's Uniform Portrait */}
        <div className="w-24 h-24 mx-auto -mt-16 rounded-3xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden transform rotate-2 hover:rotate-0 transition-transform">
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

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bubble font-bold text-purple-900 mt-3 leading-tight">
          Dunia Bahagia Khaulah 3D
        </h1>
        <p className="text-pink-600 font-bubble text-sm sm:text-base font-semibold mt-1">
          Keluarga Tercinta & TK Karang Tengah 1 Atap 🏡🎒✨
        </p>

        {/* Story & Interactive Features */}
        <div className="mt-4 space-y-2 text-left">
          <div className="bg-white/90 p-3 rounded-2xl border border-pink-200 shadow-xs flex items-center gap-3">
            <span className="text-2xl">👨‍👩‍👧‍👦</span>
            <div>
              <h4 className="font-bubble font-bold text-gray-800 text-xs sm:text-sm">Keluarga Tercinta di Rumah</h4>
              <p className="text-gray-600 text-[11px] sm:text-xs">
                Sapa <b>Abi</b> yang sedang bekerja di laptop, ambil bekal berkah <b>Ummi bercadar</b> yang menyapu, tabuh drumband bareng <b>Adek Khalid</b>, dan balapan mobilan sama <b>Adek Faqih</b>!
              </p>
            </div>
          </div>

          <div className="bg-white/90 p-3 rounded-2xl border border-indigo-200 shadow-xs flex items-center gap-3">
            <span className="text-2xl">🎒</span>
            <div>
              <h4 className="font-bubble font-bold text-gray-800 text-xs sm:text-sm">Misi TK & Ibu Santi</h4>
              <p className="text-gray-600 text-[11px] sm:text-xs">
                Cari <b>Tas Ransel</b>, <b>Botol Minum</b>, dan <b>Buku Gambar</b> di sekitar rumah, lalu temui <b>Ibu Santi</b> di gerbang TK untuk dapat Piagam Siswa Teladan! 🏅
              </p>
            </div>
          </div>

          <div className="bg-white/90 p-3 rounded-2xl border border-rose-200 shadow-xs flex items-center gap-3">
            <span className="text-2xl">🛴</span>
            <div>
              <h4 className="font-bubble font-bold text-gray-800 text-xs sm:text-sm">Skuter Pink & Siklus Waktu Alami</h4>
              <p className="text-gray-600 text-[11px] sm:text-xs">
                Naiki <b>Skuter Pink Khaulah</b> untuk ngebut (bunyikan bel <b>[H]</b> "kring-kring!"), dan nikmati keindahan langit yang berganti otomatis dari <b>Subuh 🌅</b>, <b>Siang ☀️</b>, <b>Sore 🌇</b>, hingga <b>Malam Berbintang 🌙</b>!
              </p>
            </div>
          </div>

          <div className="bg-white/90 p-3 rounded-2xl border border-purple-200 shadow-xs flex items-center gap-3">
            <span className="text-2xl">🪄</span>
            <div>
              <h4 className="font-bubble font-bold text-gray-800 text-xs sm:text-sm">Tongkat Suara Ajaib AI [M]</h4>
              <p className="text-gray-600 text-[11px] sm:text-xs">
                Bicara apa saja lewat mikrofon: minta malam bertabur bintang, lari kilat, hujan balon, kue ulang tahun, atau ngobrol bebas dengan <b>Adek Khalid & Keluarga</b>! 🎙️✨
              </p>
            </div>
          </div>

          <div className="bg-white/90 p-3 rounded-2xl border border-amber-200 shadow-xs flex items-center gap-3">
            <span className="text-2xl">💻</span>
            <div>
              <h4 className="font-bubble font-bold text-gray-800 text-xs sm:text-sm">Kontrol MacBook (Persis Roblox)</h4>
              <p className="text-gray-600 text-[11px] sm:text-xs">
                <b>W A S D</b>: Jalan | <b>M</b>: Tongkat Ajaib 🪄 | <b>Spasi</b>: Lompat | <b>E</b>: Aksi | <b>H</b>: Bel | <b>R</b>: Rumah 🏡
              </p>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="mt-5">
          <button
            onClick={handleStart}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-600 text-white font-bubble font-bold text-base shadow-xl active:scale-95 transition-all border-2 border-white flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Mulai Petualangan, Khaulah! 🚀✨</span>
          </button>
        </div>
      </div>
    </div>
  );
};
