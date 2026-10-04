import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, gameStore } from '../../../state/useGameStore';
import { CheckpointFlag } from './CheckpointFlag';
import { StarCollectible } from './StarCollectible';

// Animated hopping bunny
const HoppingBunny: React.FC<{ pos: [number, number, number]; color: string; seed: number }> = ({ pos, color, seed }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime() * 3 + seed;
    const hop = Math.max(0, Math.sin(t));
    groupRef.current.position.y = pos[1] + hop * 0.35;
    groupRef.current.rotation.x = hop * 0.15;
  });

  return (
    <group ref={groupRef} position={pos}>
      {/* Body */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <sphereGeometry args={[0.26, 10, 10]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Head */}
      <mesh position={[0.18, 0.38, 0]} castShadow>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Bunny Ears */}
      <mesh position={[0.16, 0.58, -0.07]} rotation={[0, 0, -0.15]} castShadow>
        <capsuleGeometry args={[0.04, 0.22, 6, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.16, 0.58, 0.07]} rotation={[0, 0, -0.15]} castShadow>
        <capsuleGeometry args={[0.04, 0.22, 6, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Inner Pink Ears */}
      <mesh position={[0.17, 0.58, -0.07]} rotation={[0, 0, -0.15]}>
        <capsuleGeometry args={[0.02, 0.16, 4, 6]} />
        <meshStandardMaterial color="#FFB5A7" />
      </mesh>
      <mesh position={[0.17, 0.58, 0.07]} rotation={[0, 0, -0.15]}>
        <capsuleGeometry args={[0.02, 0.16, 4, 6]} />
        <meshStandardMaterial color="#FFB5A7" />
      </mesh>
      {/* Fluffy Tail */}
      <mesh position={[-0.22, 0.22, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
};

// Fluffy Cloud Sheep
const FluffySheep: React.FC<{ pos: [number, number, number]; seed: number }> = ({ pos, seed }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime() * 1.5 + seed;
    groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.2;
    groupRef.current.position.y = pos[1] + Math.sin(t) * 0.03;
  });

  return (
    <group ref={groupRef} position={pos}>
      {/* Fluffy Wool Body (Multi-sphere cloud shape) */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <sphereGeometry args={[0.62, 12, 12]} />
        <meshStandardMaterial color="#F8F9FA" roughness={0.9} />
      </mesh>
      <mesh position={[-0.25, 0.68, 0.15]} castShadow>
        <sphereGeometry args={[0.42, 10, 10]} />
        <meshStandardMaterial color="#F8F9FA" roughness={0.9} />
      </mesh>
      <mesh position={[0.25, 0.68, -0.15]} castShadow>
        <sphereGeometry args={[0.42, 10, 10]} />
        <meshStandardMaterial color="#F8F9FA" roughness={0.9} />
      </mesh>
      {/* Dark Cute Head */}
      <mesh position={[0.55, 0.65, 0]} castShadow>
        <sphereGeometry args={[0.26, 10, 10]} />
        <meshStandardMaterial color="#4A4E69" roughness={0.7} />
      </mesh>
      {/* Floppy Ears */}
      <mesh position={[0.5, 0.72, 0.22]} rotation={[0.4, 0, 0]}>
        <capsuleGeometry args={[0.05, 0.18, 4, 6]} />
        <meshStandardMaterial color="#4A4E69" />
      </mesh>
      <mesh position={[0.5, 0.72, -0.22]} rotation={[-0.4, 0, 0]}>
        <capsuleGeometry args={[0.05, 0.18, 4, 6]} />
        <meshStandardMaterial color="#4A4E69" />
      </mesh>
      {/* Golden Bell on collar */}
      <mesh position={[0.42, 0.45, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#FFD166" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Legs */}
      {[
        [-0.25, 0.2, 0.25],
        [-0.25, 0.2, -0.25],
        [0.25, 0.2, 0.25],
        [0.25, 0.2, -0.25],
      ].map((lp, idx) => (
        <mesh key={idx} position={lp as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.45, 8]} />
          <meshStandardMaterial color="#343A40" />
        </mesh>
      ))}
    </group>
  );
};

// Fruit Tree with harvestable fruits
const FruitTree: React.FC<{ pos: [number, number, number]; fruitColor: string; fruitType: string }> = ({
  pos,
  fruitColor,
  fruitType,
}) => {
  return (
    <group position={pos}>
      {/* Trunk */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.45, 2.8, 8]} />
        <meshStandardMaterial color="#7F4F24" roughness={0.9} />
      </mesh>
      {/* Leaves Tiers */}
      <mesh position={[0, 3.0, 0]} castShadow>
        <sphereGeometry args={[1.6, 12, 12]} />
        <meshStandardMaterial color="#588157" roughness={0.6} />
      </mesh>
      <mesh position={[0, 3.8, 0]} castShadow>
        <sphereGeometry args={[1.1, 10, 10]} />
        <meshStandardMaterial color="#3A5A40" roughness={0.6} />
      </mesh>
      {/* Sweet Hanging Fruits */}
      {[
        [0.7, 2.8, 0.6],
        [-0.8, 2.7, 0.4],
        [0.3, 3.2, -0.9],
        [-0.5, 3.3, -0.6],
        [0.8, 2.5, -0.5],
      ].map((fp, idx) => (
        <mesh key={idx} position={fp as [number, number, number]} castShadow>
          <sphereGeometry args={[0.16, 8, 8]} />
          <meshStandardMaterial color={fruitColor} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
};

export const PettingFarm: React.FC = () => {
  const farmCenter: [number, number, number] = [-35, 0, -3];

  useFrame(() => {
    const playerPos = gameStore.getState().playerPos;

    // Check interaction with Bunny Pen
    const distBunny = Math.hypot(playerPos[0] - (-38), playerPos[2] - (-2));
    const distSheep = Math.hypot(playerPos[0] - (-31), playerPos[2] - (-5));
    const distFarmer = Math.hypot(playerPos[0] - (-28), playerPos[2] - 1);

    if (distBunny < 4.0) {
      gameStore.setNearbyInteractable({
        id: 'farm_bunny',
        title: 'Kandang Kelinci Ceria 🐰🥕',
        prompt: 'Tekan [E] untuk Beri Makan Wortel Segar! ✨',
      });
    } else if (distSheep < 4.0) {
      gameStore.setNearbyInteractable({
        id: 'farm_sheep',
        title: 'Domba Awan Lembut 🐑🌾',
        prompt: 'Tekan [E] untuk Mengelus Domba Lembut! 💖',
      });
    } else if (distFarmer < 3.8) {
      gameStore.setNearbyInteractable({
        id: 'pak_tani',
        title: 'Pak Tani Ceria 👨‍🌾',
        prompt: 'Tekan [E] untuk Bicara dengan Pak Tani! 🌾',
      });
    } else {
      const cur = gameStore.getState().nearbyInteractable;
      if (cur?.id === 'farm_bunny' || cur?.id === 'farm_sheep' || cur?.id === 'pak_tani') {
        gameStore.setNearbyInteractable(null);
      }
    }
  });

  return (
    <group position={farmCenter}>
      {/* Farm Gate & Signboard */}
      <group position={[12, 0, 0]}>
        <mesh position={[0, 1.8, -2.5]} castShadow>
          <cylinderGeometry args={[0.15, 0.18, 3.6, 8]} />
          <meshStandardMaterial color="#9C6644" />
        </mesh>
        <mesh position={[0, 1.8, 2.5]} castShadow>
          <cylinderGeometry args={[0.15, 0.18, 3.6, 8]} />
          <meshStandardMaterial color="#9C6644" />
        </mesh>
        {/* Arch crossbeam */}
        <mesh position={[0, 3.4, 0]}>
          <boxGeometry args={[0.3, 0.4, 5.4]} />
          <meshStandardMaterial color="#B08968" />
        </mesh>
        {/* Billboard Sign */}
        <Billboard position={[0, 3.8, 0]}>
          <Text fontSize={0.34} color="#582F0E" outlineWidth={0.04} outlineColor="#FFF" anchorY="middle">
            🌾 TAMAN HEWAN & KEBUN CERIA 🐑
          </Text>
        </Billboard>
      </group>

      {/* Rustic Wooden Fence along Farm boundary */}
      {[-16, -10, -4, 2, 8].map((fx, idx) => (
        <group key={`fence_n_${idx}`} position={[fx, 0, -9]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.9, 6]} />
            <meshStandardMaterial color="#B08968" />
          </mesh>
          <mesh position={[1.5, 0.6, 0]}>
            <boxGeometry args={[3.2, 0.1, 0.05]} />
            <meshStandardMaterial color="#CDB4DB" />
          </mesh>
          <mesh position={[1.5, 0.3, 0]}>
            <boxGeometry args={[3.2, 0.1, 0.05]} />
            <meshStandardMaterial color="#CDB4DB" />
          </mesh>
        </group>
      ))}

      {/* --- 1. KANDANG KELINCI (BUNNY PEN & CARROT PATCH) --- */}
      <group position={[-3, 0, 1]}>
        {/* Dirt Bed with Carrots */}
        <mesh position={[0, 0.05, 0]} receiveShadow>
          <boxGeometry args={[6.5, 0.1, 5.0]} />
          <meshStandardMaterial color="#6B4226" roughness={0.9} />
        </mesh>
        {/* Carrots in garden */}
        {[
          [-1.8, 0],
          [-0.8, -1.2],
          [-0.6, 1.0],
          [0.8, -0.6],
          [1.5, 0.8],
        ].map(([cx, cz], idx) => (
          <group key={idx} position={[cx, 0.1, cz]}>
            <mesh position={[0, 0.15, 0]}>
              <coneGeometry args={[0.1, 0.3, 8]} />
              <meshStandardMaterial color="#FF7B00" />
            </mesh>
            {/* Green carrot leaves */}
            <mesh position={[0, 0.32, 0]}>
              <coneGeometry args={[0.15, 0.25, 6]} />
              <meshStandardMaterial color="#38B000" />
            </mesh>
          </group>
        ))}

        {/* 3 Playful Bunnies */}
        <HoppingBunny pos={[-1.2, 0.1, 0.5]} color="#FFFFFF" seed={0} />
        <HoppingBunny pos={[0.5, 0.1, -1.0]} color="#FDE2E4" seed={1.5} />
        <HoppingBunny pos={[1.6, 0.1, 0.2]} color="#E2ECE9" seed={3.2} />

        {/* Bunny Hutch Wooden Shed */}
        <group position={[-2.4, 0, -1.6]}>
          <mesh position={[0, 0.8, 0]} castShadow>
            <boxGeometry args={[1.6, 1.4, 1.4]} />
            <meshStandardMaterial color="#D4A373" />
          </mesh>
          <mesh position={[0, 1.7, 0]} rotation={[0, 0, 0]}>
            <coneGeometry args={[1.3, 0.8, 4]} />
            <meshStandardMaterial color="#E07A5F" />
          </mesh>
          <mesh position={[0.5, 0.5, 0.71]}>
            <boxGeometry args={[0.5, 0.7, 0.02]} />
            <meshStandardMaterial color="#2B2D42" />
          </mesh>
        </group>
      </group>

      {/* --- 2. DOMBA LEMBUT & KANDANG (SHEEP MEADOW) --- */}
      <group position={[4, 0, -2]}>
        <FluffySheep pos={[-1.5, 0.1, 0]} seed={0.5} />
        <FluffySheep pos={[1.2, 0.1, 1.2]} seed={2.8} />

        {/* Hay bale stack */}
        <group position={[3.2, 0.35, -2]}>
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.6, 0.6, 0.7, 12]} />
            <meshStandardMaterial color="#E9C46A" roughness={0.8} />
          </mesh>
          <mesh position={[0.7, 0, 0]} castShadow>
            <cylinderGeometry args={[0.6, 0.6, 0.7, 12]} />
            <meshStandardMaterial color="#E9C46A" roughness={0.8} />
          </mesh>
          <mesh position={[0.35, 0.65, 0]} castShadow>
            <cylinderGeometry args={[0.6, 0.6, 0.7, 12]} />
            <meshStandardMaterial color="#F4A261" roughness={0.8} />
          </mesh>
        </group>
      </group>

      {/* --- 3. KUDA PONI MINI (MINI PONY STABLE) --- */}
      <group position={[-12, 0, -3]}>
        {/* Stable Shelter */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[4.5, 2.8, 3.8]} />
          <meshStandardMaterial color="#9C6644" />
        </mesh>
        <mesh position={[0, 3.1, 0]}>
          <boxGeometry args={[4.9, 0.4, 4.2]} />
          <meshStandardMaterial color="#E76F51" />
        </mesh>
        {/* Open Entrance */}
        <mesh position={[0, 1.1, 1.91]}>
          <boxGeometry args={[2.0, 2.0, 0.05]} />
          <meshStandardMaterial color="#222" />
        </mesh>

        {/* Cute Caramel Pony */}
        <group position={[0, 0.1, 0.6]} rotation={[0, Math.PI / 6, 0]}>
          {/* Pony Body */}
          <mesh position={[0, 0.8, 0]} castShadow>
            <capsuleGeometry args={[0.38, 0.7, 6, 10]} />
            <meshStandardMaterial color="#B08968" roughness={0.7} />
          </mesh>
          {/* Neck & Head */}
          <mesh position={[0.42, 1.25, 0]} rotation={[0, 0, -0.4]} castShadow>
            <cylinderGeometry args={[0.2, 0.28, 0.7, 8]} />
            <meshStandardMaterial color="#B08968" />
          </mesh>
          <mesh position={[0.65, 1.45, 0]} castShadow>
            <sphereGeometry args={[0.24, 8, 8]} />
            <meshStandardMaterial color="#B08968" />
          </mesh>
          {/* Pink Cute Mane */}
          <mesh position={[0.35, 1.45, 0]}>
            <boxGeometry args={[0.15, 0.5, 0.08]} />
            <meshStandardMaterial color="#FFB5A7" />
          </mesh>
          {/* Pink Saddle */}
          <mesh position={[0, 0.95, 0]}>
            <boxGeometry args={[0.45, 0.1, 0.55]} />
            <meshStandardMaterial color="#FF69B4" />
          </mesh>
          {/* Legs */}
          {[
            [-0.25, 0.35, 0.22],
            [-0.25, 0.35, -0.22],
            [0.25, 0.35, 0.22],
            [0.25, 0.35, -0.22],
          ].map((lp, idx) => (
            <mesh key={idx} position={lp as [number, number, number]} castShadow>
              <cylinderGeometry args={[0.07, 0.07, 0.7, 6]} />
              <meshStandardMaterial color="#7F4F24" />
            </mesh>
          ))}
        </group>
      </group>

      {/* --- 4. ORCHARD & FRUIT TREES --- */}
      <FruitTree pos={[-8, 0, 6]} fruitColor="#E63946" fruitType="apple" />
      <FruitTree pos={[-14, 0, 5]} fruitColor="#FF9F1C" fruitType="orange" />
      <FruitTree pos={[-5, 0, -7]} fruitColor="#E63946" fruitType="apple" />

      {/* --- 5. PAK TANI CERIA NPC --- */}
      <group position={[7, 0, 4]}>
        {/* Pak Tani Model */}
        {/* Body (Blue Overalls) */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.28, 0.7, 10]} />
          <meshStandardMaterial color="#1D3557" />
        </mesh>
        {/* Head & Straw Hat */}
        <mesh position={[0, 1.25, 0]} castShadow>
          <sphereGeometry args={[0.22, 10, 10]} />
          <meshStandardMaterial color="#FFD1B3" />
        </mesh>
        {/* Smiling Eyes */}
        <mesh position={[0.08, 1.26, 0.18]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <mesh position={[-0.08, 1.26, 0.18]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        {/* Straw Hat */}
        <mesh position={[0, 1.38, 0]}>
          <cylinderGeometry args={[0.48, 0.48, 0.06, 16]} />
          <meshStandardMaterial color="#E9C46A" />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.25, 0.28, 0.22, 12]} />
          <meshStandardMaterial color="#E9C46A" />
        </mesh>
        {/* Friendly Name Badge */}
        <Billboard position={[0, 2.05, 0]}>
          <Text fontSize={0.24} color="#1D3557" outlineWidth={0.03} outlineColor="#FFF" anchorY="middle">
            👨‍🌾 Pak Tani Ceria
          </Text>
        </Billboard>
      </group>

      {/* --- 6. CHECKPOINT 4 (Taman Hewan) --- */}
      <CheckpointFlag index={4} position={[1, 0.3, 1]} />

      {/* --- 7. STARS TO COLLECT --- */}
      <StarCollectible id="star_farm_1" position={[-3, 1.2, 1]} color="#FFD166" />
      <StarCollectible id="star_farm_2" position={[4, 1.2, -2]} color="#06D6A0" />
      <StarCollectible id="star_farm_3" position={[-12, 1.6, 2]} color="#FF70A6" />
    </group>
  );
};
