import React, { useEffect } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  colliders,
  addSolidBox,
  addSolidCylinder,
  removeSolidCollider,
  SolidCollider,
  PlatformCollider,
} from '../../../state/colliders';

export const RumahKhaulah: React.FC = () => {
  useEffect(() => {
    // ------------------------------------------------------------------------
    // 1. WALKABLE FLOOR COLLIDERS (GROUND TYPE)
    // ------------------------------------------------------------------------
    // Front Porch Floor (Z: -2.4 to -6.5, X: -8.5 to 8.5)
    const porchBox = new THREE.Box3(
      new THREE.Vector3(-8.5, -0.5, -6.6),
      new THREE.Vector3(8.5, 0.45, -2.4)
    );
    // Main House Interior Floor (Z: -6.5 to -17.6, X: -8.5 to 8.5)
    const interiorFloorBox = new THREE.Box3(
      new THREE.Vector3(-8.5, -0.5, -17.6),
      new THREE.Vector3(8.5, 0.45, -6.4)
    );
    // Back Veranda Deck Floor (Z: -17.5 to -23.8, X: -6.0 to 6.0)
    const backVerandaBox = new THREE.Box3(
      new THREE.Vector3(-6.0, -0.5, -23.8),
      new THREE.Vector3(6.0, 0.45, -17.4)
    );

    const cPorch: PlatformCollider = { box: porchBox, type: 'ground' };
    const cInterior: PlatformCollider = { box: interiorFloorBox, type: 'ground' };
    const cVeranda: PlatformCollider = { box: backVerandaBox, type: 'ground' };
    colliders.push(cPorch, cInterior, cVeranda);

    // ------------------------------------------------------------------------
    // 2. PHYSICAL SOLID COLLIDERS (WALLS & OBSTACLES)
    // ------------------------------------------------------------------------
    const solids: SolidCollider[] = [
      // Front Wall (Z: -6.5): Left wing & Right wing, leaving center arch (X: -1.6 to +1.6) open
      addSolidBox([-8.6, 0, -6.8], [-1.6, 4.5, -6.2], 'wall_front_left'),
      addSolidBox([1.6, 0, -6.8], [8.6, 4.5, -6.2], 'wall_front_right'),

      // Left Exterior Wall (X: -8.5, Z: -17.6 to -6.4)
      addSolidBox([-8.8, 0, -17.6], [-8.2, 4.5, -6.4], 'wall_left_ext'),

      // Right Exterior Wall (X: +8.5, Z: -17.6 to -6.4)
      addSolidBox([8.2, 0, -17.6], [8.8, 4.5, -6.4], 'wall_right_ext'),

      // Back Exterior Wall (Z: -17.5): Left wing & Right wing, leaving center French doors (X: -1.6 to +1.6) open
      addSolidBox([-8.6, 0, -17.8], [-1.6, 4.5, -17.2], 'wall_back_left'),
      addSolidBox([1.6, 0, -17.8], [8.6, 4.5, -17.2], 'wall_back_right'),

      // Interior Partition Walls:
      // Left Room Divider (Office vs Musholla at Z: -12.0)
      addSolidBox([-8.4, 0, -12.2], [-3.2, 3.8, -11.8], 'interior_left_divider'),
      // Left Hallway Wall (with wide arch doorway between Z: -13.5 and -10.5)
      addSolidBox([-3.0, 0, -17.5], [-2.6, 3.8, -13.5], 'interior_left_hall_back'),
      addSolidBox([-3.0, 0, -10.5], [-2.6, 3.8, -6.5], 'interior_left_hall_front'),

      // Right Room Divider (Kitchen vs Bedroom at Z: -12.0)
      addSolidBox([3.2, 0, -12.2], [8.4, 3.8, -11.8], 'interior_right_divider'),
      // Right Hallway Wall (with wide arch doorway between Z: -13.5 and -10.5)
      addSolidBox([2.6, 0, -17.5], [3.0, 3.8, -13.5], 'interior_right_hall_back'),
      addSolidBox([2.6, 0, -10.5], [3.0, 3.8, -6.5], 'interior_right_hall_front'),

      // Front Porch Main Pillars
      addSolidCylinder(-7.8, -2.8, 0.25, 0, 3.6, 'porch_col_left_corner'),
      addSolidCylinder(-2.8, -2.8, 0.25, 0, 3.6, 'porch_col_left_entry'),
      addSolidCylinder(2.8, -2.8, 0.25, 0, 3.6, 'porch_col_right_entry'),
      addSolidCylinder(7.8, -2.8, 0.25, 0, 3.6, 'porch_col_right_corner'),

      // Front Porch Railings
      addSolidBox([-7.8, 0, -3.0], [-3.2, 1.2, -2.6], 'porch_rail_left'),
      addSolidBox([3.2, 0, -3.0], [7.8, 1.2, -2.6], 'porch_rail_right'),

      // Back Veranda Railings
      addSolidBox([-5.8, 0, -23.5], [-5.4, 1.3, -17.6], 'veranda_rail_left'),
      addSolidBox([5.4, 0, -23.5], [5.8, 1.3, -17.6], 'veranda_rail_right'),

      // Pergola Posts leading to Waterpark
      addSolidCylinder(-2.4, -23.6, 0.16, 0, 3.4, 'pergola_post_left'),
      addSolidCylinder(2.4, -23.6, 0.16, 0, 3.4, 'pergola_post_right'),
    ];

    return () => {
      [cPorch, cInterior, cVeranda].forEach((c) => {
        const idx = colliders.indexOf(c);
        if (idx !== -1) colliders.splice(idx, 1);
      });
      solids.forEach((s) => removeSolidCollider(s));
    };
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* ============================================================== */}
      {/* 1. FRONT PORCH (TERAS DEPAN MEGAH, Z: -2.5 to -6.5, X: -8.5 to 8.5) */}
      {/* ============================================================== */}
      {/* Porch Warm Timber Deck Planks */}
      <mesh position={[0, 0.15, -4.5]} receiveShadow>
        <boxGeometry args={[17.0, 0.3, 4.2]} />
        <meshStandardMaterial color="#E9D8A6" roughness={0.5} />
      </mesh>

      {/* Porch Grand Columns */}
      {[-7.8, -2.8, 2.8, 7.8].map((cx, i) => (
        <group key={i} position={[cx, 1.8, -2.8]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.22, 0.25, 3.4, 16]} />
            <meshStandardMaterial color="#FFF1E6" roughness={0.6} />
          </mesh>
          {/* Column Capital & Base */}
          <mesh position={[0, 1.65, 0]}>
            <boxGeometry args={[0.6, 0.15, 0.6]} />
            <meshStandardMaterial color="#E07A5F" />
          </mesh>
          <mesh position={[0, -1.65, 0]}>
            <boxGeometry args={[0.6, 0.15, 0.6]} />
            <meshStandardMaterial color="#E07A5F" />
          </mesh>
          {/* Warm Glowing Lantern */}
          <group position={[0, 0.9, 0.3]}>
            <mesh castShadow>
              <boxGeometry args={[0.26, 0.38, 0.26]} />
              <meshStandardMaterial color="#2B2D42" />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.12, 10, 10]} />
              <meshStandardMaterial color="#FFE6A7" emissive="#FFE6A7" emissiveIntensity={0.8} />
            </mesh>
            <pointLight color="#FFE6A7" intensity={0.6} distance={6} />
          </group>
        </group>
      ))}

      {/* Porch Decorative Balustrades / Railings */}
      {[-5.5, 5.5].map((rx, ri) => (
        <group key={ri} position={[rx, 0.65, -2.8]}>
          {/* Top Rail */}
          <mesh castShadow>
            <boxGeometry args={[4.4, 0.1, 0.15]} />
            <meshStandardMaterial color="#7F4F24" />
          </mesh>
          {/* Bottom Rail */}
          <mesh position={[0, -0.45, 0]}>
            <boxGeometry args={[4.4, 0.08, 0.12]} />
            <meshStandardMaterial color="#7F4F24" />
          </mesh>
          {/* Balusters */}
          {[-1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8].map((bx, bi) => (
            <mesh key={bi} position={[bx, -0.22, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.45, 8]} />
              <meshStandardMaterial color="#FFF1E6" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Porch Overhang Canopy Roof */}
      <mesh position={[0, 3.65, -4.5]} castShadow>
        <boxGeometry args={[17.4, 0.35, 4.6]} />
        <meshStandardMaterial color="#C85A32" roughness={0.6} />
      </mesh>

      {/* Stepping Stones to Front Yard Path */}
      {[
        { x: 0, z: -2.1, s: 0.9 },
        { x: 0.2, z: -1.1, s: 0.85 },
        { x: -0.1, z: -0.1, s: 0.9 },
        { x: 0.1, z: 0.9, s: 0.85 },
      ].map((stone, idx) => (
        <mesh key={idx} position={[stone.x, 0.06, stone.z]} rotation={[-Math.PI / 2, 0, idx * 0.4]}>
          <circleGeometry args={[stone.s * 0.45, 16]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.8} />
        </mesh>
      ))}

      {/* ============================================================== */}
      {/* 2. MAIN ENTRANCE FAÇADE & PLAQUE (Z: -6.5)                     */}
      {/* ============================================================== */}
      {/* Front Wall Left Wing */}
      <mesh position={[-5.1, 2.25, -6.5]} castShadow receiveShadow>
        <boxGeometry args={[6.8, 4.3, 0.4]} />
        <meshStandardMaterial color="#FFF1E6" roughness={0.7} />
      </mesh>
      {/* Front Wall Right Wing */}
      <mesh position={[5.1, 2.25, -6.5]} castShadow receiveShadow>
        <boxGeometry args={[6.8, 4.3, 0.4]} />
        <meshStandardMaterial color="#FFF1E6" roughness={0.7} />
      </mesh>
      {/* Arch Header above Main Entrance Doorway */}
      <mesh position={[0, 3.55, -6.5]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 1.7, 0.4]} />
        <meshStandardMaterial color="#FFF1E6" roughness={0.7} />
      </mesh>

      {/* Front Door Decorative Wooden Portal Frame */}
      <group position={[0, 1.35, -6.5]}>
        <mesh position={[-1.5, 0, 0.1]} castShadow>
          <boxGeometry args={[0.2, 2.7, 0.3]} />
          <meshStandardMaterial color="#7F4F24" />
        </mesh>
        <mesh position={[1.5, 0, 0.1]} castShadow>
          <boxGeometry args={[0.2, 2.7, 0.3]} />
          <meshStandardMaterial color="#7F4F24" />
        </mesh>
        <mesh position={[0, 1.35, 0.1]} castShadow>
          <boxGeometry args={[3.2, 0.25, 0.3]} />
          <meshStandardMaterial color="#7F4F24" />
        </mesh>

        {/* Big Golden Plaque: "RUMAH IMPIAN KHAULAH & KELUARGA" */}
        <mesh position={[0, 1.7, 0.15]}>
          <boxGeometry args={[3.6, 0.55, 0.08]} />
          <meshStandardMaterial color="#DDA15E" roughness={0.3} metalness={0.2} />
        </mesh>
        <Text
          position={[0, 1.7, 0.22]}
          fontSize={0.22}
          color="#582F0E"
          anchorX="center"
          anchorY="middle"
        >
          🏡 RUMAH IMPIAN KHAULAH ✨
        </Text>
      </group>

      {/* Front Windows with Cozy Shutters & Flower Boxes */}
      {[-5.2, 5.2].map((wx, wi) => (
        <group key={wi} position={[wx, 2.1, -6.4]}>
          <mesh>
            <boxGeometry args={[2.0, 1.6, 0.1]} />
            <meshStandardMaterial color="#93C5FD" roughness={0.1} transparent opacity={0.75} />
          </mesh>
          {/* Wooden Frame */}
          <mesh>
            <boxGeometry args={[2.1, 0.1, 0.14]} />
            <meshStandardMaterial color="#7F4F24" />
          </mesh>
          <mesh>
            <boxGeometry args={[0.1, 1.7, 0.14]} />
            <meshStandardMaterial color="#7F4F24" />
          </mesh>
          {/* Flower Box */}
          <mesh position={[0, -0.95, 0.18]}>
            <boxGeometry args={[2.1, 0.32, 0.4]} />
            <meshStandardMaterial color="#9C6644" />
          </mesh>
          {/* Fresh Blooms in Flower Box */}
          {[-0.8, -0.4, 0, 0.4, 0.8].map((fx, fi) => (
            <mesh key={fi} position={[fx, -0.72, 0.2]}>
              <sphereGeometry args={[0.13, 8, 8]} />
              <meshStandardMaterial color={fi % 2 === 0 ? '#FF006E' : '#FFBE0B'} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ============================================================== */}
      {/* 3. EXTERIOR WALLS & ROOF (LUAS, KEDALAMAN Z: -6.5 to -17.5)   */}
      {/* ============================================================== */}
      {/* Left Exterior Wall (X: -8.5) */}
      <mesh position={[-8.5, 2.25, -12.0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 4.3, 11.2]} />
        <meshStandardMaterial color="#FFF1E6" roughness={0.7} />
      </mesh>
      {/* Right Exterior Wall (X: 8.5) */}
      <mesh position={[8.5, 2.25, -12.0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 4.3, 11.2]} />
        <meshStandardMaterial color="#FFF1E6" roughness={0.7} />
      </mesh>

      {/* Windows on Side Walls */}
      {[-8.5, 8.5].map((sx, si) => (
        <group key={si}>
          {[-9.5, -14.5].map((sz, zi) => (
            <group key={zi} position={[sx, 2.2, sz]} rotation={[0, Math.PI / 2, 0]}>
              <mesh>
                <boxGeometry args={[1.8, 1.4, 0.1]} />
                <meshStandardMaterial color="#93C5FD" transparent opacity={0.75} roughness={0.1} />
              </mesh>
              <mesh>
                <boxGeometry args={[1.9, 0.1, 0.12]} />
                <meshStandardMaterial color="#7F4F24" />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* Back Wall Left Wing (Z: -17.5) */}
      <mesh position={[-5.1, 2.25, -17.5]} castShadow receiveShadow>
        <boxGeometry args={[6.8, 4.3, 0.4]} />
        <meshStandardMaterial color="#FFF1E6" roughness={0.7} />
      </mesh>
      {/* Back Wall Right Wing (Z: -17.5) */}
      <mesh position={[5.1, 2.25, -17.5]} castShadow receiveShadow>
        <boxGeometry args={[6.8, 4.3, 0.4]} />
        <meshStandardMaterial color="#FFF1E6" roughness={0.7} />
      </mesh>
      {/* Back Wall Center Arch Header above French Doors */}
      <mesh position={[0, 3.55, -17.5]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 1.7, 0.4]} />
        <meshStandardMaterial color="#FFF1E6" roughness={0.7} />
      </mesh>

      {/* Grand Terracotta Pitched Roof */}
      <mesh position={[0, 5.3, -12.0]} castShadow>
        <coneGeometry args={[12.5, 2.8, 4]} />
        <meshStandardMaterial color="#C85A32" roughness={0.55} />
      </mesh>

      {/* ============================================================== */}
      {/* 4. SPACIOUS INTERIOR FLOORS & CEILING (WARM PARQUET & MARBLE)  */}
      {/* ============================================================== */}
      {/* Main Interior Parquet Wood Floor */}
      <mesh position={[0, 0.16, -12.0]} receiveShadow>
        <boxGeometry args={[16.6, 0.3, 10.8]} />
        <meshStandardMaterial color="#DDB892" roughness={0.4} />
      </mesh>

      {/* Cozy Pastel Floor Rug in Living Room */}
      <mesh position={[0, 0.17, -11.5]} receiveShadow>
        <boxGeometry args={[5.2, 0.02, 4.6]} />
        <meshStandardMaterial color="#F4ACB7" roughness={0.8} />
      </mesh>

      {/* Musholla Green Carpet in Back-Left Room */}
      <mesh position={[-5.5, 0.17, -15.0]} receiveShadow>
        <boxGeometry args={[4.8, 0.02, 4.2]} />
        <meshStandardMaterial color="#2D6A4F" roughness={0.8} />
      </mesh>

      {/* Children Playroom Soft Play Mat in Back-Right Room */}
      <mesh position={[5.5, 0.17, -15.0]} receiveShadow>
        <boxGeometry args={[4.8, 0.02, 4.2]} />
        <meshStandardMaterial color="#80ED99" roughness={0.8} />
      </mesh>

      {/* Kitchen Tile Floor in Front-Right Room */}
      <mesh position={[5.5, 0.17, -9.5]} receiveShadow>
        <boxGeometry args={[4.8, 0.02, 4.2]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.3} />
      </mesh>

      {/* Abi Office Elegant Timber Floor in Front-Left Room */}
      <mesh position={[-5.5, 0.17, -9.5]} receiveShadow>
        <boxGeometry args={[4.8, 0.02, 4.2]} />
        <meshStandardMaterial color="#B08968" roughness={0.5} />
      </mesh>

      {/* ============================================================== */}
      {/* 5. INTERIOR PARTITION WALLS & ARCHWAYS                         */}
      {/* ============================================================== */}
      {/* Left Dividing Wall (Separating Office & Musholla at Z: -12.0) */}
      <mesh position={[-5.8, 1.9, -12.0]} castShadow receiveShadow>
        <boxGeometry args={[5.2, 3.6, 0.25]} />
        <meshStandardMaterial color="#FFE8D6" roughness={0.7} />
      </mesh>

      {/* Right Dividing Wall (Separating Kitchen & Playroom at Z: -12.0) */}
      <mesh position={[5.8, 1.9, -12.0]} castShadow receiveShadow>
        <boxGeometry args={[5.2, 3.6, 0.25]} />
        <meshStandardMaterial color="#FFE8D6" roughness={0.7} />
      </mesh>

      {/* Left Hallway Archway Pillars & Header (X: -2.8) */}
      <mesh position={[-2.8, 1.9, -8.5]} castShadow receiveShadow>
        <boxGeometry args={[0.25, 3.6, 3.8]} />
        <meshStandardMaterial color="#FFE8D6" roughness={0.7} />
      </mesh>
      <mesh position={[-2.8, 1.9, -15.5]} castShadow receiveShadow>
        <boxGeometry args={[0.25, 3.6, 3.8]} />
        <meshStandardMaterial color="#FFE8D6" roughness={0.7} />
      </mesh>
      <mesh position={[-2.8, 3.3, -12.0]} castShadow receiveShadow>
        <boxGeometry args={[0.25, 0.8, 3.4]} />
        <meshStandardMaterial color="#FFE8D6" roughness={0.7} />
      </mesh>

      {/* Right Hallway Archway Pillars & Header (X: 2.8) */}
      <mesh position={[2.8, 1.9, -8.5]} castShadow receiveShadow>
        <boxGeometry args={[0.25, 3.6, 3.8]} />
        <meshStandardMaterial color="#FFE8D6" roughness={0.7} />
      </mesh>
      <mesh position={[2.8, 1.9, -15.5]} castShadow receiveShadow>
        <boxGeometry args={[0.25, 3.6, 3.8]} />
        <meshStandardMaterial color="#FFE8D6" roughness={0.7} />
      </mesh>
      <mesh position={[2.8, 3.3, -12.0]} castShadow receiveShadow>
        <boxGeometry args={[0.25, 0.8, 3.4]} />
        <meshStandardMaterial color="#FFE8D6" roughness={0.7} />
      </mesh>

      {/* ============================================================== */}
      {/* 6. STATIC FURNITURE & FIXTURES FOR EACH ROOM                   */}
      {/* ============================================================== */}
      {/* --- LIVING ROOM (RUANG KELUARGA & SANTAI TENGAH) --- */}
      <group position={[0, 0.2, -11.5]}>
        {/* L-Shaped Cozy Family Sofa */}
        <group position={[-1.2, 0, 0]}>
          {/* Base Cushion */}
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[2.2, 0.4, 1.0]} />
            <meshStandardMaterial color="#E9D8A6" roughness={0.8} />
          </mesh>
          {/* Backrest */}
          <mesh position={[0, 0.65, -0.4]} castShadow>
            <boxGeometry args={[2.2, 0.55, 0.25]} />
            <meshStandardMaterial color="#DDA15E" roughness={0.8} />
          </mesh>
          {/* Pastel Pillows */}
          <mesh position={[-0.7, 0.5, -0.2]} rotation={[0.2, 0.2, 0]}>
            <boxGeometry args={[0.35, 0.35, 0.15]} />
            <meshStandardMaterial color="#FFB5A7" />
          </mesh>
          <mesh position={[0.7, 0.5, -0.2]} rotation={[0.2, -0.2, 0]}>
            <boxGeometry args={[0.35, 0.35, 0.15]} />
            <meshStandardMaterial color="#9A8C98" />
          </mesh>
        </group>

        {/* Coffee Table */}
        <group position={[0.4, 0, 0]}>
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[1.2, 0.08, 0.8]} />
            <meshStandardMaterial color="#7F4F24" roughness={0.6} />
          </mesh>
          {[-0.5, 0.5].map((tx, ti) =>
            [-0.3, 0.3].map((tz, zi) => (
              <mesh key={`${ti}-${zi}`} position={[tx, 0.1, tz]}>
                <cylinderGeometry args={[0.03, 0.03, 0.2, 8]} />
                <meshStandardMaterial color="#7F4F24" />
              </mesh>
            ))
          )}
          {/* Fresh Flower Vase on Coffee Table */}
          <mesh position={[0, 0.34, 0]}>
            <cylinderGeometry args={[0.08, 0.06, 0.18, 12]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.46, 0]}>
            <sphereGeometry args={[0.09, 8, 8]} />
            <meshStandardMaterial color="#FF4D6D" />
          </mesh>
        </group>

        {/* Chandelier / Warm Center Ceiling Light */}
        <pointLight position={[0, 3.2, 0]} color="#FFE8D6" intensity={0.9} distance={10} />
      </group>

      {/* --- RUANG KERJA & CODING ABI (FRONT-LEFT ROOM: X: -5.5, Z: -9.5) --- */}
      <group position={[-5.5, 0.2, -9.5]}>
        {/* Wall Mounted Programmer Bookshelf */}
        <mesh position={[-2.4, 1.8, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <boxGeometry args={[2.4, 0.1, 0.3]} />
          <meshStandardMaterial color="#7F4F24" />
        </mesh>
        {/* Tech Books */}
        {[-0.8, -0.5, -0.2, 0.1, 0.4, 0.7].map((bx, bi) => (
          <mesh key={bi} position={[-2.4, 2.05, bx]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.12, 0.4, 0.24]} />
            <meshStandardMaterial color={['#2B2D42', '#3D5A80', '#E07A5F', '#81B29A', '#F2CC8F', '#4A4E69'][bi % 6]} />
          </mesh>
        ))}

        {/* Motivational Frame on Wall: "BARAKALLAH - KELUARGA BAHAGIA" */}
        <mesh position={[-2.45, 2.7, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[1.6, 0.7, 0.05]} />
          <meshStandardMaterial color="#582F0E" />
        </mesh>
        <Text
          position={[-2.42, 2.7, 0]}
          rotation={[0, Math.PI / 2, 0]}
          fontSize={0.12}
          color="#FEF08A"
          anchorX="center"
          anchorY="middle"
        >
          💻 CODING WITH LOVE FOR KELUARGA ❤️
        </Text>

        {/* Warm Ambient Lamp */}
        <pointLight position={[0, 2.8, 0]} color="#FFF3B0" intensity={0.8} distance={7} />
      </group>

      {/* --- MUSHOLLA KELUARGA (BACK-LEFT ROOM: X: -5.5, Z: -15.0) --- */}
      <group position={[-5.5, 0.2, -15.0]}>
        {/* Wooden Quran Stand (Rehal) & Mushaf */}
        <group position={[0, 0.12, -1.5]}>
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.2, 0.4]} />
            <meshStandardMaterial color="#7F4F24" roughness={0.6} />
          </mesh>
          {/* Open Sacred Book */}
          <mesh position={[0, 0.14, 0]} rotation={[-0.2, 0, 0]}>
            <boxGeometry args={[0.42, 0.06, 0.32]} />
            <meshStandardMaterial color="#FFFBEB" />
          </mesh>
        </group>

        {/* Wooden Prayer Bead (Tasbih) Rack on Wall */}
        <mesh position={[-2.4, 1.8, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[1.2, 0.08, 0.15]} />
          <meshStandardMaterial color="#7F4F24" />
        </mesh>

        {/* Wall Calligraphy Frame: "BISMILLAHIRRAHMANIRRAHIM" */}
        <mesh position={[-2.45, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[1.8, 0.8, 0.04]} />
          <meshStandardMaterial color="#1B4332" />
        </mesh>
        <Text
          position={[-2.42, 2.5, 0]}
          rotation={[0, Math.PI / 2, 0]}
          fontSize={0.16}
          color="#FFD700"
          anchorX="center"
          anchorY="middle"
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </Text>

        {/* Serene Dawn Light */}
        <pointLight position={[0, 2.8, 0]} color="#BAE6FD" intensity={0.7} distance={7} />
      </group>

      {/* --- DAPUR BERSIH UMMI (FRONT-RIGHT ROOM: X: 5.5, Z: -9.5) --- */}
      <group position={[5.5, 0.2, -9.5]}>
        {/* Kitchen Marble Counter & Breakfast Bar */}
        <group position={[0, 0, 1.2]}>
          <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.2, 0.9, 0.8]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.2} metalness={0.1} />
          </mesh>
          {/* Marble Top Counter */}
          <mesh position={[0, 0.92, 0]} castShadow>
            <boxGeometry args={[3.3, 0.06, 0.85]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.1} />
          </mesh>
          {/* Fruit Bowl on Counter */}
          <mesh position={[1.0, 1.02, 0]}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          {[-0.06, 0.06].map((fx, fi) => (
            <mesh key={fi} position={[1.0 + fx, 1.14, 0]}>
              <sphereGeometry args={[0.07, 8, 8]} />
              <meshStandardMaterial color={fi === 0 ? '#E63946' : '#FFB703'} />
            </mesh>
          ))}
        </group>

        {/* Wall Spice Rack */}
        <mesh position={[2.4, 1.7, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <boxGeometry args={[2.0, 0.08, 0.2]} />
          <meshStandardMaterial color="#7F4F24" />
        </mesh>

        {/* Kitchen Ceiling Warm Light */}
        <pointLight position={[0, 2.8, 0]} color="#FEF08A" intensity={0.8} distance={7} />
      </group>

      {/* --- KAMAR TIDUR & RUANG BERMAIN ANAK (BACK-RIGHT ROOM: X: 5.5, Z: -15.0) --- */}
      <group position={[5.5, 0.2, -15.0]}>
        {/* Colorful Toy Box with Building Blocks */}
        <group position={[-1.6, 0, 0.8]}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[1.2, 0.5, 0.7]} />
            <meshStandardMaterial color="#FFB703" roughness={0.5} />
          </mesh>
          {/* Colorful Toy Blocks spilling out */}
          {[-0.3, 0, 0.3].map((bx, bi) => (
            <mesh key={bi} position={[bx, 0.58, (bi % 2 === 0 ? 0.1 : -0.1)]} castShadow>
              <boxGeometry args={[0.16, 0.16, 0.16]} />
              <meshStandardMaterial color={['#EF476F', '#06D6A0', '#118AB2'][bi]} />
            </mesh>
          ))}
        </group>

        {/* Playroom Gentle Light */}
        <pointLight position={[0, 2.8, 0]} color="#FEF3C7" intensity={0.8} distance={7} />
      </group>

      {/* ============================================================== */}
      {/* 7. BACK VERANDA & GARDEN PERGOLA TO WATERPARK (Z: -17.5 to -23.5) */}
      {/* ============================================================== */}
      {/* Back Veranda Spacious Decking */}
      <mesh position={[0, 0.15, -20.5]} receiveShadow>
        <boxGeometry args={[11.6, 0.28, 6.0]} />
        <meshStandardMaterial color="#DDB892" roughness={0.6} />
      </mesh>

      {/* Back Veranda Protective Railings */}
      {[-5.6, 5.6].map((vx, vi) => (
        <group key={vi} position={[vx, 0.7, -20.5]}>
          <mesh castShadow>
            <boxGeometry args={[0.15, 0.85, 5.8]} />
            <meshStandardMaterial color="#7F4F24" />
          </mesh>
        </group>
      ))}

      {/* French Double Glass Doors Facing Backyard Pool (Z: -17.5) */}
      <group position={[0, 1.35, -17.5]}>
        <mesh castShadow>
          <boxGeometry args={[2.8, 2.7, 0.12]} />
          <meshStandardMaterial color="#7F4F24" roughness={0.6} />
        </mesh>
        {/* Clear Glass Panes */}
        {[-0.65, 0.65].map((gx, gi) => (
          <mesh key={gi} position={[gx, 0.15, 0.02]}>
            <boxGeometry args={[0.9, 2.1, 0.06]} />
            <meshStandardMaterial color="#93C5FD" transparent opacity={0.7} roughness={0.1} />
          </mesh>
        ))}
        {/* Navigation Plaque */}
        <mesh position={[0, 1.55, -0.1]}>
          <boxGeometry args={[3.0, 0.45, 0.06]} />
          <meshStandardMaterial color="#0096C7" />
        </mesh>
        <Text
          position={[0, 1.55, -0.15]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.18}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
        >
          🏊‍♀️ BACKYARD WATERPARK & KOLAM RENANG 🌴
        </Text>
      </group>

      {/* Flower-Covered Garden Pergola Archway Entry to Pool (Z: -23.5) */}
      <group position={[0, 0, -23.5]}>
        {/* Timber Posts */}
        <mesh position={[-2.4, 1.7, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.16, 3.4, 12]} />
          <meshStandardMaterial color="#6F4E37" />
        </mesh>
        <mesh position={[2.4, 1.7, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.16, 3.4, 12]} />
          <meshStandardMaterial color="#6F4E37" />
        </mesh>
        {/* Lattice Beams */}
        <mesh position={[0, 3.45, 0]} castShadow>
          <boxGeometry args={[5.2, 0.2, 0.4]} />
          <meshStandardMaterial color="#6F4E37" />
        </mesh>
        {[-1.8, -0.9, 0, 0.9, 1.8].map((bx, bi) => (
          <mesh key={bi} position={[bx, 3.6, 0]}>
            <boxGeometry args={[0.12, 0.14, 1.4]} />
            <meshStandardMaterial color="#6F4E37" />
          </mesh>
        ))}
        {/* Climbing Ivy & Flowers on Pergola */}
        <mesh position={[-2.4, 2.4, 0]}>
          <sphereGeometry args={[0.42, 8, 8]} />
          <meshStandardMaterial color="#2D6A4F" roughness={0.6} />
        </mesh>
        <mesh position={[2.4, 2.2, 0]}>
          <sphereGeometry args={[0.38, 8, 8]} />
          <meshStandardMaterial color="#2D6A4F" roughness={0.6} />
        </mesh>
        {/* Blossoms */}
        {[-2.2, -1.2, 0, 1.2, 2.2].map((fx, fi) => (
          <mesh key={fi} position={[fx, 3.5, fi % 2 === 0 ? 0.25 : -0.25]}>
            <sphereGeometry args={[0.14, 6, 6]} />
            <meshStandardMaterial color={fi % 2 === 0 ? '#FF6B8B' : '#FFD166'} />
          </mesh>
        ))}
      </group>
    </group>
  );
};
