import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { colliders, addSolidBox, addSolidCylinder, removeSolidCollider, SolidCollider } from '../../../state/colliders';
import { gameStore } from '../../../state/useGameStore';
import { soundManager } from '../../../sound/audioManager';

/**
 * Hutan Ajaib (Magic Forest)
 * Giant bouncy glowing mushrooms, magical ancient trees, cozy treehouse with suspension bridge.
 */
export const HutanAjaib: React.FC = () => {
  const bridgeSwayRef = useRef<THREE.Group>(null);
  const lanternRef = useRef<THREE.Group>(null);

  useEffect(() => {
    // 1. Forest Ground Platform
    const forestFloorBox = new THREE.Box3(new THREE.Vector3(-145, -1, 75), new THREE.Vector3(-75, 0.4, 135));
    const cFloor = { box: forestFloorBox, type: 'ground' as const };

    // 2. Giant Bouncy Mushroom Trampolines
    // Mushroom 1 [ -100, 2.2, 88 ]
    const mush1Box = new THREE.Box3(new THREE.Vector3(-102.5, 0, 85.5), new THREE.Vector3(-97.5, 2.2, 90.5));
    const cMush1 = { box: mush1Box, type: 'trampoline' as const };

    // Mushroom 2 [ -120, 2.8, 110 ]
    const mush2Box = new THREE.Box3(new THREE.Vector3(-122.5, 0, 107.5), new THREE.Vector3(-117.5, 2.8, 112.5));
    const cMush2 = { box: mush2Box, type: 'trampoline' as const };

    // 3. Treehouse Platform at Y: 5.8 [ -105, 5.8, 115 ]
    const treehouseBox = new THREE.Box3(new THREE.Vector3(-108.5, 5.4, 111.5), new THREE.Vector3(-101.5, 5.8, 118.5));
    const cTreehouse = { box: treehouseBox, type: 'ground' as const };

    // 4. Bridge Platform at Y: 5.6 [ -95, 5.4, 115 ]
    const bridgeBox = new THREE.Box3(new THREE.Vector3(-101.5, 5.2, 113.5), new THREE.Vector3(-88.5, 5.6, 116.5));
    const cBridge = { box: bridgeBox, type: 'ground' as const };

    // 5. Look-out Platform [ -88, 5.8, 115 ]
    const lookoutBox = new THREE.Box3(new THREE.Vector3(-91.5, 5.4, 111.5), new THREE.Vector3(-84.5, 5.8, 118.5));
    const cLookout = { box: lookoutBox, type: 'ground' as const };

    colliders.push(cFloor, cMush1, cMush2, cTreehouse, cBridge, cLookout);

    const solids: SolidCollider[] = [
      // Giant Ancient Fairy Tree Trunks
      addSolidCylinder(-105, 115, 1.4, 0, 9.0, 'fairy_tree_trunk_1'),
      addSolidCylinder(-88, 115, 1.1, 0, 9.0, 'fairy_tree_trunk_2'),
      addSolidCylinder(-125, 95, 1.2, 0, 9.0, 'fairy_tree_trunk_3'),
      addSolidCylinder(-85, 85, 1.0, 0, 9.0, 'fairy_tree_trunk_4'),
    ];

    return () => {
      [cFloor, cMush1, cMush2, cTreehouse, cBridge, cLookout].forEach((c) => {
        const idx = colliders.indexOf(c);
        if (idx !== -1) colliders.splice(idx, 1);
      });
      solids.forEach(removeSolidCollider);
    };
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Gentle rope bridge sway
    if (bridgeSwayRef.current) {
      bridgeSwayRef.current.rotation.z = Math.sin(t * 1.6) * 0.025;
    }
    // Pulsing lantern glow
    if (lanternRef.current) {
      lanternRef.current.position.y = 5.2 + Math.sin(t * 2.2) * 0.15;
    }

    // Proximity check for mushroom sticker unlock
    const p = gameStore.getState().playerPos;
    const distMush = Math.hypot(p[0] - (-100), p[2] - 88);
    if (distMush < 3.5 && p[1] > 2.0) {
      gameStore.unlockSticker('jamur');
    }
  });

  return (
    <group>
      {/* 1. MUSHROOM 1 (GIANT BOUNCY MAGENTA TRAMPOLINE) */}
      <group position={[-100, 0, 88]}>
        {/* White stem */}
        <mesh position={[0, 1.1, 0]} castShadow>
          <cylinderGeometry args={[0.7, 0.95, 2.2, 12]} />
          <meshStandardMaterial color="#FFF1E6" roughness={0.6} />
        </mesh>
        {/* Glowing Bouncy Mushroom Cap */}
        <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
          <sphereGeometry args={[2.5, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
          <meshStandardMaterial
            color="#EC4899"
            emissive="#DB2777"
            emissiveIntensity={0.4}
            roughness={0.3}
          />
        </mesh>
        {/* Polka Dots on Cap */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const ang = (i * Math.PI * 2) / 6;
          return (
            <mesh key={i} position={[Math.cos(ang) * 1.5, 2.7, Math.sin(ang) * 1.5]}>
              <sphereGeometry args={[0.26, 8, 8]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          );
        })}
        <Billboard position={[0, 3.8, 0]}>
          <Text fontSize={0.25} color="#F472B6" outlineWidth={0.03} outlineColor="#FFF" anchorY="middle">
            🍄 Jamur Lompat Ajaib
          </Text>
        </Billboard>
      </group>

      {/* 2. MUSHROOM 2 (CYAN SUPER TRAMPOLINE) */}
      <group position={[-120, 0, 110]}>
        <mesh position={[0, 1.4, 0]} castShadow>
          <cylinderGeometry args={[0.8, 1.1, 2.8, 12]} />
          <meshStandardMaterial color="#FFF1E6" roughness={0.6} />
        </mesh>
        <mesh position={[0, 2.8, 0]} castShadow receiveShadow>
          <sphereGeometry args={[2.6, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
          <meshStandardMaterial
            color="#06B6D4"
            emissive="#0891B2"
            emissiveIntensity={0.4}
            roughness={0.3}
          />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const ang = (i * Math.PI * 2) / 6 + 0.3;
          return (
            <mesh key={i} position={[Math.cos(ang) * 1.5, 3.3, Math.sin(ang) * 1.5]}>
              <sphereGeometry args={[0.26, 8, 8]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          );
        })}
      </group>

      {/* 3. COZY TREEHOUSE ON GIANT FAIRY TREE */}
      <group position={[-105, 0, 115]}>
        {/* Ancient Tree Trunk */}
        <mesh position={[0, 4.5, 0]} castShadow>
          <cylinderGeometry args={[1.3, 1.7, 9.0, 12]} />
          <meshStandardMaterial color="#582F0E" roughness={0.85} />
        </mesh>
        {/* Massive Foliage Canopy */}
        <mesh position={[0, 10.5, 0]} castShadow>
          <sphereGeometry args={[6.5, 14, 14]} />
          <meshStandardMaterial color="#15803D" roughness={0.7} />
        </mesh>

        {/* Treehouse Wooden Deck Platform at Y: 5.6 */}
        <mesh position={[0, 5.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[7.0, 0.4, 7.0]} />
          <meshStandardMaterial color="#8D5B4C" roughness={0.75} />
        </mesh>
        {/* Treehouse Cabin Walls */}
        <mesh position={[0, 7.2, 0]} castShadow>
          <boxGeometry args={[4.4, 3.0, 4.4]} />
          <meshStandardMaterial color="#B45309" roughness={0.8} />
        </mesh>
        {/* Cozy Gabled Roof */}
        <mesh position={[0, 9.2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[4.0, 2.2, 4]} />
          <meshStandardMaterial color="#DC2626" roughness={0.4} />
        </mesh>
        {/* Cabin Door Opening */}
        <mesh position={[0, 6.7, 2.21]}>
          <planeGeometry args={[1.2, 2.0]} />
          <meshBasicMaterial color="#1C1917" />
        </mesh>

        {/* Treehouse Handrails */}
        {[-3.3, 3.3].map((rx, idx) => (
          <mesh key={idx} position={[rx, 6.3, 0]} castShadow>
            <boxGeometry args={[0.15, 0.9, 6.8]} />
            <meshStandardMaterial color="#78350F" />
          </mesh>
        ))}

        <Billboard position={[0, 8.2, 2.8]}>
          <Text fontSize={0.24} color="#FBBF24" outlineWidth={0.03} outlineColor="#333" anchorY="middle">
            🏡 Rumah Pohon Hutan Ajaib
          </Text>
        </Billboard>
      </group>

      {/* 4. SUSPENSION ROPE BRIDGE CONNECTING TO LOOKOUT */}
      <group ref={bridgeSwayRef} position={[-95, 5.4, 115]}>
        {/* Wooden Bridge Planks */}
        <mesh receiveShadow>
          <boxGeometry args={[13.0, 0.2, 2.4]} />
          <meshStandardMaterial color="#A16207" roughness={0.8} />
        </mesh>
        {/* Left & Right Rope Handrails */}
        {[-1.2, 1.2].map((rz, i) => (
          <mesh key={i} position={[0, 0.65, rz]}>
            <boxGeometry args={[13.0, 0.1, 0.1]} />
            <meshStandardMaterial color="#D97706" />
          </mesh>
        ))}
      </group>

      {/* 5. LOOKOUT PLATFORM TOWER */}
      <group position={[-88, 0, 115]}>
        {/* Support Tree Trunk */}
        <mesh position={[0, 4.5, 0]} castShadow>
          <cylinderGeometry args={[1.0, 1.3, 9.0, 12]} />
          <meshStandardMaterial color="#582F0E" roughness={0.85} />
        </mesh>
        {/* Foliage Canopy */}
        <mesh position={[0, 9.8, 0]} castShadow>
          <sphereGeometry args={[5.2, 14, 14]} />
          <meshStandardMaterial color="#15803D" roughness={0.7} />
        </mesh>
        {/* Platform Deck */}
        <mesh position={[0, 5.6, 0]} receiveShadow>
          <cylinderGeometry args={[3.5, 3.5, 0.4, 16]} />
          <meshStandardMaterial color="#8D5B4C" roughness={0.75} />
        </mesh>
      </group>

      {/* 6. GLOWING FAIRY LANTERNS */}
      <group ref={lanternRef} position={[-105, 5.2, 98]}>
        <mesh>
          <sphereGeometry args={[0.35, 12, 12]} />
          <meshStandardMaterial color="#FDE047" emissive="#FACC15" emissiveIntensity={0.9} />
        </mesh>
        <pointLight color="#FDE047" intensity={1.2} distance={8} />
      </group>
    </group>
  );
};
