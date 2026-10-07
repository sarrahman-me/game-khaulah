import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../state/useGameStore';
import * as THREE from 'three';

interface WaterSurfaceProps {
  position?: [number, number, number];
  size?: [number, number];
  color?: string;
  depthColor?: string;
  speed?: number;
  waveHeight?: number;
  opacity?: number;
  roughness?: number;
}

/**
 * High-performance animated water surface with wave motion and glistening highlights.
 */
export const WaterSurface: React.FC<WaterSurfaceProps> = ({
  position = [0, 0, 0],
  size = [20, 20],
  color = '#38BDF8',
  depthColor = '#0284C7',
  speed = 1.4,
  waveHeight = 0.04,
  opacity = 0.82,
  roughness = 0.1,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const quality = useGameStore((s) => s.graphicsQuality);
  const frameTime = useRef(0);
  const segmentLimit = quality === 'high' ? 64 : quality === 'medium' ? 32 : 16;
  const segments = useMemo(() => [Math.max(1, Math.min(segmentLimit, Math.round(size[0] * 2))), Math.max(1, Math.min(segmentLimit, Math.round(size[1] * 2)))] as [number, number], [size[0], size[1], segmentLimit]);

  // Pre-calculate base vertices for wave displacement
  const basePositions = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size[0], size[1], segments[0], segments[1]);
    const positions = geo.attributes.position.clone();
    geo.dispose();
    return positions;
  }, [size[0], size[1], segments]);

  useFrame((state, delta) => {
    frameTime.current += delta;
    if (frameTime.current < 1 / (quality === 'battery' ? 15 : 30)) return;
    frameTime.current = 0;
    if (!meshRef.current) return;
    const geo = meshRef.current.geometry;
    const posAttr = geo.attributes.position;
    if (!posAttr) return;

    const t = state.clock.getElapsedTime() * speed;
    const base = basePositions.array as Float32Array;
    const current = posAttr.array as Float32Array;

    for (let i = 0; i < posAttr.count; i++) {
      const idx = i * 3;
      const x = base[idx];
      const y = base[idx + 1];
      // Multi-sine wave displacement for natural water rippling
      const wave =
        Math.sin(x * 0.8 + t * 2.0) * waveHeight * 0.5 +
        Math.cos(y * 0.9 + t * 1.6) * waveHeight * 0.35 +
        Math.sin((x + y) * 1.2 + t * 3.0) * waveHeight * 0.15;
      current[idx + 2] = wave;
    }
    posAttr.needsUpdate = true;
    geo.computeVertexNormals();
  });

  return (
    <group position={position}>
      {/* Water Surface Mesh */}
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[size[0], size[1], segments[0], segments[1]]} />
        <meshStandardMaterial
          color={color}
          roughness={roughness}
          metalness={0.1}
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </mesh>

      {/* Deep Water Bed Gradient Plane */}
      <mesh position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[size[0], size[1]]} />
        <meshBasicMaterial color={depthColor} transparent opacity={0.65} />
      </mesh>
    </group>
  );
};
