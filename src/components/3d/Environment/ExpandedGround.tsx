import React, { useEffect } from 'react';
import * as THREE from 'three';
import { colliders } from '../../../state/colliders';

// Connect the new regions without covering the existing river and lake.
const LAND: [number, number, number, number][] = [
  [-145, 145, 76, 160],
  [-100, 140, -90, -62],
  [-145, -100, -62, 76],
  [100, 140, -62, 76],
];
// Small walkable steps lead from the meadow to each hill terrace.
const STEPS = Array.from({ length: 27 }, (_, i) => ({
  x: 73 + i * 1.2, top: (i + 1) * 8.8 / 27,
}));

export const ExpandedGround: React.FC = () => {
  useEffect(() => {
    const entries = [
      ...LAND.map(([x0, x1, z0, z1]) => ({
        type: 'ground' as const,
        box: new THREE.Box3(new THREE.Vector3(x0, -1, z0), new THREE.Vector3(x1, 0.25, z1)),
      })),
      ...STEPS.map(({ x, top }) => ({
        type: 'ground' as const,
        box: new THREE.Box3(new THREE.Vector3(x - 0.6, 0, 103), new THREE.Vector3(x + 0.6, top, 107)),
      })),
    ];
    colliders.push(...entries);
    return () => { for (const entry of entries) {
      const index = colliders.indexOf(entry);
      if (index !== -1) colliders.splice(index, 1);
    } };
  }, []);
  return <group>
    {LAND.map(([x0, x1, z0, z1], i) => <mesh key={i} position={[(x0 + x1) / 2, -0.375, (z0 + z1) / 2]} receiveShadow>
      <boxGeometry args={[x1 - x0, 1.25, z1 - z0]} />
      <meshStandardMaterial color="#4C8C2B" roughness={0.85} />
    </mesh>)}
    {STEPS.map(({ x, top }, i) => <mesh key={`step${i}`} position={[x, top / 2, 105]} receiveShadow>
      <boxGeometry args={[1.2, top, 4]} />
      <meshStandardMaterial color={i % 2 ? '#FDE68A' : '#FCD34D'} roughness={0.8} />
    </mesh>)}
  </group>;
};
