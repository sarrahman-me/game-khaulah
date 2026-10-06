import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, gameStore } from '../../../state/useGameStore';

// Animated Rotating Carousel Component
const AnimatedCarousel: React.FC = () => {
  const carouselRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (carouselRef.current) {
      carouselRef.current.rotation.y += delta * 0.45;
    }
  });

  const horses = [
    { angle: 0, color: '#FF70A6', poleColor: '#FFD166' },
    { angle: Math.PI / 2, color: '#70D6FF', poleColor: '#FFD166' },
    { angle: Math.PI, color: '#E9FF70', poleColor: '#FFD166' },
    { angle: (Math.PI * 3) / 2, color: '#FF9770', poleColor: '#FFD166' },
  ];

  return (
    <group position={[-7, 0, -7]}>
      {/* Base Platform */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[4.2, 4.4, 0.4, 24]} />
        <meshStandardMaterial color="#FFE5D9" roughness={0.4} />
      </mesh>
      {/* Golden Edge Trim */}
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[4.25, 4.25, 0.08, 24]} />
        <meshStandardMaterial color="#FFD166" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Rotating Structure */}
      <group ref={carouselRef}>
        {/* Center Pillar */}
        <mesh position={[0, 2.2, 0]} castShadow>
          <cylinderGeometry args={[0.7, 0.9, 3.6, 16]} />
          <meshStandardMaterial color="#FF006E" />
        </mesh>
        {/* Striped Canopy Roof */}
        <mesh position={[0, 4.2, 0]} castShadow>
          <coneGeometry args={[4.5, 1.6, 24]} />
          <meshStandardMaterial color="#FFBE0B" roughness={0.5} />
        </mesh>
        {/* Top Gold Ball */}
        <mesh position={[0, 5.2, 0]}>
          <sphereGeometry args={[0.35, 12, 12]} />
          <meshStandardMaterial color="#FFD166" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* 4 Carousel Horses */}
        {horses.map((h, idx) => {
          const r = 2.8;
          const x = Math.cos(h.angle) * r;
          const z = Math.sin(h.angle) * r;
          return (
            <group key={idx} position={[x, 0, z]} rotation={[0, -h.angle + Math.PI / 2, 0]}>
              {/* Golden Pole */}
              <mesh position={[0, 2.1, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 3.8, 8]} />
                <meshStandardMaterial color="#FFD166" metalness={0.7} roughness={0.2} />
              </mesh>
              {/* Horse Model */}
              <group position={[0, 1.2, 0]}>
                {/* Horse Body */}
                <mesh castShadow>
                  <capsuleGeometry args={[0.26, 0.65, 6, 8]} />
                  <meshStandardMaterial color={h.color} />
                </mesh>
                {/* Head */}
                <mesh position={[0, 0.38, -0.32]} rotation={[-0.3, 0, 0]} castShadow>
                  <sphereGeometry args={[0.18, 8, 8]} />
                  <meshStandardMaterial color={h.color} />
                </mesh>
                {/* Saddle */}
                <mesh position={[0, 0.12, 0]}>
                  <boxGeometry args={[0.35, 0.1, 0.4]} />
                  <meshStandardMaterial color="#8338EC" />
                </mesh>
              </group>
            </group>
          );
        })}
      </group>
    </group>
  );
};

