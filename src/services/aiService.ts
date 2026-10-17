// AI Service for Dunia Bahagia Khaulah 3D
// Connected to local endpoint via /ai-proxy or direct http://localhost:20128/v1
import { inferInteractionType } from '../state/useGameStore';
import type { SandboxPart, SandboxBehavior, SandboxInteractionType } from '../state/useGameStore';

export interface MagicActionResult {
  speech: string;
  action:
    | 'set_time'
    | 'speed_buff'
    | 'super_jump'
    | 'teleport'
    | 'set_accessory'
    | 'set_pet'
    | 'spawn_balloons'
    | 'spawn_cake'
    | 'spawn_bubbles'
    | 'spawn_stars'
    | 'celebrate'
    | 'play_sound'
    | 'riddle'
    | 'khalid_follow'
    | 'spawn_sandbox'
    | 'clear_sandbox'
    | 'wishlist'
    | 'chat_only';
  actionParam?: any;
  sandboxCreation?: {
    title: string;
    behavior?: SandboxBehavior;
    interactionType?: SandboxInteractionType;
    scale?: number;
    parts: SandboxPart[];
    physics?: 'none' | 'solid' | 'bouncy' | 'dynamic_ball' | 'dynamic_box';
    speech?: string;
  };
  wishlistTitle?: string;
  isWishRecorded?: boolean;
}

export interface WishlistItem {
  id: string;
  prompt: string;
  speech: string;
  category: string;
  timestamp: number;
}

const STORAGE_WISHLIST_KEY = 'khaulah_magic_wishlist';

export const AI_MODEL_NAME = 'ag/gemini-3.8-flash-low';
export const DEFAULT_AI_KEY = 'sk-4cab929cfbc506c0-qcqx76-caf94a9c';
export const AI_API_KEY =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_AI_API_KEY) ||
  DEFAULT_AI_KEY;
export const AI_API_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_AI_API_URL) ||
  'http://localhost:20128/v1';

