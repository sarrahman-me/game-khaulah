import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, gameStore } from '../../../state/useGameStore';
import { CheckpointFlag } from './CheckpointFlag';
import { StarCollectible } from './StarCollectible';
import { StreetLamp } from './StreetLamps';

// Mini Fire Truck Model
export const MiniFireTruckModel: React.FC<{ isRiding?: boolean }> = () => {
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const sirenLightRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (sirenLightRef.current) {
      const t = state.clock.getElapsedTime();
      sirenLightRef.current.rotation.y = t * 8;
    }
  });

  return (
    <group>
      {/* Truck Body (Bright Fire Red) */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.5, 0.75, 2.8]} />
        <meshStandardMaterial color="#D90429" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Cabin Roof */}
      <mesh position={[0, 1.05, -0.4]} castShadow>
        <boxGeometry args={[1.4, 0.65, 1.3]} />
        <meshStandardMaterial color="#EF233C" />
      </mesh>
      {/* Windshield & Windows */}
      <mesh position={[0, 1.05, -1.06]}>
        <planeGeometry args={[1.2, 0.5]} />
        <meshStandardMaterial color="#A8DADC" roughness={0.1} metalness={0.2} />
      </mesh>
      {/* Headlights */}
      {[-0.55, 0.55].map((hx, idx) => (
        <mesh key={idx} position={[hx, 0.5, -1.41]}>
          <cylinderGeometry args={[0.12, 0.12, 0.05, 12]} />
          <meshStandardMaterial color="#FFF9A6" emissive="#FFD166" emissiveIntensity={0.8} />
        </mesh>
      ))}
      {/* Front Bumper & Grille */}
      <mesh position={[0, 0.3, -1.42]}>
        <boxGeometry args={[1.5, 0.22, 0.1]} />
        <meshStandardMaterial color="#CED4DA" metalness={0.6} />
      </mesh>
      {/* Yellow Rescue Ladder on Roof */}
      <group position={[0, 1.45, 0.4]}>
        <mesh castShadow>
          <boxGeometry args={[0.9, 0.08, 1.8]} />
          <meshStandardMaterial color="#FFB703" roughness={0.4} />
        </mesh>
      </group>
      {/* Flashing Blue/Red Siren on Cabin */}
      <mesh ref={sirenLightRef} position={[0, 1.45, -0.4]}>
        <cylinderGeometry args={[0.12, 0.14, 0.22, 10]} />
        <meshStandardMaterial color="#3A86FF" emissive="#3A86FF" emissiveIntensity={1.2} />
      </mesh>
      {/* 4 Wheels */}
      {[
        [-0.8, 0.28, -0.8],
        [0.8, 0.28, -0.8],
        [-0.8, 0.28, 0.8],
        [0.8, 0.28, 0.8],
      ].map(([wx, wy, wz], idx) => (
        <group key={idx} position={[wx, wy, wz]} rotation={[0, 0, Math.PI / 2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.28, 0.28, 0.22, 16]} />
            <meshStandardMaterial color="#2B2D42" roughness={0.8} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.15, 0.15, 0.23, 12]} />
            <meshStandardMaterial color="#CED4DA" metalness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export const TownStreet: React.FC = () => {
  const activeRide = useGameStore((s) => s.activeRide);

  useFrame(() => {
    const playerPos = gameStore.getState().playerPos;

    // Check distances to Mart, Bakery, and Firetruck
    const distMart = Math.hypot(playerPos[0] - 57, playerPos[2] - (-10));
    const distBakery = Math.hypot(playerPos[0] - 69, playerPos[2] - (-10));
    const distTruck = Math.hypot(playerPos[0] - 79, playerPos[2] - (-3));

    if (distMart < 4.0) {
      gameStore.setNearbyInteractable({
        id: 'mart_cashier',
        title: 'Khaulah Mart 🛒🍓',
        prompt: 'Tekan [E] untuk Belanja Susu & Scan Kasir! ✨',
      });
    } else if (distBakery < 4.0) {
      gameStore.setNearbyInteractable({
        id: 'bakery_cake',
        title: 'Toko Kue Pastel 🍰🍩',
        prompt: 'Tekan [E] untuk Cicipi Donat Pelangi! 😋✨',
      });
    } else if (distTruck < 4.0 && activeRide === 'none') {
      gameStore.setNearbyInteractable({
        id: 'firetruck',
        title: 'Mobil Damkar Cilik 🚒🚨',
        prompt: 'Tekan [E] untuk Mengendarai Mobil Damkar! 💨',
      });
    } else {
      const cur = gameStore.getState().nearbyInteractable;
      if (cur?.id === 'mart_cashier' || cur?.id === 'bakery_cake' || cur?.id === 'firetruck') {
        gameStore.setNearbyInteractable(null);
      }
    }
  });

  return (
    <group position={[65, 0, -6]}>
      {/* --- 1. ASPHALT ROADWAY, SIDEWALKS & CROSSWALKS --- */}
      {/* North Sidewalk (In front of shops) */}
      <mesh position={[0, 0.05, -1.8]} receiveShadow>
        <boxGeometry args={[36, 0.06, 2.8]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.7} />
      </mesh>
      {/* North Sidewalk Stone Curb */}
      <mesh position={[0, 0.06, -0.4]} receiveShadow>
        <boxGeometry args={[36, 0.08, 0.2]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.75} />
      </mesh>

      {/* South Sidewalk */}
      <mesh position={[0, 0.05, 7.2]} receiveShadow>
        <boxGeometry args={[36, 0.06, 2.0]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.7} />
      </mesh>
      {/* South Sidewalk Stone Curb */}
      <mesh position={[0, 0.06, 6.2]} receiveShadow>
        <boxGeometry args={[36, 0.08, 0.2]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.75} />
      </mesh>

      {/* Main Asphalt Road Surface */}
      <group position={[0, 0.05, 2.9]}>
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[36, 0.04, 6.4]} />
          <meshStandardMaterial color="#343A40" roughness={0.82} />
        </mesh>
        {/* Road Center Dashes (White) */}
        {[-14, -8, -2, 4, 10].map((dx, idx) => (
          <mesh key={idx} position={[dx, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.5, 0.25]} />
            <meshStandardMaterial color="#FFF" />
          </mesh>
        ))}
        {/* Pedestrian Zebra Cross */}
        <group position={[-16, 0.03, 0]}>
          {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((zy, idx) => (
            <mesh key={idx} position={[0, 0, zy]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[1.4, 0.55]} />
              <meshStandardMaterial color="#FFF" />
            </mesh>
          ))}
        </group>
      </group>

      {/* Sidewalk Lamp Posts */}
      <StreetLamp pos={[-12, 0, -0.9]} />
      <StreetLamp pos={[3, 0, -0.9]} />
      <StreetLamp pos={[16, 0, -0.9]} />

      {/* --- 2. KHAULAH MART (MINIMARKET) --- */}
      <group position={[-8, 0, -4]}>
        {/* Building Exterior */}
        <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[7.5, 4.0, 5.0]} />
          <meshStandardMaterial color="#E0FBFC" roughness={0.5} />
        </mesh>
        {/* Roof Parapet */}
        <mesh position={[0, 4.15, 0]}>
          <boxGeometry args={[7.8, 0.4, 5.3]} />
          <meshStandardMaterial color="#0077B6" />
        </mesh>
        {/* Blue & Yellow Striped Awning */}
        <mesh position={[0, 2.7, 2.7]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[7.2, 0.1, 1.2]} />
          <meshStandardMaterial color="#FFB703" />
        </mesh>
        {/* Glass Front Windows */}
        <mesh position={[0, 1.4, 2.52]}>
          <planeGeometry args={[6.8, 2.2]} />
          <meshStandardMaterial color="#90E0EF" transparent opacity={0.65} metalness={0.2} />
        </mesh>
        {/* Store Sign */}
        <Billboard position={[0, 3.6, 2.6]}>
          <Text fontSize={0.38} color="#03045E" outlineWidth={0.04} outlineColor="#FFF" anchorY="middle">
            🏪 KHAULAH MART 🛒
          </Text>
        </Billboard>
        {/* Shelves & Grocery Items (Strawberry Milk, Juice) */}
        <group position={[-1.8, 0.8, 1.5]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[2.0, 0.8, 0.6]} />
            <meshStandardMaterial color="#FFF" />
          </mesh>
          {/* Strawberry Milk Cartons */}
          {[-0.6, 0, 0.6].map((mx, idx) => (
            <mesh key={idx} position={[mx, 0.55, 0]}>
              <boxGeometry args={[0.25, 0.35, 0.25]} />
              <meshStandardMaterial color="#FFB5A7" />
            </mesh>
          ))}
        </group>
        {/* Toy Shopping Cart Outside */}
        <group position={[2.8, 0.4, 3.0]}>
          <mesh castShadow>
            <boxGeometry args={[0.65, 0.6, 0.8]} />
            <meshStandardMaterial color="#FF69B4" wireframe />
          </mesh>
        </group>
      </group>

      {/* --- 3. TOKO ROTI & KUE MANIS (PASTEL BAKERY) --- */}
      <group position={[4, 0, -4]}>
        {/* Bakery Building */}
        <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[6.8, 4.0, 5.0]} />
          <meshStandardMaterial color="#FFE5D9" roughness={0.5} />
        </mesh>
        {/* Bakery Pink Awning */}
        <mesh position={[0, 2.7, 2.7]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[6.5, 0.1, 1.2]} />
          <meshStandardMaterial color="#FF006E" />
        </mesh>
        {/* Signboard */}
        <Billboard position={[0, 3.6, 2.6]}>
          <Text fontSize={0.34} color="#D90429" outlineWidth={0.04} outlineColor="#FFF" anchorY="middle">
            🧁 TOKO KUE CERIA 🍰
          </Text>
        </Billboard>
        {/* Outdoor Cafe Table */}
        <group position={[0, 0.4, 3.6]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.65, 0.65, 0.08, 16]} />
            <meshStandardMaterial color="#FFF" />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.45, 8]} />
            <meshStandardMaterial color="#7F4F24" />
          </mesh>
          {/* Cake with candle */}
          <mesh position={[0, 0.58, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.16, 12]} />
            <meshStandardMaterial color="#FFB703" />
          </mesh>
          <mesh position={[0, 0.72, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.12, 6]} />
            <meshStandardMaterial color="#E63946" />
          </mesh>
        </group>
      </group>

      {/* --- 4. POS PEMADAM CILIK & MOBIL DAMKAR --- */}
      <group position={[14, 0, -4]}>
        {/* Station House */}
        <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[6.2, 4.4, 5.0]} />
          <meshStandardMaterial color="#EF233C" roughness={0.5} />
        </mesh>
        <mesh position={[0, 4.5, 0]}>
          <boxGeometry args={[6.5, 0.4, 5.3]} />
          <meshStandardMaterial color="#D90429" />
        </mesh>
        {/* Station Sign */}
        <Billboard position={[0, 3.8, 2.6]}>
          <Text fontSize={0.34} color="#FFF" outlineWidth={0.04} outlineColor="#000" anchorY="middle">
            🚒 POS PEMADAM CILIK 🚨
          </Text>
        </Billboard>
        {/* Garage Door */}
        <mesh position={[0, 1.5, 2.52]}>
          <boxGeometry args={[4.2, 3.0, 0.05]} />
          <meshStandardMaterial color="#CED4DA" roughness={0.7} />
        </mesh>
        {/* Fire Hydrant */}
        <group position={[-2.8, 0.35, 3.0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.14, 0.16, 0.7, 8]} />
            <meshStandardMaterial color="#FF0000" />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#CED4DA" />
          </mesh>
        </group>
      </group>

      {/* Parked Mini Fire Truck (Hidden if Khaulah is riding it) */}
      {activeRide !== 'firetruck' && (
        <group position={[10, 0.1, 3.2]} rotation={[0, -Math.PI / 8, 0]}>
          <MiniFireTruckModel />
          <Billboard position={[0, 2.3, 0]}>
            <Text fontSize={0.24} color="#D90429" outlineWidth={0.03} outlineColor="#FFF" anchorY="middle">
              🚒 Mobil Damkar Cilik
            </Text>
          </Billboard>
        </group>
      )}

      {/* --- CHECKPOINT 6 (Desa Pertokoan) --- */}
      <CheckpointFlag index={6} position={[-7, 0.3, 2]} />

      {/* --- STAR COLLECTIBLES --- */}
      <StarCollectible id="star_town_1" position={[-8, 1.2, 0]} color="#FFD166" />
      <StarCollectible id="star_town_2" position={[4, 1.4, 3.6]} color="#FF006E" />
      <StarCollectible id="star_town_bakery" position={[14, 1.2, 0]} color="#4CC9F0" />
    </group>
  );
};
