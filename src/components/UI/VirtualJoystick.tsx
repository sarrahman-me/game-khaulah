import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useGameStore, gameStore } from '../../state/useGameStore';
import { ArrowUp, Sparkles, Smile, RotateCcw, Target, ZoomIn, ZoomOut } from 'lucide-react';

export const VirtualJoystick: React.FC = () => {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [touchId, setTouchId] = useState<number | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [activeKeys, setActiveKeys] = useState<{ [key: string]: boolean }>({});

  const isShiftLock = useGameStore((s) => s.isShiftLock);

  useEffect(() => {
    // Detect touch device
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouchDevice(true);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      setActiveKeys((prev) => ({ ...prev, [e.code]: true }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setActiveKeys((prev) => ({ ...prev, [e.code]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchId !== null) return;
    const touch = e.changedTouches[0];
    setTouchId(touch.identifier);
    updateKnob(touch.clientX, touch.clientY);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (touchId === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchId) {
        updateKnob(touch.clientX, touch.clientY);
        break;
      }
    }
  }, [touchId]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (touchId === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchId) {
        setTouchId(null);
        setKnobPos({ x: 0, y: 0 });
        gameStore.setJoystick({ x: 0, y: 0 });
        break;
      }
    }
  }, [touchId]);

  const updateKnob = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const maxRadius = rect.width / 2;

    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const clampedDist = Math.min(distance, maxRadius);
    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    setKnobPos({ x: knobX, y: knobY });

    const normX = clampedDist > 10 ? knobX / maxRadius : 0;
    const normY = clampedDist > 10 ? knobY / maxRadius : 0;
    gameStore.setJoystick({ x: normX, y: normY });
  };

  useEffect(() => {
    if (touchId !== null) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      window.addEventListener('touchcancel', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [touchId, handleTouchMove, handleTouchEnd]);

  // Keys active check
  const isUp = activeKeys['KeyW'] || activeKeys['ArrowUp'];
  const isDown = activeKeys['KeyS'] || activeKeys['ArrowDown'];
  const isLeft = activeKeys['KeyA'] || activeKeys['ArrowLeft'];
  const isRight = activeKeys['KeyD'] || activeKeys['ArrowRight'];
  const isJump = activeKeys['Space'];

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20">
      {/* --- BOTTOM LEFT: TOUCH JOYSTICK OR MACBOOK KEYBOARD VISUALIZER --- */}
      <div className="absolute bottom-6 left-6 pointer-events-auto">
        {isTouchDevice ? (
          /* Mobile / Tablet Joystick */
          <div
            ref={joystickBaseRef}
            onTouchStart={handleTouchStart}
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white/30 backdrop-blur-md border-4 border-white/60 shadow-xl flex items-center justify-center relative touch-none"
          >
            <div className="absolute top-2 text-white/70 text-xs font-bold">▲</div>
            <div className="absolute bottom-2 text-white/70 text-xs font-bold">▼</div>
            <div className="absolute left-2 text-white/70 text-xs font-bold">◀</div>
            <div className="absolute right-2 text-white/70 text-xs font-bold">▶</div>

            <div
              style={{
                transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
              }}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-pink-400 to-rose-400 border-2 border-white shadow-lg flex items-center justify-center pointer-events-none transition-transform duration-75"
            >
              <span className="text-white text-lg">🌸</span>
            </div>
          </div>
        ) : (
          /* MacBook Roblox Keyboard Visualizer: Lights up as Khaulah presses keys! */
          <div className="bg-black/40 backdrop-blur-md p-3 rounded-3xl border-2 border-white/30 shadow-2xl flex flex-col items-center gap-1.5 transition-all">
            <div className="text-[10px] text-white/80 font-bold uppercase tracking-wider mb-0.5">
              Tombol Gerak Roblox
            </div>
            {/* W / Up Key */}
            <div
              className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-bubble font-bold border-2 transition-all ${
                isUp
                  ? 'bg-pink-500 text-white border-white scale-110 shadow-lg shadow-pink-500/50'
                  : 'bg-white/20 text-white/90 border-white/40'
              }`}
            >
              <span className="text-sm leading-none">W</span>
              <span className="text-[9px] opacity-70">▲</span>
            </div>

            {/* A, S, D Keys */}
            <div className="flex gap-1.5">
              <div
                className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-bubble font-bold border-2 transition-all ${
                  isLeft
                    ? 'bg-pink-500 text-white border-white scale-110 shadow-lg shadow-pink-500/50'
                    : 'bg-white/20 text-white/90 border-white/40'
                }`}
              >
                <span className="text-sm leading-none">A</span>
                <span className="text-[9px] opacity-70">◀</span>
              </div>
              <div
                className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-bubble font-bold border-2 transition-all ${
                  isDown
                    ? 'bg-pink-500 text-white border-white scale-110 shadow-lg shadow-pink-500/50'
                    : 'bg-white/20 text-white/90 border-white/40'
                }`}
              >
                <span className="text-sm leading-none">S</span>
                <span className="text-[9px] opacity-70">▼</span>
              </div>
              <div
                className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-bubble font-bold border-2 transition-all ${
                  isRight
                    ? 'bg-pink-500 text-white border-white scale-110 shadow-lg shadow-pink-500/50'
                    : 'bg-white/20 text-white/90 border-white/40'
                }`}
              >
                <span className="text-sm leading-none">D</span>
                <span className="text-[9px] opacity-70">▶</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- BOTTOM CENTER: MACBOOK ROBLOX CONTROL DOCK --- */}
      <div className="hidden lg:flex absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-900/75 backdrop-blur-md px-5 py-2.5 rounded-full text-white text-xs gap-3 pointer-events-none items-center border border-white/20 shadow-2xl">
        <div className="flex items-center gap-1.5">
          <kbd className="px-2 py-0.5 bg-white/20 rounded font-mono text-[11px] font-bold">W A S D</kbd>
          <span className="text-white/80">Jalan</span>
        </div>
        <span className="text-white/30">•</span>
        <div className="flex items-center gap-1.5">
          <kbd className="px-2 py-0.5 bg-emerald-500/80 rounded font-mono text-[11px] font-bold text-white">Spasi</kbd>
          <span className="text-white/80">Lompat</span>
        </div>
        <span className="text-white/30">•</span>
        <div className="flex items-center gap-1.5">
          <kbd className="px-2 py-0.5 bg-pink-500/80 rounded font-mono text-[11px] font-bold text-white">E</kbd>
          <span className="text-white/80">Aksi / Skuter</span>
        </div>
        <span className="text-white/30">•</span>
        <div className="flex items-center gap-1.5">
          <kbd className="px-2 py-0.5 bg-amber-500/80 rounded font-mono text-[11px] font-bold text-white">H</kbd>
          <span className="text-white/80">Bel</span>
        </div>
        <span className="text-white/30">•</span>
        <div className="flex items-center gap-1.5">
          <kbd className="px-2 py-0.5 bg-white/20 rounded font-mono text-[11px] font-bold">2 Jari</kbd>
          <span className="text-white/80">Kamera</span>
        </div>
        <span className="text-white/30">•</span>
        <div className="flex items-center gap-1.5">
          <kbd className="px-2 py-0.5 bg-indigo-500/80 rounded font-mono text-[11px] font-bold text-white">Shift</kbd>
          <span className="text-white/80">Kunci</span>
        </div>
        <span className="text-white/30">•</span>
        <div className="flex items-center gap-1.5">
          <kbd className="px-2 py-0.5 bg-rose-500/80 rounded font-mono text-[11px] font-bold text-white">R</kbd>
          <span className="text-white/80">Reset</span>
        </div>
      </div>

      {/* --- BOTTOM RIGHT: ACTION BUTTONS (CLICKABLE OR KEYBOARD) --- */}
      <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3 pointer-events-auto">
        {/* Quick Zoom Buttons for Trackpad Ease */}
        <div className="flex gap-2">
          <button
            onClick={() => gameStore.zoomCamera(-1.5)}
            className="w-10 h-10 rounded-2xl bg-white/70 hover:bg-white text-gray-800 shadow-md flex items-center justify-center border-2 border-white active:scale-90 transition-all font-bold text-xs"
            title="Perbesar Kamera (I)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => gameStore.zoomCamera(1.5)}
            className="w-10 h-10 rounded-2xl bg-white/70 hover:bg-white text-gray-800 shadow-md flex items-center justify-center border-2 border-white active:scale-90 transition-all font-bold text-xs"
            title="Perkecil Kamera (O)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Emote & Reset Mini Buttons */}
        <div className="flex gap-2">
          {/* Shift Lock Button */}
          <button
            onClick={() => gameStore.toggleShiftLock()}
            className={`h-11 px-3 rounded-2xl shadow-lg flex items-center gap-1.5 border-2 border-white active:scale-90 transition-all font-bubble text-xs ${
              isShiftLock
                ? 'bg-indigo-600 text-white shadow-indigo-500/40'
                : 'bg-white/80 hover:bg-white text-gray-700'
            }`}
            title="Kunci Kamera (Shift)"
          >
            <Target className="w-4 h-4" />
            <span>Kunci</span>
            <span className="text-[10px] bg-black/15 px-1 py-0.5 rounded font-mono">Shift</span>
          </button>

          {/* Dance Button */}
          <button
            onClick={() => {
              gameStore.triggerEmote('dance');
              gameStore.setMessage('Hore! Khaulah berjoget ceria! 💃🎶');
            }}
            className="w-11 h-11 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white shadow-lg flex items-center justify-center border-2 border-white active:scale-90 transition-all flex-col font-bold"
            title="Goyang Ceria (Q)"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[8px] leading-tight">Q</span>
          </button>

          {/* Wave Button */}
          <button
            onClick={() => {
              gameStore.triggerEmote('wave');
              gameStore.setMessage('Khaulah menyapa teman-teman! 👋✨');
            }}
            className="w-11 h-11 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white shadow-lg flex items-center justify-center border-2 border-white active:scale-90 transition-all flex-col font-bold"
            title="Sapa Halo (E)"
          >
            <Smile className="w-4 h-4" />
            <span className="text-[8px] leading-tight">E</span>
          </button>

          {/* Reset / Respawn Button */}
          <button
            onClick={() => gameStore.triggerRespawn()}
            className="w-11 h-11 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white shadow-lg flex items-center justify-center border-2 border-white active:scale-90 transition-all flex-col font-bold"
            title="Kembali ke Checkpoint (R)"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-[8px] leading-tight">R</span>
          </button>
        </div>

        {/* Big Jump Button (Spacebar) */}
        <button
          onPointerDown={() => gameStore.setJumpPressed(true)}
          onPointerUp={() => gameStore.setJumpPressed(false)}
          onPointerLeave={() => gameStore.setJumpPressed(false)}
          className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-4 border-white shadow-2xl flex flex-col items-center justify-center text-white active:scale-95 transition-all select-none touch-none ${
            isJump
              ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 scale-105 shadow-emerald-500/50'
              : 'bg-gradient-to-tr from-emerald-400 to-teal-400'
          }`}
        >
          <ArrowUp className="w-7 h-7 sm:w-8 sm:h-8 animate-bounce" strokeWidth={3} />
          <span className="font-bubble font-bold text-xs sm:text-sm tracking-wide mt-0.5">LOMPAT!</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono mt-0.5">Spasi</span>
        </button>
      </div>
    </div>
  );
};
