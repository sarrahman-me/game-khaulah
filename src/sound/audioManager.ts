// Web Audio API procedural sound engine for Khaulah 3D World
// No external assets required, zero latency, 100% reliable

export type TimeCyclePeriod = 'subuh' | 'siang' | 'sore' | 'malam';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmInterval: number | null = null;
  private ambientInterval: number | null = null;
  private bgmPlaying: boolean = false;
  private currentTimeOfDay: TimeCyclePeriod = 'siang';

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
  public playAnimalSound(type: 'duck' | 'cat' | 'bunny' | 'panda' | 'sheep' | 'horse') {
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
    } else if (type === 'sheep') {
      // Baaa: warm vibrato pulse
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.linearRampToValueAtTime(260, now + 0.35);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'horse') {
      // Friendly neigh/whinny pitch jump
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.linearRampToValueAtTime(700, now + 0.18);
      osc.frequency.linearRampToValueAtTime(550, now + 0.35);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.38);
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

  // Slide Whoosh: exhilarating wind sound as Khaulah slides down
  public playSlideWhoosh() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.65);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.68);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.68);
  }

  // Swing ride: gentle rhythmic whoosh
  public playSwingRide() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.linearRampToValueAtTime(360, now + 0.3);
    osc.frequency.linearRampToValueAtTime(260, now + 0.6);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.65);
  }

  // Ummi's Bekal snack buff sound: delicious chomp + sparkle upgrade
  public playSnackBuff() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73]; // A major sparkling chord

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const t = now + idx * 0.06;
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.32);
    });
  }

  // High five with Abi
  public playHighFive() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Baby Faqih's cute giggle / coo
  public playBabyGiggle() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const giggleFreqs = [700, 850, 750, 920];

    giggleFreqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const t = now + idx * 0.08;
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.exponentialRampToValueAtTime(f + 100, t + 0.07);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.075);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    });
  }

  // Warm family greeting chord
  public playFamilyChord() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [329.63, 392.00, 493.88, 659.25]; // E minor / warm pastoral chord

    freqs.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    });
  }

  // Abi's Laptop keyboard typing sound: rapid crisp laptop keyclicks
  public playKeyboardTyping() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Series of 5 rapid key clicks
    const keyClicks = [
      { t: 0.0, f: 1800 },
      { t: 0.05, f: 1650 },
      { t: 0.09, f: 1950 },
      { t: 0.14, f: 1720 },
      { t: 0.19, f: 2100 },
    ];

    keyClicks.forEach(({ t, f }) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + t);
      osc.frequency.exponentialRampToValueAtTime(f * 0.4, now + t + 0.025);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.setValueAtTime(0.16, now + t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + 0.035);
    });
  }

  // Ummi's broom sweeping sound: gentle rhythmic brush swish
  public playBroomSweep() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Two brush strokes
    [0.0, 0.18].forEach((offset) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now + offset);
      osc.frequency.linearRampToValueAtTime(180, now + offset + 0.14);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.setValueAtTime(0.14, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.16);
    });
  }

  // Khalid's drumband snare rhythm: energetic marching band drum cadence
  public playDrumband() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Rhythmic marching beat: dum - tak - tak - DUM!
    const drumHits = [
      { t: 0.0, f: 190, tone: 'dum', gain: 0.28, len: 0.1 },
      { t: 0.1, f: 290, tone: 'tak', gain: 0.32, len: 0.07 },
      { t: 0.18, f: 310, tone: 'tak', gain: 0.32, len: 0.07 },
      { t: 0.26, f: 210, tone: 'dum', gain: 0.35, len: 0.14 },
    ];

    drumHits.forEach((hit) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = hit.tone === 'tak' ? 'triangle' : 'sine';
      const startT = now + hit.t;
      osc.frequency.setValueAtTime(hit.f, startT);
      osc.frequency.exponentialRampToValueAtTime(80, startT + hit.len);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.setValueAtTime(hit.gain, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + hit.len);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startT);
      osc.stop(startT + hit.len + 0.02);
    });
  }

  // Faqih's toy car sound: playful engine rev "vroom" + mini horn "pip pip!"
  public playToyCar() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Engine revving
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.22);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.38);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.42);

    // 2. Cute double horn "pip pip!"
    [0.42, 0.54].forEach((hornT) => {
      if (!this.ctx) return;
      const hornOsc = this.ctx.createOscillator();
      const hornGain = this.ctx.createGain();

      hornOsc.type = 'sine';
      hornOsc.frequency.setValueAtTime(880, now + hornT);

      hornGain.gain.setValueAtTime(0.001, now);
      hornGain.gain.setValueAtTime(0.2, now + hornT);
      hornGain.gain.exponentialRampToValueAtTime(0.001, now + hornT + 0.08);

      hornOsc.connect(hornGain);
      hornGain.connect(this.ctx.destination);
      hornOsc.start(now + hornT);
      hornOsc.stop(now + hornT + 0.09);
    });
  }

  // --- PROCEDURAL DYNAMIC AUDIO PER SIKLUS WAKTU (SUBUH, SIANG, SORE, MALAM) ---

  // Suara kicauan burung pagi lembut (ambient Subuh)
  private playBirdChirp() {
    if (this.isMuted || !this.ctx || !this.bgmPlaying) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2600, now);
    osc.frequency.linearRampToValueAtTime(3400, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(2400, now + 0.15);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.015, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Suara jangkrik malam lembut (ambient Malam)
  private playCricketChirp() {
    if (this.isMuted || !this.ctx || !this.bgmPlaying) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.045;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(4600 + Math.random() * 200, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.008, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.045);
    }
  }

  // Chime transisi natural penanda pergantian siklus waktu
  public playTimeTransition(time: TimeCyclePeriod) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const transitionNotes: Record<TimeCyclePeriod, number[]> = {
      subuh: [293.66, 440.00, 587.33], // D4 -> A4 -> D5 (Fajar sejuk merekah damai)
      siang: [523.25, 659.25, 783.99, 1046.50], // C5 -> E5 -> G5 -> C6 (Matahari ceria bersinar)
      sore: [392.00, 493.88, 587.33], // G4 -> B4 -> D5 (Senja keemasan hangat)
      malam: [739.99, 932.33, 1108.73], // F#5 -> A#5 -> C#6 (Bintang-bintang gemerlap)
    };

    const notes = transitionNotes[time] || transitionNotes.siang;
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const t = now + idx * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = time === 'malam' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.035, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.48);
    });
  }

  // Update siklus waktu dan sesuaikan audio jika sedang berjalan
  public setTimeOfDay(time: TimeCyclePeriod, playTransitionChime: boolean = true) {
    if (this.currentTimeOfDay === time) return;
    this.currentTimeOfDay = time;
    if (playTransitionChime) {
      this.playTimeTransition(time);
    }
    if (this.bgmPlaying) {
      this.restartBgmForCurrentTime();
    }
  }

  // Memulai trek instrumen & melodi sesuai siklus waktu
  private startBgmTrack(time: TimeCyclePeriod) {
    if (!this.bgmPlaying || !this.ctx || this.isMuted) return;

    let noteIdx = 0;

    if (time === 'subuh') {
      // 1. SUBUH: Seruling embun pagi lembut & damai (D-minor / F-major pentatonic)
      const melody = [
        293.66, 329.63, 392.00, 440.00, // D4, E4, G4, A4
        392.00, 329.63, 293.66, 220.00, // G4, E4, D4, A3
        293.66, 392.00, 440.00, 523.25, // D4, G4, A4, C5
        587.33, 440.00, 392.00, 329.63, // D5, A4, G4, E4
        392.00, 440.00, 493.88, 587.33, // G4, A4, B4, D5
        440.00, 392.00, 329.63, 293.66, // A4, G4, E4, D4
        293.66, 392.00, 329.63, 293.66, // D4, G4, E4, D4
      ];

      const playSubuhNote = () => {
        if (!this.bgmPlaying || !this.ctx || this.isMuted) return;
        const freq = melody[noteIdx % melody.length];
        noteIdx++;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Gentle flute-like envelope
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.035, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.55);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.58);
      };

      this.bgmInterval = window.setInterval(playSubuhNote, 460);

      // Kicauan burung fajar berkala
      this.ambientInterval = window.setInterval(() => {
        if (Math.random() > 0.3) {
          this.playBirdChirp();
        }
      }, 3200);

    } else if (time === 'siang') {
      // 2. SIANG: Bouncy cheerful marimba (C-Major riang gembira)
      const melody = [
        523.25, 587.33, 659.25, 783.99, // C5, D5, E5, G5
        659.25, 587.33, 523.25, 392.00, // E5, D5, C5, G4
        440.00, 523.25, 659.25, 587.33, // A4, C5, E5, D5
        523.25, 659.25, 783.99, 1046.50,// C5, E5, G5, C6
        880.00, 783.99, 659.25, 523.25, // A5, G5, E5, C5
        587.33, 659.25, 587.33, 392.00, // D5, E5, D5, G4
        440.00, 523.25, 659.25, 783.99, // A4, C5, E5, G5
        659.25, 587.33, 523.25, 523.25, // E5, D5, C5, C5
      ];

      const playSiangNote = () => {
        if (!this.bgmPlaying || !this.ctx || this.isMuted) return;
        const freq = melody[noteIdx % melody.length];
        noteIdx++;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Warm marimba envelope
        gain.gain.setValueAtTime(0.045, now);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.34);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      };

      this.bgmInterval = window.setInterval(playSiangNote, 270);

    } else if (time === 'sore') {
      // 3. SORE: Warm Kalimba / Sunset Harp (G-Major senja hangat)
      const melody = [
        392.00, 440.00, 493.88, 587.33, // G4, A4, B4, D5
        493.88, 440.00, 392.00, 329.63, // B4, A4, G4, E4
        392.00, 493.88, 587.33, 659.25, // G4, B4, D5, E5
        587.33, 493.88, 440.00, 392.00, // D5, B4, A4, G4
        440.00, 493.88, 587.33, 440.00, // A4, B4, D5, A4
        493.88, 440.00, 392.00, 329.63, // B4, A4, G4, E4
        329.63, 392.00, 440.00, 493.88, // E4, G4, A4, B4
        392.00, 392.00, 293.66, 392.00, // G4, G4, D4, G4
      ];

      const playSoreNote = () => {
        if (!this.bgmPlaying || !this.ctx || this.isMuted) return;
        const freq = melody[noteIdx % melody.length];
        noteIdx++;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Kalimba envelope with warm decay
        gain.gain.setValueAtTime(0.038, now);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.42);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.45);
      };

      this.bgmInterval = window.setInterval(playSoreNote, 350);

    } else {
      // 4. MALAM: Celesta / Sparkling Starry Music Box Lullaby
      const melody = [
        554.37, 622.25, 739.99, 830.61, // C#5, D#5, F#5, G#5
        739.99, 622.25, 554.37, 466.16, // F#5, D#5, C#5, A#4
        466.16, 554.37, 622.25, 739.99, // A#4, C#5, D#5, F#5
        830.61, 932.33, 1108.73, 830.61,// G#5, A#5, C#6, G#5
        739.99, 622.25, 554.37, 622.25, // F#5, D#5, C#5, D#5
        554.37, 466.16, 369.99, 466.16, // C#5, A#4, F#4, A#4
        554.37, 622.25, 739.99, 622.25, // C#5, D#5, F#5, D#5
        554.37, 369.99, 554.37, 554.37, // C#5, F#4, C#5, C#5
      ];

      const playMalamNote = () => {
        if (!this.bgmPlaying || !this.ctx || this.isMuted) return;
        const freq = melody[noteIdx % melody.length];
        noteIdx++;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Music box / celesta chime envelope
        gain.gain.setValueAtTime(0.034, now);
        gain.gain.exponentialRampToValueAtTime(0.0003, now + 0.58);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
      };

      this.bgmInterval = window.setInterval(playMalamNote, 430);

      // Jangkrik malam lembut berkala
      this.ambientInterval = window.setInterval(() => {
        this.playCricketChirp();
      }, 2400);
    }
  }

  // Mulai atau lanjutkan BGM sesuai siklus waktu saat ini
  public startBgm(time?: TimeCyclePeriod) {
    if (time) {
      this.currentTimeOfDay = time;
    }
    if (this.bgmPlaying || this.isMuted) return;
    this.initCtx();
    this.bgmPlaying = true;
    this.startBgmTrack(this.currentTimeOfDay);
  }

  // Restart BGM dengan mulus ke siklus waktu saat ini
  private restartBgmForCurrentTime() {
    if (!this.bgmPlaying) return;
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    if (this.ambientInterval !== null) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
    this.startBgmTrack(this.currentTimeOfDay);
  }

  // Realistic cute double bicycle bell "Kring.. kring!"
  public playBicycleBell() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const rings = [0, 0.09, 0.22, 0.31];

    rings.forEach((ringT) => {
      if (!this.ctx) return;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(1975.53, now + ringT); // B6
      osc2.frequency.setValueAtTime(2637.02, now + ringT); // E7

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.setValueAtTime(0.18, now + ringT);
      gain.gain.exponentialRampToValueAtTime(0.001, now + ringT + 0.08);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now + ringT);
      osc1.stop(now + ringT + 0.09);
      osc2.start(now + ringT);
      osc2.stop(now + ringT + 0.09);
    });
  }

  // Sparkling crystal tone for picking up quest items (backpack, bottle, book)
  public playQuestItemCollect() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [659.25, 830.61, 987.77, 1318.51]; // E5, G#5, B5, E6 sparkle

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const noteStart = now + idx * 0.06;
      osc.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.setValueAtTime(0.22, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + 0.32);
    });
  }

  // Triumphant orchestral celebration when completing school quest with Bu Guru
  public playQuestComplete() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chords = [
      { f: [523.25, 659.25, 783.99], t: 0, d: 0.18 },
      { f: [587.33, 739.99, 880.00], t: 0.18, d: 0.18 },
      { f: [659.25, 830.61, 987.77], t: 0.36, d: 0.22 },
      { f: [783.99, 987.77, 1174.66, 1567.98], t: 0.58, d: 0.7 },
    ];

    chords.forEach((chord) => {
      chord.f.forEach((freq) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        const start = now + chord.t;
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.setValueAtTime(0.16, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + chord.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + chord.d + 0.05);
      });
    });
  }

  // Choo-Choo train whistle: melodic two-tone toot-toot!
  public playTrainWhistle() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const toots = [
      { f1: 587.33, f2: 739.99, start: 0.0, dur: 0.28 },
      { f1: 587.33, f2: 739.99, start: 0.36, dur: 0.45 },
    ];

    toots.forEach(({ f1, f2, start, dur }) => {
      [f1, f2].forEach((freq) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        const t = now + start;
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + dur + 0.02);
      });
    });
  }

  // Friendly Fire Truck siren: upbeat alternating two-tone niu-niu!
  public playFireSiren() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const tones = [
      { f: 880, start: 0.0, dur: 0.18 },
      { f: 659, start: 0.19, dur: 0.18 },
      { f: 880, start: 0.38, dur: 0.18 },
      { f: 659, start: 0.57, dur: 0.22 },
    ];

    tones.forEach(({ f, start, dur }) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const t = now + start;
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + dur + 0.02);
    });
  }

  // Festive Carnival Music Box snippet
  public playCarnivalTune() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // C, E, G, A, G, E, C melody
    const notes = [523.25, 659.25, 783.99, 880.00, 783.99, 659.25, 523.25];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const t = now + idx * 0.12;
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.18);
    });
  }

  // Cash register / shopping scanner: cheerful Ka-Ching beep!
  public playCashRegister() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Beep then metallic ring
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1400, now);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.08);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(2093, now + 0.08); // C7
    gain2.gain.setValueAtTime(0.0001, now);
    gain2.gain.setValueAtTime(0.22, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.36);
  }

  // Gentle water splash for pedal boat & beach
  public playWaterSplash() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.28);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Suara langkah kecipak air ceria saat berada / melangkah di air
  public playWaterStep() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const startFreq = 420 + Math.random() * 80;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(140 + Math.random() * 30, now + 0.12);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.09, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  public stopBgm() {
    this.bgmPlaying = false;
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    if (this.ambientInterval !== null) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
  }

  public toggleBgm(time?: TimeCyclePeriod): boolean {
    if (this.bgmPlaying) {
      this.stopBgm();
      return false;
    } else {
      this.startBgm(time);
      return true;
    }
  }

  public isBgmActive(): boolean {
    return this.bgmPlaying;
  }

  public getCurrentTimeOfDay(): TimeCyclePeriod {
    return this.currentTimeOfDay;
  }
}

export const soundManager = new SoundEngine();
