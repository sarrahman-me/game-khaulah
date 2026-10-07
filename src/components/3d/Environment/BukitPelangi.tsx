import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { colliders, addSolidBox, addSolidCylinder, removeSolidCollider, SolidCollider } from '../../../state/colliders';
import { gameStore } from '../../../state/useGameStore';
import { soundManager } from '../../../sound/audioManager';

/**
 * Bukit Pelangi (Rainbow Hill)
 * High scenic elevated hill with grass slide, colorful wind turbines, kites, and observation deck.
 */
export const BukitPelangi: React.FC = () => {
  const windmillRef1 = useRef<THREE.Group>(null);
  const windmillRef2 = useRef<THREE.Group>(null);
  const kiteRef1 = useRef<THREE.Group>(null);
  const kiteRef2 = useRef<THREE.Group>(null);

  // Register colliders for stepped hill terraces
  useEffect(() => {
    // 1. Lower Hill Terrace (Y: 3.2)
    const lowerBox = new THREE.Box3(new THREE.Vector3(85, -1, 75), new THREE.Vector3(145, 3.2, 135));
    // 2. Mid Hill Terrace (Y: 6.2)
    const midBox = new THREE.Box3(new THREE.Vector3(95, 0, 85), new THREE.Vector3(135, 6.2, 125));
    // 3. Peak Summit Terrace (Y: 8.8)
    const peakBox = new THREE.Box3(new THREE.Vector3(105, 0, 95), new THREE.Vector3(125, 8.8, 115));

    const c1 = { box: lowerBox, type: 'ground' as const };
    const c2 = { box: midBox, type: 'ground' as const };
    const c3 = { box: peakBox, type: 'ground' as const };
    colliders.push(c1, c2, c3);

    const solids: SolidCollider[] = [
      // Gazebo pillars at peak [115, 8.8, 105]
      addSolidCylinder(112.5, 102.5, 0.25, 8.8, 12.5, 'pelangi_pillar_1'),
      addSolidCylinder(117.5, 102.5, 0.25, 8.8, 12.5, 'pelangi_pillar_2'),
      addSolidCylinder(112.5, 107.5, 0.25, 8.8, 12.5, 'pelangi_pillar_3'),
      addSolidCylinder(117.5, 107.5, 0.25, 8.8, 12.5, 'pelangi_pillar_4'),
      // Wind turbine masts
      addSolidCylinder(92, 90, 0.5, 3.2, 12, 'turbine_mast_1'),
      addSolidCylinder(138, 120, 0.5, 3.2, 12, 'turbine_mast_2'),
    ];

    return () => {
      [c1, c2, c3].forEach((c) => {
        const idx = colliders.indexOf(c);
        if (idx !== -1) colliders.splice(idx, 1);
      });
      solids.forEach(removeSolidCollider);
    };
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // Rotate Windmills
    if (windmillRef1.current) windmillRef1.current.rotation.z += delta * 2.2;
    if (windmillRef2.current) windmillRef2.current.rotation.z += delta * 1.8;

    // Flutter Kites
    if (kiteRef1.current) {
      kiteRef1.current.position.y = 18 + Math.sin(t * 1.5) * 1.2;
      kiteRef1.current.rotation.z = Math.sin(t * 2) * 0.25;
    }
    if (kiteRef2.current) {
      kiteRef2.current.position.y = 22 + Math.sin(t * 1.8 + 1) * 1.4;
      kiteRef2.current.rotation.z = Math.cos(t * 2.2) * 0.22;
    }

    // Check peak gazebo telescope proximity
    const p = gameStore.getState().playerPos;
    const distTelescope = Math.hypot(p[0] - 115, p[2] - 105);
    const near = gameStore.getState().nearbyInteractable;

    if (distTelescope < 4.2 && p[1] > 8.0) {
      if (near?.id !== 'pelangi_telescope') {
        gameStore.setNearbyInteractable({
          id: 'pelangi_telescope',
          title: 'Teropong Puncak Pelangi 🔭✨',
          prompt: 'Tekan [E] untuk Menikmati Pemandangan Seluruh Pulau! 🌈',
        });
      }
    } else if (near?.id === 'pelangi_telescope') {
      gameStore.setNearbyInteractable(null);
    }
  });

  return (
    <group>
      {/* 1. ELEVATED HILL TIER MESHES */}
      {/* Lower Grassy Tier */}
      <mesh position={[115, 1.6, 105]} receiveShadow>
        <boxGeometry args={[60, 3.2, 60]} />
        <meshStandardMaterial color="#86EFAC" roughness={0.85} />
      </mesh>
      {/* Mid Grassy Tier */}
      <mesh position={[115, 4.7, 105]} receiveShadow>
        <boxGeometry args={[40, 3.0, 40]} />
        <meshStandardMaterial color="#4ADE80" roughness={0.85} />
      </mesh>
      {/* Summit Peak Tier */}
      <mesh position={[115, 7.5, 105]} receiveShadow>
        <boxGeometry args={[20, 2.6, 20]} />
        <meshStandardMaterial color="#22C55E" roughness={0.85} />
      </mesh>

      {/* 2. GRASS SLIDE RAMP (From Summit down to ground) */}
      <mesh position={[115, 4.6, 130]} rotation={[Math.atan2(8.4, 30), 0, 0]} receiveShadow
        onClick={(e) => { e.stopPropagation(); gameStore.setActiveRide('rainbow_slide'); }}>
        <boxGeometry args={[3, 0.4, 31.15]} />
        <meshStandardMaterial color="#FBBF24" roughness={0.4} />
      </mesh>
      {/* Rainbow guide borders along slide */}
      {[-2.3, 2.3].map((offZ, i) => (
        <mesh key={i} position={[115 + offZ * 0.7, 4.8, 130]} rotation={[Math.atan2(8.4, 30), 0, 0]}>
          <boxGeometry args={[0.25, 0.35, 31.15]} />
          <meshStandardMaterial color="#F472B6" />
        </mesh>
      ))}

      {/* 3. SUMMIT OBSERVATION GAZEBO */}
      <group position={[115, 8.8, 105]}>
        {/* Wooden Gazebo Floor Platform */}
        <mesh position={[0, 0.1, 0]} receiveShadow>
          <cylinderGeometry args={[4.2, 4.2, 0.2, 16]} />
          <meshStandardMaterial color="#C084FC" roughness={0.6} />
        </mesh>
        {/* Gazebo Pillars */}
        {[
          [-2.5, -2.5],
          [2.5, -2.5],
          [-2.5, 2.5],
          [2.5, 2.5],
        ].map(([px, pz], idx) => (
          <mesh key={idx} position={[px, 1.8, pz]} castShadow>
            <cylinderGeometry args={[0.12, 0.14, 3.6, 8]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
        ))}
        {/* Vibrant Rainbow Canopy Roof */}
        <mesh position={[0, 4.2, 0]} castShadow>
          <coneGeometry args={[4.8, 2.2, 16]} />
          <meshStandardMaterial color="#F43F5E" roughness={0.3} />
        </mesh>
        {/* Golden Finial Star */}
        <mesh position={[0, 5.6, 0]}>
          <octahedronGeometry args={[0.45]} />
          <meshStandardMaterial color="#FACC15" metalness={0.6} emissive="#FACC15" emissiveIntensity={0.4} />
        </mesh>

        {/* Golden Observation Telescope */}
        <group position={[0, 0.8, 3.2]} rotation={[-0.3, 0, 0]}>
          {/* Tripod */}
          <mesh position={[0, -0.35, 0]}>
            <cylinderGeometry args={[0.06, 0.2, 0.7, 8]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          {/* Scope tube */}
          <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.14, 0.8, 12]} />
            <meshStandardMaterial color="#FACC15" metalness={0.8} roughness={0.2} />
          </mesh>
          <Billboard position={[0, 0.8, 0]}>
            <Text fontSize={0.24} color="#C084FC" outlineWidth={0.03} outlineColor="#FFFFFF" anchorY="middle">
              🔭 Teropong Puncak Pelangi
            </Text>
          </Billboard>
        </group>
      </group>

      {/* 4. COLORFUL SPINNING WIND TURBINES */}
      <group position={[92, 3.2, 90]}>
        <mesh position={[0, 4.5, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.45, 9, 12]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
        <group ref={windmillRef1} position={[0, 9.0, 0.4]}>
          <mesh>
            <sphereGeometry args={[0.35, 12, 12]} />
            <meshStandardMaterial color="#38BDF8" />
          </mesh>
          {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((ang, i) => (
            <mesh key={i} rotation={[0, 0, ang]} position={[0, 2.2, 0]} castShadow>
              <boxGeometry args={[0.3, 4.2, 0.05]} />
              <meshStandardMaterial color="#38BDF8" />
            </mesh>
          ))}
        </group>
      </group>

      <group position={[138, 3.2, 120]}>
        <mesh position={[0, 4.5, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.45, 9, 12]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
        <group ref={windmillRef2} position={[0, 9.0, 0.4]}>
          <mesh>
            <sphereGeometry args={[0.35, 12, 12]} />
            <meshStandardMaterial color="#EC4899" />
          </mesh>
          {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((ang, i) => (
            <mesh key={i} rotation={[0, 0, ang]} position={[0, 2.2, 0]} castShadow>
              <boxGeometry args={[0.3, 4.2, 0.05]} />
              <meshStandardMaterial color="#EC4899" />
            </mesh>
          ))}
        </group>
      </group>

      {/* 5. FLUTTERING KITES IN THE SKY */}
      <group ref={kiteRef1} position={[105, 18, 95]}>
        <mesh rotation={[0.4, 0.3, 0]}>
          <octahedronGeometry args={[1.2, 0]} />
          <meshStandardMaterial color="#F43F5E" roughness={0.2} />
        </mesh>
        {/* Tail ribbons */}
        {[0.6, 1.2, 1.8].map((ty, i) => (
          <mesh key={i} position={[0, -ty, 0]}>
            <sphereGeometry args={[0.08, 6, 6]} />
            <meshBasicMaterial color="#FBBF24" />
          </mesh>
        ))}
      </group>

      <group ref={kiteRef2} position={[125, 22, 115]}>
        <mesh rotation={[-0.3, -0.4, 0]}>
          <octahedronGeometry args={[1.0, 0]} />
          <meshStandardMaterial color="#38BDF8" roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
};
