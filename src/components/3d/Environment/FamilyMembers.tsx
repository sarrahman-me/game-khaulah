import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { gameStore } from '../../../state/useGameStore';

// ============================================================================
// 1. ABI MODEL (AYAH - 27 TAHUN, PRIA TANPA KACAMATA, KERJA DEPAN LAPTOP)
// ============================================================================
const AbiModel: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const groupRef = useRef<THREE.Group>(null);
  const characterRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftHandRef = useRef<THREE.Group>(null);
  const rightHandRef = useRef<THREE.Group>(null);
  const screenGlowRef = useRef<THREE.PointLight>(null);
  const eyeScale = useRef(1);
  const blinkTimer = useRef(3.0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    const playerPos = gameStore.getState().playerPos;

    // Blinking eye animation
    blinkTimer.current -= delta;
    if (blinkTimer.current <= 0) {
      eyeScale.current = 0.1;
      if (blinkTimer.current <= -0.15) {
        eyeScale.current = 1.0;
        blinkTimer.current = 2.5 + Math.random() * 3.0;
      }
    }

    // Distance to Khaulah
    const dx = playerPos[0] - position[0];
    const dz = playerPos[2] - position[2];
    const distSq = dx * dx + dz * dz;

    // Screen light pulse
    if (screenGlowRef.current) {
      screenGlowRef.current.intensity = 0.6 + Math.sin(time * 8) * 0.15;
    }

    if (distSq < 18.0) {
      // Look towards Khaulah & wave enthusiastically
      const targetAngle = Math.atan2(dx, dz);
      if (characterRef.current) {
        characterRef.current.rotation.y = THREE.MathUtils.lerp(
          characterRef.current.rotation.y,
          targetAngle,
          delta * 4
        );
      }

      // Head tilts up affectionately to smile at Khaulah
      if (headRef.current) {
        headRef.current.rotation.x = -0.05 + Math.sin(time * 2.5) * 0.05;
        headRef.current.rotation.y = Math.sin(time * 2.0) * 0.08;
      }

      // Right arm lifts in high-five / friendly wave
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -0.5;
        rightArmRef.current.rotation.z = -1.1 + Math.sin(time * 6) * 0.35;
        rightArmRef.current.rotation.y = 0.3;
      }
      // Left arm rests gently near keyboard
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.7;
        leftArmRef.current.rotation.z = 0.2;
      }
    } else {
      // Normal state: Focused coding & typing on laptop
      if (characterRef.current) {
        characterRef.current.rotation.y = THREE.MathUtils.lerp(
          characterRef.current.rotation.y,
          0,
          delta * 3
        );
      }

      // Head nods slightly while analyzing code on screen
      if (headRef.current) {
        headRef.current.rotation.x = 0.18 + Math.sin(time * 1.6) * 0.04;
        headRef.current.rotation.y = Math.sin(time * 1.2) * 0.03;
      }

      // Typing animation: Left and right hands tap keys alternately
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = -0.72 + Math.sin(time * 13) * 0.05;
        leftArmRef.current.rotation.z = 0.18 + Math.cos(time * 11) * 0.02;
        leftArmRef.current.rotation.y = -0.15;

        rightArmRef.current.rotation.x = -0.72 + Math.cos(time * 13 + 1.2) * 0.05;
        rightArmRef.current.rotation.z = -0.18 - Math.sin(time * 11) * 0.02;
        rightArmRef.current.rotation.y = 0.15;
      }

      // Finger / hand tap micro-motions
      if (leftHandRef.current) {
        leftHandRef.current.rotation.x = Math.sin(time * 16) * 0.1;
      }
      if (rightHandRef.current) {
        rightHandRef.current.rotation.x = Math.cos(time * 16 + 1.0) * 0.1;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Floor Contact Shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>

      {/* ========================================================= */}
      {/* WORKSTATION: MODERN SCANDINAVIAN DESK & CHAIR */}
      {/* ========================================================= */}
      {/* Work Desk Tabletop */}
      <mesh position={[0, 0.76, 0.45]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.06, 0.65]} />
        <meshStandardMaterial color="#D4A373" roughness={0.5} />
      </mesh>
      {/* 4 Sleek Table Legs with Dark Metal Tips */}
      {[-0.52, 0.52].map((tx, i) =>
        [0.2, 0.7].map((tz, j) => (
          <group key={`leg-${i}-${j}`} position={[tx, 0.38, tz]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.025, 0.022, 0.72, 8]} />
              <meshStandardMaterial color="#2B2D42" roughness={0.4} />
            </mesh>
            <mesh position={[0, -0.34, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.08, 8]} />
              <meshStandardMaterial color="#E9D8A6" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        ))
      )}

      {/* Modern Comfortable Desk Chair / Ergonomic Seat */}
      <group position={[0, 0, -0.15]}>
        {/* Chair Seat Cushion */}
        <mesh position={[0, 0.48, 0]} castShadow>
          <boxGeometry args={[0.55, 0.08, 0.52]} />
          <meshStandardMaterial color="#1D3557" roughness={0.6} />
        </mesh>
        {/* Chair Backrest */}
        <mesh position={[0, 0.85, -0.24]} rotation={[0.08, 0, 0]} castShadow>
          <boxGeometry args={[0.5, 0.55, 0.06]} />
          <meshStandardMaterial color="#1D3557" roughness={0.6} />
        </mesh>
        {/* Chair Central Stem & Base */}
        <mesh position={[0, 0.24, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.46, 8]} />
          <meshStandardMaterial color="#4A4E69" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.04, 8]} />
          <meshStandardMaterial color="#2B2D42" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* SLEEK MODERN LAPTOP (MACBOOK / THINKPAD STYLE) */}
      {/* ========================================================= */}
      <group position={[0, 0.79, 0.42]}>
        {/* Laptop Bottom Aluminum Base */}
        <mesh position={[0, 0.01, 0]} castShadow>
          <boxGeometry args={[0.46, 0.018, 0.32]} />
          <meshStandardMaterial color="#CED4DA" metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Recessed Keyboard Well */}
        <mesh position={[0, 0.021, -0.03]}>
          <boxGeometry args={[0.4, 0.005, 0.17]} />
          <meshStandardMaterial color="#1E1E24" roughness={0.8} />
        </mesh>
        {/* Keyboard Key Highlights (individual keys simulation) */}
        {[-0.14, -0.07, 0, 0.07, 0.14].map((kx, idx) => (
          <mesh key={`kline-${idx}`} position={[kx, 0.023, -0.03]}>
            <boxGeometry args={[0.05, 0.004, 0.14]} />
            <meshStandardMaterial color="#2B2D42" roughness={0.7} />
          </mesh>
        ))}
        {/* Precision Glass Trackpad */}
        <mesh position={[0, 0.021, 0.09]}>
          <boxGeometry args={[0.14, 0.002, 0.08]} />
          <meshStandardMaterial color="#ADB5BD" roughness={0.4} />
        </mesh>

        {/* Laptop Display Lid (Hinged at ~115 degrees) */}
        <group position={[0, 0.018, -0.15]} rotation={[-Math.PI / 6, 0, 0]}>
          {/* Lid Back Cover (Aluminum) */}
          <mesh position={[0, 0.16, 0]} castShadow>
            <boxGeometry args={[0.46, 0.32, 0.015]} />
            <meshStandardMaterial color="#CED4DA" metalness={0.85} roughness={0.25} />
          </mesh>
          {/* Minimalist Logo on Lid Back */}
          <mesh position={[0, 0.16, -0.009]}>
            <circleGeometry args={[0.025, 12]} />
            <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.5} />
          </mesh>
          {/* Glowing Display Screen (Vibrant IDE Coding Window) */}
          <mesh position={[0, 0.16, 0.008]}>
            <boxGeometry args={[0.43, 0.29, 0.002]} />
            <meshStandardMaterial
              color="#0F172A"
              emissive="#1E293B"
              emissiveIntensity={0.4}
              roughness={0.2}
            />
          </mesh>
          {/* Syntax Highlighted Code Lines on Screen */}
          {[
            { y: 0.26, w: 0.32, c: '#38BDF8' }, // Cyan function def
            { y: 0.22, w: 0.25, c: '#4ADE80' }, // Green strings / const
            { y: 0.18, w: 0.36, c: '#F472B6' }, // Pink JSX / logic
            { y: 0.14, w: 0.28, c: '#FBBF24' }, // Yellow params
            { y: 0.10, w: 0.34, c: '#60A5FA' }, // Blue calls
            { y: 0.06, w: 0.20, c: '#34D399' }, // Emerald return
          ].map((line, idx) => (
            <mesh key={`code-${idx}`} position={[-0.18 + line.w / 2, line.y, 0.01]}>
              <planeGeometry args={[line.w, 0.018]} />
              <meshBasicMaterial color={line.c} />
            </mesh>
          ))}
          {/* Soft Screen Glow casting on Abi */}
          <pointLight
            ref={screenGlowRef}
            position={[0, 0.16, 0.15]}
            color="#38BDF8"
            intensity={0.7}
            distance={1.8}
          />
        </group>
      </group>

      {/* Desk Accessories: Ceramic Coffee Mug with Warm Steam */}
      <group position={[0.42, 0.79, 0.4]}>
        <mesh position={[0, 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.045, 0.14, 12]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
        {/* Coffee Liquid */}
        <mesh position={[0, 0.13, 0]}>
          <cylinderGeometry args={[0.046, 0.046, 0.02, 12]} />
          <meshStandardMaterial color="#3E2723" roughness={0.2} />
        </mesh>
        {/* Mug Handle */}
        <mesh position={[0.06, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.035, 0.01, 8, 12]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        {/* Rising Steam Sparkles */}
        <Sparkles count={5} position={[0, 0.22, 0]} scale={0.2} size={1.5} speed={0.5} color="#F8F9FA" />
      </group>

      {/* Sleek Wireless Mouse & Mousepad */}
      <group position={[0.32, 0.79, 0.5]}>
        <mesh position={[0, 0.005, 0]}>
          <boxGeometry args={[0.15, 0.002, 0.2]} />
          <meshStandardMaterial color="#1E293B" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.02, 0]} castShadow>
          <boxGeometry args={[0.06, 0.025, 0.1]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.3} />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* ABI CHARACTER (27 TAHUN, PRIA MUDA TAMPAN, TANPA KACAMATA) */}
      {/* ========================================================= */}
      <group ref={characterRef} position={[0, 0, -0.1]}>
        {/* Shoes */}
        <mesh position={[-0.18, 0.1, 0.2]} castShadow>
          <boxGeometry args={[0.18, 0.14, 0.38]} />
          <meshStandardMaterial color="#1E1E24" roughness={0.7} />
        </mesh>
        <mesh position={[0.18, 0.1, 0.2]} castShadow>
          <boxGeometry args={[0.18, 0.14, 0.38]} />
          <meshStandardMaterial color="#1E1E24" roughness={0.7} />
        </mesh>

        {/* Navy Trouser Legs (Bent naturally in sitting position) */}
        {/* Lower Legs (Vertical from feet to knees) */}
        <mesh position={[-0.18, 0.32, 0.2]} castShadow>
          <cylinderGeometry args={[0.12, 0.13, 0.38, 10]} />
          <meshStandardMaterial color="#1D2A44" roughness={0.7} />
        </mesh>
        <mesh position={[0.18, 0.32, 0.2]} castShadow>
          <cylinderGeometry args={[0.12, 0.13, 0.38, 10]} />
          <meshStandardMaterial color="#1D2A44" roughness={0.7} />
        </mesh>
        {/* Thighs (Horizontal extending towards desk) */}
        <mesh position={[-0.18, 0.49, 0.08]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.14, 0.34, 10]} />
          <meshStandardMaterial color="#1D2A44" roughness={0.7} />
        </mesh>
        <mesh position={[0.18, 0.49, 0.08]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.14, 0.34, 10]} />
          <meshStandardMaterial color="#1D2A44" roughness={0.7} />
        </mesh>

        {/* Torso: Elegant Modern Koko Shirt in Royal Blue (Pria 27 Tahun) */}
        <mesh position={[0, 1.05, -0.05]} castShadow>
          <boxGeometry args={[0.68, 0.82, 0.4]} />
          <meshStandardMaterial color="#2563EB" roughness={0.6} />
        </mesh>
        {/* White Center Button Placket / Bordir Koko */}
        <mesh position={[0, 1.1, 0.155]}>
          <boxGeometry args={[0.1, 0.72, 0.02]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
        </mesh>

        {/* Left Arm (Reaching forward to type on laptop) */}
        <group ref={leftArmRef} position={[-0.38, 1.35, 0]}>
          <mesh position={[0, -0.22, 0.12]} rotation={[0.4, 0, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.08, 0.46, 10]} />
            <meshStandardMaterial color="#2563EB" roughness={0.6} />
          </mesh>
          {/* Left Forearm & Hand */}
          <group ref={leftHandRef} position={[0, -0.42, 0.26]}>
            <mesh position={[0.08, 0, 0.1]} castShadow>
              <sphereGeometry args={[0.085, 10, 10]} />
              <meshStandardMaterial color="#E8BE96" roughness={0.6} />
            </mesh>
          </group>
        </group>

        {/* Right Arm (Typing / Waving to Khaulah) */}
        <group ref={rightArmRef} position={[0.38, 1.35, 0]}>
          <mesh position={[0, -0.22, 0.12]} rotation={[0.4, 0, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.08, 0.46, 10]} />
            <meshStandardMaterial color="#2563EB" roughness={0.6} />
          </mesh>
          {/* Right Forearm & Hand */}
          <group ref={rightHandRef} position={[0, -0.42, 0.26]}>
            <mesh position={[-0.08, 0, 0.1]} castShadow>
              <sphereGeometry args={[0.085, 10, 10]} />
              <meshStandardMaterial color="#E8BE96" roughness={0.6} />
            </mesh>
          </group>
        </group>

        {/* Head Group (Pria 27 Tahun, Wajah Ramah & TANPA KACAMATA) */}
        <group ref={headRef} position={[0, 1.62, -0.05]}>
          {/* Neck */}
          <mesh position={[0, -0.16, 0]}>
            <cylinderGeometry args={[0.1, 0.12, 0.18, 10]} />
            <meshStandardMaterial color="#E8BE96" />
          </mesh>
          {/* Face (Proporsi Pria 27 Tahun Bersih & Ramah) */}
          <mesh castShadow>
            <sphereGeometry args={[0.28, 18, 18]} />
            <meshStandardMaterial color="#F2C7A1" roughness={0.6} />
          </mesh>
          {/* Peci Hitam Elegan / Rambut Rapi Pemuda 27 Tahun */}
          <mesh position={[0, 0.19, -0.02]} castShadow>
            <cylinderGeometry args={[0.27, 0.29, 0.22, 16]} />
            <meshStandardMaterial color="#1E1E24" roughness={0.8} />
          </mesh>
          {/* Alis Rapi Pria Muda */}
          <mesh position={[-0.09, 0.09, 0.25]} rotation={[0, 0, -0.1]}>
            <boxGeometry args={[0.08, 0.018, 0.02]} />
            <meshStandardMaterial color="#1E1E24" />
          </mesh>
          <mesh position={[0.09, 0.09, 0.25]} rotation={[0, 0, 0.1]}>
            <boxGeometry args={[0.08, 0.018, 0.02]} />
            <meshStandardMaterial color="#1E1E24" />
          </mesh>

          {/* MATA JERNIH TANPA KACAMATA (Clear, Warm Eyes with Natural Blink) */}
          <group scale={[1, eyeScale.current, 1]}>
            <mesh position={[-0.09, 0.03, 0.26]}>
              <sphereGeometry args={[0.035, 10, 10]} />
              <meshStandardMaterial color="#111111" />
            </mesh>
            <mesh position={[0.09, 0.03, 0.26]}>
              <sphereGeometry args={[0.035, 10, 10]} />
              <meshStandardMaterial color="#111111" />
            </mesh>
            {/* Eye Glimmer / Catchlight */}
            <mesh position={[-0.08, 0.045, 0.285]}>
              <sphereGeometry args={[0.01, 6, 6]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
            <mesh position={[0.1, 0.045, 0.285]}>
              <sphereGeometry args={[0.01, 6, 6]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          </group>

          {/* Senyum Hangat Ayah (Warm Smile) */}
          <mesh position={[0, -0.1, 0.26]}>
            <torusGeometry args={[0.055, 0.014, 6, 12, Math.PI]} />
            <meshStandardMaterial color="#A64B2A" />
          </mesh>
        </group>
      </group>

      {/* Floating Billboard Name Tag (Cukup Nama Saja, Tanpa Umur) */}
      <Billboard position={[0, 2.15, 0]}>
        <mesh>
          <planeGeometry args={[1.2, 0.4]} />
          <meshBasicMaterial color="#1D3557" transparent opacity={0.88} />
        </mesh>
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.2}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
        >
          Abi 💻
        </Text>
      </Billboard>
    </group>
  );
};

