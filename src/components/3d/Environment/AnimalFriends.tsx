import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gameStore } from '../../../state/useGameStore';
import { soundManager } from '../../../sound/audioManager';

interface AnimalNPCProps {
  type: 'duck' | 'cat' | 'bunny' | 'panda';
  position: [number, number, number];
  name: string;
  dialogue: string;
}

const SingleAnimal: React.FC<AnimalNPCProps> = ({ type, position, name, dialogue }) => {
  const groupRef = useRef<THREE.Group>(null);
  const isJumpingTimer = useRef(0);
  const cooldownRef = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    if (cooldownRef.current > 0) {
      cooldownRef.current -= delta;
    }
    if (isJumpingTimer.current > 0) {
      isJumpingTimer.current -= delta;
    }

    // Distance to player
    const playerPos = gameStore.getState().playerPos;
    const distSq =
      Math.pow(playerPos[0] - position[0], 2) +
      Math.pow(playerPos[1] - position[1], 2) +
      Math.pow(playerPos[2] - position[2], 2);

    if (distSq < 9.0) {
      // Look at player smoothly
      groupRef.current.lookAt(playerPos[0], position[1], playerPos[2]);

      // Greet if not on cooldown
      if (cooldownRef.current <= 0) {
        soundManager.playAnimalSound(type);
        gameStore.setMessage(`${name}: "${dialogue}" 💕`);
        cooldownRef.current = 6; // 6s cooldown before re-greeting
        isJumpingTimer.current = 3.0; // Happy hop for 3 seconds
      }
    }

    // Gentle breathing or happy excited hopping when greeted
    const isExcited = isJumpingTimer.current > 0;
    groupRef.current.position.y = position[1] + (isExcited ? Math.abs(Math.sin(time * 8)) * 0.18 : Math.sin(time * 2) * 0.04);
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 1. DUCK */}
      {type === 'duck' && (
        <group scale={0.7}>
          {/* Yellow Body */}
          <mesh position={[0, 0.4, 0]} castShadow>
            <sphereGeometry args={[0.42, 16, 16]} />
            <meshStandardMaterial color="#FFD166" roughness={0.3} />
          </mesh>
          {/* Head */}
          <mesh position={[0, 0.75, 0.2]} castShadow>
            <sphereGeometry args={[0.28, 16, 16]} />
            <meshStandardMaterial color="#FFD166" roughness={0.3} />
          </mesh>
          {/* Orange Beak */}
          <mesh position={[0, 0.72, 0.5]}>
            <boxGeometry args={[0.2, 0.1, 0.25]} />
            <meshStandardMaterial color="#FF6B35" />
          </mesh>
          {/* Eyes */}
          <mesh position={[-0.12, 0.8, 0.4]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          <mesh position={[0.12, 0.8, 0.4]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        </group>
      )}

      {/* 2. CAT */}
      {type === 'cat' && (
        <group scale={0.7}>
          {/* White & Orange Body */}
          <mesh position={[0, 0.35, 0]} castShadow>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color="#F77F00" roughness={0.4} />
          </mesh>
          {/* Head */}
          <mesh position={[0, 0.65, 0.2]} castShadow>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color="#F77F00" roughness={0.4} />
          </mesh>
          {/* Ears */}
          <mesh position={[-0.15, 0.92, 0.2]} rotation={[0, 0, -0.2]}>
            <coneGeometry args={[0.1, 0.2, 4]} />
            <meshStandardMaterial color="#FCBF49" />
          </mesh>
          <mesh position={[0.15, 0.92, 0.2]} rotation={[0, 0, 0.2]}>
            <coneGeometry args={[0.1, 0.2, 4]} />
            <meshStandardMaterial color="#FCBF49" />
          </mesh>
          {/* Eyes */}
          <mesh position={[-0.1, 0.7, 0.45]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshBasicMaterial color="#2B9348" />
          </mesh>
          <mesh position={[0.1, 0.7, 0.45]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshBasicMaterial color="#2B9348" />
          </mesh>
        </group>
      )}

      {/* 3. BUNNY */}
      {type === 'bunny' && (
        <group scale={0.7}>
          {/* White Body */}
          <mesh position={[0, 0.35, 0]} castShadow>
            <sphereGeometry args={[0.38, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
          </mesh>
          {/* Head */}
          <mesh position={[0, 0.68, 0.18]} castShadow>
            <sphereGeometry args={[0.28, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
          </mesh>
          {/* Long Ears */}
          <mesh position={[-0.12, 1.05, 0.18]}>
            <cylinderGeometry args={[0.05, 0.07, 0.4, 8]} />
            <meshStandardMaterial color="#FFB5A7" />
          </mesh>
          <mesh position={[0.12, 1.05, 0.18]}>
            <cylinderGeometry args={[0.05, 0.07, 0.4, 8]} />
            <meshStandardMaterial color="#FFB5A7" />
          </mesh>
          {/* Pink Nose */}
          <mesh position={[0, 0.65, 0.44]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshStandardMaterial color="#F43F5E" />
          </mesh>
        </group>
      )}

      {/* 4. PANDA */}
      {type === 'panda' && (
        <group scale={0.75}>
          {/* Body */}
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[0.6, 0.6, 0.55]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
          </mesh>
          {/* Black Arms */}
          <mesh position={[-0.38, 0.5, 0]}>
            <boxGeometry args={[0.2, 0.5, 0.25]} />
            <meshStandardMaterial color="#1E1E24" />
          </mesh>
          <mesh position={[0.38, 0.5, 0]}>
            <boxGeometry args={[0.2, 0.5, 0.25]} />
            <meshStandardMaterial color="#1E1E24" />
          </mesh>
          {/* Head */}
          <mesh position={[0, 0.95, 0.1]} castShadow>
            <boxGeometry args={[0.55, 0.48, 0.5]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          {/* Black Ears */}
          <mesh position={[-0.26, 1.25, 0.05]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial color="#1E1E24" />
          </mesh>
          <mesh position={[0.26, 1.25, 0.05]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial color="#1E1E24" />
          </mesh>
          {/* Eye patches */}
          <mesh position={[-0.14, 0.98, 0.36]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#1E1E24" />
          </mesh>
          <mesh position={[0.14, 0.98, 0.36]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#1E1E24" />
          </mesh>
        </group>
      )}
    </group>
  );
};

export const AnimalFriends: React.FC = () => {
  return (
    <group>
      {/* Bebek di tepi danau kecil */}
      <SingleAnimal
        type="duck"
        position={[6, 0.3, -5]}
        name="Bebek Kuki"
        dialogue="Kweeeek! Halo Khaulah cilik! Hari ini cerah sekali! 🦆"
      />

      {/* Kucing di bawah pohon */}
      <SingleAnimal
        type="cat"
        position={[-7, 0.3, 4]}
        name="Kucing Tomi"
        dialogue="Miawww! Khaulah hebat sudah melompat tinggi! 🐾"
      />

      {/* Kelinci di kebun wortel */}
      <SingleAnimal
        type="bunny"
        position={[-6, 0.3, -6]}
        name="Kelinci Cici"
        dialogue="Hoppp! Ayo balapan lompat ke trampolin, Khaulah! 🥕"
      />

      {/* Panda di dekat jalur obby */}
      <SingleAnimal
        type="panda"
        position={[8, 0.3, 6]}
        name="Panda Bobo"
        dialogue="Hai Khaulah! Semangat lewati jembatan pelangi ya! 🎋"
      />
    </group>
  );
};
