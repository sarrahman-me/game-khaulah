import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { gameStore } from '../../../state/useGameStore';

// --- 1. ABI (AYAH) 3D MODEL ---
const AbiModel: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const groupRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
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

    if (distSq < 20.0) {
      // Smoothly look at Khaulah
      const targetAngle = Math.atan2(dx, dz);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetAngle, delta * 4);

      // Cheerful wave arm & welcoming gesture
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = -1.2 + Math.sin(time * 6) * 0.35;
        rightArmRef.current.rotation.x = -0.4;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.z = 0.2 + Math.sin(time * 2.5) * 0.08;
      }
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(time * 3) * 0.08;
      }
    } else {
      // Idle pose: relaxed breathing
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = -0.15 + Math.sin(time * 1.5) * 0.05;
        rightArmRef.current.rotation.x = 0;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.z = 0.15 - Math.sin(time * 1.5) * 0.05;
      }
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(time * 1.2) * 0.04;
      }
    }

    // Gentle breathing
    if (headRef.current) {
      headRef.current.position.y = 2.45 + Math.sin(time * 2.2) * 0.025;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Shadow disc */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.7, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>

      {/* Shoes */}
      <mesh position={[-0.22, 0.1, 0]} castShadow>
        <boxGeometry args={[0.22, 0.2, 0.45]} />
        <meshStandardMaterial color="#2B2D42" roughness={0.7} />
      </mesh>
      <mesh position={[0.22, 0.1, 0]} castShadow>
        <boxGeometry args={[0.22, 0.2, 0.45]} />
        <meshStandardMaterial color="#2B2D42" roughness={0.7} />
      </mesh>

      {/* Dark Navy Trousers */}
      <mesh position={[-0.22, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.18, 1.1, 12]} />
        <meshStandardMaterial color="#1D2A44" roughness={0.7} />
      </mesh>
      <mesh position={[0.22, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.18, 1.1, 12]} />
        <meshStandardMaterial color="#1D2A44" roughness={0.7} />
      </mesh>

      {/* Torso: Elegant Blue Koko Shirt */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <boxGeometry args={[0.8, 1.05, 0.5]} />
        <meshStandardMaterial color="#3A86FF" roughness={0.6} />
      </mesh>
      {/* White center collar stripe */}
      <mesh position={[0, 1.75, 0.26]}>
        <boxGeometry args={[0.12, 0.95, 0.02]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
      </mesh>

      {/* Left Arm (Relaxed) */}
      <group ref={leftArmRef} position={[-0.48, 2.05, 0]}>
        <mesh position={[0, -0.4, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.1, 0.75, 10]} />
          <meshStandardMaterial color="#3A86FF" roughness={0.6} />
        </mesh>
        {/* Left Hand */}
        <mesh position={[0, -0.82, 0]} castShadow>
          <sphereGeometry args={[0.11, 10, 10]} />
          <meshStandardMaterial color="#E8BE96" roughness={0.5} />
        </mesh>
      </group>

      {/* Right Arm (Waving / Greeting) */}
      <group ref={rightArmRef} position={[0.48, 2.05, 0]}>
        <mesh position={[0, -0.4, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.1, 0.75, 10]} />
          <meshStandardMaterial color="#3A86FF" roughness={0.6} />
        </mesh>
        {/* Right Hand */}
        <mesh position={[0, -0.82, 0]} castShadow>
          <sphereGeometry args={[0.11, 10, 10]} />
          <meshStandardMaterial color="#E8BE96" roughness={0.5} />
        </mesh>
      </group>

      {/* Head Group */}
      <group ref={headRef} position={[0, 2.45, 0]}>
        {/* Neck */}
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.12, 0.14, 0.2, 10]} />
          <meshStandardMaterial color="#E8BE96" />
        </mesh>
        {/* Face */}
        <mesh castShadow>
          <sphereGeometry args={[0.34, 16, 16]} />
          <meshStandardMaterial color="#F2C7A1" roughness={0.6} />
        </mesh>
        {/* Neat Hair / Peci Hitam Elegan */}
        <mesh position={[0, 0.24, -0.02]} castShadow>
          <cylinderGeometry args={[0.32, 0.35, 0.25, 16]} />
          <meshStandardMaterial color="#1E1E24" roughness={0.8} />
        </mesh>
        {/* Friendly Glasses */}
        <mesh position={[-0.13, 0.05, 0.32]}>
          <torusGeometry args={[0.08, 0.015, 8, 16]} />
          <meshStandardMaterial color="#2B2D42" />
        </mesh>
        <mesh position={[0.13, 0.05, 0.32]}>
          <torusGeometry args={[0.08, 0.015, 8, 16]} />
          <meshStandardMaterial color="#2B2D42" />
        </mesh>
        <mesh position={[0, 0.05, 0.34]}>
          <boxGeometry args={[0.1, 0.02, 0.02]} />
          <meshStandardMaterial color="#2B2D42" />
        </mesh>
        {/* Eyes (warm smile with blinking) */}
        <group scale={[1, eyeScale.current, 1]}>
          <mesh position={[-0.13, 0.05, 0.31]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
          <mesh position={[0.13, 0.05, 0.31]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
        </group>
        {/* Warm Smiling Mouth */}
        <mesh position={[0, -0.12, 0.32]}>
          <torusGeometry args={[0.07, 0.018, 6, 12, Math.PI]} />
          <meshStandardMaterial color="#9C4444" />
        </mesh>
      </group>

      {/* Floating Billboard Name Tag */}
      <Billboard position={[0, 3.2, 0]}>
        <mesh>
          <planeGeometry args={[1.8, 0.48]} />
          <meshBasicMaterial color="#1D3557" transparent opacity={0.85} />
        </mesh>
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.22}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
        >
          Abi (Ayah) 👨‍👧
        </Text>
      </Billboard>
    </group>
  );
};

