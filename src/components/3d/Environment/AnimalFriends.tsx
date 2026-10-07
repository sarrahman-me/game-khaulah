import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { gameStore, useGameStore } from '../../../state/useGameStore';
import { soundManager } from '../../../sound/audioManager';

interface AnimalNPCProps {
  type: 'duck' | 'cat' | 'bunny' | 'panda' | 'penguin' | 'deer';
  position: [number, number, number];
  name: string;
  dialogue: string;
}

// Cute fluttering butterflies in the garden
const FlutteringButterflies: React.FC = () => {
  const butterflyGroup = useRef<THREE.Group>(null);
  const wing1 = useRef<THREE.Mesh>(null);
  const wing2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!butterflyGroup.current) return;
    const t = state.clock.getElapsedTime();
    butterflyGroup.current.position.x = -4 + Math.cos(t * 0.8) * 3;
    butterflyGroup.current.position.z = 2 + Math.sin(t * 0.8) * 3;
    butterflyGroup.current.position.y = 1.2 + Math.sin(t * 2.5) * 0.35;
    butterflyGroup.current.rotation.y = -t * 0.8 + Math.PI / 2;

    if (wing1.current && wing2.current) {
      wing1.current.rotation.y = Math.sin(t * 28) * 0.75;
      wing2.current.rotation.y = -Math.sin(t * 28) * 0.75;
    }
  });

  return (
    <group ref={butterflyGroup} position={[-4, 1.2, 2]}>
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, 0.12, 6]} />
        <meshBasicMaterial color="#1D2A44" />
      </mesh>
      <mesh ref={wing1} position={[-0.08, 0.02, 0]}>
        <circleGeometry args={[0.09, 8]} />
        <meshBasicMaterial color="#FF006E" side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={wing2} position={[0.08, 0.02, 0]}>
        <circleGeometry args={[0.09, 8]} />
        <meshBasicMaterial color="#FFBE0B" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const SingleAnimal: React.FC<AnimalNPCProps> = ({ type, position, name, dialogue }) => {
  const groupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Group>(null);
  const timeOfDay = useGameStore((s) => s.timeOfDay);

  const curPos = useRef(new THREE.Vector3(...position));
  const targetPos = useRef(new THREE.Vector3(...position));
  const facingAngle = useRef(0);
  const wanderTimer = useRef(1 + Math.random() * 3);
  const followTimer = useRef(0);
  const isJumpingTimer = useRef(0);
  const cooldownRef = useRef(0);

  const isNight = timeOfDay === 'malam';

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    if (cooldownRef.current > 0) cooldownRef.current -= delta;
    if (isJumpingTimer.current > 0) isJumpingTimer.current -= delta;
    if (followTimer.current > 0) followTimer.current -= delta;

    const playerPos = gameStore.getState().playerPos;
    const distPlayerSq =
      Math.pow(playerPos[0] - curPos.current.x, 2) +
      Math.pow(playerPos[2] - curPos.current.z, 2);

    // AI State Machine
    if (type === 'duck') {
      // Duck swims smoothly back and forth in river canal
      const swimX = Math.sin(time * 0.35) * 4.5;
      const swimDir = Math.cos(time * 0.35);
      curPos.current.x = swimX;
      curPos.current.y = isNight ? 0.12 : 0.14 + Math.sin(time * 3.0) * 0.015;
      curPos.current.z = position[2];
      facingAngle.current = swimDir > 0 ? Math.PI / 2 : -Math.PI / 2;
    } else if (isNight) {
      // Sleeping peacefully during the night
      curPos.current.x = THREE.MathUtils.lerp(curPos.current.x, position[0], delta * 2.0);
      curPos.current.z = THREE.MathUtils.lerp(curPos.current.z, position[2], delta * 2.0);
      curPos.current.y = position[1] - 0.08; // curl down low
    } else if (followTimer.current > 0 && distPlayerSq < 45.0) {
      // Following Khaulah happily after being petted
      const angleToPlayer = Math.atan2(playerPos[0] - curPos.current.x, playerPos[2] - curPos.current.z);
      facingAngle.current = THREE.MathUtils.lerp(facingAngle.current, angleToPlayer, delta * 6.0);
      if (distPlayerSq > 3.0) {
        const speed = 2.4;
        curPos.current.x += Math.sin(facingAngle.current) * speed * delta;
        curPos.current.z += Math.cos(facingAngle.current) * speed * delta;
      }
      curPos.current.y = position[1] + Math.abs(Math.sin(time * 8)) * 0.18;
    } else {
      // Daytime Wandering & Grazing AI
      wanderTimer.current -= delta;
      if (wanderTimer.current <= 0) {
        wanderTimer.current = 4.0 + Math.random() * 5.0;
        // Pick new random waypoint within 3.5m radius from home
        const rad = Math.random() * 3.5;
        const ang = Math.random() * Math.PI * 2;
        targetPos.current.set(position[0] + Math.cos(ang) * rad, position[1], position[2] + Math.sin(ang) * rad);
      }

      const dx = targetPos.current.x - curPos.current.x;
      const dz = targetPos.current.z - curPos.current.z;
      const distToTarget = Math.hypot(dx, dz);

      if (distToTarget > 0.2) {
        // Walking towards target
        const steer = Math.atan2(dx, dz);
        facingAngle.current = THREE.MathUtils.lerp(facingAngle.current, steer, delta * 4.0);
        const walkSpeed = 1.2;
        curPos.current.x += Math.sin(facingAngle.current) * walkSpeed * delta;
        curPos.current.z += Math.cos(facingAngle.current) * walkSpeed * delta;
        curPos.current.y = position[1] + Math.abs(Math.sin(time * 7)) * 0.12;
      } else {
        // Grazing peacefully
        curPos.current.y = position[1] + Math.sin(time * 2) * 0.02;
        if (headRef.current) {
          headRef.current.rotation.x = Math.sin(time * 1.5) * 0.18 + 0.12;
        }
      }

      // If Khaulah is close, look at her curiously!
      if (distPlayerSq < 12.0) {
        const angleToKhaulah = Math.atan2(playerPos[0] - curPos.current.x, playerPos[2] - curPos.current.z);
        facingAngle.current = THREE.MathUtils.lerp(facingAngle.current, angleToKhaulah, delta * 5.0);
      }
    }

    // Proximity greeting
    if (distPlayerSq < 8.0 && cooldownRef.current <= 0 && !isNight) {
      soundManager.playAnimalSound(type);
      gameStore.setMessage(`${name}: "${dialogue}" 💕🐾`);
      if (type === 'penguin') gameStore.unlockSticker('pinguin');
      cooldownRef.current = 8.0;
      isJumpingTimer.current = 2.5;
    }

    groupRef.current.position.copy(curPos.current);
    groupRef.current.rotation.y = facingAngle.current;

    // Tail wagging
    if (tailRef.current && (type === 'cat' || type === 'deer')) {
      tailRef.current.rotation.z = Math.sin(time * 8) * 0.45;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        soundManager.playAnimalSound(type);
        followTimer.current = 14.0;
        isJumpingTimer.current = 3.0;
        if (type === 'penguin') gameStore.unlockSticker('pinguin');
        gameStore.setMessage(`${name}: "${dialogue}" (Ikut berjalan bersama Khaulah! 💕🐾)`);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {/* 1. DUCK */}
      {type === 'duck' && (
        <group scale={0.7}>
          <mesh position={[0, 0.4, 0]} castShadow>
            <sphereGeometry args={[0.42, 16, 16]} />
            <meshStandardMaterial color="#FFD166" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.75, 0.2]} castShadow>
            <sphereGeometry args={[0.28, 16, 16]} />
            <meshStandardMaterial color="#FFD166" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.72, 0.5]}>
            <boxGeometry args={[0.2, 0.1, 0.25]} />
            <meshStandardMaterial color="#FF6B35" />
          </mesh>
          <mesh position={[-0.12, 0.8, 0.4]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          <mesh position={[0.12, 0.8, 0.4]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.45, 0.65, 16]} />
            <meshBasicMaterial color="#90E0EF" transparent opacity={0.6} />
          </mesh>
        </group>
      )}

      {/* 2. CAT */}
      {type === 'cat' && (
        <group scale={0.7}>
          <mesh position={[0, 0.35, 0]} castShadow>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color="#F77F00" roughness={0.4} />
          </mesh>
          <group ref={headRef} position={[0, 0.65, 0.2]}>
            <mesh castShadow>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial color="#F77F00" roughness={0.4} />
            </mesh>
            <mesh position={[-0.15, 0.27, 0]} rotation={[0, 0, -0.2]}>
              <coneGeometry args={[0.1, 0.2, 4]} />
              <meshStandardMaterial color="#FCBF49" />
            </mesh>
            <mesh position={[0.15, 0.27, 0]} rotation={[0, 0, 0.2]}>
              <coneGeometry args={[0.1, 0.2, 4]} />
              <meshStandardMaterial color="#FCBF49" />
            </mesh>
            <mesh position={[-0.1, 0.05, 0.25]}>
              <sphereGeometry args={[0.04, 12, 12]} />
              <meshBasicMaterial color="#2B9348" />
            </mesh>
            <mesh position={[0.1, 0.05, 0.25]}>
              <sphereGeometry args={[0.04, 12, 12]} />
              <meshBasicMaterial color="#2B9348" />
            </mesh>
          </group>
          <mesh ref={tailRef} position={[0, 0.4, -0.4]} rotation={[-0.4, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.03, 0.5, 8]} />
            <meshStandardMaterial color="#FCBF49" />
          </mesh>
        </group>
      )}

      {/* 3. BUNNY */}
      {type === 'bunny' && (
        <group scale={0.7}>
          <mesh position={[0, 0.35, 0]} castShadow>
            <sphereGeometry args={[0.38, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.68, 0.18]} castShadow>
            <sphereGeometry args={[0.28, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
          </mesh>
          <mesh position={[-0.1, 1.05, 0.1]} rotation={[0, 0, -0.1]}>
            <capsuleGeometry args={[0.06, 0.35, 4, 8]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0.1, 1.05, 0.1]} rotation={[0, 0, 0.1]}>
            <capsuleGeometry args={[0.06, 0.35, 4, 8]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0, 0.65, 0.45]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#FFB5A7" />
          </mesh>
          <mesh position={[-0.1, 0.74, 0.4]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color="#333333" />
          </mesh>
          <mesh position={[0.1, 0.74, 0.4]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color="#333333" />
          </mesh>
        </group>
      )}

      {/* 4. PANDA */}
      {type === 'panda' && (
        <group scale={0.75}>
          <mesh position={[0, 0.42, 0]} castShadow>
            <sphereGeometry args={[0.48, 16, 16]} />
            <meshStandardMaterial color="#F8F9FA" roughness={0.6} />
          </mesh>
          <mesh position={[-0.38, 0.42, 0.1]} rotation={[0.4, 0, -0.4]}>
            <cylinderGeometry args={[0.12, 0.1, 0.45, 10]} />
            <meshStandardMaterial color="#212529" />
          </mesh>
          <mesh position={[0.38, 0.42, 0.1]} rotation={[0.4, 0, 0.4]}>
            <cylinderGeometry args={[0.12, 0.1, 0.45, 10]} />
            <meshStandardMaterial color="#212529" />
          </mesh>
          <mesh position={[0, 0.48, 0.32]} rotation={[0, 0, 0.5]}>
            <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
            <meshStandardMaterial color="#55A630" />
          </mesh>
          <mesh position={[0, 0.85, 0.15]} castShadow>
            <sphereGeometry args={[0.36, 16, 16]} />
            <meshStandardMaterial color="#F8F9FA" roughness={0.6} />
          </mesh>
          <mesh position={[-0.26, 1.15, 0.1]}>
            <sphereGeometry args={[0.11, 10, 10]} />
            <meshStandardMaterial color="#212529" />
          </mesh>
          <mesh position={[0.26, 1.15, 0.1]}>
            <sphereGeometry args={[0.11, 10, 10]} />
            <meshStandardMaterial color="#212529" />
          </mesh>
          <mesh position={[-0.14, 0.9, 0.42]} rotation={[0, 0, 0.3]}>
            <circleGeometry args={[0.08, 12]} />
            <meshBasicMaterial color="#212529" />
          </mesh>
          <mesh position={[0.14, 0.9, 0.42]} rotation={[0, 0, -0.3]}>
            <circleGeometry args={[0.08, 12]} />
            <meshBasicMaterial color="#212529" />
          </mesh>
        </group>
      )}

      {/* 5. PENGUIN (Waddling baby penguin) */}
      {type === 'penguin' && (
        <group scale={0.7}>
          {/* Black & White Body */}
          <mesh position={[0, 0.38, 0]} castShadow>
            <capsuleGeometry args={[0.26, 0.42, 8, 16]} />
            <meshStandardMaterial color="#1E293B" roughness={0.4} />
          </mesh>
          {/* White Belly */}
          <mesh position={[0, 0.36, 0.12]}>
            <sphereGeometry args={[0.22, 12, 12]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
          </mesh>
          {/* Orange Beak */}
          <mesh position={[0, 0.58, 0.28]} rotation={[0.2, 0, 0]}>
            <coneGeometry args={[0.08, 0.16, 4]} />
            <meshStandardMaterial color="#F59E0B" />
          </mesh>
          {/* Big Adorable Eyes */}
          <mesh position={[-0.09, 0.62, 0.22]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          <mesh position={[0.09, 0.62, 0.22]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          {/* Little Flippers */}
          <mesh position={[-0.28, 0.38, 0]} rotation={[0, 0, -0.4]}>
            <boxGeometry args={[0.06, 0.32, 0.16]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>
          <mesh position={[0.28, 0.38, 0]} rotation={[0, 0, 0.4]}>
            <boxGeometry args={[0.06, 0.32, 0.16]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>
        </group>
      )}

      {/* 6. DEER (Graceful forest deer) */}
      {type === 'deer' && (
        <group scale={0.65}>
          {/* Slender Tan Body */}
          <mesh position={[0, 0.55, 0]} castShadow>
            <capsuleGeometry args={[0.28, 0.65, 8, 16]} />
            <meshStandardMaterial color="#C28B58" roughness={0.6} />
          </mesh>
          {/* Head & Neck */}
          <group ref={headRef} position={[0, 0.95, 0.3]}>
            <mesh castShadow>
              <sphereGeometry args={[0.22, 12, 12]} />
              <meshStandardMaterial color="#C28B58" roughness={0.6} />
            </mesh>
            {/* Cute Little Antlers */}
            <mesh position={[-0.1, 0.24, -0.05]} rotation={[-0.2, 0, -0.2]}>
              <cylinderGeometry args={[0.02, 0.03, 0.25, 6]} />
              <meshStandardMaterial color="#E0D2C7" />
            </mesh>
            <mesh position={[0.1, 0.24, -0.05]} rotation={[-0.2, 0, 0.2]}>
              <cylinderGeometry args={[0.02, 0.03, 0.25, 6]} />
              <meshStandardMaterial color="#E0D2C7" />
            </mesh>
            {/* Ears */}
            <mesh position={[-0.16, 0.15, 0]} rotation={[0, 0, -0.4]}>
              <coneGeometry args={[0.06, 0.18, 4]} />
              <meshStandardMaterial color="#C28B58" />
            </mesh>
            <mesh position={[0.16, 0.15, 0]} rotation={[0, 0, 0.4]}>
              <coneGeometry args={[0.06, 0.18, 4]} />
              <meshStandardMaterial color="#C28B58" />
            </mesh>
            {/* Dark Eyes */}
            <mesh position={[-0.1, 0.05, 0.18]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshBasicMaterial color="#1C1917" />
            </mesh>
            <mesh position={[0.1, 0.05, 0.18]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshBasicMaterial color="#1C1917" />
            </mesh>
          </group>
          {/* Slender Legs */}
          {[-0.18, 0.18].map((lx, i) => (
            <React.Fragment key={i}>
              <mesh position={[lx, 0.25, -0.22]}>
                <cylinderGeometry args={[0.045, 0.035, 0.5, 6]} />
                <meshStandardMaterial color="#A56E3F" />
              </mesh>
              <mesh position={[lx, 0.25, 0.22]}>
                <cylinderGeometry args={[0.045, 0.035, 0.5, 6]} />
                <meshStandardMaterial color="#A56E3F" />
              </mesh>
            </React.Fragment>
          ))}
        </group>
      )}

      {/* Floating Billboard Name Tag or Sleep Zzz */}
      <Billboard position={[0, isNight ? 0.9 : 1.45, 0]}>
        {isNight ? (
          <Text fontSize={0.24} color="#A5B4FC" anchorX="center" anchorY="middle">
            💤 Zzz...
          </Text>
        ) : (
          <>
            <mesh>
              <planeGeometry args={[1.5, 0.36]} />
              <meshBasicMaterial color="#4A4E69" transparent opacity={0.8} />
            </mesh>
            <Text
              position={[0, 0, 0.02]}
              fontSize={0.2}
              color="#FFFFFF"
              anchorX="center"
              anchorY="middle"
            >
              {name}
            </Text>
          </>
        )}
      </Billboard>
    </group>
  );
};

export const AnimalFriends: React.FC = () => {
  return (
    <group>
      {/* Butterflies fluttering in the garden */}
      <FlutteringButterflies />

      {/* Bebek Kuki berenang santai di sungai desa */}
      <SingleAnimal
        type="duck"
        position={[0, 0.15, 18]}
        name="Bebek Kuki 🦆"
        dialogue="Kweeeek! Khaulah mau berangkat ke TK Karang Tengah ya? Selamat bermain! 🦆"
      />

      {/* Kucing Tomi bermain di halaman TK Karang Tengah */}
      <SingleAnimal
        type="cat"
        position={[-8, 0.25, 34]}
        name="Kucing Tomi 🐱"
        dialogue="Miawww! Kucing Tomi senang melihat Khaulah ceria di TK! 🐾"
      />

      {/* Kelinci Cici melompat di taman bunga rumah Khaulah */}
      <SingleAnimal
        type="bunny"
        position={[-6, 0.25, 4]}
        name="Kelinci Cici 🐰"
        dialogue="Hoppp! Ayo balapan lari melintasi jembatan kayu, Khaulah! 🥕"
      />

      {/* Panda Bobo asyik santai di dekat taman bermain TK */}
      <SingleAnimal
        type="panda"
        position={[7, 0.25, 46]}
        name="Panda Bobo 🐼"
        dialogue="Hai Khaulah! Semangat belajar dan main perosotan di TK Karang Tengah ya! 🎋"
      />

      {/* Pinguin Piko waddling ceria */}
      <SingleAnimal
        type="penguin"
        position={[-5, 0.25, 120]}
        name="Pinguin Piko 🐧"
        dialogue="Peeep peeep! Dinginnya salju bikin meluncur makin kencang! Ayo balapan! ❄️"
      />

      {/* Rusa Bambi di tepi hutan */}
      <SingleAnimal
        type="deer"
        position={[-85, 0.25, 85]}
        name="Rusa Bambi 🦌"
        dialogue="Assalamu'alaikum Khaulah! Hutan Ajaib penuh buah manis dan jamur lompat lho! 🌿"
      />
    </group>
  );
};
