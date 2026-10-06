// AI Service for Dunia Bahagia Khaulah 3D
// Connected to local endpoint via /ai-proxy or direct http://localhost:20128/v1

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
    | 'wishlist'
    | 'chat_only';
  actionParam?: any;
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

async function callChatCompletion(messages: Array<{ role: string; content: string }>, jsonFormat = true): Promise<string> {
  const endpoints = ['/ai-proxy/chat/completions'];

  let lastError: any = null;

  for (const url of endpoints) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const payload: any = {
        model: 'ag/gemini-3.7-flash-low',
        messages,
        stream: false,
      };

      if (jsonFormat) {
        payload.response_format = { type: 'json_object' };
      }

      const res = await fetch(url, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
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
  if (q.includes('sekolah') || q.includes('tk') || q.includes('guru') || q.includes('santi')) {
    return {
      speech: 'Wuuush! Khaulah tiba di gerbang TK Karang Tengah 1 Atap! Selamat belajar sayang! 🎒🏫',
      action: 'teleport',
      actionParam: 'tk',
    };
  }
  if (q.includes('pantai') || q.includes('danau') || q.includes('bebek') || q.includes('laut')) {
    return {
      speech: 'Swuuush! Semilir angin pantai dan danau bebek menyambut Khaulah! 🏖️🦢🌊',
      action: 'teleport',
      actionParam: 'pantai',
    };
  }
  if (q.includes('rumah') || q.includes('pulang') || q.includes('teras')) {
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
  if (q.includes('kebun') || q.includes('hewan') || q.includes('kelinci') || q.includes('domba')) {
    return {
      speech: 'Khaulah sampai di Taman Hewan & Kebun Buah Ceria! Mbaa~ kelinci dan domba melompat riang! 🐑🥕🍎',
      action: 'teleport',
      actionParam: 'kebun',
    };
  }
  if (q.includes('waterpark') || q.includes('kolam') || q.includes('renang')) {
    return {
      speech: 'Byuuuuur! Khaulah sampai di Waterpark Halaman Belakang! Ayo meluncur! 🌊🛝',
      action: 'teleport',
      actionParam: 'waterpark',
    };
  }
  if (q.includes('obby') || q.includes('istana bintang') || q.includes('langit') || q.includes('pelangi')) {
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

  // If complex wish
  return {
    speech: `Wah, mantra "${input}" hebat sekali! Ide kreatif Khaulah sudah dicatat di Buku Impian Khaulah supaya Abi bisa wujudkan nanti! ✨📖`,
    action: 'wishlist',
    wishlistTitle: input,
    isWishRecorded: true,
  };
}

function validateMagicResult(parsed: any): void {
  if (!parsed || typeof parsed.speech !== 'string' || !parsed.speech.trim()) throw new Error('Balasan AI tidak valid.');
  const enums: Record<string, readonly string[]> = {
    set_time: ['subuh', 'siang', 'sore', 'malam'],
    teleport: ['rumah', 'tk', 'pantai', 'karnaval', 'kebun', 'waterpark', 'obby'],
    set_accessory: ['none', 'bunny_ears', 'fairy_wings', 'princess_crown', 'cat_ears', 'star_halo'],
    set_pet: ['none', 'puppy', 'kitten', 'fairy'],
    play_sound: ['fire_siren', 'train', 'bell'],
  };
  const actions = [...Object.keys(enums), 'speed_buff', 'super_jump', 'spawn_balloons', 'spawn_cake', 'spawn_bubbles', 'spawn_stars', 'celebrate', 'riddle', 'khalid_follow', 'wishlist', 'chat_only'];
  if (!actions.includes(parsed.action) || (enums[parsed.action] && !enums[parsed.action].includes(parsed.actionParam))) throw new Error('Aksi AI tidak valid.');
  if (parsed.action === 'speed_buff' || parsed.action === 'super_jump') {
    parsed.actionParam = typeof parsed.actionParam === 'number' && Number.isFinite(parsed.actionParam)
      ? Math.max(1, Math.min(120, parsed.actionParam)) : 25;
  }
  if (parsed.action === 'khalid_follow' && typeof parsed.actionParam !== 'boolean') throw new Error('Parameter pengikut tidak valid.');
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
   - "set_time": Ubah waktu. actionParam salah satu dari: "subuh", "siang", "sore", "malam".
   - "speed_buff": Lari super cepat / kekuatan kilat. actionParam: 25 (durasi detik).
   - "super_jump": Lompat super tinggi setinggi awan. actionParam: 25.
   - "teleport": Pindah tempat seketika. actionParam salah satu dari: "rumah", "tk", "pantai", "karnaval", "kebun", "waterpark", "obby".
   - "set_accessory": Pasang hiasan. actionParam: "princess_crown", "fairy_wings", "bunny_ears", "cat_ears", "star_halo", "none".
   - "set_pet": Ganti hewan teman. actionParam: "kitten", "puppy", "fairy", "none".
   - "spawn_balloons": Munculkan hujan balon di sekeliling pemain. actionParam: {"count": 16, "color": "rainbow"}.
   - "spawn_cake": Munculkan kue ulang tahun raksasa dengan lilin di depan pemain. actionParam: "birthday".
   - "spawn_bubbles": Munculkan banyak gelembung sabun ajaib. actionParam: {"count": 24}.
   - "spawn_stars": Munculkan hujan bintang keemasan. actionParam: {"count": 12}.
   - "celebrate": Pesta konfeti & kembang api meriah.
   - "play_sound": Bunyikan suara khas ("fire_siren", "train", "bell").
   - "riddle": Memberikan tebak-tebakan anak lucu yang seru.
   - "khalid_follow": Ajak Adek Khalid berlari mengekor dan ikut berpetualang bareng Khaulah. actionParam: true (ikut) atau false (istirahat).
   - "wishlist": Jika Khaulah meminta hal baru di luar aset yang ada (seperti dinosaurus, istana es, mobil terbang, kolam susu cokelat, roket luar angkasa), katakan dengan gembira bahwa mantranya telah disimpan di Buku Impian Khaulah agar Abi bisa membuatnya nanti!
   - "chat_only": Hanya obrolan/cerita santai.

PENTING: Selalu jawab dalam format JSON valid persis seperti ini:
{
  "speech": "Balasan hangat ceria 1-2 kalimat untuk Khaulah",
  "action": "nama_action",
  "actionParam": "parameter_action",
  "wishlistTitle": "Nama ide (hanya jika action adalah wishlist, kalau tidak isi null)"
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
    validateMagicResult(parsed);

    const result: MagicActionResult = {
      speech: parsed.speech || 'Mantra ajaib Khaulah sudah terwujud! ✨',
      action: parsed.action || 'chat_only',
      actionParam: parsed.actionParam,
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

// Text-to-Speech (TTS) Engine
let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speakText(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) { onEnd?.(); return; }

  try {
    window.speechSynthesis.cancel(); // Stop previous speech

    const clean = text.replace(/[*_~`]/g, '').trim();
    if (!clean) { onEnd?.(); return; }

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'id-ID';
    utterance.rate = 1.05; // Slightly lively
    utterance.pitch = 1.25; // Cheerful friendly tone

    // Prefer Indonesian voice
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(
      (v) => v.lang.toLowerCase().startsWith('id') || v.lang.toLowerCase().includes('id-id')
    );
    if (idVoice) {
      utterance.voice = idVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('TTS error:', err);
    if (onEnd) onEnd();
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
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