async function callChatCompletion(messages: Array<{ role: string; content: string }>, jsonFormat = true): Promise<string> {
  const endpoints = ['/ai-proxy/chat/completions', `${AI_API_URL}/chat/completions`];

  let lastError: any = null;

  for (const url of endpoints) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    try {
      const payload: any = {
        model: AI_MODEL_NAME,
        messages,
        stream: false,
      };

      if (jsonFormat) {
        payload.response_format = { type: 'json_object' };
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (AI_API_KEY) {
        headers['Authorization'] = `Bearer ${AI_API_KEY}`;
      }

      const res = await fetch(url, {
        method: 'POST',
        signal: controller.signal,
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (typeof content === 'string' && content.trim()) {
        return content;
      }
    } catch (err) {
      lastError = err;
      // Use offline interpretation if the proxy is unavailable.
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError || new Error('Gagal menghubungi AI endpoint.');
}

// Offline fallback interpreter in case network or local AI server is down
function fallbackMagicInterpreter(input: string): MagicActionResult {
  const q = input.toLowerCase().trim();

  if (q.includes('karnaval') || q.includes('pasar malam')) {
    return { speech: 'Ayo bermain di Karnaval Pasar Malam Ceria! 🎡✨', action: 'teleport', actionParam: 'karnaval' };
  }
  if (q.includes('kelinci') && q.includes('telinga')) {
    return { speech: 'Bando telinga kelinci terpasang! 🐰🎀', action: 'set_accessory', actionParam: 'bunny_ears' };
  }
  if (q.includes('balon')) return { speech: 'Balon warna-warni muncul! 🎈✨', action: 'spawn_balloons', actionParam: { count: 16 } };
  if (q.includes('gelembung')) return { speech: 'Gelembung ajaib bermunculan! 🫧✨', action: 'spawn_bubbles', actionParam: { count: 24 } };
  if (q.includes('kue') || q.includes('ulang tahun')) return { speech: 'Kue ulang tahun untuk Khaulah! 🎂✨', action: 'spawn_cake' };
  if (q.includes('hujan bintang')) return { speech: 'Bintang emas bermunculan! ⭐✨', action: 'spawn_stars', actionParam: { count: 12 } };
  if (q.includes('tebak')) return { speech: 'Aku punya empat kaki dan suka mengeong. Siapakah aku? Kucing! 🐱', action: 'riddle' };
  if (q.includes('malam') || q.includes('bintang') || q.includes('gelap') || q.includes('tidur')) {
    return {
      speech: 'Simsalabim! Langit bertabur ribuan bintang dan rembulan bersinar untuk Khaulah! 🌙✨',
      action: 'set_time',
      actionParam: 'malam',
    };
  }
  if (q.includes('siang') || q.includes('matahari') || q.includes('pagi') || q.includes('terang')) {
    return {
      speech: 'Matahari siang ceria bersinar hangat! Selamat berpetualang Khaulah sayang! ☀️🏡',
      action: 'set_time',
      actionParam: 'siang',
    };
  }
  if (q.includes('sore') || q.includes('senja') || q.includes('jingga')) {
    return {
      speech: 'Senja sore jingga keemasan yang syahdu terbentang di atas desa kita! 🌇✨',
      action: 'set_time',
      actionParam: 'sore',
    };
  }
  if (q.includes('subuh') || q.includes('fajar')) {
    return {
      speech: 'Fajar Subuh yang sejuk dan damai! Waktunya bangun dan sholat, Khaulah! 🌅🕊️',
      action: 'set_time',
      actionParam: 'subuh',
    };
  }
  if (q.includes('lari') || q.includes('cepat') || q.includes('ngebut') || q.includes('kilat') || q.includes('speed')) {
    return {
      speech: 'Wuzzz! Kekuatan kilat pelangi meluncur di kaki Khaulah! Ayo lari secepat angin! ⚡🏃‍♀️✨',
      action: 'speed_buff',
      actionParam: 25,
    };
  }
  if (q.includes('lompat') || q.includes('tinggi') || q.includes('loncat') || q.includes('awan')) {
    return {
      speech: 'Boiiing! Kaki Khaulah seringan kapas awan! Ayo lompat setinggi langit! 🦘☁️✨',
      action: 'super_jump',
      actionParam: 25,
    };
  }
  if (q.includes('balon')) {
    return {
      speech: 'Horeee! Puluhan balon warna-warni turun dari awan untuk Khaulah! 🎈💖',
      action: 'spawn_balloons',
      actionParam: { count: 16, color: 'rainbow' },
    };
  }
  if (q.includes('kue') || q.includes('ulang tahun') || q.includes('cake') || q.includes('tart')) {
    return {
      speech: 'Ta-daaa! Kue ulang tahun manis bertabur stroberi dan lilin hadir untuk Khaulah! 🎂🍰✨',
      action: 'spawn_cake',
      actionParam: 'birthday',
    };
  }
  if (q.includes('gelembung') || q.includes('sabun') || q.includes('bubble')) {
    return {
      speech: 'Plop plop! Gelembung sabun berkilau melayang di sekeliling Khaulah! 🧼✨',
      action: 'spawn_bubbles',
      actionParam: { count: 24 },
    };
  }
  if (q.includes('bintang')) {
    return {
      speech: 'Kilau bintang keemasan berhamburan mengelilingi Khaulah! ⭐🌟✨',
      action: 'spawn_stars',
      actionParam: { count: 12 },
    };
  }
  if (q.includes('sekolah') || /\btk\b/.test(q) || q.includes('guru') || q.includes('santi')) {
    return {
      speech: 'Wuuush! Khaulah tiba di gerbang TK Karang Tengah 1 Atap! Selamat belajar sayang! 🎒🏫',
      action: 'teleport',
      actionParam: 'tk',
    };
  }
  if ((q.includes('pantai') || q.includes('danau') || q.includes('bebek') || q.includes('laut')) && !q.includes('buat') && !q.includes('bikin')) {
    return {
      speech: 'Swuuush! Semilir angin pantai dan danau bebek menyambut Khaulah! 🏖️🦢🌊',
      action: 'teleport',
      actionParam: 'pantai',
    };
  }
  if ((q.includes('rumah') || q.includes('pulang') || q.includes('teras')) && !q.includes('buat') && !q.includes('bikin')) {
    return {
      speech: 'Selamat datang kembali di rumah tercinta Khaulah! Abi dan Ummi menunggu! 🏡👨‍👩‍👧‍👦',
      action: 'teleport',
      actionParam: 'rumah',
    };
  }
  if (q.includes('karnaval') || q.includes('pasar malam') || q.includes('komedi') || q.includes('bianglala')) {
    return {
      speech: 'Wuuussh! Khaulah sampai di Karnaval Pasar Malam Ceria! Ayo naik komedi putar! 🎡🎠🍿',
      action: 'teleport',
      actionParam: 'karnaval',
    };
  }
  if ((q.includes('kebun') || q.includes('hewan') || q.includes('kelinci') || q.includes('domba')) && !q.includes('buat') && !q.includes('bikin') && !q.includes('boneka')) {
    return {
      speech: 'Khaulah sampai di Taman Hewan & Kebun Buah Ceria! Mbaa~ kelinci dan domba melompat riang! 🐑🥕🍎',
      action: 'teleport',
      actionParam: 'kebun',
    };
  }
  if ((q.includes('waterpark') || q.includes('kolam') || q.includes('renang')) && !q.includes('buat') && !q.includes('bikin')) {
    return {
      speech: 'Byuuuuur! Khaulah sampai di Waterpark Halaman Belakang! Ayo meluncur! 🌊🛝',
      action: 'teleport',
      actionParam: 'waterpark',
    };
  }
  if (
    q.includes('obby') ||
    q.includes('istana bintang') ||
    ((q.includes('langit') || q.includes('pelangi')) &&
      !q.includes('buat') &&
      !q.includes('bikin') &&
      !q.includes('bola') &&
      !q.includes('mobil'))
  ) {
    return {
      speech: 'Wuuush! Khaulah melesat ke Jalur Pelangi & Istana Bintang di Langit! 🌈⭐🏰',
      action: 'teleport',
      actionParam: 'obby',
    };
  }
  if (q.includes('mahkota') || q.includes('putri') || q.includes('princess')) {
    return {
      speech: 'Tring! Mahkota emas berkilauan terpasang indah di kepala Putri Khaulah! 👑✨',
      action: 'set_accessory',
      actionParam: 'princess_crown',
    };
  }
  if (q.includes('sayap') || q.includes('peri')) {
    return {
      speech: 'Flap flap! Sayap peri berkilau terpasang di punggung Khaulah! Cantik sekali! 🧚‍♀️✨',
      action: 'set_accessory',
      actionParam: 'fairy_wings',
    };
  }
  if (q.includes('kelinci') && q.includes('telinga')) {
    return {
      speech: 'Boing! Bando telinga kelinci lucu terpasang! Imut sekali Khaulah! 🐰🎀',
      action: 'set_accessory',
      actionParam: 'bunny_ears',
    };
  }
  if (q.includes('kucing')) {
    return {
      speech: 'Meong~ Anak kucing putih manis setia menemani langkah Khaulah! 🐱🐾',
      action: 'set_pet',
      actionParam: 'kitten',
    };
  }
  if (q.includes('anjing') || q.includes('puppy')) {
    return {
      speech: 'Guk guk! Anak anjing cokelat lucu melompat riang mengikuti Khaulah! 🐶🐾',
      action: 'set_pet',
      actionParam: 'puppy',
    };
  }
  if (q.includes('kembang api') || q.includes('pesta') || q.includes('hore') || q.includes('menang')) {
    return {
      speech: 'Horeeee! Pesta kembang api dan konfeti bertaburan untuk merayakan kehebatan Khaulah! 🎆🎉🥳',
      action: 'celebrate',
    };
  }
  if (q.includes('sirine') || q.includes('damkar') || q.includes('pemadam')) {
    return {
      speech: 'Niu-niu-niu! Sirine mobil damkar cilik meraung gagah! 🚒🚨',
      action: 'play_sound',
      actionParam: 'fire_siren',
    };
  }
  if (q.includes('kereta') || q.includes('peluit')) {
    return {
      speech: 'Tuut tuuuut! Peluit kereta uap berbunyi nyaring keliling desa! 🚂💨',
      action: 'play_sound',
      actionParam: 'train',
    };
  }
  if (q.includes('khalid') || q.includes('adek')) {
    if (q.includes('berhenti') || q.includes('istirahat') || q.includes('tinggal')) {
      return {
        speech: 'Adek Khalid istirahat di sini: "Nanti kita main lagi ya Kak Khaulah!" 👦🌸',
        action: 'khalid_follow',
        actionParam: false,
      };
    }
    return {
      speech: 'Horeee! Adek Khalid langsung lari mengejar Kak Khaulah! "Tunggu Khalid ya Kakak!" 👦🏃‍♂️💨',
      action: 'khalid_follow',
      actionParam: true,
    };
  }

  // Clear Sandbox items
  if (
    q.includes('bersih') ||
    q.includes('sapu') ||
    (q.includes('hapus') && q.includes('mainan')) ||
    (q.includes('hilang') && q.includes('mainan'))
  ) {
    return {
      speech: 'Wuuush! Tongkat ajaib menyapu bersih mainan fantasi! Halaman kembali rapi dan siap untuk keajaiban baru! 🧹✨',
      action: 'clear_sandbox',
    };
  }

  // Explicit Wishlist Request
  if (q.includes('buku impian') || q.includes('catat') || q.includes('simpan ide')) {
    return {
      speech: `Wah, ide "${input}" dicatat dengan rapi di Buku Impian Khaulah agar selalu diingat! ✨📖`,
      action: 'wishlist',
      wishlistTitle: input,
      isWishRecorded: true,
    };
  }

  // Real-time AI Sandbox Creations
  const sandbox = createFallbackSandboxCreation(input);
  return {
    speech: `Simsalabim! Mantra "${input}" seketika diwujudkan menjadi ${sandbox.title} tepat di depan Khaulah! Ayo main bersama! ✨🪄`,
    action: 'spawn_sandbox',
    sandboxCreation: sandbox,
  };
}

export function createFallbackSandboxCreation(
  typeOrPrompt: string,
  customTitle?: string
): NonNullable<MagicActionResult['sandboxCreation']> {
  const p = typeOrPrompt.toLowerCase();

  // 1. Kickable Physics Ball / Dice / Watermelon
  if (
    p.includes('bola') ||
    p.includes('sepak') ||
    p.includes('basket') ||
    p.includes('tendang') ||
    p.includes('semangka') ||
    p.includes('dadu')
  ) {
    return {
      title: customTitle || 'Bola Sepak Bintang Pelangi',
      interactionType: 'kickable',
      behavior: 'idle',
      scale: 1.0,
      physics: 'dynamic_ball',
      parts: [
        { shape: 'sphere', args: [0.38, 16, 16], pos: [0, 0, 0], color: '#FFFFFF' },
        { shape: 'dodecahedron', args: [0.22, 0], pos: [0, 0, 0], color: '#111827', emissive: '#10B981', emissiveIntensity: 0.4 },
        { shape: 'sphere', args: [0.09, 8, 8], pos: [0, 0.32, 0], color: '#FBBF24', emissive: '#FDE047' },
      ],
    };
  }

  // 2. Rideable Cartoon Vehicle / Flying Carpet / Rocket
  if (
    p.includes('mobil') ||
    p.includes('karpet') ||
    p.includes('roket') ||
    p.includes('pesawat') ||
    p.includes('kuda') ||
    p.includes('sepeda') ||
    p.includes('kendarai') ||
    p.includes('tumpangi')
  ) {
    return {
      title: customTitle || 'Mobil Fantasi Bintang Khaulah',
      interactionType: 'rideable',
      behavior: 'idle',
      scale: 1.2,
      physics: 'solid',
      parts: [
        { shape: 'box', args: [0.85, 0.35, 1.4], pos: [0, 0.3, 0], color: '#EC4899' },
        { shape: 'box', args: [0.7, 0.35, 0.7], pos: [0, 0.65, -0.1], color: '#BAE6FD', opacity: 0.8 },
        { shape: 'cylinder', args: [0.18, 0.18, 0.12, 12], pos: [-0.48, 0.18, 0.45], rot: [0, 0, Math.PI / 2], color: '#1F2937' },
        { shape: 'cylinder', args: [0.18, 0.18, 0.12, 12], pos: [0.48, 0.18, 0.45], rot: [0, 0, Math.PI / 2], color: '#1F2937' },
        { shape: 'cylinder', args: [0.18, 0.18, 0.12, 12], pos: [-0.48, 0.18, -0.45], rot: [0, 0, Math.PI / 2], color: '#1F2937' },
        { shape: 'cylinder', args: [0.18, 0.18, 0.12, 12], pos: [0.48, 0.18, -0.45], rot: [0, 0, Math.PI / 2], color: '#1F2937' },
        { shape: 'sphere', args: [0.08, 8, 8], pos: [-0.25, 0.32, 0.72], color: '#FDE047', emissive: '#FDE047' },
        { shape: 'sphere', args: [0.08, 8, 8], pos: [0.25, 0.32, 0.72], color: '#FDE047', emissive: '#FDE047' },
        { shape: 'cone', args: [0.1, 0.25, 8], pos: [0, 0.95, -0.2], color: '#FBBF24', emissive: '#FDE047' },
      ],
    };
  }

  // 3. Musical Floor Piano / Drum
  if (p.includes('piano') || p.includes('drum') || p.includes('musik') || p.includes('lonceng')) {
    return {
      title: customTitle || 'Piano Lantai Pelangi',
      interactionType: 'musical',
      behavior: 'idle',
      scale: 1.2,
      physics: 'solid',
      parts: [
        { shape: 'box', args: [1.6, 0.12, 0.8], pos: [0, 0.06, 0], color: '#111827' },
        { shape: 'box', args: [0.25, 0.14, 0.7], pos: [-0.6, 0.08, 0], color: '#EF4444', emissive: '#F87171' },
        { shape: 'box', args: [0.25, 0.14, 0.7], pos: [-0.3, 0.08, 0], color: '#F59E0B', emissive: '#FBBF24' },
        { shape: 'box', args: [0.25, 0.14, 0.7], pos: [0, 0.08, 0], color: '#10B981', emissive: '#34D399' },
        { shape: 'box', args: [0.25, 0.14, 0.7], pos: [0.3, 0.08, 0], color: '#3B82F6', emissive: '#60A5FA' },
        { shape: 'box', args: [0.25, 0.14, 0.7], pos: [0.6, 0.08, 0], color: '#8B5CF6', emissive: '#A78BFA' },
      ],
    };
  }

  // 4. Living Companions
  if (p.includes('dino') || p.includes('trex') || p.includes('t-rex')) {
    return {
      title: customTitle || 'Dinosaurus T-Rex Ungu Ceria',
      interactionType: 'companion',
      behavior: 'follow',
      scale: 1.2,
      physics: 'solid',
      parts: [
        { shape: 'sphere', args: [0.55, 16, 16], pos: [0, 0.75, 0], color: '#9333EA' },
        { shape: 'box', args: [0.45, 0.4, 0.65], pos: [0, 1.25, 0.3], color: '#7E22CE' },
        { shape: 'box', args: [0.35, 0.25, 0.3], pos: [0, 1.15, 0.65], color: '#A855F7' },
        { shape: 'sphere', args: [0.07, 8, 8], pos: [-0.2, 1.35, 0.5], color: '#FFFFFF' },
        { shape: 'sphere', args: [0.035, 8, 8], pos: [-0.2, 1.35, 0.56], color: '#000000' },
        { shape: 'sphere', args: [0.07, 8, 8], pos: [0.2, 1.35, 0.5], color: '#FFFFFF' },
        { shape: 'sphere', args: [0.035, 8, 8], pos: [0.2, 1.35, 0.56], color: '#000000' },
        { shape: 'cone', args: [0.08, 0.2, 6], pos: [0, 1.3, -0.1], rot: [-0.4, 0, 0], color: '#FBBF24' },
        { shape: 'cone', args: [0.09, 0.22, 6], pos: [0, 0.95, -0.4], rot: [-0.5, 0, 0], color: '#FBBF24' },
        { shape: 'cone', args: [0.2, 0.8, 8], pos: [0, 0.55, -0.65], rot: [-0.7, 0, 0], color: '#A855F7' },
        { shape: 'cylinder', args: [0.12, 0.12, 0.5, 8], pos: [-0.28, 0.25, 0], color: '#6B21A8' },
        { shape: 'cylinder', args: [0.12, 0.12, 0.5, 8], pos: [0.28, 0.25, 0], color: '#6B21A8' },
      ],
    };
  }

  if (p.includes('robot') || p.includes('mecha')) {
    return {
      title: customTitle || 'Robot Cilik Sahabat Khaulah',
      interactionType: 'companion',
      behavior: 'follow',
      scale: 1.1,
      physics: 'solid',
      parts: [
        { shape: 'box', args: [0.6, 0.7, 0.4], pos: [0, 0.75, 0], color: '#38BDF8' },
        { shape: 'box', args: [0.4, 0.3, 0.05], pos: [0, 0.8, 0.21], color: '#F43F5E', emissive: '#FB7185' },
        { shape: 'box', args: [0.5, 0.45, 0.45], pos: [0, 1.35, 0], color: '#0EA5E9' },
        { shape: 'cylinder', args: [0.02, 0.02, 0.3, 6], pos: [0, 1.7, 0], color: '#FBBF24' },
        { shape: 'sphere', args: [0.08, 8, 8], pos: [0, 1.88, 0], color: '#FDE047', emissive: '#FDE047' },
        { shape: 'box', args: [0.38, 0.12, 0.05], pos: [0, 1.35, 0.23], color: '#10B981', emissive: '#34D399' },
        { shape: 'cylinder', args: [0.07, 0.07, 0.5, 8], pos: [-0.42, 0.75, 0], color: '#0284C7' },
        { shape: 'cylinder', args: [0.07, 0.07, 0.5, 8], pos: [0.42, 0.75, 0], color: '#0284C7' },
        { shape: 'cylinder', args: [0.09, 0.09, 0.4, 8], pos: [-0.18, 0.2, 0], color: '#0369A1' },
        { shape: 'cylinder', args: [0.09, 0.09, 0.4, 8], pos: [0.18, 0.2, 0], color: '#0369A1' },
      ],
    };
  }

  if (p.includes('ufo') || p.includes('alien') || p.includes('piring terbang')) {
    return {
      title: customTitle || 'Piring Terbang Bintang UFO',
      interactionType: 'rideable',
      behavior: 'float',
      scale: 1.2,
      physics: 'solid',
      parts: [
        { shape: 'torus', args: [0.8, 0.25, 12, 24], pos: [0, 0.8, 0], rot: [Math.PI / 2, 0, 0], color: '#EC4899' },
        { shape: 'cylinder', args: [0.75, 0.75, 0.2, 24], pos: [0, 0.8, 0], color: '#F472B6' },
        { shape: 'sphere', args: [0.45, 16, 16], pos: [0, 0.95, 0], color: '#BAE6FD', opacity: 0.7, roughness: 0.1 },
        { shape: 'sphere', args: [0.1, 8, 8], pos: [0, 1.25, 0], color: '#10B981', emissive: '#34D399' },
        { shape: 'sphere', args: [0.08, 8, 8], pos: [0.85, 0.8, 0], color: '#FDE047', emissive: '#FDE047' },
        { shape: 'sphere', args: [0.08, 8, 8], pos: [-0.85, 0.8, 0], color: '#FDE047', emissive: '#FDE047' },
        { shape: 'sphere', args: [0.08, 8, 8], pos: [0, 0.8, 0.85], color: '#38BDF8', emissive: '#38BDF8' },
        { shape: 'sphere', args: [0.08, 8, 8], pos: [0, 0.8, -0.85], color: '#38BDF8', emissive: '#38BDF8' },
      ],
    };
  }

  // 5. Bouncy Trampolines
  if (p.includes('trampolin') || p.includes('pantul') || p.includes('jamur')) {
    return {
      title: customTitle || 'Jamur Trampolin Ajaib Pelangi',
      interactionType: 'trampoline',
      behavior: 'trampoline',
      scale: 1.3,
      physics: 'bouncy',
      parts: [
        { shape: 'cylinder', args: [0.28, 0.38, 0.7, 16], pos: [0, 0.35, 0], color: '#FFFBEB' },
        { shape: 'sphere', args: [0.95, 16, 16], pos: [0, 0.8, 0], scale: [1, 0.45, 1], color: '#EF4444' },
        { shape: 'sphere', args: [0.15, 8, 8], pos: [0, 1.02, 0], scale: [1, 0.3, 1], color: '#FFFFFF' },
        { shape: 'sphere', args: [0.12, 8, 8], pos: [0.5, 0.9, 0.3], scale: [1, 0.3, 1], color: '#FFFFFF' },
        { shape: 'sphere', args: [0.12, 8, 8], pos: [-0.5, 0.9, -0.3], scale: [1, 0.3, 1], color: '#FFFFFF' },
        { shape: 'sphere', args: [0.12, 8, 8], pos: [-0.4, 0.9, 0.4], scale: [1, 0.3, 1], color: '#FFFFFF' },
      ],
    };
  }

  // 6. Edible treats
  if (p.includes('es krim') || p.includes('donat') || p.includes('permen') || p.includes('lolipop') || p.includes('kue')) {
    return {
      title: customTitle || 'Es Krim Stroberi Pelangi Raksasa',
      interactionType: 'edible',
      behavior: 'spin',
      scale: 1.3,
      physics: 'solid',
      parts: [
        { shape: 'cone', args: [0.45, 1.1, 16], pos: [0, 0.55, 0], rot: [Math.PI, 0, 0], color: '#D97706' },
        { shape: 'sphere', args: [0.5, 16, 16], pos: [0, 1.25, 0], color: '#F472B6' },
        { shape: 'sphere', args: [0.38, 16, 16], pos: [0, 1.65, 0], color: '#38BDF8' },
        { shape: 'sphere', args: [0.12, 10, 10], pos: [0, 1.95, 0], color: '#E11D48', emissive: '#E11D48' },
        { shape: 'cylinder', args: [0.015, 0.015, 0.15, 6], pos: [0.03, 2.05, 0], rot: [0, 0, -0.4], color: '#15803D' },
      ],
    };
  }

  // 7. Castles
  if (p.includes('istana') || p.includes('kastil') || p.includes('benteng')) {
    return {
      title: customTitle || 'Istana Bintang Kristal Pelangi',
      interactionType: 'solid',
      behavior: 'idle',
      scale: 1.2,
      physics: 'solid',
      parts: [
        { shape: 'box', args: [1.2, 0.9, 1.0], pos: [0, 0.45, 0], color: '#C084FC' },
        { shape: 'box', args: [0.35, 0.5, 0.1], pos: [0, 0.25, 0.52], color: '#FDE047' },
        { shape: 'cylinder', args: [0.22, 0.25, 1.3, 12], pos: [-0.65, 0.65, 0.5], color: '#A855F7' },
        { shape: 'cone', args: [0.32, 0.6, 12], pos: [-0.65, 1.6, 0.5], color: '#38BDF8' },
        { shape: 'cylinder', args: [0.22, 0.25, 1.3, 12], pos: [0.65, 0.65, 0.5], color: '#A855F7' },
        { shape: 'cone', args: [0.32, 0.6, 12], pos: [0.65, 1.6, 0.5], color: '#38BDF8' },
        { shape: 'cylinder', args: [0.28, 0.3, 1.6, 12], pos: [0, 0.8, -0.1], color: '#9333EA' },
        { shape: 'cone', args: [0.4, 0.8, 12], pos: [0, 1.95, -0.1], color: '#F472B6' },
        { shape: 'dodecahedron', args: [0.15, 0], pos: [0, 2.4, -0.1], color: '#FBBF24', emissive: '#FDE047' },
      ],
    };
  }

  // Generic magical crystal creation for any custom wish
  const title = customTitle || 'Kristal Bintang Ajaib Khaulah';
  return {
    title,
    interactionType: inferInteractionType(title),
    behavior: 'bounce',
    scale: 1.1,
    physics: 'solid',
    parts: [
      { shape: 'cylinder', args: [0.55, 0.65, 0.25, 16], pos: [0, 0.12, 0], color: '#9333EA' },
      { shape: 'dodecahedron', args: [0.45, 0], pos: [0, 0.65, 0], color: '#EC4899', emissive: '#F472B6' },
      { shape: 'torus', args: [0.65, 0.06, 12, 24], pos: [0, 0.65, 0], rot: [0.8, 0.4, 0], color: '#FDE047', emissive: '#FDE047' },
      { shape: 'sphere', args: [0.1, 8, 8], pos: [0, 1.15, 0], color: '#FBBF24', emissive: '#FDE047' },
    ],
  };
}

function validateMagicResult(parsed: any, promptInput = ''): void {
  if (!parsed || typeof parsed.speech !== 'string' || !parsed.speech.trim()) throw new Error('Balasan AI tidak valid.');
  const enums: Record<string, readonly string[]> = {
    set_time: ['subuh', 'siang', 'sore', 'malam'],
    teleport: ['rumah', 'tk', 'pantai', 'karnaval', 'kebun', 'waterpark', 'obby'],
    set_accessory: ['none', 'bunny_ears', 'fairy_wings', 'princess_crown', 'cat_ears', 'star_halo'],
    set_pet: ['none', 'puppy', 'kitten', 'fairy'],
    play_sound: ['fire_siren', 'train', 'bell'],
  };
  const actions = [
    ...Object.keys(enums),
    'speed_buff',
    'super_jump',
    'spawn_balloons',
    'spawn_cake',
    'spawn_bubbles',
    'spawn_stars',
    'celebrate',
    'riddle',
    'khalid_follow',
    'spawn_sandbox',
    'clear_sandbox',
    'wishlist',
    'chat_only',
  ];
  if (!actions.includes(parsed.action) || (enums[parsed.action] && !enums[parsed.action].includes(parsed.actionParam))) {
    throw new Error('Aksi AI tidak valid.');
  }
  if (parsed.action === 'speed_buff' || parsed.action === 'super_jump') {
    parsed.actionParam = typeof parsed.actionParam === 'number' && Number.isFinite(parsed.actionParam)
      ? Math.max(1, Math.min(120, parsed.actionParam)) : 25;
  }
  if (parsed.action === 'khalid_follow' && typeof parsed.actionParam !== 'boolean') throw new Error('Parameter pengikut tidak valid.');

  // Validate sandboxCreation
  if (parsed.action === 'spawn_sandbox') {
    if (!parsed.sandboxCreation || typeof parsed.sandboxCreation !== 'object' || !Array.isArray(parsed.sandboxCreation.parts) || parsed.sandboxCreation.parts.length === 0) {
      parsed.sandboxCreation = createFallbackSandboxCreation(promptInput || parsed.speech);
    }
  }
}

export async function processMagicPrompt(prompt: string): Promise<MagicActionResult> {
  const cleanPrompt = prompt.trim();
  if (!cleanPrompt) {
    return {
      speech: 'Halo Khaulah bidadari shalihah! Mau mantra apa hari ini? Bilang saja ke Tongkat Ajaib! 🪄✨',
      action: 'chat_only',
    };
  }

  const systemPrompt = `
Kamu adalah Peri Bintang Ajaib (Magic Fairy) pendamping setia anak perempuan bernama Khaulah (usia 6 tahun).
Khaulah sedang bermain di game 3D buatannya: "Dunia Bahagia Khaulah 3D".
Khaulah berbicara kepadamu lewat Tongkat Suara Ajaib.

Tugasmu:
1. Memahami ucapan/mantra Khaulah dan membalasnya dengan 1-2 kalimat bahasa Indonesia yang sangat manis, hangat, antusias, dan ceria.
2. Memilih aksi game yang paling cocok dari daftar berikut:
   - "set_time": Ubah waktu. actionParam: "subuh", "siang", "sore", "malam".
   - "speed_buff": Lari super cepat / kekuatan kilat. actionParam: 25.
   - "super_jump": Lompat super tinggi setinggi awan. actionParam: 25.
   - "teleport": Pindah tempat seketika. actionParam: "rumah", "tk", "pantai", "karnaval", "kebun", "waterpark", "obby".
   - "set_accessory": Pasang hiasan. actionParam: "princess_crown", "fairy_wings", "bunny_ears", "cat_ears", "star_halo", "none".
   - "set_pet": Ganti hewan teman. actionParam: "kitten", "puppy", "fairy", "none".
   - "spawn_balloons": Munculkan hujan balon di sekeliling pemain. actionParam: {"count": 16, "color": "rainbow"}.
   - "spawn_cake": Munculkan kue ulang tahun raksasa dengan lilin di depan pemain. actionParam: "birthday".
   - "spawn_bubbles": Munculkan banyak gelembung sabun ajaib. actionParam: {"count": 24}.
   - "spawn_stars": Munculkan hujan bintang keemasan. actionParam: {"count": 12}.
   - "celebrate": Pesta konfeti & kembang api meriah.
   - "play_sound": Bunyikan suara khas ("fire_siren", "train", "bell").
   - "riddle": Memberikan tebak-tebakan anak lucu yang seru.
   - "khalid_follow": Ajak Adek Khalid berlari mengekor dan ikut berpetualang. actionParam: true / false.
   - "clear_sandbox": Jika Khaulah minta membersihkan, menyapu, atau menghilangkan mainan/objek ajaib di halaman.
   - "spawn_sandbox": KEMAMPUAN PALING AJAIB! Jika Khaulah meminta objek fantasi, mainan baru, makhluk unik, dinosaurus, robot, piring terbang, kendaraan, makanan raksasa, bangunan mini, trampolin jamur, dll yang TIDAK ADA di aksi bawaan, CIPTAKAN SECARA REALTIME! Sertakan "sandboxCreation" berisi 3-10 bentuk primitif 3D yang membentuk objek tersebut.
   - "wishlist": Hanya jika Khaulah minta dicatat di buku impian atau minta fitur software kompleks.
   - "chat_only": Obrolan santai biasa.

FORMAT JSON OUTPUT WAJIB:
{
  "speech": "Balasan hangat ceria 1-2 kalimat untuk Khaulah",
  "action": "nama_action",
  "actionParam": "parameter_action (jika ada, kalau tidak null)",
  "sandboxCreation": {
    "title": "Nama Objek Ceria (misal: 'Dinosaurus T-Rex Ungu')",
    "interactionType": "kickable" | "rideable" | "edible" | "trampoline" | "companion" | "musical" | "solid",
    "behavior": "bounce" | "float" | "spin" | "orbit" | "follow" | "trampoline" | "idle",
    "scale": 1.2,
    "physics": "solid" | "bouncy" | "dynamic_ball" | "dynamic_box",
    "parts": [
      {
        "shape": "sphere" | "box" | "cylinder" | "cone" | "torus" | "capsule" | "dodecahedron",
        "args": [0.6, 16, 16],
        "pos": [0, 0.8, 0],
        "rot": [0, 0, 0],
        "color": "#HEX_COLOR",
        "emissive": "#HEX_GLOW (opsional)"
      }
    ]
  },
  "wishlistTitle": null
}
`;

  try {
    const raw = await callChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: cleanPrompt },
    ], true);

    // Clean JSON markdown blocks if any
    const cleanedJson = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);
    validateMagicResult(parsed, cleanPrompt);

    const result: MagicActionResult = {
      speech: parsed.speech || 'Mantra ajaib Khaulah sudah terwujud! ✨',
      action: parsed.action || 'chat_only',
      actionParam: parsed.actionParam,
      sandboxCreation: parsed.sandboxCreation || undefined,
      wishlistTitle: parsed.wishlistTitle || undefined,
      isWishRecorded: parsed.action === 'wishlist',
    };

    if (result.action === 'wishlist' && result.wishlistTitle) {
      saveWishItem({
        id: 'wish_' + Date.now(),
        prompt: cleanPrompt,
        speech: result.speech,
        category: 'Kreativitas',
        timestamp: Date.now(),
      });
    }

    return result;
  } catch (err) {
    console.warn('AI call failed, using smart fallback interpreter:', err);
    const fallback = fallbackMagicInterpreter(cleanPrompt);
    if (fallback.action === 'wishlist') {
      saveWishItem({
        id: 'wish_' + Date.now(),
        prompt: cleanPrompt,
        speech: fallback.speech,
        category: 'Impian Khaulah',
        timestamp: Date.now(),
      });
    }
    return fallback;
  }
}

