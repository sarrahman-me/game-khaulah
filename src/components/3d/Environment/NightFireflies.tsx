import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../../state/useGameStore';

interface FireflyData {
  baseX: number;
  baseY: number;
  baseZ: number;
  speed: number;
  phase: number;
  radius: number;
}

const FIREFLIES: FireflyData[] = [
  { baseX: -3, baseY: 1.2, baseZ: 10, speed: 1.1, phase: 0.2, radius: 1.8 },
  { baseX: 2, baseY: 1.4, baseZ: 12, speed: 0.9, phase: 1.4, radius: 2.2 },
  { baseX: -5, baseY: 1.6, baseZ: 11, speed: 1.3, phase: 2.5, radius: 1.5 },
  { baseX: 4, baseY: 1.1, baseZ: 13, speed: 0.8, phase: 3.1, radius: 2.0 },
  { baseX: -2, baseY: 1.5, baseZ: -2, speed: 1.2, phase: 0.8, radius: 1.6 },
  { baseX: 3, baseY: 1.3, baseZ: -3, speed: 1.0, phase: 2.1, radius: 1.9 },
  { baseX: 0, baseY: 1.8, baseZ: 22, speed: 0.95, phase: 1.7, radius: 2.4 },
  { baseX: -4, baseY: 1.2, baseZ: 25, speed: 1.15, phase: 3.4, radius: 1.7 },
];

export const NightFireflies: React.FC = () => {
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const fireflyRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame((state) => {
    if (timeOfDay === 'day') return;
    const time = state.clock.getElapsedTime();

    FIREFLIES.forEach((f, idx) => {
      const ref = fireflyRefs.current[idx];
      if (!ref) return;
      const angle = time * f.speed + f.phase;
      ref.position.x = f.baseX + Math.cos(angle) * f.radius;
      ref.position.z = f.baseZ + Math.sin(angle) * f.radius;
      ref.position.y = f.baseY + Math.sin(time * 2.5 + f.phase) * 0.45;
    });
  });

  if (timeOfDay === 'day') return null;

  const isNight = timeOfDay === 'night';

  return (
    <group>
      {/* 1. Magical Floating Fireflies (Kunang-Kunang) */}
      {FIREFLIES.map((_, idx) => (
        <group
          key={idx}
          ref={(el) => {
            fireflyRefs.current[idx] = el;
          }}
        >
          {/* Glowing core */}
          <mesh>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshBasicMaterial color="#CCFF00" />
          </mesh>
          {/* Subtle point light for magical ambiance */}
          {idx % 2 === 0 && (
            <pointLight
              color="#D4FF00"
              intensity={isNight ? 0.8 : 0.4}
              distance={2.8}
            />
          )}
        </group>
      ))}

      {/* 2. Cozy Night Lantern Lights */}
      {/* Lantern at River Bridge */}
      <pointLight
        position={[0, 2.5, 11]}
        color="#FFAA33"
        intensity={isNight ? 1.6 : 0.8}
        distance={9.0}
      />

      {/* Lantern at Rumah Khaulah Porch */}
      <pointLight
        position={[0, 2.4, -6.5]}
        color="#FFCC66"
        intensity={isNight ? 1.8 : 0.9}
        distance={10.0}
      />

      {/* Lantern at School TK Gate */}
      <pointLight
        position={[0, 3.8, 18]}
        color="#FFD166"
        intensity={isNight ? 1.8 : 0.9}
        distance={10.0}
      />
    </group>
  );
};
