import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, gameStore } from '../../../state/useGameStore';

/**
 * Dynamic 3D Weather System:
 * - Rain (Hujan Rintik Berbunga) with ground ripples
 * - Rainbow (Lengkungan Pelangi Ajaib) spanning the sky
 * - Snow (Salju Lembut)
 */
export const WeatherEffects: React.FC = () => {
  const weather = useGameStore((s) => s.weather);
  const inside = useGameStore((s) => s.isInsideHouse);

  // Rain particle system
  const rainRef = useRef<THREE.Points>(null);
  const rainCount = 1200;
  const rainGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = Math.random() * 45;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  // Snow particle system
  const snowRef = useRef<THREE.Points>(null);
  const snowCount = 900;
  const snowGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(snowCount * 3);
    for (let i = 0; i < snowCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = Math.random() * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useEffect(() => () => { rainGeo.dispose(); snowGeo.dispose(); }, [rainGeo, snowGeo]);

  useFrame((_, delta) => {
    const playerPos = gameStore.getState().playerPos;
    const px = playerPos[0];
    const pz = playerPos[2];
    rainRef.current?.position.set(px, playerPos[1], pz);
    snowRef.current?.position.set(px, playerPos[1], pz);

    // Animate Rain
    if (weather === 'hujan' && rainRef.current) {
      const posAttr = rainRef.current.geometry.attributes.position;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < rainCount; i++) {
        const idx = i * 3;
        arr[idx + 1] -= delta * 42; // fast fall
        if (arr[idx + 1] < 0.1) {
          arr[idx + 1] = 40 + Math.random() * 10;
          arr[idx] = (Math.random() - 0.5) * 75;
          arr[idx + 2] = (Math.random() - 0.5) * 75;
        }
      }
      posAttr.needsUpdate = true;
    }

    // Animate Snow
    if (weather === 'salju' && snowRef.current) {
      const posAttr = snowRef.current.geometry.attributes.position;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < snowCount; i++) {
        const idx = i * 3;
        arr[idx + 1] -= delta * 6; // gentle drift
        arr[idx] += Math.sin(arr[idx + 1] * 0.2) * delta * 2;
        if (arr[idx + 1] < 0.1) {
          arr[idx + 1] = 35 + Math.random() * 10;
          arr[idx] = (Math.random() - 0.5) * 75;
          arr[idx + 2] = (Math.random() - 0.5) * 75;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 1. RAIN SYSTEM */}
      {weather === 'hujan' && !inside && (
        <points frustumCulled={false} ref={rainRef} geometry={rainGeo}>
          <pointsMaterial
            color="#93C5FD"
            size={0.16}
            transparent
            opacity={0.65}
            depthWrite={false}
          />
        </points>
      )}

      {/* 2. SNOW SYSTEM */}
      {weather === 'salju' && !inside && (
        <points frustumCulled={false} ref={snowRef} geometry={snowGeo}>
          <pointsMaterial
            color="#FFFFFF"
            size={0.28}
            transparent
            opacity={0.85}
            depthWrite={false}
          />
        </points>
      )}

      {/* 3. VIBRANT SKY RAINBOW (Shown in 'pelangi' mode or after rain) */}
      {weather === 'pelangi' && (
        <group position={[0, -2, -30]} rotation={[0.1, 0, 0]}>
          {[
            { color: '#EF4444', radius: 92, width: 1.2 },
            { color: '#F97316', radius: 90.8, width: 1.2 },
            { color: '#FACC15', radius: 89.6, width: 1.2 },
            { color: '#22C55E', radius: 88.4, width: 1.2 },
            { color: '#06B6D4', radius: 87.2, width: 1.2 },
            { color: '#3B82F6', radius: 86.0, width: 1.2 },
            { color: '#A855F7', radius: 84.8, width: 1.2 },
          ].map((stripe, idx) => (
            <mesh key={idx} rotation={[0, 0, 0]}>
              <ringGeometry args={[stripe.radius - stripe.width / 2, stripe.radius + stripe.width / 2, 64, 1, 0, Math.PI]} />
              <meshBasicMaterial
                color={stripe.color}
                transparent
                opacity={weather === 'pelangi' ? 0.78 : 0.35}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};
