import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, gameStore } from '../../../state/useGameStore';

interface CheckpointFlagProps {
  index: number;
  position: [number, number, number];
}

export const CheckpointFlag: React.FC<CheckpointFlagProps> = ({ index, position }) => {
  const currentCheckpoint = useGameStore((s) => s.checkpointIndex);
  const isReached = currentCheckpoint >= index;
  const flagRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    // Check distance to player
    const playerPos = gameStore.getState().playerPos;
    const distSq =
      Math.pow(playerPos[0] - position[0], 2) +
      Math.pow(playerPos[1] - position[1], 2) +
      Math.pow(playerPos[2] - position[2], 2);

    if (distSq < 10.0 && currentCheckpoint < index) {
      gameStore.reachCheckpoint(index);
    }

    if (flagRef.current) {
      const time = state.clock.getElapsedTime();
      flagRef.current.rotation.y = Math.sin(time * 4) * 0.2;
    }
  });

  return (
    <group position={position}>
      {/* Platform Pad */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[1.5, 1.6, 0.2, 16]} />
        <meshStandardMaterial
          color={isReached ? '#06D6A0' : '#E0E1DD'}
          roughness={0.4}
          emissive={isReached ? '#06D6A0' : '#000000'}
          emissiveIntensity={isReached ? 0.4 : 0}
        />
      </mesh>

      {/* Flagpole */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 3, 12]} />
        <meshStandardMaterial color="#FFFFFF" metalness={0.5} roughness={0.2} />
      </mesh>

      {/* Flag Cloth */}
      <mesh ref={flagRef} position={[0.45, 2.4, 0]}>
        <planeGeometry args={[0.9, 0.6]} />
        <meshStandardMaterial
          color={isReached ? '#FF007F' : '#FFD166'}
          side={THREE.DoubleSide}
          roughness={0.3}
        />
      </mesh>

      {/* Top Gold Ball */}
      <mesh position={[0, 3.05, 0]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
};
