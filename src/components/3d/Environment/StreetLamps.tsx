import React from 'react';
import { useGameStore } from '../../../state/useGameStore';

export interface StreetLampProps {
  pos: [number, number, number];
  rotationY?: number;
  hasPointLight?: boolean;
}

// Model tiang lampu jalan klasik yang indah dengan kap lentera, bohlam berpijar, dan sorotan cahaya
export const StreetLamp: React.FC<StreetLampProps> = ({ pos, rotationY = 0, hasPointLight = false }) => {
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const isNight = timeOfDay === 'malam';
  const isDark = timeOfDay === 'malam' || timeOfDay === 'sore' || timeOfDay === 'subuh';

  return (
    <group position={pos} rotation={[0, rotationY, 0]}>
      {/* 1. Base Pedestal (Fondasi Besi di Tanah) */}
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.3, 0.32, 8]} />
        <meshStandardMaterial color="#1E293B" roughness={0.7} />
      </mesh>
      {/* Cincin ornamen alas */}
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 0.08, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.2} roughness={0.6} />
      </mesh>

      {/* 2. Tiang Lampu Utama (Pole) */}
      <mesh position={[0, 1.85, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.11, 3.1, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Cincin ornamen emas di tiang */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.08, 8]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.095, 0.095, 0.08, 8]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* 3. Lengan Tiang Melengkung (Curved Arm & Bracket) */}
      <mesh position={[0, 3.42, 0.32]} castShadow>
        <boxGeometry args={[0.09, 0.09, 0.68]} />
        <meshStandardMaterial color="#1E293B" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Penyangga miring lengkungan */}
      <mesh position={[0, 3.22, 0.18]} rotation={[0.65, 0, 0]} castShadow>
        <boxGeometry args={[0.06, 0.06, 0.38]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* 4. Kap Rumah Lentera (Lantern Cap & Finial) */}
      {/* Tutup Atas Piramida */}
      <mesh position={[0, 3.65, 0.62]} castShadow>
        <coneGeometry args={[0.28, 0.2, 4]} />
        <meshStandardMaterial color="#0F172A" roughness={0.6} metalness={0.4} />
      </mesh>
      {/* Ujung Hiasan Atas (Finial Spike) */}
      <mesh position={[0, 3.8, 0.62]}>
        <coneGeometry args={[0.045, 0.12, 6]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Rangka Bawah Lentera */}
      <mesh position={[0, 3.18, 0.62]} castShadow>
        <boxGeometry args={[0.24, 0.04, 0.24]} />
        <meshStandardMaterial color="#1E293B" />
      </mesh>

      {/* 5. Kaca Lentera Berpijar (Glowing Glass Lantern) */}
      <mesh position={[0, 3.4, 0.62]} castShadow>
        <boxGeometry args={[0.22, 0.36, 0.22]} />
        <meshStandardMaterial
          color={isDark ? '#FFFBEB' : '#E2E8F0'}
          emissive={isDark ? '#FFD166' : '#000000'}
          emissiveIntensity={isNight ? 2.2 : isDark ? 1.3 : 0}
          roughness={0.2}
        />
      </mesh>

      {/* 6. Inti Bohlam Terang (Inner Bulb Core) */}
      {isDark && (
        <mesh position={[0, 3.4, 0.62]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      )}

      {/* 7. Sorotan Cahaya Nyata (Real Dynamic Point Light) */}
      {isDark && hasPointLight && (
        <pointLight
          position={[0, 3.35, 0.62]}
          color="#FFE8A3"
          intensity={isNight ? 1.6 : 0.85}
          distance={11.0}
          decay={1.8}
        />
      )}

      {/* 8. Kolam Cahaya Hangat di Permukaan Jalan (Warm Ground Light Pool) */}
      {isDark && (
        <mesh position={[0, 0.265, 0.62]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.3, 16]} />
          <meshBasicMaterial
            color="#FFD166"
            transparent
            opacity={isNight ? 0.24 : 0.12}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
};

// Daftar jaringan lampu jalan desa di seluruh jalan raya, trotoar, dan alun-alun
// Dioptimalkan: 6 titik hub strategis menggunakan dynamic pointLight, sementara seluruh lampu
// tetap memiliki efek visual lentera berpijar & kolam cahaya tanah yang mempesona tanpa beban GPU
const STREET_LAMP_CONFIGS: StreetLampProps[] = [
  // --- JALUR UTAMA 1: RUMAH KHAULAH ➔ JEMBATAN TENGAH (Z: -6 s/d 14) ---
  { pos: [2.8, 0, -4.5], rotationY: -Math.PI / 2, hasPointLight: true }, // Hub 1: Depan Rumah Khaulah
  { pos: [-2.8, 0, -4.5], rotationY: Math.PI / 2, hasPointLight: false },
  { pos: [2.8, 0, 2.0], rotationY: -Math.PI / 2, hasPointLight: false },
  { pos: [-2.8, 0, 2.0], rotationY: Math.PI / 2, hasPointLight: false },
  { pos: [2.8, 0, 8.5], rotationY: -Math.PI / 2, hasPointLight: false },
  { pos: [-2.8, 0, 8.5], rotationY: Math.PI / 2, hasPointLight: false },
  { pos: [2.8, 0, 13.5], rotationY: -Math.PI / 2, hasPointLight: true }, // Hub 2: Jembatan Sungai Desa
  { pos: [-2.8, 0, 13.5], rotationY: Math.PI / 2, hasPointLight: false },

  // --- JALUR UTAMA 2: JEMBATAN ➔ GERBANG TK ➔ PINTU TK (Z: 22 s/d 55) ---
  { pos: [2.8, 0, 23.0], rotationY: -Math.PI / 2, hasPointLight: false },
  { pos: [-2.8, 0, 23.0], rotationY: Math.PI / 2, hasPointLight: false },
  { pos: [2.8, 0, 30.0], rotationY: -Math.PI / 2, hasPointLight: true }, // Hub 3: Gerbang Masuk TK
  { pos: [-2.8, 0, 30.0], rotationY: Math.PI / 2, hasPointLight: false },
  { pos: [2.8, 0, 40.0], rotationY: -Math.PI / 2, hasPointLight: false },
  { pos: [-2.8, 0, 40.0], rotationY: Math.PI / 2, hasPointLight: false },
  { pos: [2.8, 0, 52.0], rotationY: -Math.PI / 2, hasPointLight: false },
  { pos: [-2.8, 0, 52.0], rotationY: Math.PI / 2, hasPointLight: false },

  // --- JALUR SELATAN TIMUR: KE ARAH DESA PERTOKOAN (Z: 2.4, X: 12 s/d 72) ---
  { pos: [14, 0, 2.4], rotationY: Math.PI, hasPointLight: false },
  { pos: [28, 0, 2.4], rotationY: Math.PI, hasPointLight: false },
  { pos: [42, 0, 2.4], rotationY: Math.PI, hasPointLight: true }, // Hub 4: Alun-Alun Pertokoan Desa
  { pos: [56, 0, 2.4], rotationY: Math.PI, hasPointLight: false },
  { pos: [70, 0, 2.4], rotationY: Math.PI, hasPointLight: false },

  // --- JALUR SELATAN BARAT: KE ARAH PETERNAKAN HEWAN (Z: 2.4, X: -12 s/d -72) ---
  { pos: [-14, 0, 2.4], rotationY: Math.PI, hasPointLight: false },
  { pos: [-28, 0, 2.4], rotationY: Math.PI, hasPointLight: false },
  { pos: [-42, 0, 2.4], rotationY: Math.PI, hasPointLight: true }, // Hub 5: Gerbang Peternakan Hewan
  { pos: [-56, 0, 2.4], rotationY: Math.PI, hasPointLight: false },
  { pos: [-70, 0, 2.4], rotationY: Math.PI, hasPointLight: false },

  // --- JALUR UTARA TIMUR: KE ARAH ALUN-ALUN KARNAVAL & PASAR MALAM (Z: 22.8, X: 14 s/d 70) ---
  { pos: [14, 0, 22.8], rotationY: 0, hasPointLight: false },
  { pos: [28, 0, 22.8], rotationY: 0, hasPointLight: false },
  { pos: [42, 0, 22.8], rotationY: 0, hasPointLight: true }, // Hub 6: Pintu Masuk Karnaval Fantasi
  { pos: [56, 0, 22.8], rotationY: 0, hasPointLight: false },
  { pos: [70, 0, 22.8], rotationY: 0, hasPointLight: false },

  // --- JALUR UTARA BARAT: KE ARAH DANAU BEBEK & PANTAI PASIR (Z: 22.8, X: -14 s/d -70) ---
  { pos: [-14, 0, 22.8], rotationY: 0, hasPointLight: false },
  { pos: [-28, 0, 22.8], rotationY: 0, hasPointLight: false },
  { pos: [-42, 0, 22.8], rotationY: 0, hasPointLight: true }, // Hub 7: Pintu Masuk Pantai & Dermaga Danau Bebek
  { pos: [-56, 0, 22.8], rotationY: 0, hasPointLight: false },
  { pos: [-70, 0, 22.8], rotationY: 0, hasPointLight: false },

  // --- PENGHUBUNG UTARA-SELATAN JEMBATAN BARAT (X: -47.5) ---
  { pos: [-47.5, 0, 6.0], rotationY: Math.PI / 2, hasPointLight: false },
  { pos: [-47.5, 0, 12.0], rotationY: Math.PI / 2, hasPointLight: false },

  // --- PENGHUBUNG UTARA-SELATAN JEMBATAN TIMUR (X: 47.5) ---
  { pos: [47.5, 0, 6.0], rotationY: -Math.PI / 2, hasPointLight: false },
  { pos: [47.5, 0, 12.0], rotationY: -Math.PI / 2, hasPointLight: false },

  // --- AREA KOLAM RENANG & HALAMAN BELAKANG (Z: -14 s/d -28) ---
  { pos: [4.0, 0, -14], rotationY: -Math.PI / 2, hasPointLight: false },
  { pos: [-4.0, 0, -14], rotationY: Math.PI / 2, hasPointLight: false },
  { pos: [4.0, 0, -26], rotationY: -Math.PI / 2, hasPointLight: false },
  { pos: [-4.0, 0, -26], rotationY: Math.PI / 2, hasPointLight: false },
];

export const StreetLamps: React.FC = () => {
  return (
    <group>
      {STREET_LAMP_CONFIGS.map((lamp, idx) => (
        <StreetLamp
          key={idx}
          pos={lamp.pos}
          rotationY={lamp.rotationY}
          hasPointLight={lamp.hasPointLight}
        />
      ))}
    </group>
  );
};
