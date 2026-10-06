import React, { useEffect } from 'react';
import * as THREE from 'three';
import { colliders } from '../../../state/colliders';
import { Trampoline } from './Trampoline';
import { CheckpointFlag } from './CheckpointFlag';
import { StarCollectible } from './StarCollectible';

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

      {/* 2. Checkpoints */}
      {/* Checkpoint 0: Rumah Khaulah bersama Abi & Ummi */}
      <CheckpointFlag index={0} position={[0, 0.3, -4]} />
      {/* Checkpoint 1: Gerbang TK Karang Tengah 1 Atap */}
      <CheckpointFlag index={1} position={[0, 0.3, 26]} />
      {/* Checkpoint 2: Puncak Awan Gula-Gula Skyway */}
      <CheckpointFlag index={2} position={[0, 5.0, 96]} />
      {/* Checkpoint 3: Istana Bintang Khaulah */}
      <CheckpointFlag index={3} position={[0, 11.0, 138]} />

      {/* 3. Trampolines */}
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

      {/* Giant Trophy Star on Top of Castle */}
      <StarCollectible id="star_trophy" position={[0, 15.5, 138]} color="#FFD700" isBig={true} />

      {/* 5. Scatter 24 Stars Across Village, School & Skyway */}
      {/* --- RUMAH KHAULAH YARD STARS --- */}
      <StarCollectible id="star_1" position={[-3, 1.2, -4]} color="#FFD166" />
      <StarCollectible id="star_2" position={[3, 1.2, -4]} color="#FF6B6B" />
      <StarCollectible id="star_3" position={[-1.8, 1.2, -1.5]} color="#4ECDC4" />
      <StarCollectible id="star_4" position={[2.0, 1.2, -1.5]} color="#FFD166" />

      {/* --- VILLAGE RIVER & BRIDGE STARS --- */}
      <StarCollectible id="star_5" position={[0, 1.4, 18]} color="#FFB703" />
      <StarCollectible id="star_6" position={[-6, 1.2, 18]} color="#9D4EDD" />
      <StarCollectible id="star_7" position={[6, 1.2, 18]} color="#FF9F1C" />
      <StarCollectible id="star_8" position={[0, 2.2, 26]} color="#2EC4B6" />

      {/* --- TK KARANG TENGAH 1 ATAP PLAYGROUND STARS --- */}
      <StarCollectible id="star_9" position={[9, 3.2, 42]} color="#FF595E" />    {/* Top of Slide! */}
      <StarCollectible id="star_10" position={[-9, 1.8, 42]} color="#FF924C" />  {/* Swing set */}
      <StarCollectible id="star_11" position={[-3.5, 3.2, 34]} color="#FFCA3A" /> {/* Flagpole */}
      <StarCollectible id="star_12" position={[4, 1.6, 48]} color="#8AC926" />   {/* Seesaw */}

      {/* --- RAINBOW SKYWAY STARS --- */}
      <StarCollectible id="star_13" position={[0, 2.0, 72]} color="#1982C4" />
      <StarCollectible id="star_14" position={[2.2, 2.8, 76]} color="#6A4C93" />
      <StarCollectible id="star_15" position={[-2.0, 3.6, 81]} color="#FF70A6" />
      <StarCollectible id="star_16" position={[1.5, 4.4, 86]} color="#FFD166" />
      <StarCollectible id="star_17" position={[-2.2, 5.2, 91]} color="#70D6FF" />
      <StarCollectible id="star_18" position={[0, 6.0, 96]} color="#FF9770" />   {/* Cloud Peak */}
      <StarCollectible id="star_19" position={[2.5, 6.8, 102]} color="#FFD670" />
      <StarCollectible id="star_20" position={[-2.0, 7.6, 107]} color="#E9FF70" />
      <StarCollectible id="star_21" position={[0, 11.5, 113]} color="#FFD166" isBig={true} /> {/* High Trampoline Star! */}
      <StarCollectible id="star_22" position={[-2.8, 9.4, 119]} color="#70D6FF" />
      <StarCollectible id="star_23" position={[2.5, 10.3, 125]} color="#F72585" />
      <StarCollectible id="star_24" position={[0, 12.0, 133]} color="#7209B7" />
    </group>
  );
};
