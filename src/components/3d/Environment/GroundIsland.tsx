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
    groupRef.current.rotation.z = Math.sin(t * 1.3 + seed) * 0.035;
    groupRef.current.rotation.x = Math.cos(t * 1.1 + seed) * 0.025;
  });

  return (
    <group ref={groupRef} position={pos} scale={scale}>
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
      {/* Natural Foliage Canopy Tier 1 */}
      <mesh position={[0, 2.6, 0]} castShadow>
        <sphereGeometry args={[1.4, 14, 14]} />
        <meshStandardMaterial color={leafColor} roughness={0.65} />
      </mesh>
      {/* Natural Foliage Canopy Tier 2 */}
      <mesh position={[0, 3.55, 0]} castShadow>
        <sphereGeometry args={[1.0, 12, 12]} />
        <meshStandardMaterial color={leafColor} roughness={0.65} />
      </mesh>
      {/* Top Foliage Puff */}
      <mesh position={[0.2, 4.15, -0.1]} castShadow>
        <sphereGeometry args={[0.65, 10, 10]} />
        <meshStandardMaterial color={leafColor} roughness={0.65} />
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
    <group ref={flowerRef} position={[x, 0.26, z]}>
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

// Continuous Village River flowing across the entire island (X: -55 to +55, Z: 8.5 to 13.5)
const ContinuousVillageRiver: React.FC = () => {
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!waterRef.current) return;
    const t = state.clock.getElapsedTime();
    waterRef.current.position.y = 0.065 + Math.sin(t * 1.8) * 0.012;
  });

  // Generate riverbank stone clusters along the continuous river
  const riverPebbleXs = [-46, -38, -30, -17, -10, -4, 4, 10, 16, 29, 37, 45];
  const lilyPadData = [
    { x: -35, z: -0.6 },
    { x: -28, z: 0.8 },
    { x: -14, z: -0.5 },
    { x: -7, z: 0.7 },
    { x: 7, z: -0.8 },
    { x: 14, z: 0.5 },
    { x: 30, z: -0.4 },
    { x: 40, z: 0.6 },
  ];

  return (
    <group position={[0, 0, 11]}>
      {/* River Bed Trench running across entire island (Width: 110, Depth: 5.0) */}
      <mesh position={[0, -0.22, 0]}>
        <boxGeometry args={[110, 0.6, 5.0]} />
        <meshStandardMaterial color="#4A3F35" roughness={0.95} />
      </mesh>

      {/* Realistic Glistening Blue River Water Surface */}
      <mesh ref={waterRef} position={[0, 0.065, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[110, 4.7]} />
        <meshStandardMaterial
          color="#0096C7"
          roughness={0.08}
          transparent
          opacity={0.86}
          metalness={0.16}
        />
      </mesh>

      {/* South Riverbank Smooth Stone Curb (Z: -2.45) */}
      <mesh position={[0, 0.15, -2.45]} receiveShadow>
        <boxGeometry args={[110, 0.3, 0.4]} />
        <meshStandardMaterial color="#8D877B" roughness={0.8} />
      </mesh>

      {/* North Riverbank Smooth Stone Curb (Z: +2.45) */}
      <mesh position={[0, 0.15, 2.45]} receiveShadow>
        <boxGeometry args={[110, 0.3, 0.4]} />
        <meshStandardMaterial color="#8D877B" roughness={0.8} />
      </mesh>

      {/* Riverbank Pebbles and River Stones */}
      {riverPebbleXs.map((px, idx) => (
        <React.Fragment key={idx}>
          {/* South Bank Stones */}
          <mesh position={[px, 0.16, -2.2]} scale={[0.45, 0.22, 0.35]}>
            <sphereGeometry args={[0.7, 8, 8]} />
            <meshStandardMaterial color="#A8A29E" roughness={0.85} />
          </mesh>
          {/* North Bank Stones */}
          <mesh position={[px + 2.5, 0.16, 2.2]} scale={[0.45, 0.22, 0.35]}>
            <sphereGeometry args={[0.7, 8, 8]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.85} />
          </mesh>
        </React.Fragment>
      ))}

      {/* Floating Water Lily Pads with Delicate White/Pink Blossoms */}
      {lilyPadData.map((pad, idx) => (
        <group key={idx} position={[pad.x, 0.08, pad.z]} rotation={[-Math.PI / 2, 0, idx * 0.7]}>
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
        <group key={i} position={[side * 3.4, 0.05, 0]}>
          <mesh position={[0, 0.05, -2.1]}>
            <boxGeometry args={[1.6, 0.15, 0.7]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.05, 2.1]}>
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
    <group position={[0, 0.25, 11]}>
      {/* Arch Support Under-beams */}
      {[-1.75, 1.75].map((bx, idx) => (
        <mesh key={idx} position={[bx, 0.02, 0]} castShadow>
          <boxGeometry args={[0.25, 0.35, 6.0]} />
          <meshStandardMaterial color="#582F0E" roughness={0.8} />
        </mesh>
      ))}

      {/* Main Bridge Wooden Plank Deck */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 0.2, 5.8]} />
        <meshStandardMaterial color="#8D5B4C" roughness={0.75} />
      </mesh>

      {/* Bridge Plank Groove Accents */}
      {[-2.2, -1.1, 0, 1.1, 2.2].map((pz, idx) => (
        <mesh key={idx} position={[0, 0.26, pz]}>
          <boxGeometry args={[3.75, 0.015, 0.05]} />
          <meshStandardMaterial color="#582F0E" />
        </mesh>
      ))}

      {/* Bridge Wooden Handrails (Left & Right) */}
      {[-1.85, 1.85].map((rx, idx) => (
        <group key={idx} position={[rx, 0.7, 0]}>
          {/* Top Rail */}
          <mesh castShadow>
            <boxGeometry args={[0.16, 0.14, 5.8]} />
            <meshStandardMaterial color="#6F4E37" roughness={0.7} />
          </mesh>
          {/* Baluster Posts */}
          {[-2.5, -1.25, 0, 1.25, 2.5].map((pz, pi) => (
            <mesh key={pi} position={[0, -0.32, pz]} castShadow>
              <cylinderGeometry args={[0.06, 0.07, 0.65, 8]} />
              <meshStandardMaterial color="#6F4E37" />
            </mesh>
          ))}
          {/* Warm Corner Lanterns on Bridge Entrance Posts */}
          {[-2.5, 2.5].map((lz, li) => (
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
    <group position={[-23, 0.25, 11]}>
      {/* Bridge Wooden Plank Floor */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.4, 0.2, 5.8]} />
        <meshStandardMaterial color="#8D5B4C" roughness={0.8} />
      </mesh>
      {/* Log Handrails */}
      {[-2.1, 2.1].map((rx, idx) => (
        <group key={idx} position={[rx, 0.65, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.15, 0.12, 5.8]} />
            <meshStandardMaterial color="#582F0E" roughness={0.8} />
          </mesh>
          {[-2.3, -0.8, 0.8, 2.3].map((pz, pi) => (
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
    <group position={[23, 0.25, 11]}>
      {/* Stone Paved Deck */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.4, 0.22, 5.8]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.65} />
      </mesh>
      {/* Stone Parapet Balustrades */}
      {[-2.1, 2.1].map((rx, idx) => (
        <group key={idx} position={[rx, 0.6, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.22, 0.5, 5.8]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.6} />
          </mesh>
          {/* Post Caps */}
          {[-2.7, 2.7].map((pz, pi) => (
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
      {/* South Path: From Rumah Khaulah Porch (Z: -6) to Central Bridge (Z: 8.5) */}
      <mesh position={[0, 0.255, 1.25]} receiveShadow>
        <boxGeometry args={[3.4, 0.02, 14.5]} />
        <meshStandardMaterial color="#D6CEBE" roughness={0.7} />
      </mesh>
      {/* North Path: From Central Bridge (Z: 13.5) through School Gate to School Door (Z: 36) */}
      <mesh position={[0, 0.255, 24.75]} receiveShadow>
        <boxGeometry args={[3.4, 0.02, 22.5]} />
        <meshStandardMaterial color="#D6CEBE" roughness={0.7} />
      </mesh>

      {/* ------------------------------------------------------------------ */}
      {/* 2. SOUTH CROSS-VILLAGE ROAD (EAST-WEST at Z: 1.5)                  */}
      {/* Connects Town Street (East: X: 15 to 48) past Rumah Khaulah to Farm (West: X: -15 to -48) */}
      {/* ------------------------------------------------------------------ */}
      {/* Center connector across front garden */}
      <mesh position={[0, 0.254, 1.5]} receiveShadow>
        <boxGeometry args={[32, 0.02, 3.4]} />
        <meshStandardMaterial color="#C9BFAD" roughness={0.75} />
      </mesh>
      {/* West connector road leading into Petting Farm entrance */}
      <mesh position={[-32, 0.254, 1.5]} receiveShadow>
        <boxGeometry args={[32, 0.02, 3.4]} />
        <meshStandardMaterial color="#C2B7A3" roughness={0.8} />
      </mesh>
      {/* East connector road leading into Town Street */}
      <mesh position={[32, 0.254, 1.5]} receiveShadow>
        <boxGeometry args={[32, 0.02, 3.4]} />
        <meshStandardMaterial color="#D0C7B8" roughness={0.75} />
      </mesh>

      {/* ------------------------------------------------------------------ */}
      {/* 3. NORTH CROSS-VILLAGE PROMENADE (EAST-WEST at Z: 17.5)            */}
      {/* Connects Carnival Plaza past School Gate to Beach & Lake Pier       */}
      {/* ------------------------------------------------------------------ */}
      {/* Center promenade in front of school gate */}
      <mesh position={[0, 0.254, 17.5]} receiveShadow>
        <boxGeometry args={[32, 0.02, 3.2]} />
        <meshStandardMaterial color="#D8D0C3" roughness={0.7} />
      </mesh>
      {/* West promenade leading to Lake Pier and Beach */}
      <mesh position={[-32, 0.254, 17.5]} receiveShadow>
        <boxGeometry args={[32, 0.02, 3.2]} />
        <meshStandardMaterial color="#D8D0C3" roughness={0.7} />
      </mesh>
      {/* East promenade leading into Carnival Plaza */}
      <mesh position={[32, 0.254, 17.5]} receiveShadow>
        <boxGeometry args={[32, 0.02, 3.2]} />
        <meshStandardMaterial color="#D8D0C3" roughness={0.7} />
      </mesh>
    </group>
  );
};

export const GroundIsland: React.FC = () => {
  useEffect(() => {
    // 1. South Village Landmass (Rumah Khaulah, Backyard Pool, Farm, Town; Z: -36 to 8.5, X: -55 to 55)
    const southBox = new THREE.Box3(
      new THREE.Vector3(-55, -1, -36),
      new THREE.Vector3(55, 0.25, 8.5)
    );
    // 2. Central Arch Bridge (Z: 8.5 to 13.5, X: -3.0 to 3.0)
    const centralBridgeBox = new THREE.Box3(
      new THREE.Vector3(-3.0, -0.5, 8.5),
      new THREE.Vector3(3.0, 0.5, 13.5)
    );
    // 3. West Country Bridge (Z: 8.5 to 13.5, X: -26.0 to -20.0)
    const westBridgeBox = new THREE.Box3(
      new THREE.Vector3(-26.0, -0.5, 8.5),
      new THREE.Vector3(-20.0, 0.5, 13.5)
    );
    // 4. East Stone Bridge (Z: 8.5 to 13.5, X: 20.0 to 26.0)
    const eastBridgeBox = new THREE.Box3(
      new THREE.Vector3(20.0, -0.5, 8.5),
      new THREE.Vector3(26.0, 0.5, 13.5)
    );
    // 5. North Village Landmass (School, Beach/Lake, Carnival; Z: 13.5 to 48, X: -55 to 55)
    const northBox = new THREE.Box3(
      new THREE.Vector3(-55, -1, 13.5),
      new THREE.Vector3(55, 0.25, 48)
    );
    // 6. Walkable Riverbed Floor (shallow water splash floor; Z: 8.5 to 13.5, X: -55 to 55)
    const riverbedBox = new THREE.Box3(
      new THREE.Vector3(-55, -1.0, 8.5),
      new THREE.Vector3(55, -0.05, 13.5)
    );

    const c1 = { box: southBox, type: 'ground' as const };
    const c2 = { box: centralBridgeBox, type: 'ground' as const };
    const c3 = { box: westBridgeBox, type: 'ground' as const };
    const c4 = { box: eastBridgeBox, type: 'ground' as const };
    const c5 = { box: northBox, type: 'ground' as const };
    const c6 = { box: riverbedBox, type: 'ground' as const };

    colliders.push(c1, c2, c3, c4, c5, c6);

    return () => {
      [c1, c2, c3, c4, c5, c6].forEach((c) => {
        const idx = colliders.indexOf(c);
        if (idx !== -1) colliders.splice(idx, 1);
      });
    };
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* ============================================================== */}
      {/* 1. UNIFIED SOUTH VILLAGE TERRAIN (Z: -36 to 8.5, X: -55 to 55) */}
      {/* Natural lush green grass covering the house, backyard & shops  */}
      {/* ============================================================== */}
      <mesh position={[0, -0.2, -13.75]} receiveShadow>
        <boxGeometry args={[110, 0.9, 44.5]} />
        <meshStandardMaterial color="#4C8C2B" roughness={0.78} />
      </mesh>
      {/* Rich Fertile Earth Base beneath South Terrain */}
      <mesh position={[0, -1.8, -13.75]}>
        <boxGeometry args={[110.5, 2.3, 45.0]} />
        <meshStandardMaterial color="#543D2B" roughness={0.95} />
      </mesh>

      {/* South Island Perimeter Stone Retaining Wall (Z: -36) */}
      <mesh position={[0, 0.15, -36]} receiveShadow>
        <boxGeometry args={[110, 0.4, 0.35]} />
        <meshStandardMaterial color="#78716C" roughness={0.8} />
      </mesh>

      {/* ============================================================== */}
      {/* 2. CONTINUOUS VILLAGE RIVER & REALISTIC BRIDGES (Z: 8.5 to 13.5)*/}
      {/* Flowing seamlessly across entire island from West to East       */}
      {/* ============================================================== */}
      <ContinuousVillageRiver />
      <CentralWoodenBridge />
      <WestRusticBridge />
      <EastAvenueStoneBridge />

      {/* ============================================================== */}
      {/* 3. UNIFIED NORTH VILLAGE TERRAIN (Z: 13.5 to 48, X: -55 to 55) */}
      {/* Matching natural lush green grass covering the northern zone    */}
      {/* ============================================================== */}
      <mesh position={[0, -0.2, 30.75]} receiveShadow>
        <boxGeometry args={[110, 0.9, 34.5]} />
        <meshStandardMaterial color="#4C8C2B" roughness={0.78} />
      </mesh>
      {/* Rich Fertile Earth Base beneath North Terrain */}
      <mesh position={[0, -1.8, 30.75]}>
        <boxGeometry args={[110.5, 2.3, 35.0]} />
        <meshStandardMaterial color="#543D2B" roughness={0.95} />
      </mesh>

      {/* North Island Perimeter Stone Retaining Wall (Z: 48) */}
      <mesh position={[0, 0.15, 48]} receiveShadow>
        <boxGeometry args={[110, 0.4, 0.35]} />
        <meshStandardMaterial color="#78716C" roughness={0.8} />
      </mesh>

      {/* East & West Perimeter Stone Retaining Walls */}
      {[-55, 55].map((wx, idx) => (
        <React.Fragment key={idx}>
          <mesh position={[wx, 0.15, -13.75]} receiveShadow>
            <boxGeometry args={[0.35, 0.4, 44.5]} />
            <meshStandardMaterial color="#78716C" roughness={0.8} />
          </mesh>
          <mesh position={[wx, 0.15, 30.75]} receiveShadow>
            <boxGeometry args={[0.35, 0.4, 34.5]} />
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
        { pos: [-10, 0.25, -6], leafColor: '#2D6A4F', scale: 1.25, seed: 0 },
        { pos: [10, 0.25, -6], leafColor: '#386641', scale: 1.3, seed: 1.5 },
        { pos: [-11, 0.25, 3], leafColor: '#40916C', scale: 1.15, seed: 2.3 },
        { pos: [11, 0.25, 4], leafColor: '#2D6A4F', scale: 1.1, seed: 3.8 },

        // Riverbank Trees (Shading the beautiful blue river)
        { pos: [-15, 0.25, 7.5], leafColor: '#52B788', scale: 1.25, seed: 4.1 },
        { pos: [15, 0.25, 7.5], leafColor: '#52B788', scale: 1.25, seed: 5.2 },
        { pos: [-15, 0.25, 14.5], leafColor: '#386641', scale: 1.2, seed: 5.7 },
        { pos: [15, 0.25, 14.5], leafColor: '#386641', scale: 1.2, seed: 6.0 },

        // Near TK Karang Tengah Schoolyard & Promenade
        { pos: [-12, 0.25, 22], leafColor: '#2D6A4F', scale: 1.2, seed: 6.3 },
        { pos: [12, 0.25, 22], leafColor: '#40916C', scale: 1.15, seed: 7.1 },
        { pos: [-12, 0.25, 38], leafColor: '#386641', scale: 1.3, seed: 8.4 },
        { pos: [12, 0.25, 38], leafColor: '#386641', scale: 1.3, seed: 9.0 },

        // West Boundary (Farm & Beach Buffer)
        { pos: [-49, 0.25, 6], leafColor: '#2D6A4F', scale: 1.2, seed: 10.2 },
        { pos: [-49, 0.25, 24], leafColor: '#40916C', scale: 1.25, seed: 11.1 },

        // East Boundary (Town & Carnival Buffer)
        { pos: [49, 0.25, 6], leafColor: '#386641', scale: 1.2, seed: 12.3 },
        { pos: [49, 0.25, 24], leafColor: '#2D6A4F', scale: 1.25, seed: 13.5 },
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
        { x: -5, z: -2, c: '#FF4D6D', seed: 0.2 },
        { x: 5, z: -2, c: '#FFB703', seed: 1.1 },
        { x: -4, z: 4, c: '#9B5DE5', seed: 2.5 },
        { x: 4, z: 5, c: '#FF758F', seed: 3.4 },
        // Riverbank Wildflowers
        { x: -8, z: 8.2, c: '#FFFFFF', seed: 3.8 },
        { x: 8, z: 8.2, c: '#FFD166', seed: 4.0 },
        { x: -8, z: 13.8, c: '#FF4D6D', seed: 4.4 },
        { x: 8, z: 13.8, c: '#FFFFFF', seed: 4.7 },
        // Schoolyard Flowers
        { x: -6, z: 20, c: '#FF758F', seed: 5.2 },
        { x: 6, z: 20, c: '#FFD166', seed: 5.8 },
        { x: -5, z: 35, c: '#FFFFFF', seed: 6.3 },
        { x: 5, z: 35, c: '#FF4D6D', seed: 7.4 },
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
      {/* 7. RAINBOW SKYWAY PORTAL ARCHWAY (Behind School, Z: 48)        */}
      {/* Kid-friendly portal to fantasy obby jumping platforms          */}
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
