import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, gameStore, SpawnedMagicItem } from '../../../state/useGameStore';

// Individual 3D Balloon with dangling string and gentle floating bob
const MagicBalloon: React.FC<{ item: SpawnedMagicItem; index: number }> = ({ item, index }) => {
  const meshRef = useRef<THREE.Group>(null);
  const color = item.color || '#FF69B4';

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    // Gentle bobbing and sway
    meshRef.current.position.y = item.position[1] + Math.sin(t * 1.8 + index * 0.8) * 0.22;
    meshRef.current.position.x = item.position[0] + Math.sin(t * 0.9 + index * 1.1) * 0.08;
    meshRef.current.rotation.z = Math.sin(t * 1.2 + index) * 0.08;

    // Check if player is close to pop the balloon
    const pPos = gameStore.getState().playerPos;
    const dx = pPos[0] - meshRef.current.position.x;
    const dy = pPos[1] - meshRef.current.position.y;
    const dz = pPos[2] - item.position[2];
    const distSq = dx * dx + dy * dy + dz * dz;

    if (distSq < 1.0) {
      gameStore.removeSpawnedItem(item.id);
    }
  });

  return (
    <group ref={meshRef} position={[item.position[0], item.position[1], item.position[2]]} scale={item.scale || 1}>
      {/* Balloon Body */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.38, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.1} />
      </mesh>
      {/* Balloon Knot */}
      <mesh position={[0, -0.38, 0]}>
        <coneGeometry args={[0.07, 0.08, 10]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      {/* Dangling String */}
      <mesh position={[0, -0.68, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.55, 6]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
};

// Giant 2-Tier Birthday Cake with Candles & Glowing Flame
const MagicBirthdayCake: React.FC<{ item: SpawnedMagicItem }> = ({ item }) => {
  const flameRef = useRef<THREE.Mesh>(null);
  const candleLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (flameRef.current) {
      const s = 1.0 + Math.sin(t * 14) * 0.18;
      flameRef.current.scale.set(s, s * 1.2, s);
    }
    if (candleLightRef.current) {
      candleLightRef.current.intensity = 1.2 + Math.sin(t * 16) * 0.3;
    }
  });

  return (
    <group position={item.position} scale={item.scale || 1.2}>
      {/* Cake Plate */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <cylinderGeometry args={[0.82, 0.85, 0.06, 24]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.3} />
      </mesh>

      {/* Tier 1 (Bottom Cake - Strawberry Pink) */}
      <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.65, 0.65, 0.36, 24]} />
        <meshStandardMaterial color="#F472B6" roughness={0.4} />
      </mesh>
      {/* Cream Drip Layer Tier 1 */}
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.67, 0.67, 0.04, 24]} />
        <meshStandardMaterial color="#FFFBEB" roughness={0.3} />
      </mesh>

      {/* Tier 2 (Top Cake - Pastel Sky Blue) */}
      <mesh position={[0, 0.62, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.36, 24]} />
        <meshStandardMaterial color="#7DD3FC" roughness={0.4} />
      </mesh>
      {/* Cream Drip Layer Tier 2 */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.44, 0.44, 0.04, 24]} />
        <meshStandardMaterial color="#FFFBEB" roughness={0.3} />
      </mesh>

      {/* Strawberries on Top */}
      {[-0.2, 0, 0.2].map((x, i) => (
        <mesh key={i} position={[x, 0.86, 0.12 * (i % 2 === 0 ? 1 : -1)]}>
          <coneGeometry args={[0.06, 0.1, 10]} />
          <meshStandardMaterial color="#E11D48" roughness={0.3} />
        </mesh>
      ))}

      {/* Center Candle */}
      <mesh position={[0, 0.94, 0]}>
        <cylinderGeometry args={[0.032, 0.032, 0.24, 12]} />
        <meshStandardMaterial color="#FBBF24" roughness={0.3} />
      </mesh>
      {/* Candle Flame */}
      <mesh ref={flameRef} position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshBasicMaterial color="#FF9800" />
      </mesh>
      <pointLight ref={candleLightRef} position={[0, 1.15, 0]} color="#FFA726" distance={5} intensity={1.5} />
    </group>
  );
};

// Iridescent Soap Bubble
const MagicBubble: React.FC<{ item: SpawnedMagicItem; index: number }> = ({ item, index }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y = item.position[1] + (t * 0.45 + index * 0.2) % 4.0;
    meshRef.current.position.x = item.position[0] + Math.sin(t * 1.4 + index) * 0.15;
    meshRef.current.position.z = item.position[2] + Math.cos(t * 1.2 + index) * 0.15;

    // Check if player touches bubble
    const pPos = gameStore.getState().playerPos;
    const dx = pPos[0] - meshRef.current.position.x;
    const dy = pPos[1] - meshRef.current.position.y;
    const dz = pPos[2] - meshRef.current.position.z;
    if (dx * dx + dy * dy + dz * dz < 0.7) {
      gameStore.removeSpawnedItem(item.id);
    }
  });

  return (
    <group ref={meshRef} position={item.position} scale={item.scale || 0.5}>
      <mesh>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial
          color="#BAE6FD"
          roughness={0.05}
          metalness={0.2}
          transparent
          opacity={0.58}
          depthWrite={false}
        />
      </mesh>
      {/* Specular Glint */}
      <mesh position={[0.08, 0.12, 0.18]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.85} />
      </mesh>
    </group>
  );
};

// Spinning Golden Star
const MagicStar: React.FC<{ item: SpawnedMagicItem; index: number }> = ({ item, index }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = t * 2.2 + index;
    meshRef.current.position.y = item.position[1] + Math.sin(t * 2.5 + index) * 0.18;

    // Collect star on touch
    const pPos = gameStore.getState().playerPos;
    const dx = pPos[0] - meshRef.current.position.x;
    const dy = pPos[1] - meshRef.current.position.y;
    const dz = pPos[2] - item.position[2];
    if (dx * dx + dy * dy + dz * dz < 0.9) {
      gameStore.removeSpawnedItem(item.id);
    }
  });

  return (
    <group ref={meshRef} position={item.position} scale={item.scale || 0.8}>
      <mesh>
        <octahedronGeometry args={[0.26, 0]} />
        <meshStandardMaterial
          color="#FBBF24"
          emissive="#F59E0B"
          emissiveIntensity={0.65}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>
      <pointLight color="#FDE047" distance={3.5} intensity={1.2} />
    </group>
  );
};

export const MagicSpawner: React.FC = () => {
  const spawnedItems = useGameStore((s) => s.spawnedItems);

  if (!spawnedItems || spawnedItems.length === 0) return null;

  return (
    <group>
      {spawnedItems.map((item, idx) => {
        if (item.type === 'balloon') {
          return <MagicBalloon key={item.id} item={item} index={idx} />;
        }
        if (item.type === 'cake') {
          return <MagicBirthdayCake key={item.id} item={item} />;
        }
        if (item.type === 'bubble') {
          return <MagicBubble key={item.id} item={item} index={idx} />;
        }
        if (item.type === 'star') {
          return <MagicStar key={item.id} item={item} index={idx} />;
        }
        return null;
      })}
    </group>
  );
};
