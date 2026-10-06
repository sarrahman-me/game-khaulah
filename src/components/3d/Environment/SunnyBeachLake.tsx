import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, gameStore } from '../../../state/useGameStore';
import { colliders, addSolidBox, addSolidCylinder, removeSolidCollider, SolidCollider } from '../../../state/colliders';

// Animated Sparkling Lake Water Surface
const ShimmeringLake: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const rippleRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const waterY = 0.18 + Math.sin(t * 1.8) * 0.008;
    if (meshRef.current) {
      meshRef.current.position.y = waterY;
    }
    if (rippleRef.current) {
      // Sync ripples slightly above water surface so they NEVER clip through
      rippleRef.current.position.y = waterY + 0.004;
      rippleRef.current.children.forEach((child, i) => {
        const ring = child as THREE.Mesh;
        const s = 1 + ((t * 0.8 + i * 0.3) % 1) * 0.6;
        ring.scale.set(s, s, 1);
        const mat = ring.material as THREE.MeshBasicMaterial;
        if (mat) mat.opacity = 0.45 * (1 - ((t * 0.8 + i * 0.3) % 1));
      });
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Sandy Lake Bed Cavity (Recessed below water) */}
      <mesh position={[0, -0.28, 0]}>
        <boxGeometry args={[22.5, 0.45, 18.5]} />
        <meshStandardMaterial color="#E9D8A6" roughness={0.9} />
      </mesh>

      {/* Crystal Clear Radiant Blue Lake Water Surface */}
      <mesh ref={meshRef} position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[22.2, 18.2]} />
        <meshStandardMaterial
          color="#0096C7"
          emissive="#0077B6"
          emissiveIntensity={0.28}
          roughness={0.06}
          metalness={0.0}
          transparent
          opacity={0.88}
          depthWrite={false}
        />
      </mesh>

      {/* Animated Subtle Shimmer Ripples (Synchronized height) */}
      <group ref={rippleRef} position={[0, 0.184, 0]}>
        {[
          [-4, -3],
          [3, 4],
          [-2, 5],
          [5, -2],
        ].map(([rx, rz], idx) => (
          <mesh key={idx} position={[rx, 0, rz]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.5, 0.7, 16]} />
            <meshBasicMaterial color="#E0FBFC" transparent opacity={0.35} depthWrite={false} />
          </mesh>
        ))}
      </group>

      {/* Water Lily Pads with delicate lotus flowers */}
      {[
        [-6, 4],
        [5, 5],
        [-4, -5],
        [6, -4],
        [-1, 2],
        [2, -3],
      ].map(([lx, lz], idx) => (
        <group key={idx} position={[lx, 0.20, lz]} rotation={[-Math.PI / 2, 0, idx * 1.1]}>
          <circleGeometry args={[0.42, 12]} />
          <meshStandardMaterial color="#2D6A4F" roughness={0.4} />
          {/* Lotus Flower */}
          <mesh position={[0.08, 0.08, 0.04]}>
            <sphereGeometry args={[0.11, 8, 8]} />
            <meshStandardMaterial color={idx % 2 === 0 ? '#FFCCD5' : '#FFF'} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Tropical Coconut Palm Tree Model
const TropicalPalmTree: React.FC<{ pos: [number, number, number]; scale?: number; rotationY?: number }> = ({
  pos,
  scale = 1.0,
  rotationY = 0,
}) => {
  return (
    <group position={pos} scale={scale} rotation={[0, rotationY, 0]}>
      {/* Curved Palm Trunk */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.8, 0]} rotation={[0.08, 0, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.32, 1.6, 8]} />
          <meshStandardMaterial color="#7F4F24" roughness={0.85} />
        </mesh>
        <mesh position={[0.1, 2.3, 0]} rotation={[0.16, 0, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.22, 1.5, 8]} />
          <meshStandardMaterial color="#8C532B" roughness={0.85} />
        </mesh>
        <mesh position={[0.26, 3.7, 0]} rotation={[0.22, 0, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.18, 1.4, 8]} />
          <meshStandardMaterial color="#9C5D33" roughness={0.85} />
        </mesh>
      </group>

      {/* Coconuts Cluster */}
      {[-0.12, 0.12, 0].map((cx, idx) => (
        <mesh key={idx} position={[0.35 + cx, 4.3, idx * 0.12 - 0.06]} castShadow>
          <sphereGeometry args={[0.16, 8, 8]} />
          <meshStandardMaterial color="#582F0E" roughness={0.8} />
        </mesh>
      ))}

      {/* Tropical Arching Palm Fronds */}
      {[0, 1, 2, 3, 4, 5].map((idx) => {
        const ang = (idx * Math.PI * 2) / 6;
        return (
          <group
            key={idx}
            position={[0.35, 4.5, 0]}
            rotation={[0.4 * Math.sin(ang), ang, 0.4 * Math.cos(ang)]}
          >
            <mesh position={[0, 0.2, 1.3]} rotation={[0.3, 0, 0]} castShadow>
              <boxGeometry args={[0.5, 0.04, 2.6]} />
              <meshStandardMaterial color={idx % 2 === 0 ? '#2D6A4F' : '#40916C'} roughness={0.6} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// Swan / Duck Pedal Boat Model
export const SwanBoatModel: React.FC<{ isRiding?: boolean }> = ({ isRiding }) => {
  return (
    <group>
      {/* Boat Hull */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[1.5, 0.5, 2.2]} />
        <meshStandardMaterial color="#FFF" roughness={0.4} />
      </mesh>
      {/* Boat Rim (Yellow/Pink Trim) */}
      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[1.6, 0.12, 2.3]} />
        <meshStandardMaterial color="#FFB703" />
      </mesh>
      {/* Swan Neck & Head */}
      <mesh position={[0, 0.95, -0.85]} rotation={[-0.2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 1.1, 10]} />
        <meshStandardMaterial color="#FFF" />
      </mesh>
      <mesh position={[0, 1.5, -0.95]} castShadow>
        <sphereGeometry args={[0.26, 10, 10]} />
        <meshStandardMaterial color="#FFF" />
      </mesh>
      {/* Orange Beak */}
      <mesh position={[0, 1.45, -1.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.12, 0.35, 8]} />
        <meshStandardMaterial color="#FB8500" />
      </mesh>
      {/* Cute Eyes */}
      <mesh position={[0.16, 1.55, -0.98]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[-0.16, 1.55, -0.98]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Passenger Seat */}
      <mesh position={[0, 0.45, 0.2]}>
        <boxGeometry args={[1.1, 0.3, 0.8]} />
        <meshStandardMaterial color="#FF69B4" />
      </mesh>
      {/* Steering Wheel */}
      <mesh position={[0, 0.7, -0.3]} rotation={[0.4, 0, 0]}>
        <torusGeometry args={[0.2, 0.04, 8, 16]} />
        <meshStandardMaterial color="#FFD166" />
      </mesh>
    </group>
  );
};

export const SunnyBeachLake: React.FC = () => {
  const activeRide = useGameStore((s) => s.activeRide);
  const boatBobRef = useRef<THREE.Group>(null);

  useEffect(() => {
    // Accurate Colliders for the Beach & Lake area (World coords around [-65, 0, 48])
    // 1. South Beach Shore (Z: 34 to 39, X: -81 to -49)
    const southBeachBox = new THREE.Box3(
      new THREE.Vector3(-81.0, -1, 34.0),
      new THREE.Vector3(-49.0, 0.25, 39.0)
    );
    // 2. North Beach Shore (Z: 57 to 62, X: -81 to -49)
    const northBeachBox = new THREE.Box3(
      new THREE.Vector3(-81.0, -1, 57.0),
      new THREE.Vector3(-49.0, 0.25, 62.0)
    );
    // 3. West Beach Dunes (Z: 39 to 57, X: -81 to -76)
    const westBeachBox = new THREE.Box3(
      new THREE.Vector3(-81.0, -1, 39.0),
      new THREE.Vector3(-76.0, 0.25, 57.0)
    );
    // 4. East Shore (connecting to school lawn & promenade; Z: 39 to 57, X: -54 to -49)
    const eastShoreBox = new THREE.Box3(
      new THREE.Vector3(-54.0, -1, 39.0),
      new THREE.Vector3(-49.0, 0.25, 57.0)
    );
    // 5. Wooden Pier Platform (Walkable dock deck; Z: 42.7 to 45.3, X: -61 to -53, Top Y: 0.36)
    const pierBox = new THREE.Box3(
      new THREE.Vector3(-61.0, 0, 42.7),
      new THREE.Vector3(-53.0, 0.36, 45.3)
    );
    // 6. Lakebed Floor (shallow wading water splash floor; Z: 39 to 57, X: -76 to -54, Y: 0.16)
    const lakeFloorBox = new THREE.Box3(
      new THREE.Vector3(-76.0, -1, 39.0),
      new THREE.Vector3(-54.0, 0.16, 57.0)
    );

    const beachColliders = [
      { box: southBeachBox, type: 'ground' as const },
      { box: northBeachBox, type: 'ground' as const },
      { box: westBeachBox, type: 'ground' as const },
      { box: eastShoreBox, type: 'ground' as const },
      { box: pierBox, type: 'ground' as const },
      { box: lakeFloorBox, type: 'ground' as const },
    ];
    colliders.push(...beachColliders);

    // Solid obstacles (Sandcastle walls, umbrella poles)
    const solids: SolidCollider[] = [
      addSolidBox([-79.4, 0, 48.2], [-75.6, 2.0, 51.8], 'beach_sandcastle'),
      addSolidCylinder(-70, 36.5, 0.2, 0, 2.2, 'beach_umbrella_south'),
      addSolidCylinder(-68, 59.5, 0.2, 0, 2.2, 'beach_umbrella_north'),
    ];

    return () => {
      beachColliders.forEach((c) => {
        const idx = colliders.indexOf(c);
        if (idx !== -1) colliders.splice(idx, 1);
      });
      solids.forEach((s) => removeSolidCollider(s));
    };
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Gentle bobbing when parked in the glistening blue lake water
    if (boatBobRef.current && activeRide !== 'boat') {
      boatBobRef.current.position.y = 0.16 + Math.sin(t * 2.2) * 0.04;
      boatBobRef.current.rotation.z = Math.sin(t * 1.5) * 0.03;
    }

    const playerPos = gameStore.getState().playerPos;
    // Boat Pier Proximity Check (Dock is at [-57, 44])
    const distBoat = Math.hypot(playerPos[0] - (-57), playerPos[2] - 44);

    if (distBoat < 4.8 && activeRide === 'none') {
      gameStore.setNearbyInteractable({
        id: 'swan_boat',
        title: 'Perahu Bebek Kayuh 🦢⛵',
        prompt: 'Tekan [E] untuk Naik Perahu Bebek! 🌊✨',
      });
    } else {
      const cur = gameStore.getState().nearbyInteractable;
      if (cur?.id === 'swan_boat') {
        gameStore.setNearbyInteractable(null);
      }
    }
  });

  return (
    <group position={[-65, 0, 48]}>
      {/* ============================================================== */}
      {/* 1. CRYSTAL CLEAR SHIMMERING LAKE WATER & LAKE BED              */}
      {/* ============================================================== */}
      <ShimmeringLake />

      {/* ============================================================== */}
      {/* 2. GOLDEN SAND BEACH SURROUNDING THE LAKE (PANTAI PASIR)       */}
      {/* ============================================================== */}
      {/* North Beach */}
      <mesh position={[0, 0.12, 11.5]} receiveShadow>
        <boxGeometry args={[28, 0.26, 5]} />
        <meshStandardMaterial color="#E9D8A6" roughness={0.9} />
      </mesh>
      {/* South Beach */}
      <mesh position={[0, 0.12, -11.5]} receiveShadow>
        <boxGeometry args={[28, 0.26, 5]} />
        <meshStandardMaterial color="#E9D8A6" roughness={0.9} />
      </mesh>
      {/* West Beach Dunes */}
      <mesh position={[-13.5, 0.12, 0]} receiveShadow>
        <boxGeometry args={[5, 0.26, 28]} />
        <meshStandardMaterial color="#E9D8A6" roughness={0.9} />
      </mesh>
      {/* East Shore (Transitioning towards schoolyard) */}
      <mesh position={[13.5, 0.12, 0]} receiveShadow>
        <boxGeometry args={[5, 0.26, 28]} />
        <meshStandardMaterial color="#E9D8A6" roughness={0.9} />
      </mesh>

      {/* Shoreline Smooth River Pebbles */}
      {[
        [-10, -9],
        [-5, -9.2],
        [4, -9],
        [-11, 2],
        [-11, -3],
        [11, 3],
        [11, -2],
        [-8, 9.2],
        [3, 9],
      ].map(([px, pz], idx) => (
        <mesh key={idx} position={[px, 0.24, pz]} scale={[0.4, 0.2, 0.35]}>
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshStandardMaterial color="#C2B8A3" roughness={0.8} />
        </mesh>
      ))}

      {/* ============================================================== */}
      {/* 3. TROPICAL COCONUT PALM TREES                                 */}
      {/* ============================================================== */}
      <TropicalPalmTree pos={[-13, 0.25, -10]} scale={1.15} rotationY={0.4} />
      <TropicalPalmTree pos={[-13, 0.25, 10]} scale={1.2} rotationY={1.2} />
      <TropicalPalmTree pos={[12, 0.25, 10]} scale={1.1} rotationY={2.1} />
      <TropicalPalmTree pos={[12, 0.25, -10]} scale={1.1} rotationY={3.4} />
      <TropicalPalmTree pos={[-8, 0.25, -11.5]} scale={1.05} rotationY={0.8} />

      {/* ============================================================== */}
      {/* 4. WOODEN PIER / DERMAGA KAYU EXTENDING INTO BLUE WATER        */}
      {/* ============================================================== */}
      <group position={[8.0, 0.28, -4]}>
        {/* Main Wooden Deck Plank */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[8.0, 0.16, 2.6]} />
          <meshStandardMaterial color="#8D5B4C" roughness={0.7} />
        </mesh>

        {/* Dock Plank Grooves */}
        {[-3.0, -1.5, 0, 1.5, 3.0].map((gx, idx) => (
          <mesh key={idx} position={[gx, 0.085, 0]}>
            <boxGeometry args={[0.04, 0.015, 2.55]} />
            <meshStandardMaterial color="#582F0E" />
          </mesh>
        ))}

        {/* Piling Posts extending into the water */}
        {[-3.6, -1.2, 1.2, 3.6].map((px, idx) => (
          <React.Fragment key={idx}>
            <mesh position={[px, -0.4, -1.2]} castShadow>
              <cylinderGeometry args={[0.09, 0.09, 0.8, 8]} />
              <meshStandardMaterial color="#6F4E37" />
            </mesh>
            <mesh position={[px, -0.4, 1.2]} castShadow>
              <cylinderGeometry args={[0.09, 0.09, 0.8, 8]} />
              <meshStandardMaterial color="#6F4E37" />
            </mesh>
          </React.Fragment>
        ))}

        {/* Pier Lanterns on entrance and dock head */}
        {[-3.6, 3.6].map((px, idx) => (
          <group key={idx} position={[px, 0.45, -1.2]}>
            <mesh position={[0, -0.15, 0]}>
              <cylinderGeometry args={[0.035, 0.035, 0.35, 6]} />
              <meshStandardMaterial color="#4A3F35" />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <boxGeometry args={[0.18, 0.22, 0.18]} />
              <meshStandardMaterial color="#2B2D42" />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <sphereGeometry args={[0.07, 8, 8]} />
              <meshStandardMaterial color="#FFE6A7" emissive="#FFD166" emissiveIntensity={0.8} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ============================================================== */}
      {/* 5. PARKED SWAN PEDAL BOAT FLOATING IN THE BLUE WATER           */}
      {/* ============================================================== */}
      {activeRide !== 'boat' && (
        <group ref={boatBobRef} position={[3.5, 0.16, -1.5]} rotation={[0, Math.PI / 2, 0]}>
          <SwanBoatModel />
          <Billboard position={[0, 2.1, 0]}>
            <Text fontSize={0.24} color="#0077B6" outlineWidth={0.03} outlineColor="#FFF" anchorY="middle">
              🦢 Perahu Bebek Kayuh
            </Text>
          </Billboard>
        </group>
      )}

      {/* ============================================================== */}
      {/* 6. GIANT SANDCASTLE (WALK-THROUGH) ON THE WEST BEACH           */}
      {/* ============================================================== */}
      <group position={[-12.5, 0.25, 2]}>
        {/* Main Castle Walls */}
        <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.6, 1.8, 3.6]} />
          <meshStandardMaterial color="#DDA15E" roughness={0.8} />
        </mesh>
        {/* Open Archway Door to walk inside */}
        <mesh position={[0, 0.7, 1.81]}>
          <boxGeometry args={[1.2, 1.4, 0.05]} />
          <meshStandardMaterial color="#332" />
        </mesh>

        {/* 4 Corner Turret Towers */}
        {[
          [-1.8, 0, -1.8],
          [1.8, 0, -1.8],
          [-1.8, 0, 1.8],
          [1.8, 0, 1.8],
        ].map(([tx, ty, tz], idx) => (
          <group key={idx} position={[tx, ty, tz]}>
            <mesh position={[0, 1.2, 0]} castShadow>
              <cylinderGeometry args={[0.45, 0.5, 2.4, 10]} />
              <meshStandardMaterial color="#DDA15E" />
            </mesh>
            <mesh position={[0, 2.7, 0]}>
              <coneGeometry args={[0.6, 0.8, 10]} />
              <meshStandardMaterial color="#BC6C25" />
            </mesh>
            {/* Little red flag atop turret */}
            <mesh position={[0, 3.25, 0]}>
              <boxGeometry args={[0.25, 0.15, 0.02]} />
              <meshStandardMaterial color="#E63946" />
            </mesh>
          </group>
        ))}
      </group>

      {/* ============================================================== */}
      {/* 7. BEACH UMBRELLAS, LOUNGE CHAIRS & PLAYFUL ITEMS              */}
      {/* ============================================================== */}
      {/* South Beach Umbrella (Red & White) */}
      <group position={[-5, 0.25, -11.5]}>
        <mesh position={[0, 1.1, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 2.2, 8]} />
          <meshStandardMaterial color="#FFF" />
        </mesh>
        <mesh position={[0, 2.2, 0]} castShadow>
          <coneGeometry args={[1.5, 0.7, 12]} />
          <meshStandardMaterial color="#E63946" />
        </mesh>
        <mesh position={[0.7, 0.1, 0.5]} rotation={[-Math.PI / 2, 0, 0.3]}>
          <planeGeometry args={[0.9, 1.8]} />
          <meshStandardMaterial color="#FFF" />
        </mesh>
      </group>

      {/* North Beach Umbrella (Cyan & Yellow) */}
      <group position={[-3, 0.25, 11.5]}>
        <mesh position={[0, 1.1, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 2.2, 8]} />
          <meshStandardMaterial color="#FFF" />
        </mesh>
        <mesh position={[0, 2.2, 0]} castShadow>
          <coneGeometry args={[1.5, 0.7, 12]} />
          <meshStandardMaterial color="#4EA8DE" />
        </mesh>
        <mesh position={[0.7, 0.1, 0.5]} rotation={[-Math.PI / 2, 0, 0.3]}>
          <planeGeometry args={[0.9, 1.8]} />
          <meshStandardMaterial color="#FFD166" />
        </mesh>
      </group>

      {/* Bouncing Beach Ball */}
      <mesh position={[-1, 0.55, -10.5]} castShadow>
        <sphereGeometry args={[0.32, 12, 12]} />
        <meshStandardMaterial color="#FF007F" roughness={0.3} />
      </mesh>

      {/* Sparkling Clam Shells with Glowing Pearls */}
      {[
        [2, 0.28, -10],
        [-11, 0.28, -6],
        [-2, 0.28, 10.5],
      ].map(([cx, cy, cz], idx) => (
        <group key={idx} position={[cx, cy, cz]}>
          <mesh position={[0, 0.05, 0]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#FFCCD5" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <sphereGeometry args={[0.08, 10, 10]} />
            <meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
