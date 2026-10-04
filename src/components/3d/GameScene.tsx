import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../state/useGameStore';
import { PlayerKhaulah } from './PlayerKhaulah';
import { PetCompanion } from './PetCompanion';
import { CameraController } from './CameraController';
import { GroundIsland } from './Environment/GroundIsland';
import { RumahKhaulah } from './Environment/RumahKhaulah';
import { FamilyMembers } from './Environment/FamilyMembers';
import { SchoolTK } from './Environment/SchoolTK';
import { ObbyCourse } from './Environment/ObbyCourse';
import { AnimalFriends } from './Environment/AnimalFriends';
import { ScooterVehicle } from './Environment/ScooterVehicle';
import { SchoolQuest } from './Environment/SchoolQuest';
import { NightFireflies } from './Environment/NightFireflies';

// Cute floating cartoon clouds in the sky
const FloatingClouds: React.FC = () => {
  const cloudsRef = useRef<THREE.Group>(null);
  const timeOfDay = useGameStore((s) => s.timeOfDay);

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

  const cloudColor =
    timeOfDay === 'night' ? '#3B4261' : timeOfDay === 'sunset' ? '#FFD6BA' : '#FFFFFF';

  return (
    <group ref={cloudsRef}>
      {cloudPositions.map((pos, idx) => (
        <group key={idx} position={pos}>
          {/* Cloud Puffs */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[3.2, 12, 12]} />
            <meshStandardMaterial color={cloudColor} roughness={0.3} />
          </mesh>
          <mesh position={[-2.2, -0.4, 0]}>
            <sphereGeometry args={[2.4, 10, 10]} />
            <meshStandardMaterial color={cloudColor} roughness={0.3} />
          </mesh>
          <mesh position={[2.2, -0.4, 0]}>
            <sphereGeometry args={[2.4, 10, 10]} />
            <meshStandardMaterial color={cloudColor} roughness={0.3} />
          </mesh>
          <mesh position={[0, 1.2, 0]}>
            <sphereGeometry args={[2.0, 10, 10]} />
            <meshStandardMaterial color={cloudColor} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export const GameScene: React.FC = () => {
  const timeOfDay = useGameStore((s) => s.timeOfDay);

  const env = {
    day: {
      bg: '#BEE1E6',
      fogNear: 55,
      fogFar: 145,
      ambientColor: '#FFF3E0',
      ambientIntensity: 0.95,
      sunPos: [30, 45, 20] as [number, number, number],
      sunColor: '#FFF9EB',
      sunIntensity: 1.45,
      hemiSky: '#FDE2E4',
      hemiGround: '#C5DEDD',
      hemiIntensity: 0.65,
    },
    sunset: {
      bg: '#F8AD9D',
      fogNear: 50,
      fogFar: 135,
      ambientColor: '#FFE0B2',
      ambientIntensity: 0.85,
      sunPos: [45, 22, 15] as [number, number, number],
      sunColor: '#FF8800',
      sunIntensity: 1.6,
      hemiSky: '#FFB703',
      hemiGround: '#7209B7',
      hemiIntensity: 0.6,
    },
    night: {
      bg: '#0F172A',
      fogNear: 40,
      fogFar: 125,
      ambientColor: '#312E81',
      ambientIntensity: 0.5,
      sunPos: [15, 35, 10] as [number, number, number],
      sunColor: '#93C5FD',
      sunIntensity: 0.65,
      hemiSky: '#4338CA',
      hemiGround: '#1E1B4B',
      hemiIntensity: 0.45,
    },
  }[timeOfDay];

  return (
    <div className="w-full h-full absolute inset-0 touch-none select-none">
      <Canvas
        shadows
        camera={{ position: [0, 5, -8], fov: 60 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 2]} // Crisp rendering on MacBook M2 retina display
      >
        {/* Dynamic Atmosphere according to Time of Day */}
        <color attach="background" args={[env.bg]} />
        <fog attach="fog" args={[env.bg, env.fogNear, env.fogFar]} />

        {/* Ambient & Directional Lighting */}
        <ambientLight intensity={env.ambientIntensity} color={env.ambientColor} />
        <directionalLight
          position={env.sunPos}
          color={env.sunColor}
          intensity={env.sunIntensity}
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
        <hemisphereLight args={[env.hemiSky, env.hemiGround, env.hemiIntensity]} />

        {/* 3D World Elements */}
        <FloatingClouds />
        <NightFireflies />
        <GroundIsland />
        <RumahKhaulah />
        <FamilyMembers />
        <SchoolTK />
        <SchoolQuest />
        <ScooterVehicle />
        <ObbyCourse />
        <AnimalFriends />
        <PlayerKhaulah />
        <PetCompanion />
        <CameraController />
      </Canvas>
    </div>
  );
};
