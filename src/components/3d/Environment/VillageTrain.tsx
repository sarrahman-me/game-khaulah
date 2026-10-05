import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, gameStore } from '../../../state/useGameStore';

// Function to compute position and heading along the rectangular track loop with rounded corners
export function getTrainTrackPose(progress: number): { pos: THREE.Vector3; heading: number } {
  // Rectangle bounds: X: [-48, 48] (width 96), Z: [-12, 42] (height 54)
  // Total perimeter = 2 * (96 + 54) = 300 units
  const minX = -48;
  const maxX = 48;
  const minZ = -12;
  const maxZ = 42;
  const width = maxX - minX;
  const depth = maxZ - minZ;
  const perimeter = 2 * (width + depth);

  // Normalize progress to [0, 1]
  let p = progress % 1;
  if (p < 0) p += 1;
  const dist = p * perimeter;

  const pos = new THREE.Vector3();
  let heading = 0;

  if (dist < width) {
    // 1. Bottom edge: from (minX, minZ) to (maxX, minZ) moving right (+X)
    const t = dist / width;
    pos.set(minX + t * width, 0.5, minZ);
    heading = Math.PI / 2; // facing +X
  } else if (dist < width + depth) {
    // 2. Right edge: from (maxX, minZ) to (maxX, maxZ) moving forward (+Z)
    const t = (dist - width) / depth;
    pos.set(maxX, 0.5, minZ + t * depth);
    heading = 0; // facing +Z
  } else if (dist < 2 * width + depth) {
    // 3. Top edge: from (maxX, maxZ) to (minX, maxZ) moving left (-X)
    const t = (dist - (width + depth)) / width;
    pos.set(maxX - t * width, 0.5, maxZ);
    heading = -Math.PI / 2; // facing -X
  } else {
    // 4. Left edge: from (minX, maxZ) to (minX, minZ) moving backward (-Z)
    const t = (dist - (2 * width + depth)) / depth;
    pos.set(minX, 0.5, maxZ - t * depth);
    heading = Math.PI; // facing -Z
  }

  return { pos, heading };
}

// Locomotive Steam Puff Particle
const SteamPuff: React.FC<{ offset: number }> = ({ offset }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = (state.clock.getElapsedTime() * 2 + offset) % 1;
    meshRef.current.position.y = 1.6 + t * 0.9;
    meshRef.current.position.z = -0.6 - t * 0.4;
    meshRef.current.scale.setScalar(0.18 + t * 0.28);
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    if (mat) mat.opacity = 1 - t;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.3, 8, 8]} />
      <meshStandardMaterial color="#FFFFFF" transparent opacity={0.7} roughness={0.5} />
    </mesh>
  );
};

