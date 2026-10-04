import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { colliders } from '../../../state/colliders';

interface TrampolineProps {
  position: [number, number, number];
  radius?: number;
}

export const Trampoline: React.FC<TrampolineProps> = ({ position, radius = 2.0 }) => {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const box = new THREE.Box3().setFromCenterAndSize(
      new THREE.Vector3(position[0], position[1] + 0.3, position[2]),
      new THREE.Vector3(radius * 2, 0.6, radius * 2)
    );

    const colliderObj = {
      box,
      type: 'trampoline' as const,
    };
    colliders.push(colliderObj);

    return () => {
      const idx = colliders.indexOf(colliderObj);
      if (idx !== -1) colliders.splice(idx, 1);
    };
  }, [position, radius]);

  return (
    <group ref={groupRef} position={position}>
      {/* Base Rim */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[radius, radius, 0.4, 24]} />
        <meshStandardMaterial color="#FF9F1C" roughness={0.3} />
      </mesh>
      {/* Bouncy Center Mat */}
      <mesh position={[0, 0.46, 0]}>
        <cylinderGeometry args={[radius * 0.85, radius * 0.85, 0.05, 24]} />
        <meshStandardMaterial color="#2EC4B6" roughness={0.2} emissive="#2EC4B6" emissiveIntensity={0.2} />
      </mesh>
      {/* Spring legs */}
      {[-radius * 0.7, radius * 0.7].map((x, i) =>
        [-radius * 0.7, radius * 0.7].map((z, j) => (
          <mesh key={`${i}-${j}`} position={[x, 0.1, z]}>
            <cylinderGeometry args={[0.08, 0.08, 0.3, 8]} />
            <meshStandardMaterial color="#4A4E69" />
          </mesh>
        ))
      )}
      {/* Glowing Star Emblem on Trampoline */}
      <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.6, 5]} />
        <meshBasicMaterial color="#FFD166" />
      </mesh>
    </group>
  );
};
