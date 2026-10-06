import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { colliders, addSolidBox, addSolidCylinder, removeSolidCollider, SolidCollider } from '../../../state/colliders';
import { gameStore } from '../../../state/useGameStore';

export const SchoolTK: React.FC = () => {
  const flagRef = useRef<THREE.Group>(null);
  const swing1Ref = useRef<THREE.Group>(null);
  const swing2Ref = useRef<THREE.Group>(null);
  const seesawRef = useRef<THREE.Group>(null);

  // Register physical colliders for SchoolTK
  useEffect(() => {
    // School yard ground (Z: 24 to 68, X: -24 to 24)
    const yardBox = new THREE.Box3(
      new THREE.Vector3(-24, -1, 24),
      new THREE.Vector3(24, 0.4, 68)
    );

    // School building main block (walkable roof top)
    const schoolBuildingBox = new THREE.Box3(
      new THREE.Vector3(-14, 0, 52),
      new THREE.Vector3(14, 6.5, 64)
    );

    // Slide platform top
    const slideTopBox = new THREE.Box3(
      new THREE.Vector3(7.5, 0, 40.5),
      new THREE.Vector3(10.5, 2.3, 43.5)
    );

    const c1 = { box: yardBox, type: 'ground' as const };
    const c2 = { box: schoolBuildingBox, type: 'ground' as const };
    const c3 = { box: slideTopBox, type: 'ground' as const };

    colliders.push(c1, c2, c3);

    // Solid Obstacles (Player cannot penetrate school building walls, gate pillars, flagpole)
    const solids: SolidCollider[] = [
      // Main school building wall block
      addSolidBox([-11.5, 0, 53.8], [11.5, 8.5, 62.5], 'school_main_building'),
      // School gate pillars (leaving wide central entrance arch open)
      addSolidBox([-4.3, 0, 25.5], [-3.3, 4.0, 26.5], 'school_gate_left'),
      addSolidBox([3.3, 0, 25.5], [4.3, 4.0, 26.5], 'school_gate_right'),
      // Indonesian Flagpole base
      addSolidCylinder(-3.5, 34, 1.1, 0, 7.0, 'school_flagpole'),
      // Slide base platform structure
      addSolidBox([7.8, 0, 40.8], [10.2, 2.5, 43.2], 'school_slide_base'),
      // Swing A-frame legs
      addSolidCylinder(-11.4, 42, 0.35, 0, 3.8, 'school_swing_left'),
      addSolidCylinder(-6.6, 42, 0.35, 0, 3.8, 'school_swing_right'),
    ];

    return () => {
      [c1, c2, c3].forEach((c) => {
        const idx = colliders.indexOf(c);
        if (idx !== -1) colliders.splice(idx, 1);
      });
      solids.forEach((s) => removeSolidCollider(s));
    };
  }, []);

  // Animation Loop for Flag, Swing & Seesaw
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Waving Indonesian Flag
    if (flagRef.current) {
      flagRef.current.rotation.y = Math.sin(time * 3.5) * 0.15;
      flagRef.current.rotation.z = Math.cos(time * 4.0) * 0.08;
    }

    // 2. Playful Swings swinging gently
    const activeRide = gameStore.getState().activeRide;
    if (activeRide === 'swing') {
      if (swing2Ref.current) {
        swing2Ref.current.rotation.x = Math.sin(time * 2.4) * 0.52;
      }
      if (swing1Ref.current) {
        swing1Ref.current.rotation.x = Math.sin(time * 1.6 + 0.8) * 0.16;
      }
    } else {
      if (swing1Ref.current) {
        swing1Ref.current.rotation.x = Math.sin(time * 1.8) * 0.22;
      }
      if (swing2Ref.current) {
        swing2Ref.current.rotation.x = Math.sin(time * 1.8 + 1.2) * 0.22;
      }
    }

    // 3. Seesaw gentle rocking
    if (seesawRef.current) {
      seesawRef.current.rotation.z = Math.sin(time * 1.8) * 0.22;
    }

    // 4. Proximity Check for Slide & Swing Rides
    const playerPos = gameStore.getState().playerPos;

    // Slide location: [9, 0, 42]
    const distSlideSq = Math.pow(playerPos[0] - 9, 2) + Math.pow(playerPos[2] - 42, 2);
    // Swing location: [-9, 0, 42]
    const distSwingSq = Math.pow(playerPos[0] - (-9), 2) + Math.pow(playerPos[2] - 42, 2);

    if (distSlideSq < 10.0 && activeRide === 'none') {
      gameStore.setNearbyInteractable({
        id: 'slide',
        title: 'Perosotan TK Karang Tengah',
        prompt: 'Tekan [E] atau Sentuh Tombol untuk Meluncur Wuuush! 🛝',
      });
    } else if (distSwingSq < 10.0 && activeRide === 'none') {
      gameStore.setNearbyInteractable({
        id: 'swing',
        title: 'Ayunan Ceria TK Karang Tengah',
        prompt: 'Tekan [E] atau Sentuh Tombol untuk Naik Ayunan! 🎡',
      });
    } else {
      const current = gameStore.getState().nearbyInteractable;
      if (current?.id === 'slide' || current?.id === 'swing') {
        gameStore.setNearbyInteractable(null);
      }
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ============================================================== */}
      {/* 1. GERBANG RESMI: "TK KARANG TENGAH 1 ATAP" (Z: 26)           */}
      {/* ============================================================== */}
      <group position={[0, 0.2, 26]}>
        {/* Left Gate Pillar (Colorful) */}
        <mesh position={[-3.8, 1.8, 0]} castShadow>
          <boxGeometry args={[0.7, 3.6, 0.7]} />
          <meshStandardMaterial color="#06D6A0" roughness={0.4} />
        </mesh>
        <mesh position={[-3.8, 3.8, 0]}>
          <sphereGeometry args={[0.45, 14, 14]} />
          <meshStandardMaterial color="#FFD166" roughness={0.3} />
        </mesh>

        {/* Right Gate Pillar (Colorful) */}
        <mesh position={[3.8, 1.8, 0]} castShadow>
          <boxGeometry args={[0.7, 3.6, 0.7]} />
          <meshStandardMaterial color="#118AB2" roughness={0.4} />
        </mesh>
        <mesh position={[3.8, 3.8, 0]}>
          <sphereGeometry args={[0.45, 14, 14]} />
          <meshStandardMaterial color="#FFD166" roughness={0.3} />
        </mesh>

        {/* Arch Beam Above Gate */}
        <mesh position={[0, 3.6, 0]} castShadow>
          <boxGeometry args={[8.4, 0.7, 0.5]} />
          <meshStandardMaterial color="#EF476F" roughness={0.3} />
        </mesh>

        {/* Plang Nama Resmi: "TK KARANG TENGAH 1 ATAP" */}
        <group position={[0, 4.35, 0]}>
          <mesh castShadow>
            <boxGeometry args={[7.2, 1.05, 0.16]} />
            <meshStandardMaterial color="#FFF9EC" roughness={0.2} />
          </mesh>
          {/* Border Frame */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[7.35, 1.18, 0.12]} />
            <meshStandardMaterial color="#FFBE0B" roughness={0.3} />
          </mesh>

          {/* Front Text (Facing south toward Home) */}
          <Text
            position={[0, 0.12, -0.09]}
            rotation={[0, Math.PI, 0]}
            fontSize={0.38}
            color="#D90429"
            anchorX="center"
            anchorY="middle"
          >
            TK KARANG TENGAH 1 ATAP
          </Text>
          <Text
            position={[0, -0.22, -0.09]}
            rotation={[0, Math.PI, 0]}
            fontSize={0.18}
            color="#0077B6"
            anchorX="center"
            anchorY="middle"
          >
            CERIA • KREATIF • BERAKHLAK
          </Text>

          {/* Back Text (Facing north toward Schoolyard) */}
          <Text
            position={[0, 0.12, 0.09]}
            fontSize={0.38}
            color="#D90429"
            anchorX="center"
            anchorY="middle"
          >
            TK KARANG TENGAH 1 ATAP
          </Text>
          <Text
            position={[0, -0.22, 0.09]}
            fontSize={0.18}
            color="#0077B6"
            anchorX="center"
            anchorY="middle"
          >
            CERIA • KREATIF • BERAKHLAK
          </Text>
        </group>

        {/* Welcome Flower Urns at Gate Base */}
        {[-3.8, 3.8].map((fx, i) => (
          <group key={i} position={[fx, 0, 0.6]}>
            <mesh position={[0, 0.35, 0]} castShadow>
              <cylinderGeometry args={[0.35, 0.25, 0.7, 10]} />
              <meshStandardMaterial color="#E76F51" />
            </mesh>
            <mesh position={[0, 0.8, 0]}>
              <sphereGeometry args={[0.4, 10, 10]} />
              <meshStandardMaterial color="#FF006E" />
            </mesh>
          </group>
        ))}
      </group>

      {/* ============================================================== */}
      {/* 2. GEDUNG UTAMA TK KARANG TENGAH 1 ATAP (Z: 58)               */}
      {/* ============================================================== */}
      <group position={[0, 0.2, 58]}>
        {/* Main Classroom Wall (Pastel Butter Yellow) */}
        <mesh position={[0, 2.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[22, 5.6, 8]} />
          <meshStandardMaterial color="#FEFAE0" roughness={0.7} />
        </mesh>

        {/* PROPER PITCHED INDONESIAN SCHOOL ROOF (Clean bounds, no clipping!) */}
        {/* Roof Tier 1 (Overhang) */}
        <mesh position={[0, 5.8, 0]} castShadow>
          <boxGeometry args={[23.6, 0.6, 9.6]} />
          <meshStandardMaterial color="#E63946" roughness={0.6} />
        </mesh>
        {/* Roof Tier 2 (Main Pitch) */}
        <mesh position={[0, 6.7, 0]} castShadow>
          <boxGeometry args={[22.0, 1.3, 8.0]} />
          <meshStandardMaterial color="#D90429" roughness={0.5} />
        </mesh>
        {/* Roof Tier 3 (Upper Ridge) */}
        <mesh position={[0, 7.5, 0]} castShadow>
          <boxGeometry args={[20.2, 0.5, 4.8]} />
          <meshStandardMaterial color="#9B2226" roughness={0.5} />
        </mesh>

        {/* School Signboard on Facade */}
        <Text
          position={[0, 4.8, -4.08]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.46}
          color="#1D3557"
          anchorX="center"
          anchorY="middle"
        >
          TK KARANG TENGAH 1 ATAP
        </Text>

        {/* School Clock Tower at Center Roof */}
        <group position={[0, 8.4, 0]}>
          <mesh castShadow>
            <boxGeometry args={[2.2, 2.2, 2.2]} />
            <meshStandardMaterial color="#F72585" />
          </mesh>
          {/* Front Clock Face (facing playground) */}
          <mesh position={[0, 0, -1.12]} rotation={[0, Math.PI, 0]}>
            <circleGeometry args={[0.75, 24]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.2, -1.14]} rotation={[0, Math.PI, 0]}>
            <boxGeometry args={[0.08, 0.45, 0.02]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
          <mesh position={[0.2, 0, -1.14]} rotation={[0, Math.PI, 0]}>
            <boxGeometry args={[0.4, 0.08, 0.02]} />
            <meshStandardMaterial color="#111111" />
          </mesh>

          {/* Back Clock Face */}
          <mesh position={[0, 0, 1.12]}>
            <circleGeometry args={[0.75, 24]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.2, 1.14]}>
            <boxGeometry args={[0.08, 0.45, 0.02]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
          <mesh position={[0.2, 0, 1.14]}>
            <boxGeometry args={[0.4, 0.08, 0.02]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
        </group>

        {/* Main School Double Doors */}
        <group position={[0, 1.5, -4.05]}>
          <mesh castShadow>
            <boxGeometry args={[2.8, 3.0, 0.1]} />
            <meshStandardMaterial color="#B5179E" roughness={0.5} />
          </mesh>
          {/* Door Handles */}
          <mesh position={[-0.2, 0, 0.08]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#FFD166" metalness={0.8} />
          </mesh>
          <mesh position={[0.2, 0, 0.08]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#FFD166" metalness={0.8} />
          </mesh>
        </group>

        {/* Cheerful Classroom Windows */}
        {[-7, -3.5, 3.5, 7].map((wx, idx) => (
          <group key={idx} position={[wx, 2.6, -4.05]}>
            <mesh>
              <boxGeometry args={[2.2, 1.8, 0.1]} />
              <meshStandardMaterial color="#90E0EF" transparent opacity={0.85} roughness={0.1} />
            </mesh>
            {/* White Window Panes Frame */}
            <mesh>
              <boxGeometry args={[2.3, 0.1, 0.12]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
            <mesh>
              <boxGeometry args={[0.1, 1.9, 0.12]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
          </group>
        ))}
      </group>

      {/* ============================================================== */}
      {/* 3. TIANG BENDERA MERAH PUTIH INDONESIA (Z: 34, Center-Left)   */}
      {/* ============================================================== */}
      <group position={[-3.5, 0.2, 34]}>
        {/* Tiered White Pedestal */}
        <mesh position={[0, 0.15, 0]} receiveShadow>
          <cylinderGeometry args={[1.2, 1.4, 0.3, 16]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.4, 0]} receiveShadow>
          <cylinderGeometry args={[0.8, 0.9, 0.25, 16]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.5} />
        </mesh>

        {/* Tall White Flagpole */}
        <mesh position={[0, 3.6, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.09, 6.4, 16]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Golden Finial Ball on Top */}
        <mesh position={[0, 6.85, 0]}>
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshStandardMaterial color="#FFD700" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Waving Indonesian Red and White Flag */}
        <group ref={flagRef} position={[0.75, 5.8, 0]}>
          {/* Top Red Half */}
          <mesh position={[0, 0.38, 0]} castShadow>
            <boxGeometry args={[1.5, 0.75, 0.04]} />
            <meshStandardMaterial color="#E63946" roughness={0.6} />
          </mesh>
          {/* Bottom White Half */}
          <mesh position={[0, -0.38, 0]} castShadow>
            <boxGeometry args={[1.5, 0.75, 0.04]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
          </mesh>
        </group>
      </group>

      {/* ============================================================== */}
      {/* 4. PEROSOTAN INTERAKTIF TK (SLIDE) (X: 9, Z: 42)               */}
      {/* ============================================================== */}
      <group
        position={[9, 0.2, 42]}
        onClick={(e) => {
          e.stopPropagation();
          const playerPos = gameStore.getState().playerPos;
          const distSq = Math.pow(playerPos[0] - 9, 2) + Math.pow(playerPos[2] - 42, 2);
          if (distSq < 16.0) {
            gameStore.setActiveRide('slide');
          } else {
            gameStore.setMessage('Ayo berjalan mendekat ke perosotan dulu ya! 🛝🏃‍♀️');
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Slide Platform Base Pillars */}
        {[-0.8, 0.8].map((px, i) =>
          [-0.8, 0.8].map((pz, j) => (
            <mesh key={`${i}-${j}`} position={[px, 1.15, pz]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 2.3, 10]} />
              <meshStandardMaterial color="#3A86FF" />
            </mesh>
          ))
        )}

        {/* Raised Wooden Stand Platform */}
        <mesh position={[0, 2.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 0.15, 2.0]} />
          <meshStandardMaterial color="#FFBE0B" roughness={0.6} />
        </mesh>
        {/* Platform Safety Railings */}
        <mesh position={[-0.95, 2.8, 0]}>
          <boxGeometry args={[0.08, 0.9, 2.0]} />
          <meshStandardMaterial color="#FB5607" />
        </mesh>
        <mesh position={[0.95, 2.8, 0]}>
          <boxGeometry args={[0.08, 0.9, 2.0]} />
          <meshStandardMaterial color="#FB5607" />
        </mesh>

        {/* Ladder Steps at Back (Z: +1.5) */}
        {[0.4, 0.8, 1.2, 1.6, 2.0].map((stepY, idx) => (
          <mesh key={idx} position={[0, stepY, 1.1]} castShadow>
            <boxGeometry args={[1.2, 0.08, 0.22]} />
            <meshStandardMaterial color="#FF006E" />
          </mesh>
        ))}

        {/* Slide Chute (Slanted Ramp to Front Z: -2.8) */}
        <group position={[0, 1.1, -1.8]} rotation={[-0.55, 0, 0]}>
          {/* Slide Chute Bed */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.2, 0.1, 3.8]} />
            <meshStandardMaterial color="#00F5D4" roughness={0.2} metalness={0.1} />
          </mesh>
          {/* Side safety bumpers */}
          <mesh position={[-0.62, 0.18, 0]}>
            <boxGeometry args={[0.12, 0.35, 3.8]} />
            <meshStandardMaterial color="#7B2CBF" />
          </mesh>
          <mesh position={[0.62, 0.18, 0]}>
            <boxGeometry args={[0.12, 0.35, 3.8]} />
            <meshStandardMaterial color="#7B2CBF" />
          </mesh>
        </group>

        {/* Soft Landing Mat at the bottom */}
        <mesh position={[0, 0.06, -3.8]}>
          <boxGeometry args={[1.8, 0.12, 1.6]} />
          <meshStandardMaterial color="#FF70A6" roughness={0.5} />
        </mesh>
      </group>

      {/* ============================================================== */}
      {/* 5. AYUNAN INTERAKTIF TK (SWING SET) (X: -9, Z: 42)             */}
      {/* ============================================================== */}
      <group
        position={[-9, 0.2, 42]}
        onClick={(e) => {
          e.stopPropagation();
          const playerPos = gameStore.getState().playerPos;
          const distSq = Math.pow(playerPos[0] - (-9), 2) + Math.pow(playerPos[2] - 42, 2);
          if (distSq < 16.0) {
            gameStore.setActiveRide('swing');
          } else {
            gameStore.setMessage('Ayo berjalan mendekat ke ayunan dulu ya! 🎡🏃‍♀️');
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {/* A-frame Left Side Legs */}
        <mesh position={[-2.4, 1.8, -0.9]} rotation={[0.25, 0, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 3.8, 10]} />
          <meshStandardMaterial color="#FF595E" />
        </mesh>
        <mesh position={[-2.4, 1.8, 0.9]} rotation={[-0.25, 0, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 3.8, 10]} />
          <meshStandardMaterial color="#FF595E" />
        </mesh>

        {/* A-frame Right Side Legs */}
        <mesh position={[2.4, 1.8, -0.9]} rotation={[0.25, 0, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 3.8, 10]} />
          <meshStandardMaterial color="#FF595E" />
        </mesh>
        <mesh position={[2.4, 1.8, 0.9]} rotation={[-0.25, 0, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 3.8, 10]} />
          <meshStandardMaterial color="#FF595E" />
        </mesh>

        {/* Top Horizontal Crossbeam */}
        <mesh position={[0, 3.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 5.2, 12]} />
          <meshStandardMaterial color="#1982C4" />
        </mesh>

        {/* SWING 1 (Left) */}
        <group ref={swing1Ref} position={[-1.1, 3.5, 0]}>
          {/* Chains */}
          <mesh position={[-0.35, -1.3, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 2.6, 6]} />
            <meshStandardMaterial color="#4A4E69" metalness={0.6} />
          </mesh>
          <mesh position={[0.35, -1.3, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 2.6, 6]} />
            <meshStandardMaterial color="#4A4E69" metalness={0.6} />
          </mesh>
          {/* Seat */}
          <mesh position={[0, -2.6, 0]} castShadow>
            <boxGeometry args={[0.95, 0.08, 0.38]} />
            <meshStandardMaterial color="#8AC926" roughness={0.4} />
          </mesh>
        </group>

        {/* SWING 2 (Right) */}
        <group ref={swing2Ref} position={[1.1, 3.5, 0]}>
          {/* Chains */}
          <mesh position={[-0.35, -1.3, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 2.6, 6]} />
            <meshStandardMaterial color="#4A4E69" metalness={0.6} />
          </mesh>
          <mesh position={[0.35, -1.3, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 2.6, 6]} />
            <meshStandardMaterial color="#4A4E69" metalness={0.6} />
          </mesh>
          {/* Seat */}
          <mesh position={[0, -2.6, 0]} castShadow>
            <boxGeometry args={[0.95, 0.08, 0.38]} />
            <meshStandardMaterial color="#FFCA3A" roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* ============================================================== */}
      {/* 6. JUNGKAT-JUNGKIT (SEESAW) & KOTAK PASIR (SANDBOX)             */}
      {/* ============================================================== */}
      {/* Seesaw */}
      <group position={[4, 0.2, 48]}>
        {/* Base Fulcrum */}
        <mesh position={[0, 0.35, 0]} castShadow>
          <coneGeometry args={[0.35, 0.7, 8]} />
          <meshStandardMaterial color="#6A4C93" />
        </mesh>
        {/* Rocking Plank */}
        <group ref={seesawRef} position={[0, 0.7, 0]}>
          <mesh castShadow>
            <boxGeometry args={[3.2, 0.1, 0.35]} />
            <meshStandardMaterial color="#FF924C" roughness={0.5} />
          </mesh>
          {/* Seats & Handles */}
          <mesh position={[-1.4, 0.15, 0]}>
            <boxGeometry args={[0.38, 0.12, 0.38]} />
            <meshStandardMaterial color="#FF595E" />
          </mesh>
          <mesh position={[1.4, 0.15, 0]}>
            <boxGeometry args={[0.38, 0.12, 0.38]} />
            <meshStandardMaterial color="#1982C4" />
          </mesh>
        </group>
      </group>

      {/* Sandbox (Kotak Pasir) */}
      <group position={[-4, 0.2, 48]}>
        {/* Wooden Border Frame */}
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[3.4, 0.25, 3.4]} />
          <meshStandardMaterial color="#9C6644" roughness={0.7} />
        </mesh>
        {/* Sand Surface */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[3.0, 0.2, 3.0]} />
          <meshStandardMaterial color="#F4A261" roughness={0.9} />
        </mesh>
        {/* Cute Sandcastle */}
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.3, 0.4, 0.45, 8]} />
          <meshStandardMaterial color="#E76F51" />
        </mesh>
        {/* Little Toy Bucket */}
        <mesh position={[0.7, 0.38, 0.5]}>
          <cylinderGeometry args={[0.18, 0.12, 0.28, 10]} />
          <meshStandardMaterial color="#E63946" />
        </mesh>
      </group>
    </group>
  );
};
