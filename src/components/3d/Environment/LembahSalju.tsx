import React, { useEffect, useState } from 'react';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { colliders, addSolidBox, addSolidCylinder, removeSolidCollider, SolidCollider } from '../../../state/colliders';
import { gameStore, useGameStore } from '../../../state/useGameStore';
import { soundManager } from '../../../sound/audioManager';

/**
 * Lembah Salju (Snow Valley)
 * Winter wonderland with snowy terrain, slippery ice rink, pine trees, and interactive snowman station.
 */
export const LembahSalju: React.FC = () => {
  const [snowmanBuilt, setSnowmanBuilt] = useState(gameStore.getState().unlockedStickers.salju === true);

  useEffect(() => {
    // 1. Snow Valley Ground (X: -35 to 35, Z: 105 to 160)
    const snowFloorBox = new THREE.Box3(new THREE.Vector3(-35, -1, 105), new THREE.Vector3(35, 0.4, 160));
    // 2. Frozen Ice Pond (X: -12 to 12, Z: 120 to 144)
    const icePondBox = new THREE.Box3(new THREE.Vector3(-12, -0.5, 120), new THREE.Vector3(12, 0.38, 144));

    const c1 = { box: snowFloorBox, type: 'ground' as const };
    const c2 = { box: icePondBox, type: 'ground' as const };
    colliders.push(c1, c2);

    const solids: SolidCollider[] = [
      // Snow-capped pine tree trunks
      addSolidCylinder(-20, 115, 0.6, 0, 7.0, 'snow_pine_1'),
      addSolidCylinder(22, 118, 0.6, 0, 7.0, 'snow_pine_2'),
      addSolidCylinder(-24, 145, 0.6, 0, 7.0, 'snow_pine_3'),
      addSolidCylinder(20, 148, 0.6, 0, 7.0, 'snow_pine_4'),
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
      {/* 1. SNOW GROUND PLATFORM */}
      <mesh position={[0, -0.2, 132.5]} receiveShadow>
        <boxGeometry args={[70, 1.2, 55]} />
        <meshStandardMaterial color="#F1F5F9" roughness={0.9} />
      </mesh>

      {/* 2. SLIPPERY FROZEN ICE POND */}
      <group position={[0, 0.38, 132]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[24, 24]} />
          <meshStandardMaterial
            color="#A5F3FC"
            roughness={0.06}
            metalness={0.2}
            transparent
            opacity={0.9}
          />
        </mesh>
        {/* Snowy Bank Border around ice rink */}
        <mesh position={[0, 0.04, -12.1]} receiveShadow>
          <boxGeometry args={[25, 0.25, 0.6]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.04, 12.1]} receiveShadow>
          <boxGeometry args={[25, 0.25, 0.6]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.9} />
        </mesh>
        <mesh position={[-12.1, 0.04, 0]} receiveShadow>
          <boxGeometry args={[0.6, 0.25, 24]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.9} />
        </mesh>
        <mesh position={[12.1, 0.04, 0]} receiveShadow>
          <boxGeometry args={[0.6, 0.25, 24]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.9} />
        </mesh>

        <Billboard position={[0, 1.5, 0]}>
          <Text fontSize={0.24} color="#0891B2" outlineWidth={0.03} outlineColor="#FFF" anchorY="middle">
            ⛸️ Danau Es Licin Khaulah
          </Text>
        </Billboard>
      </group>

      {/* 3. INTERACTIVE SNOWMAN STATION */}
      <group
        position={[16, 0.4, 126]}
        onClick={(e) => {
          e.stopPropagation();
          setSnowmanBuilt(true);
          soundManager.playStarCollect();
          gameStore.unlockSticker('salju');
          gameStore.setMessage('Horeee! Khaulah berhasil membangun Boneka Salju Ceria! ⛄❄️✨');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Snow base / finished Snowman */}
        {snowmanBuilt ? (
          <group position={[0, 0, 0]}>
            {/* Bottom Snowball */}
            <mesh position={[0, 0.55, 0]} castShadow>
              <sphereGeometry args={[0.55, 16, 16]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
            </mesh>
            {/* Middle Snowball */}
            <mesh position={[0, 1.35, 0]} castShadow>
              <sphereGeometry args={[0.42, 16, 16]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
            </mesh>
            {/* Head Snowball */}
            <mesh position={[0, 2.05, 0]} castShadow>
              <sphereGeometry args={[0.32, 16, 16]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
            </mesh>
            {/* Orange Carrot Nose */}
            <mesh position={[0, 2.05, 0.35]} rotation={[0.2, 0, 0]}>
              <coneGeometry args={[0.07, 0.28, 6]} />
              <meshStandardMaterial color="#F97316" />
            </mesh>
            {/* Black Coal Eyes */}
            <mesh position={[-0.1, 2.15, 0.28]}>
              <sphereGeometry args={[0.04, 6, 6]} />
              <meshBasicMaterial color="#0F172A" />
            </mesh>
            <mesh position={[0.1, 2.15, 0.28]}>
              <sphereGeometry args={[0.04, 6, 6]} />
              <meshBasicMaterial color="#0F172A" />
            </mesh>
            {/* Red Warm Scarf */}
            <mesh position={[0, 1.72, 0]}>
              <torusGeometry args={[0.34, 0.09, 8, 20]} />
              <meshStandardMaterial color="#EF4444" roughness={0.5} />
            </mesh>
            {/* Black Top Hat */}
            <mesh position={[0, 2.38, 0]}>
              <cylinderGeometry args={[0.28, 0.28, 0.06, 12]} />
              <meshStandardMaterial color="#1E293B" />
            </mesh>
            <mesh position={[0, 2.62, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.42, 12]} />
              <meshStandardMaterial color="#1E293B" />
            </mesh>
          </group>
        ) : (
          <group position={[0, 0, 0]}>
            {/* Rolling Snowball Spot */}
            <mesh position={[0, 0.35, 0]} castShadow>
              <sphereGeometry args={[0.38, 12, 12]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
            </mesh>
            <Billboard position={[0, 1.2, 0]}>
              <Text fontSize={0.22} color="#0284C7" outlineWidth={0.03} outlineColor="#FFF" anchorY="middle">
                ⛄ Sentuh untuk Buat Boneka Salju!
              </Text>
            </Billboard>
          </group>
        )}
      </group>

      {/* 4. SNOW-CAPPED PINE TREES */}
      {[
        [-20, 115, 1.3],
        [22, 118, 1.2],
        [-24, 145, 1.4],
        [20, 148, 1.1],
      ].map(([tx, tz, sc], idx) => (
        <group key={idx} position={[tx, 0.4, tz]} scale={sc}>
          {/* Trunk */}
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.4, 3.0, 8]} />
            <meshStandardMaterial color="#4A2810" roughness={0.9} />
          </mesh>
          {/* Pine Tier 1 */}
          <mesh position={[0, 3.2, 0]} castShadow>
            <coneGeometry args={[2.4, 2.2, 8]} />
            <meshStandardMaterial color="#14532D" roughness={0.7} />
          </mesh>
          {/* Snow Cap 1 */}
          <mesh position={[0, 3.5, 0]}>
            <coneGeometry args={[2.45, 0.6, 8]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
          </mesh>
          {/* Pine Tier 2 */}
          <mesh position={[0, 4.6, 0]} castShadow>
            <coneGeometry args={[1.8, 1.8, 8]} />
            <meshStandardMaterial color="#14532D" roughness={0.7} />
          </mesh>
          {/* Snow Cap 2 */}
          <mesh position={[0, 4.85, 0]}>
            <coneGeometry args={[1.85, 0.5, 8]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
          </mesh>
          {/* Pine Tier 3 Top */}
          <mesh position={[0, 5.7, 0]} castShadow>
            <coneGeometry args={[1.2, 1.5, 8]} />
            <meshStandardMaterial color="#14532D" roughness={0.7} />
          </mesh>
          <mesh position={[0, 5.9, 0]}>
            <coneGeometry args={[1.25, 0.4, 8]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
