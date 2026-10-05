import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, gameStore } from '../../../state/useGameStore';

export const ScooterVehicle: React.FC = () => {
  const isRidingScooter = useGameStore((s) => s.isRidingScooter);
  const scooterPos = useGameStore((s) => s.scooterPos);
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const groupRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (isRidingScooter || !groupRef.current) {
      const current = gameStore.getState().nearbyInteractable;
      if (current?.id === 'scooter') {
        gameStore.setNearbyInteractable(null);
      }
      return;
    }
    const time = state.clock.getElapsedTime();

    // Gentle floating highlight aura for parked scooter
    const playerPos = gameStore.getState().playerPos;
    const dx = playerPos[0] - scooterPos[0];
    const dy = playerPos[1] - scooterPos[1];
    const dz = playerPos[2] - scooterPos[2];
    const distSq = dx * dx + dy * dy + dz * dz;

    // Check proximity to trigger interactable prompt
    if (distSq < 6.5) {
      gameStore.setNearbyInteractable({
        id: 'scooter',
        title: 'Skuter Pink Khaulah 🛴',
        prompt: 'Tekan [E] atau Tombol Skuter untuk Mengendarai! 💨✨',
      });
    } else {
      const current = gameStore.getState().nearbyInteractable;
      if (current?.id === 'scooter') {
        gameStore.setNearbyInteractable(null);
      }
    }
  });

  // If Khaulah is currently riding, the parked model is hidden (rendered on player)
  if (isRidingScooter) return null;

  const isNight = timeOfDay === 'malam';
  const isSunset = timeOfDay === 'sore';
  const isSubuh = timeOfDay === 'subuh';
  const isDark = isNight || isSunset || isSubuh;

  return (
    <group ref={groupRef} position={scooterPos} rotation={[0, Math.PI / 4, 0]}>
      {/* Interactive Floating Badge above parked scooter */}
      <Billboard position={[0, 1.45, 0]}>
        <Text
          fontSize={0.22}
          color="#FF007F"
          outlineWidth={0.03}
          outlineColor="#FFFFFF"
          anchorY="middle"
        >
          🛴 Skuter Pink Khaulah
        </Text>
      </Billboard>

      {/* Pulsing ground highlight ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.6, 0.75, 24]} />
        <meshBasicMaterial color="#FF69B4" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* --- SCOOTER MODEL BODY --- */}
      {/* 1. Foot Deck */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.06, 0.95]} />
        <meshStandardMaterial color="#FF2A85" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Deck Grip Tape (Yellow Sparkle) */}
      <mesh position={[0, 0.155, 0]}>
        <planeGeometry args={[0.22, 0.8]} />
        <meshStandardMaterial color="#FFD166" roughness={0.6} />
      </mesh>

      {/* 2. Rear Wheel */}
      <group position={[0, 0.12, 0.42]} rotation={[0, 0, Math.PI / 2]}>
        {/* Tire */}
        <mesh castShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
          <meshStandardMaterial color="#2B2D42" roughness={0.8} />
        </mesh>
        {/* Rim */}
        <mesh>
          <cylinderGeometry args={[0.07, 0.07, 0.085, 16]} />
          <meshStandardMaterial color="#06D6A0" metalness={0.5} roughness={0.2} />
        </mesh>
      </group>

      {/* 3. Front Wheel & Fork */}
      <group position={[0, 0.12, -0.42]} rotation={[0, 0, Math.PI / 2]}>
        {/* Tire */}
        <mesh castShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
          <meshStandardMaterial color="#2B2D42" roughness={0.8} />
        </mesh>
        {/* Rim */}
        <mesh>
          <cylinderGeometry args={[0.07, 0.07, 0.085, 16]} />
          <meshStandardMaterial color="#06D6A0" metalness={0.5} roughness={0.2} />
        </mesh>
      </group>

      {/* 4. Steering Column (Stem) */}
      <group position={[0, 0.12, -0.38]}>
        {/* Lower fork */}
        <mesh position={[0, 0.2, 0]} rotation={[0.12, 0, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.03, 0.4, 12]} />
          <meshStandardMaterial color="#FF2A85" metalness={0.3} roughness={0.3} />
        </mesh>
        {/* Upper stem tube */}
        <mesh position={[0, 0.55, -0.04]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.45, 12]} />
          <meshStandardMaterial color="#FFFFFF" metalness={0.6} roughness={0.2} />
        </mesh>

        {/* 5. Handlebars */}
        <group position={[0, 0.78, -0.04]}>
          {/* Crossbar */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.55, 12]} />
            <meshStandardMaterial color="#06D6A0" roughness={0.4} />
          </mesh>
          {/* Left Grip */}
          <mesh position={[-0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.1, 10]} />
            <meshStandardMaterial color="#FF69B4" roughness={0.5} />
          </mesh>
          {/* Right Grip */}
          <mesh position={[0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.1, 10]} />
            <meshStandardMaterial color="#FF69B4" roughness={0.5} />
          </mesh>

          {/* Golden Bell on left bar */}
          <group position={[-0.14, 0.04, 0.02]}>
            <mesh castShadow>
              <sphereGeometry args={[0.032, 12, 12]} />
              <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>

          {/* Cute Little Basket in Front */}
          <group position={[0, -0.08, -0.09]}>
            <mesh castShadow>
              <boxGeometry args={[0.18, 0.12, 0.12]} />
              <meshStandardMaterial color="#FFF1E6" roughness={0.6} />
            </mesh>
            {/* Flower decoration on basket */}
            <mesh position={[0, 0, -0.065]}>
              <circleGeometry args={[0.035, 8]} />
              <meshStandardMaterial color="#FF007F" />
            </mesh>
          </group>

          {/* Round Headlight */}
          <group position={[0, 0.02, -0.06]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.035, 0.035, 0.03, 12]} />
              <meshStandardMaterial color="#333333" />
            </mesh>
            <mesh position={[0, 0, -0.016]}>
              <circleGeometry args={[0.032, 12]} />
              <meshStandardMaterial
                color={isDark ? '#FFF9A6' : '#FFFFFF'}
                emissive={isDark ? '#FFF9A6' : '#444444'}
                emissiveIntensity={isNight ? 1.0 : isDark ? 0.7 : 0.2}
              />
            </mesh>
            {isDark && (
              <pointLight color="#FFF9A6" intensity={isNight ? 1.2 : 0.8} distance={3.5} position={[0, 0, -0.1]} />
            )}
          </group>
        </group>
      </group>

      {/* Kickstand resting on ground */}
      <mesh position={[0.14, 0.06, 0.1]} rotation={[0, 0, -0.6]}>
        <cylinderGeometry args={[0.012, 0.012, 0.14, 8]} />
        <meshStandardMaterial color="#555555" metalness={0.8} />
      </mesh>
    </group>
  );
};
