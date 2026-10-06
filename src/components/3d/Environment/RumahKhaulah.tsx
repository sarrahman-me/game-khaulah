import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, gameStore } from '../../../state/useGameStore';
import { soundManager } from '../../../sound/audioManager';
import {
  colliders,
  addSolidBox,
  addSolidCylinder,
  removeSolidCollider,
  SolidCollider,
  PlatformCollider,
} from '../../../state/colliders';

// ============================================================================
// 1. RUMAH KHAULAH EXTERIOR (DUNIA LUAR - POSISI [0, 0, 0])
// ============================================================================
export const RumahKhaulahExterior: React.FC = () => {
  const isInsideHouse = useGameStore((s) => s.isInsideHouse);
  const lastNearDoorRef = useRef<string | null>(null);

  useEffect(() => {
    // Front Porch Floor (Z: -2.4 to -6.5, X: -8.5 to 8.5)
    const porchBox = new THREE.Box3(
      new THREE.Vector3(-8.5, -0.5, -6.6),
      new THREE.Vector3(8.5, 0.45, -2.4)
    );
    // Back Veranda Deck Floor (Z: -17.5 to -23.8, X: -6.0 to 6.0)
    const backVerandaBox = new THREE.Box3(
      new THREE.Vector3(-6.0, -0.5, -23.8),
      new THREE.Vector3(6.0, 0.45, -17.4)
    );

    const cPorch: PlatformCollider = { box: porchBox, type: 'ground' };
    const cVeranda: PlatformCollider = { box: backVerandaBox, type: 'ground' };
    colliders.push(cPorch, cVeranda);

    const solids: SolidCollider[] = [
      // Match the porch canopy so the camera cannot pass through its underside.
      addSolidBox([-8.7, 3.475, -6.8], [8.7, 3.825, -2.2], 'porch_canopy'),

      // Solid Front Wall (Completely closes the exterior house)
      addSolidBox([-8.6, 0, -6.8], [8.6, 4.5, -6.2], 'ext_wall_front'),

      // Left Exterior Wall (X: -8.5, Z: -17.6 to -6.4)
      addSolidBox([-8.8, 0, -17.6], [-8.2, 4.5, -6.4], 'ext_wall_left'),

      // Right Exterior Wall (X: +8.5, Z: -17.6 to -6.4)
      addSolidBox([8.2, 0, -17.6], [8.8, 4.5, -6.4], 'ext_wall_right'),

      // Solid Back Wall (Completely closes the exterior back towards pool deck)
      addSolidBox([-8.6, 0, -17.8], [8.6, 4.5, -17.2], 'ext_wall_back'),

      // Front Porch Pillars & Railings
      addSolidCylinder(-7.8, -2.8, 0.25, 0, 3.6, 'porch_col_left_corner'),
      addSolidCylinder(-2.8, -2.8, 0.25, 0, 3.6, 'porch_col_left_entry'),
      addSolidCylinder(2.8, -2.8, 0.25, 0, 3.6, 'porch_col_right_entry'),
      addSolidCylinder(7.8, -2.8, 0.25, 0, 3.6, 'porch_col_right_corner'),

      addSolidBox([-7.8, 0, -3.0], [-3.2, 1.2, -2.6], 'porch_rail_left'),
      addSolidBox([3.2, 0, -3.0], [7.8, 1.2, -2.6], 'porch_rail_right'),

      // Back Veranda Railings & Pergola
      addSolidBox([-5.8, 0, -23.5], [-5.4, 1.3, -17.6], 'veranda_rail_left'),
      addSolidBox([5.4, 0, -23.5], [5.8, 1.3, -17.6], 'veranda_rail_right'),
      addSolidCylinder(-2.4, -23.6, 0.16, 0, 3.4, 'pergola_post_left'),
      addSolidCylinder(2.4, -23.6, 0.16, 0, 3.4, 'pergola_post_right'),
    ];

    return () => {
      [cPorch, cVeranda].forEach((c) => {
        const idx = colliders.indexOf(c);
        if (idx !== -1) colliders.splice(idx, 1);
      });
      solids.forEach((s) => removeSolidCollider(s));
    };
  }, []);

  useFrame(() => {
    if (isInsideHouse) return;
    const playerPos = gameStore.getState().playerPos;

    const distFront = Math.hypot(playerPos[0] - 0, playerPos[2] - (-5.3));
    const distBack = Math.hypot(playerPos[0] - 0, playerPos[2] - (-18.6));

    if (distFront < 2.6) {
      if (lastNearDoorRef.current !== 'front' || gameStore.getState().nearbyInteractable === null) {
        lastNearDoorRef.current = 'front';
        gameStore.setNearbyInteractable({
          id: 'house_front_door',
          title: 'Pintu Rumah Khaulah',
          prompt: 'Tekan [E] untuk Masuk ke Rumah Khaulah! 🏡🚪',
        });
      }
    } else if (distBack < 2.6) {
      if (lastNearDoorRef.current !== 'back' || gameStore.getState().nearbyInteractable === null) {
        lastNearDoorRef.current = 'back';
        gameStore.setNearbyInteractable({
          id: 'house_back_door',
          title: 'Pintu Belakang Rumah',
          prompt: 'Tekan [E] untuk Masuk ke Rumah (Pintu Belakang)! 🏡🚪',
        });
      }
    } else {
      if (lastNearDoorRef.current !== null) {
        lastNearDoorRef.current = null;
        const cur = gameStore.getState().nearbyInteractable;
        if (cur?.id === 'house_front_door' || cur?.id === 'house_back_door') {
          gameStore.setNearbyInteractable(null);
        }
      }
    }
  });

  return (
    <group position={[0, 0, 0]} visible={!isInsideHouse}>
      {/* Front Porch Timber Deck Planks */}
      <mesh position={[0, 0.15, -4.5]} receiveShadow>
        <boxGeometry args={[17.0, 0.3, 4.2]} />
        <meshStandardMaterial color="#E9D8A6" roughness={0.5} />
      </mesh>

      {/* Porch Grand Columns */}
      {[-7.8, -2.8, 2.8, 7.8].map((cx, i) => (
        <group key={i} position={[cx, 1.8, -2.8]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.22, 0.25, 3.4, 16]} />
            <meshStandardMaterial color="#FFF1E6" roughness={0.6} />
          </mesh>
          <mesh position={[0, 1.65, 0]}>
            <boxGeometry args={[0.6, 0.15, 0.6]} />
            <meshStandardMaterial color="#E07A5F" />
          </mesh>
          <mesh position={[0, -1.65, 0]}>
            <boxGeometry args={[0.6, 0.15, 0.6]} />
            <meshStandardMaterial color="#E07A5F" />
          </mesh>
          <group position={[0, 0.9, 0.3]}>
            <mesh castShadow>
              <boxGeometry args={[0.26, 0.38, 0.26]} />
              <meshStandardMaterial color="#2B2D42" />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.12, 10, 10]} />
              <meshStandardMaterial color="#FFE6A7" emissive="#FFE6A7" emissiveIntensity={0.8} />
            </mesh>
            <pointLight color="#FFE6A7" intensity={0.6} distance={6} />
          </group>
        </group>
      ))}

      {/* Porch Railings */}
      {[-5.5, 5.5].map((rx, ri) => (
        <group key={ri} position={[rx, 0.65, -2.8]}>
          <mesh castShadow>
            <boxGeometry args={[4.4, 0.1, 0.15]} />
            <meshStandardMaterial color="#7F4F24" />
          </mesh>
          <mesh position={[0, -0.45, 0]}>
            <boxGeometry args={[4.4, 0.08, 0.12]} />
            <meshStandardMaterial color="#7F4F24" />
          </mesh>
          {[-1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8].map((bx, bi) => (
            <mesh key={bi} position={[bx, -0.22, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.45, 8]} />
              <meshStandardMaterial color="#FFF1E6" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Porch Overhang Canopy Roof */}
      <mesh position={[0, 3.65, -4.5]} castShadow>
        <boxGeometry args={[17.4, 0.35, 4.6]} />
        <meshStandardMaterial color="#C85A32" roughness={0.6} />
      </mesh>

      {/* Stepping Stones to Front Yard Path */}
      {[
        { x: 0, z: -2.1, s: 0.9 },
        { x: 0.2, z: -1.1, s: 0.85 },
        { x: -0.1, z: -0.1, s: 0.9 },
        { x: 0.1, z: 0.9, s: 0.85 },
      ].map((stone, idx) => (
        <mesh key={idx} position={[stone.x, 0.06, stone.z]} rotation={[-Math.PI / 2, 0, idx * 0.4]}>
          <circleGeometry args={[stone.s * 0.45, 16]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.8} />
        </mesh>
      ))}

      {/* Front Wall Wings & Arch Header */}
      <mesh position={[-5.1, 2.25, -6.5]} castShadow receiveShadow>
        <boxGeometry args={[6.8, 4.3, 0.4]} />
        <meshStandardMaterial color="#FFF1E6" roughness={0.7} />
      </mesh>
      <mesh position={[5.1, 2.25, -6.5]} castShadow receiveShadow>
        <boxGeometry args={[6.8, 4.3, 0.4]} />
        <meshStandardMaterial color="#FFF1E6" roughness={0.7} />
      </mesh>
      <mesh position={[0, 3.55, -6.5]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 1.7, 0.4]} />
        <meshStandardMaterial color="#FFF1E6" roughness={0.7} />
      </mesh>

      {/* Front Door Decorative Portal Frame & Plaque */}
      <group position={[0, 1.35, -6.5]}>
        <mesh position={[-1.5, 0, 0.1]} castShadow>
          <boxGeometry args={[0.2, 2.7, 0.3]} />
          <meshStandardMaterial color="#7F4F24" />
        </mesh>
        <mesh position={[1.5, 0, 0.1]} castShadow>
          <boxGeometry args={[0.2, 2.7, 0.3]} />
          <meshStandardMaterial color="#7F4F24" />
        </mesh>
        <mesh position={[0, 1.35, 0.1]} castShadow>
          <boxGeometry args={[3.2, 0.25, 0.3]} />
          <meshStandardMaterial color="#7F4F24" />
        </mesh>

        <mesh position={[0, 1.7, 0.15]}>
          <boxGeometry args={[3.6, 0.55, 0.08]} />
          <meshStandardMaterial color="#DDA15E" roughness={0.3} metalness={0.2} />
        </mesh>
        <Text
          position={[0, 1.7, 0.22]}
          fontSize={0.22}
          color="#582F0E"
          anchorX="center"
          anchorY="middle"
        >
          🏡 RUMAH IMPIAN KHAULAH ✨
        </Text>
      </group>

      {/* Closed Interactive Front Door */}
      <group
        position={[0, 1.35, -6.45]}
        onClick={(e) => {
          e.stopPropagation();
          gameStore.enterHouse('front');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <mesh position={[-0.7, 0, 0]} castShadow>
          <boxGeometry args={[1.36, 2.65, 0.1]} />
          <meshStandardMaterial color="#854D0E" roughness={0.4} />
        </mesh>
        <mesh position={[0.7, 0, 0]} castShadow>
          <boxGeometry args={[1.36, 2.65, 0.1]} />
          <meshStandardMaterial color="#854D0E" roughness={0.4} />
        </mesh>
        {[-0.7, 0.7].map((dx, di) => (
          <group key={di} position={[dx, 0, 0.055]}>
            <mesh position={[0, 0.55, 0]}>
              <boxGeometry args={[1.05, 0.95, 0.02]} />
              <meshStandardMaterial color="#A16207" />
            </mesh>
            <mesh position={[0, -0.55, 0]}>
              <boxGeometry args={[1.05, 0.95, 0.02]} />
              <meshStandardMaterial color="#A16207" />
            </mesh>
          </group>
        ))}
        <mesh position={[-0.15, 0.0, 0.08]}>
          <cylinderGeometry args={[0.035, 0.035, 0.22, 12]} />
          <meshStandardMaterial color="#FBBF24" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[0.15, 0.0, 0.08]}>
          <cylinderGeometry args={[0.035, 0.035, 0.22, 12]} />
          <meshStandardMaterial color="#FBBF24" metalness={0.9} roughness={0.15} />
        </mesh>

        <Billboard position={[0, 1.85, 0.4]}>
          <Text fontSize={0.18} color="#FEF08A" anchorX="center" anchorY="middle">
            🚪 [E] Masuk Rumah
          </Text>
        </Billboard>
      </group>

      {/* Welcome Doormat */}
      <group position={[0, 0.16, -5.3]}>
        <mesh receiveShadow>
          <boxGeometry args={[2.2, 0.02, 1.2]} />
          <meshStandardMaterial color="#E11D48" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.015, 0]}>
          <boxGeometry args={[2.0, 0.01, 1.0]} />
          <meshStandardMaterial color="#FFE4E6" roughness={0.9} />
        </mesh>
        <Text
          position={[0, 0.025, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.15}
          color="#9F1239"
          anchorX="center"
          anchorY="middle"
        >
          SELAMAT DATANG 🌸
        </Text>
      </group>

      {/* Front Windows */}
      {[-5.2, 5.2].map((wx, wi) => (
        <group key={wi} position={[wx, 2.1, -6.4]}>
          <mesh>
            <boxGeometry args={[2.0, 1.6, 0.1]} />
            <meshStandardMaterial color="#93C5FD" roughness={0.1} transparent opacity={0.75} />
          </mesh>
          <mesh>
            <boxGeometry args={[2.1, 0.1, 0.14]} />
            <meshStandardMaterial color="#7F4F24" />
          </mesh>
          <mesh>
            <boxGeometry args={[0.1, 1.7, 0.14]} />
            <meshStandardMaterial color="#7F4F24" />
          </mesh>
          <mesh position={[0, -0.95, 0.18]}>
            <boxGeometry args={[2.1, 0.32, 0.4]} />
            <meshStandardMaterial color="#9C6644" />
          </mesh>
          {[-0.8, -0.4, 0, 0.4, 0.8].map((fx, fi) => (
            <mesh key={fi} position={[fx, -0.72, 0.2]}>
              <sphereGeometry args={[0.13, 8, 8]} />
              <meshStandardMaterial color={fi % 2 === 0 ? '#FF006E' : '#FFBE0B'} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Exterior Side Walls & Roof */}
      <mesh position={[-8.5, 2.25, -12.0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 4.3, 11.2]} />
        <meshStandardMaterial color="#FFF1E6" roughness={0.7} />
      </mesh>
      <mesh position={[8.5, 2.25, -12.0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 4.3, 11.2]} />
        <meshStandardMaterial color="#FFF1E6" roughness={0.7} />
      </mesh>

      <mesh position={[-5.1, 2.25, -17.5]} castShadow receiveShadow>
        <boxGeometry args={[6.8, 4.3, 0.4]} />
        <meshStandardMaterial color="#FFF1E6" roughness={0.7} />
      </mesh>
      <mesh position={[5.1, 2.25, -17.5]} castShadow receiveShadow>
        <boxGeometry args={[6.8, 4.3, 0.4]} />
        <meshStandardMaterial color="#FFF1E6" roughness={0.7} />
      </mesh>
      <mesh position={[0, 3.55, -17.5]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 1.7, 0.4]} />
        <meshStandardMaterial color="#FFF1E6" roughness={0.7} />
      </mesh>

      {/* Grand Roof */}
      <mesh position={[0, 5.3, -12.0]} castShadow>
        <coneGeometry args={[12.5, 2.8, 4]} />
        <meshStandardMaterial color="#C85A32" roughness={0.55} />
      </mesh>

      {/* Back Veranda Decking */}
      <mesh position={[0, 0.15, -20.5]} receiveShadow>
        <boxGeometry args={[11.6, 0.28, 6.0]} />
        <meshStandardMaterial color="#DDB892" roughness={0.6} />
      </mesh>

      {/* Back Veranda Railings */}
      {[-5.6, 5.6].map((vx, vi) => (
        <group key={vi} position={[vx, 0.7, -20.5]}>
          <mesh castShadow>
            <boxGeometry args={[0.15, 0.85, 5.8]} />
            <meshStandardMaterial color="#7F4F24" />
          </mesh>
        </group>
      ))}

      {/* Closed Interactive Back Door */}
      <group
        position={[0, 1.35, -17.5]}
        onClick={(e) => {
          e.stopPropagation();
          gameStore.enterHouse('back');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[2.8, 2.7, 0.12]} />
          <meshStandardMaterial color="#7F4F24" roughness={0.6} />
        </mesh>
        {[-0.65, 0.65].map((gx, gi) => (
          <mesh key={gi} position={[gx, 0.15, 0.02]}>
            <boxGeometry args={[0.9, 2.1, 0.06]} />
            <meshStandardMaterial color="#93C5FD" transparent opacity={0.7} roughness={0.1} />
          </mesh>
        ))}
        <mesh position={[0, 1.55, -0.1]}>
          <boxGeometry args={[3.2, 0.45, 0.06]} />
          <meshStandardMaterial color="#0096C7" />
        </mesh>
        <Text
          position={[0, 1.55, -0.15]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.17}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
        >
          🏊‍♀️ PINTU MASUK KE RUMAH KHAULAH 🏡
        </Text>
        <Billboard position={[0, 1.9, -0.4]}>
          <Text fontSize={0.18} color="#FEF08A" anchorX="center" anchorY="middle">
            🚪 [E] Masuk Rumah
          </Text>
        </Billboard>
      </group>

      {/* Garden Pergola Archway Entry to Pool */}
      <group position={[0, 0, -23.5]}>
        <mesh position={[-2.4, 1.7, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.16, 3.4, 12]} />
          <meshStandardMaterial color="#6F4E37" />
        </mesh>
        <mesh position={[2.4, 1.7, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.16, 3.4, 12]} />
          <meshStandardMaterial color="#6F4E37" />
        </mesh>
        <mesh position={[0, 3.45, 0]} castShadow>
          <boxGeometry args={[5.2, 0.2, 0.4]} />
          <meshStandardMaterial color="#6F4E37" />
        </mesh>
        {[-1.8, -0.9, 0, 0.9, 1.8].map((bx, bi) => (
          <mesh key={bi} position={[bx, 3.6, 0]}>
            <boxGeometry args={[0.12, 0.14, 1.4]} />
            <meshStandardMaterial color="#6F4E37" />
          </mesh>
        ))}
        <mesh position={[-2.4, 2.4, 0]}>
          <sphereGeometry args={[0.42, 8, 8]} />
          <meshStandardMaterial color="#2D6A4F" roughness={0.6} />
        </mesh>
        <mesh position={[2.4, 2.2, 0]}>
          <sphereGeometry args={[0.38, 8, 8]} />
          <meshStandardMaterial color="#2D6A4F" roughness={0.6} />
        </mesh>
        {[-2.2, -1.2, 0, 1.2, 2.2].map((fx, fi) => (
          <mesh key={fi} position={[fx, 3.5, fi % 2 === 0 ? 0.25 : -0.25]}>
            <sphereGeometry args={[0.14, 6, 6]} />
            <meshStandardMaterial color={fi % 2 === 0 ? '#FF6B8B' : '#FFD166'} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// ============================================================================
// 2. RUMAH KHAULAH GRAND INTERIOR (DUNIA DALAM RUMAH MEGAH & LUAS)
// DIMENSI: Lebar 36m (X: 142 to 178), Panjang 25.6m (Z: -24.8 to 0.8), Tinggi 7.6m
// ============================================================================
const INTERACTIVE_FURNITURE = [
  {
    id: 'furniture_sofa',
    pos: [157.5, 0.4, -12.0] as [number, number, number],
    radius: 3.2,
    title: 'Sofa Beludru Keluarga',
    prompt: 'Tekan [E] untuk Duduk Santai di Sofa 🛋️💖',
  },
  {
    id: 'furniture_tv',
    pos: [160.0, 1.8, -16.5] as [number, number, number],
    radius: 3.5,
    title: 'Smart TV Kartun Keluarga',
    prompt: 'Tekan [E] untuk Nonton TV Bersama 📺✨',
  },
  {
    id: 'furniture_tea',
    pos: [160.8, 0.4, -12.0] as [number, number, number],
    radius: 2.8,
    title: 'Teh Madu & Camilan Meja',
    prompt: 'Tekan [E] untuk Minum Teh Madu Hangat 🍵🍯',
  },
  {
    id: 'furniture_laptop',
    pos: [148.0, 0.8, -5.2] as [number, number, number],
    radius: 3.0,
    title: 'Laptop Coding Studio Abi',
    prompt: 'Tekan [E] untuk Mengetik Kode di Laptop Abi 💻✨',
  },
  {
    id: 'furniture_books',
    pos: [143.5, 1.2, -6.0] as [number, number, number],
    radius: 3.0,
    title: 'Rak Buku Ensiklopedia & Cerita',
    prompt: 'Tekan [E] untuk Membaca Buku Cerita 📖🌟',
  },
  {
    id: 'furniture_pray',
    pos: [148.0, 0.3, -17.5] as [number, number, number],
    radius: 3.0,
    title: 'Sajadah Musholla Keluarga',
    prompt: 'Tekan [E] untuk Berdoa di Musholla 🤲🕌✨',
  },
  {
    id: 'furniture_tasbih',
    pos: [143.5, 0.8, -18.0] as [number, number, number],
    radius: 2.8,
    title: 'Tasbih Digital & Meja Dzikir',
    prompt: 'Tekan [E] untuk Berdzikir Memuji Allah 📿✨',
  },
  {
    id: 'furniture_barstool',
    pos: [172.0, 0.6, -4.7] as [number, number, number],
    radius: 3.0,
    title: 'Kursi Bar Marmer Dapur',
    prompt: 'Tekan [E] untuk Duduk di Kursi Bar Dapur 🪑🍰',
  },
  {
    id: 'furniture_cupcake',
    pos: [173.4, 1.1, -6.0] as [number, number, number],
    radius: 2.8,
    title: 'Cupcake Pelangi & Buah Ummi',
    prompt: 'Tekan [E] untuk Cicipi Cupcake Pelangi 🧁🍓',
  },
  {
    id: 'furniture_fridge',
    pos: [176.5, 1.2, -9.5] as [number, number, number],
    radius: 3.0,
    title: 'Kulkas Cerdas Penuh Minuman Segar',
    prompt: 'Tekan [E] untuk Buka Kulkas & Susu Dingin 🥛❄️',
  },
  {
    id: 'furniture_sink',
    pos: [176.5, 0.9, -3.0] as [number, number, number],
    radius: 2.8,
    title: 'Wastafel & Cuci Tangan Wangi',
    prompt: 'Tekan [E] untuk Cuci Tangan Bersih & Harum 🧼💧',
  },
  {
    id: 'furniture_bed',
    pos: [172.0, 0.6, -18.8] as [number, number, number],
    radius: 3.2,
    title: 'Kasur Bintang Awan Empuk',
    prompt: 'Tekan [E] untuk Istirahat di Kasur Awan 🛏️⭐💤',
  },
  {
    id: 'furniture_crib',
    pos: [173.5, 0.6, -22.5] as [number, number, number],
    radius: 3.0,
    title: 'Boks Bayi Adek Faqih',
    prompt: 'Tekan [E] untuk Putar Kotak Musik Bayi 👶🍼🎶',
  },
  {
    id: 'furniture_racecar',
    pos: [172.0, 0.4, -15.5] as [number, number, number],
    radius: 3.0,
    title: 'Sirkuit Balap Mini Adek Faqih',
    prompt: 'Tekan [E] untuk Main Mobil Balap Cepat 🏎️💨',
  },
  {
    id: 'furniture_drum',
    pos: [169.0, 0.5, -16.0] as [number, number, number],
    radius: 3.0,
    title: 'Drum Marching Band Adek Khalid',
    prompt: 'Tekan [E] untuk Main Drum Band Ceria 🥁🎶',
  },
  {
    id: 'furniture_blocks',
    pos: [168.0, 0.4, -22.0] as [number, number, number],
    radius: 3.0,
    title: 'Peti Mainan & Istana Balok Susun',
    prompt: 'Tekan [E] untuk Menyusun Istana Balok 🧱🏰✨',
  },
];

export const RumahKhaulahInterior: React.FC = () => {
  const isInsideHouse = useGameStore((s) => s.isInsideHouse);
  const lastNearExitRef = useRef<string | null>(null);
  const [tvChannel, setTvChannel] = useState(1); // 0: Off, 1: Kartun Lucu, 2: Petualangan Antariksa, 3: Shalawat & Nasyid Ceria

  const handleToggleTv = (e?: any) => {
    if (e) e.stopPropagation();
    const next = (tvChannel + 1) % 4;
    setTvChannel(next);
    soundManager.playStarCollect();
    if (next === 0) {
      gameStore.setMessage('Cklek! TV dimatikan untuk menghemat energi! 📺🔌');
    } else if (next === 1) {
      gameStore.setMessage('TV Channel 1: Kartun Kucing & Kelinci Lucu Berkejaran di Padang Rumput! 🐱🐰📺✨');
    } else if (next === 2) {
      gameStore.setMessage('TV Channel 2: Petualangan Astronot Cilik Menjelajah Bintang & Planet Warna-Warni! 🚀🌟🪐');
    } else {
      gameStore.setMessage('TV Channel 3: Shalawat & Nasyid Ceria Anak Shalihah! Hati jadi adem dan gembira! 🎶🌸✨');
    }
  };

  useEffect(() => {
    // ------------------------------------------------------------------------
    // WALKABLE GRAND INTERIOR FLOOR (GROUND TYPE: 36m x 25.6m)
    // ------------------------------------------------------------------------
    const interiorFloorBox = new THREE.Box3(
      new THREE.Vector3(141.5, -0.5, -25.2),
      new THREE.Vector3(178.5, 0.45, 1.2)
    );
    const cInterior: PlatformCollider = { box: interiorFloorBox, type: 'ground' };
    colliders.push(cInterior);

    // ------------------------------------------------------------------------
    // SOLID WALLS & LARGE FURNITURE ENCLOSING THE SPACIOUS VILLA (HEIGHT: 7.6m)
    // ------------------------------------------------------------------------
    const solids: SolidCollider[] = [
      // Outer Boundary Walls
      addSolidBox([141.5, 0, 0.6], [178.5, 8.0, 1.2], 'int_front_wall'),
      addSolidBox([141.5, 0, -25.2], [178.5, 8.0, -24.6], 'int_back_wall'),
      addSolidBox([141.2, 0, -25.2], [142.2, 8.0, 1.2], 'int_left_wall'),
      addSolidBox([177.8, 0, -25.2], [178.8, 8.0, 1.2], 'int_right_wall'),

      // Left Wing Partition Divider (Ruang Coding Abi vs Musholla at Z: -12.0)
      addSolidBox([142.0, 0, -12.3], [153.5, 6.0, -11.7], 'int_left_divider'),

      // Left Hallway Archway Columns
      addSolidBox([153.5, 0, -24.8], [154.2, 6.0, -18.5], 'int_left_hall_back'),
      addSolidBox([153.5, 0, -5.5], [154.2, 6.0, 0.8], 'int_left_hall_front'),

      // Right Wing Partition Divider (Dapur Ummi vs Kids Playroom at Z: -12.0)
      addSolidBox([166.5, 0, -12.3], [178.0, 6.0, -11.7], 'int_right_divider'),

      // Right Hallway Archway Columns
      addSolidBox([165.8, 0, -24.8], [166.5, 6.0, -18.5], 'int_right_hall_back'),
      addSolidBox([165.8, 0, -5.5], [166.5, 6.0, 0.8], 'int_right_hall_front'),

      // Living Room Coffee table
      addSolidBox([159.7, 0, -12.7], [161.9, 0.6, -11.3], 'int_coffee_table'),
      // TV Media Console Stand
      addSolidBox([158.4, 0, -17.0], [161.6, 1.0, -16.0], 'int_tv_stand'),
      // Abi's Desk
      addSolidBox([146.6, 0, -6.6], [149.4, 1.2, -5.4], 'int_desk'),
      // Abi's Bookshelves
      addSolidBox([142.1, 0, -9.6], [142.9, 4.0, -2.4], 'int_bookshelf'),
      // Musholla Quran Rehal
      addSolidBox([147.4, 0, -19.6], [148.6, 0.6, -18.4], 'int_rehal'),
      // Kitchen Island
      addSolidBox([169.3, 0, -6.8], [174.7, 1.2, -5.2], 'int_kitchen_island'),
      // Kitchen Refrigerator
      addSolidBox([175.5, 0, -10.5], [177.5, 2.5, -8.5], 'int_fridge'),
      // Kitchen Sink
      addSolidBox([175.5, 0, -4.0], [177.5, 1.2, -2.0], 'int_sink'),
      // Toy Chest
      addSolidBox([167.0, 0, -15.0], [169.0, 1.0, -13.0], 'int_toy_chest'),
    ];

    return () => {
      const idx = colliders.indexOf(cInterior);
      if (idx !== -1) colliders.splice(idx, 1);
      solids.forEach((s) => removeSolidCollider(s));
    };
  }, []);

  useFrame(() => {
    if (!isInsideHouse) return;
    const playerPos = gameStore.getState().playerPos;
    const activeRide = gameStore.getState().activeRide;

    // Front Exit Door zone (at [160, 0.2, 0.5])
    const distFrontExit = Math.hypot(playerPos[0] - 160, playerPos[2] - 0.0);
    // Back Exit Door zone (at [160, 0.2, -24.5])
    const distBackExit = Math.hypot(playerPos[0] - 160, playerPos[2] - (-24.0));

    if (distFrontExit < 3.0) {
      if (lastNearExitRef.current !== 'front') {
        lastNearExitRef.current = 'front';
        gameStore.setNearbyInteractable({
          id: 'interior_exit_front',
          title: 'Pintu Keluar Depan',
          prompt: 'Tekan [E] untuk Keluar ke Halaman Depan! 🌳🚪',
        });
      }
      return;
    } else if (distBackExit < 3.0) {
      if (lastNearExitRef.current !== 'back') {
        lastNearExitRef.current = 'back';
        gameStore.setNearbyInteractable({
          id: 'interior_exit_back',
          title: 'Pintu Keluar Belakang',
          prompt: 'Tekan [E] untuk Keluar ke Kolam Renang / Waterpark! 🏊‍♀️🌴',
        });
      }
      return;
    }

    // Don't search furniture interactables if already riding something
    if (activeRide !== 'none') {
      if (lastNearExitRef.current !== null) {
        lastNearExitRef.current = null;
        const cur = gameStore.getState().nearbyInteractable;
        if (cur?.id?.startsWith('furniture_') || cur?.id?.startsWith('interior_exit_')) {
          gameStore.setNearbyInteractable(null);
        }
      }
      return;
    }

    const curInteractable = gameStore.getState().nearbyInteractable;
    const isFamilyNear =
      curInteractable?.id === 'abi' ||
      curInteractable?.id === 'ummi' ||
      curInteractable?.id === 'khalid' ||
      curInteractable?.id === 'faqih';
    if (isFamilyNear) {
      lastNearExitRef.current = null;
      return;
    }

    // Check closest interactive furniture
    let closestFurniture: (typeof INTERACTIVE_FURNITURE)[0] | null = null;
    let closestDistSq = Infinity;

    for (const f of INTERACTIVE_FURNITURE) {
      const d = Math.hypot(playerPos[0] - f.pos[0], playerPos[2] - f.pos[2]);
      if (d < f.radius && d < closestDistSq) {
        closestDistSq = d;
        closestFurniture = f;
      }
    }

    if (closestFurniture) {
      if (lastNearExitRef.current !== closestFurniture.id) {
        lastNearExitRef.current = closestFurniture.id;
        gameStore.setNearbyInteractable({
          id: closestFurniture.id,
          title: closestFurniture.title,
          prompt: closestFurniture.prompt,
        });
      }
    } else {
      if (lastNearExitRef.current !== null) {
        lastNearExitRef.current = null;
        const cur = gameStore.getState().nearbyInteractable;
        if (cur?.id?.startsWith('furniture_') || cur?.id?.startsWith('interior_exit_')) {
          gameStore.setNearbyInteractable(null);
        }
      }
    }
  });

  return (
    <group position={[160, 0, -12]} visible={isInsideHouse}>
      {/* ============================================================== */}
      {/* 1. GRAND PARQUET FLOORING & ZONE CARPETS                       */}
      {/* ============================================================== */}
      {/* Grand Natural Oak Parquet Floor (36m wide x 25.6m deep) */}
      <mesh position={[0, 0.16, 0]} receiveShadow>
        <boxGeometry args={[36.0, 0.3, 25.6]} />
        <meshStandardMaterial color="#DDB892" roughness={0.45} />
      </mesh>

      {/* Central Living Room Plush Moroccan Pastel Rug (10m x 8m) */}
      <mesh position={[0, 0.17, 0]} receiveShadow>
        <boxGeometry args={[10.0, 0.02, 8.0]} />
        <meshStandardMaterial color="#FDE2E4" roughness={0.8} />
      </mesh>

      {/* Musholla Sanctuary Emerald Green Turkish Carpet (Wing Kiri Belakang) */}
      <mesh position={[-12.0, 0.17, -6.0]} receiveShadow>
        <boxGeometry args={[11.5, 0.02, 11.5]} />
        <meshStandardMaterial color="#1B4D3E" roughness={0.8} />
      </mesh>

      {/* Kids Wonderland Foam Puzzle Playmat (Wing Kanan Belakang) */}
      <mesh position={[12.0, 0.17, -6.0]} receiveShadow>
        <boxGeometry args={[11.5, 0.02, 11.5]} />
        <meshStandardMaterial color="#80ED99" roughness={0.8} />
      </mesh>

      {/* Gourmet Kitchen Polished Marble Tile (Wing Kanan Depan) */}
      <mesh position={[12.0, 0.17, 6.0]} receiveShadow>
        <boxGeometry args={[11.5, 0.02, 11.5]} />
        <meshStandardMaterial color="#F1F5F9" roughness={0.25} metalness={0.1} />
      </mesh>

      {/* Abi Coding Studio Rich Timber Floor (Wing Kiri Depan) */}
      <mesh position={[-12.0, 0.17, 6.0]} receiveShadow>
        <boxGeometry args={[11.5, 0.02, 11.5]} />
        <meshStandardMaterial color="#B08968" roughness={0.5} />
      </mesh>

      {/* ============================================================== */}
      {/* 2. GRAND ENCLOSING WALLS & HIGH CATHEDRAL CEILING (7.6m TALL)   */}
      {/* ============================================================== */}
      {/* Front Enclosing Wall (Z: +12.8) */}
      <mesh position={[-9.5, 3.8, 12.8]} receiveShadow>
        <boxGeometry args={[17.0, 7.6, 0.35]} />
        <meshStandardMaterial color="#FFF5EB" roughness={0.7} />
      </mesh>
      <mesh position={[9.5, 3.8, 12.8]} receiveShadow>
        <boxGeometry args={[17.0, 7.6, 0.35]} />
        <meshStandardMaterial color="#FFF5EB" roughness={0.7} />
      </mesh>
      <mesh position={[0, 5.8, 12.8]} receiveShadow>
        <boxGeometry args={[4.0, 3.6, 0.35]} />
        <meshStandardMaterial color="#FFF5EB" roughness={0.7} />
      </mesh>

      {/* Back Enclosing Wall (Z: -12.8) */}
      <mesh position={[-9.5, 3.8, -12.8]} receiveShadow>
        <boxGeometry args={[17.0, 7.6, 0.35]} />
        <meshStandardMaterial color="#FFF5EB" roughness={0.7} />
      </mesh>
      <mesh position={[9.5, 3.8, -12.8]} receiveShadow>
        <boxGeometry args={[17.0, 7.6, 0.35]} />
        <meshStandardMaterial color="#FFF5EB" roughness={0.7} />
      </mesh>
      <mesh position={[0, 5.8, -12.8]} receiveShadow>
        <boxGeometry args={[4.0, 3.6, 0.35]} />
        <meshStandardMaterial color="#FFF5EB" roughness={0.7} />
      </mesh>

      {/* Left Wall (X: -18.0) */}
      <mesh position={[-18.0, 3.8, 0]} receiveShadow>
        <boxGeometry args={[0.35, 7.6, 25.6]} />
        <meshStandardMaterial color="#FFF5EB" roughness={0.7} />
      </mesh>

      {/* Right Wall (X: +18.0) */}
      <mesh position={[18.0, 3.8, 0]} receiveShadow>
        <boxGeometry args={[0.35, 7.6, 25.6]} />
        <meshStandardMaterial color="#FFF5EB" roughness={0.7} />
      </mesh>

      {/* Grand High Ceiling (Y: 7.6m) with DoubleSide to ensure pure warmth */}
      <mesh position={[0, 7.6, 0]} receiveShadow>
        <boxGeometry args={[36.4, 0.25, 26.0]} />
        <meshStandardMaterial color="#FAF5EF" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Decorative Crown Molding Beams across the Ceiling */}
      {[-12, -6, 0, 6, 12].map((bx, bi) => (
        <mesh key={`beam-${bi}`} position={[bx, 7.45, 0]}>
          <boxGeometry args={[0.4, 0.3, 25.8]} />
          <meshStandardMaterial color="#E9D8A6" roughness={0.6} />
        </mesh>
      ))}

      {/* ============================================================== */}
      {/* 3. GRAND ARCHWAYS & ROOM PARTITION WALLS                       */}
      {/* ============================================================== */}
      {/* Left Wing Dividing Wall (Ruang Coding Abi vs Musholla at Z: 0) */}
      <mesh position={[-12.0, 3.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[11.5, 7.6, 0.3]} />
        <meshStandardMaterial color="#FFE8D6" roughness={0.7} />
      </mesh>

      {/* Right Wing Dividing Wall (Dapur Ummi vs Kids Wonderland at Z: 0) */}
      <mesh position={[12.0, 3.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[11.5, 7.6, 0.3]} />
        <meshStandardMaterial color="#FFE8D6" roughness={0.7} />
      </mesh>

      {/* Left Grand Hallway Archway Columns & Header (X: -6.0) */}
      <mesh position={[-6.0, 3.8, 9.5]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 7.6, 6.2]} />
        <meshStandardMaterial color="#FFE8D6" roughness={0.7} />
      </mesh>
      <mesh position={[-6.0, 3.8, -9.5]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 7.6, 6.2]} />
        <meshStandardMaterial color="#FFE8D6" roughness={0.7} />
      </mesh>
      <mesh position={[-6.0, 6.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 2.6, 12.8]} />
        <meshStandardMaterial color="#FFE8D6" roughness={0.7} />
      </mesh>

      {/* Right Grand Hallway Archway Columns & Header (X: +6.0) */}
      <mesh position={[6.0, 3.8, 9.5]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 7.6, 6.2]} />
        <meshStandardMaterial color="#FFE8D6" roughness={0.7} />
      </mesh>
      <mesh position={[6.0, 3.8, -9.5]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 7.6, 6.2]} />
        <meshStandardMaterial color="#FFE8D6" roughness={0.7} />
      </mesh>
      <mesh position={[6.0, 6.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 2.6, 12.8]} />
        <meshStandardMaterial color="#FFE8D6" roughness={0.7} />
      </mesh>

      {/* ============================================================== */}
      {/* 4. INTERIOR EXIT DOORS                                         */}
      {/* ============================================================== */}
      {/* --- FRONT EXIT DOOR (KELUAR KE HALAMAN DEPAN) --- */}
      <group
        position={[0, 2.0, 12.65]}
        onClick={(e) => {
          e.stopPropagation();
          gameStore.exitHouse('front');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[3.2, 3.8, 0.12]} />
          <meshStandardMaterial color="#854D0E" roughness={0.4} />
        </mesh>
        {/* Golden Door Handles */}
        <mesh position={[-0.2, 0, -0.08]}>
          <cylinderGeometry args={[0.04, 0.04, 0.35, 12]} />
          <meshStandardMaterial color="#FBBF24" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[0.2, 0, -0.08]}>
          <cylinderGeometry args={[0.04, 0.04, 0.35, 12]} />
          <meshStandardMaterial color="#FBBF24" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Plaque above exit door */}
        <mesh position={[0, 2.2, -0.1]}>
          <boxGeometry args={[3.6, 0.55, 0.06]} />
          <meshStandardMaterial color="#1E3A8A" />
        </mesh>
        <Text position={[0, 2.2, -0.15]} fontSize={0.2} color="#FFFFFF" anchorX="center" anchorY="middle">
          🌳 KELUAR KE HALAMAN DEPAN 🚪
        </Text>
        <Billboard position={[0, 2.8, -0.4]}>
          <Text fontSize={0.22} color="#FEF08A" anchorX="center" anchorY="middle">
            🚪 [E] Keluar ke Halaman
          </Text>
        </Billboard>
      </group>

      {/* Front Entrance Welcome Mat inside */}
      <mesh position={[0, 0.165, 11.2]}>
        <boxGeometry args={[3.0, 0.015, 1.4]} />
        <meshStandardMaterial color="#FED7AA" roughness={0.8} />
      </mesh>

      {/* --- BACK EXIT DOOR (KELUAR KE WATERPARK & KOLAM RENANG) --- */}
      <group
        position={[0, 2.0, -12.65]}
        onClick={(e) => {
          e.stopPropagation();
          gameStore.exitHouse('back');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[3.2, 3.8, 0.12]} />
          <meshStandardMaterial color="#7F4F24" roughness={0.5} />
        </mesh>
        {[-0.8, 0.8].map((gx, gi) => (
          <mesh key={gi} position={[gx, 0.2, 0.02]}>
            <boxGeometry args={[1.2, 3.0, 0.05]} />
            <meshStandardMaterial color="#67E8F9" transparent opacity={0.75} roughness={0.1} />
          </mesh>
        ))}
        <mesh position={[0, 2.2, 0.1]}>
          <boxGeometry args={[3.8, 0.55, 0.06]} />
          <meshStandardMaterial color="#0284C7" />
        </mesh>
        <Text position={[0, 2.2, 0.15]} fontSize={0.2} color="#FFFFFF" anchorX="center" anchorY="middle">
          🏊‍♀️ KELUAR KE KOLAM RENANG & WATERPARK 🌴
        </Text>
        <Billboard position={[0, 2.8, 0.4]}>
          <Text fontSize={0.22} color="#FEF08A" anchorX="center" anchorY="middle">
            🏊‍♀️ [E] Menuju Kolam Renang
          </Text>
        </Billboard>
      </group>

      {/* ============================================================== */}
      {/* 5. LUXURY FURNISHINGS & ROOM EQUIPMENT                         */}
      {/* ============================================================== */}
      {/* --- 5.1 GRAND CENTRAL LIVING ROOM & FOYER --- */}
      <group position={[0, 0.2, 0]}>
        {/* Large Velvet L-Shaped Sectional Sofa (INTERACTIVE: Duduk Santai) */}
        <group
          position={[-2.5, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            gameStore.setActiveRide('sofa');
            gameStore.setMessage('Khaulah duduk santai di sofa beludru empuk! Nyaman sekali~ 🛋️💖');
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          {/* Main Seat Cushion */}
          <mesh position={[0, 0.35, 0]} castShadow>
            <boxGeometry args={[3.8, 0.55, 1.6]} />
            <meshStandardMaterial color="#E9D8A6" roughness={0.8} />
          </mesh>
          {/* Back Cushion */}
          <mesh position={[0, 0.9, -0.65]} castShadow>
            <boxGeometry args={[3.8, 0.75, 0.35]} />
            <meshStandardMaterial color="#DDA15E" roughness={0.8} />
          </mesh>
          {/* Side Chaise */}
          <mesh position={[-1.4, 0.35, 1.2]} castShadow>
            <boxGeometry args={[1.0, 0.55, 1.4]} />
            <meshStandardMaterial color="#E9D8A6" roughness={0.8} />
          </mesh>
          {/* Side Armrests */}
          <mesh position={[1.8, 0.65, 0]} castShadow>
            <boxGeometry args={[0.3, 0.5, 1.6]} />
            <meshStandardMaterial color="#DDA15E" roughness={0.8} />
          </mesh>
          <mesh position={[-1.8, 0.65, 0.6]} castShadow>
            <boxGeometry args={[0.3, 0.5, 2.6]} />
            <meshStandardMaterial color="#DDA15E" roughness={0.8} />
          </mesh>
          {/* Throw Pillows */}
          {[-1.2, 0, 1.2].map((px, pi) => (
            <mesh key={pi} position={[px, 0.7, -0.3]} rotation={[0.2, 0.2, 0]}>
              <boxGeometry args={[0.5, 0.5, 0.2]} />
              <meshStandardMaterial color={['#FFB5A7', '#F4ACB7', '#9A8C98'][pi]} />
            </mesh>
          ))}
          {/* Interactive Billboard Prompt */}
          <Billboard position={[0, 1.8, 0]}>
            <Text fontSize={0.2} color="#FEF08A" anchorX="center" anchorY="middle">
              🛋️ [E] Duduk di Sofa
            </Text>
          </Billboard>
        </group>

        {/* Large Marble Coffee Table & Honey Tea (INTERACTIVE: Minum Teh Madu) */}
        <group position={[0.8, 0, 0]}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[2.2, 0.12, 1.4]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.1} />
          </mesh>
          {[-0.9, 0.9].map((tx, ti) =>
            [-0.5, 0.5].map((tz, zi) => (
              <mesh key={`${ti}-${zi}`} position={[tx, 0.14, tz]}>
                <cylinderGeometry args={[0.04, 0.04, 0.28, 8]} />
                <meshStandardMaterial color="#7F4F24" />
              </mesh>
            ))
          )}
          {/* Crystal Flower Vase & Roses */}
          <mesh position={[-0.6, 0.48, 0]}>
            <cylinderGeometry args={[0.12, 0.09, 0.25, 12]} />
            <meshStandardMaterial color="#E0F2FE" transparent opacity={0.8} roughness={0.1} />
          </mesh>
          <mesh position={[-0.6, 0.65, 0]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#FF006E" />
          </mesh>

          {/* Interactive Tea Tray with Honey Tea & Cookies */}
          <group
            position={[0.3, 0.37, 0]}
            onClick={(e) => {
              e.stopPropagation();
              soundManager.playSnackBuff();
              gameStore.addSpeedBuff(25);
              gameStore.setMessage('Sluuurp~ Khaulah menikmati teh madu hangat! Manis dan menyehatkan! (+Speed Boost ⚡🍵)');
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto';
            }}
          >
            {/* Wooden Tea Tray */}
            <mesh castShadow>
              <boxGeometry args={[1.0, 0.04, 0.7]} />
              <meshStandardMaterial color="#8B5A2B" roughness={0.5} />
            </mesh>
            {/* Ceramic Teapot */}
            <mesh position={[-0.25, 0.14, 0]} castShadow>
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshStandardMaterial color="#FFF1E6" roughness={0.3} />
            </mesh>
            <mesh position={[-0.25, 0.24, 0]}>
              <cylinderGeometry args={[0.04, 0.05, 0.06, 10]} />
              <meshStandardMaterial color="#FBBF24" />
            </mesh>
            {/* Teacups with Honey Tea */}
            {[0.12, 0.32].map((cx, ci) => (
              <group key={ci} position={[cx, 0.06, 0]}>
                <mesh castShadow>
                  <cylinderGeometry args={[0.06, 0.045, 0.09, 12]} />
                  <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
                </mesh>
                <mesh position={[0, 0.035, 0]}>
                  <cylinderGeometry args={[0.052, 0.052, 0.015, 12]} />
                  <meshStandardMaterial color="#D97706" roughness={0.2} />
                </mesh>
              </group>
            ))}
            {/* Plate of Star Cookies */}
            <mesh position={[0.05, 0.04, 0.2]}>
              <cylinderGeometry args={[0.12, 0.1, 0.02, 12]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
            <mesh position={[0.05, 0.06, 0.2]}>
              <cylinderGeometry args={[0.08, 0.08, 0.02, 5]} />
              <meshStandardMaterial color="#F59E0B" roughness={0.7} />
            </mesh>
            {/* Gentle Warm Steam Sparkles */}
            <Sparkles count={4} position={[0.22, 0.35, 0]} scale={0.4} size={1.2} speed={0.4} color="#FDE68A" />
            <Billboard position={[0, 0.8, 0]}>
              <Text fontSize={0.18} color="#FEF08A" anchorX="center" anchorY="middle">
                🍵 [E] Minum Teh Madu
              </Text>
            </Billboard>
          </group>
        </group>

        {/* Smart TV Media Credenza & 75" Screen (INTERACTIVE: Ganti Channel TV) */}
        <group position={[0, 0, -4.5]}>
          {/* Wooden TV Media Console Cabinet */}
          <group position={[0, 0.4, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[3.2, 0.7, 0.8]} />
              <meshStandardMaterial color="#7F4F24" roughness={0.5} />
            </mesh>
            {/* Cabinet Doors with Gold Trim */}
            {[-1.0, 0, 1.0].map((dx, di) => (
              <mesh key={di} position={[dx, 0, 0.41]}>
                <boxGeometry args={[0.9, 0.55, 0.03]} />
                <meshStandardMaterial color="#9C6644" roughness={0.6} />
              </mesh>
            ))}
            {/* Modern Slim Soundbar on Console */}
            <mesh position={[0, 0.38, 0.15]}>
              <boxGeometry args={[2.0, 0.08, 0.12]} />
              <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>

          {/* 75-Inch Curved Smart TV */}
          <group
            position={[0, 1.8, 0]}
            onClick={handleToggleTv}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto';
            }}
          >
            {/* TV Outer Frame & Wall Mount */}
            <mesh castShadow>
              <boxGeometry args={[3.2, 1.8, 0.1]} />
              <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* TV Bezel Gold Trim */}
            <mesh position={[0, -0.88, 0.05]}>
              <boxGeometry args={[3.15, 0.03, 0.02]} />
              <meshStandardMaterial color="#F59E0B" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Smart Screen Canvas */}
            <mesh position={[0, 0, 0.06]}>
              <boxGeometry args={[3.05, 1.65, 0.01]} />
              <meshStandardMaterial
                color={
                  tvChannel === 0
                    ? '#0F172A'
                    : tvChannel === 1
                    ? '#38BDF8'
                    : tvChannel === 2
                    ? '#7C3AED'
                    : '#F472B6'
                }
                emissive={
                  tvChannel === 0
                    ? '#000000'
                    : tvChannel === 1
                    ? '#0284C7'
                    : tvChannel === 2
                    ? '#5B21B6'
                    : '#DB2777'
                }
                emissiveIntensity={tvChannel === 0 ? 0.0 : 0.65}
                roughness={0.15}
              />
            </mesh>

            {/* Screen Graphics Based on Active Channel */}
            {tvChannel === 1 && (
              <group position={[0, 0, 0.08]}>
                <Text position={[0, 0.45, 0]} fontSize={0.2} color="#FFFFFF" anchorX="center" anchorY="middle">
                  🐱 KARTUN KUCING & KELINCI 🐰
                </Text>
                <mesh position={[-0.5, -0.15, 0]}>
                  <sphereGeometry args={[0.22, 10, 10]} />
                  <meshStandardMaterial color="#FEF08A" emissive="#FEF08A" emissiveIntensity={0.5} />
                </mesh>
                <mesh position={[0.5, -0.15, 0]}>
                  <sphereGeometry args={[0.22, 10, 10]} />
                  <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.5} />
                </mesh>
                <Sparkles count={8} scale={2.2} size={1.8} speed={0.5} color="#BAE6FD" />
              </group>
            )}

            {tvChannel === 2 && (
              <group position={[0, 0, 0.08]}>
                <Text position={[0, 0.45, 0]} fontSize={0.2} color="#FEF08A" anchorX="center" anchorY="middle">
                  🚀 PETUALANGAN ASTRONOT BINTANG 🌟
                </Text>
                <mesh position={[0, -0.15, 0]} rotation={[0, 0, 0.4]}>
                  <coneGeometry args={[0.22, 0.55, 8]} />
                  <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={0.6} />
                </mesh>
                <Sparkles count={12} scale={2.4} size={2.0} speed={0.8} color="#FEF08A" />
              </group>
            )}

            {tvChannel === 3 && (
              <group position={[0, 0, 0.08]}>
                <Text position={[0, 0.45, 0]} fontSize={0.2} color="#FFFFFF" anchorX="center" anchorY="middle">
                  🎶 SHALAWAT & NASYID CERIA 🌸
                </Text>
                <Text position={[0, -0.15, 0]} fontSize={0.35} color="#FEF08A" anchorX="center" anchorY="middle">
                  🎵 ✨ 💖 ✨ 🎶
                </Text>
                <Sparkles count={10} scale={2.4} size={1.8} speed={0.6} color="#FBCFE8" />
              </group>
            )}

            {tvChannel === 0 && (
              <group position={[0, 0, 0.08]}>
                <Text position={[0, 0, 0]} fontSize={0.18} color="#64748B" anchorX="center" anchorY="middle">
                  [ TV STANDBY - KLIK UNTUK NYALAKAN ]
                </Text>
              </group>
            )}

            {/* TV Screen Interactive Billboard Prompt */}
            <Billboard position={[0, 1.25, 0]}>
              <Text fontSize={0.2} color="#FEF08A" anchorX="center" anchorY="middle">
                📺 [E] Ganti Saluran TV
              </Text>
            </Billboard>
          </group>
        </group>

        {/* Grand Hanging Crystal Chandelier */}
        <group position={[0, 5.8, 0]}>
          <mesh>
            <cylinderGeometry args={[0.6, 1.4, 0.6, 16]} />
            <meshStandardMaterial color="#FBBF24" metalness={0.8} roughness={0.2} />
          </mesh>
          <pointLight color="#FFFBEB" intensity={1.5} distance={24} />
        </group>
      </group>

      {/* --- 5.2 EXECUTIVE CODING STUDIO ABI (WING KIRI DEPAN: X: -12, Z: 6) --- */}
      <group position={[-12.0, 0.2, 6.0]}>
        {/* Full-Wall Library Bookshelves (INTERACTIVE: Baca Buku Cerita) */}
        <group
          position={[-4.5, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          onClick={(e) => {
            e.stopPropagation();
            soundManager.playCheckpoint();
            gameStore.setMessage('Khaulah membaca buku ensiklopedia bergambar tentang bintang dan hewan ajaib! 📖🌟');
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          <mesh position={[0, 3.2, 0]} castShadow>
            <boxGeometry args={[7.2, 6.0, 0.4]} />
            <meshStandardMaterial color="#582F0E" roughness={0.6} />
          </mesh>
          {/* Books on Shelves */}
          {[-2.4, -1.2, 0, 1.2, 2.4].map((sy, si) =>
            [-2.8, -2.0, -1.2, -0.4, 0.4, 1.2, 2.0, 2.8].map((sx, xi) => (
              <mesh key={`b-${si}-${xi}`} position={[sx, 1.2 + si * 1.0, 0.05]}>
                <boxGeometry args={[0.18, 0.65, 0.35]} />
                <meshStandardMaterial
                  color={
                    ['#2B2D42', '#3D5A80', '#E07A5F', '#81B29A', '#F2CC8F', '#4A4E69'][(si + xi) % 6]
                  }
                />
              </mesh>
            ))
          )}
          {/* Open Picture Book Stand */}
          <group position={[0, 1.3, 0.35]}>
            <mesh castShadow>
              <boxGeometry args={[0.7, 0.1, 0.5]} />
              <meshStandardMaterial color="#D4A373" />
            </mesh>
            <mesh position={[0, 0.12, 0]} rotation={[-0.3, 0, 0]}>
              <boxGeometry args={[0.62, 0.06, 0.42]} />
              <meshStandardMaterial color="#FEF08A" emissive="#FEF08A" emissiveIntensity={0.3} />
            </mesh>
            <Billboard position={[0, 0.8, 0]}>
              <Text fontSize={0.2} color="#FEF08A" anchorX="center" anchorY="middle">
                📖 [E] Baca Buku Cerita
              </Text>
            </Billboard>
          </group>
        </group>

        {/* Executive Programmer Desk & Chair & Laptop (INTERACTIVE: Ketik Kode di Laptop) */}
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.6, 0.1, 1.2]} />
            <meshStandardMaterial color="#7F4F24" roughness={0.4} />
          </mesh>
          {/* Desk Legs */}
          {[-1.15, 1.15].map((dx, di) =>
            [-0.45, 0.45].map((dz, zi) => (
              <mesh key={`dleg-${di}-${zi}`} position={[dx, 0.4, dz]} castShadow>
                <cylinderGeometry args={[0.04, 0.04, 0.78, 8]} />
                <meshStandardMaterial color="#1E293B" />
              </mesh>
            ))
          )}
          {/* Dual Wide Curved Monitors */}
          <group position={[0, 0.86, -0.2]}>
            <mesh position={[-0.65, 0.35, 0]} rotation={[0, 0.15, 0]}>
              <boxGeometry args={[1.0, 0.55, 0.05]} />
              <meshStandardMaterial color="#0F172A" />
            </mesh>
            <mesh position={[0.65, 0.35, 0]} rotation={[0, -0.15, 0]}>
              <boxGeometry args={[1.0, 0.55, 0.05]} />
              <meshStandardMaterial color="#0F172A" />
            </mesh>
            {/* Glowing Screen Code Displays */}
            <mesh position={[-0.65, 0.35, 0.03]} rotation={[0, 0.15, 0]}>
              <boxGeometry args={[0.94, 0.49, 0.01]} />
              <meshStandardMaterial color="#38BDF8" emissive="#0284C7" emissiveIntensity={0.6} />
            </mesh>
            <mesh position={[0.65, 0.35, 0.03]} rotation={[0, -0.15, 0]}>
              <boxGeometry args={[0.94, 0.49, 0.01]} />
              <meshStandardMaterial color="#A7F3D0" emissive="#059669" emissiveIntensity={0.5} />
            </mesh>
          </group>

          {/* Abi's Ergonomic Executive Mesh Chair */}
          <group position={[0, 0, 0.8]}>
            {/* Seat Cushion */}
            <mesh position={[0, 0.48, 0]} castShadow>
              <boxGeometry args={[0.65, 0.1, 0.6]} />
              <meshStandardMaterial color="#1E293B" roughness={0.7} />
            </mesh>
            {/* High Ergonomic Backrest */}
            <mesh position={[0, 0.95, -0.26]} rotation={[-0.1, 0, 0]} castShadow>
              <boxGeometry args={[0.6, 0.85, 0.08]} />
              <meshStandardMaterial color="#334155" roughness={0.6} />
            </mesh>
            {/* Armrests */}
            {[-0.32, 0.32].map((ax, ai) => (
              <mesh key={ai} position={[ax, 0.72, -0.05]} castShadow>
                <boxGeometry args={[0.08, 0.05, 0.4]} />
                <meshStandardMaterial color="#0F172A" />
              </mesh>
            ))}
            {/* Center Swivel Stem & 5-Star Wheel Base */}
            <mesh position={[0, 0.24, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.45, 10]} />
              <meshStandardMaterial color="#94A3B8" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.06, 0]}>
              <cylinderGeometry args={[0.32, 0.35, 0.08, 8]} />
              <meshStandardMaterial color="#0F172A" />
            </mesh>
          </group>

          {/* Interactive Laptop & Mechanical Keyboard on Desk */}
          <group
            position={[0, 0.85, 0.2]}
            onClick={(e) => {
              e.stopPropagation();
              gameStore.setActiveRide('chair_abi');
              soundManager.playKeyboardTyping();
              gameStore.setMessage('Tuk-tak-tuk-tak! Khaulah mengetik kode game di laptop Abi: print("Aku sayang Abi!") 💻❤️');
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto';
            }}
          >
            {/* Laptop Base */}
            <mesh castShadow>
              <boxGeometry args={[0.55, 0.02, 0.38]} />
              <meshStandardMaterial color="#94A3B8" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Open Display Lid */}
            <group position={[0, 0.01, -0.18]} rotation={[0.4, 0, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.55, 0.38, 0.015]} />
                <meshStandardMaterial color="#64748B" metalness={0.7} />
              </mesh>
              {/* Glowing Code Screen */}
              <mesh position={[0, 0.02, 0.01]}>
                <boxGeometry args={[0.51, 0.33, 0.005]} />
                <meshStandardMaterial color="#38BDF8" emissive="#0284C7" emissiveIntensity={0.8} />
              </mesh>
            </group>
            {/* RGB Mechanical Keyboard & Mouse */}
            <mesh position={[0, 0.015, 0.04]}>
              <boxGeometry args={[0.45, 0.01, 0.16]} />
              <meshStandardMaterial color="#0F172A" emissive="#EC4899" emissiveIntensity={0.4} />
            </mesh>
            <mesh position={[0.35, 0.015, 0.04]}>
              <boxGeometry args={[0.07, 0.02, 0.11]} />
              <meshStandardMaterial color="#0F172A" emissive="#38BDF8" emissiveIntensity={0.5} />
            </mesh>
            {/* Interactive Billboard */}
            <Billboard position={[0, 0.9, 0]}>
              <Text fontSize={0.2} color="#FEF08A" anchorX="center" anchorY="middle">
                💻 [E] Ketik Kode di Laptop
              </Text>
            </Billboard>
          </group>
        </group>

        {/* Motivational Frame: CODING WITH LOVE FOR KELUARGA */}
        <mesh position={[0, 4.2, 5.8]}>
          <boxGeometry args={[3.2, 1.2, 0.06]} />
          <meshStandardMaterial color="#582F0E" />
        </mesh>
        <Text
          position={[0, 4.2, 5.75]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.22}
          color="#FEF08A"
          anchorX="center"
          anchorY="middle"
        >
          💻 CODING WITH LOVE FOR KELUARGA ❤️
        </Text>
        <pointLight position={[0, 4.5, 0]} color="#FEF08A" intensity={1.2} distance={14} />
      </group>

      {/* --- 5.3 FAMILY PRAYER SANCTUARY / MUSHOLLA (WING KIRI BELAKANG: X: -12, Z: -6) --- */}
      <group position={[-12.0, 0.2, -6.0]}>
        {/* Soft Sajadah Musholla Keluarga (INTERACTIVE: Sholat & Berdoa Khusyuk) */}
        <group
          position={[0, 0.02, 0.5]}
          onClick={(e) => {
            e.stopPropagation();
            gameStore.setActiveRide('pray');
            gameStore.setMessage('Alhamdulillah, Khaulah berdoa dengan khusyuk di musholla: "Semoga keluarga bahagia selalu!" 🤲🕌✨');
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          {/* Main Turkish Prayer Rug Mat */}
          <mesh receiveShadow>
            <boxGeometry args={[1.5, 0.03, 2.4]} />
            <meshStandardMaterial color="#1B4D3E" roughness={0.85} />
          </mesh>
          {/* Golden Arched Mihrab Motif Border */}
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[1.3, 0.005, 2.15]} />
            <meshStandardMaterial color="#FBBF24" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.025, 0]}>
            <boxGeometry args={[1.15, 0.005, 1.95]} />
            <meshStandardMaterial color="#064E3B" roughness={0.9} />
          </mesh>
          {/* Soft Fringe Tassels */}
          {[-1.15, 1.15].map((fz, fi) => (
            <mesh key={fi} position={[0, 0.015, fz]}>
              <boxGeometry args={[1.4, 0.01, 0.08]} />
              <meshStandardMaterial color="#FEF08A" />
            </mesh>
          ))}
          {/* Celestial Golden Light Particle Glow */}
          <Sparkles count={8} position={[0, 0.5, 0]} scale={1.8} size={1.6} speed={0.3} color="#FEF08A" />
          <Billboard position={[0, 1.1, 0]}>
            <Text fontSize={0.2} color="#FEF08A" anchorX="center" anchorY="middle">
              🤲 [E] Sholat & Berdoa Khusyuk
            </Text>
          </Billboard>
        </group>

        {/* Large Wooden Quran Stand (Rehal) & Mushaf */}
        <group position={[0, 0.2, -1.2]}>
          <mesh castShadow>
            <boxGeometry args={[1.0, 0.35, 0.8]} />
            <meshStandardMaterial color="#7F4F24" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.26, 0]} rotation={[-0.2, 0, 0]}>
            <boxGeometry args={[0.85, 0.1, 0.65]} />
            <meshStandardMaterial color="#FFFBEB" />
          </mesh>
          {/* Golden Quran Cover */}
          <mesh position={[0, 0.32, 0]} rotation={[-0.2, 0, 0]}>
            <boxGeometry args={[0.8, 0.03, 0.6]} />
            <meshStandardMaterial color="#D97706" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>

        {/* Tasbih Digital & Meja Dzikir (INTERACTIVE: Dzikir Tasbih) */}
        <group
          position={[-4.5, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            soundManager.playFamilyChord();
            gameStore.setMessage('Subhanallah, Walhamdulillah, Wala ilaha illallah, Wallahu Akbar! Hati jadi tenang! 📿✨');
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          {/* Carved Wood Side Table */}
          <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.45, 0.4, 0.8, 16]} />
            <meshStandardMaterial color="#582F0E" roughness={0.5} />
          </mesh>
          {/* Crystal Tasbih Beads Loop */}
          <mesh position={[0, 0.83, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.2, 0.035, 8, 24]} />
            <meshStandardMaterial color="#FBBF24" metalness={0.7} roughness={0.2} emissive="#FBBF24" emissiveIntensity={0.3} />
          </mesh>
          {/* Digital Tasbih Counter Box */}
          <mesh position={[0.22, 0.83, 0]}>
            <boxGeometry args={[0.12, 0.08, 0.14]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>
          <mesh position={[0.22, 0.875, 0]}>
            <boxGeometry args={[0.09, 0.005, 0.07]} />
            <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.8} />
          </mesh>
          <Billboard position={[0, 1.4, 0]}>
            <Text fontSize={0.2} color="#FEF08A" anchorX="center" anchorY="middle">
              📿 [E] Berdzikir Tasbih
            </Text>
          </Billboard>
        </group>

        {/* Large Wall Calligraphy Frame: BISMILLAHIRRAHMANIRRAHIM */}
        <mesh position={[0, 4.2, -5.8]}>
          <boxGeometry args={[3.8, 1.4, 0.06]} />
          <meshStandardMaterial color="#1B4332" />
        </mesh>
        <Text
          position={[0, 4.2, -5.75]}
          fontSize={0.32}
          color="#FFD700"
          anchorX="center"
          anchorY="middle"
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </Text>
        <pointLight position={[0, 4.8, 0]} color="#BAE6FD" intensity={1.3} distance={16} />
      </group>

      {/* --- 5.4 GOURMET KITCHEN & DINING UMMI (WING KANAN DEPAN: X: 12, Z: 6) --- */}
      <group position={[12.0, 0.2, 6.0]}>
        {/* Grand Marble Kitchen Island & Breakfast Bar */}
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[5.2, 1.0, 1.6]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.2} metalness={0.1} />
          </mesh>
          <mesh position={[0, 1.02, 0]} castShadow>
            <boxGeometry args={[5.4, 0.08, 1.7]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.1} />
          </mesh>

          {/* Tiered Ceramic Dessert Stand with Cupcakes (INTERACTIVE: Cicipi Cupcake) */}
          <group
            position={[1.4, 1.06, 0]}
            onClick={(e) => {
              e.stopPropagation();
              soundManager.playSnackBuff();
              gameStore.addSpeedBuff(30);
              gameStore.setMessage('Nyam nyam! Cupcake pelangi buatan Ummi manis dan lezat! (+Speed Boost ⚡🧁)');
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto';
            }}
          >
            {/* Stand Base & Pedestal */}
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.28, 0.35, 0.05, 16]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.3, 10]} />
              <meshStandardMaterial color="#F59E0B" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.35, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 0.04, 16]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
            </mesh>
            {/* Rainbow Pastel Cupcakes */}
            {[-0.14, 0.14].map((cx, ci) =>
              [-0.12, 0.12].map((cz, zi) => (
                <group key={`${ci}-${zi}`} position={[cx, 0.12, cz]}>
                  {/* Cupcake Wrapper */}
                  <mesh castShadow>
                    <cylinderGeometry args={[0.065, 0.05, 0.08, 10]} />
                    <meshStandardMaterial color={['#FDE68A', '#FBCFE8', '#BAE6FD', '#A7F3D0'][(ci + zi) % 4]} />
                  </mesh>
                  {/* Swirled Frosting */}
                  <mesh position={[0, 0.06, 0]}>
                    <sphereGeometry args={[0.065, 8, 8]} />
                    <meshStandardMaterial color={['#EC4899', '#06B6D4', '#F59E0B', '#10B981'][(ci + zi) % 4]} />
                  </mesh>
                  {/* Cherry on Top */}
                  <mesh position={[0, 0.13, 0]}>
                    <sphereGeometry args={[0.02, 6, 6]} />
                    <meshStandardMaterial color="#DC2626" />
                  </mesh>
                </group>
              ))
            )}
            <Billboard position={[0, 0.8, 0]}>
              <Text fontSize={0.18} color="#FEF08A" anchorX="center" anchorY="middle">
                🧁 [E] Cicipi Cupcake Pelangi
              </Text>
            </Billboard>
          </group>

          {/* Kitchen Island Barstools (INTERACTIVE: Duduk di Kursi Bar) */}
          <group
            position={[0, 0, 1.3]}
            onClick={(e) => {
              e.stopPropagation();
              gameStore.setActiveRide('barstool');
              gameStore.setMessage('Khaulah duduk di kursi bar marmer menikmati camilan lezat Ummi! 🪑🍰');
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto';
            }}
          >
            {[-1.6, -0.6, 0.6, 1.6].map((sx, si) => (
              <group key={si} position={[sx, 0, 0]}>
                {/* Round Padded Seat */}
                <mesh position={[0, 0.55, 0]} castShadow>
                  <cylinderGeometry args={[0.24, 0.24, 0.1, 16]} />
                  <meshStandardMaterial color="#7F4F24" roughness={0.4} />
                </mesh>
                {/* Chrome Stem & Footrest Ring */}
                <mesh position={[0, 0.28, 0]}>
                  <cylinderGeometry args={[0.035, 0.035, 0.52, 10]} />
                  <meshStandardMaterial color="#CBD5E1" metalness={0.9} roughness={0.1} />
                </mesh>
                <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.15, 0.015, 6, 16]} />
                  <meshStandardMaterial color="#CBD5E1" metalness={0.9} roughness={0.1} />
                </mesh>
                <mesh position={[0, 0.02, 0]}>
                  <cylinderGeometry args={[0.22, 0.24, 0.04, 16]} />
                  <meshStandardMaterial color="#0F172A" />
                </mesh>
              </group>
            ))}
            <Billboard position={[0, 1.4, 0]}>
              <Text fontSize={0.2} color="#FEF08A" anchorX="center" anchorY="middle">
                🪑 [E] Duduk di Kursi Bar
              </Text>
            </Billboard>
          </group>
        </group>

        {/* Smart Refrigerator (INTERACTIVE: Buka Kulkas & Susu Dingin) */}
        <group
          position={[4.5, 0, -3.5]}
          onClick={(e) => {
            e.stopPropagation();
            soundManager.playDoorOpen();
            soundManager.playSnackBuff();
            gameStore.setMessage('Glek glek glek~ Susu dingin segar dari kulkas membuat Khaulah kuat dan bersemangat! 🥛❄️💪');
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          {/* Main Refrigerator Body */}
          <mesh position={[0, 1.25, 0]} castShadow>
            <boxGeometry args={[1.5, 2.4, 1.2]} />
            <meshStandardMaterial color="#D1FAE5" roughness={0.3} />
          </mesh>
          {/* French Door Seam & Handles */}
          <mesh position={[0, 1.25, 0.61]}>
            <boxGeometry args={[0.02, 2.3, 0.02]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          {[-0.1, 0.1].map((hx, hi) => (
            <mesh key={hi} position={[hx, 1.3, 0.64]}>
              <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
              <meshStandardMaterial color="#F8FAFC" metalness={0.9} roughness={0.1} />
            </mesh>
          ))}
          {/* Smart Screen Display & Water Dispenser */}
          <mesh position={[-0.4, 1.5, 0.61]}>
            <boxGeometry args={[0.35, 0.5, 0.02]} />
            <meshStandardMaterial color="#0F172A" emissive="#06B6D4" emissiveIntensity={0.6} />
          </mesh>
          {/* Cute Family Magnet Photos */}
          <mesh position={[0.4, 1.7, 0.61]}>
            <boxGeometry args={[0.2, 0.15, 0.02]} />
            <meshStandardMaterial color="#FEF08A" />
          </mesh>
          <Billboard position={[0, 2.6, 0]}>
            <Text fontSize={0.2} color="#FEF08A" anchorX="center" anchorY="middle">
              🥛 [E] Buka Kulkas & Susu Dingin
            </Text>
          </Billboard>
        </group>

        {/* Kitchen Sink & Handwashing Station (INTERACTIVE: Cuci Tangan) */}
        <group
          position={[4.5, 0, 3.0]}
          onClick={(e) => {
            e.stopPropagation();
            soundManager.playWaterSplash();
            gameStore.setMessage('Khaulah mencuci tangan bersih dengan sabun wangi! Kuman hilang, tangan harum! 🧼💧✨');
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          {/* Kitchen Countertop Base */}
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[1.5, 0.9, 2.2]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.92, 0]} castShadow>
            <boxGeometry args={[1.6, 0.06, 2.3]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.2} metalness={0.2} />
          </mesh>
          {/* Stainless Undermount Sink Basin */}
          <mesh position={[0, 0.88, 0]}>
            <boxGeometry args={[0.9, 0.15, 1.2]} />
            <meshStandardMaterial color="#0284C7" roughness={0.1} metalness={0.8} />
          </mesh>
          {/* Gooseneck Chrome Faucet */}
          <group position={[0.42, 1.05, 0]}>
            <mesh>
              <cylinderGeometry args={[0.025, 0.025, 0.35, 10]} />
              <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[-0.12, 0.16, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.025, 0.025, 0.24, 10]} />
              <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
          {/* Foaming Soap Dispenser */}
          <mesh position={[0.4, 1.02, 0.5]}>
            <cylinderGeometry args={[0.05, 0.05, 0.15, 10]} />
            <meshStandardMaterial color="#F472B6" />
          </mesh>
          {/* Floating Fresh Soap Bubbles */}
          <Sparkles count={8} position={[0, 1.2, 0]} scale={0.8} size={1.6} speed={0.5} color="#93C5FD" />
          <Billboard position={[0, 1.8, 0]}>
            <Text fontSize={0.2} color="#FEF08A" anchorX="center" anchorY="middle">
              🧼 [E] Cuci Tangan Bersih
            </Text>
          </Billboard>
        </group>

        <pointLight position={[0, 4.5, 0]} color="#FEF9C3" intensity={1.3} distance={14} />
      </group>

      {/* --- 5.5 KIDS WONDERLAND PLAYROOM & BEDROOM (WING KANAN BELAKANG: X: 12, Z: -6) --- */}
      <group position={[12.0, 0.2, -6.0]}>
        {/* Starry Cloud Bed (INTERACTIVE: Istirahat di Kasur Awan) */}
        <group
          position={[0, 0, -0.8]}
          onClick={(e) => {
            e.stopPropagation();
            gameStore.setActiveRide('bed');
            gameStore.setMessage('Hoaaam~ Kasur awan empuk sekali! Khaulah beristirahat di kasur bintang! 🛏️💤');
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          {/* Bed Wooden Frame */}
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[2.4, 0.35, 3.2]} />
            <meshStandardMaterial color="#DDD6FE" roughness={0.5} />
          </mesh>
          {/* Ultra Plush Mattress */}
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[2.2, 0.3, 3.0]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
          </mesh>
          {/* Starry Galaxy Pattern Duvet / Blanket */}
          <mesh position={[0, 0.58, 0.4]}>
            <boxGeometry args={[2.22, 0.16, 2.2]} />
            <meshStandardMaterial color="#818CF8" roughness={0.7} />
          </mesh>
          {/* Pillows */}
          {[-0.55, 0.55].map((px, pi) => (
            <mesh key={pi} position={[px, 0.68, -1.0]} rotation={[0.2, 0, 0]}>
              <boxGeometry args={[0.8, 0.18, 0.55]} />
              <meshStandardMaterial color="#FBCFE8" roughness={0.8} />
            </mesh>
          ))}
          {/* Cloud Headboard */}
          <group position={[0, 0.95, -1.55]}>
            <mesh castShadow>
              <boxGeometry args={[2.4, 1.1, 0.15]} />
              <meshStandardMaterial color="#C4B5FD" roughness={0.6} />
            </mesh>
            {[-0.8, 0, 0.8].map((cx, ci) => (
              <mesh key={ci} position={[cx, 0.55, 0]}>
                <sphereGeometry args={[0.38, 12, 12]} />
                <meshStandardMaterial color="#DDD6FE" roughness={0.5} />
              </mesh>
            ))}
          </group>
          {/* Glowing Star Nightlight beside Bed */}
          <group position={[-1.4, 0.45, -1.0]}>
            <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.25, 0.25, 0.5, 12]} />
              <meshStandardMaterial color="#F8FAFC" />
            </mesh>
            <mesh position={[0, 0.15, 0]}>
              <sphereGeometry args={[0.15, 10, 10]} />
              <meshStandardMaterial color="#FEF08A" emissive="#FEF08A" emissiveIntensity={0.8} />
            </mesh>
            <pointLight color="#FEF08A" intensity={0.9} distance={4} />
          </group>
          <Billboard position={[0, 1.8, 0]}>
            <Text fontSize={0.2} color="#FEF08A" anchorX="center" anchorY="middle">
              🛏️ [E] Istirahat di Kasur Awan
            </Text>
          </Billboard>
        </group>

        {/* Baby Crib Adek Faqih (INTERACTIVE: Putar Musik Bayi) */}
        <group
          position={[1.5, 0, -4.5]}
          onClick={(e) => {
            e.stopPropagation();
            soundManager.playBabyGiggle();
            gameStore.setMessage('Kling-kling~ Khaulah memutar musik pengantar tidur lembut untuk Adek Faqih! 👶🍼🎶');
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          {/* Crib Frame & Railings */}
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[1.2, 0.7, 1.8]} />
            <meshStandardMaterial color="#FEF9C3" roughness={0.5} />
          </mesh>
          {/* Soft Baby Mattress & Quilt */}
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[1.05, 0.3, 1.65]} />
            <meshStandardMaterial color="#BAE6FD" roughness={0.7} />
          </mesh>
          {/* Hanging Rotating Crib Mobile Toy */}
          <group position={[0, 1.35, 0]}>
            <mesh>
              <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
              <meshStandardMaterial color="#FCD34D" />
            </mesh>
            <mesh position={[0, -0.2, 0]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color="#F472B6" />
            </mesh>
            {[-0.25, 0.25].map((mx, mi) => (
              <mesh key={mi} position={[mx, -0.32, 0]}>
                <sphereGeometry args={[0.06, 6, 6]} />
                <meshStandardMaterial color={mi === 0 ? '#38BDF8' : '#FBBF24'} />
              </mesh>
            ))}
          </group>
          <Sparkles count={6} position={[0, 0.8, 0]} scale={1.2} size={1.4} speed={0.4} color="#C4B5FD" />
          <Billboard position={[0, 1.6, 0]}>
            <Text fontSize={0.2} color="#FEF08A" anchorX="center" anchorY="middle">
              👶 [E] Putar Kotak Musik Bayi
            </Text>
          </Billboard>
        </group>

        {/* Figure-8 Toy Racecar Circuit (INTERACTIVE: Balap Mobilan Mini) */}
        <group
          position={[0, 0, 2.5]}
          onClick={(e) => {
            e.stopPropagation();
            soundManager.playToyCar();
            gameStore.setMessage('Ngeeeng! Brum brum! Mobil balap mini meluncur kencang di arena sirkuit! 🏎️💨');
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          {/* Figure-8 Track Mat */}
          <mesh position={[0, 0.02, 0]} receiveShadow>
            <boxGeometry args={[2.8, 0.02, 2.2]} />
            <meshStandardMaterial color="#334155" roughness={0.8} />
          </mesh>
          {/* Track White Dashed Lines */}
          <mesh position={[0, 0.03, 0]}>
            <torusGeometry args={[0.65, 0.04, 6, 20]} />
            <meshStandardMaterial color="#F8FAFC" />
          </mesh>
          {/* Miniature Toy Racecars */}
          <group position={[-0.45, 0.07, 0]} rotation={[0, 0.6, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.3, 0.08, 0.16]} />
              <meshStandardMaterial color="#EF4444" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.07, 0]}>
              <boxGeometry args={[0.15, 0.07, 0.14]} />
              <meshStandardMaterial color="#0284C7" />
            </mesh>
          </group>
          <group position={[0.45, 0.07, 0]} rotation={[0, -0.6, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.3, 0.08, 0.16]} />
              <meshStandardMaterial color="#06B6D4" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.07, 0]}>
              <boxGeometry args={[0.15, 0.07, 0.14]} />
              <meshStandardMaterial color="#FBBF24" />
            </mesh>
          </group>
          {/* Checkered Start/Finish Arch */}
          <group position={[0, 0.28, 0]}>
            <mesh>
              <boxGeometry args={[0.5, 0.55, 0.08]} />
              <meshStandardMaterial color="#0F172A" />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[0.55, 0.15, 0.1]} />
              <meshStandardMaterial color="#F59E0B" />
            </mesh>
          </group>
          <Billboard position={[0, 1.1, 0]}>
            <Text fontSize={0.2} color="#FEF08A" anchorX="center" anchorY="middle">
              🏎️ [E] Balap Mobilan Mini
            </Text>
          </Billboard>
        </group>

        {/* Marching Band Drum Set (INTERACTIVE: Main Drum Band) */}
        <group
          position={[-3.0, 0, 2.0]}
          onClick={(e) => {
            e.stopPropagation();
            soundManager.playDrumband();
            gameStore.setMessage('Dum-dum-tak ratatat! Khaulah memainkan drum marching band dengan penuh semangat! 🥁🎶');
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          {/* Snare Drum Cylinder */}
          <mesh position={[0, 0.55, 0]} castShadow>
            <cylinderGeometry args={[0.32, 0.32, 0.25, 16]} />
            <meshStandardMaterial color="#E11D48" roughness={0.3} metalness={0.2} />
          </mesh>
          {/* Drum Skin Head */}
          <mesh position={[0, 0.68, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.015, 16]} />
            <meshStandardMaterial color="#FFFBEB" roughness={0.6} />
          </mesh>
          {/* Chrome Tripod Stand */}
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.48, 8]} />
            <meshStandardMaterial color="#CBD5E1" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Golden Crash Cymbal */}
          <group position={[0.42, 0.8, -0.15]} rotation={[0.2, 0, 0.2]}>
            <mesh>
              <cylinderGeometry args={[0.28, 0.28, 0.02, 16]} />
              <meshStandardMaterial color="#F59E0B" metalness={0.95} roughness={0.15} />
            </mesh>
            <mesh position={[0, -0.38, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.75, 8]} />
              <meshStandardMaterial color="#CBD5E1" metalness={0.9} />
            </mesh>
          </group>
          {/* Pair of Wooden Drumsticks */}
          <mesh position={[-0.1, 0.72, 0]} rotation={[0, 0, 0.6]}>
            <cylinderGeometry args={[0.015, 0.01, 0.38, 8]} />
            <meshStandardMaterial color="#D4A373" />
          </mesh>
          <mesh position={[0.1, 0.72, 0]} rotation={[0, 0, -0.6]}>
            <cylinderGeometry args={[0.015, 0.01, 0.38, 8]} />
            <meshStandardMaterial color="#D4A373" />
          </mesh>
          <Billboard position={[0, 1.4, 0]}>
            <Text fontSize={0.2} color="#FEF08A" anchorX="center" anchorY="middle">
              🥁 [E] Main Drum Marching Band
            </Text>
          </Billboard>
        </group>

        {/* Toy Chest & Castle Stacking Blocks (INTERACTIVE: Susun Istana Balok) */}
        <group
          position={[-4.0, 0, -4.0]}
          onClick={(e) => {
            e.stopPropagation();
            soundManager.playCheckpoint();
            gameStore.setMessage('Ting ting ting! Khaulah menyusun istana balok warna-warni yang tinggi sekali! 🧱🏰✨');
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          {/* Honey Yellow Toy Chest */}
          <group position={[0, 0, 0]}>
            <mesh position={[0, 0.45, 0]} castShadow>
              <boxGeometry args={[1.8, 0.85, 1.1]} />
              <meshStandardMaterial color="#FBBF24" roughness={0.5} />
            </mesh>
            {/* Open Chest Lid */}
            <mesh position={[0, 0.95, -0.45]} rotation={[-0.6, 0, 0]}>
              <boxGeometry args={[1.85, 0.1, 1.15]} />
              <meshStandardMaterial color="#F59E0B" roughness={0.4} />
            </mesh>
            {/* Cute Teddy Bear Peeking Out */}
            <group position={[0, 0.88, 0]}>
              <mesh castShadow>
                <sphereGeometry args={[0.18, 10, 10]} />
                <meshStandardMaterial color="#92400E" roughness={0.8} />
              </mesh>
              {[-0.12, 0.12].map((ex, ei) => (
                <mesh key={ei} position={[ex, 0.14, 0]}>
                  <sphereGeometry args={[0.06, 6, 6]} />
                  <meshStandardMaterial color="#78350F" />
                </mesh>
              ))}
            </group>
          </group>

          {/* Stacking Block Castle Tower */}
          <group position={[1.4, 0, 0]}>
            {/* Tower Base Cylinders & Cubes */}
            {[-0.25, 0.25].map((bx, bi) => (
              <mesh key={bi} position={[bx, 0.2, 0]} castShadow>
                <boxGeometry args={[0.35, 0.4, 0.35]} />
                <meshStandardMaterial color={bi === 0 ? '#EF4444' : '#3B82F6'} />
              </mesh>
            ))}
            {/* Bridge Arch */}
            <mesh position={[0, 0.45, 0]}>
              <boxGeometry args={[0.85, 0.12, 0.35]} />
              <meshStandardMaterial color="#10B981" />
            </mesh>
            {/* Upper Spires & Cones */}
            <mesh position={[0, 0.68, 0]}>
              <cylinderGeometry args={[0.14, 0.14, 0.32, 10]} />
              <meshStandardMaterial color="#F59E0B" />
            </mesh>
            <mesh position={[0, 0.95, 0]}>
              <coneGeometry args={[0.18, 0.3, 10]} />
              <meshStandardMaterial color="#8B5CF6" />
            </mesh>
          </group>
          <Billboard position={[0.7, 1.6, 0]}>
            <Text fontSize={0.2} color="#FEF08A" anchorX="center" anchorY="middle">
              🧱 [E] Susun Istana Balok
            </Text>
          </Billboard>
        </group>

        {/* Playroom Gentle Rainbow Light */}
        <pointLight position={[0, 4.5, 0]} color="#FEF3C7" intensity={1.3} distance={14} />
      </group>
    </group>
  );
};

// ============================================================================
// COMBINED COMPONENT EXPORT
// ============================================================================
export const RumahKhaulah: React.FC = () => {
  return (
    <>
      <RumahKhaulahExterior />
      <RumahKhaulahInterior />
    </>
  );
};
