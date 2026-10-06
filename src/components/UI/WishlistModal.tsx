import React, { useState, useEffect } from 'react';
import { useGameStore, gameStore } from '../../state/useGameStore';
import { getSavedWishes, removeWishItem, WishlistItem } from '../../services/aiService';
import { BookOpen, X, Trash2, Sparkles, Heart } from 'lucide-react';

export const WishlistModal: React.FC = () => {
  const isOpen = useGameStore((s) => s.isWishlistOpen);
  const [wishes, setWishes] = useState<WishlistItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setWishes(getSavedWishes());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (id: string) => {
    removeWishItem(id);
    setWishes(getSavedWishes());
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center p-3 sm:p-5 bg-indigo-950/60 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-gradient-to-b from-amber-50 via-pink-50 to-white w-full max-w-xl max-h-[88vh] rounded-3xl border-4 border-yellow-300 shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 p-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border-2 border-white flex items-center justify-center text-2xl shadow">
              📖
            </div>
            <div>
              <h2 className="text-xl font-bubble font-bold text-white drop-shadow">
                Buku Impian Rahasia Khaulah ✨
              </h2>
              <p className="text-xs text-yellow-100 font-semibold">
                Catatan ide & mantra kreatif yang diminta Khaulah kepada Tongkat Ajaib!
              </p>
            </div>
          </div>

          <button
            onClick={() => gameStore.closeWishlistModal()}
            className="w-10 h-10 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center border-2 border-white shadow active:scale-90 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
          {wishes.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-2 animate-bounce-slow" />
              <h3 className="font-bubble text-lg font-bold text-gray-800">
                Buku Impian Masih Bersih & Rapi! ✨
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Khaulah bisa buka Tongkat Suara Ajaib dan minta hal-hal baru (misal: "aku mau dinosaurus", "istana es", "kolam permen") untuk dicatat di sini!
              </p>
            </div>
          ) : (
            wishes.map((w) => (
              <div
                key={w.id}
                className="bg-white rounded-2xl p-4 border-2 border-amber-200 shadow-sm flex items-start justify-between gap-3 hover:border-pink-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl shrink-0 border border-amber-300 mt-0.5">
                    ⭐
                  </div>
                  <div>
                    <h4 className="font-bubble font-bold text-sm sm:text-base text-purple-950">
                      "{w.prompt}"
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 font-bubble leading-relaxed">
                      {w.speech}
                    </p>
                    <span className="inline-block text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 mt-2 font-mono">
                      📅 {new Date(w.timestamp).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(w.id)}
                  title="Hapus Impian"
                  className="p-2 text-gray-400 hover:text-red-500 active:scale-90 transition-transform shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Note for Abi */}
        <div className="p-3 bg-amber-50 border-t border-amber-200 text-center">
          <p className="text-xs text-amber-900 font-bubble font-semibold flex items-center justify-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>Semua impian Khaulah tercatat otomatis agar Abi bisa mewujudkannya di update game berikutnya!</span>
          </p>
        </div>
      </div>
    </div>
  );
};
