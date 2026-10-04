import React, { useEffect } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { colliders } from '../../../state/colliders';

export const RumahKhaulah: React.FC = () => {
  useEffect(() => {
    // Register colliders for house front porch & walls
    // Porch floor
    const porchBox = new THREE.Box3(
      new THREE.Vector3(-6, -0.5, -9),
      new THREE.Vector3(6, 0.4, -3)
    );
    // House wall
    const houseWallBox = new THREE.Box3(
      new THREE.Vector3(-7, 0, -15),
      new THREE.Vector3(7, 4.5, -9)
    );

    const c1 = { box: porchBox, type: 'ground' as const };
    const c2 = { box: houseWallBox, type: 'ground' as const };
    colliders.push(c1, c2);

    return () => {
      [c1, c2].forEach((c) => {
        const idx = colliders.indexOf(c);
        if (idx !== -1) colliders.splice(idx, 1);
      });
    };
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* --- HOUSE MAIN BUILDING (Z: -12 to -9) --- */}
      {/* Front Wall */}
      <mesh position={[0, 2.2, -10]} castShadow receiveShadow>
        <boxGeometry args={[12, 4.2, 2.5]} />
        <meshStandardMaterial color="#FFF1E6" roughness={0.7} />
      </mesh>

      {/* Terracotta Pitched Roof */}
      <mesh position={[0, 4.8, -10]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[7.2, 2.4, 4]} />
        <meshStandardMaterial color="#C85A32" roughness={0.6} />
      </mesh>

      {/* Front Door */}
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

      {/* Front Windows */}
      {[-3.2, 3.2].map((wx, i) => (
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

      {/* --- FRONT PORCH (TERAS RUMAH) --- */}
      {/* Porch Floor Base (Wood-plank Warm Tiling) */}
      <mesh position={[0, 0.15, -6]} receiveShadow>
        <boxGeometry args={[10, 0.3, 5.5]} />
        <meshStandardMaterial color="#E9D8A6" roughness={0.5} />
      </mesh>

      {/* Porch Columns (Pilar Teras) */}
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

      {/* --- WOODEN GARDEN BENCH --- */}
      <group position={[-3.2, 0.35, -5.5]} rotation={[0, 0.2, 0]}>
        {/* Bench seat */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[1.8, 0.1, 0.6]} />
          <meshStandardMaterial color="#9C6644" roughness={0.7} />
        </mesh>
        {/* Bench backrest */}
        <mesh position={[0, 0.65, -0.28]} rotation={[0.1, 0, 0]} castShadow>
          <boxGeometry args={[1.8, 0.5, 0.08]} />
          <meshStandardMaterial color="#9C6644" roughness={0.7} />
        </mesh>
        {/* Soft Seat Cushion */}
        <mesh position={[0, 0.38, 0]}>
          <boxGeometry args={[1.65, 0.08, 0.52]} />
          <meshStandardMaterial color="#A8DADC" />
        </mesh>
      </group>

      {/* --- CUTE STEPPING STONES LEADING FROM PORCH TO FRONT YARD --- */}
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
    </group>
  );
};
