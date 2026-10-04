import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { colliders } from '../../../state/colliders';

interface AnimatedTreeProps {
  pos: [number, number, number];
  leafColor: string;
  scale: number;
  seed: number;
}

const AnimatedTree: React.FC<AnimatedTreeProps> = ({ pos, leafColor, scale, seed }) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.z = Math.sin(t * 1.4 + seed) * 0.04;
    groupRef.current.rotation.x = Math.cos(t * 1.1 + seed) * 0.03;
  });

  return (
    <group ref={groupRef} position={pos} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.38, 2.4, 8]} />
        <meshStandardMaterial color="#8D5B4C" roughness={0.8} />
      </mesh>
      {/* Foliage Tier 1 */}
      <mesh position={[0, 2.6, 0]} castShadow>
        <sphereGeometry args={[1.35, 14, 14]} />
        <meshStandardMaterial color={leafColor} roughness={0.5} />
      </mesh>
      {/* Foliage Tier 2 */}
      <mesh position={[0, 3.5, 0]} castShadow>
        <sphereGeometry args={[0.95, 12, 12]} />
        <meshStandardMaterial color={leafColor} roughness={0.5} />
      </mesh>
    </group>
  );
};

interface AnimatedFlowerProps {
  x: number;
  z: number;
  color: string;
  seed: number;
}

const AnimatedFlower: React.FC<AnimatedFlowerProps> = ({ x, z, color, seed }) => {
  const flowerRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!flowerRef.current) return;
    const t = state.clock.getElapsedTime();
    flowerRef.current.rotation.z = Math.sin(t * 2.2 + seed) * 0.08;
    flowerRef.current.rotation.x = Math.cos(t * 1.8 + seed) * 0.05;
  });

  return (
    <group ref={flowerRef} position={[x, 0.25, z]}>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.3, 6]} />
        <meshStandardMaterial color="#38B000" />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
};

// Village River with animated shimmering water and lily pads
const AnimatedRiver: React.FC = () => {
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!waterRef.current) return;
    const t = state.clock.getElapsedTime();
    waterRef.current.position.y = 0.06 + Math.sin(t * 2.0) * 0.012;
  });

  return (
    <group position={[0, 0, 11]}>
      {/* River Bed Trench */}
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[30, 0.5, 4.8]} />
        <meshStandardMaterial color="#403D39" roughness={0.9} />
      </mesh>

      {/* Crystal Clear River Water */}
      <mesh ref={waterRef} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 4.5]} />
        <meshStandardMaterial color="#48CAE4" roughness={0.1} transparent opacity={0.82} metalness={0.1} />
      </mesh>

      {/* River Riverbank Pebbles */}
      {[-12, -9, -6, -3, 3, 6, 9, 12].map((px, idx) => (
        <React.Fragment key={idx}>
          <mesh position={[px, 0.1, -2.4]} scale={[0.4, 0.2, 0.4]}>
            <sphereGeometry args={[0.6, 8, 8]} />
            <meshStandardMaterial color="#CCC5B9" roughness={0.8} />
          </mesh>
          <mesh position={[px + 1.2, 0.1, 2.4]} scale={[0.4, 0.2, 0.4]}>
            <sphereGeometry args={[0.6, 8, 8]} />
            <meshStandardMaterial color="#CCC5B9" roughness={0.8} />
          </mesh>
        </React.Fragment>
      ))}

      {/* Lily pads floating on water */}
      {[
        { x: -5, z: -0.6 },
        { x: 5, z: 0.8 },
        { x: -9, z: 0.4 },
        { x: 8, z: -0.5 },
      ].map((pad, idx) => (
        <group key={idx} position={[pad.x, 0.09, pad.z]} rotation={[-Math.PI / 2, 0, idx]}>
          <circleGeometry args={[0.4, 12]} />
          <meshStandardMaterial color="#52B788" roughness={0.4} />
        </group>
      ))}
    </group>
  );
};

