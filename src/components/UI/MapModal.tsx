import React, { useState } from 'react';
import { useGameStore, gameStore } from '../../state/useGameStore';
import { soundManager } from '../../sound/audioManager';
import { X, Navigation, Compass, Sparkles, MapPin } from 'lucide-react';

interface ZoneInfo {
  id: string;
  name: string;
  icon: string;
  coords: [number, number, number];
  category: 'utama' | 'petualangan' | 'wisata';
  description: string;
  tag: string;
}

const ZONES: ZoneInfo[] = [
  {
    id: 'rumah',
    name: 'Rumah Bahagia Khaulah',
    icon: '🏡',
    coords: [0, 0.8, -4],
    category: 'utama',
    description: 'Rumah megah 2 lantai lengkap dengan kamar tidur, musholla, dapur & halaman luas.',
    tag: 'Pusat Rumah',
  },
  {
    id: 'tk',
    name: 'TK Karang Tengah 1 Atap',
    icon: '🎒',
    coords: [0, 0.8, 38],
    category: 'utama',
    description: 'Sekolah TK asri tempat belajar seru, ayunan ganda, perosotan & lapangan bola!',
    tag: 'Sekolah & Main',
  },
  {
    id: 'pantai',
    name: 'Danau & Pantai Pasir Emas',
    icon: '🏖️',
    coords: [-50, 0.8, 35],
    category: 'wisata',
    description: 'Dermaga perahu bebek angsa, payung santai pantai, dan ombak tenang.',
    tag: 'Danau Asri',
  },
  {
    id: 'karnaval',
    name: 'Pasar Malam & Karnaval Ceria',
    icon: '🎡',
    coords: [55, 0.8, 35],
    category: 'wisata',
    description: 'Komidi putar berputar, bianglala raksasa, kereta mini berputar & lampu warna-warni.',
    tag: 'Wahana Seru',
  },
  {
    id: 'kebun',
    name: 'Taman Hewan & Kebun Buah',
    icon: '🐑',
    coords: [-35, 0.8, -10],
    category: 'utama',
    description: 'Kandang domba awan lembut, kelinci lucu, anak kucing ceria & pohon buah segar.',
    tag: 'Hewan Sahabat',
  },
  {
    id: 'waterpark',
    name: 'Waterpark Halaman Belakang',
    icon: '🌊',
    coords: [2, 0.8, -25],
    category: 'wisata',
    description: 'Kolam renang luas, seluncuran air spiral seru & pelampung flamingo raksasa.',
    tag: 'Main Air',
  },
  {
    id: 'obby',
    name: 'Jalur Pelangi ke Langit',
    icon: '🌈',
    coords: [0, 1.2, 58],
    category: 'petualangan',
    description: 'Tantangan parkour pilar pelangi melayang menembus awan putih menuju bintang emas.',
    tag: 'Parkour Seru',
  },
  {
    id: 'bukit_pelangi',
    name: 'Bukit Pelangi Ceria',
    icon: '🌸',
    coords: [110, 9.2, 100],
    category: 'petualangan',
    description: 'Lereng bukit teras pelangi, seluncuran rumput cepat, kincir angin & teropong bintang.',
    tag: 'Zona Baru 🌈',
  },
  {
    id: 'hutan_ajaib',
    name: 'Hutan Ajaib Jamur Bercahaya',
    icon: '🍄',
    coords: [-95, 1.2, 95],
    category: 'petualangan',
    description: 'Rumah pohon peri raksasa, jembatan tali gantung & jamur raksasa trampolin super membal.',
    tag: 'Zona Baru 🍄',
  },
  {
    id: 'lembah_salju',
    name: 'Lembah Salju & Es Abadi',
    icon: '❄️',
    coords: [0, 1.2, 125],
    category: 'petualangan',
    description: 'Danau es seluncur licin, arena snowman bersama kelinci & pinguin kutub bersahabat.',
    tag: 'Zona Baru ❄️',
  },
  {
    id: 'pantai_luas',
    name: 'Pantai Samudra & Mercusuar',
    icon: '🏝️',
    coords: [-105, 0.8, -15],
    category: 'wisata',
    description: 'Pantai pasir putih samudra luas dengan mercusuar megah pemandu kapal laut.',
    tag: 'Zona Baru ⛵',
  },
  {
    id: 'desa_sawah',
    name: 'Desa Sawah & Kincir Air',
    icon: '🌾',
    coords: [95, 0.8, -35],
    category: 'wisata',
    description: 'Sawah terasering padi emas bertingkat, gemericik kincir air bambu & traktor cilik.',
    tag: 'Zona Baru 🚜',
  },
  {
    id: 'masjid',
    name: 'Masjid Indah Baiturrahman',
    icon: '🕌',
    coords: [0, 0.8, -60],
    category: 'utama',
    description: 'Masjid megah berkubah pirus toska, 4 menara azan, air mancur marmer & karpet sholat sejuk.',
    tag: 'Zona Baru 🕌',
  },
  {
    id: 'balon_udara',
    name: 'Dermaga Balon Udara Fantasi',
    icon: '🎈',
    coords: [53, 0.8, 85],
    category: 'wisata',
    description: 'Wahana balon udara terbang 360 derajat panorama menikmati pemandangan seluruh pulau.',
    tag: 'Zona Baru 🎈',
  },
];

