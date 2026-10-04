import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, gameStore } from '../../../state/useGameStore';

// ============================================================================
// 1. QUEST COLLECTIBLE ITEM: 3D TAS RANSEL TK
// ============================================================================
const BackpackItem: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const meshRef = useRef<THREE.Group>(null);
  const collected = useGameStore((s) => s.schoolQuest.backpack);

  useFrame((state) => {
    if (collected || !meshRef.current) return;
    const time = state.clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(time * 3.5) * 0.12;
    meshRef.current.rotation.y = time * 2.0;

    const playerPos = gameStore.getState().playerPos;
    const distSq =
      Math.pow(playerPos[0] - position[0], 2) +
      Math.pow(playerPos[1] + 0.6 - position[1], 2) +
      Math.pow(playerPos[2] - position[2], 2);

    if (distSq < 3.8) {
      gameStore.collectQuestItem('backpack');
    }
  });

  if (collected) return null;

  return (
    <group ref={meshRef} position={position} scale={0.85}>
      <Billboard position={[0, 0.9, 0]}>
        <Text fontSize={0.2} color="#1E88E5" outlineWidth={0.03} outlineColor="#FFFFFF" anchorY="middle">
          🎒 Tas Ransel TK
        </Text>
      </Billboard>

      {/* Backpack Main Pouch */}
      <mesh castShadow>
        <boxGeometry args={[0.42, 0.52, 0.28]} />
        <meshStandardMaterial color="#1E88E5" roughness={0.4} />
      </mesh>
      {/* Front Small Pocket */}
      <mesh position={[0, -0.06, 0.16]}>
        <boxGeometry args={[0.34, 0.28, 0.1]} />
        <meshStandardMaterial color="#FF69B4" roughness={0.4} />
      </mesh>
      {/* Star emblem on front pocket */}
      <mesh position={[0, -0.06, 0.22]}>
        <circleGeometry args={[0.07, 8]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      {/* Top Handle */}
      <mesh position={[0, 0.3, 0]}>
        <torusGeometry args={[0.08, 0.02, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#0D47A1" />
      </mesh>
      {/* Straps */}
      {[-0.12, 0.12].map((sx, idx) => (
        <mesh key={idx} position={[sx, 0, -0.15]}>
          <boxGeometry args={[0.05, 0.44, 0.04]} />
          <meshStandardMaterial color="#0D47A1" />
        </mesh>
      ))}
      {/* Glowing Aura Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.48, 0.025, 8, 24]} />
        <meshBasicMaterial color="#38BDF8" transparent opacity={0.7} />
      </mesh>
    </group>
  );
};

// ============================================================================
// 2. QUEST COLLECTIBLE ITEM: 3D BOTOL MINUM LUCU
// ============================================================================
const WaterBottleItem: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const meshRef = useRef<THREE.Group>(null);
  const collected = useGameStore((s) => s.schoolQuest.waterBottle);

  useFrame((state) => {
    if (collected || !meshRef.current) return;
    const time = state.clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(time * 3.5 + 1.2) * 0.12;
    meshRef.current.rotation.y = time * 2.2;

    const playerPos = gameStore.getState().playerPos;
    const distSq =
      Math.pow(playerPos[0] - position[0], 2) +
      Math.pow(playerPos[1] + 0.6 - position[1], 2) +
      Math.pow(playerPos[2] - position[2], 2);

    if (distSq < 3.8) {
      gameStore.collectQuestItem('waterBottle');
    }
  });

  if (collected) return null;

  return (
    <group ref={meshRef} position={position} scale={0.85}>
      <Billboard position={[0, 0.85, 0]}>
        <Text fontSize={0.2} color="#06D6A0" outlineWidth={0.03} outlineColor="#FFFFFF" anchorY="middle">
          🍼 Botol Minum
        </Text>
      </Billboard>

      {/* Bottle Body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.45, 16]} />
        <meshStandardMaterial color="#06D6A0" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Pink Cap */}
      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.11, 0.14, 0.1, 16]} />
        <meshStandardMaterial color="#FF5D8F" roughness={0.3} />
      </mesh>
      {/* Straw / Spout */}
      <mesh position={[0.04, 0.34, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.08, 8]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      {/* Bottle Strap */}
      <mesh position={[0, 0.05, 0]}>
        <torusGeometry args={[0.16, 0.02, 8, 24]} />
        <meshStandardMaterial color="#FFD166" />
      </mesh>
      {/* Glowing Aura Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.025, 8, 24]} />
        <meshBasicMaterial color="#06D6A0" transparent opacity={0.7} />
      </mesh>
    </group>
  );
};

// ============================================================================
// 3. QUEST COLLECTIBLE ITEM: 3D BUKU GAMBAR CERIA
// ============================================================================
const DrawingBookItem: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const meshRef = useRef<THREE.Group>(null);
  const collected = useGameStore((s) => s.schoolQuest.drawingBook);

  useFrame((state) => {
    if (collected || !meshRef.current) return;
    const time = state.clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(time * 3.5 + 2.4) * 0.12;
    meshRef.current.rotation.y = time * 1.9;

    const playerPos = gameStore.getState().playerPos;
    const distSq =
      Math.pow(playerPos[0] - position[0], 2) +
      Math.pow(playerPos[1] + 0.6 - position[1], 2) +
      Math.pow(playerPos[2] - position[2], 2);

    if (distSq < 3.8) {
      gameStore.collectQuestItem('drawingBook');
    }
  });

  if (collected) return null;

  return (
    <group ref={meshRef} position={position} scale={0.85}>
      <Billboard position={[0, 0.85, 0]}>
        <Text fontSize={0.2} color="#F59E0B" outlineWidth={0.03} outlineColor="#FFFFFF" anchorY="middle">
          🎨 Buku Gambar
        </Text>
      </Billboard>

      {/* Book Cover */}
      <mesh castShadow>
        <boxGeometry args={[0.42, 0.06, 0.52]} />
        <meshStandardMaterial color="#FFCA3A" roughness={0.4} />
      </mesh>
      {/* Pages edge */}
      <mesh position={[0.02, 0, 0]}>
        <boxGeometry args={[0.39, 0.045, 0.49]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.7} />
      </mesh>
      {/* Rainbow motif on cover */}
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.32, 0.32]} />
        <meshStandardMaterial color="#FF595E" />
      </mesh>
      {/* Crayon / Colored Pencil lying on book */}
      <mesh position={[0.12, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.28, 8]} />
        <meshStandardMaterial color="#8AC926" />
      </mesh>
      {/* Glowing Aura Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.46, 0.025, 8, 24]} />
        <meshBasicMaterial color="#FFCA3A" transparent opacity={0.7} />
      </mesh>
    </group>
  );
};

// ============================================================================
// 4. BU GURU RAHMA (GURU TK KARANG TENGAH 1 ATAP)
// ============================================================================
const BuGuruTeacher: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const teacherGroup = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  const quest = useGameStore((s) => s.schoolQuest);
  const allCollected = quest.backpack && quest.waterBottle && quest.drawingBook;

  useFrame((state, delta) => {
    if (!teacherGroup.current) return;
    const time = state.clock.getElapsedTime();
    const playerPos = gameStore.getState().playerPos;

    const dx = playerPos[0] - position[0];
    const dz = playerPos[2] - position[2];
    const distSq = dx * dx + dz * dz;

    // Look at player when close
    if (distSq < 16.0) {
      const targetAngle = Math.atan2(dx, dz);
      teacherGroup.current.rotation.y = THREE.MathUtils.lerp(
        teacherGroup.current.rotation.y,
        targetAngle,
        delta * 4
      );

      // Cheerful arm wave
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -0.5;
        rightArmRef.current.rotation.z = -1.1 + Math.sin(time * 6) * 0.3;
      }
      if (headRef.current) {
        headRef.current.rotation.x = -0.05 + Math.sin(time * 2.2) * 0.04;
      }

      // Register interaction prompt
      if (quest.completed) {
        gameStore.setNearbyInteractable({
          id: 'bu_guru',
          title: 'Ibu Santi (Guru TK Karang Tengah)',
          prompt: 'Tekan [E] untuk Sapa Ibu Santi! 🌸👩‍🏫',
        });
      } else if (allCollected) {
        gameStore.setNearbyInteractable({
          id: 'bu_guru',
          title: 'Ibu Santi (Guru TK Karang Tengah)',
          prompt: 'Tekan [E] untuk Kumpulkan Perlengkapan ke Ibu Santi! 🎒🌟🏅',
        });
      } else {
        gameStore.setNearbyInteractable({
          id: 'bu_guru',
          title: 'Ibu Santi (Guru TK Karang Tengah)',
          prompt: 'Tekan [E] untuk Cek Perlengkapan Sekolah bersama Ibu Santi! 🎒',
        });
      }
    } else {
      // Idle state
      teacherGroup.current.rotation.y = THREE.MathUtils.lerp(
        teacherGroup.current.rotation.y,
        0,
        delta * 2
      );
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -0.2;
        rightArmRef.current.rotation.z = -0.2;
      }
      if (headRef.current) {
        headRef.current.rotation.x = Math.sin(time * 1.5) * 0.03;
      }
    }
  });

  return (
    <group ref={teacherGroup} position={position}>
      {/* Floating Tag */}
      <Billboard position={[0, 2.5, 0]}>
        <Text
          fontSize={0.24}
          color="#065F46"
          outlineWidth={0.035}
          outlineColor="#FFFFFF"
          anchorY="middle"
        >
          {quest.completed
            ? '👩‍🏫 Ibu Santi (Siswa Teladan! ⭐)'
            : allCollected
            ? '👩‍🏫 Ibu Santi (! Perlengkapan Siap !)'
            : '👩‍🏫 Ibu Santi (TK Karang Tengah)'}
        </Text>
      </Billboard>

      {/* --- CHARACTER BODY --- */}
      {/* Long Pastel Skirt */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <coneGeometry args={[0.42, 1.1, 16]} />
        <meshStandardMaterial color="#065F46" roughness={0.6} />
      </mesh>

      {/* Blouse Torso */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.28, 0.45, 14]} />
        <meshStandardMaterial color="#D1FAE5" roughness={0.5} />
      </mesh>

      {/* Teacher Name Tag Badge */}
      <mesh position={[0.12, 1.42, 0.24]}>
        <boxGeometry args={[0.08, 0.05, 0.02]} />
        <meshStandardMaterial color="#FBBF24" />
      </mesh>

      {/* Hijab Drape / Khimar */}
      <mesh position={[0, 1.52, 0]}>
        <coneGeometry args={[0.38, 0.5, 16]} />
        <meshStandardMaterial color="#34D399" roughness={0.5} />
      </mesh>

      {/* Head & Face */}
      <group ref={headRef} position={[0, 1.76, 0]}>
        {/* Hijab Cap */}
        <mesh castShadow>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial color="#34D399" roughness={0.5} />
        </mesh>
        {/* Face Oval */}
        <mesh position={[0, -0.02, 0.16]}>
          <sphereGeometry args={[0.18, 14, 14]} />
          <meshStandardMaterial color="#F7D0B2" roughness={0.8} />
        </mesh>
        {/* Friendly Eyes */}
        {[-0.07, 0.07].map((ex, idx) => (
          <group key={idx} position={[ex, 0.02, 0.32]}>
            <mesh>
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshBasicMaterial color="#1E293B" />
            </mesh>
            <mesh position={[0.006, 0.006, 0.015]}>
              <sphereGeometry args={[0.009, 6, 6]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          </group>
        ))}
        {/* Cheerful Smile */}
        <mesh position={[0, -0.06, 0.32]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.04, 0.01, 8, 12, Math.PI]} />
          <meshBasicMaterial color="#BE185D" />
        </mesh>
        {/* Cute Glasses Frame */}
        {[-0.07, 0.07].map((gx, idx) => (
          <mesh key={idx} position={[gx, 0.02, 0.33]}>
            <torusGeometry args={[0.038, 0.008, 8, 16]} />
            <meshStandardMaterial color="#B45309" metalness={0.7} />
          </mesh>
        ))}
        <mesh position={[0, 0.02, 0.33]}>
          <boxGeometry args={[0.04, 0.008, 0.008]} />
          <meshStandardMaterial color="#B45309" metalness={0.7} />
        </mesh>
      </group>

      {/* Left Arm: Holding Teaching Clipboard */}
      <group position={[-0.32, 1.35, 0]}>
        <mesh rotation={[0.4, 0, 0.3]} castShadow>
          <cylinderGeometry args={[0.065, 0.055, 0.45, 10]} />
          <meshStandardMaterial color="#34D399" />
        </mesh>
        {/* Clipboard */}
        <group position={[-0.05, -0.15, 0.22]} rotation={[0.4, -0.2, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.22, 0.3, 0.03]} />
            <meshStandardMaterial color="#78350F" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0, 0.018]}>
            <planeGeometry args={[0.18, 0.24]} />
            <meshStandardMaterial color="#FEF3C7" />
          </mesh>
          <mesh position={[0, 0.13, 0.022]}>
            <boxGeometry args={[0.08, 0.03, 0.01]} />
            <meshStandardMaterial color="#D1D5DB" metalness={0.8} />
          </mesh>
        </group>
      </group>

      {/* Right Arm: Friendly Wave */}
      <group ref={rightArmRef} position={[0.32, 1.35, 0]}>
        <mesh rotation={[-0.2, 0, -0.2]} castShadow>
          <cylinderGeometry args={[0.065, 0.055, 0.45, 10]} />
          <meshStandardMaterial color="#34D399" />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.24, 0]}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshStandardMaterial color="#F7D0B2" />
        </mesh>
      </group>
    </group>
  );
};

// ============================================================================
// MAIN COMPONENT EXPORT
// ============================================================================
export const SchoolQuest: React.FC = () => {
  return (
    <group>
      {/* 1. Quest Items placed in scenic spots */}
      {/* Item 1: Tas Ransel TK on front terrace bench */}
      <BackpackItem position={[-3.6, 0.55, -4.5]} />

      {/* Item 2: Botol Minum on garden table beside house */}
      <WaterBottleItem position={[4.5, 0.55, -2.5]} />

      {/* Item 3: Buku Gambar on riverside picnic spot before bridge */}
      <DrawingBookItem position={[-4.2, 0.45, 6.5]} />

      {/* 2. Ibu Santi welcoming students at TK gate */}
      <BuGuruTeacher position={[2.5, 0.2, 19.5]} />
    </group>
  );
};