// Animated Rotating Ferris Wheel
const AnimatedFerrisWheel: React.FC = () => {
  const wheelRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (wheelRef.current) {
      wheelRef.current.rotation.z += delta * 0.22;
    }
  });

  const gondolaColors = ['#FF006E', '#8338EC', '#3A86FF', '#06D6A0', '#FFD166', '#FB5607'];

  return (
    <group position={[8, 0, 3]}>
      {/* Support A-Frames */}
      {[-1.5, 1.5].map((yOffset, idx) => (
        <group key={idx} position={[0, 0, yOffset]}>
          <mesh position={[-2.2, 3.5, 0]} rotation={[0, 0, -0.3]} castShadow>
            <cylinderGeometry args={[0.12, 0.15, 7.5, 8]} />
            <meshStandardMaterial color="#3A86FF" />
          </mesh>
          <mesh position={[2.2, 3.5, 0]} rotation={[0, 0, 0.3]} castShadow>
            <cylinderGeometry args={[0.12, 0.15, 7.5, 8]} />
            <meshStandardMaterial color="#3A86FF" />
          </mesh>
        </group>
      ))}

      {/* Main Center Axle */}
      <mesh position={[0, 7.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 3.4, 16]} />
        <meshStandardMaterial color="#FFD166" metalness={0.7} />
      </mesh>

      {/* Rotating Wheel Spokes & Cabins */}
      <group ref={wheelRef} position={[0, 7.0, 0]}>
        {/* Outer Ring */}
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[5.2, 0.1, 12, 32]} />
          <meshStandardMaterial color="#FFBE0B" />
        </mesh>
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[2.8, 0.08, 12, 24]} />
          <meshStandardMaterial color="#FFBE0B" />
        </mesh>

        {/* 6 Spokes & Gondolas */}
        {gondolaColors.map((color, idx) => {
          const angle = (idx * Math.PI * 2) / 6;
          const r = 5.2;
          const gx = Math.cos(angle) * r;
          const gy = Math.sin(angle) * r;
          return (
            <group key={idx}>
              {/* Spoke rod */}
              <mesh position={[gx / 2, gy / 2, 0]} rotation={[0, 0, angle + Math.PI / 2]}>
                <cylinderGeometry args={[0.04, 0.04, r, 6]} />
                <meshStandardMaterial color="#FFF" />
              </mesh>
              {/* Gondola Cabin */}
              <group position={[gx, gy, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[1.1, 1.0, 1.4]} />
                  <meshStandardMaterial color={color} roughness={0.4} />
                </mesh>
                {/* Gondola Roof */}
                <mesh position={[0, 0.65, 0]}>
                  <coneGeometry args={[0.85, 0.5, 4]} />
                  <meshStandardMaterial color="#FFF" />
                </mesh>
              </group>
            </group>
          );
        })}
      </group>
    </group>
  );
};