// Locomotive and Carriage Models
const TrainVehicles: React.FC<{ progress: number }> = ({ progress }) => {
  const trainRef = useRef<THREE.Group>(null);
  const carriage1Ref = useRef<THREE.Group>(null);

  useFrame(() => {
    // Update Locomotive
    const loco = getTrainTrackPose(progress);
    if (trainRef.current) {
      trainRef.current.position.copy(loco.pos);
      trainRef.current.rotation.y = loco.heading;
    }

    // Carriage 1 (offset by distance ~4 units behind)
    const car1 = getTrainTrackPose(progress - 3.8 / 300);
    if (carriage1Ref.current) {
      carriage1Ref.current.position.copy(car1.pos);
      carriage1Ref.current.rotation.y = car1.heading;
    }
  });

  return (
    <>
      {/* 1. STEAM LOCOMOTIVE */}
      <group ref={trainRef}>
        {/* Boiler Cylinder */}
        <mesh position={[0, 0.6, 0.4]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.42, 0.42, 1.6, 16]} />
          <meshStandardMaterial color="#0077B6" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Cabin */}
        <mesh position={[0, 0.9, -0.7]} castShadow>
          <boxGeometry args={[1.1, 1.1, 1.0]} />
          <meshStandardMaterial color="#D90429" roughness={0.4} />
        </mesh>
        {/* Cabin Roof */}
        <mesh position={[0, 1.5, -0.7]} castShadow>
          <boxGeometry args={[1.2, 0.12, 1.1]} />
          <meshStandardMaterial color="#FFD166" />
        </mesh>
        {/* Smokestack Chimney */}
        <mesh position={[0, 1.25, 0.9]} castShadow>
          <cylinderGeometry args={[0.15, 0.1, 0.55, 10]} />
          <meshStandardMaterial color="#FFB703" />
        </mesh>
        {/* Headlight on Front */}
        <mesh position={[0, 0.7, 1.25]}>
          <cylinderGeometry args={[0.14, 0.14, 0.1, 12]} />
          <meshStandardMaterial color="#FFF9A6" emissive="#FFD166" emissiveIntensity={0.8} />
        </mesh>
        {/* Cowcatcher Grille Front */}
        <mesh position={[0, 0.25, 1.3]}>
          <boxGeometry args={[1.0, 0.25, 0.2]} />
          <meshStandardMaterial color="#CED4DA" metalness={0.6} />
        </mesh>
        {/* Animated Steam Puffs */}
        <SteamPuff offset={0.0} />
        <SteamPuff offset={0.5} />

        {/* Wheels */}
        {[-0.55, 0.55].map((wx, idx) => (
          <React.Fragment key={idx}>
            <mesh position={[wx, 0.25, -0.6]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.26, 0.26, 0.12, 12]} />
              <meshStandardMaterial color="#2B2D42" />
            </mesh>
            <mesh position={[wx, 0.22, 0.4]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.22, 0.22, 0.12, 12]} />
              <meshStandardMaterial color="#2B2D42" />
            </mesh>
          </React.Fragment>
        ))}

        {/* Billboard Badge */}
        <Billboard position={[0, 2.2, 0]}>
          <Text fontSize={0.24} color="#0077B6" outlineWidth={0.03} outlineColor="#FFF" anchorY="middle">
            🚂 Kereta Mini Khaulah
          </Text>
        </Billboard>
      </group>

      {/* 2. PASSENGER CARRIAGE 1 */}
      <group ref={carriage1Ref}>
        {/* Body */}
        <mesh position={[0, 0.65, 0]} castShadow>
          <boxGeometry args={[1.1, 0.8, 2.0]} />
          <meshStandardMaterial color="#FF69B4" roughness={0.4} />
        </mesh>
        {/* Roof */}
        <mesh position={[0, 1.15, 0]}>
          <boxGeometry args={[1.2, 0.12, 2.1]} />
          <meshStandardMaterial color="#FFBE0B" />
        </mesh>
        {/* Seats inside */}
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[0.8, 0.25, 1.4]} />
          <meshStandardMaterial color="#8338EC" />
        </mesh>
        {/* Wheels */}
        {[-0.55, 0.55].map((wx, idx) => (
          <React.Fragment key={idx}>
            <mesh position={[wx, 0.22, -0.6]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 0.1, 12]} />
              <meshStandardMaterial color="#2B2D42" />
            </mesh>
            <mesh position={[wx, 0.22, 0.6]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 0.1, 12]} />
              <meshStandardMaterial color="#2B2D42" />
            </mesh>
          </React.Fragment>
        ))}
      </group>
    </>
  );
};

// Train Station Platform
const StationPlatform: React.FC<{ pos: [number, number, number]; name: string; rotY?: number }> = ({
  pos,
  name,
  rotY = 0,
}) => {
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {/* Platform Concrete Slab */}
      <mesh position={[0, 0.35, 0]} receiveShadow>
        <boxGeometry args={[7.5, 0.28, 3.2]} />
        <meshStandardMaterial color="#E9D8A6" roughness={0.7} />
      </mesh>
      {/* Station Canopy Roof */}
      <mesh position={[0, 2.9, 0]} castShadow>
        <boxGeometry args={[7.8, 0.2, 3.5]} />
        <meshStandardMaterial color="#E76F51" />
      </mesh>
      {/* Roof Pillar Supports */}
      {[-3.2, 3.2].map((px, idx) => (
        <mesh key={idx} position={[px, 1.5, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 2.5, 8]} />
          <meshStandardMaterial color="#6F4E37" />
        </mesh>
      ))}
      {/* Station Nameboard Billboard */}
      <Billboard position={[0, 3.6, 0]}>
        <Text fontSize={0.32} color="#582F0E" outlineWidth={0.04} outlineColor="#FFF" anchorY="middle">
          {name}
        </Text>
      </Billboard>
    </group>
  );
};

