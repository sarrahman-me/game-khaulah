import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import * as THREE from 'three';
import { PlayerKhaulah } from './PlayerKhaulah';
import { PetCompanion } from './PetCompanion';
import { CameraController } from './CameraController';
import { GroundIsland } from './Environment/GroundIsland';
import { RumahKhaulah } from './Environment/RumahKhaulah';
import { FamilyMembers } from './Environment/FamilyMembers';
import { SchoolTK } from './Environment/SchoolTK';
import { ObbyCourse } from './Environment/ObbyCourse';
import { AnimalFriends } from './Environment/AnimalFriends';

// Cute floating cartoon clouds in the sky
const FloatingClouds: React.FC = () => {
  const cloudsRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.015;
    }
  });

  const cloudPositions: [number, number, number][] = [
    [-20, 18, 10],
    [25, 22, -15],
    [-15, 25, 45],
    [30, 20, 60],
    [-25, 24, 75],
    [0, 28, 90],
  ];

  return (
    <group ref={cloudsRef}>
      {cloudPositions.map((pos, idx) => (
        <group key={idx} position={pos}>
          {/* Cloud Puffs */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[3.2, 12, 12]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
          </mesh>
          <mesh position={[-2.2, -0.4, 0]}>
            <sphereGeometry args={[2.4, 10, 10]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
          </mesh>
          <mesh position={[2.2, -0.4, 0]}>
            <sphereGeometry args={[2.4, 10, 10]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
          </mesh>
          <mesh position={[0, 1.2, 0]}>
            <sphereGeometry args={[2.0, 10, 10]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export const GameScene: React.FC = () => {
  return (
    <div className="w-full h-full absolute inset-0 touch-none select-none">
      <Canvas
        shadows
        camera={{ position: [0, 5, -8], fov: 60 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 2]} // Crisp rendering on MacBook M2 retina display
      >
        {/* Soft pastel atmosphere */}
        <color attach="background" args={['#BEE1E6']} />
        <fog attach="fog" args={['#BEE1E6', 55, 145]} />

        {/* Cheerful Sun and Warm Golden Ambient Lighting */}
        <ambientLight intensity={0.95} color="#FFF3E0" />
        <directionalLight
          position={[30, 45, 20]}
          intensity={1.45}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={140}
          shadow-camera-left={-45}
          shadow-camera-right={45}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
          shadow-bias={-0.0004}
        />
        <hemisphereLight args={['#FDE2E4', '#C5DEDD', 0.65]} />

        {/* 3D World Elements */}
        <FloatingClouds />
        <GroundIsland />
        <RumahKhaulah />
        <FamilyMembers />
        <SchoolTK />
        <ObbyCourse />
        <AnimalFriends />
        <PlayerKhaulah />
        <PetCompanion />
        <CameraController />
      </Canvas>
    </div>
  );
};
