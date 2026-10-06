import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { gameStore } from '../../../state/useGameStore';
import { soundManager } from '../../../sound/audioManager';

interface AnimalNPCProps {
  type: 'duck' | 'cat' | 'bunny' | 'panda';
  position: [number, number, number];
  name: string;
  dialogue: string;
}

// Cute fluttering butterflies in the garden
const FlutteringButterflies: React.FC = () => {
  const butterflyGroup = useRef<THREE.Group>(null);
  const wing1 = useRef<THREE.Mesh>(null);
  const wing2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!butterflyGroup.current) return;
    const t = state.clock.getElapsedTime();
    // Path circling around the garden
    butterflyGroup.current.position.x = -4 + Math.cos(t * 0.8) * 3;
    butterflyGroup.current.position.z = 2 + Math.sin(t * 0.8) * 3;
    butterflyGroup.current.position.y = 1.2 + Math.sin(t * 2.5) * 0.35;
    butterflyGroup.current.rotation.y = -t * 0.8 + Math.PI / 2;

    // Fast wing flapping
    if (wing1.current && wing2.current) {
      wing1.current.rotation.y = Math.sin(t * 28) * 0.75;
      wing2.current.rotation.y = -Math.sin(t * 28) * 0.75;
    }
  });

  return (
    <group ref={butterflyGroup} position={[-4, 1.2, 2]}>
      {/* Butterfly Body */}
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, 0.12, 6]} />
        <meshBasicMaterial color="#1D2A44" />
      </mesh>
      {/* Left Wing */}
      <mesh ref={wing1} position={[-0.08, 0.02, 0]}>
        <circleGeometry args={[0.09, 8]} />
        <meshBasicMaterial color="#FF006E" side={THREE.DoubleSide} />
      </mesh>
      {/* Right Wing */}
      <mesh ref={wing2} position={[0.08, 0.02, 0]}>
        <circleGeometry args={[0.09, 8]} />
        <meshBasicMaterial color="#FFBE0B" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const SingleAnimal: React.FC<AnimalNPCProps> = ({ type, position, name, dialogue }) => {
  const groupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const isJumpingTimer = useRef(0);
  const cooldownRef = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    if (cooldownRef.current > 0) cooldownRef.current -= delta;
    if (isJumpingTimer.current > 0) isJumpingTimer.current -= delta;

    let currentPos = [...position];

    // Duck swimming motion in the river
    if (type === 'duck') {
      const swimX = Math.sin(time * 0.35) * 4.5;
      const swimDir = Math.cos(time * 0.35);
      currentPos[0] = swimX;
      currentPos[1] = 0.14 + Math.sin(time * 3.0) * 0.015;
      groupRef.current.position.set(currentPos[0], currentPos[1], currentPos[2]);
      groupRef.current.rotation.y = swimDir > 0 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      groupRef.current.position.set(position[0], position[1], position[2]);
    }

    // Distance to player
    const playerPos = gameStore.getState().playerPos;
    const distSq =
      Math.pow(playerPos[0] - currentPos[0], 2) +
      Math.pow(playerPos[1] - currentPos[1], 2) +
      Math.pow(playerPos[2] - currentPos[2], 2);

    if (distSq < 10.0) {
      if (type !== 'duck') {
        // Look at player smoothly
        groupRef.current.lookAt(playerPos[0], currentPos[1], playerPos[2]);
      }

      // Greet if not on cooldown
      if (cooldownRef.current <= 0) {
        soundManager.playAnimalSound(type);
        gameStore.setMessage(`${name}: "${dialogue}" 💕`);
        cooldownRef.current = 6;
        isJumpingTimer.current = 3.0;
      }
    }

    // Happy excited hopping or breathing
    const isExcited = isJumpingTimer.current > 0;
    if (type !== 'duck') {
      const hopY = isExcited ? Math.abs(Math.sin(time * 9)) * 0.28 : Math.sin(time * 2.2) * 0.04;
      groupRef.current.position.y = position[1] + hopY;
    }

    // Tail wagging for cat
    if (tailRef.current && type === 'cat') {
      tailRef.current.rotation.z = Math.sin(time * 6) * 0.45;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        soundManager.playAnimalSound(type);
        gameStore.setMessage(`${name}: "${dialogue}" 💕🐾`);
        isJumpingTimer.current = 3.0;
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
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
          {/* Water Ripple Ring beneath duck */}
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.45, 0.65, 16]} />
            <meshBasicMaterial color="#90E0EF" transparent opacity={0.6} />
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
          {/* Wagging Tail */}
          <mesh ref={tailRef} position={[0, 0.4, -0.4]} rotation={[-0.4, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.03, 0.5, 8]} />
            <meshStandardMaterial color="#FCBF49" />
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
          <mesh position={[-0.1, 1.05, 0.1]} rotation={[0, 0, -0.1]}>
            <capsuleGeometry args={[0.06, 0.35, 4, 8]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0.1, 1.05, 0.1]} rotation={[0, 0, 0.1]}>
            <capsuleGeometry args={[0.06, 0.35, 4, 8]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          {/* Pink Nose */}
          <mesh position={[0, 0.65, 0.45]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#FFB5A7" />
          </mesh>
          {/* Eyes */}
          <mesh position={[-0.1, 0.74, 0.4]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color="#333333" />
          </mesh>
          <mesh position={[0.1, 0.74, 0.4]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color="#333333" />
          </mesh>
        </group>
      )}

      {/* 4. PANDA */}
      {type === 'panda' && (
        <group scale={0.75}>
          {/* White/Black Body */}
          <mesh position={[0, 0.42, 0]} castShadow>
            <sphereGeometry args={[0.48, 16, 16]} />
            <meshStandardMaterial color="#F8F9FA" roughness={0.6} />
          </mesh>
          {/* Black Arms */}
          <mesh position={[-0.38, 0.42, 0.1]} rotation={[0.4, 0, -0.4]}>
            <cylinderGeometry args={[0.12, 0.1, 0.45, 10]} />
            <meshStandardMaterial color="#212529" />
          </mesh>
          <mesh position={[0.38, 0.42, 0.1]} rotation={[0.4, 0, 0.4]}>
            <cylinderGeometry args={[0.12, 0.1, 0.45, 10]} />
            <meshStandardMaterial color="#212529" />
          </mesh>
          {/* Bamboo Stalk held in hands */}
          <mesh position={[0, 0.48, 0.32]} rotation={[0, 0, 0.5]}>
            <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
            <meshStandardMaterial color="#55A630" />
          </mesh>
          {/* Head */}
          <mesh position={[0, 0.85, 0.15]} castShadow>
            <sphereGeometry args={[0.36, 16, 16]} />
            <meshStandardMaterial color="#F8F9FA" roughness={0.6} />
          </mesh>
          {/* Black Ears */}
          <mesh position={[-0.26, 1.15, 0.1]}>
            <sphereGeometry args={[0.11, 10, 10]} />
            <meshStandardMaterial color="#212529" />
          </mesh>
          <mesh position={[0.26, 1.15, 0.1]}>
            <sphereGeometry args={[0.11, 10, 10]} />
            <meshStandardMaterial color="#212529" />
          </mesh>
          {/* Black Eye Patches */}
          <mesh position={[-0.14, 0.9, 0.42]} rotation={[0, 0, 0.3]}>
            <circleGeometry args={[0.08, 12]} />
            <meshBasicMaterial color="#212529" />
          </mesh>
          <mesh position={[0.14, 0.9, 0.42]} rotation={[0, 0, -0.3]}>
            <circleGeometry args={[0.08, 12]} />
            <meshBasicMaterial color="#212529" />
          </mesh>
          <mesh position={[-0.14, 0.9, 0.43]}>
            <circleGeometry args={[0.03, 8]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0.14, 0.9, 0.43]}>
            <circleGeometry args={[0.03, 8]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>
      )}

      {/* Floating Billboard Name Tag */}
      <Billboard position={[0, 1.5, 0]}>
        <mesh>
          <planeGeometry args={[1.5, 0.4]} />
          <meshBasicMaterial color="#4A4E69" transparent opacity={0.8} />
        </mesh>
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.2}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>
      </Billboard>
    </group>
  );
};