// Interactive Free Conversation with Family Members (Abi, Ummi, Khalid, Faqih, Bu Santi)
export async function chatWithCharacter(
  characterId: string,
  characterName: string,
  userMessage: string,
  history: Array<{ role: string; content: string }> = []
): Promise<string> {
  const cleanMsg = userMessage.trim();
  if (!cleanMsg) return 'Ada apa Khaulah sayang? Ceritakan ke sini ya! 🌸';

  let rolePersona = '';
  if (characterId === 'khalid') {
    rolePersona = 'Kamu adalah Adek Khalid (adik laki-laki Khaulah yang periang usia 3-4 tahun). Panggil dia "Kakak" atau "Kak Khaulah" (JANGAN panggil Mbak, selalu panggil Kakak atau Kak Khaulah). Bicara lucu, polos, antusias, suka main drumband, bola, dan petak umpet. Selalu sayang pada Kakak Khaulah.';
  } else if (characterId === 'abi') {
    rolePersona = 'Kamu adalah Abi (Ayah Khaulah tercinta). Kamu seorang programmer/bekerja di laptop yang sangat menyayangi Khaulah. Bicara hangat, bijak, bangga pada Khaulah anak shalihah, memberi semangat dan pujian tulus.';
  } else if (characterId === 'ummi') {
    rolePersona = 'Kamu adalah Ummi (Ibu Khaulah tercinta yang bercadar). Bicara sangat lembut, penuh kasih sayang seorang ibu, mengingatkan berdoa, sopan santun, dan selalu siap memberi bekal kue pelangi terenak.';
  } else if (characterId === 'faqih') {
    rolePersona = 'Kamu adalah Adek Faqih (adik balita Khaulah). Panggil Khaulah dengan sebutan "Kakak" atau "Kak Khaulah". Bicara khas balita gemas: cilukba, tirukan suara mobil "brum brum", dan tawa riang.';
  } else if (characterId === 'bu_guru') {
    rolePersona = 'Kamu adalah Ibu Santi (Guru TK Karang Tengah 1 Atap). Bicara ramah, edukatif, suka memuji kerapian dan kebaikan Khaulah, mengajak bernyanyi atau tebak-tebakan.';
  } else {
    rolePersona = `Kamu adalah ${characterName} di desa ramah Khaulah 3D. Bicara ramah dan menyemangati Khaulah.`;
  }

  const system = `${rolePersona}\nKhaulah adalah anak perempuan manis usia 6 tahun. Jawab singkat (maksimal 2-3 kalimat santai) dengan bahasa Indonesia anak-anak yang ceria dan penuh kasih sayang. Jangan gunakan kata-kata sulit.`;

  try {
    const messages = [
      { role: 'system', content: system },
      ...history.slice(-4),
      { role: 'user', content: cleanMsg },
    ];

    const reply = await callChatCompletion(messages, false);
    return reply.trim();
  } catch (err) {
    console.warn('Character chat fallback:', err);
    if (characterId === 'khalid') {
      return `Kak Khaulah! Khalid lagi senang banget main bareng Kak Khaulah! Ayo kita lari-larian! 👦🥁`;
    }
    if (characterId === 'abi') {
      return `MasyaAllah Khaulah putri shalihah Abi! Senyum ceria Khaulah selalu bikin Abi bahagia dan semangat bekerja! 💻👨‍👧`;
    }
    if (characterId === 'ummi') {
      return `Khaulah bidadari kecil Ummi, sehat dan bahagia selalu ya nak. Ummi selalu mendoakan Khaulah di setiap langkah. 🧕🌸`;
    }
    return `Assalamu'alaikum Khaulah bidadari shalihah! Senang sekali bisa bermain dan belajar bersama Khaulah! 🌸✨`;
  }
}

