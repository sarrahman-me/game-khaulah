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
  const canopyRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!canopyRef.current) return;
    const t = state.clock.getElapsedTime();
    canopyRef.current.rotation.z = Math.sin(t * 1.2 + seed) * 0.028;
  });

  return (
    <group position={pos} scale={scale}>
      {/* Natural Tree Trunk */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.42, 2.4, 8]} />
        <meshStandardMaterial color="#6F4E37" roughness={0.85} />
      </mesh>
      {/* Root Flairs */}
      {[0, Math.PI * 0.66, Math.PI * 1.33].map((ang, idx) => (
        <mesh
          key={idx}
          position={[Math.cos(ang) * 0.35, 0.18, Math.sin(ang) * 0.35]}
          rotation={[0.3 * Math.sin(ang), 0, 0.3 * Math.cos(ang)]}
        >
          <cylinderGeometry args={[0.08, 0.16, 0.45, 6]} />
          <meshStandardMaterial color="#582F0E" roughness={0.9} />
        </mesh>
      ))}
      {/* Swaying Natural Foliage Canopy */}
      <group ref={canopyRef} position={[0, 2.6, 0]}>
        {/* Tier 1 Primary Canopy (casts soft shadow) */}
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[1.4, 12, 12]} />
          <meshStandardMaterial color={leafColor} roughness={0.65} />
        </mesh>
        {/* Tier 2 Canopy */}
        <mesh position={[0, 0.95, 0]}>
          <sphereGeometry args={[1.0, 10, 10]} />
          <meshStandardMaterial color={leafColor} roughness={0.65} />
        </mesh>
        {/* Top Foliage Puff */}
        <mesh position={[0.2, 1.55, -0.1]}>
          <sphereGeometry args={[0.65, 8, 8]} />
          <meshStandardMaterial color={leafColor} roughness={0.65} />
        </mesh>
      </group>
    </group>
  );
};

interface AnimatedFlowerProps {
  x: number;
  z: number;
  color: string;
  seed: number;
}

// Static flower model (zero per-frame update cost, buttery smooth rendering)
const AnimatedFlower: React.FC<AnimatedFlowerProps> = ({ x, z, color }) => {
  return (
    <group position={[x, 0.26, z]}>
      {/* Stem */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.3, 6]} />
        <meshStandardMaterial color="#386641" roughness={0.7} />
      </mesh>
      {/* Petals */}
      <mesh position={[0, 0.32, 0]}>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* Center Pistil */}
      <mesh position={[0, 0.34, 0]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color="#FFD166" />
      </mesh>
    </group>
  );
};

