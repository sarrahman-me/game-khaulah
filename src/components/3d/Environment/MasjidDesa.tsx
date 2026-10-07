import React, { useEffect } from 'react';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { colliders, addSolidBox, addSolidCylinder, removeSolidCollider, SolidCollider } from '../../../state/colliders';
import { gameStore } from '../../../state/useGameStore';
import { soundManager } from '../../../sound/audioManager';

/**
 * Masjid Desa yang Indah (Masjid Baiturrahman)
 * Beautiful Islamic architecture with turquoise dome, tall minarets, marble courtyard, fountain, and prayer area.
 */
export const MasjidDesa: React.FC = () => {
  useEffect(() => {
    // 1. Courtyard Ground (X: -25 to 25, Z: -85 to -45, Y: 0.4)
    const courtyardBox = new THREE.Box3(new THREE.Vector3(-25, -1, -85), new THREE.Vector3(25, 0.4, -45));
    // 2. Raised Prayer Hall Platform (X: -14 to 14, Z: -78 to -52, Y: 0.8)
    const hallBox = new THREE.Box3(new THREE.Vector3(-14, 0, -78), new THREE.Vector3(14, 0.8, -52));

    const c1 = { box: courtyardBox, type: 'ground' as const };
    const c2 = { box: hallBox, type: 'ground' as const };
    colliders.push(c1, c2);

    const solids: SolidCollider[] = [
      // 4 Corner Minarets
      addSolidCylinder(-15, -78, 1.2, 0, 18.0, 'minaret_sw'),
      addSolidCylinder(15, -78, 1.2, 0, 18.0, 'minaret_se'),
      addSolidCylinder(-15, -52, 1.2, 0, 18.0, 'minaret_nw'),
      addSolidCylinder(15, -52, 1.2, 0, 18.0, 'minaret_ne'),
      // Wudhu Fountain in Courtyard at [0, -48]
      addSolidCylinder(0, -48, 1.8, 0, 1.5, 'masjid_fountain'),
      // North Qibla Wall (Z: -78)
      addSolidBox([-14, 0.8, -78.4], [14, 8.0, -77.6], 'masjid_qibla_wall'),
    ];

    return () => {
      [c1, c2].forEach((c) => {
        const idx = colliders.indexOf(c);
        if (idx !== -1) colliders.splice(idx, 1);
      });
      solids.forEach(removeSolidCollider);
    };
  }, []);

  return (
    <group>
      {/* 1. MARBLE COURTYARD PLATFORM */}
      <mesh position={[0, -0.2, -65]} receiveShadow>
        <boxGeometry args={[50, 1.2, 40]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
      </mesh>

      {/* 2. RAISED PRAYER HALL PLATFORM */}
      <mesh position={[0, 0.4, -65]} receiveShadow>
        <boxGeometry args={[28, 0.8, 26]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.4} />
      </mesh>

      {/* Soft Emerald Prayer Carpet Lines */}
      <mesh position={[0, 0.81, -65]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[25, 23]} />
        <meshStandardMaterial color="#065F46" roughness={0.7} />
      </mesh>
      {/* Golden Carpet Stripes */}
      {[-8, -4, 0, 4, 8].map((sy, i) => (
        <mesh key={i} position={[0, 0.82, -65 + sy]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[24, 0.15]} />
          <meshBasicMaterial color="#FBBF24" />
        </mesh>
      ))}

      {/* 3. MAJESTIC MAIN DOME & ARCH ROOF */}
      <group position={[0, 8.0, -65]}>
        {/* Octagonal Drum Base */}
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[7.2, 7.5, 2.5, 8]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
        {/* Turquoise & Gold Majestic Dome */}
        <mesh position={[0, 3.8, 0]} castShadow>
          <sphereGeometry args={[7.2, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color="#0D9488" roughness={0.25} metalness={0.15} />
        </mesh>
        {/* Golden Dome Finial & Crescent */}
        <mesh position={[0, 7.5, 0]}>
          <cylinderGeometry args={[0.08, 0.18, 1.8, 8]} />
          <meshStandardMaterial color="#FACC15" metalness={0.8} />
        </mesh>
        <mesh position={[0, 8.4, 0]} rotation={[0, 0, 0.5]}>
          <torusGeometry args={[0.45, 0.08, 8, 16, Math.PI * 1.4]} />
          <meshStandardMaterial color="#FACC15" metalness={0.8} emissive="#FACC15" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* 4. FOUR TALL GRACEFUL MINARETS */}
      {[
        [-15, -78],
        [15, -78],
        [-15, -52],
        [15, -52],
      ].map(([mx, mz], idx) => (
        <group key={idx} position={[mx, 0.8, mz]}>
          {/* Minaret Shaft */}
          <mesh position={[0, 7.5, 0]} castShadow>
            <cylinderGeometry args={[1.0, 1.3, 15.0, 12]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
          </mesh>
          {/* Balcony Gallery */}
          <mesh position={[0, 15.0, 0]} castShadow>
            <cylinderGeometry args={[1.5, 1.5, 0.4, 12]} />
            <meshStandardMaterial color="#0D9488" />
          </mesh>
          {/* Upper Cupola Dome */}
          <mesh position={[0, 17.0, 0]} castShadow>
            <coneGeometry args={[1.2, 3.2, 12]} />
            <meshStandardMaterial color="#0D9488" roughness={0.3} />
          </mesh>
          {/* Golden Crescent Spire */}
          <mesh position={[0, 19.0, 0]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#FACC15" metalness={0.8} emissive="#FACC15" emissiveIntensity={0.6} />
          </mesh>
        </group>
      ))}

      {/* 5. COURTYARD WUDHU FOUNTAIN */}
      <group position={[0, 0.4, -48]}>
        {/* Octagonal Basin */}
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.8, 2.1, 0.7, 8]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.4} />
        </mesh>
        {/* Crystal Blue Water Pool */}
        <mesh position={[0, 0.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.65, 16]} />
          <meshStandardMaterial color="#38BDF8" roughness={0.1} />
        </mesh>
        {/* Center Spout */}
        <mesh position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.2, 0.35, 1.2, 8]} />
          <meshStandardMaterial color="#FBBF24" metalness={0.6} />
        </mesh>
      </group>

      {/* 6. INTERACTIVE PRAYER SPOT (CARPET MIHRAB) */}
      <group
        position={[0, 0.82, -73]}
        onClick={(e) => {
          e.stopPropagation();
          gameStore.setActiveRide('pray');
          gameStore.unlockSticker('masjid');
          gameStore.setMessage('MasyaAllah! Khaulah bersujud dan sholat dengan tenang di Masjid Indah! 🕌🤲🌸');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Golden Mihrab Arch Frame */}
        <mesh position={[0, 2.8, -4.5]}>
          <torusGeometry args={[2.5, 0.3, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.7} />
        </mesh>
        <Billboard position={[0, 1.6, 0]}>
          <Text fontSize={0.24} color="#0D9488" outlineWidth={0.03} outlineColor="#FFF" anchorY="middle">
            🕌 Masjid Indah Baiturrahman (Sholat/Berdoa)
          </Text>
        </Billboard>
      </group>
    </group>
  );
};