// ============================================================================
// 2. UMMI MODEL (IBU - 26 TAHUN, BERCADAR / NIQAB, AKTIVITAS MENYAPU)
// ============================================================================
const UmmiModel: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const broomRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const eyeScale = useRef(1);
  const blinkTimer = useRef(2.5);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    const playerPos = gameStore.getState().playerPos;

    // Eye blinking
    blinkTimer.current -= delta;
    if (blinkTimer.current <= 0) {
      eyeScale.current = 0.1;
      if (blinkTimer.current <= -0.14) {
        eyeScale.current = 1.0;
        blinkTimer.current = 2.8 + Math.random() * 2.5;
      }
    }

    const dx = playerPos[0] - position[0];
    const dz = playerPos[2] - position[2];
    const distSq = dx * dx + dz * dz;

    // Sweeping stroke rhythm: smooth back-and-forth swing
    const sweepPhase = Math.sin(time * 3.2);

    if (distSq < 18.0) {
      // Look affectionately at Khaulah, pause sweep, wave gently
      const targetAngle = Math.atan2(dx, dz);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetAngle,
        delta * 4
      );

      // Loving head tilt towards daughter
      if (headRef.current) {
        headRef.current.rotation.z = Math.sin(time * 2.5) * 0.08;
        headRef.current.rotation.x = -0.05 + Math.sin(time * 1.8) * 0.03;
      }

      // Left hand waves gently in maternal greeting
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.6;
        leftArmRef.current.rotation.z = 0.8 + Math.sin(time * 5) * 0.25;
      }
      // Right hand holds broom gracefully standing upright
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -0.3;
        rightArmRef.current.rotation.z = -0.2;
      }
      if (broomRef.current) {
        broomRef.current.rotation.z = THREE.MathUtils.lerp(broomRef.current.rotation.z, 0.1, delta * 3);
        broomRef.current.position.x = THREE.MathUtils.lerp(broomRef.current.position.x, 0.35, delta * 3);
      }
    } else {
      // Sweeping active animation: Broom moves side to side sweeping the floor
      if (broomRef.current) {
        broomRef.current.rotation.z = sweepPhase * 0.28;
        broomRef.current.position.x = 0.35 + sweepPhase * 0.16;
        broomRef.current.position.z = 0.32 + Math.abs(sweepPhase) * 0.08;
      }

      // Hands hold and guide the broom
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.45 + sweepPhase * 0.12;
        leftArmRef.current.rotation.z = 0.25 - sweepPhase * 0.15;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -0.65 - sweepPhase * 0.12;
        rightArmRef.current.rotation.z = -0.35 + sweepPhase * 0.18;
      }

      // Body & head gently sway with the sweeping cadence
      if (headRef.current) {
        headRef.current.rotation.y = sweepPhase * 0.08;
        headRef.current.rotation.x = 0.12; // Looking down at floor being swept
      }
    }

    // Breathing motion
    if (headRef.current) {
      headRef.current.position.y = 2.28 + Math.sin(time * 2.2) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Floor Contact Shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.75, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>

      {/* Gamis Syar'i Anggun (Flared Floor-Length Skirt in Soft Terracotta / Peach) */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <coneGeometry args={[0.66, 1.45, 18]} />
        <meshStandardMaterial color="#E07A5F" roughness={0.7} />
      </mesh>
      {/* Gamis Torso */}
      <mesh position={[0, 1.58, 0]} castShadow>
        <boxGeometry args={[0.66, 0.82, 0.4]} />
        <meshStandardMaterial color="#E07A5F" roughness={0.6} />
      </mesh>

      {/* Syar'i Khimar / Hijab Drape over Shoulders & Chest */}
      <mesh position={[0, 1.82, 0.05]} castShadow>
        <coneGeometry args={[0.56, 0.72, 16]} />
        <meshStandardMaterial color="#F7EDE2" roughness={0.5} />
      </mesh>

      {/* Left Arm (Holding upper handle of broom / waving) */}
      <group ref={leftArmRef} position={[-0.38, 1.7, 0.05]}>
        <mesh position={[0, -0.3, 0.1]} rotation={[0.4, 0, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.075, 0.6, 10]} />
          <meshStandardMaterial color="#E07A5F" />
        </mesh>
        {/* Left Hand */}
        <mesh position={[0, -0.6, 0.2]} castShadow>
          <sphereGeometry args={[0.075, 8, 8]} />
          <meshStandardMaterial color="#F2C7A1" />
        </mesh>
      </group>

      {/* Right Arm (Holding mid handle of broom) */}
      <group ref={rightArmRef} position={[0.38, 1.7, 0.05]}>
        <mesh position={[0, -0.3, 0.1]} rotation={[0.4, 0, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.075, 0.6, 10]} />
          <meshStandardMaterial color="#E07A5F" />
        </mesh>
        {/* Right Hand */}
        <mesh position={[0, -0.6, 0.2]} castShadow>
          <sphereGeometry args={[0.075, 8, 8]} />
          <meshStandardMaterial color="#F2C7A1" />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* DETAILED BROOM (SAPU LANTAI / TERAS BERSIH) */}
      {/* ========================================================= */}
      <group ref={broomRef} position={[0.35, 0.9, 0.32]} rotation={[0.2, 0, 0.1]}>
        {/* Long Smooth Wooden Broom Handle */}
        <mesh position={[0, 0.1, 0]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 1.55, 12]} />
          <meshStandardMaterial color="#A66B38" roughness={0.6} />
        </mesh>
        {/* Top Handle Hanging Cap */}
        <mesh position={[0, 0.88, 0]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#3D5A80" />
        </mesh>
        {/* Broom Head Metal Binding Collar */}
        <mesh position={[0, -0.58, 0]}>
          <cylinderGeometry args={[0.06, 0.07, 0.12, 12]} />
          <meshStandardMaterial color="#3D5A80" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Broom Fan Bristles (Ijuk Serat Alami Bersih) */}
        <mesh position={[0, -0.74, 0]} castShadow>
          <boxGeometry args={[0.34, 0.32, 0.07]} />
          <meshStandardMaterial color="#DDA15E" roughness={0.9} />
        </mesh>
        {/* Bristle Straw Texture Lines */}
        {[-0.1, 0, 0.1].map((bx, i) => (
          <mesh key={`bristle-${i}`} position={[bx, -0.76, 0.037]}>
            <boxGeometry args={[0.02, 0.26, 0.005]} />
            <meshStandardMaterial color="#BC6C25" roughness={0.9} />
          </mesh>
        ))}

        {/* Cleanliness Sparkles Rising as Ummi Sweeps */}
        <Sparkles count={10} position={[0, -0.85, 0]} scale={0.7} size={2.5} speed={1.0} color="#FFD166" />
      </group>

      {/* Bekal Cinta Ummi Box beside her on a small decorative stand */}
      <group position={[-0.7, 0.32, 0.2]}>
        {/* Wooden mini stand */}
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.24, 0.3, 12]} />
          <meshStandardMaterial color="#D4A373" roughness={0.6} />
        </mesh>
        {/* Bekal Box */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[0.36, 0.16, 0.26]} />
          <meshStandardMaterial color="#FFB703" roughness={0.4} />
        </mesh>
        {/* Ribbon */}
        <mesh position={[0, 0.17, 0]}>
          <boxGeometry args={[0.12, 0.03, 0.27]} />
          <meshStandardMaterial color="#E63946" />
        </mesh>
        <Sparkles count={6} scale={0.4} size={2} speed={0.8} color="#FFD166" />
      </group>

      {/* ========================================================= */}
      {/* HEAD GROUP: UMMI (26 TAHUN, BERCADAR / NIQAB ANGGUN) */}
      {/* ========================================================= */}
      <group ref={headRef} position={[0, 2.28, 0]}>
        {/* Full Syar'i Hijab Covering Head */}
        <mesh castShadow>
          <sphereGeometry args={[0.35, 18, 18]} />
          <meshStandardMaterial color="#F7EDE2" roughness={0.5} />
        </mesh>

        {/* Forehead / Eye Area */}
        <mesh position={[0, 0.04, 0.12]} castShadow>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#F2C7A1" roughness={0.6} />
        </mesh>

        {/* CADAR / NIQAB SYAR'I (Covering Nose, Mouth, and Chin) */}
        <group position={[0, -0.1, 0.25]}>
          {/* Main Niqab Fabric Veil */}
          <mesh castShadow>
            <boxGeometry args={[0.34, 0.28, 0.05]} />
            <meshStandardMaterial color="#F7EDE2" roughness={0.6} />
          </mesh>
          {/* Niqab Lower Draped Fold */}
          <mesh position={[0, -0.16, -0.02]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.36, 0.18, 0.04]} />
            <meshStandardMaterial color="#EDE0D4" roughness={0.6} />
          </mesh>
          {/* Niqab Headband / Upper Tie Band below eyebrows */}
          <mesh position={[0, 0.12, 0.015]}>
            <boxGeometry args={[0.35, 0.04, 0.05]} />
            <meshStandardMaterial color="#E07A5F" roughness={0.5} />
          </mesh>
        </group>

        {/* MATA INDAH BERCADAR (Beautiful Warm Smiling Eyes of 26-year-old mother) */}
        <group scale={[1, eyeScale.current, 1]}>
          {/* Almond-shaped Smiling Eyes */}
          <mesh position={[-0.09, 0.06, 0.31]}>
            <sphereGeometry args={[0.034, 10, 10]} />
            <meshStandardMaterial color="#1A1520" />
          </mesh>
          <mesh position={[0.09, 0.06, 0.31]}>
            <sphereGeometry args={[0.034, 10, 10]} />
            <meshStandardMaterial color="#1A1520" />
          </mesh>
          {/* Gentle Eyelashes / Eye Accent */}
          <mesh position={[-0.09, 0.09, 0.315]} rotation={[0, 0, 0.1]}>
            <boxGeometry args={[0.07, 0.012, 0.01]} />
            <meshStandardMaterial color="#1A1520" />
          </mesh>
          <mesh position={[0.09, 0.09, 0.315]} rotation={[0, 0, -0.1]}>
            <boxGeometry args={[0.07, 0.012, 0.01]} />
            <meshStandardMaterial color="#1A1520" />
          </mesh>
          {/* Eye Sparkle Catchlights */}
          <mesh position={[-0.08, 0.075, 0.335]}>
            <sphereGeometry args={[0.01, 6, 6]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0.1, 0.075, 0.335]}>
            <sphereGeometry args={[0.01, 6, 6]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>

        {/* Gentle Rosy Blushing Cheeks above the Niqab Veil */}
        <mesh position={[-0.13, 0.02, 0.31]}>
          <circleGeometry args={[0.04, 10]} />
          <meshBasicMaterial color="#F48FB1" transparent opacity={0.65} />
        </mesh>
        <mesh position={[0.13, 0.02, 0.31]}>
          <circleGeometry args={[0.04, 10]} />
          <meshBasicMaterial color="#F48FB1" transparent opacity={0.65} />
        </mesh>
      </group>

      {/* Floating Billboard Name Tag (Cukup Nama Saja, Tanpa Umur, Aman dari Atap) */}
      <Billboard position={[0, 2.45, 0]}>
        <mesh>
          <planeGeometry args={[1.3, 0.4]} />
          <meshBasicMaterial color="#E07A5F" transparent opacity={0.88} />
        </mesh>
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.2}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
        >
          Ummi 🧕
        </Text>
      </Billboard>
    </group>
  );
};

