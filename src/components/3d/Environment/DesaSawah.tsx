import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { colliders, addSolidBox, addSolidCylinder, removeSolidCollider, SolidCollider } from '../../../state/colliders';
import { gameStore } from '../../../state/useGameStore';
import { soundManager } from '../../../sound/audioManager';

/**
 * Desa Sawah (Paddy Terraces & Village Field)
 * Stepped green rice terraces, rotating bamboo waterwheel, interactive crop harvesting, mini tractor.
 */
export const DesaSawah: React.FC = () => {
  const waterwheelRef = useRef<THREE.Group>(null);
  const [harvestCount, setHarvestCount] = useState(0);

  useEffect(() => {
    // 1. Terraced Rice Field Ground (X: 75 to 145, Z: -65 to 10)
    const terraceLower = new THREE.Box3(new THREE.Vector3(75, -1, -65), new THREE.Vector3(145, 0.4, 10));
    const terraceMid = new THREE.Box3(new THREE.Vector3(95, 0, -55), new THREE.Vector3(135, 1.2, -5));
    const terraceHigh = new THREE.Box3(new THREE.Vector3(105, 0, -45), new THREE.Vector3(125, 2.0, -15));

    const c1 = { box: terraceLower, type: 'ground' as const };
    const c2 = { box: terraceMid, type: 'ground' as const };
    const c3 = { box: terraceHigh, type: 'ground' as const };
    colliders.push(c1, c2, c3);

    const solids: SolidCollider[] = [
      // Farm Windmill Tower at [125, -50]
      addSolidCylinder(125, -50, 1.8, 0, 10.0, 'farm_windmill_tower'),
      // Farmer tool shed at [85, -20]
      addSolidBox([82, 0, -23], [88, 3.5, -17], 'farmer_shed'),
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
    // Rotate Bamboo Waterwheel
    if (waterwheelRef.current) {
      waterwheelRef.current.rotation.x += delta * 1.8;
    }
  });

  return (
    <group>
      {/* 1. STEPPED RICE TERRACE LEVELS */}
      {/* Level 1 Base Terrace */}
      <mesh position={[110, -0.2, -27.5]} receiveShadow>
        <boxGeometry args={[70, 1.2, 75]} />
        <meshStandardMaterial color="#65A30D" roughness={0.9} />
      </mesh>
      {/* Level 2 Mid Terrace */}
      <mesh position={[115, 0.6, -30]} receiveShadow>
        <boxGeometry args={[40, 1.2, 50]} />
        <meshStandardMaterial color="#4D7C0F" roughness={0.9} />
      </mesh>
      {/* Level 3 High Terrace */}
      <mesh position={[115, 1.4, -30]} receiveShadow>
        <boxGeometry args={[20, 1.2, 30]} />
        <meshStandardMaterial color="#84CC16" roughness={0.9} />
      </mesh>

      {/* Water Mirror in Rice Paddies */}
      <mesh position={[115, 2.01, -30]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 28]} />
        <meshStandardMaterial color="#7DD3FC" roughness={0.1} transparent opacity={0.65} />
      </mesh>

      {/* 2. BAMBOO WATERWHEEL IN IRRIGATION CANAL */}
      <group position={[92, 0.8, -32]}>
        {/* Support A-Frame */}
        {[-0.6, 0.6].map((sz, i) => (
          <mesh key={i} position={[0, 0.6, sz]} rotation={[0, 0, 0.15]}>
            <cylinderGeometry args={[0.08, 0.12, 1.8, 8]} />
            <meshStandardMaterial color="#78350F" />
          </mesh>
        ))}
        {/* Rotating Wheel with Bamboo Buckets */}
        <group ref={waterwheelRef} position={[0, 1.1, 0]}>
          {/* Wheel Hub & Rim */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[1.2, 1.2, 0.3, 16, 1, true]} />
            <meshStandardMaterial color="#A16207" roughness={0.6} />
          </mesh>
          {/* Spokes & Bamboo Paddles */}
          {[0, 1, 2, 3, 4, 5].map((idx) => {
            const ang = (idx * Math.PI) / 3;
            return (
              <group key={idx} rotation={[ang, 0, 0]}>
                <mesh position={[0, 0.6, 0]}>
                  <boxGeometry args={[0.26, 1.1, 0.06]} />
                  <meshStandardMaterial color="#CA8A04" />
                </mesh>
              </group>
            );
          })}
        </group>
        <Billboard position={[0, 2.5, 0]}>
          <Text fontSize={0.2} color="#65A30D" outlineWidth={0.03} outlineColor="#FFF" anchorY="middle">
            🎋 Kincir Air Sawah
          </Text>
        </Billboard>
      </group>

      {/* 3. INTERACTIVE CROP HARVESTING (PADI EMAS & STROBERI) */}
      <group
        position={[105, 2.05, -30]}
        onClick={(e) => {
          e.stopPropagation();
          setHarvestCount((c) => c + 1);
          soundManager.playSnackBuff();
          gameStore.unlockSticker('sawah');
          gameStore.setMessage('Alhamdulillah! Khaulah memanen seikat padi emas berkah! 🌾✨');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Golden Rice Sheaves */}
        {[-1.5, 0, 1.5].map((rx, idx) => (
          <group key={idx} position={[rx, 0, 0]}>
            <mesh position={[0, 0.45, 0]}>
              <cylinderGeometry args={[0.15, 0.08, 0.9, 8]} />
              <meshStandardMaterial color="#EAB308" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.85, 0]}>
              <sphereGeometry args={[0.25, 8, 8]} />
              <meshStandardMaterial color="#FACC15" roughness={0.4} />
            </mesh>
          </group>
        ))}
        <Billboard position={[0, 1.5, 0]}>
          <Text fontSize={0.22} color="#CA8A04" outlineWidth={0.03} outlineColor="#FFF" anchorY="middle">
            🌾 Panen Padi Emas ({harvestCount})
          </Text>
        </Billboard>
      </group>

      {/* 4. MINI HARVEST TRACTOR (PARKED AT FIELD EDGE) */}
      <group position={[88, 0.4, -12]} rotation={[0, -Math.PI / 4, 0]}>
        {/* Tractor Body (Red) */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[1.4, 0.7, 2.2]} />
          <meshStandardMaterial color="#DC2626" roughness={0.3} />
        </mesh>
        {/* Engine Hood */}
        <mesh position={[0, 0.55, 0.7]} castShadow>
          <boxGeometry args={[1.1, 0.6, 1.2]} />
          <meshStandardMaterial color="#B91C1C" roughness={0.3} />
        </mesh>
        {/* Yellow Roof Canopy */}
        <mesh position={[0, 1.6, -0.3]} castShadow>
          <boxGeometry args={[1.5, 0.08, 1.6]} />
          <meshStandardMaterial color="#FACC15" />
        </mesh>
        {/* Big Rear Wheels */}
        {[-0.8, 0.8].map((wx, i) => (
          <mesh key={i} position={[wx, 0.5, -0.6]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.55, 0.55, 0.35, 16]} />
            <meshStandardMaterial color="#1E293B" roughness={0.9} />
          </mesh>
        ))}
        {/* Small Front Wheels */}
        {[-0.65, 0.65].map((wx, i) => (
          <mesh key={i} position={[wx, 0.32, 0.9]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.32, 0.32, 0.25, 16]} />
            <meshStandardMaterial color="#1E293B" roughness={0.9} />
          </mesh>
        ))}
        {/* Smoke Exhaust Pipe */}
        <mesh position={[0.4, 1.05, 0.8]}>
          <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <Billboard position={[0, 2.1, 0]}>
          <Text fontSize={0.22} color="#DC2626" outlineWidth={0.03} outlineColor="#FFF" anchorY="middle">
            🚜 Traktor Mini Desa
          </Text>
        </Billboard>
      </group>
    </group>
  );
};
