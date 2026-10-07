import React, { useState, useEffect, useRef } from 'react';
import { useGameStore, gameStore } from '../../state/useGameStore';
import { capturePhoto } from '../../services/photoCapture';
import { soundManager } from '../../sound/audioManager';
import confetti from 'canvas-confetti';
import { Camera, X, Download, Sparkles, Smile, RefreshCw, Palette } from 'lucide-react';

export const PhotoModeModal: React.FC = () => {
  const isPhotoMode = useGameStore((s) => s.isPhotoMode);
  const [caption, setCaption] = useState('Hari Bahagia Khaulah di Pulau Impian 🌸✨');
  const [stamp, setStamp] = useState<'⭐' | '💖' | '🌈' | '🌸' | '🐱' | 'none'>('🌸');
  const [filterStyle, setFilterStyle] = useState<'normal' | 'warm' | 'rose' | 'vintage'>('normal');
  const [isFlashing, setIsFlashing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);


  const flashTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(flashTimer.current), []);
  useEffect(() => { if (!isPhotoMode) setCapturedImage(null); }, [isPhotoMode]);

  const handleCapture = () => {
    try {
      const image = capturePhoto(caption, stamp, filterStyle);
      setCapturedImage(image);
      setIsFlashing(true);
      clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setIsFlashing(false), 250);
      soundManager.playHighFive();
      gameStore.unlockSticker('foto');
      gameStore.setMessage('Cekrek! Foto beserta judul, filter, dan stiker siap disimpan! 📸');
    } catch (error) {
      gameStore.setMessage(error instanceof Error ? error.message : 'Foto gagal dibuat. Coba lagi.');
    }
  };

  const handleDownload = () => {
    if (!capturedImage) return;
    const a = document.createElement('a');
    a.href = capturedImage;
    a.download = `Foto_Khaulah_${Date.now()}.png`;
    a.click();
    soundManager.playStarCollect();
    gameStore.setMessage('Alhamdulillah! Foto berhasil diunduh ke galeri! 💾💖');
  };

  if (!isPhotoMode) return null;

  const filterOverlayClasses = {
    normal: '',
    warm: 'bg-amber-500/10 mix-blend-color',
    rose: 'bg-pink-500/15 mix-blend-soft-light',
    vintage: 'bg-sepia-500/20 contrast-105',
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto flex flex-col justify-between p-3 sm:p-6 select-none animate-fade-in">
      {/* Shutter Flash */}
      {isFlashing && (
        <div className="fixed inset-0 z-50 bg-white pointer-events-none animate-ping duration-300 opacity-90" />
      )}

      {/* Top Controls Bar */}
      <div className="flex items-center justify-between w-full z-20">
        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-white flex items-center gap-2.5 shadow-lg">
          <Camera className="w-5 h-5 text-pink-400" />
          <div>
            <h3 className="text-sm font-bubble font-bold">Mode Foto Polaroid Khaulah 📸</h3>
            <p className="text-[10px] text-gray-300">Atur stiker & abadikan momen favoritmu!</p>
          </div>
        </div>

        <button
          onClick={() => {
            setCapturedImage(null);
            gameStore.setPhotoMode(false);
          }}
          className="w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center border-2 border-white shadow-xl active:scale-90 transition-transform"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Viewfinder Frame (Polaroid Overlay) */}
      <div className="flex-1 my-3 sm:my-4 relative flex items-center justify-center pointer-events-none">
        {/* Color Grading Filter Simulation */}
        <div className={`absolute inset-0 pointer-events-none rounded-3xl ${filterOverlayClasses[filterStyle]}`} />

        {/* Viewfinder Corners */}
        <div className="w-full max-w-2xl h-full max-h-[500px] border-4 border-white/70 rounded-3xl relative shadow-2xl overflow-hidden flex flex-col justify-between p-4 pointer-events-auto">
          {/* Top Stamp Ornament */}
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono font-bold text-white/80 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-xs">
              📸 FOTO
            </span>
            {stamp !== 'none' && (
              <span className="text-4xl animate-bounce-slow drop-shadow-lg">{stamp}</span>
            )}
          </div>

          {capturedImage && <img src={capturedImage} alt="Hasil foto Khaulah" className="absolute inset-0 w-full h-full object-contain bg-slate-900 z-20" />}
          {/* Rule of Thirds subtle lines */}
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-25">
            <div className="border-r border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-r border-white" />
            <div className="border-r border-white" />
            <div />
          </div>

          {/* Bottom Polaroid Caption Plate */}
          <div className="bg-white/95 rounded-2xl p-2.5 shadow-lg border-2 border-pink-200 pointer-events-auto flex items-center gap-2 z-10">
            <Smile className="w-5 h-5 text-pink-500 shrink-0" />
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="flex-1 bg-transparent text-gray-800 font-bubble text-sm font-bold focus:outline-none"
              placeholder="Tulis judul kenangan foto..."
              maxLength={45}
            />
          </div>
        </div>
      </div>

      {/* Bottom Tool Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3 z-20 pb-2">
        {/* Stamp Selector */}
        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border-2 border-white shadow-lg flex items-center gap-1.5 text-lg">
          {(['🌸', '⭐', '💖', '🌈', '🐱', 'none'] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                soundManager.playHighFive();
                setStamp(s);
              }}
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-transform ${
                stamp === s ? 'bg-pink-200 scale-110 shadow-xs' : 'hover:bg-gray-100'
              }`}
            >
              {s === 'none' ? '🚫' : s}
            </button>
          ))}
        </div>

        {/* Filter Toggle */}
        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border-2 border-white shadow-lg flex items-center gap-1 text-xs font-bubble font-bold text-gray-700">
          <Palette className="w-4 h-4 text-purple-600 mr-1" />
          {(
            [
              { id: 'normal', label: 'Cerah' },
              { id: 'warm', label: 'Hangat' },
              { id: 'rose', label: 'Mawar' },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => {
                soundManager.playHighFive();
                setFilterStyle(f.id);
              }}
              className={`px-2 py-1 rounded-lg transition-colors ${
                filterStyle === f.id ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Big Shutter / Capture Button */}
        <button
          onClick={handleCapture}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-white font-bubble font-bold text-base shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-3 border-white ring-4 ring-pink-300/50"
        >
          <Camera className="w-5 h-5 text-yellow-200 fill-yellow-200" />
          <span>Jepret Foto! 📸</span>
        </button>

        {/* Download Button if snapshot captured */}
        {capturedImage && (
          <button
            onClick={handleDownload}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bubble font-bold text-xs sm:text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 border-2 border-white animate-bounce-slow"
          >
            <Download className="w-4 h-4" />
            <span>Simpan PNG 💾</span>
          </button>
        )}
      </div>
    </div>
  );
};