// ============================================================================
// 3. KHALID MODEL (ADEK KHALID - 4 TAHUN, MAIN DRUMBAND / SNARE DRUM)
// ============================================================================
const KhalidModel: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const drumGroupRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    const playerPos = gameStore.getState().playerPos;

    const dx = playerPos[0] - position[0];
    const dz = playerPos[2] - position[2];
    const distSq = dx * dx + dz * dz;

    // Drumband tempo: fast, snappy marching cadence
    const drumBeat = Math.sin(time * 14);
    const drumBeatAlt = Math.cos(time * 14 + 0.8);

    // Toddler marching bounce in place
    const marchBounce = Math.abs(Math.sin(time * 6.5)) * 0.06;
    groupRef.current.position.y = position[1] + marchBounce;

    // Alternating knee marching lifts
    if (leftLegRef.current && rightLegRef.current) {
      leftLegRef.current.rotation.x = Math.sin(time * 6.5) * 0.35;
      rightLegRef.current.rotation.x = -Math.sin(time * 6.5) * 0.35;
    }

    if (distSq < 16.0) {
      const targetAngle = Math.atan2(dx, dz);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetAngle,
        delta * 5
      );

      // Proud happy grin & head bobbing
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(time * 3) * 0.1;
        headRef.current.rotation.x = -0.1 + Math.sin(time * 7) * 0.08;
      }

      // Enthusiastic drum rolls!
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.7 + drumBeat * 0.45;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -0.7 + drumBeatAlt * 0.45;
      }
    } else {
      // Steady drumband practice beat
      if (headRef.current) {
        headRef.current.rotation.x = 0.1 + Math.sin(time * 6.5) * 0.08;
      }

      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.65 + drumBeat * 0.35;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -0.65 + drumBeatAlt * 0.35;
      }
    }

    // Drum vibration reaction
    if (drumGroupRef.current) {
      drumGroupRef.current.position.y = 0.72 + Math.abs(drumBeat) * 0.015;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Floor Contact Shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>

      {/* Left Leg (4-year-old active boy) */}
      <group ref={leftLegRef} position={[-0.14, 0.42, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.09, 0.1, 0.46, 10]} />
          <meshStandardMaterial color="#1D3557" />
        </mesh>
        {/* Red & White Sneaker */}
        <mesh position={[0, -0.3, 0.05]} castShadow>
          <boxGeometry args={[0.15, 0.12, 0.28]} />
          <meshStandardMaterial color="#E63946" />
        </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.14, 0.42, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.09, 0.1, 0.46, 10]} />
          <meshStandardMaterial color="#1D3557" />
        </mesh>
        {/* Red & White Sneaker */}
        <mesh position={[0, -0.3, 0.05]} castShadow>
          <boxGeometry args={[0.15, 0.12, 0.28]} />
          <meshStandardMaterial color="#E63946" />
        </mesh>
      </group>

      {/* Torso: Cheerful Yellow & Red Drumband T-Shirt (4 Tahun) */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[0.52, 0.62, 0.34]} />
        <meshStandardMaterial color="#FFD166" />
      </mesh>
      {/* Athletic Stripe on Shirt */}
      <mesh position={[0, 0.95, 0.172]}>
        <boxGeometry args={[0.48, 0.14, 0.01]} />
        <meshStandardMaterial color="#E63946" />
      </mesh>

      {/* Shoulder Drumband Harness Strap (Cross-body support) */}
      <mesh position={[0, 1.05, 0.02]} rotation={[0, 0, 0.55]}>
        <boxGeometry args={[0.1, 0.65, 0.36]} />
        <meshStandardMaterial color="#1D3557" roughness={0.7} />
      </mesh>

      {/* ========================================================= */}
      {/* DRUMBAND SNARE DRUM WITH METALLIC RIMS & STRAP */}
      {/* ========================================================= */}
      <group ref={drumGroupRef} position={[0, 0.72, 0.3]}>
        {/* Drum Shell Cylinder (Bold Drumband Red) */}
        <mesh castShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.24, 18]} />
          <meshStandardMaterial color="#E63946" roughness={0.4} />
        </mesh>
        {/* Top Metallic Gold Counterhoop Rim */}
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.275, 0.275, 0.025, 18]} />
          <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Bottom Metallic Gold Rim */}
        <mesh position={[0, -0.12, 0]}>
          <cylinderGeometry args={[0.275, 0.275, 0.025, 18]} />
          <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Top Drumhead Skin (Clean White Batter Head) */}
        <mesh position={[0, 0.122, 0]}>
          <cylinderGeometry args={[0.258, 0.258, 0.005, 18]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
        {/* Tension Rods around the drum */}
        {[-0.26, 0.26].map((tx, idx) => (
          <mesh key={`rod-${idx}`} position={[tx, 0, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.22, 6]} />
            <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}

        {/* Musical Notes & Stars Rising from the Drum */}
        <Sparkles count={10} position={[0, 0.3, 0]} scale={0.6} size={2.5} speed={1.2} color="#FFD166" />
      </group>

      {/* Left Arm with Wooden Drumstick */}
      <group ref={leftArmRef} position={[-0.32, 1.1, 0.08]}>
        <mesh position={[0, -0.18, 0.1]} rotation={[0.5, 0, -0.2]} castShadow>
          <cylinderGeometry args={[0.065, 0.06, 0.4, 8]} />
          <meshStandardMaterial color="#FFD166" />
        </mesh>
        {/* Left Hand Gripping Drumstick */}
        <mesh position={[0.08, -0.32, 0.18]} castShadow>
          <sphereGeometry args={[0.065, 8, 8]} />
          <meshStandardMaterial color="#F4C7A1" />
        </mesh>
        {/* Left Drumstick (Stik Drum Kayu) */}
        <group position={[0.08, -0.32, 0.18]} rotation={[0.4, 0.3, -0.5]}>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.38, 8]} />
            <meshStandardMaterial color="#D4A373" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.29, 0]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#D4A373" />
          </mesh>
        </group>
      </group>

      {/* Right Arm with Wooden Drumstick */}
      <group ref={rightArmRef} position={[0.32, 1.1, 0.08]}>
        <mesh position={[0, -0.18, 0.1]} rotation={[0.5, 0, 0.2]} castShadow>
          <cylinderGeometry args={[0.065, 0.06, 0.4, 8]} />
          <meshStandardMaterial color="#FFD166" />
        </mesh>
        {/* Right Hand Gripping Drumstick */}
        <mesh position={[-0.08, -0.32, 0.18]} castShadow>
          <sphereGeometry args={[0.065, 8, 8]} />
          <meshStandardMaterial color="#F4C7A1" />
        </mesh>
        {/* Right Drumstick (Stik Drum Kayu) */}
        <group position={[-0.08, -0.32, 0.18]} rotation={[0.4, -0.3, 0.5]}>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.38, 8]} />
            <meshStandardMaterial color="#D4A373" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.29, 0]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#D4A373" />
          </mesh>
        </group>
      </group>

      {/* Head Group: Khalid (4 Tahun, Lincah & Ceria) */}
      <group ref={headRef} position={[0, 1.48, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.26, 16, 16]} />
          <meshStandardMaterial color="#F4C7A1" />
        </mesh>
        {/* Spunky Boy Haircut */}
        <mesh position={[0, 0.14, -0.04]} castShadow>
          <sphereGeometry args={[0.27, 14, 14]} />
          <meshStandardMaterial color="#1E1E24" />
        </mesh>
        {/* Cute Marching Band Beret / Cap */}
        <group position={[0, 0.26, 0]} rotation={[-0.1, 0, -0.15]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.22, 0.25, 0.1, 16]} />
            <meshStandardMaterial color="#E63946" />
          </mesh>
          {/* Gold Star Badge on Cap */}
          <mesh position={[0, 0.02, 0.24]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>

        {/* Big Energetic Sparkly Eyes */}
        <mesh position={[-0.08, 0.03, 0.24]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        <mesh position={[0.08, 0.03, 0.24]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        {/* Catchlights */}
        <mesh position={[-0.07, 0.045, 0.265]}>
          <sphereGeometry args={[0.009, 6, 6]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.09, 0.045, 0.265]}>
          <sphereGeometry args={[0.009, 6, 6]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>

        {/* Rosy Toddler Cheeks */}
        <mesh position={[-0.12, -0.03, 0.23]}>
          <circleGeometry args={[0.035, 8]} />
          <meshBasicMaterial color="#FF8FA3" transparent opacity={0.7} />
        </mesh>
        <mesh position={[0.12, -0.03, 0.23]}>
          <circleGeometry args={[0.035, 8]} />
          <meshBasicMaterial color="#FF8FA3" transparent opacity={0.7} />
        </mesh>

        {/* Wide Laughing Mouth */}
        <mesh position={[0, -0.09, 0.24]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#D81159" />
        </mesh>
      </group>

      {/* Floating Billboard Name Tag (Cukup Nama Saja, Tanpa Umur) */}
      <Billboard position={[0, 1.95, 0]}>
        <mesh>
          <planeGeometry args={[1.7, 0.4]} />
          <meshBasicMaterial color="#E63946" transparent opacity={0.88} />
        </mesh>
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.2}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
        >
          Adek Khalid 🥁
        </Text>
      </Billboard>
    </group>
  );
};

// ============================================================================
// 4. FAQIH MODEL (ADEK FAQIH - 2 TAHUN, BALITA GEMAS, MAIN MOBILAN)
// ============================================================================
const FaqihModel: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const toyCarRef = useRef<THREE.Group>(null);
  const rightHandRef = useRef<THREE.Group>(null);
  const wheelRefs = useRef<(THREE.Mesh | null)[]>([]);
  const eyeScale = useRef(1);
  const blinkTimer = useRef(2.2);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    const playerPos = gameStore.getState().playerPos;

    // Blinking
    blinkTimer.current -= delta;
    if (blinkTimer.current <= 0) {
      eyeScale.current = 0.1;
      if (blinkTimer.current <= -0.14) {
        eyeScale.current = 1.0;
        blinkTimer.current = 2.0 + Math.random() * 2.5;
      }
    }

    const dx = playerPos[0] - position[0];
    const dz = playerPos[2] - position[2];
    const distSq = dx * dx + dz * dz;

    // Toy car cruising motion back and forth on the play mat
    const carCycle = Math.sin(time * 2.6);
    const carTravel = carCycle * 0.26;

    if (distSq < 16.0) {
      const targetAngle = Math.atan2(dx, dz);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetAngle,
        delta * 3.5
      );

      // Faqih excitedly lifts toy car up to show Mbak Khaulah!
      if (toyCarRef.current) {
        toyCarRef.current.position.y = 0.35 + Math.sin(time * 4) * 0.06;
        toyCarRef.current.position.z = 0.22;
        toyCarRef.current.rotation.x = -0.2 + Math.sin(time * 4) * 0.15;
      }
      if (rightHandRef.current) {
        rightHandRef.current.rotation.x = -0.4 + Math.sin(time * 4) * 0.2;
      }
      if (headRef.current) {
        headRef.current.rotation.x = -0.15 + Math.sin(time * 2) * 0.06;
        headRef.current.rotation.z = Math.sin(time * 3) * 0.08;
      }
    } else {
      // Normal playing: Pushing car back and forth on play mat
      if (toyCarRef.current) {
        toyCarRef.current.position.z = 0.3 + carTravel;
        toyCarRef.current.position.y = 0.07;
        toyCarRef.current.rotation.x = 0;
        toyCarRef.current.rotation.y = Math.cos(time * 2.6) * 0.12;
      }

      // Wheels spin as car travels
      wheelRefs.current.forEach((wheel) => {
        if (wheel) {
          wheel.rotation.x += carCycle * delta * 14;
        }
      });

      // Faqih leans his little body and arm forward & back with the car
      if (rightHandRef.current) {
        rightHandRef.current.rotation.x = 0.35 + carTravel * 0.8;
      }
      if (headRef.current) {
        headRef.current.rotation.x = 0.2 + carTravel * 0.3; // Looking down at car
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Floor Contact Shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.7, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>

      {/* ========================================================= */}
      {/* COLORFUL PLAY MAT (KARPET BERMAIN MINI SIRKUIT MOBIL) */}
      {/* ========================================================= */}
      <group position={[0, 0.025, 0.1]}>
        {/* Soft Oval Play Mat Base */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[0.78, 24]} />
          <meshStandardMaterial color="#80ED99" roughness={0.7} />
        </mesh>
        {/* Mini Road Track Oval Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
          <ringGeometry args={[0.35, 0.65, 24]} />
          <meshBasicMaterial color="#4A5568" />
        </mesh>
        {/* Road Track Dashes */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
          <ringGeometry args={[0.49, 0.51, 16]} />
          <meshBasicMaterial color="#F6E05E" />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* DETAILED TOY CAR (MOBIL-MOBILAN BALAP MINI KEREN) */}
      {/* ========================================================= */}
      <group ref={toyCarRef} position={[0.1, 0.07, 0.35]}>
        {/* Sleek Red Sports Car Body */}
        <mesh position={[0, 0.05, 0]} castShadow>
          <boxGeometry args={[0.22, 0.08, 0.36]} />
          <meshStandardMaterial color="#E63946" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Cockpit / Windshield (Tinted Cyan Glass) */}
        <mesh position={[0, 0.1, -0.02]} castShadow>
          <boxGeometry args={[0.18, 0.065, 0.18]} />
          <meshStandardMaterial color="#A8DADC" roughness={0.2} />
        </mesh>
        {/* Cute Rear Spoiler */}
        <mesh position={[0, 0.12, -0.16]}>
          <boxGeometry args={[0.2, 0.02, 0.04]} />
          <meshStandardMaterial color="#1D3557" />
        </mesh>
        {/* Front Headlights */}
        <mesh position={[-0.07, 0.05, 0.182]}>
          <boxGeometry args={[0.04, 0.03, 0.01]} />
          <meshBasicMaterial color="#FFD166" />
        </mesh>
        <mesh position={[0.07, 0.05, 0.182]}>
          <boxGeometry args={[0.04, 0.03, 0.01]} />
          <meshBasicMaterial color="#FFD166" />
        </mesh>

        {/* 4 Chunky Toy Car Wheels (Animatable Rotation) */}
        {[-0.12, 0.12].map((wx, i) =>
          [-0.1, 0.1].map((wz, j) => {
            const idx = i * 2 + j;
            return (
              <mesh
                key={`car-wheel-${idx}`}
                ref={(el) => (wheelRefs.current[idx] = el)}
                position={[wx, 0.035, wz]}
                rotation={[0, 0, Math.PI / 2]}
                castShadow
              >
                <cylinderGeometry args={[0.04, 0.04, 0.03, 12]} />
                <meshStandardMaterial color="#1E1E24" roughness={0.8} />
              </mesh>
            );
          })
        )}

        {/* Mini Speed Sparkles */}
        <Sparkles count={5} scale={0.3} size={2} speed={1.5} color="#FFD166" />
      </group>

      {/* ========================================================= */}
      {/* ADEK FAQIH (2 TAHUN, BALITA MUNGIL DUDUK BERSILA / ONESIE) */}
      {/* ========================================================= */}
      <group position={[0, 0, 0]}>
        {/* Chubby Sitting Legs in Mint Green Onesie */}
        <mesh position={[-0.14, 0.12, 0.12]} rotation={[0.4, -0.5, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.09, 0.28, 10]} />
          <meshStandardMaterial color="#57CC99" />
        </mesh>
        <mesh position={[0.14, 0.12, 0.12]} rotation={[0.4, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.09, 0.28, 10]} />
          <meshStandardMaterial color="#57CC99" />
        </mesh>
        {/* Tiny Baby Booties / Socks */}
        <mesh position={[-0.18, 0.08, 0.24]}>
          <sphereGeometry args={[0.065, 8, 8]} />
          <meshStandardMaterial color="#FFB703" />
        </mesh>
        <mesh position={[0.18, 0.08, 0.24]}>
          <sphereGeometry args={[0.065, 8, 8]} />
          <meshStandardMaterial color="#FFB703" />
        </mesh>

        {/* Chubby Toddler Torso (Mint Green Onesie with Yellow Pocket) */}
        <mesh position={[0, 0.36, 0.02]} castShadow>
          <sphereGeometry args={[0.24, 14, 14]} />
          <meshStandardMaterial color="#57CC99" />
        </mesh>
        <mesh position={[0, 0.34, 0.22]}>
          <boxGeometry args={[0.12, 0.1, 0.02]} />
          <meshStandardMaterial color="#FFB703" />
        </mesh>

        {/* Left Arm Resting on Ground */}
        <mesh position={[-0.22, 0.32, 0.14]} rotation={[0.5, 0, -0.3]} castShadow>
          <cylinderGeometry args={[0.05, 0.045, 0.28, 8]} />
          <meshStandardMaterial color="#57CC99" />
        </mesh>
        <mesh position={[-0.22, 0.16, 0.26]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshStandardMaterial color="#F7D6BF" />
        </mesh>

        {/* Right Arm (Pushing / Playing with the Toy Car) */}
        <group ref={rightHandRef} position={[0.18, 0.42, 0.1]}>
          <mesh position={[0, -0.15, 0.1]} rotation={[0.6, 0, 0.2]} castShadow>
            <cylinderGeometry args={[0.05, 0.045, 0.32, 8]} />
            <meshStandardMaterial color="#57CC99" />
          </mesh>
          {/* Right Hand touching car */}
          <mesh position={[0, -0.3, 0.22]} castShadow>
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshStandardMaterial color="#F7D6BF" />
          </mesh>
        </group>

        {/* Chubby Baby Head with Bear Ear Cap (2 Tahun) */}
        <group ref={headRef} position={[0, 0.68, 0.06]}>
          <mesh castShadow>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color="#F7D6BF" />
          </mesh>
          {/* Cute Soft Cap with Bear Ears */}
          <mesh position={[0, 0.06, -0.02]}>
            <sphereGeometry args={[0.228, 14, 14, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
            <meshStandardMaterial color="#FFB703" />
          </mesh>
          {/* Bear Ear Left */}
          <mesh position={[-0.14, 0.22, 0]}>
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshStandardMaterial color="#FFB703" />
          </mesh>
          {/* Bear Ear Right */}
          <mesh position={[0.14, 0.22, 0]}>
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshStandardMaterial color="#FFB703" />
          </mesh>

          {/* Big Innocent Sparkling Baby Eyes with Blinking */}
          <group scale={[1, eyeScale.current, 1]}>
            <mesh position={[-0.07, 0.02, 0.2]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshStandardMaterial color="#111111" />
            </mesh>
            <mesh position={[0.07, 0.02, 0.2]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshStandardMaterial color="#111111" />
            </mesh>
            {/* Catchlights */}
            <mesh position={[-0.06, 0.035, 0.22]}>
              <sphereGeometry args={[0.009, 6, 6]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
            <mesh position={[0.08, 0.035, 0.22]}>
              <sphereGeometry args={[0.009, 6, 6]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          </group>

          {/* Chubby Rosy Cheeks */}
          <mesh position={[-0.1, -0.04, 0.19]}>
            <circleGeometry args={[0.035, 8]} />
            <meshBasicMaterial color="#FF80AB" transparent opacity={0.75} />
          </mesh>
          <mesh position={[0.1, -0.04, 0.19]}>
            <circleGeometry args={[0.035, 8]} />
            <meshBasicMaterial color="#FF80AB" transparent opacity={0.75} />
          </mesh>

          {/* Sweet Laughing Mouth */}
          <mesh position={[0, -0.08, 0.2]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color="#EF476F" />
          </mesh>
        </group>
      </group>

      {/* Floating Billboard Name Tag (Cukup Nama Saja, Tanpa Umur) */}
      <Billboard position={[0, 1.35, 0]}>
        <mesh>
          <planeGeometry args={[1.5, 0.4]} />
          <meshBasicMaterial color="#2A9D8F" transparent opacity={0.88} />
        </mesh>
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.2}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
        >
          Adek Faqih 🚗
        </Text>
      </Billboard>
    </group>
  );
};

// ============================================================================
// MAIN FAMILY COMPONENT WITH PROXIMITY DETECTION & INTERACTION
// ============================================================================
const FAMILY_MEMBERS = [
  {
    id: 'abi',
    pos: [-3.0, 0.2, -4.5] as [number, number, number],
    title: 'Abi',
    prompt: 'Tekan [E] untuk Sapa Abi! 💻',
    dialog: {
      speaker: 'Abi',
      role: 'Ayah Tercinta 💻',
      avatarBg: 'bg-blue-600',
      text: 'Assalamu\'alaikum Khaulah putri shalihah Abi! Abi sedang fokus menyelesaikan pekerjaan dan coding di laptop untuk keluarga. Tapi melihat senyum ceria Khaulah membuat lelah Abi langsung hilang! Semangat selalu ya nak!',
      actionText: '💻 Tos Semangat sama Abi! ✨',
      actionType: 'high_five' as const,
    },
  },
  {
    id: 'ummi',
    pos: [2.8, 0.2, -4.2] as [number, number, number],
    title: 'Ummi',
    prompt: 'Tekan [E] untuk Sapa Ummi! 🧕🧹',
    dialog: {
      speaker: 'Ummi',
      role: 'Ibu Tercinta Bercadar 🧕',
      avatarBg: 'bg-rose-500',
      text: 'Assalamu\'alaikum Khaulah bidadari kecil Ummi! Kebersihan itu sebagian dari iman, nak. Ummi sedang menyapu teras agar rumah kita selalu asri dan rapi. Ummi sudah siapkan bekal cinta terenak untuk Khaulah, ayo ambil sayang!',
      actionText: '🧹 Ambil Bekal Berkah Ummi! (+Speed Boost ⚡)',
      actionType: 'take_snack' as const,
    },
  },
  {
    id: 'khalid',
    pos: [-1.8, 0.2, -1.8] as [number, number, number],
    title: 'Adek Khalid',
    prompt: 'Tekan [E] untuk Main Drumband! 🥁',
    dialog: {
      speaker: 'Adek Khalid',
      role: 'Pemain Drumband Cilik 👦🥁',
      avatarBg: 'bg-amber-500',
      text: 'Mbak Khaulah lihat nih! Khalid lagi latihan drumband! Dum-tak-tak-dum ratatat! Nanti pas pawai drum band di TK, Khalid mau main paling hebat bareng Mbak Khaulah!',
      actionText: '🥁 Main Drumband Bareng Khalid! 🎶',
      actionType: 'play_drumband' as const,
    },
  },
  {
    id: 'faqih',
    pos: [2.0, 0.2, -1.8] as [number, number, number],
    title: 'Adek Faqih',
    prompt: 'Tekan [E] untuk Main Mobilan! 🚗',
    dialog: {
      speaker: 'Adek Faqih',
      role: 'Adik Gemas Balap Mobilan 👶🚗',
      avatarBg: 'bg-emerald-500',
      text: 'Ngeeeng! Brum brum pip pip! Adek Faqih lagi seru banget ngebutin mobil-mobilan di karpet lintasan! Mbak Khaulah ayo balapan mobilan bareng Faqih!',
      actionText: '🚗 Balapan Mobilan bareng Faqih! 💨',
      actionType: 'play_toycar' as const,
    },
  },
];

export const FamilyMembers: React.FC = () => {
  const lastNearId = useRef<string | null>(null);

  useFrame(() => {
    const playerPos = gameStore.getState().playerPos;

    let foundNear: (typeof FAMILY_MEMBERS)[0] | null = null;
    for (const m of FAMILY_MEMBERS) {
      const distSq =
        Math.pow(playerPos[0] - m.pos[0], 2) +
        Math.pow(playerPos[1] - m.pos[1], 2) +
        Math.pow(playerPos[2] - m.pos[2], 2);
      if (distSq < 6.0) {
        foundNear = m;
        break;
      }
    }

    if (foundNear) {
      if (lastNearId.current !== foundNear.id) {
        lastNearId.current = foundNear.id;
        gameStore.setNearbyInteractable({
          id: foundNear.id,
          title: foundNear.title,
          prompt: foundNear.prompt,
        });
      }
    } else {
      if (lastNearId.current !== null) {
        lastNearId.current = null;
        gameStore.setNearbyInteractable(null);
      }
    }
  });

  return (
    <group>
      {/* 1. Abi (27 Tahun, Depan Laptop Tanpa Kacamata) */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          gameStore.openDialog(FAMILY_MEMBERS[0].dialog);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <AbiModel position={[-3.0, 0.2, -4.5]} />
      </group>

      {/* 2. Ummi (26 Tahun, Bercadar Menyapu Teras) */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          gameStore.openDialog(FAMILY_MEMBERS[1].dialog);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <UmmiModel position={[2.8, 0.2, -4.2]} />
      </group>

      {/* 3. Adek Khalid (4 Tahun, Main Drumband) */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          gameStore.openDialog(FAMILY_MEMBERS[2].dialog);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <KhalidModel position={[-1.8, 0.2, -1.8]} />
      </group>

      {/* 4. Adek Faqih (2 Tahun, Main Mobilan) */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          gameStore.openDialog(FAMILY_MEMBERS[3].dialog);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <FaqihModel position={[2.0, 0.2, -1.8]} />
      </group>
    </group>
  );
};
