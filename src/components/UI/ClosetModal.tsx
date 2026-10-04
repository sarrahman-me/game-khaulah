import React from 'react';
import { useGameStore, gameStore, AccessoryType, PetType } from '../../state/useGameStore';
import { X, Sparkles, Check } from 'lucide-react';

interface AccessoryItem {
  id: AccessoryType;
  name: string;
  icon: string;
  color: string;
}

interface PetItem {
  id: PetType;
  name: string;
  icon: string;
  desc: string;
}

const ACCESSORIES: AccessoryItem[] = [
  { id: 'bunny_ears', name: 'Telinga Kelinci', icon: '🐰', color: 'from-pink-300 to-rose-300' },
  { id: 'princess_crown', name: 'Mahkota Putri', icon: '👑', color: 'from-amber-300 to-yellow-400' },
  { id: 'fairy_wings', name: 'Sayap Peri', icon: '🧚‍♀️', color: 'from-sky-300 to-indigo-300' },
  { id: 'cat_ears', name: 'Telinga Kucing', icon: '🐱', color: 'from-orange-300 to-amber-300' },
  { id: 'star_halo', name: 'Halo Bintang', icon: '✨', color: 'from-yellow-200 to-lime-300' },
  { id: 'none', name: 'Tanpa Aksesoris', icon: '🎀', color: 'from-gray-200 to-gray-300' },
];

const PETS: PetItem[] = [
  { id: 'kitten', name: 'Mimi Si Kucing', icon: '🐱', desc: 'Suka melompat dan mengeong riang' },
  { id: 'puppy', name: 'Bobo Si Anjing', icon: '🐶', desc: 'Setia berlari mengikuti Khaulah' },
  { id: 'fairy', name: 'Pipit Si Peri', icon: '✨', desc: 'Terbang dengan taburan cahaya bintang' },
  { id: 'none', name: 'Istirahat Mandiri', icon: '🍃', desc: 'Bermain sendiri tanpa peliharaan' },
];

export const ClosetModal: React.FC = () => {
  const isClosetOpen = useGameStore((s) => s.isClosetOpen);
  const activeAccessory = useGameStore((s) => s.activeAccessory);
  const activePet = useGameStore((s) => s.activePet);

  React.useEffect(() => {
    if (!isClosetOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        gameStore.setClosetOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isClosetOpen]);

  if (!isClosetOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-gradient-to-b from-pink-50 via-purple-50 to-white w-full max-w-lg rounded-3xl border-4 border-pink-300 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => gameStore.setClosetOpen(false)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center border-2 border-white shadow-md active:scale-90 transition-transform"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-1 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-4 h-4 text-pink-500" />
            Lemari Cantik Khaulah
          </div>
          <h2 className="text-2xl sm:text-3xl font-bubble font-bold text-purple-900">
            Pilih Aksesoris & Sahabat!
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">
            Ganti penampilan Khaulah sesukamu agar petualangan makin seru!
          </p>
        </div>

        {/* Section 1: Accessories */}
        <div className="mb-6">
          <h3 className="font-bubble font-bold text-pink-700 text-base mb-3 flex items-center gap-2">
            <span>👑</span> Bando & Hiasan Rambut
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {ACCESSORIES.map((item) => {
              const isSelected = activeAccessory === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => gameStore.setAccessory(item.id)}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center relative transition-all active:scale-95 ${
                    isSelected
                      ? 'border-pink-500 bg-pink-100/90 shadow-md scale-105'
                      : 'border-purple-200/60 bg-white/80 hover:bg-white'
                  }`}
                >
                  <span className="text-3xl mb-1">{item.icon}</span>
                  <span className="text-xs font-bubble font-semibold text-gray-800 text-center leading-tight">
                    {item.name}
                  </span>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-pink-500 text-white rounded-full flex items-center justify-center shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Pet Companions */}
        <div className="mb-6">
          <h3 className="font-bubble font-bold text-indigo-700 text-base mb-3 flex items-center gap-2">
            <span>🐾</span> Teman Petualang (Pet)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {PETS.map((pet) => {
              const isSelected = activePet === pet.id;
              return (
                <button
                  key={pet.id}
                  onClick={() => gameStore.setPet(pet.id)}
                  className={`p-3.5 rounded-2xl border-2 text-left flex items-start gap-3 relative transition-all active:scale-95 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/90 shadow-md scale-[1.02]'
                      : 'border-purple-200/60 bg-white/80 hover:bg-white'
                  }`}
                >
                  <span className="text-3xl shrink-0">{pet.icon}</span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bubble font-bold text-gray-900 leading-tight">
                      {pet.name}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 leading-snug">
                      {pet.desc}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Button */}
        <div className="text-center">
          <button
            onClick={() => gameStore.setClosetOpen(false)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-bubble font-bold text-base shadow-xl active:scale-95 transition-transform border-2 border-white"
          >
            Selesai Berhias! Ayo Main Lagi! 🌈
          </button>
        </div>
      </div>
    </div>
  );
};