export const AnimalFriends: React.FC = () => {
  return (
    <group>
      {/* Butterflies fluttering in the garden */}
      <FlutteringButterflies />

      {/* Bebek Kuki berenang santai di sungai desa */}
      <SingleAnimal
        type="duck"
        position={[0, 0.15, 18]}
        name="Bebek Kuki 🦆"
        dialogue="Kweeeek! Khaulah mau berangkat ke TK Karang Tengah ya? Selamat bermain! 🦆"
      />

      {/* Kucing Tomi bermain di halaman TK Karang Tengah */}
      <SingleAnimal
        type="cat"
        position={[-8, 0.25, 34]}
        name="Kucing Tomi 🐱"
        dialogue="Miawww! Kucing Tomi senang melihat Khaulah ceria di TK! 🐾"
      />

      {/* Kelinci Cici melompat di taman bunga rumah Khaulah */}
      <SingleAnimal
        type="bunny"
        position={[-6, 0.25, 4]}
        name="Kelinci Cici 🐰"
        dialogue="Hoppp! Ayo balapan lari melintasi jembatan kayu, Khaulah! 🥕"
      />

      {/* Panda Bobo asyik santai di dekat taman bermain TK */}
      <SingleAnimal
        type="panda"
        position={[7, 0.25, 46]}
        name="Panda Bobo 🐼"
        dialogue="Hai Khaulah! Semangat belajar dan main perosotan di TK Karang Tengah ya! 🎋"
      />
    </group>
  );
};