// --- 2. UMMI (IBU) 3D MODEL ---
const UmmiModel: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const snackBoxRef = useRef<THREE.Group>(null);
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
        blinkTimer.current = 3.0 + Math.random() * 2.5;
      }
    }

    const dx = playerPos[0] - position[0];
    const dz = playerPos[2] - position[2];
    const distSq = dx * dx + dz * dz;

    if (distSq < 20.0) {
      const targetAngle = Math.atan2(dx, dz);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetAngle, delta * 4);
      if (headRef.current) {
        headRef.current.rotation.z = Math.sin(time * 2.5) * 0.06; // Loving head tilt
      }
    }

    if (headRef.current) {
      headRef.current.position.y = 2.3 + Math.sin(time * 2.2) * 0.025;
    }

    if (snackBoxRef.current) {
      snackBoxRef.current.position.y = 1.35 + Math.sin(time * 3.5) * 0.04;
      snackBoxRef.current.rotation.y = Math.sin(time * 1.5) * 0.12;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.7, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>

      {/* Elegant Pastel Peach/Rose Gamis Skirt (Flared Cone) */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <coneGeometry args={[0.65, 1.45, 16]} />
        <meshStandardMaterial color="#F4A261" roughness={0.7} />
      </mesh>

      {/* Gamis Torso */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[0.68, 0.85, 0.42]} />
        <meshStandardMaterial color="#E76F51" roughness={0.6} />
      </mesh>

      {/* Hijab Drape over shoulders & chest */}
      <mesh position={[0, 1.82, 0.08]} castShadow>
        <coneGeometry args={[0.55, 0.65, 16]} />
        <meshStandardMaterial color="#F8EDEB" roughness={0.5} />
      </mesh>

      {/* Arms holding the lunchbox */}
      <mesh position={[-0.4, 1.45, 0.2]} rotation={[0.6, 0.3, -0.4]} castShadow>
        <cylinderGeometry args={[0.09, 0.08, 0.6, 10]} />
        <meshStandardMaterial color="#E76F51" />
      </mesh>
      <mesh position={[0.4, 1.45, 0.2]} rotation={[0.6, -0.3, 0.4]} castShadow>
        <cylinderGeometry args={[0.09, 0.08, 0.6, 10]} />
        <meshStandardMaterial color="#E76F51" />
      </mesh>

      {/* Cute Bento / Bekal Lunchbox with Ribbon & Golden Sparkles */}
      <group ref={snackBoxRef} position={[0, 1.35, 0.42]}>
        <mesh castShadow>
          <boxGeometry args={[0.42, 0.22, 0.3]} />
          <meshStandardMaterial color="#FFB703" roughness={0.4} />
        </mesh>
        {/* Pink Ribbon */}
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.15, 0.04, 0.31]} />
          <meshStandardMaterial color="#FF006E" />
        </mesh>
        <mesh position={[0, 0.16, 0]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="#FF006E" />
        </mesh>
        {/* Golden sparkles rising from Bekal Cinta Ummi */}
        <Sparkles count={12} scale={0.7} size={2.5} speed={0.8} color="#FFE66D" />
      </group>

      {/* Head Group */}
      <group ref={headRef} position={[0, 2.3, 0]}>
        {/* Full Syar'i Hijab Head */}
        <mesh castShadow>
          <sphereGeometry args={[0.36, 18, 18]} />
          <meshStandardMaterial color="#F8EDEB" roughness={0.5} />
        </mesh>
        {/* Face */}
        <mesh position={[0, -0.02, 0.12]} castShadow>
          <sphereGeometry args={[0.26, 16, 16]} />
          <meshStandardMaterial color="#F2C7A1" roughness={0.6} />
        </mesh>
        {/* Warm Smiling Eyes with Blinking */}
        <group scale={[1, eyeScale.current, 1]}>
          <mesh position={[-0.1, 0.04, 0.33]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color="#1A1520" />
          </mesh>
          <mesh position={[0.1, 0.04, 0.33]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color="#1A1520" />
          </mesh>
        </group>
        {/* Gentle Blushing Cheeks */}
        <mesh position={[-0.14, -0.04, 0.33]}>
          <circleGeometry args={[0.045, 10]} />
          <meshBasicMaterial color="#F48FB1" transparent opacity={0.8} />
        </mesh>
        <mesh position={[0.14, -0.04, 0.33]}>
          <circleGeometry args={[0.045, 10]} />
          <meshBasicMaterial color="#F48FB1" transparent opacity={0.8} />
        </mesh>
        {/* Kind Loving Smile */}
        <mesh position={[0, -0.1, 0.34]}>
          <torusGeometry args={[0.06, 0.015, 6, 12, Math.PI]} />
          <meshStandardMaterial color="#D81159" />
        </mesh>
      </group>

      {/* Floating Billboard Name Tag */}
      <Billboard position={[0, 3.0, 0]}>
        <mesh>
          <planeGeometry args={[1.8, 0.48]} />
          <meshBasicMaterial color="#E76F51" transparent opacity={0.85} />
        </mesh>
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.22}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
        >
          Ummi (Ibu) 🧕💕
        </Text>
      </Billboard>
    </group>
  );
};

