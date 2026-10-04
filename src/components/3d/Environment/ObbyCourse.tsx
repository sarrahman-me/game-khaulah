import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { colliders } from '../../../state/colliders';
import { Trampoline } from './Trampoline';
import { CheckpointFlag } from './CheckpointFlag';
import { StarCollectible } from './StarCollectible';

interface ObbyPlatform {
  pos: [number, number, number];
  size: [number, number, number];
  color: string;
  shape?: 'box' | 'cylinder';
}

const PLATFORMS: ObbyPlatform[] = [
  // --- SECTION 1: Rainbow Stepping Stones (Z: 14 -> 24) ---
  { pos: [0, 0.8, 14], size: [3.5, 0.6, 2.5], color: '#FF595E' },     // Merah
  { pos: [1.8, 1.4, 17], size: [3.0, 0.6, 2.5], color: '#FF924C' },   // Jingga
  { pos: [-1.2, 2.0, 20], size: [3.2, 0.6, 2.5], color: '#FFCA3A' },  // Kuning
  { pos: [0, 2.8, 24], size: [6.0, 0.8, 5.0], color: '#8AC926' },    // Hijau (Checkpoint 1 Base)

  // --- SECTION 2: Candy Island & Trampoline (Z: 28 -> 48) ---
  { pos: [2.5, 3.4, 29], size: [3.0, 0.6, 2.5], color: '#1982C4' },   // Biru
  { pos: [-2.0, 4.0, 33], size: [3.2, 0.6, 2.5], color: '#6A4C93' },  // Ungu
  { pos: [1.5, 4.6, 37], size: [3.0, 0.6, 2.5], color: '#FF70A6' },   // Pink
  { pos: [0, 5.2, 42], size: [4.0, 0.6, 4.0], color: '#FF9770' },     // Peach Island
  // Cloud Peak Platform (Checkpoint 2 Base)
  { pos: [0, 6.0, 48], size: [7.0, 0.8, 6.0], color: '#E8F1F5' },    // White Cloud Base

  // --- SECTION 3: Sky Bridge & High Jump (Z: 53 -> 75) ---
  { pos: [-2.5, 6.8, 54], size: [3.0, 0.6, 2.5], color: '#70D6FF' },  // Sky blue
  { pos: [2.2, 7.6, 59], size: [3.0, 0.6, 2.5], color: '#FF9770' },   // Coral
  { pos: [-1.5, 8.4, 64], size: [3.2, 0.6, 2.5], color: '#FFD670' },  // Golden
  { pos: [1.8, 9.2, 69], size: [3.0, 0.6, 2.5], color: '#E9FF70' },   // Lime
  // --- SECTION 4: KHAULAH'S STAR CASTLE (Checkpoint 3) ---
  { pos: [0, 10.0, 75], size: [12.0, 1.0, 10.0], color: '#F72585' },  // Castle Main Floor
];