export const VillageTrain: React.FC = () => {
  const progressRef = useRef(0);
  const activeRide = useGameStore((s) => s.activeRide);

  useFrame((_, delta) => {
    // Train loop speed
    progressRef.current = (progressRef.current + delta * 0.025) % 1;

    // Check interaction distance to train
    const playerPos = gameStore.getState().playerPos;
    const trainPose = getTrainTrackPose(progressRef.current);
    const distToTrain = Math.hypot(playerPos[0] - trainPose.pos.x, playerPos[2] - trainPose.pos.z);

    if (distToTrain < 4.8 && activeRide === 'none') {
      gameStore.setNearbyInteractable({
        id: 'village_train',
        title: 'Kereta Mini Desa 🚂🛤️',
        prompt: 'Tekan [E] untuk Naik Kereta Keliling Desa! ✨',
      });
    } else {
      const cur = gameStore.getState().nearbyInteractable;
      if (cur?.id === 'village_train') {
        gameStore.setNearbyInteractable(null);
      }
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* --- 1. CONTINUOUS PERIMETER RAILWAY TRACKS & GRAVEL BALLAST --- */}
      {/* South Track (Z: -12, X: -48 to 48) */}
      <mesh position={[0, 0.265, -12]} receiveShadow>
        <boxGeometry args={[96, 0.04, 1.6]} />
        <meshStandardMaterial color="#78716C" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.29, -12]}>
        <boxGeometry args={[96, 0.02, 0.8]} />
        <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* North Track (Z: 42, X: -48 to 48) */}
      <mesh position={[0, 0.265, 42]} receiveShadow>
        <boxGeometry args={[96, 0.04, 1.6]} />
        <meshStandardMaterial color="#78716C" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.29, 42]}>
        <boxGeometry args={[96, 0.02, 0.8]} />
        <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* West Track (X: -48, Z: -12 to 42) */}
      <mesh position={[-48, 0.265, 15]} receiveShadow>
        <boxGeometry args={[1.6, 0.04, 54]} />
        <meshStandardMaterial color="#78716C" roughness={0.9} />
      </mesh>
      <mesh position={[-48, 0.29, 15]}>
        <boxGeometry args={[0.8, 0.02, 54]} />
        <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* East Track (X: 48, Z: -12 to 42) */}
      <mesh position={[48, 0.265, 15]} receiveShadow>
        <boxGeometry args={[1.6, 0.04, 54]} />
        <meshStandardMaterial color="#78716C" roughness={0.9} />
      </mesh>
      <mesh position={[48, 0.29, 15]}>
        <boxGeometry args={[0.8, 0.02, 54]} />
        <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* --- 2. FOUR THEMED STATIONS --- */}
      {/* Station 1: Rumah Khaulah (South, near home) */}
      <StationPlatform pos={[0, 0, -15]} name="🚉 Stasiun Rumah Khaulah 🏡" />
      {/* Station 2: Kebun & Danau (West) */}
      <StationPlatform pos={[-51, 0, 15]} name="🚉 Stasiun Kebun & Danau 🐑🏖️" rotY={Math.PI / 2} />
      {/* Station 3: TK Karang Tengah (North, near school gate) */}
      <StationPlatform pos={[0, 0, 45]} name="🚉 Stasiun TK Karang Tengah 🎒🏫" rotY={Math.PI} />
      {/* Station 4: Karnaval & Kota (East) */}
      <StationPlatform pos={[51, 0, 15]} name="🚉 Stasiun Karnaval & Kota 🎡🛒" rotY={-Math.PI / 2} />

      {/* --- 3. ANIMATED TRAIN ON TRACKS --- */}
      <TrainVehicles progress={progressRef.current} />
    </group>
  );
};
