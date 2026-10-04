import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, gameStore } from '../../../state/useGameStore';
import { CheckpointFlag } from './CheckpointFlag';
import { StarCollectible } from './StarCollectible';

// Animated Lake Water Surface
const ShimmeringLake: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y = 0.08 + Math.sin(t * 1.8) * 0.015;
  });

  return (
    <group position={[-28, 0, 20]}>
      {/* Lake Bed */}
      <mesh position={[0, -0.25, 0]}>
        <boxGeometry args={[18, 0.6, 14]} />
        <meshStandardMaterial color="#2E5077" roughness={0.9} />
      </mesh>
      {/* Lake Water Surface */}
      <mesh ref={meshRef} position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[17.5, 13.5]} />
        <meshStandardMaterial color="#4EA8DE" roughness={0.08} transparent opacity={0.85} metalness={0.15} />
      </mesh>
      {/* Lily pads */}
      {[
        [-5, -3],
        [-3, 4],
        [4, -2],
        [3, 3],
      ].map(([lx, lz], idx) => (
        <group key={idx} position={[lx, 0.12, lz]} rotation={[-Math.PI / 2, 0, idx]}>
          <circleGeometry args={[0.45, 12]} />
          <meshStandardMaterial color="#52B788" />
        </group>
      ))}
    </group>
  );
};

// Swan / Duck Pedal Boat Model
export const SwanBoatModel: React.FC<{ isRiding?: boolean }> = ({ isRiding }) => {
  return (
    <group>
      {/* Boat Hull */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[1.5, 0.5, 2.2]} />
        <meshStandardMaterial color="#FFF" roughness={0.4} />
      </mesh>
      {/* Boat Rim (Yellow/Pink Trim) */}
      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[1.6, 0.12, 2.3]} />
        <meshStandardMaterial color="#FFB703" />
      </mesh>
      {/* Swan Neck & Head */}
      <mesh position={[0, 0.95, -0.85]} rotation={[-0.2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 1.1, 10]} />
        <meshStandardMaterial color="#FFF" />
      </mesh>
      <mesh position={[0, 1.5, -0.95]} castShadow>
        <sphereGeometry args={[0.26, 10, 10]} />
        <meshStandardMaterial color="#FFF" />
      </mesh>
      {/* Orange Beak */}
      <mesh position={[0, 1.45, -1.25]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.12, 0.35, 8]} />
        <meshStandardMaterial color="#FB8500" />
      </mesh>
      {/* Cute Eyes */}
      <mesh position={[0.16, 1.55, -0.98]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[-0.16, 1.55, -0.98]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Passenger Seat */}
      <mesh position={[0, 0.45, 0.2]}>
        <boxGeometry args={[1.1, 0.3, 0.8]} />
        <meshStandardMaterial color="#FF69B4" />
      </mesh>
      {/* Steering Wheel */}
      <mesh position={[0, 0.7, -0.3]} rotation={[0.4, 0, 0]}>
        <torusGeometry args={[0.2, 0.04, 8, 16]} />
        <meshStandardMaterial color="#FFD166" />
      </mesh>
    </group>
  );
};

