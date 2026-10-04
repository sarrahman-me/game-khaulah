import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, gameStore } from '../../../state/useGameStore';

interface StarCollectibleProps {
  id: string;
  position: [number, number, number];
  color?: string;
  isBig?: boolean;
}

export const StarCollectible: React.FC<StarCollectibleProps> = ({
  id,
  position,
  color = '#FFD166',
  isBig = false,
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const collectedStarIds = useGameStore((s) => s.collectedStarIds);
  const isCollected = collectedStarIds.includes(id);

  useFrame((state) => {
    if (isCollected || !meshRef.current) return;
    const time = state.clock.getElapsedTime();

    // Floating bobbing, continuous spin & breathing pulse
    meshRef.current.position.y = position[1] + Math.sin(time * 3 + position[0]) * 0.18;
    meshRef.current.rotation.y = time * 2.2;
    meshRef.current.rotation.x = Math.sin(time * 1.5) * 0.12;

    const baseScale = isBig ? 1.4 : 0.8;
    const pulse = 1 + Math.sin(time * 4 + position[0]) * 0.08;
    meshRef.current.scale.set(baseScale * pulse, baseScale * pulse, baseScale * pulse);

    // Check distance to player's torso center (playerPos is feet, torso is ~0.8m above)
    const playerPos = gameStore.getState().playerPos;
    const distSq =
      Math.pow(playerPos[0] - position[0], 2) +
      Math.pow(playerPos[1] + 0.8 - position[1], 2) +
      Math.pow(playerPos[2] - position[2], 2);

    // If within reach, collect!
    if (distSq < (isBig ? 5.5 : 3.6)) {
      gameStore.collectStar(id);
    }
  });

  if (isCollected) return null;

  const scale = isBig ? 1.4 : 0.8;

  return (
    <group ref={meshRef} position={position} scale={scale}>
      {/* 3D Star / Diamond Geometry */}
      <mesh castShadow>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          roughness={0.15}
          metalness={0.4}
        />
      </mesh>

      {/* Sparkling Glow Core */}
      <mesh>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.8} />
      </mesh>

      {/* Mini outer aura ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.03, 8, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
    </group>
  );
};
