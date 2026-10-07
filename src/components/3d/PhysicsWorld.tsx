import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Physics,
  RigidBody,
  CuboidCollider,
  CylinderCollider,
  BallCollider,
  CapsuleCollider,
  RapierRigidBody,
} from '@react-three/rapier';
import * as THREE from 'three';
import { colliders, solidColliders } from '../../state/colliders';
import { gameStore, useGameStore } from '../../state/useGameStore';
import { soundManager } from '../../sound/audioManager';
import { entersSchoolGoal } from '../../state/worldLocations';
import confetti from 'canvas-confetti';

/**
 * Real rigid-body physics layer (Rapier).
 * - Mirrors the existing static collider registry (ground platforms + solid walls) into Rapier.
 * - A kinematic capsule follows Khaulah so she physically pushes / kicks dynamic objects.
 * - Hosts dynamic props: soccer balls, bouncy beach balls, pushable crates.
 */

interface StaticSnapshot {
  boxes: { center: [number, number, number]; half: [number, number, number] }[];
  cylinders: { center: [number, number, number]; radius: number; halfH: number }[];
}

function snapshotStaticColliders(): StaticSnapshot {
  const boxes: StaticSnapshot['boxes'] = [];
  const cylinders: StaticSnapshot['cylinders'] = [];
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  const pushBox = (b: THREE.Box3) => {
    if (b.isEmpty()) return;
    b.getSize(size);
    b.getCenter(center);
    // Thin ground pads get some thickness so fast balls never tunnel through
    const halfY = Math.max(size.y / 2, 0.25);
    const cy = size.y / 2 < 0.25 ? b.max.y - halfY : center.y;
    boxes.push({ center: [center.x, cy, center.z], half: [size.x / 2, halfY, size.z / 2] });
  };
  for (const c of colliders) {
    if (c.type === 'ground' || c.type === 'trampoline') pushBox(c.box);
  }
  for (const s of solidColliders) {
    if (s.type === 'box') pushBox(s.box);
    else {
      const halfH = Math.max((s.maxY - s.minY) / 2, 0.05);
      cylinders.push({ center: [s.x, s.minY + halfH, s.z], radius: s.radius, halfH });
    }
  }
  return { boxes, cylinders };
}

const StaticWorld: React.FC = () => {
  const [snap, setSnap] = useState<StaticSnapshot | null>(null);
  const elapsed = useRef(0);
  const signature = useRef('');
  useFrame((_, delta) => {
    elapsed.current += delta;
    if (snap && elapsed.current < 0.25) return;
    elapsed.current = 0;
    const next = snapshotStaticColliders();
    const key = JSON.stringify(next);
    if (key !== signature.current) {
      signature.current = key;
      setSnap(next);
    }
  });
  if (!snap) return null;
  return (
    <RigidBody type="fixed" colliders={false}>
      {snap.boxes.map((b, i) => (
        <CuboidCollider key={`b${i}`} args={b.half} position={b.center} friction={0.8} />
      ))}
      {snap.cylinders.map((c, i) => (
        <CylinderCollider key={`c${i}`} args={[c.halfH, c.radius]} position={c.center} />
      ))}
    </RigidBody>
  );
};

/** Kinematic body that tracks the player so she can push and kick things. */
const PlayerProxy: React.FC = () => {
  const body = useRef<RapierRigidBody>(null);
  const next = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const p = gameStore.getState().playerPos;
    if (!body.current) return;
    next.set(p[0], p[1] + 0.7, p[2]);
    const previous = body.current.translation();
    if (Math.hypot(previous.x - next.x, previous.y - next.y, previous.z - next.z) > 3) {
      body.current.setTranslation(next, true);
      body.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }
    body.current.setNextKinematicTranslation(next);
  });
  return (
    <RigidBody ref={body} type="kinematicPosition" position={gameStore.getState().playerPos} colliders={false}>
      <CapsuleCollider args={[0.35, 0.42]} />
    </RigidBody>
  );
};

interface PropProps {
  position: [number, number, number];
}