export const CarnivalThemePark: React.FC = () => {
  const activeRide = useGameStore((s) => s.activeRide);

  useFrame(() => {
    const playerPos = gameStore.getState().playerPos;

    // Check distances to Carousel, Ferris Wheel, and Cotton Candy
    const distCarousel = Math.hypot(playerPos[0] - 58, playerPos[2] - 41);
    const distFerris = Math.hypot(playerPos[0] - 73, playerPos[2] - 51);
    const distCandy = Math.hypot(playerPos[0] - 65, playerPos[2] - 39);

    if (distCarousel < 4.8 && activeRide === 'none') {
      gameStore.setNearbyInteractable({
        id: 'carousel',
        title: 'Komedi Putar Kuda Ceria 🎠🎶',
        prompt: 'Tekan [E] untuk Naik Komedi Putar! ✨',
      });
    } else if (distFerris < 5.2 && activeRide === 'none') {
      gameStore.setNearbyInteractable({
        id: 'ferris_wheel',
        title: 'Bianglala Mini Bintang 🎡☁️',
        prompt: 'Tekan [E] untuk Naik Bianglala ke Langit! ✨',
      });
    } else if (distCandy < 3.8) {
      gameStore.setNearbyInteractable({
        id: 'carnival_candy',
        title: 'Gulali & Es Krim Pelangi 🍭🍦',
        prompt: 'Tekan [E] untuk Ambil Gulali Pelangi! (+Speed Boost ⚡)',
      });
    } else {
      const cur = gameStore.getState().nearbyInteractable;
      if (cur?.id === 'carousel' || cur?.id === 'ferris_wheel' || cur?.id === 'carnival_candy') {
        gameStore.setNearbyInteractable(null);
      }
    }
  });

  return (
    <group position={[65, 0, 48]}>
      {/* --- FESTIVAL PLAZA PAVING (Warm Stone Pavers with Festive Borders) --- */}
      <mesh position={[0, 0.252, 0]} receiveShadow>
        <boxGeometry args={[34, 0.02, 30]} />
        <meshStandardMaterial color="#EAE2D6" roughness={0.7} />
      </mesh>
      {/* Paved Plaza Edging */}
      <mesh position={[0, 0.254, 0]} receiveShadow>
        <boxGeometry args={[34.4, 0.02, 30.4]} />
        <meshStandardMaterial color="#C8BEB2" roughness={0.75} />
      </mesh>

      {/* --- CARNIVAL ENTRANCE ARCHWAY & COLORFUL FESTIVAL BALLOONS --- */}
      <group position={[-14, 0, -10]}>
        {/* Left & Right Candy Pillars */}
        <mesh position={[-2.4, 2.2, 0]} castShadow>
          <cylinderGeometry args={[0.28, 0.35, 4.4, 12]} />
          <meshStandardMaterial color="#FF006E" />
        </mesh>
        <mesh position={[2.4, 2.2, 0]} castShadow>
          <cylinderGeometry args={[0.28, 0.35, 4.4, 12]} />
          <meshStandardMaterial color="#FF006E" />
        </mesh>
        {/* Arch crossbeam */}
        <mesh position={[0, 4.4, 0]}>
          <boxGeometry args={[5.4, 0.6, 0.35]} />
          <meshStandardMaterial color="#FFBE0B" />
        </mesh>
        {/* Billboard Sign */}
        <Billboard position={[0, 5.1, 0]}>
          <Text fontSize={0.36} color="#FF007F" outlineWidth={0.04} outlineColor="#FFF" anchorY="middle">
            🎪 PASAR MALAM & KARNAVAL CERIA 🎡
          </Text>
        </Billboard>

        {/* Festive Balloon Clusters on Entrance Arch (Kids love this!) */}
        {[-2.4, 2.4].map((bx, bi) => (
          <group key={bi} position={[bx, 4.5, 0]}>
            {[-0.2, 0, 0.2].map((ox, oi) => (
              <mesh key={oi} position={[ox, 0.6 + oi * 0.2, (oi - 1) * 0.15]}>
                <sphereGeometry args={[0.22, 10, 10]} />
                <meshStandardMaterial
                  color={['#FF006E', '#FFBE0B', '#3A86FF', '#06D6A0', '#8338EC'][(bi * 3 + oi) % 5]}
                  roughness={0.2}
                />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* --- 1. KOMEDI PUTAR (CAROUSEL) --- */}
      <AnimatedCarousel />

      {/* --- 2. BIANGLALA MINI (FERRIS WHEEL) --- */}
      <AnimatedFerrisWheel />

      {/* --- 3. STAN GULALI & ES KRIM PELANGI --- */}
      <group position={[0, 0, -9]}>
        {/* Cart Base */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <boxGeometry args={[2.5, 1.2, 1.5]} />
          <meshStandardMaterial color="#FFB5A7" roughness={0.4} />
        </mesh>
        {/* Striped Canopy */}
        <mesh position={[0, 1.8, 0]} castShadow>
          <boxGeometry args={[2.8, 0.2, 1.8]} />
          <meshStandardMaterial color="#FF006E" />
        </mesh>
        {/* Big Swirling Lollipop Icon */}
        <group position={[0, 2.4, 0]}>
          <mesh rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.45, 0.45, 0.08, 16]} />
            <meshStandardMaterial color="#FFD166" />
          </mesh>
          <mesh position={[0, -0.4, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.6, 6]} />
            <meshStandardMaterial color="#FFF" />
          </mesh>
        </group>
        {/* Sign */}
        <Billboard position={[0, 3.2, 0]}>
          <Text fontSize={0.25} color="#FF006E" outlineWidth={0.03} outlineColor="#FFF" anchorY="middle">
            🍭 Gulali & Es Krim Pelangi
          </Text>
        </Billboard>
      </group>

      {/* --- 4. KOLAM PANCING BEBEK MAGNET --- */}
      <group position={[-6, 0, 7]}>
        {/* Round Pool Rim */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <cylinderGeometry args={[2.2, 2.3, 0.5, 20]} />
          <meshStandardMaterial color="#48CAE4" />
        </mesh>
        {/* Water */}
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[2.0, 2.0, 0.05, 20]} />
          <meshStandardMaterial
            color="#00B4D8"
            emissive="#0077B6"
            emissiveIntensity={0.25}
            roughness={0.06}
          />
        </mesh>
        {/* Floating Ducks in pool */}
        {[
          [0.8, 0.8],
          [-0.9, 0.4],
          [0.2, -0.9],
        ].map(([dx, dz], idx) => (
          <mesh key={idx} position={[dx, 0.55, dz]}>
            <sphereGeometry args={[0.16, 8, 8]} />
            <meshStandardMaterial color="#FFD166" />
          </mesh>
        ))}
      </group>
    </group>
  );
};
