import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, gameStore } from '../../../state/useGameStore';
import {
  colliders,
  addSolidBox,
  addSolidCylinder,
  removeSolidCollider,
  SolidCollider,
  PlatformCollider,
} from '../../../state/colliders';

// ============================================================================
// 1. RUMAH KHAULAH EXTERIOR (DUNIA LUAR - POSISI [0, 0, 0])
// ============================================================================
export const RumahKhaulahExterior: React.FC = () => {
  const isInsideHouse = useGameStore((s) => s.isInsideHouse);
  const lastNearDoorRef = useRef<string | null>(null);

  useEffect(() => {
    // Front Porch Floor (Z: -2.4 to -6.5, X: -8.5 to 8.5)
    const porchBox = new THREE.Box3(
      new THREE.Vector3(-8.5, -0.5, -6.6),
      new THREE.Vector3(8.5, 0.45, -2.4)
    );
    // Back Veranda Deck Floor (Z: -17.5 to -23.8, X: -6.0 to 6.0)
    const backVerandaBox = new THREE.Box3(
      new THREE.Vector3(-6.0, -0.5, -23.8),
      new THREE.Vector3(6.0, 0.45, -17.4)
    );

    const cPorch: PlatformCollider = { box: porchBox, type: 'ground' };
    const cVeranda: PlatformCollider = { box: backVerandaBox, type: 'ground' };
    colliders.push(cPorch, cVeranda);

    const solids: SolidCollider[] = [
      // Solid Front Wall (Completely closes the exterior house)
      addSolidBox([-8.6, 0, -6.8], [8.6, 4.5, -6.2], 'ext_wall_front'),

      // Left Exterior Wall (X: -8.5, Z: -17.6 to -6.4)
      addSolidBox([-8.8, 0, -17.6], [-8.2, 4.5, -6.4], 'ext_wall_left'),

      // Right Exterior Wall (X: +8.5, Z: -17.6 to -6.4)
      addSolidBox([8.2, 0, -17.6], [8.8, 4.5, -6.4], 'ext_wall_right'),

      // Solid Back Wall (Completely closes the exterior back towards pool deck)
      addSolidBox([-8.6, 0, -17.8], [8.6, 4.5, -17.2], 'ext_wall_back'),

      // Front Porch Pillars & Railings
      addSolidCylinder(-7.8, -2.8, 0.25, 0, 3.6, 'porch_col_left_corner'),
      addSolidCylinder(-2.8, -2.8, 0.25, 0, 3.6, 'porch_col_left_entry'),
      addSolidCylinder(2.8, -2.8, 0.25, 0, 3.6, 'porch_col_right_entry'),
      addSolidCylinder(7.8, -2.8, 0.25, 0, 3.6, 'porch_col_right_corner'),

      addSolidBox([-7.8, 0, -3.0], [-3.2, 1.2, -2.6], 'porch_rail_left'),
      addSolidBox([3.2, 0, -3.0], [7.8, 1.2, -2.6], 'porch_rail_right'),

      // Back Veranda Railings & Pergola
      addSolidBox([-5.8, 0, -23.5], [-5.4, 1.3, -17.6], 'veranda_rail_left'),
      addSolidBox([5.4, 0, -23.5], [5.8, 1.3, -17.6], 'veranda_rail_right'),
      addSolidCylinder(-2.4, -23.6, 0.16, 0, 3.4, 'pergola_post_left'),
      addSolidCylinder(2.4, -23.6, 0.16, 0, 3.4, 'pergola_post_right'),
    ];

    return () => {
      [cPorch, cVeranda].forEach((c) => {
        const idx = colliders.indexOf(c);
        if (idx !== -1) colliders.splice(idx, 1);
      });
      solids.forEach((s) => removeSolidCollider(s));
    };
  }, []);

  useFrame(() => {
    if (isInsideHouse) return;
    const playerPos = gameStore.getState().playerPos;

    const distFront = Math.hypot(playerPos[0] - 0, playerPos[2] - (-5.3));
    const distBack = Math.hypot(playerPos[0] - 0, playerPos[2] - (-18.6));

    if (distFront < 2.6) {
      if (lastNearDoorRef.current !== 'front') {
        lastNearDoorRef.current = 'front';
        gameStore.setNearbyInteractable({
          id: 'house_front_door',
          title: 'Pintu Rumah Khaulah',
          prompt: 'Tekan [E] untuk Masuk ke Rumah Khaulah! 🏡🚪',
        });
      }
    } else if (distBack < 2.6) {
      if (lastNearDoorRef.current !== 'back') {
        lastNearDoorRef.current = 'back';
        gameStore.setNearbyInteractable({
          id: 'house_back_door',
          title: 'Pintu Belakang Rumah',
          prompt: 'Tekan [E] untuk Masuk ke Rumah (Pintu Belakang)! 🏡🚪',
        });
      }
    } else {
      if (lastNearDoorRef.current !== null) {
        lastNearDoorRef.current = null;
        const cur = gameStore.getState().nearbyInteractable;
        if (cur?.id === 'house_front_door' || cur?.id === 'house_back_door') {
          gameStore.setNearbyInteractable(null);
        }
      }
    }
  });

  return (
    <group position={[0, 0, 0]} visible={!isInsideHouse}>
      {/* Front Porch Timber Deck Planks */}
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
          <mesh position={[0, 1.65, 0]}>
            <boxGeometry args={[0.6, 0.15, 0.6]} />
            <meshStandardMaterial color="#E07A5F" />
          </mesh>
          <mesh position={[0, -1.65, 0]}>
            <boxGeometry args={[0.6, 0.15, 0.6]} />
            <meshStandardMaterial color="#E07A5F" />
          </mesh>
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

      {/* Porch Railings */}
      {[-5.5, 5.5].map((rx, ri) => (
        <group key={ri} position={[rx, 0.65, -2.8]}>
          <mesh castShadow>
            <boxGeometry args={[4.4, 0.1, 0.15]} />
            <meshStandardMaterial color="#7F4F24" />
          </mesh>
          <mesh position={[0, -0.45, 0]}>
            <boxGeometry args={[4.4, 0.08, 0.12]} />
            <meshStandardMaterial color="#7F4F24" />
          </mesh>
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

      {/* Front Wall Wings & Arch Header */}
      <mesh position={[-5.1, 2.25, -6.5]} castShadow receiveShadow>
        <boxGeometry args={[6.8, 4.3, 0.4]} />
        <meshStandardMaterial color="#FFF1E6" roughness={0.7} />
      </mesh>
      <mesh position={[5.1, 2.25, -6.5]} castShadow receiveShadow>
        <boxGeometry args={[6.8, 4.3, 0.4]} />
        <meshStandardMaterial color="#FFF1E6" roughness={0.7} />
      </mesh>
      <mesh position={[0, 3.55, -6.5]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 1.7, 0.4]} />
        <meshStandardMaterial color="#FFF1E6" roughness={0.7} />
      </mesh>

      {/* Front Door Decorative Portal Frame & Plaque */}
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

      {/* Closed Interactive Front Door */}
      <group
        position={[0, 1.35, -6.45]}
        onClick={(e) => {
          e.stopPropagation();
          gameStore.enterHouse('front');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <mesh position={[-0.7, 0, 0]} castShadow>
          <boxGeometry args={[1.36, 2.65, 0.1]} />
          <meshStandardMaterial color="#854D0E" roughness={0.4} />
        </mesh>
        <mesh position={[0.7, 0, 0]} castShadow>
          <boxGeometry args={[1.36, 2.65, 0.1]} />
          <meshStandardMaterial color="#854D0E" roughness={0.4} />
        </mesh>
        {[-0.7, 0.7].map((dx, di) => (
          <group key={di} position={[dx, 0, 0.055]}>
            <mesh position={[0, 0.55, 0]}>
              <boxGeometry args={[1.05, 0.95, 0.02]} />
              <meshStandardMaterial color="#A16207" />
            </mesh>
            <mesh position={[0, -0.55, 0]}>
              <boxGeometry args={[1.05, 0.95, 0.02]} />
              <meshStandardMaterial color="#A16207" />
            </mesh>
          </group>
        ))}
        <mesh position={[-0.15, 0.0, 0.08]}>
          <cylinderGeometry args={[0.035, 0.035, 0.22, 12]} />
          <meshStandardMaterial color="#FBBF24" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[0.15, 0.0, 0.08]}>
          <cylinderGeometry args={[0.035, 0.035, 0.22, 12]} />
          <meshStandardMaterial color="#FBBF24" metalness={0.9} roughness={0.15} />
        </mesh>

        <Billboard position={[0, 1.85, 0.4]}>
          <Text fontSize={0.18} color="#FEF08A" anchorX="center" anchorY="middle">
            🚪 [E] Masuk Rumah
          </Text>
        </Billboard>
      </group>

      {/* Welcome Doormat */}
      <group position={[0, 0.16, -5.3]}>
        <mesh receiveShadow>
          <boxGeometry args={[2.2, 0.02, 1.2]} />
          <meshStandardMaterial color="#E11D48" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.015, 0]}>
          <boxGeometry args={[2.0, 0.01, 1.0]} />
          <meshStandardMaterial color="#FFE4E6" roughness={0.9} />
        </mesh>
        <Text
          position={[0, 0.025, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.15}
          color="#9F1239"
          anchorX="center"
          anchorY="middle"
        >
          SELAMAT DATANG 🌸
        </Text>
      </group>

      {/* Front Windows */}
      {[-5.2, 5.2].map((wx, wi) => (
        <group key={wi} position={[wx, 2.1, -6.4]}>
          <mesh>
            <boxGeometry args={[2.0, 1.6, 0.1]} />
            <meshStandardMaterial color="#93C5FD" roughness={0.1} transparent opacity={0.75} />
          </mesh>
          <mesh>
            <boxGeometry args={[2.1, 0.1, 0.14]} />
            <meshStandardMaterial color="#7F4F24" />
          </mesh>
          <mesh>
            <boxGeometry args={[0.1, 1.7, 0.14]} />
            <meshStandardMaterial color="#7F4F24" />
          </mesh>
          <mesh position={[0, -0.95, 0.18]}>
            <boxGeometry args={[2.1, 0.32, 0.4]} />
            <meshStandardMaterial color="#9C6644" />
          </mesh>
          {[-0.8, -0.4, 0, 0.4, 0.8].map((fx, fi) => (
            <mesh key={fi} position={[fx, -0.72, 0.2]}>
              <sphereGeometry args={[0.13, 8, 8]} />
              <meshStandardMaterial color={fi % 2 === 0 ? '#FF006E' : '#FFBE0B'} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Exterior Side Walls & Roof */}
      <mesh position={[-8.5, 2.25, -12.0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 4.3, 11.2]} />
        <meshStandardMaterial color="#FFF1E6" roughness={0.7} />
      </mesh>
      <mesh position={[8.5, 2.25, -12.0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 4.3, 11.2]} />
        <meshStandardMaterial color="#FFF1E6" roughness={0.7} />
      </mesh>

      <mesh position={[-5.1, 2.25, -17.5]} castShadow receiveShadow>
        <boxGeometry args={[6.8, 4.3, 0.4]} />
        <meshStandardMaterial color="#FFF1E6" roughness={0.7} />
      </mesh>
      <mesh position={[5.1, 2.25, -17.5]} castShadow receiveShadow>
        <boxGeometry args={[6.8, 4.3, 0.4]} />
        <meshStandardMaterial color="#FFF1E6" roughness={0.7} />
      </mesh>
      <mesh position={[0, 3.55, -17.5]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 1.7, 0.4]} />
        <meshStandardMaterial color="#FFF1E6" roughness={0.7} />
      </mesh>

      {/* Grand Roof */}
      <mesh position={[0, 5.3, -12.0]} castShadow>
        <coneGeometry args={[12.5, 2.8, 4]} />
        <meshStandardMaterial color="#C85A32" roughness={0.55} />
      </mesh>

      {/* Back Veranda Decking */}
      <mesh position={[0, 0.15, -20.5]} receiveShadow>
        <boxGeometry args={[11.6, 0.28, 6.0]} />
        <meshStandardMaterial color="#DDB892" roughness={0.6} />
      </mesh>

      {/* Back Veranda Railings */}
      {[-5.6, 5.6].map((vx, vi) => (
        <group key={vi} position={[vx, 0.7, -20.5]}>
          <mesh castShadow>
            <boxGeometry args={[0.15, 0.85, 5.8]} />
            <meshStandardMaterial color="#7F4F24" />
          </mesh>
        </group>
      ))}

      {/* Closed Interactive Back Door */}
      <group
        position={[0, 1.35, -17.5]}
        onClick={(e) => {
          e.stopPropagation();
          gameStore.enterHouse('back');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[2.8, 2.7, 0.12]} />
          <meshStandardMaterial color="#7F4F24" roughness={0.6} />
        </mesh>
        {[-0.65, 0.65].map((gx, gi) => (
          <mesh key={gi} position={[gx, 0.15, 0.02]}>
            <boxGeometry args={[0.9, 2.1, 0.06]} />
            <meshStandardMaterial color="#93C5FD" transparent opacity={0.7} roughness={0.1} />
          </mesh>
        ))}
        <mesh position={[0, 1.55, -0.1]}>
          <boxGeometry args={[3.2, 0.45, 0.06]} />
          <meshStandardMaterial color="#0096C7" />
        </mesh>
        <Text
          position={[0, 1.55, -0.15]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.17}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
        >
          🏊‍♀️ PINTU MASUK KE RUMAH KHAULAH 🏡
        </Text>
        <Billboard position={[0, 1.9, -0.4]}>
          <Text fontSize={0.18} color="#FEF08A" anchorX="center" anchorY="middle">
            🚪 [E] Masuk Rumah
          </Text>
        </Billboard>
      </group>

      {/* Garden Pergola Archway Entry to Pool */}
      <group position={[0, 0, -23.5]}>
        <mesh position={[-2.4, 1.7, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.16, 3.4, 12]} />
          <meshStandardMaterial color="#6F4E37" />
        </mesh>
        <mesh position={[2.4, 1.7, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.16, 3.4, 12]} />
          <meshStandardMaterial color="#6F4E37" />
        </mesh>
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
        <mesh position={[-2.4, 2.4, 0]}>
          <sphereGeometry args={[0.42, 8, 8]} />
          <meshStandardMaterial color="#2D6A4F" roughness={0.6} />
        </mesh>
        <mesh position={[2.4, 2.2, 0]}>
          <sphereGeometry args={[0.38, 8, 8]} />
          <meshStandardMaterial color="#2D6A4F" roughness={0.6} />
        </mesh>
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

// ============================================================================
// 2. RUMAH KHAULAH GRAND INTERIOR (DUNIA DALAM RUMAH MEGAH & LUAS)
// DIMENSI: Lebar 36m (X: 142 to 178), Panjang 25.6m (Z: -24.8 to 0.8), Tinggi 7.6m
// ============================================================================
export const RumahKhaulahInterior: React.FC = () => {
  const isInsideHouse = useGameStore((s) => s.isInsideHouse);
  const lastNearExitRef = useRef<string | null>(null);

  useEffect(() => {
    // ------------------------------------------------------------------------
    // WALKABLE GRAND INTERIOR FLOOR (GROUND TYPE: 36m x 25.6m)
    // ------------------------------------------------------------------------
    const interiorFloorBox = new THREE.Box3(
      new THREE.Vector3(141.5, -0.5, -25.2),
      new THREE.Vector3(178.5, 0.45, 1.2)
    );
    const cInterior: PlatformCollider = { box: interiorFloorBox, type: 'ground' };
    colliders.push(cInterior);

    // ------------------------------------------------------------------------
    // SOLID WALLS ENCLOSING THE SPACIOUS VILLA (HEIGHT: 7.6m)
    // ------------------------------------------------------------------------
    const solids: SolidCollider[] = [
      // Outer Boundary Walls
      addSolidBox([141.5, 0, 0.6], [178.5, 8.0, 1.2], 'int_front_wall'),
      addSolidBox([141.5, 0, -25.2], [178.5, 8.0, -24.6], 'int_back_wall'),
      addSolidBox([141.2, 0, -25.2], [142.2, 8.0, 1.2], 'int_left_wall'),
      addSolidBox([177.8, 0, -25.2], [178.8, 8.0, 1.2], 'int_right_wall'),

      // Left Wing Partition Divider (Ruang Coding Abi vs Musholla at Z: -12.0)
      addSolidBox([142.0, 0, -12.3], [153.5, 6.0, -11.7], 'int_left_divider'),

      // Left Hallway Archway Columns
      addSolidBox([153.5, 0, -24.8], [154.2, 6.0, -18.5], 'int_left_hall_back'),
      addSolidBox([153.5, 0, -5.5], [154.2, 6.0, 0.8], 'int_left_hall_front'),

      // Right Wing Partition Divider (Dapur Ummi vs Kids Playroom at Z: -12.0)
      addSolidBox([166.5, 0, -12.3], [178.0, 6.0, -11.7], 'int_right_divider'),

      // Right Hallway Archway Columns
      addSolidBox([165.8, 0, -24.8], [166.5, 6.0, -18.5], 'int_right_hall_back'),
      addSolidBox([165.8, 0, -5.5], [166.5, 6.0, 0.8], 'int_right_hall_front'),
    ];

    return () => {
      const idx = colliders.indexOf(cInterior);
      if (idx !== -1) colliders.splice(idx, 1);
      solids.forEach((s) => removeSolidCollider(s));
    };
  }, []);

  useFrame(() => {
    if (!isInsideHouse) return;
    const playerPos = gameStore.getState().playerPos;

    // Front Exit Door zone (at [160, 0.2, 0.5])
    const distFrontExit = Math.hypot(playerPos[0] - 160, playerPos[2] - 0.0);
    // Back Exit Door zone (at [160, 0.2, -24.5])
    const distBackExit = Math.hypot(playerPos[0] - 160, playerPos[2] - (-24.0));

    if (distFrontExit < 3.0) {
      if (lastNearExitRef.current !== 'front') {
        lastNearExitRef.current = 'front';
        gameStore.setNearbyInteractable({
          id: 'interior_exit_front',
          title: 'Pintu Keluar Depan',
          prompt: 'Tekan [E] untuk Keluar ke Halaman Depan! 🌳🚪',
        });
      }
    } else if (distBackExit < 3.0) {
      if (lastNearExitRef.current !== 'back') {
        lastNearExitRef.current = 'back';
        gameStore.setNearbyInteractable({
          id: 'interior_exit_back',
          title: 'Pintu Keluar Belakang',
          prompt: 'Tekan [E] untuk Keluar ke Kolam Renang / Waterpark! 🏊‍♀️🌴',
        });
      }
    } else {
      if (lastNearExitRef.current !== null) {
        lastNearExitRef.current = null;
        const cur = gameStore.getState().nearbyInteractable;
        if (cur?.id === 'interior_exit_front' || cur?.id === 'interior_exit_back') {
          gameStore.setNearbyInteractable(null);
        }
      }
    }
  });

  return (
    <group position={[160, 0, -12]} visible={isInsideHouse}>
      {/* ============================================================== */}
      {/* 1. GRAND PARQUET FLOORING & ZONE CARPETS                       */}
      {/* ============================================================== */}
      {/* Grand Natural Oak Parquet Floor (36m wide x 25.6m deep) */}
      <mesh position={[0, 0.16, 0]} receiveShadow>
        <boxGeometry args={[36.0, 0.3, 25.6]} />
        <meshStandardMaterial color="#DDB892" roughness={0.45} />
      </mesh>

      {/* Central Living Room Plush Moroccan Pastel Rug (10m x 8m) */}
      <mesh position={[0, 0.17, 0]} receiveShadow>
        <boxGeometry args={[10.0, 0.02, 8.0]} />
        <meshStandardMaterial color="#FDE2E4" roughness={0.8} />
      </mesh>

      {/* Musholla Sanctuary Emerald Green Turkish Carpet (Wing Kiri Belakang) */}
      <mesh position={[-12.0, 0.17, -6.0]} receiveShadow>
        <boxGeometry args={[11.5, 0.02, 11.5]} />
        <meshStandardMaterial color="#1B4D3E" roughness={0.8} />
      </mesh>

      {/* Kids Wonderland Foam Puzzle Playmat (Wing Kanan Belakang) */}
      <mesh position={[12.0, 0.17, -6.0]} receiveShadow>
        <boxGeometry args={[11.5, 0.02, 11.5]} />
        <meshStandardMaterial color="#80ED99" roughness={0.8} />
      </mesh>

      {/* Gourmet Kitchen Polished Marble Tile (Wing Kanan Depan) */}
      <mesh position={[12.0, 0.17, 6.0]} receiveShadow>
        <boxGeometry args={[11.5, 0.02, 11.5]} />
        <meshStandardMaterial color="#F1F5F9" roughness={0.25} metalness={0.1} />
      </mesh>

      {/* Abi Coding Studio Rich Timber Floor (Wing Kiri Depan) */}
      <mesh position={[-12.0, 0.17, 6.0]} receiveShadow>
        <boxGeometry args={[11.5, 0.02, 11.5]} />
        <meshStandardMaterial color="#B08968" roughness={0.5} />
      </mesh>

      {/* ============================================================== */}
      {/* 2. GRAND ENCLOSING WALLS & HIGH CATHEDRAL CEILING (7.6m TALL)   */}
      {/* ============================================================== */}
      {/* Front Enclosing Wall (Z: +12.8) */}
      <mesh position={[-9.5, 3.8, 12.8]} receiveShadow>
        <boxGeometry args={[17.0, 7.6, 0.35]} />
        <meshStandardMaterial color="#FFF5EB" roughness={0.7} />
      </mesh>
      <mesh position={[9.5, 3.8, 12.8]} receiveShadow>
        <boxGeometry args={[17.0, 7.6, 0.35]} />
        <meshStandardMaterial color="#FFF5EB" roughness={0.7} />
      </mesh>
      <mesh position={[0, 5.8, 12.8]} receiveShadow>
        <boxGeometry args={[4.0, 3.6, 0.35]} />
        <meshStandardMaterial color="#FFF5EB" roughness={0.7} />
      </mesh>

      {/* Back Enclosing Wall (Z: -12.8) */}
      <mesh position={[-9.5, 3.8, -12.8]} receiveShadow>
        <boxGeometry args={[17.0, 7.6, 0.35]} />
        <meshStandardMaterial color="#FFF5EB" roughness={0.7} />
      </mesh>
      <mesh position={[9.5, 3.8, -12.8]} receiveShadow>
        <boxGeometry args={[17.0, 7.6, 0.35]} />
        <meshStandardMaterial color="#FFF5EB" roughness={0.7} />
      </mesh>
      <mesh position={[0, 5.8, -12.8]} receiveShadow>
        <boxGeometry args={[4.0, 3.6, 0.35]} />
        <meshStandardMaterial color="#FFF5EB" roughness={0.7} />
      </mesh>

      {/* Left Wall (X: -18.0) */}
      <mesh position={[-18.0, 3.8, 0]} receiveShadow>
        <boxGeometry args={[0.35, 7.6, 25.6]} />
        <meshStandardMaterial color="#FFF5EB" roughness={0.7} />
      </mesh>

      {/* Right Wall (X: +18.0) */}
      <mesh position={[18.0, 3.8, 0]} receiveShadow>
        <boxGeometry args={[0.35, 7.6, 25.6]} />
        <meshStandardMaterial color="#FFF5EB" roughness={0.7} />
      </mesh>

      {/* Grand High Ceiling (Y: 7.6m) with DoubleSide to ensure pure warmth */}
      <mesh position={[0, 7.6, 0]} receiveShadow>
        <boxGeometry args={[36.4, 0.25, 26.0]} />
        <meshStandardMaterial color="#FAF5EF" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Decorative Crown Molding Beams across the Ceiling */}
      {[-12, -6, 0, 6, 12].map((bx, bi) => (
        <mesh key={`beam-${bi}`} position={[bx, 7.45, 0]}>
          <boxGeometry args={[0.4, 0.3, 25.8]} />
          <meshStandardMaterial color="#E9D8A6" roughness={0.6} />
        </mesh>
      ))}

      {/* ============================================================== */}
      {/* 3. GRAND ARCHWAYS & ROOM PARTITION WALLS                       */}
      {/* ============================================================== */}
      {/* Left Wing Dividing Wall (Ruang Coding Abi vs Musholla at Z: 0) */}
      <mesh position={[-12.0, 3.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[11.5, 7.6, 0.3]} />
        <meshStandardMaterial color="#FFE8D6" roughness={0.7} />
      </mesh>

      {/* Right Wing Dividing Wall (Dapur Ummi vs Kids Wonderland at Z: 0) */}
      <mesh position={[12.0, 3.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[11.5, 7.6, 0.3]} />
        <meshStandardMaterial color="#FFE8D6" roughness={0.7} />
      </mesh>

      {/* Left Grand Hallway Archway Columns & Header (X: -6.0) */}
      <mesh position={[-6.0, 3.8, 9.5]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 7.6, 6.2]} />
        <meshStandardMaterial color="#FFE8D6" roughness={0.7} />
      </mesh>
      <mesh position={[-6.0, 3.8, -9.5]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 7.6, 6.2]} />
        <meshStandardMaterial color="#FFE8D6" roughness={0.7} />
      </mesh>
      <mesh position={[-6.0, 6.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 2.6, 12.8]} />
        <meshStandardMaterial color="#FFE8D6" roughness={0.7} />
      </mesh>

      {/* Right Grand Hallway Archway Columns & Header (X: +6.0) */}
      <mesh position={[6.0, 3.8, 9.5]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 7.6, 6.2]} />
        <meshStandardMaterial color="#FFE8D6" roughness={0.7} />
      </mesh>
      <mesh position={[6.0, 3.8, -9.5]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 7.6, 6.2]} />
        <meshStandardMaterial color="#FFE8D6" roughness={0.7} />
      </mesh>
      <mesh position={[6.0, 6.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 2.6, 12.8]} />
        <meshStandardMaterial color="#FFE8D6" roughness={0.7} />
      </mesh>

      {/* ============================================================== */}
      {/* 4. INTERIOR EXIT DOORS                                         */}
      {/* ============================================================== */}
      {/* --- FRONT EXIT DOOR (KELUAR KE HALAMAN DEPAN) --- */}
      <group
        position={[0, 2.0, 12.65]}
        onClick={(e) => {
          e.stopPropagation();
          gameStore.exitHouse('front');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[3.2, 3.8, 0.12]} />
          <meshStandardMaterial color="#854D0E" roughness={0.4} />
        </mesh>
        {/* Golden Door Handles */}
        <mesh position={[-0.2, 0, -0.08]}>
          <cylinderGeometry args={[0.04, 0.04, 0.35, 12]} />
          <meshStandardMaterial color="#FBBF24" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[0.2, 0, -0.08]}>
          <cylinderGeometry args={[0.04, 0.04, 0.35, 12]} />
          <meshStandardMaterial color="#FBBF24" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Plaque above exit door */}
        <mesh position={[0, 2.2, -0.1]}>
          <boxGeometry args={[3.6, 0.55, 0.06]} />
          <meshStandardMaterial color="#1E3A8A" />
        </mesh>
        <Text position={[0, 2.2, -0.15]} fontSize={0.2} color="#FFFFFF" anchorX="center" anchorY="middle">
          🌳 KELUAR KE HALAMAN DEPAN 🚪
        </Text>
        <Billboard position={[0, 2.8, -0.4]}>
          <Text fontSize={0.22} color="#FEF08A" anchorX="center" anchorY="middle">
            🚪 [E] Keluar ke Halaman
          </Text>
        </Billboard>
      </group>

      {/* Front Entrance Welcome Mat inside */}
      <mesh position={[0, 0.165, 11.2]}>
        <boxGeometry args={[3.0, 0.015, 1.4]} />
        <meshStandardMaterial color="#FED7AA" roughness={0.8} />
      </mesh>

      {/* --- BACK EXIT DOOR (KELUAR KE WATERPARK & KOLAM RENANG) --- */}
      <group
        position={[0, 2.0, -12.65]}
        onClick={(e) => {
          e.stopPropagation();
          gameStore.exitHouse('back');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[3.2, 3.8, 0.12]} />
          <meshStandardMaterial color="#7F4F24" roughness={0.5} />
        </mesh>
        {[-0.8, 0.8].map((gx, gi) => (
          <mesh key={gi} position={[gx, 0.2, 0.02]}>
            <boxGeometry args={[1.2, 3.0, 0.05]} />
            <meshStandardMaterial color="#67E8F9" transparent opacity={0.75} roughness={0.1} />
          </mesh>
        ))}
        <mesh position={[0, 2.2, 0.1]}>
          <boxGeometry args={[3.8, 0.55, 0.06]} />
          <meshStandardMaterial color="#0284C7" />
        </mesh>
        <Text position={[0, 2.2, 0.15]} fontSize={0.2} color="#FFFFFF" anchorX="center" anchorY="middle">
          🏊‍♀️ KELUAR KE KOLAM RENANG & WATERPARK 🌴
        </Text>
        <Billboard position={[0, 2.8, 0.4]}>
          <Text fontSize={0.22} color="#FEF08A" anchorX="center" anchorY="middle">
            🏊‍♀️ [E] Menuju Kolam Renang
          </Text>
        </Billboard>
      </group>

      {/* ============================================================== */}
      {/* 5. LUXURY FURNISHINGS & ROOM EQUIPMENT                         */}
      {/* ============================================================== */}
      {/* --- 5.1 GRAND CENTRAL LIVING ROOM & FOYER --- */}
      <group position={[0, 0.2, 0]}>
        {/* Large Velvet L-Shaped Sectional Sofa */}
        <group position={[-2.5, 0, 0]}>
          <mesh position={[0, 0.35, 0]} castShadow>
            <boxGeometry args={[3.8, 0.55, 1.6]} />
            <meshStandardMaterial color="#E9D8A6" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.9, -0.65]} castShadow>
            <boxGeometry args={[3.8, 0.75, 0.35]} />
            <meshStandardMaterial color="#DDA15E" roughness={0.8} />
          </mesh>
          {/* Side Chaise */}
          <mesh position={[-1.4, 0.35, 1.2]} castShadow>
            <boxGeometry args={[1.0, 0.55, 1.4]} />
            <meshStandardMaterial color="#E9D8A6" roughness={0.8} />
          </mesh>
          {/* Throw Pillows */}
          {[-1.2, 0, 1.2].map((px, pi) => (
            <mesh key={pi} position={[px, 0.7, -0.3]} rotation={[0.2, 0.2, 0]}>
              <boxGeometry args={[0.5, 0.5, 0.2]} />
              <meshStandardMaterial color={['#FFB5A7', '#F4ACB7', '#9A8C98'][pi]} />
            </mesh>
          ))}
        </group>

        {/* Large Marble Coffee Table */}
        <group position={[0.8, 0, 0]}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[2.2, 0.12, 1.4]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.1} />
          </mesh>
          {[-0.9, 0.9].map((tx, ti) =>
            [-0.5, 0.5].map((tz, zi) => (
              <mesh key={`${ti}-${zi}`} position={[tx, 0.14, tz]}>
                <cylinderGeometry args={[0.04, 0.04, 0.28, 8]} />
                <meshStandardMaterial color="#7F4F24" />
              </mesh>
            ))
          )}
          {/* Crystal Flower Vase & Roses */}
          <mesh position={[0, 0.48, 0]}>
            <cylinderGeometry args={[0.12, 0.09, 0.25, 12]} />
            <meshStandardMaterial color="#E0F2FE" transparent opacity={0.8} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.65, 0]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#FF006E" />
          </mesh>
        </group>

        {/* Grand Hanging Crystal Chandelier */}
        <group position={[0, 5.8, 0]}>
          <mesh>
            <cylinderGeometry args={[0.6, 1.4, 0.6, 16]} />
            <meshStandardMaterial color="#FBBF24" metalness={0.8} roughness={0.2} />
          </mesh>
          <pointLight color="#FFFBEB" intensity={1.5} distance={24} />
        </group>
      </group>

      {/* --- 5.2 EXECUTIVE CODING STUDIO ABI (WING KIRI DEPAN: X: -12, Z: 6) --- */}
      <group position={[-12.0, 0.2, 6.0]}>
        {/* Full-Wall Library Bookshelves */}
        <group position={[-5.4, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh position={[0, 3.2, 0]} castShadow>
            <boxGeometry args={[7.2, 6.0, 0.4]} />
            <meshStandardMaterial color="#582F0E" roughness={0.6} />
          </mesh>
          {/* Books on Shelves */}
          {[-2.4, -1.2, 0, 1.2, 2.4].map((sy, si) =>
            [-2.8, -2.0, -1.2, -0.4, 0.4, 1.2, 2.0, 2.8].map((sx, xi) => (
              <mesh key={`b-${si}-${xi}`} position={[sx, 1.2 + si * 1.0, 0.05]}>
                <boxGeometry args={[0.18, 0.65, 0.35]} />
                <meshStandardMaterial color={['#2B2D42', '#3D5A80', '#E07A5F', '#81B29A', '#F2CC8F', '#4A4E69'][(si + xi) % 6]} />
              </mesh>
            ))
          )}
        </group>

        {/* Executive Programmer Desk & Chair */}
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.6, 0.1, 1.2]} />
            <meshStandardMaterial color="#7F4F24" roughness={0.4} />
          </mesh>
          {/* Desk Legs */}
          {[-1.15, 1.15].map((dx, di) =>
            [-0.45, 0.45].map((dz, zi) => (
              <mesh key={`dleg-${di}-${zi}`} position={[dx, 0.4, dz]} castShadow>
                <cylinderGeometry args={[0.04, 0.04, 0.78, 8]} />
                <meshStandardMaterial color="#1E293B" />
              </mesh>
            ))
          )}
          {/* Dual Wide Curved Monitors */}
          <group position={[0, 0.86, -0.2]}>
            <mesh position={[-0.65, 0.35, 0]} rotation={[0, 0.15, 0]}>
              <boxGeometry args={[1.0, 0.55, 0.05]} />
              <meshStandardMaterial color="#0F172A" />
            </mesh>
            <mesh position={[0.65, 0.35, 0]} rotation={[0, -0.15, 0]}>
              <boxGeometry args={[1.0, 0.55, 0.05]} />
              <meshStandardMaterial color="#0F172A" />
            </mesh>
            {/* Glowing Screen Code Displays */}
            <mesh position={[-0.65, 0.35, 0.03]} rotation={[0, 0.15, 0]}>
              <boxGeometry args={[0.94, 0.49, 0.01]} />
              <meshStandardMaterial color="#38BDF8" emissive="#0284C7" emissiveIntensity={0.6} />
            </mesh>
            <mesh position={[0.65, 0.35, 0.03]} rotation={[0, -0.15, 0]}>
              <boxGeometry args={[0.94, 0.49, 0.01]} />
              <meshStandardMaterial color="#A7F3D0" emissive="#059669" emissiveIntensity={0.5} />
            </mesh>
          </group>
        </group>

        {/* Motivational Frame: CODING WITH LOVE FOR KELUARGA */}
        <mesh position={[0, 4.2, 5.8]}>
          <boxGeometry args={[3.2, 1.2, 0.06]} />
          <meshStandardMaterial color="#582F0E" />
        </mesh>
        <Text
          position={[0, 4.2, 5.75]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.22}
          color="#FEF08A"
          anchorX="center"
          anchorY="middle"
        >
          💻 CODING WITH LOVE FOR KELUARGA ❤️
        </Text>

        <pointLight position={[0, 4.5, 0]} color="#FEF08A" intensity={1.2} distance={14} />
      </group>

      {/* --- 5.3 FAMILY PRAYER SANCTUARY / MUSHOLLA (WING KIRI BELAKANG: X: -12, Z: -6) --- */}
      <group position={[-12.0, 0.2, -6.0]}>
        {/* Large Wooden Quran Stand (Rehal) & Mushaf */}
        <group position={[0, 0.2, -4.5]}>
          <mesh castShadow>
            <boxGeometry args={[1.0, 0.35, 0.8]} />
            <meshStandardMaterial color="#7F4F24" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.26, 0]} rotation={[-0.2, 0, 0]}>
            <boxGeometry args={[0.85, 0.1, 0.65]} />
            <meshStandardMaterial color="#FFFBEB" />
          </mesh>
        </group>

        {/* Large Wall Calligraphy Frame: BISMILLAHIRRAHMANIRRAHIM */}
        <mesh position={[0, 4.2, -5.8]}>
          <boxGeometry args={[3.8, 1.4, 0.06]} />
          <meshStandardMaterial color="#1B4332" />
        </mesh>
        <Text
          position={[0, 4.2, -5.75]}
          fontSize={0.32}
          color="#FFD700"
          anchorX="center"
          anchorY="middle"
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </Text>

        {/* Peaceful Celestial Dawn Light */}
        <pointLight position={[0, 4.8, 0]} color="#BAE6FD" intensity={1.3} distance={16} />
      </group>

      {/* --- 5.4 GOURMET KITCHEN & DINING UMMI (WING KANAN DEPAN: X: 12, Z: 6) --- */}
      <group position={[12.0, 0.2, 6.0]}>
        {/* Grand Marble Kitchen Island & Breakfast Bar */}
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[5.2, 1.0, 1.6]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.2} metalness={0.1} />
          </mesh>
          <mesh position={[0, 1.02, 0]} castShadow>
            <boxGeometry args={[5.4, 0.08, 1.7]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.1} />
          </mesh>
          {/* Ceramic Tiered Dessert Stand with Cupcakes & Fruit Bowl */}
          <mesh position={[1.4, 1.2, 0]}>
            <sphereGeometry args={[0.3, 14, 14]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          {[-0.1, 0.1].map((fx, fi) => (
            <mesh key={fi} position={[1.4 + fx, 1.35, 0]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color={fi === 0 ? '#E63946' : '#FFB703'} />
            </mesh>
          ))}
          {/* Kitchen Stools */}
          {[-1.6, -0.6, 0.6, 1.6].map((sx, si) => (
            <group key={si} position={[sx, 0, 1.3]}>
              <mesh position={[0, 0.45, 0]}>
                <cylinderGeometry args={[0.22, 0.22, 0.08, 16]} />
                <meshStandardMaterial color="#7F4F24" />
              </mesh>
              <mesh position={[0, 0.22, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 0.44, 8]} />
                <meshStandardMaterial color="#0F172A" />
              </mesh>
            </group>
          ))}
        </group>

        <pointLight position={[0, 4.5, 0]} color="#FEF9C3" intensity={1.3} distance={14} />
      </group>

      {/* --- 5.5 KIDS WONDERLAND PLAYROOM & BEDROOM (WING KANAN BELAKANG: X: 12, Z: -6) --- */}
      <group position={[12.0, 0.2, -6.0]}>
        {/* Colorful Toy Chest Organizer */}
        <group position={[-3.2, 0, 2.5]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[2.0, 0.9, 1.0]} />
            <meshStandardMaterial color="#FFB703" roughness={0.5} />
          </mesh>
          {[-0.6, -0.2, 0.2, 0.6].map((bx, bi) => (
            <mesh key={bi} position={[bx, 0.95, (bi % 2 === 0 ? 0.15 : -0.15)]} castShadow>
              <boxGeometry args={[0.25, 0.25, 0.25]} />
              <meshStandardMaterial color={['#EF476F', '#06D6A0', '#118AB2', '#8338EC'][bi]} />
            </mesh>
          ))}
        </group>

        {/* Playroom Gentle Rainbow Light */}
        <pointLight position={[0, 4.5, 0]} color="#FEF3C7" intensity={1.3} distance={14} />
      </group>
    </group>
  );
};

// ============================================================================
// COMBINED COMPONENT EXPORT
// ============================================================================
export const RumahKhaulah: React.FC = () => {
  return (
    <>
      <RumahKhaulahExterior />
      <RumahKhaulahInterior />
    </>
  );
};
