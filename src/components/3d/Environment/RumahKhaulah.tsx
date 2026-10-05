import React, { useEffect } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { colliders } from '../../../state/colliders';

export const RumahKhaulah: React.FC = () => {
  useEffect(() => {
    // 1. Front porch floor
    const porchBox = new THREE.Box3(
      new THREE.Vector3(-5.5, -0.5, -9),
      new THREE.Vector3(5.5, 0.4, -3)
    );
    // 2. House walls (Left wing & Right wing, leaving hallway and side paths open)
    const leftWallBox = new THREE.Box3(
      new THREE.Vector3(-6.2, 0, -11.4),
      new THREE.Vector3(-1.1, 4.5, -8.6)
    );
    const rightWallBox = new THREE.Box3(
      new THREE.Vector3(1.1, 0, -11.4),
      new THREE.Vector3(6.2, 4.5, -8.6)
    );
    // 3. Back veranda floor (deck leading to backyard waterpark)
    const backVerandaBox = new THREE.Box3(
      new THREE.Vector3(-4.5, -0.5, -14.2),
      new THREE.Vector3(4.5, 0.4, -11.0)
    );

    const c1 = { box: porchBox, type: 'ground' as const };
    const c2 = { box: leftWallBox, type: 'ground' as const };
    const c3 = { box: rightWallBox, type: 'ground' as const };
    const c4 = { box: backVerandaBox, type: 'ground' as const };
    colliders.push(c1, c2, c3, c4);

    return () => {
      [c1, c2, c3, c4].forEach((c) => {
        const idx = colliders.indexOf(c);
        if (idx !== -1) colliders.splice(idx, 1);
      });
    };
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* ============================================================== */}
      {/* 1. HOUSE MAIN BUILDING (Z: -11.3 to -8.7)                      */}
      {/* ============================================================== */}
      {/* Left Front Wall Wing */}
      <mesh position={[-3.6, 2.2, -10]} castShadow receiveShadow>
        <boxGeometry args={[4.8, 4.2, 2.5]} />
        <meshStandardMaterial color="#FFF1E6" roughness={0.7} />
      </mesh>
      {/* Right Front Wall Wing */}
      <mesh position={[3.6, 2.2, -10]} castShadow receiveShadow>
        <boxGeometry args={[4.8, 4.2, 2.5]} />
        <meshStandardMaterial color="#FFF1E6" roughness={0.7} />
      </mesh>
      {/* Center Arch Header above doors */}
      <mesh position={[0, 3.4, -10]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 1.8, 2.5]} />
        <meshStandardMaterial color="#FFF1E6" roughness={0.7} />
      </mesh>

      {/* Terracotta Pitched Roof */}
      <mesh position={[0, 4.8, -10]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[7.2, 2.4, 4]} />
        <meshStandardMaterial color="#C85A32" roughness={0.6} />
      </mesh>

      {/* --- FRONT DOOR & PLAQUE (Z: -8.7) --- */}
      <group position={[0, 1.2, -8.7]}>
        <mesh castShadow>
          <boxGeometry args={[1.5, 2.4, 0.1]} />
          <meshStandardMaterial color="#7F4F24" roughness={0.6} />
        </mesh>
        {/* Door Knob */}
        <mesh position={[0.55, 0, 0.08]}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshStandardMaterial color="#FFD700" roughness={0.2} metalness={0.7} />
        </mesh>
        {/* "RUMAH KHAULAH" Plaque */}
        <mesh position={[0, 1.45, 0.08]}>
          <boxGeometry args={[1.8, 0.45, 0.06]} />
          <meshStandardMaterial color="#DDA15E" />
        </mesh>
        <Text
          position={[0, 1.45, 0.12]}
          fontSize={0.2}
          color="#582F0E"
          anchorX="center"
          anchorY="middle"
        >
          RUMAH KHAULAH
        </Text>
      </group>

      {/* --- BACK DOOR LEADING TO BACKYARD WATERPARK (Z: -11.3) --- */}
      <group position={[0, 1.2, -11.3]}>
        {/* French Double Door Frame */}
        <mesh castShadow>
          <boxGeometry args={[1.8, 2.4, 0.1]} />
          <meshStandardMaterial color="#7F4F24" roughness={0.6} />
        </mesh>
        {/* Glass Panes */}
        {[-0.45, 0.45].map((gx, gi) => (
          <mesh key={gi} position={[gx, 0.15, 0.02]}>
            <boxGeometry args={[0.65, 1.8, 0.08]} />
            <meshStandardMaterial color="#93C5FD" transparent opacity={0.7} roughness={0.1} />
          </mesh>
        ))}
        {/* Plaque: "MENUJU KOLAM RENANG" */}
        <mesh position={[0, 1.45, -0.06]}>
          <boxGeometry args={[2.2, 0.4, 0.04]} />
          <meshStandardMaterial color="#0096C7" />
        </mesh>
        <Text
          position={[0, 1.45, -0.09]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.16}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
        >
          🏊‍♀️ MENUJU KOLAM RENANG 🌴
        </Text>
      </group>

      {/* Front Windows */}
      {[-3.6, 3.6].map((wx, i) => (
        <group key={i} position={[wx, 2.2, -8.7]}>
          <mesh>
            <boxGeometry args={[1.4, 1.4, 0.1]} />
            <meshStandardMaterial color="#93C5FD" roughness={0.1} transparent opacity={0.8} />
          </mesh>
          {/* Window Wooden Frame */}
          <mesh>
            <boxGeometry args={[1.5, 0.08, 0.12]} />
            <meshStandardMaterial color="#7F4F24" />
          </mesh>
          <mesh>
            <boxGeometry args={[0.08, 1.5, 0.12]} />
            <meshStandardMaterial color="#7F4F24" />
          </mesh>
          {/* Flower Box below window */}
          <mesh position={[0, -0.85, 0.1]}>
            <boxGeometry args={[1.5, 0.28, 0.35]} />
            <meshStandardMaterial color="#9C6644" />
          </mesh>
          {/* Pretty Flowers in box */}
          {[-0.5, -0.2, 0.1, 0.4].map((fx, fi) => (
            <mesh key={fi} position={[fx, -0.65, 0.12]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color={fi % 2 === 0 ? '#FF006E' : '#FFBE0B'} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ============================================================== */}
      {/* 2. FRONT PORCH (TERAS DEPAN RUMAH, Z: -6)                     */}
      {/* ============================================================== */}
      <mesh position={[0, 0.15, -6]} receiveShadow>
        <boxGeometry args={[10, 0.3, 5.5]} />
        <meshStandardMaterial color="#E9D8A6" roughness={0.5} />
      </mesh>

      {/* Porch Columns (Pilar Teras Depan) */}
      {[-4.6, 4.6].map((colX, i) => (
        <group key={i} position={[colX, 1.7, -3.6]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.2, 0.22, 3.2, 12]} />
            <meshStandardMaterial color="#FFF1E6" roughness={0.6} />
          </mesh>
          {/* Warm Garden Lantern on Pillar */}
          <mesh position={[0, 1.2, 0.25]}>
            <boxGeometry args={[0.28, 0.38, 0.28]} />
            <meshStandardMaterial color="#2B2D42" />
          </mesh>
          <mesh position={[0, 1.2, 0.25]}>
            <sphereGeometry args={[0.12, 10, 10]} />
            <meshStandardMaterial color="#FFE6A7" emissive="#FFE6A7" emissiveIntensity={0.8} />
          </mesh>
          <pointLight position={[0, 1.2, 0.3]} color="#FFE6A7" intensity={0.5} distance={5} />
        </group>
      ))}

      {/* Porch Overhang Canopy */}
      <mesh position={[0, 3.4, -6]} castShadow>
        <boxGeometry args={[10.4, 0.3, 5.8]} />
        <meshStandardMaterial color="#C85A32" roughness={0.6} />
      </mesh>

      {/* Garden Bench on Front Porch */}
      <group position={[-3.2, 0.35, -5.5]} rotation={[0, 0.2, 0]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[1.8, 0.1, 0.6]} />
          <meshStandardMaterial color="#9C6644" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.65, -0.28]} rotation={[0.1, 0, 0]} castShadow>
          <boxGeometry args={[1.8, 0.5, 0.08]} />
          <meshStandardMaterial color="#9C6644" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.38, 0]}>
          <boxGeometry args={[1.65, 0.08, 0.52]} />
          <meshStandardMaterial color="#A8DADC" />
        </mesh>
      </group>

      {/* Stepping Stones to Front Yard */}
      {[
        { x: 0, z: -2.8, s: 0.8 },
        { x: 0.2, z: -1.6, s: 0.75 },
        { x: -0.1, z: -0.4, s: 0.8 },
        { x: 0.1, z: 0.8, s: 0.75 },
      ].map((stone, idx) => (
        <mesh key={idx} position={[stone.x, 0.06, stone.z]} rotation={[-Math.PI / 2, 0, idx * 0.4]}>
          <circleGeometry args={[stone.s * 0.45, 12]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.8} />
        </mesh>
      ))}

      {/* ============================================================== */}
      {/* 3. BACK VERANDA & PERGOLA TO BACKYARD (TERAS BELAKANG)         */}
      {/* ============================================================== */}
      {/* Back Veranda Deck Planks */}
      <mesh position={[0, 0.15, -12.6]} receiveShadow>
        <boxGeometry args={[7.6, 0.28, 2.6]} />
        <meshStandardMaterial color="#DDB892" roughness={0.65} />
      </mesh>

      {/* Back Veranda Railing Posts */}
      {[-3.6, 3.6].map((rx, ri) => (
        <group key={ri} position={[rx, 0.7, -12.6]}>
          <mesh castShadow>
            <boxGeometry args={[0.12, 0.8, 2.6]} />
            <meshStandardMaterial color="#7F4F24" />
          </mesh>
        </group>
      ))}

      {/* Veranda Back Steps to Backyard Grass */}
      <mesh position={[0, 0.08, -14.1]} receiveShadow>
        <boxGeometry args={[3.2, 0.15, 0.6]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.7} />
      </mesh>

      {/* Flower-Covered Garden Pergola Archway (Entry to Pool & Backyard) */}
      <group position={[0, 0, -15.2]}>
        {/* Left & Right Wooden Timber Posts */}
        <mesh position={[-1.7, 1.6, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.12, 3.2, 8]} />
          <meshStandardMaterial color="#6F4E37" />
        </mesh>
        <mesh position={[1.7, 1.6, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.12, 3.2, 8]} />
          <meshStandardMaterial color="#6F4E37" />
        </mesh>
        {/* Top Lattice Beams */}
        <mesh position={[0, 3.25, 0]} castShadow>
          <boxGeometry args={[4.0, 0.16, 0.35]} />
          <meshStandardMaterial color="#6F4E37" />
        </mesh>
        {[-1.2, -0.6, 0, 0.6, 1.2].map((bx, bi) => (
          <mesh key={bi} position={[bx, 3.4, 0]}>
            <boxGeometry args={[0.1, 0.12, 1.1]} />
            <meshStandardMaterial color="#6F4E37" />
          </mesh>
        ))}
        {/* Climbing Ivy Vines & Flowers on Pergola */}
        <mesh position={[-1.7, 2.2, 0]}>
          <sphereGeometry args={[0.35, 8, 8]} />
          <meshStandardMaterial color="#2D6A4F" roughness={0.6} />
        </mesh>
        <mesh position={[1.7, 2.0, 0]}>
          <sphereGeometry args={[0.32, 8, 8]} />
          <meshStandardMaterial color="#2D6A4F" roughness={0.6} />
        </mesh>
        {/* Pink and Yellow Blossoms */}
        {[-1.6, -1.0, 0, 1.0, 1.6].map((fx, fi) => (
          <mesh key={fi} position={[fx, 3.3, (fi % 2 === 0 ? 0.2 : -0.2)]}>
            <sphereGeometry args={[0.12, 6, 6]} />
            <meshStandardMaterial color={fi % 2 === 0 ? '#FF6B8B' : '#FFD166'} />
          </mesh>
        ))}
      </group>
    </group>
  );
};