const SoccerBall: React.FC<PropProps> = ({ position }) => {
  const lastSound = useRef(0);
  const ballRef = useRef<RapierRigidBody>(null);
  const goalCooldown = useRef(0);
  const previous = useRef({ x: position[0], y: position[1], z: position[2] });

  useFrame((_, delta) => {
    if (goalCooldown.current > 0) goalCooldown.current -= delta;
    if (!ballRef.current) return;
    const p = ballRef.current.translation();
    if (p.y < -8) {
      ballRef.current.setTranslation({ x: position[0], y: position[1], z: position[2] }, true);
      ballRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      ballRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
      Object.assign(previous.current, { x: position[0], y: position[1], z: position[2] });
      return;
    }
    const scored = goalCooldown.current <= 0 && entersSchoolGoal(previous.current, p);
    Object.assign(previous.current, p);
    if (scored) {
      goalCooldown.current = 5.0;
      soundManager.playStarCollect();
      confetti({
        particleCount: 70,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#10B981', '#F59E0B', '#3B82F6', '#EC4899'],
      });
      gameStore.setMessage('GOOOOOL! ⚽🎉🥅 Tendangan Spektakuler Khaulah Masuk Gawang!');
      gameStore.unlockSticker('gol');
      ballRef.current.setLinvel({ x: (Math.random() - 0.5) * 2, y: 3.5, z: -4 }, true);
    }
  });

  return (
    <RigidBody
      ref={ballRef}
      position={position}
      colliders={false}
      restitution={0.72}
      friction={0.6}
      linearDamping={0.35}
      angularDamping={0.4}
      mass={0.45}
      ccd
      onCollisionEnter={({ other }) => {
        const now = performance.now();
        if (other.rigidBodyObject && now - lastSound.current > 250 && other.rigidBody?.bodyType() === 2) {
          lastSound.current = now;
          soundManager.playJump();
        }
      }}
    >
      <BallCollider args={[0.32]} />
      <mesh castShadow>
        <icosahedronGeometry args={[0.32, 2]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.45} flatShading />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const phi = Math.acos(-1 + (2 * i + 1) / 6);
        const th = Math.PI * (1 + Math.sqrt(5)) * i;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(th) * Math.sin(phi) * 0.3,
              Math.cos(phi) * 0.3,
              Math.sin(th) * Math.sin(phi) * 0.3,
            ]}
          >
            <sphereGeometry args={[0.085, 6, 6]} />
            <meshStandardMaterial color="#111827" roughness={0.5} />
          </mesh>
        );
      })}
    </RigidBody>
  );
};

const BeachBall: React.FC<PropProps & { colors: string[] }> = ({ position, colors }) => (
  <RigidBody
    position={position}
    colliders={false}
    restitution={0.88}
    friction={0.3}
    linearDamping={1.1} // light & airy: strong air drag
    angularDamping={0.6}
    mass={0.08}
    ccd
  >
    <BallCollider args={[0.6]} />
    {colors.map((c, i) => (
      <mesh key={i} castShadow rotation={[0, (i * Math.PI * 2) / colors.length, 0]}>
        <sphereGeometry args={[0.6, 16, 12, 0, (Math.PI * 2) / colors.length]} />
        <meshStandardMaterial color={c} roughness={0.35} />
      </mesh>
    ))}
  </RigidBody>
);

const Crate: React.FC<PropProps & { size?: number }> = ({ position, size = 0.8 }) => (
  <RigidBody position={position} colliders={false} friction={0.9} mass={6} linearDamping={0.6} angularDamping={0.8}>
    <CuboidCollider args={[size / 2, size / 2, size / 2]} />
    <mesh castShadow receiveShadow>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial color="#C08552" roughness={0.85} />
    </mesh>
    <mesh>
      <boxGeometry args={[size * 1.02, size * 0.18, size * 1.02]} />
      <meshStandardMaterial color="#8B5E34" roughness={0.9} />
    </mesh>
  </RigidBody>
);

export const PhysicsWorld: React.FC = () => {
  const paused = useGameStore((s) => s.isPhotoMode || s.isWelcomeOpen);
  return (
    <Physics paused={paused} gravity={[0, -19.6, 0]} timeStep={1 / 60}>
      <StaticWorld />
      <PlayerProxy />
      {/* Halaman rumah: bola sepak Adek Khalid */}
      <SoccerBall position={[3, 2, -8]} />
      <SoccerBall position={[-4, 2, -6]} />
      {/* TK playground */}
      <SoccerBall position={[16, 2, 40]} />
      {/* Pantai: bola pantai ringan */}
      <BeachBall position={[-45, 3, 30]} colors={['#EF4444', '#FACC15', '#3B82F6', '#FFFFFF']} />
      <BeachBall position={[-48, 3, 33]} colors={['#EC4899', '#FFFFFF', '#22C55E', '#FFFFFF']} />
      {/* Kebun: peti kayu yang bisa didorong */}
      <Crate position={[-30, 2, -6]} />
      <Crate position={[-30, 3, -6]} size={0.6} />
      <Crate position={[-28.8, 2, -6.4]} />
    </Physics>
  );
};