export const ObbyCourse: React.FC = () => {
  useEffect(() => {
    // Register all obby platforms into colliders array
    const registered: any[] = [];

    PLATFORMS.forEach((p) => {
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
      {/* 1. All Main Obby Platforms */}
      {PLATFORMS.map((p, idx) => (
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

      {/* 2. Checkpoints */}
      <CheckpointFlag index={0} position={[0, 0.3, 0]} />
      <CheckpointFlag index={1} position={[0, 2.8, 24]} />
      <CheckpointFlag index={2} position={[0, 6.0, 48]} />
      <CheckpointFlag index={3} position={[0, 10.0, 75]} />

      {/* 3. Trampolines on the Playground */}
      {/* Trampoline on start island for fun bounces */}
      <Trampoline position={[-5, 0.3, 0]} radius={1.8} />
      {/* Trampoline before Section 3 to give a huge boost */}
      <Trampoline position={[0, 5.2, 42]} radius={1.5} />

      {/* 4. Khaulah's Castle Decor at Z: 75 */}
      <group position={[0, 10.0, 75]}>
        {/* Castle Turret Left Front */}
        <mesh position={[-5, 2.5, -4]} castShadow>
          <cylinderGeometry args={[1.0, 1.2, 5.0, 16]} />
          <meshStandardMaterial color="#7209B7" />
        </mesh>
        <mesh position={[-5, 5.8, -4]}>
          <coneGeometry args={[1.3, 2.0, 16]} />
          <meshStandardMaterial color="#4CC9F0" />
        </mesh>

        {/* Castle Turret Right Front */}
        <mesh position={[5, 2.5, -4]} castShadow>
          <cylinderGeometry args={[1.0, 1.2, 5.0, 16]} />
          <meshStandardMaterial color="#7209B7" />
        </mesh>
        <mesh position={[5, 5.8, -4]}>
          <coneGeometry args={[1.3, 2.0, 16]} />
          <meshStandardMaterial color="#4CC9F0" />
        </mesh>

        {/* Castle Turret Left Back */}
        <mesh position={[-5, 3.5, 4]} castShadow>
          <cylinderGeometry args={[1.0, 1.2, 7.0, 16]} />
          <meshStandardMaterial color="#7209B7" />
        </mesh>
        <mesh position={[-5, 7.8, 4]}>
          <coneGeometry args={[1.3, 2.0, 16]} />
          <meshStandardMaterial color="#FFD166" />
        </mesh>

        {/* Castle Turret Right Back */}
        <mesh position={[5, 3.5, 4]} castShadow>
          <cylinderGeometry args={[1.0, 1.2, 7.0, 16]} />
          <meshStandardMaterial color="#7209B7" />
        </mesh>
        <mesh position={[5, 7.8, 4]}>
          <coneGeometry args={[1.3, 2.0, 16]} />
          <meshStandardMaterial color="#FFD166" />
        </mesh>

        {/* Castle Arch Entrance */}
        <mesh position={[0, 2.2, 4]}>
          <boxGeometry args={[4, 4.4, 0.8]} />
          <meshStandardMaterial color="#3F37C9" />
        </mesh>
      </group>

      {/* Giant Trophy Star on Top of Castle (World Coordinates) */}
      <StarCollectible id="star_trophy" position={[0, 14.5, 75]} color="#FFD700" isBig={true} />

      {/* 5. Scatter 24 Stars Across Playground and Obby */}
      {/* Playground Island Stars */}
      <StarCollectible id="star_1" position={[3, 1.2, -2]} color="#FFD166" />
      <StarCollectible id="star_2" position={[-3, 1.2, 3]} color="#FF6B6B" />
      <StarCollectible id="star_3" position={[6, 1.2, 2]} color="#4ECDC4" />
      <StarCollectible id="star_4" position={[-5, 4.5, 0]} color="#FFD166" /> {/* Above trampoline! */}
      <StarCollectible id="star_5" position={[0, 1.2, 8]} color="#9D4EDD" />
      <StarCollectible id="star_6" position={[-6, 1.2, -4]} color="#FF9F1C" />
      <StarCollectible id="star_7" position={[6, 1.2, -3]} color="#2EC4B6" />

      {/* Obby Section 1 Stars */}
      <StarCollectible id="star_8" position={[0, 1.8, 14]} color="#FF595E" />
      <StarCollectible id="star_9" position={[1.8, 2.4, 17]} color="#FF924C" />
      <StarCollectible id="star_10" position={[-1.2, 3.0, 20]} color="#FFCA3A" />
      <StarCollectible id="star_11" position={[0, 3.8, 24]} color="#8AC926" />

      {/* Obby Section 2 Stars */}
      <StarCollectible id="star_12" position={[2.5, 4.4, 29]} color="#1982C4" />
      <StarCollectible id="star_13" position={[-2.0, 5.0, 33]} color="#6A4C93" />
      <StarCollectible id="star_14" position={[1.5, 5.6, 37]} color="#FF70A6" />
      <StarCollectible id="star_15" position={[0, 8.5, 42]} color="#FFD166" isBig={true} /> {/* High Trampoline Star! */}
      <StarCollectible id="star_16" position={[0, 7.0, 48]} color="#70D6FF" />

      {/* Obby Section 3 Stars */}
      <StarCollectible id="star_17" position={[-2.5, 7.8, 54]} color="#70D6FF" />
      <StarCollectible id="star_18" position={[2.2, 8.6, 59]} color="#FF9770" />
      <StarCollectible id="star_19" position={[-1.5, 9.4, 64]} color="#FFD670" />
      <StarCollectible id="star_20" position={[1.8, 10.2, 69]} color="#E9FF70" />

      {/* Castle Zone Stars */}
      <StarCollectible id="star_21" position={[-3, 11.2, 73]} color="#F72585" />
      <StarCollectible id="star_22" position={[3, 11.2, 73]} color="#7209B7" />
      <StarCollectible id="star_23" position={[-3, 11.2, 77]} color="#4CC9F0" />
      <StarCollectible id="star_24" position={[3, 11.2, 77]} color="#4895EF" />
    </group>
  );
};