// Wooden Bridge over the River
const WoodenBridge: React.FC = () => {
  return (
    <group position={[0, 0.22, 11]}>
      {/* Bridge Wooden Floor Planks */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 0.22, 5.8]} />
        <meshStandardMaterial color="#B08968" roughness={0.7} />
      </mesh>

      {/* Bridge Wooden Handrails (Left & Right) */}
      {[-1.75, 1.75].map((rx, idx) => (
        <group key={idx} position={[rx, 0.7, 0]}>
          {/* Top Rail */}
          <mesh castShadow>
            <boxGeometry args={[0.15, 0.12, 5.8]} />
            <meshStandardMaterial color="#7F4F24" />
          </mesh>
          {/* Rail Posts */}
          {[-2.4, -1.2, 0, 1.2, 2.4].map((pz, pi) => (
            <mesh key={pi} position={[0, -0.35, pz]} castShadow>
              <cylinderGeometry args={[0.06, 0.06, 0.7, 8]} />
              <meshStandardMaterial color="#7F4F24" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

export const GroundIsland: React.FC = () => {
  useEffect(() => {
    // 1. Home Area Ground (Z: -16 to 8.5)
    const homeBox = new THREE.Box3(
      new THREE.Vector3(-16, -1, -16),
      new THREE.Vector3(16, 0.25, 8.5)
    );
    // 2. Central Bridge Ground (Z: 8.5 to 13.5)
    const bridgeBox = new THREE.Box3(
      new THREE.Vector3(-2.4, -0.5, 8.5),
      new THREE.Vector3(2.4, 0.5, 13.5)
    );
    // 3. School Area Ground (Z: 13.5 to 48)
    const schoolBox = new THREE.Box3(
      new THREE.Vector3(-16, -1, 13.5),
      new THREE.Vector3(16, 0.25, 48)
    );
    // 4. West Farm & Orchard Ground (X: -56 to -15, Z: -16 to 10)
    const westFarmBox = new THREE.Box3(
      new THREE.Vector3(-56, -1, -16),
      new THREE.Vector3(-15, 0.25, 10)
    );
    // 5. West Lake & Sandy Beach Ground (X: -56 to -15, Z: 9 to 48)
    const westBeachBox = new THREE.Box3(
      new THREE.Vector3(-56, -1, 9),
      new THREE.Vector3(-15, 0.25, 48)
    );
    // 6. West Connecting Bridge (X: -26 to -18, Z: 8.5 to 13.5)
    const westBridgeBox = new THREE.Box3(
      new THREE.Vector3(-26, -0.5, 8.5),
      new THREE.Vector3(-18, 0.5, 13.5)
    );
    // 7. East Town Street Ground (X: 15 to 56, Z: -16 to 10)
    const eastTownBox = new THREE.Box3(
      new THREE.Vector3(15, -1, -16),
      new THREE.Vector3(56, 0.25, 10)
    );
    // 8. East Carnival Plaza Ground (X: 15 to 56, Z: 9 to 48)
    const eastCarnivalBox = new THREE.Box3(
      new THREE.Vector3(15, -1, 9),
      new THREE.Vector3(56, 0.25, 48)
    );
    // 9. East Connecting Avenue Bridge (X: 18 to 26, Z: 8.5 to 13.5)
    const eastBridgeBox = new THREE.Box3(
      new THREE.Vector3(18, -0.5, 8.5),
      new THREE.Vector3(26, 0.5, 13.5)
    );

    const c1 = { box: homeBox, type: 'ground' as const };
    const c2 = { box: bridgeBox, type: 'ground' as const };
    const c3 = { box: schoolBox, type: 'ground' as const };
    const c4 = { box: westFarmBox, type: 'ground' as const };
    const c5 = { box: westBeachBox, type: 'ground' as const };
    const c6 = { box: westBridgeBox, type: 'ground' as const };
    const c7 = { box: eastTownBox, type: 'ground' as const };
    const c8 = { box: eastCarnivalBox, type: 'ground' as const };
    const c9 = { box: eastBridgeBox, type: 'ground' as const };

    colliders.push(c1, c2, c3, c4, c5, c6, c7, c8, c9);

    return () => {
      [c1, c2, c3, c4, c5, c6, c7, c8, c9].forEach((c) => {
        const idx = colliders.indexOf(c);
        if (idx !== -1) colliders.splice(idx, 1);
      });
    };
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* ============================================================== */}
      {/* 1. HOME LAWN TERRAIN (Rumah Khaulah, Z: -16 to 8)              */}
      {/* ============================================================== */}
      <mesh position={[0, -0.2, -4]} receiveShadow>
        <boxGeometry args={[30, 0.9, 24]} />
        <meshStandardMaterial color="#70E000" roughness={0.7} />
      </mesh>

      {/* Earth Base Beneath Home Lawn */}
      <mesh position={[0, -1.8, -4]}>
        <boxGeometry args={[30.5, 2.3, 24.5]} />
        <meshStandardMaterial color="#582F0E" roughness={0.9} />
      </mesh>

      {/* ============================================================== */}
      {/* 2. VILLAGE RIVER & WOODEN FOOTBRIDGES                          */}
      {/* ============================================================== */}
      <AnimatedRiver />
      <WoodenBridge />

      {/* West River Extension Bridge */}
      <group position={[-22, 0.22, 11]}>
        <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.2, 0.22, 5.8]} />
          <meshStandardMaterial color="#B08968" roughness={0.7} />
        </mesh>
      </group>

      {/* East Avenue Stone Bridge */}
      <group position={[22, 0.22, 11]}>
        <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.2, 0.22, 5.8]} />
          <meshStandardMaterial color="#E0AAFF" roughness={0.5} />
        </mesh>
      </group>

      {/* ============================================================== */}
      {/* 3. SCHOOL TK KARANG TENGAH LAWN TERRAIN (Z: 13.5 to 48)        */}
      {/* ============================================================== */}
      <mesh position={[0, -0.2, 30.5]} receiveShadow>
        <boxGeometry args={[32, 0.9, 35]} />
        <meshStandardMaterial color="#55A630" roughness={0.65} />
      </mesh>

      {/* Earth Base Beneath School Lawn */}
      <mesh position={[0, -1.8, 30.5]}>
        <boxGeometry args={[32.5, 2.3, 35.5]} />
        <meshStandardMaterial color="#582F0E" roughness={0.9} />
      </mesh>

      {/* Schoolyard Paved Stone Path from Gate to Doors */}
      <mesh position={[0, 0.22, 28]} receiveShadow>
        <boxGeometry args={[3.2, 0.05, 18]} />
        <meshStandardMaterial color="#D4A373" roughness={0.6} />
      </mesh>

      {/* ============================================================== */}
      {/* 4. WEST ZONE BASE TERRAINS (Petting Zoo & Lake Beach)          */}
      {/* ============================================================== */}
      {/* West Farm Lawn */}
      <mesh position={[-35, -0.2, -3]} receiveShadow>
        <boxGeometry args={[40, 0.9, 26]} />
        <meshStandardMaterial color="#7CB518" roughness={0.7} />
      </mesh>
      <mesh position={[-35, -1.8, -3]}>
        <boxGeometry args={[40.5, 2.3, 26.5]} />
        <meshStandardMaterial color="#582F0E" roughness={0.9} />
      </mesh>

      {/* West Lake Beach Sandy Grass Lawn */}
      <mesh position={[-35, -0.2, 29]} receiveShadow>
        <boxGeometry args={[40, 0.9, 38]} />
        <meshStandardMaterial color="#A7C957" roughness={0.7} />
      </mesh>
      <mesh position={[-35, -1.8, 29]}>
        <boxGeometry args={[40.5, 2.3, 38.5]} />
        <meshStandardMaterial color="#582F0E" roughness={0.9} />
      </mesh>

      {/* ============================================================== */}
      {/* 5. EAST ZONE BASE TERRAINS (Town Street & Carnival Plaza)      */}
      {/* ============================================================== */}
      {/* East Town Street Base */}
      <mesh position={[35, -0.2, -3]} receiveShadow>
        <boxGeometry args={[40, 0.9, 26]} />
        <meshStandardMaterial color="#CED4DA" roughness={0.6} />
      </mesh>
      <mesh position={[35, -1.8, -3]}>
        <boxGeometry args={[40.5, 2.3, 26.5]} />
        <meshStandardMaterial color="#582F0E" roughness={0.9} />
      </mesh>

      {/* East Carnival Plaza Base */}
      <mesh position={[35, -0.2, 29]} receiveShadow>
        <boxGeometry args={[40, 0.9, 38]} />
        <meshStandardMaterial color="#FFCAD4" roughness={0.5} />
      </mesh>
      <mesh position={[35, -1.8, 29]}>
        <boxGeometry args={[40.5, 2.3, 38.5]} />
        <meshStandardMaterial color="#582F0E" roughness={0.9} />
      </mesh>

      {/* ============================================================== */}
      {/* 4. TREES SWAYING IN THE WIND (Around Village & School)         */}
      {/* ============================================================== */}
      {[
        // Near Home
        { pos: [-10, 0.25, -6], leafColor: '#FF6B8B', scale: 1.2, seed: 0 },
        { pos: [10, 0.25, -6], leafColor: '#FF99C8', scale: 1.3, seed: 1.5 },
        { pos: [-11, 0.25, 2], leafColor: '#38B000', scale: 1.1, seed: 2.3 },
        { pos: [11, 0.25, 3], leafColor: '#FFD166', scale: 1.0, seed: 3.8 },
        // Near River
        { pos: [-12, 0.25, 11], leafColor: '#2EC4B6', scale: 1.25, seed: 4.1 },
        { pos: [12, 0.25, 11], leafColor: '#2EC4B6', scale: 1.25, seed: 5.2 },
        // Around TK Karang Tengah
        { pos: [-12, 0.25, 22], leafColor: '#A0C4FF', scale: 1.2, seed: 6.3 },
        { pos: [12, 0.25, 22], leafColor: '#FFB703', scale: 1.1, seed: 7.1 },
        { pos: [-12, 0.25, 38], leafColor: '#80ED99', scale: 1.3, seed: 8.4 },
        { pos: [12, 0.25, 38], leafColor: '#80ED99', scale: 1.3, seed: 9.0 },
      ].map((tree, idx) => (
        <AnimatedTree
          key={idx}
          pos={tree.pos as [number, number, number]}
          leafColor={tree.leafColor}
          scale={tree.scale}
          seed={tree.seed}
        />
      ))}

      {/* ============================================================== */}
      {/* 5. COLORFUL FLOWERS (Home Yard & School Playground)             */}
      {/* ============================================================== */}
      {[
        // Home Yard Flowers
        { x: -5, z: -2, c: '#FF4D6D', seed: 0.2 },
        { x: 5, z: -2, c: '#FFB703', seed: 1.1 },
        { x: -4, z: 4, c: '#9B5DE5', seed: 2.5 },
        { x: 4, z: 5, c: '#F15BB5', seed: 3.4 },
        // Schoolyard Flowers
        { x: -6, z: 20, c: '#FF006E', seed: 4.2 },
        { x: 6, z: 20, c: '#00F5D4', seed: 5.1 },
        { x: -5, z: 35, c: '#FEE440', seed: 6.3 },
        { x: 5, z: 35, c: '#FF70A6', seed: 7.4 },
      ].map((flower, idx) => (
        <AnimatedFlower
          key={idx}
          x={flower.x}
          z={flower.z}
          color={flower.c}
          seed={flower.seed}
        />
      ))}

      {/* ============================================================== */}
      {/* 6. RAINBOW SKYWAY PORTAL ARCHWAY (Behind School, Z: 48)        */}
      {/* ============================================================== */}
      <group position={[0, 0.25, 48]}>
        <mesh position={[-2.4, 2.0, 0]}>
          <cylinderGeometry args={[0.3, 0.35, 4.0, 12]} />
          <meshStandardMaterial color="#FF9F1C" />
        </mesh>
        <mesh position={[2.4, 2.0, 0]}>
          <cylinderGeometry args={[0.3, 0.35, 4.0, 12]} />
          <meshStandardMaterial color="#FF9F1C" />
        </mesh>
        <mesh position={[0, 4.0, 0]}>
          <torusGeometry args={[2.4, 0.35, 12, 24, Math.PI]} />
          <meshStandardMaterial color="#FF1493" />
        </mesh>
        {/* Banner Sign: "Jalur Pelangi Ajaib" */}
        <mesh position={[0, 4.4, 0]}>
          <boxGeometry args={[3.2, 0.65, 0.1]} />
          <meshStandardMaterial color="#FFD166" />
        </mesh>
      </group>
    </group>
  );
};
