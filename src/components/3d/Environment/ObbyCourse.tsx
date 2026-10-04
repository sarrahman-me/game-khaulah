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
  // --- SECTION 1: Rainbow Stepping Stones Behind School (Z: 52 -> 62) ---
  { pos: [0, 0.9, 52], size: [3.5, 0.6, 2.5], color: '#FF595E' },     // Merah
  { pos: [2.0, 1.6, 55], size: [3.0, 0.6, 2.5], color: '#FF924C' },   // Jingga
  { pos: [-1.8, 2.3, 58], size: [3.2, 0.6, 2.5], color: '#FFCA3A' },  // Kuning
  { pos: [1.2, 3.0, 61], size: [3.0, 0.6, 2.5], color: '#8AC926' },   // Hijau

  // --- SECTION 2: Candy Island & High Trampoline (Z: 64 -> 76) ---
  { pos: [-2.2, 3.8, 64], size: [3.2, 0.6, 2.5], color: '#1982C4' },  // Biru
  { pos: [0, 4.6, 68], size: [7.0, 0.8, 6.0], color: '#E8F1F5' },     // White Cloud Base (Checkpoint 2)
  { pos: [2.5, 5.4, 73], size: [3.0, 0.6, 2.5], color: '#6A4C93' },   // Ungu
  { pos: [-1.8, 6.2, 76], size: [3.0, 0.6, 2.5], color: '#FF70A6' },  // Pink

  // --- SECTION 3: Sky Crystal Bridge (Z: 79 -> 89) ---
  { pos: [0, 7.0, 80], size: [4.0, 0.6, 4.0], color: '#FF9770' },     // Peach Island (Trampoline Base)
  { pos: [-2.5, 7.8, 84], size: [3.0, 0.6, 2.5], color: '#70D6FF' },  // Sky blue
  { pos: [2.2, 8.6, 88], size: [3.0, 0.6, 2.5], color: '#FFD670' },   // Golden
  { pos: [0, 9.4, 91], size: [3.2, 0.6, 2.5], color: '#E9FF70' },    // Lime Entry

  // --- SECTION 4: KHAULAH'S STAR CASTLE (Checkpoint 3, Z: 95) ---
  { pos: [0, 10.0, 95], size: [12.0, 1.0, 10.0], color: '#F72585' },  // Castle Main Floor
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
      <CheckpointFlag index={1} position={[0, 0.3, 28]} />
      {/* Checkpoint 2: Puncak Awan Gula-Gula Skyway */}
      <CheckpointFlag index={2} position={[0, 4.6, 68]} />
      {/* Checkpoint 3: Istana Bintang Khaulah */}
      <CheckpointFlag index={3} position={[0, 10.0, 95]} />

      {/* 3. Trampolines */}
      {/* Trampoline on high candy island */}
      <Trampoline position={[0, 7.0, 80]} radius={1.6} />

      {/* 4. Khaulah's Castle Decor at Z: 95 */}
      <group position={[0, 10.0, 95]}>
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

      {/* Giant Trophy Star on Top of Castle */}
      <StarCollectible id="star_trophy" position={[0, 14.5, 95]} color="#FFD700" isBig={true} />

      {/* 5. Scatter 24 Stars Across Village, School & Skyway */}
      {/* --- RUMAH KHAULAH YARD STARS --- */}
      <StarCollectible id="star_1" position={[-3, 1.2, -4]} color="#FFD166" />
      <StarCollectible id="star_2" position={[3, 1.2, -4]} color="#FF6B6B" />
      <StarCollectible id="star_3" position={[-1.8, 1.2, -1.5]} color="#4ECDC4" />
      <StarCollectible id="star_4" position={[2.0, 1.2, -1.5]} color="#FFD166" />

      {/* --- VILLAGE RIVER & BRIDGE STARS --- */}
      <StarCollectible id="star_5" position={[0, 1.4, 11]} color="#FFB703" />
      <StarCollectible id="star_6" position={[-5, 1.2, 8]} color="#9D4EDD" />
      <StarCollectible id="star_7" position={[5, 1.2, 8]} color="#FF9F1C" />
      <StarCollectible id="star_8" position={[0, 2.2, 18]} color="#2EC4B6" />

      {/* --- TK KARANG TENGAH 1 ATAP PLAYGROUND STARS --- */}
      <StarCollectible id="star_9" position={[8, 3.2, 26]} color="#FF595E" />    {/* Top of Slide! */}
      <StarCollectible id="star_10" position={[-8, 1.8, 26]} color="#FF924C" />  {/* Swing set */}
      <StarCollectible id="star_11" position={[-2.5, 2.8, 23]} color="#FFCA3A" /> {/* Flagpole */}
      <StarCollectible id="star_12" position={[3.5, 1.6, 31]} color="#8AC926" />  {/* Seesaw */}

      {/* --- RAINBOW SKYWAY STARS --- */}
      <StarCollectible id="star_13" position={[0, 1.8, 52]} color="#1982C4" />
      <StarCollectible id="star_14" position={[2.0, 2.6, 55]} color="#6A4C93" />
      <StarCollectible id="star_15" position={[-1.8, 3.3, 58]} color="#FF70A6" />
      <StarCollectible id="star_16" position={[1.2, 4.0, 61]} color="#FFD166" />
      <StarCollectible id="star_17" position={[-2.2, 4.8, 64]} color="#70D6FF" />
      <StarCollectible id="star_18" position={[0, 5.6, 68]} color="#FF9770" />   {/* Cloud Peak */}
      <StarCollectible id="star_19" position={[2.5, 6.4, 73]} color="#FFD670" />
      <StarCollectible id="star_20" position={[-1.8, 7.2, 76]} color="#E9FF70" />
      <StarCollectible id="star_21" position={[0, 10.8, 80]} color="#FFD166" isBig={true} /> {/* High Trampoline Star! */}
      <StarCollectible id="star_22" position={[-2.5, 8.8, 84]} color="#70D6FF" />
      <StarCollectible id="star_23" position={[2.2, 9.6, 88]} color="#F72585" />
      <StarCollectible id="star_24" position={[0, 11.2, 93]} color="#7209B7" />
    </group>
  );
};