// Text-to-Speech (TTS) Engine: 9Router Edge-TTS
export type VoiceGender = 'female' | 'male';

export const TTS_VOICES = {
  female: 'edge-tts/id-ID-GadisNeural',
  male: 'edge-tts/id-ID-ArdiNeural',
} as const;

export const TTS_VOICE_NAMES = {
  [TTS_VOICES.female]: 'Gadis (Perempuan)',
  [TTS_VOICES.male]: 'Ardi (Laki-laki)',
} as const;

export function resolveCharacterGender(characterIdOrSpeaker?: string): VoiceGender {
  if (!characterIdOrSpeaker) return 'female';
  const s = characterIdOrSpeaker.toLowerCase();
  if (
    s.includes('khalid') ||
    s.includes('abi') ||
    s.includes('faqih') ||
    s.includes('ayah') ||
    s.includes('tani') ||
    s.includes('ardi') ||
    s === 'male' ||
    s === 'laki-laki' ||
    s === 'laki'
  ) {
    return 'male';
  }
  return 'female';
}

export function cleanTextForSpeech(text: string): string {
  return text
    // Remove markdown formatting
    .replace(/[*_~`#>[\]()]/g, '')
    // Remove emoji symbols which edge-tts may describe literally or stumble on
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '')
    // Normalize spaces
    .replace(/\s+/g, ' ')
    .trim();
}

let currentAudio: HTMLAudioElement | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;
const audioCache = new Map<string, Blob>();
let isCurrentlySpeaking = false;
let currentSpeakingVoice: string = TTS_VOICES.female;
const ttsListeners = new Set<(speaking: boolean, voice: string) => void>();

function notifyTTSState(speaking: boolean, voice: string) {
  isCurrentlySpeaking = speaking;
  currentSpeakingVoice = voice;
  for (const listener of ttsListeners) {
    try {
      listener(speaking, voice);
    } catch {}
  }
}

export function subscribeTTSState(listener: (speaking: boolean, voice: string) => void): () => void {
  ttsListeners.add(listener);
  listener(isCurrentlySpeaking, currentSpeakingVoice);
  return () => {
    ttsListeners.delete(listener);
  };
}

export function isSpeaking(): boolean {
  return isCurrentlySpeaking;
}

export function getCurrentSpeakingVoice(): string {
  return currentSpeakingVoice;
}

async function fetchTTSAudio(cleanText: string, model: string): Promise<Blob> {
  const cacheKey = `${model}:::${cleanText}`;
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey)!;
  }

  const endpoints = ['/ai-proxy/audio/speech', `${AI_API_URL}/audio/speech`];
  let lastError: any = null;

  for (const url of endpoints) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (AI_API_KEY) {
        headers['Authorization'] = `Bearer ${AI_API_KEY}`;
      }

      const res = await fetch(url, {
        method: 'POST',
        signal: controller.signal,
        headers,
        body: JSON.stringify({
          model,
          input: cleanText,
        }),
      });

      if (!res.ok) {
        throw new Error(`TTS HTTP ${res.status}: ${res.statusText}`);
      }

      const blob = await res.blob();
      if (blob && blob.size > 0) {
        if (audioCache.size > 50) {
          const first = audioCache.keys().next().value;
          if (first) audioCache.delete(first);
        }
        audioCache.set(cacheKey, blob);
        return blob;
      }
    } catch (err) {
      lastError = err;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError || new Error('Gagal menghubungi TTS endpoint 9Router.');
}

function fallbackWebSpeech(clean: string, gender: VoiceGender, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    notifyTTSState(false, gender === 'male' ? TTS_VOICES.male : TTS_VOICES.female);
    onEnd?.();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'id-ID';
    if (gender === 'male') {
      utterance.pitch = 0.95;
      utterance.rate = 1.0;
    } else {
      utterance.pitch = 1.25;
      utterance.rate = 1.05;
    }

    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(
      (v) => v.lang.toLowerCase().startsWith('id') || v.lang.toLowerCase().includes('id-id')
    );
    if (idVoice) utterance.voice = idVoice;

    const voiceName = gender === 'male' ? TTS_VOICES.male : TTS_VOICES.female;
    notifyTTSState(true, voiceName);

    utterance.onend = () => {
      notifyTTSState(false, voiceName);
      currentUtterance = null;
      onEnd?.();
    };
    utterance.onerror = () => {
      notifyTTSState(false, voiceName);
      currentUtterance = null;
      onEnd?.();
    };

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Fallback WebSpeech error:', err);
    notifyTTSState(false, gender === 'male' ? TTS_VOICES.male : TTS_VOICES.female);
    onEnd?.();
  }
}

export interface SpeakOptions {
  gender?: VoiceGender;
  voice?: string;
  characterId?: string;
  speakerName?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

export async function speakText(
  text: string,
  optionsOrOnEnd?: (() => void) | SpeakOptions,
  legacyGender?: VoiceGender
): Promise<void> {
  if (typeof window === 'undefined') return;

  let onEnd: (() => void) | undefined;
  let onStart: (() => void) | undefined;
  let gender: VoiceGender = 'female';
  let explicitVoice: string | undefined;

  if (typeof optionsOrOnEnd === 'function') {
    onEnd = optionsOrOnEnd;
    gender = legacyGender || 'female';
  } else if (optionsOrOnEnd && typeof optionsOrOnEnd === 'object') {
    onEnd = optionsOrOnEnd.onEnd;
    onStart = optionsOrOnEnd.onStart;
    explicitVoice = optionsOrOnEnd.voice;
    if (optionsOrOnEnd.characterId) {
      gender = resolveCharacterGender(optionsOrOnEnd.characterId);
    } else if (optionsOrOnEnd.speakerName) {
      gender = resolveCharacterGender(optionsOrOnEnd.speakerName);
    } else if (optionsOrOnEnd.gender) {
      gender = optionsOrOnEnd.gender;
    }
  }

  stopSpeaking();

  const clean = cleanTextForSpeech(text);
  if (!clean) {
    onEnd?.();
    return;
  }

  const selectedVoiceModel =
    explicitVoice || (gender === 'male' ? TTS_VOICES.male : TTS_VOICES.female);

  try {
    const blob = await fetchTTSAudio(clean, selectedVoiceModel);
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    currentAudio = audio;

    const cleanup = () => {
      if (currentAudio === audio) {
        currentAudio = null;
        notifyTTSState(false, selectedVoiceModel);
      }
      try {
        URL.revokeObjectURL(audioUrl);
      } catch {}
    };

    audio.onended = () => {
      cleanup();
      onEnd?.();
    };

    audio.onerror = () => {
      cleanup();
      fallbackWebSpeech(clean, gender, onEnd);
    };

    notifyTTSState(true, selectedVoiceModel);
    onStart?.();
    await audio.play();
  } catch (err) {
    console.warn('9Router Edge-TTS fallback:', err);
    fallbackWebSpeech(clean, gender, onEnd);
  }
}

export function stopSpeaking() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {}
    currentAudio = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
    currentUtterance = null;
  }

  notifyTTSState(false, currentSpeakingVoice);
}

// Speech-to-Text (STT) Recognition
export function isSpeechRecognitionAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function createSpeechRecognizer(
  onResult: (transcript: string) => void,
  onError: (err: any) => void,
  onEnd: () => void
): any {
  if (!isSpeechRecognitionAvailable()) return null;

  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognizer = new SpeechRec();

  recognizer.lang = 'id-ID';
  recognizer.continuous = false;
  recognizer.interimResults = false;

  recognizer.onresult = (e: any) => {
    const text = e.results?.[0]?.[0]?.transcript || '';
    onResult(text);
  };

  recognizer.onerror = (e: any) => {
    onError(e);
  };

  recognizer.onend = () => {
    onEnd();
  };

  return recognizer;
}

// Wishlist Helpers (Buku Impian Rahasia Khaulah)
export function getSavedWishes(): WishlistItem[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = localStorage.getItem(STORAGE_WISHLIST_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load wishlist:', e);
  }
  return [];
}

export function saveWishItem(item: WishlistItem) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const current = getSavedWishes();
    const updated = [item, ...current.filter((w) => w.prompt !== item.prompt)].slice(0, 50);
    localStorage.setItem(STORAGE_WISHLIST_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save wish:', e);
  }
}

export function removeWishItem(id: string) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const current = getSavedWishes();
    const updated = current.filter((w) => w.id !== id);
    localStorage.setItem(STORAGE_WISHLIST_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to remove wish:', e);
  }
}