export const MapModal: React.FC = () => {
  const isMapModalOpen = useGameStore((s) => s.isMapModalOpen);
  const playerPos = useGameStore((s) => s.playerPos);
  const [selectedZone, setSelectedZone] = useState<ZoneInfo>(ZONES[0]);
  const [filter, setFilter] = useState<'semua' | 'utama' | 'wisata' | 'petualangan'>('semua');

  if (!isMapModalOpen) return null;

  // Map coordinate conversion to SVG percentage:
  // World bounds: X around -130 to 130 (width ~ 260)
  // World bounds: Z around -80 to 140 (height ~ 220)
  // Let SVG viewBox be 0 0 400 350
  const worldToSvg = (x: number, z: number) => {
    const minX = -215;
    const maxX = 145;
    const minZ = -90;
    const maxZ = 160;

    const svgX = ((x - minX) / (maxX - minX)) * 360 + 20;
    const svgY = ((z - minZ) / (maxZ - minZ)) * 310 + 20;
    return { x: Math.max(15, Math.min(385, svgX)), y: Math.max(15, Math.min(335, svgY)) };
  };

  const playerSvg = worldToSvg(playerPos[0], playerPos[2]);

  const filteredZones = filter === 'semua' ? ZONES : ZONES.filter((z) => z.category === filter);

  const handleTeleport = (zone: ZoneInfo) => {
    soundManager.playMagicSpell();
    gameStore.teleportToPreset(zone.id);
    gameStore.closeMapModal();
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-gradient-to-b from-sky-50 via-white to-pink-50 w-full max-w-4xl max-h-[92vh] rounded-3xl border-4 border-amber-300 shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 p-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl shadow-inner border border-white/30">
              🗺️
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bubble font-bold tracking-wide flex items-center gap-2">
                Peta Pulau Impian Khaulah
                <span className="text-xs font-semibold bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full shadow">
                  14 Lokasi
                </span>
              </h2>
              <p className="text-xs text-sky-100 font-medium">
                Pilih tempat tujuan untuk langsung berteleportasi dengan ajaib! ✨
              </p>
            </div>
          </div>
          <button
            onClick={() => gameStore.closeMapModal()}
            className="w-9 h-9 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center border-2 border-white shadow-md active:scale-90 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-3 p-3 sm:p-4">
          {/* Left Column: Interactive Map Graphic (7 cols) */}
          <div className="md:col-span-7 flex flex-col bg-sky-100/80 rounded-2xl p-2.5 border-2 border-sky-200 relative overflow-hidden shadow-inner">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1 z-10">
              {(
                [
                  { id: 'semua', label: 'Semua (14)' },
                  { id: 'utama', label: '🏡 Utama' },
                  { id: 'wisata', label: '🎡 Wisata' },
                  { id: 'petualangan', label: '🌈 Petualangan' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`text-xs font-bubble font-bold px-3 py-1 rounded-full whitespace-nowrap transition-all shadow-sm ${
                    filter === f.id
                      ? 'bg-purple-600 text-white shadow-purple-200 scale-105'
                      : 'bg-white/80 text-gray-700 hover:bg-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* SVG Visual Island Map */}
            <div className="flex-1 relative w-full h-[220px] sm:h-[300px] md:h-full bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-100 rounded-xl overflow-hidden border border-sky-300">
              <svg viewBox="0 0 400 350" className="w-full h-full">
                {/* Ocean Waves Backdrop */}
                <rect width="400" height="350" fill="#BAE6FD" />
                <path
                  d="M 20 50 Q 80 40 140 60 Q 220 30 300 50 Q 360 40 400 60 L 400 350 L 0 350 L 0 60 Z"
                  fill="#7DD3FC"
                  opacity="0.5"
                />

                {/* Main Island Landmass Contour */}
                <path
                  d="M 60 70 
                     C 120 40, 260 40, 330 65 
                     C 385 100, 395 200, 360 260 
                     C 320 320, 220 340, 150 325 
                     C 60 310, 20 250, 25 180 
                     C 30 120, 45 80, 60 70 Z"
                  fill="#86EFAC"
                  stroke="#4ADE80"
                  strokeWidth="4"
                  className="filter drop-shadow-md"
                />

                {/* Inner Island Hill Shading */}
                <path
                  d="M 120 100 C 180 80, 250 85, 290 120 C 310 170, 280 230, 220 240 C 160 245, 110 210, 105 160 C 100 130, 110 110, 120 100 Z"
                  fill="#BBF7D0"
                  opacity="0.8"
                />

                {/* Lake / Water Body */}
                <ellipse cx="140" cy="180" rx="45" ry="25" fill="#38BDF8" opacity="0.85" />
                <ellipse cx="140" cy="180" rx="35" ry="18" fill="#0284C7" opacity="0.5" />

                {/* Compass Rose */}
                <g transform="translate(365, 35)">
                  <circle r="14" fill="#FFFFFF" opacity="0.85" stroke="#CBD5E1" strokeWidth="1.5" />
                  <path d="M 0 -11 L 3 0 L 0 11 L -3 0 Z" fill="#EF4444" />
                  <path d="M -11 0 L 0 3 L 11 0 L 0 -3 Z" fill="#3B82F6" />
                  <text x="0" y="-12" fontSize="7" fontWeight="bold" textAnchor="middle" fill="#991B1B">
                    U
                  </text>
                </g>

                {/* Zone Markers */}
                {filteredZones.map((z) => {
                  const pt = worldToSvg(z.coords[0], z.coords[2]);
                  const isSelected = selectedZone.id === z.id;
                  return (
                    <g
                      key={z.id}
                      transform={`translate(${pt.x}, ${pt.y})`}
                      className="cursor-pointer transition-transform hover:scale-125"
                      onClick={() => {
                        soundManager.playHighFive();
                        setSelectedZone(z);
                      }}
                    >
                      {/* Pulse halo if selected */}
                      {isSelected && (
                        <circle r="16" fill="#F472B6" opacity="0.4" className="animate-ping" />
                      )}
                      <circle
                        r={isSelected ? 13 : 10}
                        fill={isSelected ? '#EC4899' : '#FFFFFF'}
                        stroke={isSelected ? '#FFFFFF' : '#64748B'}
                        strokeWidth="2"
                        className="shadow"
                      />
                      <text
                        x="0"
                        y={isSelected ? 4 : 3.5}
                        fontSize={isSelected ? 11 : 9}
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {z.icon}
                      </text>
                    </g>
                  );
                })}

                {/* Player Current Location Marker */}
                <g transform={`translate(${playerSvg.x}, ${playerSvg.y})`}>
                  <circle r="12" fill="#F43F5E" opacity="0.35" className="animate-ping" />
                  <circle r="7" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="2" />
                  <circle r="2.5" fill="#FFFFFF" />
                  <text
                    x="0"
                    y="-11"
                    fontSize="8"
                    fontWeight="bold"
                    fill="#9F1239"
                    textAnchor="middle"
                    className="font-bubble"
                  >
                    Khaulah ✨
                  </text>
                </g>
              </svg>

              {/* Legend overlay */}
              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] font-medium text-slate-700 flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Posisi Khaulah
                </span>
                <span className="text-slate-300">|</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-pink-500" /> Klik Pin untuk Pilih
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Zone Detail Card & Quick Teleport (5 cols) */}
          <div className="md:col-span-5 flex flex-col justify-between bg-white rounded-2xl p-4 border-2 border-pink-200 shadow-sm overflow-y-auto">
            <div>
              {/* Selected Zone Header */}
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-400 to-purple-400 text-3xl flex items-center justify-center shadow-md border-2 border-white shrink-0">
                  {selectedZone.icon}
                </div>
                <div>
                  <span className="inline-block bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {selectedZone.tag}
                  </span>
                  <h3 className="text-lg font-bubble font-bold text-purple-950 mt-0.5 leading-tight">
                    {selectedZone.name}
                  </h3>
                  <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                    Koordinat: [{Math.round(selectedZone.coords[0])}, {Math.round(selectedZone.coords[2])}]
                  </p>
                </div>
              </div>

              {/* Zone Description */}
              <div className="mt-3.5 bg-pink-50/60 rounded-xl p-3 border border-pink-100">
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-bubble">
                  {selectedZone.description}
                </p>
              </div>

              {/* Teleport Button */}
              <button
                onClick={() => handleTeleport(selectedZone)}
                className="w-full mt-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-bubble font-bold text-base shadow-lg hover:shadow-xl border-2 border-white active:scale-95 transition-all flex items-center justify-center gap-2 group"
              >
                <Sparkles className="w-5 h-5 text-yellow-300 animate-spin-slow group-hover:scale-125 transition-transform" />
                <span>Teleport ke Sini! 🚀</span>
              </button>
            </div>

            {/* Quick List for Scrollable Access */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <span className="text-[11px] font-bold text-gray-500 block mb-1.5 uppercase tracking-wider">
                Daftar Seluruh Lokasi:
              </span>
              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {filteredZones.map((z) => (
                  <button
                    key={z.id}
                    onClick={() => {
                      soundManager.playHighFive();
                      setSelectedZone(z);
                    }}
                    className={`text-left p-1.5 rounded-xl border text-xs font-bubble flex items-center gap-1.5 transition-all ${
                      selectedZone.id === z.id
                        ? 'bg-purple-100 border-purple-400 text-purple-900 font-bold'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-base">{z.icon}</span>
                    <span className="truncate">{z.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