// --- 3. ADEK KHALID 3D MODEL (ENERGETIC TODDLER BOY KICKING BALL) ---
const KhalidModel: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const groupRef = useRef<THREE.Group>(null);
  const ballRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    const playerPos = gameStore.getState().playerPos;

    const dx = playerPos[0] - position[0];
    const dz = playerPos[2] - position[2];
    const distSq = dx * dx + dz * dz;

    // Cheerful excited hopping
    const hop = Math.abs(Math.sin(time * 5.5)) * 0.14;
    groupRef.current.position.y = position[1] + hop;

    // Toddler leg run/hop motion
    if (rightLegRef.current && leftLegRef.current) {
      rightLegRef.current.rotation.x = Math.sin(time * 8) * 0.45;
      leftLegRef.current.rotation.x = -Math.sin(time * 8) * 0.45;
    }

    if (distSq < 16.0) {
      const targetAngle = Math.atan2(dx, dz);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetAngle, delta * 5);
    }

    // Bouncing and rolling soccer ball
    if (ballRef.current) {
      const kickCycle = Math.sin(time * 3);
      ballRef.current.position.z = 0.4 + kickCycle * 0.55;
      ballRef.current.position.y = 0.24 + Math.abs(Math.sin(time * 6)) * 0.28;
      ballRef.current.rotation.x += delta * 5;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.45, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>

      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.14, 0.42, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.11, 0.12, 0.5, 10]} />
          <meshStandardMaterial color="#457B9D" />
        </mesh>
        <mesh position={[0, -0.34, 0.05]} castShadow>
          <boxGeometry args={[0.16, 0.14, 0.32]} />
          <meshStandardMaterial color="#E63946" />
        </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.14, 0.42, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.11, 0.12, 0.5, 10]} />
          <meshStandardMaterial color="#457B9D" />
        </mesh>
        <mesh position={[0, -0.34, 0.05]} castShadow>
          <boxGeometry args={[0.16, 0.14, 0.32]} />
          <meshStandardMaterial color="#E63946" />
        </mesh>
      </group>

      {/* Bright Yellow T-Shirt */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[0.55, 0.65, 0.35]} />
        <meshStandardMaterial color="#FFD166" />
      </mesh>

      {/* Little Arms */}
      <mesh position={[-0.34, 0.92, 0.08]} rotation={[0.3, 0, -0.4]} castShadow>
        <cylinderGeometry args={[0.07, 0.06, 0.42, 8]} />
        <meshStandardMaterial color="#FFD166" />
      </mesh>
      <mesh position={[0.34, 0.92, 0.08]} rotation={[0.3, 0, 0.4]} castShadow>
        <cylinderGeometry args={[0.07, 0.06, 0.42, 8]} />
        <meshStandardMaterial color="#FFD166" />
      </mesh>

      {/* Big Toddler Head */}
      <group position={[0, 1.48, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial color="#F4C7A1" />
        </mesh>
        {/* Short Cute Spiky Hair */}
        <mesh position={[0, 0.16, -0.04]} castShadow>
          <sphereGeometry args={[0.29, 14, 14]} />
          <meshStandardMaterial color="#2B2D42" />
        </mesh>
        {/* Big Sparkly Playful Eyes */}
        <mesh position={[-0.09, 0.03, 0.26]}>
          <sphereGeometry args={[0.038, 8, 8]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        <mesh position={[0.09, 0.03, 0.26]}>
          <sphereGeometry args={[0.038, 8, 8]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        {/* Wide Happy Laughing Mouth */}
        <mesh position={[0, -0.1, 0.27]}>
          <sphereGeometry args={[0.065, 8, 8]} />
          <meshStandardMaterial color="#D81159" />
        </mesh>
      </group>

      {/* Soccer Ball beside Khalid */}
      <group ref={ballRef} position={[0.45, 0.24, 0.4]}>
        <mesh castShadow>
          <sphereGeometry args={[0.24, 14, 14]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
        <mesh>
          <dodecahedronGeometry args={[0.243]} />
          <meshStandardMaterial color="#1D2A44" wireframe />
        </mesh>
      </group>

      {/* Floating Billboard Name Tag */}
      <Billboard position={[0, 2.1, 0]}>
        <mesh>
          <planeGeometry args={[1.9, 0.48]} />
          <meshBasicMaterial color="#E76F51" transparent opacity={0.85} />
        </mesh>
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.22}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
        >
          Adek Khalid 👦⚽
        </Text>
      </Billboard>
    </group>
  );
};

// --- 4. ADEK FAQIH 3D MODEL (BABY IN STROLLER WITH CUTE RATTLE) ---
const FaqihModel: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const groupRef = useRef<THREE.Group>(null);
  const rattleRef = useRef<THREE.Group>(null);
  const babyHandsRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    const playerPos = gameStore.getState().playerPos;

    const dx = playerPos[0] - position[0];
    const dz = playerPos[2] - position[2];
    const distSq = dx * dx + dz * dz;

    if (distSq < 16.0) {
      const targetAngle = Math.atan2(dx, dz);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetAngle, delta * 3.5);
    }

    // Shake baby rattle & wave tiny hands
    if (rattleRef.current) {
      rattleRef.current.rotation.z = Math.sin(time * 12) * 0.4;
      rattleRef.current.position.y = 0.85 + Math.sin(time * 6) * 0.04;
    }
    if (babyHandsRef.current) {
      babyHandsRef.current.rotation.x = Math.sin(time * 8) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.65, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>

      {/* 4 Stroller Wheels */}
      {[-0.32, 0.32].map((wx, i) =>
        [-0.35, 0.35].map((wz, j) => (
          <mesh key={`${i}-${j}`} position={[wx, 0.16, wz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.16, 0.16, 0.08, 12]} />
            <meshStandardMaterial color="#4A4E69" />
          </mesh>
        ))
      )}

      {/* Stroller Frame & Seat */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.68, 0.3, 0.85]} />
        <meshStandardMaterial color="#A8DADC" roughness={0.4} />
      </mesh>
      {/* Stroller Sun Canopy Hood */}
      <mesh position={[0, 0.9, -0.15]} rotation={[0.4, 0, 0]} castShadow>
        <sphereGeometry args={[0.48, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#457B9D" side={THREE.DoubleSide} />
      </mesh>

      {/* --- BABY FAQIH SITTING INSIDE --- */}
      {/* Baby Onesie (Pastel Yellow) */}
      <mesh position={[0, 0.65, 0.05]} castShadow>
        <sphereGeometry args={[0.26, 14, 14]} />
        <meshStandardMaterial color="#FFF176" />
      </mesh>

      {/* Baby Hands */}
      <group ref={babyHandsRef} position={[0, 0.75, 0.22]}>
        <mesh position={[-0.14, 0, 0]} castShadow>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="#F7D6BF" />
        </mesh>
        <mesh position={[0.14, 0, 0]} castShadow>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="#F7D6BF" />
        </mesh>
      </group>

      {/* Baby Head */}
      <group position={[0, 1.0, 0.08]}>
        <mesh castShadow>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#F7D6BF" />
        </mesh>
        {/* Cute Baby Knit Bonnet / Cap */}
        <mesh position={[0, 0.08, -0.02]}>
          <sphereGeometry args={[0.228, 14, 14, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
          <meshStandardMaterial color="#81C784" />
        </mesh>
        {/* Big Innocent Round Baby Eyes */}
        <mesh position={[-0.07, 0.02, 0.2]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        <mesh position={[0.07, 0.02, 0.2]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        {/* Rosy Baby Cheeks */}
        <mesh position={[-0.1, -0.04, 0.2]}>
          <circleGeometry args={[0.035, 8]} />
          <meshBasicMaterial color="#FF80AB" transparent opacity={0.8} />
        </mesh>
        <mesh position={[0.1, -0.04, 0.2]}>
          <circleGeometry args={[0.035, 8]} />
          <meshBasicMaterial color="#FF80AB" transparent opacity={0.8} />
        </mesh>
        {/* Tiny Baby Pacifier */}
        <mesh position={[0, -0.08, 0.22]}>
          <torusGeometry args={[0.035, 0.012, 6, 12]} />
          <meshStandardMaterial color="#FF4081" />
        </mesh>
      </group>

      {/* Shaking Baby Rattle with Sparkles */}
      <group ref={rattleRef} position={[0.22, 0.85, 0.32]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.22, 8]} />
          <meshStandardMaterial color="#FFD166" />
        </mesh>
        <mesh position={[0, 0.12, 0]} castShadow>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshStandardMaterial color="#EF476F" />
        </mesh>
        <Sparkles count={8} scale={0.4} size={2} speed={1.2} color="#06D6A0" />
      </group>

      {/* Floating Billboard Name Tag */}
      <Billboard position={[0, 1.8, 0]}>
        <mesh>
          <planeGeometry args={[1.8, 0.48]} />
          <meshBasicMaterial color="#2A9D8F" transparent opacity={0.85} />
        </mesh>
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.22}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
        >
          Adek Faqih 👶🍼
        </Text>
      </Billboard>
    </group>
  );
};

// --- MAIN FAMILY COMPONENT WITH PROXIMITY DETECTION ---
const FAMILY_MEMBERS = [
  {
    id: 'abi',
    pos: [-3, 0.2, -4] as [number, number, number],
    title: 'Abi (Ayah)',
    prompt: 'Tekan [E] untuk Sapa & Tos sama Abi! ✋',
    dialog: {
      speaker: 'Abi',
      role: 'Ayah Hebat',
      avatarBg: 'bg-blue-600',
      text: 'Assalamu\'alaikum Khaulah sayang! Semangat belajar dan bermain di TK Karang Tengah ya. Khaulah adalah anak shalihah kebanggaan Abi!',
      actionText: '✋ Tos Hebat sama Abi!',
      actionType: 'high_five' as const,
    },
  },
  {
    id: 'ummi',
    pos: [3, 0.2, -4] as [number, number, number],
    title: 'Ummi (Ibu)',
    prompt: 'Tekan [E] untuk Ambil Bekal Cinta Ummi! 🍰',
    dialog: {
      speaker: 'Ummi',
      role: 'Ibu Tercinta',
      avatarBg: 'bg-rose-500',
      text: 'Khaulah sayang, Ummi sudah siapkan kue pelangi lezat untuk bekal Khaulah. Habiskan ya sayang, supaya Khaulah bertenaga dan lari super cepat!',
      actionText: '🍰 Ambil Bekal Cinta Ummi (+Speed Boost!)',
      actionType: 'take_snack' as const,
    },
  },
  {
    id: 'khalid',
    pos: [-1.8, 0.2, -1.5] as [number, number, number],
    title: 'Adek Khalid',
    prompt: 'Tekan [E] untuk Main Bola bareng Khalid! ⚽',
    dialog: {
      speaker: 'Adek Khalid',
      role: 'Adik Periang',
      avatarBg: 'bg-amber-500',
      text: 'Mbak Khaulah! Ayo main bola bareng Khalid! Nanti pulang sekolah kita balapan lari lagi ya, Mbak Khaulah!',
      actionText: '⚽ Main Bola Bersama Khalid!',
      actionType: 'play_ball' as const,
    },
  },
  {
    id: 'faqih',
    pos: [2.0, 0.2, -1.5] as [number, number, number],
    title: 'Adek Faqih',
    prompt: 'Tekan [E] untuk Cilukba sama Adek Faqih! 🍼',
    dialog: {
      speaker: 'Adek Faqih',
      role: 'Adik Bayi Lucu',
      avatarBg: 'bg-emerald-500',
      text: 'Ciluk... BAAA! Adek Faqih tersenyum gembira sambil menggoyangkan mainan kerincingan melihat Mbak Khaulah!',
      actionText: '👶 Peluk Sayang Adek Faqih!',
      actionType: 'cuddle_baby' as const,
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
      {/* 1. Abi (Ayah) - Click directly or press E to chat */}
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
        <AbiModel position={[-3, 0.2, -4]} />
      </group>

      {/* 2. Ummi (Ibu) - Click directly to take delicious snack */}
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
        <UmmiModel position={[3, 0.2, -4]} />
      </group>

      {/* 3. Adek Khalid - Click directly to play ball */}
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
        <KhalidModel position={[-1.8, 0.2, -1.5]} />
      </group>

      {/* 4. Adek Faqih - Click directly to cuddle and play peekaboo */}
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
        <FaqihModel position={[2.0, 0.2, -1.5]} />
      </group>
    </group>
  );
};
