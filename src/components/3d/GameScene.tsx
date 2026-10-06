import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, gameStore, TimeOfDay } from '../../state/useGameStore';
import { PlayerKhaulah } from './PlayerKhaulah';
import { PetCompanion } from './PetCompanion';
import { CameraController } from './CameraController';
import { GroundIsland } from './Environment/GroundIsland';
import { RumahKhaulah } from './Environment/RumahKhaulah';
import { BackyardWaterpark } from './Environment/BackyardWaterpark';
import { FamilyMembers } from './Environment/FamilyMembers';
import { SchoolTK } from './Environment/SchoolTK';
import { ObbyCourse } from './Environment/ObbyCourse';
import { AnimalFriends } from './Environment/AnimalFriends';
import { ScooterVehicle } from './Environment/ScooterVehicle';
import { SchoolQuest } from './Environment/SchoolQuest';
import { NightFireflies } from './Environment/NightFireflies';

import { PettingFarm } from './Environment/PettingFarm';
import { SunnyBeachLake } from './Environment/SunnyBeachLake';
import { TownStreet } from './Environment/TownStreet';
import { CarnivalThemePark } from './Environment/CarnivalThemePark';
import { VillageTrain } from './Environment/VillageTrain';
import { StreetLamps } from './Environment/StreetLamps';
import { MagicSpawner } from './Environment/MagicSpawner';

interface AtmospherePreset {
  bg: string;
  fogNear: number;
  fogFar: number;
  ambientColor: string;
  ambientIntensity: number;
  sunPos: [number, number, number];
  sunColor: string;
  sunIntensity: number;
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
}

const ATMOSPHERE_PRESETS: Record<TimeOfDay, AtmospherePreset> = {
  subuh: {
    bg: '#383660', // Fajar sejuk keunguan/lavender indigo
    fogNear: 110,
    fogFar: 330,
    ambientColor: '#A5B4FC', // Cahaya lembut temaram fajar
    ambientIntensity: 0.65,
    sunPos: [95, 25, 30], // Matahari terbit rendah di ufuk timur
    sunColor: '#FED7AA', // Sinar keemasan lembut fajar
    sunIntensity: 0.95,
    hemiSky: '#818CF8',
    hemiGround: '#334155',
    hemiIntensity: 0.5,
  },
  siang: {
    bg: '#BAE6FD', // Biru langit cerah ceria
    fogNear: 130,
    fogFar: 370,
    ambientColor: '#FFFFFF',
    ambientIntensity: 0.85,
    sunPos: [65, 80, 45], // Matahari tinggi hangat
    sunColor: '#FFFBEB',
    sunIntensity: 1.4,
    hemiSky: '#E0F2FE',
    hemiGround: '#86EFAC',
    hemiIntensity: 0.6,
  },
  sore: {
    bg: '#F8AD9D', // Senja jingga keemasan hangat
    fogNear: 115,
    fogFar: 340,
    ambientColor: '#FFE0B2',
    ambientIntensity: 0.85,
    sunPos: [80, 35, 30], // Matahari terbenam rendah
    sunColor: '#FF8800',
    sunIntensity: 1.5,
    hemiSky: '#FFB703',
    hemiGround: '#7209B7',
    hemiIntensity: 0.6,
  },
  malam: {
    bg: '#141E38', // Malam sejuk sapphire menenangkan, sangat nyaman di mata
    fogNear: 110,
    fogFar: 350,
    ambientColor: '#8DA4EF', // Cahaya ambient lembut terang, objek sangat jelas
    ambientIntensity: 0.85,  // Peningkatan kecerahan agar nyaman dimainkan & tidak gelap gulita
    sunPos: [35, 70, 25], // Rembulan perak bercahaya
    sunColor: '#D3E0FD',
    sunIntensity: 0.95,   // Sinar bulan jernih
    hemiSky: '#6366F1',   // Indigo langit malam cerah
    hemiGround: '#334155', // Permukaan tanah yang tetap terlihat jelas
    hemiIntensity: 0.60,
  },
};

// Glowing Crescent Moon & Twinkling Stars in Night Sky
const NightSkyElements: React.FC = () => {
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const moonRef = useRef<THREE.Group>(null);
  const starsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (timeOfDay !== 'malam') return;
    const t = state.clock.getElapsedTime();
    if (moonRef.current) {
      moonRef.current.position.y = 52 + Math.sin(t * 0.8) * 0.4;
    }
    if (starsRef.current) {
      starsRef.current.rotation.y = t * 0.005;
    }
  });

  if (timeOfDay !== 'malam') return null;

  const starPositions: [number, number, number][] = [
    [-45, 45, -30], [-15, 52, -50], [25, 48, -40], [60, 55, -20],
    [-70, 50, 20], [-30, 56, 40], [15, 50, 60], [55, 47, 35],
    [-50, 48, 70], [0, 58, 80], [45, 52, 75], [-20, 54, 15],
    [35, 51, -15], [-60, 46, -60], [70, 49, -55], [10, 55, -70]
  ];

  return (
    <group>
      {/* Cartoon Glowing Crescent Moon */}
      <group ref={moonRef} position={[35, 52, 25]}>
        <mesh>
          <sphereGeometry args={[4.2, 16, 16]} />
          <meshStandardMaterial
            color="#FEF08A"
            emissive="#FDE047"
            emissiveIntensity={0.85}
            roughness={0.2}
          />
        </mesh>
        {/* Soft Moon Glow Halo */}
        <mesh>
          <sphereGeometry args={[5.2, 12, 12]} />
          <meshBasicMaterial color="#FEF08A" transparent opacity={0.15} />
        </mesh>
      </group>

      {/* Sparkling Twinkling Stars */}
      <group ref={starsRef}>
        {starPositions.map((pos, idx) => (
          <mesh key={idx} position={pos}>
            <sphereGeometry args={[0.35 + (idx % 3) * 0.15, 6, 6]} />
            <meshBasicMaterial color="#FDE047" />
          </mesh>
        ))}
      </group>
    </group>
  );
};

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
    [-70, 24, 15],
    [70, 26, 15],
    [-60, 28, 55],
    [60, 26, 55],
    [0, 28, -25],
    [-35, 25, 75],
    [35, 28, 85],
    [0, 32, 120],
    [-75, 25, -35],
    [75, 27, -35],
  ];

  const cloudColor =
    timeOfDay === 'malam'
      ? '#3B4261'
      : timeOfDay === 'sore'
      ? '#FFD6BA'
      : timeOfDay === 'subuh'
      ? '#C4B5FD'
      : '#FFFFFF';

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

