import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { colliders } from '../../../state/colliders';

interface AnimatedTreeProps {
  pos: [number, number, number];
  leafColor: string;
  scale: number;
  seed: number;
}

const AnimatedTree: React.FC<AnimatedTreeProps> = ({ pos, leafColor, scale, seed }) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.z = Math.sin(t * 1.5 + seed) * 0.04;
    groupRef.current.rotation.x = Math.cos(t * 1.2 + seed) * 0.03;
  });

  return (
    <group ref={groupRef} position={pos} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.38, 2.4, 8]} />
        <meshStandardMaterial color="#9C6644" roughness={0.8} />
      </mesh>
      {/* Foliage Puff 1 */}
      <mesh position={[0, 2.6, 0]} castShadow>
        <sphereGeometry args={[1.3, 16, 16]} />
        <meshStandardMaterial color={leafColor} roughness={0.5} />
      </mesh>
      {/* Foliage Puff 2 */}
      <mesh position={[0, 3.4, 0]} castShadow>
        <sphereGeometry args={[0.9, 12, 12]} />
        <meshStandardMaterial color={leafColor} roughness={0.5} />
      </mesh>
    </group>
  );
};

interface AnimatedFlowerProps {
  x: number;
  z: number;
  color: string;
  seed: number;
}

const AnimatedFlower: React.FC<AnimatedFlowerProps> = ({ x, z, color, seed }) => {
  const flowerRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!flowerRef.current) return;
    const t = state.clock.getElapsedTime();
    flowerRef.current.rotation.z = Math.sin(t * 2.2 + seed) * 0.08;
    flowerRef.current.rotation.x = Math.cos(t * 1.8 + seed) * 0.05;
  });

  return (
    <group ref={flowerRef} position={[x, 0.3, z]}>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.3, 6]} />
        <meshStandardMaterial color="#38B000" />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
};

const AnimatedPond: React.FC = () => {
  const waterRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!waterRef.current) return;
    const t = state.clock.getElapsedTime();
    waterRef.current.position.y = 0.05 + Math.sin(t * 2.5) * 0.015;
    waterRef.current.rotation.z = Math.sin(t * 1.2) * 0.02;
  });

  return (
    <group position={[6, 0.05, -5]}>
      {/* Gentle Undulating Water Surface */}
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.5, 24]} />
        <meshStandardMaterial color="#48CAE4" roughness={0.1} transparent opacity={0.85} />
      </mesh>
      {/* Pond Pebble Border */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const px = Math.cos(angle) * 2.5;
        const pz = Math.sin(angle) * 2.5;
        return (
          <mesh key={i} position={[px, 0.05, pz]} scale={[0.3, 0.15, 0.3]}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshStandardMaterial color="#E9D8A6" roughness={0.7} />
          </mesh>
        );
      })}
    </group>
  );
};

export const GroundIsland: React.FC = () => {
  useEffect(() => {
    // Register main island ground collider
    const mainGroundBox = new THREE.Box3(
      new THREE.Vector3(-15, -1, -15),
      new THREE.Vector3(15, 0.3, 15)
    );

    const colliderObj = {
      box: mainGroundBox,
      type: 'ground' as const,
    };
    colliders.push(colliderObj);

    return () => {
      const idx = colliders.indexOf(colliderObj);
      if (idx !== -1) colliders.splice(idx, 1);
    };
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* --- MAIN ISLAND --- */}
      {/* Top Grass Cylinder */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <cylinderGeometry args={[14, 15, 0.8, 32]} />
        <meshStandardMaterial color="#70E000" roughness={0.6} />
      </mesh>

      {/* Earth / Dirt Base Beneath */}
      <mesh position={[0, -1.8, 0]}>
        <cylinderGeometry args={[15, 9, 2.6, 32]} />
        <meshStandardMaterial color="#9B5DE5" roughness={0.9} />
      </mesh>

      {/* Floating Island Underside Crystal Point */}
      <mesh position={[0, -4.2, 0]}>
        <coneGeometry args={[9, 3.5, 16]} />
        <meshStandardMaterial color="#7B2CBF" roughness={0.8} />
      </mesh>

      {/* --- CUTE MINI POND FOR THE DUCK --- */}
      <AnimatedPond />

      {/* --- CARTOON CANDY TREES (SWAYING IN WIND) --- */}
      {[
        { pos: [-8, 0.3, 5], leafColor: '#FF6B8B', scale: 1.1, seed: 0 },
        { pos: [-9, 0.3, -4], leafColor: '#FF99C8', scale: 1.3, seed: 1.5 },
        { pos: [9, 0.3, -8], leafColor: '#38B000', scale: 1.0, seed: 3.2 },
        { pos: [-3, 0.3, 10], leafColor: '#FFD166', scale: 0.9, seed: 4.8 },
        { pos: [10, 0.3, 4], leafColor: '#A0C4FF', scale: 1.2, seed: 2.1 },
      ].map((tree, idx) => (
        <AnimatedTree
          key={idx}
          pos={tree.pos as [number, number, number]}
          leafColor={tree.leafColor}
          scale={tree.scale}
          seed={tree.seed}
        />
      ))}

      {/* --- CUTE COLORFUL FLOWERS (SWAYING GENTLY) --- */}
      {[
        { x: 3, z: 2, c: '#FF4D6D', seed: 0.2 },
        { x: 4, z: 2.5, c: '#FFB703', seed: 1.1 },
        { x: -2, z: 4, c: '#9B5DE5', seed: 2.5 },
        { x: -4, z: -3, c: '#00BBF9', seed: 3.4 },
        { x: 1, z: -4, c: '#FF4D6D', seed: 4.1 },
        { x: -5, z: 7, c: '#F15BB5', seed: 1.9 },
        { x: 5, z: 8, c: '#FEE440', seed: 5.3 },
      ].map((flower, idx) => (
        <AnimatedFlower
          key={idx}
          x={flower.x}
          z={flower.z}
          color={flower.c}
          seed={flower.seed}
        />
      ))}

      {/* --- RAINBOW ARCHWAY (Pintu Masuk Obby) --- */}
      <group position={[0, 0.3, 11]}>
        {/* Left Post */}
        <mesh position={[-2.2, 1.6, 0]}>
          <cylinderGeometry args={[0.3, 0.35, 3.2, 12]} />
          <meshStandardMaterial color="#FF9F1C" />
        </mesh>
        {/* Right Post */}
        <mesh position={[2.2, 1.6, 0]}>
          <cylinderGeometry args={[0.3, 0.35, 3.2, 12]} />
          <meshStandardMaterial color="#FF9F1C" />
        </mesh>
        {/* Arch Torus */}
        <mesh position={[0, 3.2, 0]} rotation={[0, 0, 0]}>
          <torusGeometry args={[2.2, 0.3, 12, 24, Math.PI]} />
          <meshStandardMaterial color="#FF1493" />
        </mesh>
        {/* Signpost */}
        <mesh position={[0, 3.6, 0]}>
          <boxGeometry args={[2.8, 0.65, 0.1]} />
          <meshStandardMaterial color="#FFD166" />
        </mesh>
      </group>
    </group>
  );
};