// Continuous Village River flowing across the entire island (X: -100 to +100, Z: 14.5 to 21.5)
const ContinuousVillageRiver: React.FC = () => {
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!waterRef.current) return;
    const t = state.clock.getElapsedTime();
    waterRef.current.position.y = 0.065 + Math.sin(t * 1.8) * 0.012;
  });

  // Generate riverbank stone clusters along the continuous river
  const riverPebbleXs = [-88, -75, -62, -49, -36, -24, -12, 12, 24, 36, 49, 62, 75, 88];
  const lilyPadData = [
    { x: -70, z: -1.0 },
    { x: -55, z: 1.2 },
    { x: -35, z: -0.8 },
    { x: -22, z: 1.0 },
    { x: -10, z: -0.9 },
    { x: 10, z: 1.1 },
    { x: 22, z: -0.7 },
    { x: 35, z: 0.9 },
    { x: 55, z: -1.0 },
    { x: 70, z: 1.2 },
  ];

  return (
    <group position={[0, 0, 18]}>
      {/* Clean Sandy Pebble River Bed (Trench depth) */}
      <mesh position={[0, -0.35, 0]}>
        <boxGeometry args={[200, 0.5, 6.6]} />
        <meshStandardMaterial color="#D4C5A9" roughness={0.9} />
      </mesh>

      {/* Realistic Glistening Blue River Water Surface */}
      <mesh ref={waterRef} position={[0, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 6.6]} />
        <meshStandardMaterial
          color="#0096C7"
          emissive="#0077B6"
          emissiveIntensity={0.28}
          roughness={0.06}
          metalness={0.0}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* South Riverbank Smooth Stone Curb (Z: -3.35) */}
      <mesh position={[0, 0.15, -3.35]} receiveShadow>
        <boxGeometry args={[200, 0.3, 0.3]} />
        <meshStandardMaterial color="#8D877B" roughness={0.8} />
      </mesh>

      {/* North Riverbank Smooth Stone Curb (Z: +3.35) */}
      <mesh position={[0, 0.15, 3.35]} receiveShadow>
        <boxGeometry args={[200, 0.3, 0.3]} />
        <meshStandardMaterial color="#8D877B" roughness={0.8} />
      </mesh>

      {/* Riverbank Pebbles and River Stones */}
      {riverPebbleXs.map((px, idx) => (
        <React.Fragment key={idx}>
          {/* South Bank Stones */}
          <mesh position={[px, 0.16, -3.2]} scale={[0.45, 0.22, 0.35]}>
            <sphereGeometry args={[0.7, 8, 8]} />
            <meshStandardMaterial color="#A8A29E" roughness={0.85} />
          </mesh>
          {/* North Bank Stones */}
          <mesh position={[px + 2.5, 0.16, 3.2]} scale={[0.45, 0.22, 0.35]}>
            <sphereGeometry args={[0.7, 8, 8]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.85} />
          </mesh>
        </React.Fragment>
      ))}

      {/* Floating Water Lily Pads with Delicate White/Pink Blossoms */}
      {lilyPadData.map((pad, idx) => (
        <group key={idx} position={[pad.x, 0.17, pad.z]} rotation={[-Math.PI / 2, 0, idx * 0.7]}>
          <circleGeometry args={[0.4, 12]} />
          <meshStandardMaterial color="#2D6A4F" roughness={0.4} />
          {/* Lily Flower on pad */}
          <mesh position={[0.1, 0.1, 0.05]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color={idx % 2 === 0 ? '#FFE5EC' : '#FFF'} />
          </mesh>
        </group>
      ))}

      {/* Riverbank Steps at Central Bridge (South & North) for easy splash access */}
      {[-1, 1].map((side, i) => (
        <group key={i} position={[side * 3.8, 0.05, 0]}>
          <mesh position={[0, 0.05, -3.1]}>
            <boxGeometry args={[1.6, 0.15, 0.7]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.05, 3.1]}>
            <boxGeometry args={[1.6, 0.15, 0.7]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// 1. Central Wooden Arch Footbridge (Connects Rumah Khaulah to TK Karang Tengah)
const CentralWoodenBridge: React.FC = () => {
  return (
    <group position={[0, 0.25, 18]}>
      {/* Arch Support Under-beams */}
      {[-1.9, 1.9].map((bx, idx) => (
        <mesh key={idx} position={[bx, 0.02, 0]} castShadow>
          <boxGeometry args={[0.25, 0.35, 8.4]} />
          <meshStandardMaterial color="#582F0E" roughness={0.8} />
        </mesh>
      ))}

      {/* Main Bridge Wooden Plank Deck */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.4, 0.2, 8.4]} />
        <meshStandardMaterial color="#8D5B4C" roughness={0.75} />
      </mesh>

      {/* Bridge Plank Groove Accents */}
      {[-3.6, -2.4, -1.2, 0, 1.2, 2.4, 3.6].map((pz, idx) => (
        <mesh key={idx} position={[0, 0.26, pz]}>
          <boxGeometry args={[4.35, 0.015, 0.05]} />
          <meshStandardMaterial color="#582F0E" />
        </mesh>
      ))}

      {/* Bridge Wooden Handrails (Left & Right) */}
      {[-2.1, 2.1].map((rx, idx) => (
        <group key={idx} position={[rx, 0.7, 0]}>
          {/* Top Rail */}
          <mesh castShadow>
            <boxGeometry args={[0.16, 0.14, 8.4]} />
            <meshStandardMaterial color="#6F4E37" roughness={0.7} />
          </mesh>
          {/* Baluster Posts */}
          {[-3.8, -2.5, -1.25, 0, 1.25, 2.5, 3.8].map((pz, pi) => (
            <mesh key={pi} position={[0, -0.32, pz]} castShadow>
              <cylinderGeometry args={[0.06, 0.07, 0.65, 8]} />
              <meshStandardMaterial color="#6F4E37" />
            </mesh>
          ))}
          {/* Warm Corner Lanterns on Bridge Entrance Posts */}
          {[-3.8, 3.8].map((lz, li) => (
            <group key={li} position={[0, 0.2, lz]}>
              <mesh castShadow>
                <boxGeometry args={[0.22, 0.28, 0.22]} />
                <meshStandardMaterial color="#2B2D42" />
              </mesh>
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.09, 8, 8]} />
                <meshStandardMaterial color="#FFE6A7" emissive="#FFD166" emissiveIntensity={0.8} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
};

// 2. West Country Timber Bridge (Connects Petting Farm to Lake & Beach)
const WestRusticBridge: React.FC = () => {
  return (
    <group position={[-45, 0.25, 18]}>
      {/* Bridge Wooden Plank Floor */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.8, 0.2, 8.4]} />
        <meshStandardMaterial color="#8D5B4C" roughness={0.8} />
      </mesh>
      {/* Log Handrails */}
      {[-2.3, 2.3].map((rx, idx) => (
        <group key={idx} position={[rx, 0.65, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.15, 0.12, 8.4]} />
            <meshStandardMaterial color="#582F0E" roughness={0.8} />
          </mesh>
          {[-3.6, -1.8, 0, 1.8, 3.6].map((pz, pi) => (
            <mesh key={pi} position={[0, -0.3, pz]} castShadow>
              <cylinderGeometry args={[0.07, 0.07, 0.6, 6]} />
              <meshStandardMaterial color="#582F0E" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

// 3. East Stone & Masonry Bridge (Connects Town Street to Carnival Plaza)
const EastAvenueStoneBridge: React.FC = () => {
  return (
    <group position={[45, 0.25, 18]}>
      {/* Stone Paved Deck */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.8, 0.22, 8.4]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.65} />
      </mesh>
      {/* Stone Parapet Balustrades */}
      {[-2.3, 2.3].map((rx, idx) => (
        <group key={idx} position={[rx, 0.6, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.22, 0.5, 8.4]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.6} />
          </mesh>
          {/* Post Caps */}
          {[-3.8, 3.8].map((pz, pi) => (
            <group key={pi} position={[0, 0.35, pz]}>
              <mesh castShadow>
                <boxGeometry args={[0.3, 0.15, 0.3]} />
                <meshStandardMaterial color="#64748B" />
              </mesh>
              <mesh position={[0, 0.15, 0]}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshStandardMaterial color="#FFE6A7" emissive="#FFD166" emissiveIntensity={0.6} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
};

// Interconnected Cobblestone & Paved Walkway Network
const InterconnectedWalkways: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* ------------------------------------------------------------------ */}
      {/* 1. CENTRAL NORTH-SOUTH VILLAGE AVENUE                               */}
      {/* ------------------------------------------------------------------ */}
      {/* South Path: From Rumah Khaulah Porch (Z: -6) to Central Bridge (Z: 13.8) */}
      <mesh position={[0, 0.255, 3.9]} receiveShadow>
        <boxGeometry args={[4.2, 0.02, 19.8]} />
        <meshStandardMaterial color="#D6CEBE" roughness={0.7} />
      </mesh>
      {/* North Path: From Central Bridge (Z: 22.2) through School Gate to School Door (Z: 54) */}
      <mesh position={[0, 0.255, 38.1]} receiveShadow>
        <boxGeometry args={[4.2, 0.02, 31.8]} />
        <meshStandardMaterial color="#D6CEBE" roughness={0.7} />
      </mesh>

      {/* ------------------------------------------------------------------ */}
      {/* 2. SOUTH CROSS-VILLAGE ROAD (EAST-WEST at Z: 0)                     */}
      {/* Connects Town Street (East: X: 45 to 85) past Rumah Khaulah to Farm (West: X: -45 to -85) */}
      {/* ------------------------------------------------------------------ */}
      {/* Center connector across front garden */}
      <mesh position={[0, 0.254, 0]} receiveShadow>
        <boxGeometry args={[90, 0.02, 4.2]} />
        <meshStandardMaterial color="#C9BFAD" roughness={0.75} />
      </mesh>
      {/* West connector road leading into Petting Farm entrance */}
      <mesh position={[-65, 0.254, 0]} receiveShadow>
        <boxGeometry args={[50, 0.02, 4.2]} />
        <meshStandardMaterial color="#C2B7A3" roughness={0.8} />
      </mesh>
      {/* East connector road leading into Town Street */}
      <mesh position={[65, 0.254, 0]} receiveShadow>
        <boxGeometry args={[50, 0.02, 4.2]} />
        <meshStandardMaterial color="#D0C7B8" roughness={0.75} />
      </mesh>

      {/* ------------------------------------------------------------------ */}
      {/* 3. NORTH CROSS-VILLAGE PROMENADE (EAST-WEST at Z: 25)               */}
      {/* Connects Carnival Plaza past School Gate to Beach & Lake Pier       */}
      {/* ------------------------------------------------------------------ */}
      {/* Center promenade in front of school gate */}
      <mesh position={[0, 0.254, 25]} receiveShadow>
        <boxGeometry args={[90, 0.02, 4.2]} />
        <meshStandardMaterial color="#D8D0C3" roughness={0.7} />
      </mesh>
      {/* West promenade leading to Lake Pier and Beach */}
      <mesh position={[-65, 0.254, 25]} receiveShadow>
        <boxGeometry args={[50, 0.02, 4.2]} />
        <meshStandardMaterial color="#D8D0C3" roughness={0.7} />
      </mesh>
      {/* East promenade leading into Carnival Plaza */}
      <mesh position={[65, 0.254, 25]} receiveShadow>
        <boxGeometry args={[50, 0.02, 4.2]} />
        <meshStandardMaterial color="#D8D0C3" roughness={0.7} />
      </mesh>

      {/* ------------------------------------------------------------------ */}
      {/* 4. NORTH-SOUTH WEST ROAD (Connecting Farm to Beach across Bridge)   */}
      {/* ------------------------------------------------------------------ */}
      <mesh position={[-45, 0.254, 6.5]} receiveShadow>
        <boxGeometry args={[4.2, 0.02, 37]} />
        <meshStandardMaterial color="#C9BFAD" roughness={0.75} />
      </mesh>

      {/* ------------------------------------------------------------------ */}
      {/* 5. NORTH-SOUTH EAST AVENUE (Connecting Town to Carnival across Bridge) */}
      {/* ------------------------------------------------------------------ */}
      <mesh position={[45, 0.254, 6.5]} receiveShadow>
        <boxGeometry args={[4.2, 0.02, 37]} />
        <meshStandardMaterial color="#D0C7B8" roughness={0.75} />
      </mesh>
    </group>
  );
};

export const GroundIsland: React.FC = () => {
  useEffect(() => {
    // 1. South Village Landmass (Rumah Khaulah, Backyard Pool, Farm, Town; Z: -62 to 14.5, X: -100 to 100)
    const southBox = new THREE.Box3(
      new THREE.Vector3(-100, -1, -62),
      new THREE.Vector3(100, 0.25, 14.5)
    );
    // 2. Central Arch Bridge (Z: 13.8 to 22.2, X: -3.5 to 3.5)
    const centralBridgeBox = new THREE.Box3(
      new THREE.Vector3(-3.5, -0.5, 13.8),
      new THREE.Vector3(3.5, 0.5, 22.2)
    );
    // 3. West Country Bridge (Z: 13.8 to 22.2, X: -48.5 to -41.5)
    const westBridgeBox = new THREE.Box3(
      new THREE.Vector3(-48.5, -0.5, 13.8),
      new THREE.Vector3(-41.5, 0.5, 22.2)
    );
    // 4. East Stone Bridge (Z: 13.8 to 22.2, X: 41.5 to 48.5)
    const eastBridgeBox = new THREE.Box3(
      new THREE.Vector3(41.5, -0.5, 13.8),
      new THREE.Vector3(48.5, 0.5, 22.2)
    );
    // 5. North Landmass sections carved around Sunny Beach & Lake (-81 to -49, 34 to 62)
    const northEastBox = new THREE.Box3(
      new THREE.Vector3(-49.0, -1, 21.5),
      new THREE.Vector3(100, 0.25, 76)
    );
    const northNorthBox = new THREE.Box3(
      new THREE.Vector3(-100, -1, 62.0),
      new THREE.Vector3(-49.0, 0.25, 76)
    );
    const northSouthBox = new THREE.Box3(
      new THREE.Vector3(-100, -1, 21.5),
      new THREE.Vector3(-49.0, 0.25, 34.0)
    );
    const northWestEdgeBox = new THREE.Box3(
      new THREE.Vector3(-100, -1, 34.0),
      new THREE.Vector3(-81.0, 0.25, 62.0)
    );
    // 6. Walkable Riverbed Floor (shallow water splash floor; Z: 14.5 to 21.5, X: -100 to 100)
    const riverbedBox = new THREE.Box3(
      new THREE.Vector3(-100, -1.0, 14.5),
      new THREE.Vector3(100, 0.14, 21.5)
    );

    const c1 = { box: southBox, type: 'ground' as const };
    const c2 = { box: centralBridgeBox, type: 'ground' as const };
    const c3 = { box: westBridgeBox, type: 'ground' as const };
    const c4 = { box: eastBridgeBox, type: 'ground' as const };
    const c5a = { box: northEastBox, type: 'ground' as const };
    const c5b = { box: northNorthBox, type: 'ground' as const };
    const c5c = { box: northSouthBox, type: 'ground' as const };
    const c5d = { box: northWestEdgeBox, type: 'ground' as const };
    const c6 = { box: riverbedBox, type: 'ground' as const };

    colliders.push(c1, c2, c3, c4, c5a, c5b, c5c, c5d, c6);

    return () => {
      [c1, c2, c3, c4, c5a, c5b, c5c, c5d, c6].forEach((c) => {
        const idx = colliders.indexOf(c);
        if (idx !== -1) colliders.splice(idx, 1);
      });
    };
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* ============================================================== */}
      {/* 1. UNIFIED SOUTH VILLAGE TERRAIN (Z: -62 to 14.5, X: -100 to 100) */}
      {/* Natural lush green grass covering the house, backyard & shops  */}
      {/* ============================================================== */}
      <mesh position={[0, -0.2, -23.75]} receiveShadow>
        <boxGeometry args={[200, 0.9, 76.5]} />
        <meshStandardMaterial color="#4C8C2B" roughness={0.78} />
      </mesh>
      {/* Rich Fertile Earth Base beneath South Terrain */}
      <mesh position={[0, -1.8, -23.75]}>
        <boxGeometry args={[200.5, 2.3, 77.0]} />
        <meshStandardMaterial color="#543D2B" roughness={0.95} />
      </mesh>

      {/* South Island Perimeter Stone Retaining Wall (Z: -62) */}
      <mesh position={[0, 0.15, -62]} receiveShadow>
        <boxGeometry args={[200, 0.4, 0.35]} />
        <meshStandardMaterial color="#78716C" roughness={0.8} />
      </mesh>

      {/* ============================================================== */}
      {/* 2. CONTINUOUS VILLAGE RIVER & REALISTIC BRIDGES (Z: 14.5 to 21.5)*/}
      {/* Flowing seamlessly across entire island from West to East       */}
      {/* ============================================================== */}
      <ContinuousVillageRiver />
      <CentralWoodenBridge />
      <WestRusticBridge />
      <EastAvenueStoneBridge />

      {/* ============================================================== */}
      {/* 3. UNIFIED NORTH VILLAGE TERRAIN (Z: 21.5 to 76, X: -100 to 100) */}
      {/* Matching natural lush green grass covering School, Beach & Carnival */}
      {/* ============================================================== */}
      {/* 3.1 East & Center North Terrain (School, Carnival, Promenade) */}
      <mesh position={[25.5, -0.2, 48.75]} receiveShadow>
        <boxGeometry args={[149, 0.9, 54.5]} />
        <meshStandardMaterial color="#4C8C2B" roughness={0.78} />
      </mesh>
      <mesh position={[25.5, -1.8, 48.75]}>
        <boxGeometry args={[149.5, 2.3, 55.0]} />
        <meshStandardMaterial color="#543D2B" roughness={0.95} />
      </mesh>

      {/* 3.2 North-Behind-Beach Terrain (North Perimeter) */}
      <mesh position={[-74.5, -0.2, 69]} receiveShadow>
        <boxGeometry args={[51, 0.9, 14]} />
        <meshStandardMaterial color="#4C8C2B" roughness={0.78} />
      </mesh>
      <mesh position={[-74.5, -1.8, 69]}>
        <boxGeometry args={[51.5, 2.3, 14.5]} />
        <meshStandardMaterial color="#543D2B" roughness={0.95} />
      </mesh>

      {/* 3.3 South-Of-Beach Terrain (Between River & Beach Shore) */}
      <mesh position={[-74.5, -0.2, 27.75]} receiveShadow>
        <boxGeometry args={[51, 0.9, 12.5]} />
        <meshStandardMaterial color="#4C8C2B" roughness={0.78} />
      </mesh>
      <mesh position={[-74.5, -1.8, 27.75]}>
        <boxGeometry args={[51.5, 2.3, 13.0]} />
        <meshStandardMaterial color="#543D2B" roughness={0.95} />
      </mesh>

      {/* 3.4 West Outer Island Edge Terrain (West Dunes Perimeter) */}
      <mesh position={[-90.5, -0.2, 48]} receiveShadow>
        <boxGeometry args={[19, 0.9, 28]} />
        <meshStandardMaterial color="#4C8C2B" roughness={0.78} />
      </mesh>
      <mesh position={[-90.5, -1.8, 48]}>
        <boxGeometry args={[19.5, 2.3, 28.5]} />
        <meshStandardMaterial color="#543D2B" roughness={0.95} />
      </mesh>

      {/* North Island Perimeter Stone Retaining Wall (Z: 76) */}
      <mesh position={[0, 0.15, 76]} receiveShadow>
        <boxGeometry args={[200, 0.4, 0.35]} />
        <meshStandardMaterial color="#78716C" roughness={0.8} />
      </mesh>

      {/* East & West Perimeter Stone Retaining Walls */}
      {[-100, 100].map((wx, idx) => (
        <React.Fragment key={idx}>
          <mesh position={[wx, 0.15, -23.75]} receiveShadow>
            <boxGeometry args={[0.35, 0.4, 76.5]} />
            <meshStandardMaterial color="#78716C" roughness={0.8} />
          </mesh>
          <mesh position={[wx, 0.15, 48.75]} receiveShadow>
            <boxGeometry args={[0.35, 0.4, 54.5]} />
            <meshStandardMaterial color="#78716C" roughness={0.8} />
          </mesh>
        </React.Fragment>
      ))}

      {/* ============================================================== */}
      {/* 4. INTERCONNECTED ROAD & WALKWAY NETWORK                       */}
      {/* Seamless paths connecting home, school, farm, beach, town & park*/}
      {/* ============================================================== */}
      <InterconnectedWalkways />

      {/* ============================================================== */}
      {/* 5. REALISTIC NATURAL TREES SWAYING IN THE WIND                  */}
      {/* Natural lush foliage green tones and authentic wooden trunks   */}
      {/* ============================================================== */}
      {[
        // Around Rumah Khaulah Garden & South Avenue
        { pos: [-12, 0.25, -6], leafColor: '#2D6A4F', scale: 1.25, seed: 0 },
        { pos: [12, 0.25, -6], leafColor: '#386641', scale: 1.3, seed: 1.5 },
        { pos: [-14, 0.25, 4], leafColor: '#40916C', scale: 1.15, seed: 2.3 },
        { pos: [14, 0.25, 4], leafColor: '#2D6A4F', scale: 1.1, seed: 3.8 },
        { pos: [-8, 0.25, 9], leafColor: '#52B788', scale: 1.2, seed: 4.5 },
        { pos: [8, 0.25, 9], leafColor: '#52B788', scale: 1.2, seed: 5.0 },

        // Riverbank Trees (Shading the beautiful blue river)
        { pos: [-28, 0.25, 13.0], leafColor: '#52B788', scale: 1.25, seed: 4.1 },
        { pos: [28, 0.25, 13.0], leafColor: '#52B788', scale: 1.25, seed: 5.2 },
        { pos: [-62, 0.25, 13.0], leafColor: '#386641', scale: 1.2, seed: 5.7 },
        { pos: [62, 0.25, 13.0], leafColor: '#386641', scale: 1.2, seed: 6.0 },
        { pos: [-28, 0.25, 23.0], leafColor: '#386641', scale: 1.2, seed: 6.2 },
        { pos: [28, 0.25, 23.0], leafColor: '#386641', scale: 1.2, seed: 6.8 },

        // Near TK Karang Tengah Schoolyard & Promenade
        { pos: [-16, 0.25, 30], leafColor: '#2D6A4F', scale: 1.25, seed: 6.3 },
        { pos: [16, 0.25, 30], leafColor: '#40916C', scale: 1.2, seed: 7.1 },
        { pos: [-16, 0.25, 50], leafColor: '#386641', scale: 1.3, seed: 8.4 },
        { pos: [16, 0.25, 50], leafColor: '#386641', scale: 1.3, seed: 9.0 },

        // Farm & West Meadows
        { pos: [-32, 0.25, -6], leafColor: '#2D6A4F', scale: 1.3, seed: 9.5 },
        { pos: [-32, 0.25, 6], leafColor: '#40916C', scale: 1.25, seed: 9.8 },
        { pos: [-90, 0.25, -10], leafColor: '#2D6A4F', scale: 1.35, seed: 10.2 },
        { pos: [-90, 0.25, 45], leafColor: '#40916C', scale: 1.3, seed: 11.1 },

        // Town & East Meadows
        { pos: [32, 0.25, -6], leafColor: '#386641', scale: 1.25, seed: 11.8 },
        { pos: [32, 0.25, 6], leafColor: '#2D6A4F', scale: 1.2, seed: 12.1 },
        { pos: [90, 0.25, -10], leafColor: '#386641', scale: 1.3, seed: 12.3 },
        { pos: [90, 0.25, 45], leafColor: '#2D6A4F', scale: 1.35, seed: 13.5 },

        // Backyard Waterpark Groves
        { pos: [-24, 0.25, -28], leafColor: '#2D6A4F', scale: 1.3, seed: 14.1 },
        { pos: [24, 0.25, -28], leafColor: '#386641', scale: 1.3, seed: 14.6 },
        { pos: [-24, 0.25, -52], leafColor: '#40916C', scale: 1.35, seed: 15.2 },
        { pos: [24, 0.25, -52], leafColor: '#2D6A4F', scale: 1.35, seed: 15.8 },
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
      {/* 6. BEAUTIFUL NATURAL FLOWERS (Along lawns & paths)             */}
      {/* ============================================================== */}
      {[
        // Home Yard Flowers
        { x: -6, z: -2, c: '#FF4D6D', seed: 0.2 },
        { x: 6, z: -2, c: '#FFB703', seed: 1.1 },
        { x: -5, z: 5, c: '#9B5DE5', seed: 2.5 },
        { x: 5, z: 6, c: '#FF758F', seed: 3.4 },
        // Riverbank Wildflowers
        { x: -10, z: 13.2, c: '#FFFFFF', seed: 3.8 },
        { x: 10, z: 13.2, c: '#FFD166', seed: 4.0 },
        { x: -10, z: 22.8, c: '#FF4D6D', seed: 4.4 },
        { x: 10, z: 22.8, c: '#FFFFFF', seed: 4.7 },
        { x: -30, z: 13.2, c: '#FF758F', seed: 4.9 },
        { x: 30, z: 13.2, c: '#9B5DE5', seed: 5.1 },
        // Schoolyard Flowers
        { x: -7, z: 27, c: '#FF758F', seed: 5.2 },
        { x: 7, z: 27, c: '#FFD166', seed: 5.8 },
        { x: -6, z: 45, c: '#FFFFFF', seed: 6.3 },
        { x: 6, z: 45, c: '#FF4D6D', seed: 7.4 },
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
      {/* 7. RAINBOW SKYWAY PORTAL ARCHWAY (Behind School, Z: 68)        */}
      {/* Kid-friendly portal to fantasy obby jumping platforms          */}
      {/* ============================================================== */}
      <group position={[0, 0.25, 68]}>
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
