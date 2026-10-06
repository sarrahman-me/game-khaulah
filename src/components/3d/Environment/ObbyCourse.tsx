import React, { useEffect } from 'react';
import * as THREE from 'three';
import { colliders } from '../../../state/colliders';
import { Trampoline } from './Trampoline';

interface ObbyPlatform {
  pos: [number, number, number];
  size: [number, number, number];
  color: string;
}

const SKYWAY_PLATFORMS: ObbyPlatform[] = [
  // --- SECTION 1: Rainbow Stepping Stones Behind School (Z: 72 -> 86) ---
  { pos: [0, 1.0, 72], size: [3.8, 0.6, 2.8], color: '#FF595E' },     // Merah
  { pos: [2.2, 1.8, 76], size: [3.2, 0.6, 2.8], color: '#FF924C' },   // Jingga
  { pos: [-2.0, 2.6, 81], size: [3.4, 0.6, 2.8], color: '#FFCA3A' },  // Kuning
  { pos: [1.5, 3.4, 86], size: [3.2, 0.6, 2.8], color: '#8AC926' },   // Hijau

  // --- SECTION 2: Candy Island & High Trampoline (Z: 91 -> 107) ---
  { pos: [-2.2, 4.2, 91], size: [3.4, 0.6, 2.8], color: '#1982C4' },  // Biru
  { pos: [0, 5.0, 96], size: [8.0, 0.8, 7.0], color: '#E8F1F5' },     // White Cloud Base (Checkpoint 2)
  { pos: [2.5, 5.8, 102], size: [3.2, 0.6, 2.8], color: '#6A4C93' },  // Ungu
  { pos: [-2.0, 6.6, 107], size: [3.2, 0.6, 2.8], color: '#FF70A6' },  // Pink

  // --- SECTION 3: Sky Crystal Bridge (Z: 113 -> 131) ---
  { pos: [0, 7.5, 113], size: [5.0, 0.6, 5.0], color: '#FF9770' },    // Peach Island (Trampoline Base)
  { pos: [-2.8, 8.4, 119], size: [3.2, 0.6, 2.8], color: '#70D6FF' }, // Sky blue
  { pos: [2.5, 9.3, 125], size: [3.2, 0.6, 2.8], color: '#FFD670' },  // Golden
  { pos: [0, 10.1, 131], size: [3.4, 0.6, 2.8], color: '#E9FF70' },   // Lime Entry

  // --- SECTION 4: KHAULAH'S STAR CASTLE (Checkpoint 3, Z: 138) ---
  { pos: [0, 11.0, 138], size: [14.0, 1.2, 12.0], color: '#F72585' }, // Castle Main Floor
];

export const ObbyCourse: React.FC = () => {
  useEffect(() => {
    // Register all obby platforms into colliders array
    const registered: any[] = [];

    SKYWAY_PLATFORMS.forEach((p) => {
      const box = new THREE.Box3(
        new THREE.Vector3(p.pos[0] - p.size[0] / 2, p.pos[1] - p.size[1], p.pos[2] - p.size[2] / 2),
        new THREE.Vector3(p.pos[0] + p.size[0] / 2, p.pos[1], p.pos[2] + p.size[2] / 2)
      );

      const colObj = { box, type: 'ground' as const };
      colliders.push(colObj);
      registered.push(colObj);
    });

    return () => {
      registered.forEach((c) => {
        const idx = colliders.indexOf(c);
        if (idx !== -1) colliders.splice(idx, 1);
      });
    };
  }, []);

  return (
    <group>
      {/* 1. All Skyway Floating Platforms */}
      {SKYWAY_PLATFORMS.map((p, idx) => (
        <group key={idx} position={[p.pos[0], p.pos[1] - p.size[1] / 2, p.pos[2]]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={p.size} />
            <meshStandardMaterial color={p.color} roughness={0.4} />
          </mesh>

          {/* Under-glow for floating magic */}
          <mesh position={[0, -p.size[1] / 2 - 0.05, 0]}>
            <planeGeometry args={[p.size[0] * 0.9, p.size[2] * 0.9]} />
            <meshBasicMaterial color={p.color} transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* 2. Trampolines */}
      {/* Trampoline on high candy island */}
      <Trampoline position={[0, 7.5, 113]} radius={1.8} />

      {/* 4. Khaulah's Castle Decor at Z: 138 */}
      <group position={[0, 11.0, 138]}>
        {/* Castle Turret Left Front */}
        <mesh position={[-5.5, 2.5, -4.5]} castShadow>
          <cylinderGeometry args={[1.0, 1.2, 5.0, 16]} />
          <meshStandardMaterial color="#7209B7" />
        </mesh>
        <mesh position={[-5.5, 5.8, -4.5]}>
          <coneGeometry args={[1.3, 2.0, 16]} />
          <meshStandardMaterial color="#4CC9F0" />
        </mesh>

        {/* Castle Turret Right Front */}
        <mesh position={[5.5, 2.5, -4.5]} castShadow>
          <cylinderGeometry args={[1.0, 1.2, 5.0, 16]} />
          <meshStandardMaterial color="#7209B7" />
        </mesh>
        <mesh position={[5.5, 5.8, -4.5]}>
          <coneGeometry args={[1.3, 2.0, 16]} />
          <meshStandardMaterial color="#4CC9F0" />
        </mesh>

        {/* Castle Turret Left Back */}
        <mesh position={[-5.5, 3.5, 4.5]} castShadow>
          <cylinderGeometry args={[1.0, 1.2, 7.0, 16]} />
          <meshStandardMaterial color="#7209B7" />
        </mesh>
        <mesh position={[-5.5, 7.8, 4.5]}>
          <coneGeometry args={[1.3, 2.0, 16]} />
          <meshStandardMaterial color="#FFD166" />
        </mesh>

        {/* Castle Turret Right Back */}
        <mesh position={[5.5, 3.5, 4.5]} castShadow>
          <cylinderGeometry args={[1.0, 1.2, 7.0, 16]} />
          <meshStandardMaterial color="#7209B7" />
        </mesh>
        <mesh position={[5.5, 7.8, 4.5]}>
          <coneGeometry args={[1.3, 2.0, 16]} />
          <meshStandardMaterial color="#FFD166" />
        </mesh>

        {/* Castle Arch Entrance */}
        <mesh position={[0, 2.2, 4.5]}>
          <boxGeometry args={[4, 4.4, 0.8]} />
          <meshStandardMaterial color="#3F37C9" />
        </mesh>
      </group>
    </group>
  );
};