export const SunnyBeachLake: React.FC = () => {
  const activeRide = useGameStore((s) => s.activeRide);
  const boatBobRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    // Gentle bobbing when parked
    if (boatBobRef.current && activeRide !== 'boat') {
      const t = state.clock.getElapsedTime();
      boatBobRef.current.position.y = 0.15 + Math.sin(t * 2.2) * 0.05;
      boatBobRef.current.rotation.z = Math.sin(t * 1.5) * 0.03;
    }

    const playerPos = gameStore.getState().playerPos;
    // Boat Pier Proximity Check (Pier is at [-22, 0, 20])
    const distBoat = Math.hypot(playerPos[0] - (-23), playerPos[2] - 20);

    if (distBoat < 4.0 && activeRide === 'none') {
      gameStore.setNearbyInteractable({
        id: 'swan_boat',
        title: 'Perahu Bebek Kayuh 🦢⛵',
        prompt: 'Tekan [E] untuk Naik Perahu Bebek! 🌊✨',
      });
    } else {
      const cur = gameStore.getState().nearbyInteractable;
      if (cur?.id === 'swan_boat') {
        gameStore.setNearbyInteractable(null);
      }
    }
  });

  return (
    <group position={[-35, 0, 29]}>
      {/* Shimmering Lake Water */}
      <ShimmeringLake />

      {/* Wooden Pier / Dermaga */}
      <group position={[12, 0.25, -9]}>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.5, 0.2, 2.2]} />
          <meshStandardMaterial color="#8D5B4C" roughness={0.7} />
        </mesh>
        {/* Pier posts into water */}
        {[-1.8, 1.8].map((px, idx) => (
          <mesh key={idx} position={[px, -0.5, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 1.2, 6]} />
            <meshStandardMaterial color="#6F4E37" />
          </mesh>
        ))}
      </group>

      {/* Parked Swan Pedal Boat (Only rendered here if player is NOT riding it) */}
      {activeRide !== 'boat' && (
        <group ref={boatBobRef} position={[12, 0.15, -6]} rotation={[0, Math.PI / 2, 0]}>
          <SwanBoatModel />
          <Billboard position={[0, 2.1, 0]}>
            <Text fontSize={0.24} color="#0077B6" outlineWidth={0.03} outlineColor="#FFF" anchorY="middle">
              🦢 Perahu Bebek Kayuh
            </Text>
          </Billboard>
        </group>
      )}

      {/* --- GOLDEN SAND BEACH (PANTAI PASIR) --- */}
      <group position={[-5, 0, 3]}>
        {/* Soft Golden Sand Mound */}
        <mesh position={[0, 0.08, 0]} receiveShadow>
          <boxGeometry args={[20, 0.22, 16]} />
          <meshStandardMaterial color="#E9D8A6" roughness={0.9} />
        </mesh>

        {/* --- BEACH UMBRELLAS & LOUNGE CHAIRS --- */}
        {[
          { pos: [-4, 0.1, -3] as [number, number, number], color1: '#E63946', color2: '#FFF' },
          { pos: [3, 0.1, -2] as [number, number, number], color1: '#4EA8DE', color2: '#FFD166' },
        ].map((umb, idx) => (
          <group key={idx} position={umb.pos}>
            {/* Pole */}
            <mesh position={[0, 1.1, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 2.2, 8]} />
              <meshStandardMaterial color="#FFF" />
            </mesh>
            {/* Canopy */}
            <mesh position={[0, 2.2, 0]} castShadow>
              <coneGeometry args={[1.5, 0.7, 12]} />
              <meshStandardMaterial color={umb.color1} />
            </mesh>
            {/* Lounge Mat */}
            <mesh position={[0.7, 0.1, 0.5]} rotation={[-Math.PI / 2, 0, 0.3]}>
              <planeGeometry args={[0.9, 1.8]} />
              <meshStandardMaterial color={umb.color2} />
            </mesh>
          </group>
        ))}

        {/* Bouncing Beach Ball */}
        <mesh position={[0, 0.35, -1]} castShadow>
          <sphereGeometry args={[0.32, 12, 12]} />
          <meshStandardMaterial color="#FF007F" roughness={0.3} />
        </mesh>

        {/* --- GIANT SANDCASTLE (WALK-THROUGH) --- */}
        <group position={[-4, 0.1, 3]}>
          {/* Main Castle Walls */}
          <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.6, 1.8, 3.6]} />
            <meshStandardMaterial color="#DDA15E" roughness={0.8} />
          </mesh>
          {/* Open Archway Door to walk inside */}
          <mesh position={[0, 0.7, 1.81]}>
            <boxGeometry args={[1.2, 1.4, 0.05]} />
            <meshStandardMaterial color="#332" />
          </mesh>

          {/* 4 Corner Turret Towers */}
          {[
            [-1.8, 0, -1.8],
            [1.8, 0, -1.8],
            [-1.8, 0, 1.8],
            [1.8, 0, 1.8],
          ].map(([tx, ty, tz], idx) => (
            <group key={idx} position={[tx, ty, tz]}>
              <mesh position={[0, 1.2, 0]} castShadow>
                <cylinderGeometry args={[0.45, 0.5, 2.4, 10]} />
                <meshStandardMaterial color="#DDA15E" />
              </mesh>
              <mesh position={[0, 2.7, 0]}>
                <coneGeometry args={[0.6, 0.8, 10]} />
                <meshStandardMaterial color="#BC6C25" />
              </mesh>
              {/* Little red flag atop turret */}
              <mesh position={[0, 3.25, 0]}>
                <boxGeometry args={[0.25, 0.15, 0.02]} />
                <meshStandardMaterial color="#E63946" />
              </mesh>
            </group>
          ))}

          {/* Golden Star Hidden inside Sandcastle! */}
          <StarCollectible id="star_beach_castle" position={[0, 1.2, 0]} color="#FFD700" />
        </group>

        {/* Sparkling Clam Shells */}
        {[
          [5, 0.2, 1],
          [2, 0.2, 4],
          [-2, 0.2, -4],
        ].map(([cx, cy, cz], idx) => (
          <group key={idx} position={[cx, cy, cz]}>
            <mesh position={[0, 0.05, 0]}>
              <sphereGeometry args={[0.18, 8, 8]} />
              <meshStandardMaterial color="#FFCCD5" roughness={0.4} />
            </mesh>
            {/* Glowing Pearl inside */}
            <mesh position={[0, 0.12, 0]}>
              <sphereGeometry args={[0.08, 10, 10]} />
              <meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={0.6} />
            </mesh>
          </group>
        ))}
      </group>

      {/* --- CHECKPOINT 5 (Danau & Pantai) --- */}
      <CheckpointFlag index={5} position={[1, 0.3, -1]} />

      {/* --- STAR COLLECTIBLES --- */}
      <StarCollectible id="star_beach_1" position={[12, 1.2, -9]} color="#00B4D8" />
      <StarCollectible id="star_beach_2" position={[-9, 1.2, 0]} color="#FFB703" />
    </group>
  );
};
