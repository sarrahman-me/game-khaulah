import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { colliders, addSolidBox, addSolidCylinder, removeSolidCollider, SolidCollider } from '../../../state/colliders';
import { gameStore, useGameStore } from '../../../state/useGameStore';
import { WaterSurface } from './WaterSurface';

/**
 * Pantai & Laut Luas (Ocean & Coastal Beach)
 * Working lighthouse with rotating night beam, pier, ocean waves, and tropical palms.
 */
export const PantaiLautLuas: React.FC = () => {
  const lighthouseBeamRef = useRef<THREE.Group>(null);
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const isNightOrDusk = timeOfDay === 'malam' || timeOfDay === 'sore' || timeOfDay === 'subuh';

  useEffect(() => {
    // 1. Sandy Beach Shore Ground (X: -145 to -75, Z: -65 to 25)
    const beachBox = new THREE.Box3(new THREE.Vector3(-145, -1, -65), new THREE.Vector3(-75, 0.4, 25));
    // 2. Wooden Pier Deck (X: -115 to -85, Z: -25 to -15, Y: 0.5)
    const pierBox = new THREE.Box3(new THREE.Vector3(-166, 0, -22), new THREE.Vector3(-134, 0.55, -18));

    const c1 = { box: beachBox, type: 'ground' as const };
    const c2 = { box: pierBox, type: 'ground' as const };
    const c3 = { box: new THREE.Box3(new THREE.Vector3(-215, -1.8, -65), new THREE.Vector3(-145, -0.8, 25)), type: 'ground' as const };
    colliders.push(c1, c2, c3);

    const solids: SolidCollider[] = [
      // Lighthouse Base Tower at [-115, -45]
      addSolidCylinder(-115, -45, 2.5, 0, 16.0, 'lighthouse_tower'),
    ];

    return () => {
      [c1, c2, c3].forEach((c) => {
        const idx = colliders.indexOf(c);
        if (idx !== -1) colliders.splice(idx, 1);
      });
      solids.forEach(removeSolidCollider);
    };
  }, []);

  useFrame((_, delta) => {
    // Rotate Lighthouse Spotlight Beam
    if (lighthouseBeamRef.current) {
      lighthouseBeamRef.current.rotation.y += delta * 1.5;
    }

    // Check lighthouse proximity for sticker unlock
    const p = gameStore.getState().playerPos;
    const distLight = Math.hypot(p[0] - (-115), p[2] - (-45));
    if (distLight < 6.0) {
      gameStore.unlockSticker('pantai');
    }
  });

  return (
    <group>
      {/* 1. EXPANDED GOLDEN SAND SHORELINE */}
      <mesh position={[-110, -0.2, -20]} receiveShadow>
        <boxGeometry args={[70, 1.2, 90]} />
        <meshStandardMaterial color="#FDE68A" roughness={0.9} />
      </mesh>

      <mesh position={[-180, -1.3, -20]} receiveShadow>
        <boxGeometry args={[70, 1, 90]} />
        <meshStandardMaterial color="#D6C6A1" roughness={0.9} />
      </mesh>
      {/* 2. OPEN TURQUOISE OCEAN WATER SURFACE */}
      <WaterSurface
        position={[-180, 0.16, -20]}
        size={[70, 90]}
        color="#0284C7"
        depthColor="#0369A1"
        waveHeight={0.05}
        speed={1.6}
        roughness={0.08}
      />

      {/* 3. MAJESTIC TALL WORKING LIGHTHOUSE (MERCUSUAR CERIA) */}
      <group position={[-115, 0.4, -45]}>
        {/* Stone Rocky Foundation Base */}
        <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[3.2, 3.8, 1.6, 16]} />
          <meshStandardMaterial color="#64748B" roughness={0.8} />
        </mesh>
        {/* Red & White Striped Lighthouse Tower */}
        {/* Tier 1 (White) */}
        <mesh position={[0, 3.0, 0]} castShadow>
          <cylinderGeometry args={[2.2, 2.8, 3.0, 16]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
        </mesh>
        {/* Tier 2 (Red) */}
        <mesh position={[0, 6.0, 0]} castShadow>
          <cylinderGeometry args={[1.8, 2.2, 3.0, 16]} />
          <meshStandardMaterial color="#EF4444" roughness={0.4} />
        </mesh>
        {/* Tier 3 (White) */}
        <mesh position={[0, 9.0, 0]} castShadow>
          <cylinderGeometry args={[1.5, 1.8, 3.0, 16]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
        </mesh>
        {/* Tier 4 (Red) */}
        <mesh position={[0, 12.0, 0]} castShadow>
          <cylinderGeometry args={[1.3, 1.5, 3.0, 16]} />
          <meshStandardMaterial color="#EF4444" roughness={0.4} />
        </mesh>

        {/* Observation Gallery Deck */}
        <mesh position={[0, 13.8, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.0, 2.0, 0.3, 16]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        {/* Gallery Railing */}
        <mesh position={[0, 14.3, 0]}>
          <cylinderGeometry args={[2.0, 2.0, 0.7, 16, 1, true]} />
          <meshBasicMaterial color="#334155" wireframe />
        </mesh>

        {/* Lantern Glass Room */}
        <mesh position={[0, 15.0, 0]}>
          <cylinderGeometry args={[1.4, 1.4, 1.8, 12]} />
          <meshStandardMaterial color="#BAE6FD" transparent opacity={0.6} roughness={0.1} />
        </mesh>

        {/* Dome Cap */}
        <mesh position={[0, 16.2, 0]} castShadow>
          <sphereGeometry args={[1.45, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color="#1E293B" />
        </mesh>

        {/* Rotating Light Beam Group */}
        <group ref={lighthouseBeamRef} position={[0, 15.0, 0]}>
          {/* Central Lamp Core */}
          <mesh>
            <sphereGeometry args={[0.45, 12, 12]} />
            <meshStandardMaterial color="#FEF08A" emissive="#FACC15" emissiveIntensity={1.0} />
          </mesh>
          <pointLight color="#FEF08A" intensity={isNightOrDusk ? 3.0 : 0.8} distance={25} />

          {/* Sweeping Spotlight Beam Cone */}
          {isNightOrDusk && (
            <mesh position={[0, 0, 18]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[4.2, 36, 16, 1, true]} />
              <meshBasicMaterial color="#FEF08A" transparent opacity={0.18} side={THREE.DoubleSide} />
            </mesh>
          )}
        </group>

        <Billboard position={[0, 17.5, 0]}>
          <Text fontSize={0.28} color="#EF4444" outlineWidth={0.03} outlineColor="#FFF" anchorY="middle">
            🏮 Mercusuar Samudra
          </Text>
        </Billboard>
      </group>

      {/* 4. EXTENDED WOODEN PIER BOARDWALK */}
      <group position={[-150, 0.45, -20]}>
        <mesh receiveShadow>
          <boxGeometry args={[32, 0.2, 4.0]} />
          <meshStandardMaterial color="#92400E" roughness={0.8} />
        </mesh>
        {/* Wooden Piling Posts underneath */}
        {[-14, -8, -2, 4, 10, 14].map((px, i) => (
          <React.Fragment key={i}>
            <mesh position={[px, -0.6, -1.8]} castShadow>
              <cylinderGeometry args={[0.15, 0.15, 1.4, 8]} />
              <meshStandardMaterial color="#78350F" />
            </mesh>
            <mesh position={[px, -0.6, 1.8]} castShadow>
              <cylinderGeometry args={[0.15, 0.15, 1.4, 8]} />
              <meshStandardMaterial color="#78350F" />
            </mesh>
          </React.Fragment>
        ))}
      </group>

      {/* 5. TROPICAL PALM TREES ON BEACH */}
      {[
        [-90, -50],
        [-82, -35],
        [-130, -30],
        [-135, -55],
      ].map(([px, pz], i) => (
        <group key={i} position={[px, 0.4, pz]}>
          {/* Curved Palm Trunk */}
          <mesh position={[0, 2.5, 0]} rotation={[0.12, 0, 0.15]} castShadow>
            <cylinderGeometry args={[0.22, 0.35, 5.2, 8]} />
            <meshStandardMaterial color="#854D0E" roughness={0.8} />
          </mesh>
          {/* Palm Fronds */}
          {[0, 1, 2, 3, 4].map((f) => (
            <mesh key={f} position={[0.4, 5.0, 0.4]} rotation={[0.4, (f * Math.PI * 2) / 5, 0.6]} castShadow>
              <boxGeometry args={[2.8, 0.08, 0.7]} />
              <meshStandardMaterial color="#15803D" roughness={0.6} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};