// Pengontrol atmosfer dinamis: menjalankan timer interval otomatis & transisi halus pencahayaan
const AtmosphereController: React.FC = () => {
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const { scene } = useThree();
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);

  const preset = ATMOSPHERE_PRESETS[timeOfDay];

  const targetBg = useMemo(() => new THREE.Color(), []);
  const targetAmbient = useMemo(() => new THREE.Color(), []);
  const targetSun = useMemo(() => new THREE.Color(), []);
  const targetHemiSky = useMemo(() => new THREE.Color(), []);
  const targetHemiGround = useMemo(() => new THREE.Color(), []);
  const targetSunPos = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    scene.background = new THREE.Color(preset.bg);
    scene.fog = new THREE.Fog(preset.bg, preset.fogNear, preset.fogFar);
  }, [scene]);

  useFrame((_, delta) => {
    // 1. Jalankan interval otomatis waktu (Subuh ➔ Siang ➔ Sore ➔ Malam)
    gameStore.tickTimeOfDay(delta);

    // 2. Transisi halus (lerp) suasana pencahayaan & langit
    const t = Math.min(delta * 2.2, 1.0);

    targetBg.set(preset.bg);
    targetAmbient.set(preset.ambientColor);
    targetSun.set(preset.sunColor);
    targetHemiSky.set(preset.hemiSky);
    targetHemiGround.set(preset.hemiGround);
    targetSunPos.set(...preset.sunPos);

    if (scene.background instanceof THREE.Color) {
      scene.background.lerp(targetBg, t);
    }
    if (scene.fog && scene.fog instanceof THREE.Fog) {
      scene.fog.color.lerp(targetBg, t);
      scene.fog.near = THREE.MathUtils.lerp(scene.fog.near, preset.fogNear, t);
      scene.fog.far = THREE.MathUtils.lerp(scene.fog.far, preset.fogFar, t);
    }

    if (ambientRef.current) {
      ambientRef.current.color.lerp(targetAmbient, t);
      ambientRef.current.intensity = THREE.MathUtils.lerp(
        ambientRef.current.intensity,
        preset.ambientIntensity,
        t
      );
    }

    if (sunRef.current) {
      sunRef.current.color.lerp(targetSun, t);
      sunRef.current.intensity = THREE.MathUtils.lerp(
        sunRef.current.intensity,
        preset.sunIntensity,
        t
      );
      sunRef.current.position.lerp(targetSunPos, t);
    }

    if (hemiRef.current) {
      hemiRef.current.color.lerp(targetHemiSky, t);
      hemiRef.current.groundColor.lerp(targetHemiGround, t);
      hemiRef.current.intensity = THREE.MathUtils.lerp(
        hemiRef.current.intensity,
        preset.hemiIntensity,
        t
      );
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={preset.ambientIntensity} color={preset.ambientColor} />
      <directionalLight
        ref={sunRef}
        position={preset.sunPos}
        color={preset.sunColor}
        intensity={preset.sunIntensity}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={320}
        shadow-camera-left={-120}
        shadow-camera-right={120}
        shadow-camera-top={120}
        shadow-camera-bottom={-120}
        shadow-bias={-0.0003}
      />
      <hemisphereLight ref={hemiRef} args={[preset.hemiSky, preset.hemiGround, preset.hemiIntensity]} />
    </>
  );
};

export const GameScene: React.FC = () => {
  return (
    <div className="w-full h-full absolute inset-0 touch-none select-none">
      <Canvas
        shadows
        camera={{ position: [0, 5, -8], fov: 60 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]} // Silky smooth 60-120fps on MacBook M2 retina display without thermal throttling
      >
        {/* Dynamic Atmosphere according to Time of Day with smooth lerp */}
        <AtmosphereController />

        {/* 3D World Elements */}
        <FloatingClouds />
        <NightSkyElements />
        <NightFireflies />
        <StreetLamps />
        <GroundIsland />
        <RumahKhaulah />
        <BackyardWaterpark />
        <FamilyMembers />
        <SchoolTK />
        <SchoolQuest />
        <ScooterVehicle />
        <PettingFarm />
        <SunnyBeachLake />
        <TownStreet />
        <CarnivalThemePark />
        <VillageTrain />
        <ObbyCourse />
        <AnimalFriends />
        <MagicSpawner />
        <PlayerKhaulah />
        <PetCompanion />
        <CameraController />
      </Canvas>
    </div>
  );
};
