import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, gameStore } from '../../state/useGameStore';

export const PetCompanion: React.FC = () => {
  const activePet = useGameStore((s) => s.activePet);
  const groupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const wingsRef = useRef<THREE.Group>(null);

  const petPos = useRef(new THREE.Vector3(1.2, 1, 1.2));
  const targetPos = useRef(new THREE.Vector3());

  const lastPlayerPos = useRef(new THREE.Vector3());
  const idleTimer = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current || activePet === 'none') return;
    const dt = Math.min(delta, 0.1);
    const time = state.clock.getElapsedTime();

    // Player position
    const playerPosArray = gameStore.getState().playerPos;
    const px = playerPosArray[0];
    const py = playerPosArray[1];
    const pz = playerPosArray[2];

    const currentP = new THREE.Vector3(px, py, pz);
    const playerSpeed = currentP.distanceTo(lastPlayerPos.current) / Math.max(dt, 0.001);
    lastPlayerPos.current.copy(currentP);

    const isPlayerRunning = playerSpeed > 1.5;
    if (isPlayerRunning) {
      idleTimer.current = 0;
    } else {
      idleTimer.current += dt;
    }

    if (activePet === 'fairy') {
      // Fairy floats higher and circles playfully around player shoulder
      const hoverAngle = time * 2.2;
      const hoverRadius = 1.25;
      targetPos.current.set(
        px + Math.cos(hoverAngle) * hoverRadius,
        py + 1.8 + Math.sin(time * 3.5) * 0.3,
        pz + Math.sin(hoverAngle) * hoverRadius
      );
      petPos.current.lerp(targetPos.current, dt * 5);
      groupRef.current.position.copy(petPos.current);

      if (wingsRef.current) {
        wingsRef.current.rotation.y = Math.sin(time * 36) * 0.55;
      }
      groupRef.current.rotation.y = hoverAngle + Math.PI / 2;
    } else {
      // Ground pet (kitten / puppy) trails behind player with lively hops
      const trailAngle = time * 1.5;
      const hopFrequency = isPlayerRunning ? 16 : 8;
      const hopHeight = isPlayerRunning ? 0.22 : 0.08;
      const verticalHop = Math.abs(Math.sin(time * hopFrequency)) * hopHeight;

      // Position behind player
      targetPos.current.set(
        px - 0.85,
        py + 0.35 + verticalHop,
        pz - 0.85
      );

      petPos.current.lerp(targetPos.current, dt * (isPlayerRunning ? 7 : 4));
      groupRef.current.position.copy(petPos.current);

      // Look towards player smoothly
      groupRef.current.lookAt(px, py + 0.5, pz);

      // Tail wagging speed linked to excitement
      if (tailRef.current) {
        const wagSpeed = isPlayerRunning ? 22 : 10;
        tailRef.current.rotation.z = Math.sin(time * wagSpeed) * (isPlayerRunning ? 0.6 : 0.3);
      }

      // Idle cute head tilt or breathing when player stops
      if (idleTimer.current > 1.5) {
        groupRef.current.rotation.z = Math.sin(time * 2) * 0.08;
      } else {
        groupRef.current.rotation.z = 0;
      }
    }
  });

  if (activePet === 'none') return null;

  return (
    <group ref={groupRef} position={[1.2, 1, 1.2]}>
      {/* 1. KITTEN */}
      {activePet === 'kitten' && (
        <group scale={0.65}>
          {/* Body */}
          <mesh castShadow>
            <sphereGeometry args={[0.38, 16, 16]} />
            <meshStandardMaterial color="#F77F00" roughness={0.4} />
          </mesh>
          {/* Head */}
          <mesh position={[0, 0.32, 0.22]} castShadow>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color="#F77F00" roughness={0.4} />
          </mesh>
          {/* Ears */}
          <mesh position={[-0.15, 0.55, 0.22]} rotation={[0, 0, -0.2]}>
            <coneGeometry args={[0.1, 0.18, 4]} />
            <meshStandardMaterial color="#FCBF49" />
          </mesh>
          <mesh position={[0.15, 0.55, 0.22]} rotation={[0, 0, 0.2]}>
            <coneGeometry args={[0.1, 0.18, 4]} />
            <meshStandardMaterial color="#FCBF49" />
          </mesh>
          {/* Eyes */}
          <mesh position={[-0.1, 0.36, 0.48]}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshBasicMaterial color="#003049" />
          </mesh>
          <mesh position={[0.1, 0.36, 0.48]}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshBasicMaterial color="#003049" />
          </mesh>
          {/* Cute Nose */}
          <mesh position={[0, 0.28, 0.52]}>
            <sphereGeometry args={[0.03, 12, 12]} />
            <meshStandardMaterial color="#D62828" />
          </mesh>
          {/* Tail */}
          <mesh ref={tailRef} position={[0, 0.1, -0.38]} rotation={[0.6, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 0.35, 8]} />
            <meshStandardMaterial color="#F77F00" />
          </mesh>
        </group>
      )}

      {/* 2. PUPPY */}
      {activePet === 'puppy' && (
        <group scale={0.7}>
          {/* Body */}
          <mesh castShadow>
            <boxGeometry args={[0.45, 0.4, 0.6]} />
            <meshStandardMaterial color="#E09F3E" roughness={0.5} />
          </mesh>
          {/* Head */}
          <mesh position={[0, 0.32, 0.28]} castShadow>
            <boxGeometry args={[0.42, 0.38, 0.4]} />
            <meshStandardMaterial color="#FFF3B0" roughness={0.4} />
          </mesh>
          {/* Floppy Ears */}
          <mesh position={[-0.25, 0.25, 0.25]} rotation={[0, 0, 0.4]}>
            <boxGeometry args={[0.1, 0.25, 0.18]} />
            <meshStandardMaterial color="#9E2A2B" />
          </mesh>
          <mesh position={[0.25, 0.25, 0.25]} rotation={[0, 0, -0.4]}>
            <boxGeometry args={[0.1, 0.25, 0.18]} />
            <meshStandardMaterial color="#9E2A2B" />
          </mesh>
          {/* Eyes */}
          <mesh position={[-0.1, 0.36, 0.49]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshBasicMaterial color="#335C67" />
          </mesh>
          <mesh position={[0.1, 0.36, 0.49]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshBasicMaterial color="#335C67" />
          </mesh>
          {/* Tail */}
          <mesh ref={tailRef} position={[0, 0.2, -0.32]} rotation={[0.4, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 0.3, 8]} />
            <meshStandardMaterial color="#9E2A2B" />
          </mesh>
        </group>
      )}

      {/* 3. FAIRY */}
      {activePet === 'fairy' && (
        <group scale={0.55}>
          {/* Glowing core body */}
          <mesh>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color="#FFE66D" emissive="#FFE66D" emissiveIntensity={0.8} />
          </mesh>
          {/* Wings */}
          <group ref={wingsRef}>
            <mesh position={[-0.3, 0.1, 0]} rotation={[0, 0.2, 0.3]}>
              <planeGeometry args={[0.4, 0.4]} />
              <meshBasicMaterial color="#4ECDC4" transparent opacity={0.8} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0.3, 0.1, 0]} rotation={[0, -0.2, -0.3]}>
              <planeGeometry args={[0.4, 0.4]} />
              <meshBasicMaterial color="#4ECDC4" transparent opacity={0.8} side={THREE.DoubleSide} />
            </mesh>
          </group>
          {/* Sparkle halo */}
          <pointLight color="#FFE66D" intensity={1.5} distance={3} />
        </group>
      )}
    </group>
  );
};
