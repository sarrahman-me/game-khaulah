// Web Audio API procedural sound engine for Khaulah 3D World
// No external assets required, zero latency, 100% reliable

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmInterval: number | null = null;
  private bgmPlaying: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.bgmPlaying) {
      this.stopBgm();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Jump sound: cheerful bouncy pitch bend
  public playJump() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.18);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Trampoline super-jump: high spring boing!
  public playTrampoline() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.35);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  // Star collect sound: magical sparkling chime
  public playStarCollect() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const noteStart = now + idx * 0.05;
      osc.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.setValueAtTime(0.2, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + 0.26);
    });
  }

  // Checkpoint sound: triumphant fanfare
  public playCheckpoint() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chords = [
      { f: 523.25, d: 0.1 },  // C5
      { f: 659.25, d: 0.1 },  // E5
      { f: 783.99, d: 0.12 }, // G5
      { f: 1046.50, d: 0.35 } // C6
    ];

    let t = now;
    chords.forEach((chord) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(chord.f, t);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + chord.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + chord.d);
      t += 0.08;
    });
  }

  // Animal friendly squeak/happy sound
  public playAnimalSound(type: 'duck' | 'cat' | 'bunny' | 'panda') {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === 'cat') {
      // Meow: upward then downward pitch glide
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.linearRampToValueAtTime(650, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.4);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === 'duck') {
      // Quack: quick sawtooth tone
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(260, now + 0.15);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } else {
      // Bunny / Panda: cute high pop
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.12);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  }

  // Soft footstep
  public playFootstep() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140 + Math.random() * 20, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.06);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  // Cheerful background music: gentle procedural lullaby/marimba loop
  public startBgm() {
    if (this.bgmPlaying || this.isMuted) return;
    this.initCtx();
    this.bgmPlaying = true;

    // A sweet 8-bar pentatonic tune in C major (so it's always melodically harmonious)
    const melody = [
      523.25, 587.33, 659.25, 783.99,
      659.25, 587.33, 523.25, 392.00,
      440.00, 523.25, 659.25, 587.33,
      523.25, 659.25, 783.99, 1046.50,
      880.00, 783.99, 659.25, 523.25,
      587.33, 659.25, 587.33, 392.00,
      440.00, 523.25, 659.25, 783.99,
      659.25, 587.33, 523.25, 523.25,
    ];
    let noteIdx = 0;

    const playNextNote = () => {
      if (!this.bgmPlaying || !this.ctx || this.isMuted) return;
      const freq = melody[noteIdx % melody.length];
      noteIdx++;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Warm marimba envelope
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.38);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    };

    this.bgmInterval = window.setInterval(playNextNote, 280);
  }

  public stopBgm() {
    this.bgmPlaying = false;
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  public toggleBgm(): boolean {
    if (this.bgmPlaying) {
      this.stopBgm();
      return false;
    } else {
      this.startBgm();
      return true;
    }
  }

  public isBgmActive(): boolean {
    return this.bgmPlaying;
  }
}

export const soundManager = new SoundEngine();
