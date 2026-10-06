import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, gameStore } from '../../../state/useGameStore';
import { soundManager } from '../../../sound/audioManager';
import { colliders, addSolidBox, addSolidCylinder, removeSolidCollider, SolidCollider } from '../../../state/colliders';
import { waterSlideCurve, getWaterSlidePose } from './waterSlideTrajectory';

// ==============================================================
// 1. ANIMATED SPARKLING POOL WATER & BASIN (EXPANDED & CENTERED)
// ==============================================================
// Pool is centered at [0, 0, -31], 16m wide (X: -8 to +8) and 12m long (Z: -37 to -25)
const AnimatedPoolWater: React.FC = () => {
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!waterRef.current) return;
    const t = state.clock.getElapsedTime();
    waterRef.current.position.y = 0.28 + Math.sin(t * 2.2) * 0.012;
  });

  return (
    <group position={[0, 0, -31]}>
      {/* Pool Basin Floor - Azure Mosaic Tiles */}
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[16.2, 0.08, 12.2]} />
        <meshStandardMaterial color="#48CAE4" roughness={0.25} />
      </mesh>

      {/* Decorative Mosaic Star Emblem at bottom of pool */}
      <mesh position={[0, 0.085, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 2.2, 8]} />
        <meshStandardMaterial color="#0077B6" roughness={0.3} />
      </mesh>

      {/* Pool Basin Mosaic Interior Walls */}
      <mesh position={[0, 0.18, 6.0]}>
        <boxGeometry args={[16.2, 0.28, 0.2]} />
        <meshStandardMaterial color="#0096C7" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.18, -6.0]}>
        <boxGeometry args={[16.2, 0.28, 0.2]} />
        <meshStandardMaterial color="#0096C7" roughness={0.3} />
      </mesh>
      <mesh position={[8.0, 0.18, 0]}>
        <boxGeometry args={[0.2, 0.28, 12.0]} />
        <meshStandardMaterial color="#0096C7" roughness={0.3} />
      </mesh>
      <mesh position={[-8.0, 0.18, 0]}>
        <boxGeometry args={[0.2, 0.28, 12.0]} />
        <meshStandardMaterial color="#0096C7" roughness={0.3} />
      </mesh>

      {/* Crystal Clear Swimming Pool Water Surface */}
      <mesh ref={waterRef} position={[0, 0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15.8, 11.8]} />
        <meshStandardMaterial
          color="#00B4D8"
          emissive="#0077B6"
          emissiveIntensity={0.32}
          roughness={0.04}
          metalness={0.0}
          transparent
          opacity={0.86}
        />
      </mesh>

      {/* Stainless Steel Curved Pool Handrails at Entrance Steps */}
      {[-1.4, 1.4].map((hx, idx) => (
        <group key={idx} position={[hx, 0.55, 5.7]}>
          {/* Vertical Posts */}
          {[-0.2, 0.2].map((pz, pi) => (
            <mesh key={pi} position={[0, 0, pz]} castShadow>
              <cylinderGeometry args={[0.025, 0.025, 0.75, 12]} />
              <meshStandardMaterial color="#CED4DA" metalness={0.9} roughness={0.1} />
            </mesh>
          ))}
          {/* Arched Top Grip */}
          <mesh position={[0, 0.38, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.42, 12]} />
            <meshStandardMaterial color="#CED4DA" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Built-in Shallow Entrance Steps */}
      {[0.20, 0.12, 0.06].map((sy, idx) => (
        <mesh key={idx} position={[0, sy, 5.2 - idx * 0.5]}>
          <boxGeometry args={[3.6, 0.08, 0.5]} />
          <meshStandardMaterial color="#90E0EF" roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
};

// ==============================================================
// 2. CUTE WATER MUSHROOM FOUNTAIN
// ==============================================================
const WaterMushroomFountain: React.FC = () => {
  const dropletsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!dropletsRef.current) return;
    const t = state.clock.getElapsedTime();
    dropletsRef.current.children.forEach((child, i) => {
      const drop = child as THREE.Mesh;
      const progress = (t * 2.5 + i * 0.2) % 1;
      drop.position.y = 1.3 - progress * 1.1;
      const mat = drop.material as THREE.MeshStandardMaterial;
      if (mat) mat.opacity = 1 - progress * 0.6;
    });
  });

  return (
    <group position={[-3.0, 0.28, -34.5]}>
      {/* Mushroom Fountain Stem */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 1.5, 12]} />
        <meshStandardMaterial color="#E0FBFC" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Yellow Mushroom Cap */}
      <mesh position={[0, 1.55, 0]} castShadow>
        <sphereGeometry args={[0.85, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#FFB703" roughness={0.3} />
      </mesh>
      {/* White Dots on Cap */}
      {[-0.35, 0.35].map((dx, idx) => (
        <mesh key={idx} position={[dx, 1.65, 0.2]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#FFF" />
        </mesh>
      ))}

      {/* Animated Cascading Water Droplets */}
      <group ref={dropletsRef}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
          const ang = (idx * Math.PI * 2) / 8;
          const r = 0.82;
          return (
            <mesh key={idx} position={[Math.cos(ang) * r, 1.3, Math.sin(ang) * r]}>
              <sphereGeometry args={[0.04, 6, 6]} />
              <meshStandardMaterial color="#48CAE4" transparent opacity={0.8} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};

// ==============================================================
// 3. GRAND LUXURY WATERPARK SLIDE (SELUNCURAN ISTANA AIR CERIA)
// ==============================================================
// Free of old artifacts, zero mini ramps, clean continuous tubular swoop!
const GrandWaterparkSlide: React.FC = () => {
  const waterFlowRef = useRef<THREE.Group>(null);
  const sprayMistRef = useRef<THREE.Group>(null);

  // Generate smooth discrete stations along the slide trajectory
  const { segments, supportPylons } = useMemo(() => {
    const NUM_STATIONS = 36;
    const segs = [];

    for (let i = 0; i < NUM_STATIONS; i++) {
      const t1 = i / NUM_STATIONS;
      const t2 = (i + 1) / NUM_STATIONS;
      const p1 = waterSlideCurve.getPoint(t1);
      const p2 = waterSlideCurve.getPoint(t2);

      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const dir = new THREE.Vector3().subVectors(p2, p1);
      const len = dir.length();
      dir.normalize();

      // Heading and pitch
      const yaw = Math.atan2(dir.x, dir.z);
      const pitch = -Math.asin(dir.y);
      const bank = Math.sin(t1 * Math.PI) * -0.24;

      segs.push({
        mid,
        len,
        yaw,
        pitch,
        bank,
        t: t1,
      });
    }

    // Support pylons along the slide chute down to ground/deck
    const pylons = [
      { pylonX: 7.2, pylonZ: -34.4, deckTopY: 3.1, groundY: 0.36 },
      { pylonX: 5.8, pylonZ: -32.4, deckTopY: 2.0, groundY: 0.36 },
      { pylonX: 4.2, pylonZ: -30.4, deckTopY: 0.9, groundY: 0.36 },
    ];

    return { segments: segs, supportPylons: pylons };
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Animated water flow ripples streaming down the slide chute
    if (waterFlowRef.current) {
      waterFlowRef.current.children.forEach((child, idx) => {
        const mesh = child as THREE.Mesh;
        const offset = Math.sin(time * 8.0 - idx * 0.35) * 0.015;
        mesh.position.y = offset;
      });
    }

    // Animated splash mist at the bottom landing scoop
    if (sprayMistRef.current) {
      sprayMistRef.current.children.forEach((child, idx) => {
        const drop = child as THREE.Mesh;
        const cycle = (time * 3.5 + idx * 0.25) % 1;
        drop.position.y = 0.32 + Math.sin(cycle * Math.PI) * 0.55;
        drop.scale.setScalar(0.6 + cycle * 0.6);
        const mat = drop.material as THREE.MeshStandardMaterial;
        if (mat) mat.opacity = 1 - cycle;
      });
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* -------------------------------------------------------- */}
      {/* A. TOWER STRUCTURE (At X: 8.5, Z: -37.0)                 */}
      {/* -------------------------------------------------------- */}
      <group position={[8.5, 0, -37.0]}>
        {/* 4 Robust Cobalt Blue Support Pillars */}
        {[-1.15, 1.15].map((px) =>
          [-1.15, 1.15].map((pz, idx) => (
            <React.Fragment key={`${px}-${pz}-${idx}`}>
              <mesh position={[px, 2.0, pz]} castShadow>
                <cylinderGeometry args={[0.12, 0.14, 4.0, 12]} />
                <meshStandardMaterial color="#0077B6" roughness={0.3} />
              </mesh>
              {/* Foundation Footing */}
              <mesh position={[px, 0.1, pz]} receiveShadow>
                <cylinderGeometry args={[0.22, 0.26, 0.2, 10]} />
                <meshStandardMaterial color="#CBD5E1" roughness={0.8} />
              </mesh>
            </React.Fragment>
          ))
        )}

        {/* Diagonal Rigidity Cross Bracing */}
        {[-1.15, 1.15].map((px, idx) => (
          <mesh key={idx} position={[px, 2.0, 0]} rotation={[0.5, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 3.2, 8]} />
            <meshStandardMaterial color="#48CAE4" />
          </mesh>
        ))}

        {/* Observation Deck Floor (Y: 4.0, Honey Teak Planks) */}
        <mesh position={[0, 4.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 0.16, 2.5]} />
          <meshStandardMaterial color="#F4A261" roughness={0.5} />
        </mesh>
        <mesh position={[0, 3.94, 0]}>
          <boxGeometry args={[2.6, 0.08, 2.6]} />
          <meshStandardMaterial color="#E76F51" />
        </mesh>

        {/* Platform Safety Railings (East & South Walls) */}
        <mesh position={[1.2, 4.55, 0]}>
          <boxGeometry args={[0.08, 0.95, 2.4]} />
          <meshStandardMaterial color="#E76F51" />
        </mesh>
        <mesh position={[0, 4.55, -1.2]}>
          <boxGeometry args={[2.4, 0.95, 0.08]} />
          <meshStandardMaterial color="#E76F51" />
        </mesh>
        <mesh position={[-1.2, 4.55, -0.6]}>
          <boxGeometry args={[0.08, 0.95, 1.2]} />
          <meshStandardMaterial color="#E76F51" />
        </mesh>

        {/* Castle Conical Pavilion Canopy Roof */}
        <group position={[0, 5.0, 0]}>
          {[-1.15, 1.15].map((px) =>
            [-1.15, 1.15].map((pz, idx) => (
              <mesh key={`canopy-pole-${px}-${pz}-${idx}`} position={[px, 0.6, pz]}>
                <cylinderGeometry args={[0.06, 0.06, 1.2, 8]} />
                <meshStandardMaterial color="#FFB703" />
              </mesh>
            ))
          )}
          <mesh position={[0, 1.65, 0]} castShadow>
            <coneGeometry args={[2.2, 1.4, 8]} />
            <meshStandardMaterial color="#E63946" roughness={0.4} />
          </mesh>
          <mesh position={[0, 2.45, 0]}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.3, 2.65, 0]} rotation={[0, 0, -0.2]}>
            <boxGeometry args={[0.55, 0.3, 0.02]} />
            <meshStandardMaterial color="#FFBE0B" />
          </mesh>
        </group>

        {/* Rear Staircase (North side: Z from -3.5 to -0.8) */}
        {[-0.6, 0.6].map((sx, idx) => (
          <mesh key={idx} position={[sx, 2.0, -2.1]} rotation={[0.82, 0, 0]}>
            <boxGeometry args={[0.08, 0.15, 4.8]} />
            <meshStandardMaterial color="#3A86FF" />
          </mesh>
        ))}

        {/* Solid Stair Steps */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((stepIdx) => {
          const progress = (stepIdx + 1) / 10;
          const stepY = 0.2 + progress * 3.75;
          const stepZ = -3.5 + progress * 2.3;
          return (
            <group key={stepIdx} position={[0, stepY, stepZ]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[1.15, 0.08, 0.34]} />
                <meshStandardMaterial color="#FB5607" roughness={0.6} />
              </mesh>
              <mesh position={[0, -0.18, 0.15]}>
                <boxGeometry args={[1.15, 0.28, 0.04]} />
                <meshStandardMaterial color="#3A86FF" />
              </mesh>
            </group>
          );
        })}

        {/* Staircase Safety Handrails */}
        {[-0.65, 0.65].map((sx, idx) => (
          <mesh key={idx} position={[sx, 2.7, -2.1]} rotation={[0.82, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 5.0, 10]} />
            <meshStandardMaterial color="#FFBE0B" roughness={0.3} metalness={0.5} />
          </mesh>
        ))}

        {/* Decorative Plaque Banner atop Slide Platform */}
        <group position={[-1.1, 4.9, 0.5]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh>
            <boxGeometry args={[2.0, 0.48, 0.06]} />
            <meshStandardMaterial color="#0096C7" />
          </mesh>
          <Billboard position={[0, 0, 0.04]}>
            <Text fontSize={0.17} color="#FFFFFF" outlineWidth={0.02} outlineColor="#0077B6" anchorY="middle">
              🛝 ISTANA AIR CERIA 🌊
            </Text>
          </Billboard>
        </group>
      </group>

      {/* -------------------------------------------------------- */}
      {/* B. SLIDE LAUNCH TUB & WATER SPRAY ARCH (At X: 8.0, Z: -36.0) */}
      {/* -------------------------------------------------------- */}
      <group position={[8.0, 4.0, -36.0]}>
        {/* Launch Tub Basin Bed */}
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[1.35, 0.12, 1.2]} />
          <meshStandardMaterial color="#00F5D4" roughness={0.2} metalness={0.1} />
        </mesh>
        {/* Safety Side Walls */}
        <mesh position={[-0.7, 0.35, 0]}>
          <boxGeometry args={[0.1, 0.6, 1.2]} />
          <meshStandardMaterial color="#FF007F" />
        </mesh>
        <mesh position={[0.7, 0.35, 0]}>
          <boxGeometry args={[0.1, 0.6, 1.2]} />
          <meshStandardMaterial color="#FFBE0B" />
        </mesh>

        {/* Water Spray Arch */}
        <group position={[0, 0.8, -0.2]}>
          <mesh>
            <torusGeometry args={[0.72, 0.06, 12, 24, Math.PI]} />
            <meshStandardMaterial color="#00B4D8" metalness={0.8} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.06, 0.03, 0.15, 8]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
        </group>
      </group>

      {/* -------------------------------------------------------- */}
      {/* C. CURVED CONTINUOUS SLIDE CHUTE FLUME                    */}
      {/* -------------------------------------------------------- */}
      <group>
        {segments.map((seg, idx) => (
          <group
            key={`slide-seg-${idx}`}
            position={[seg.mid.x, seg.mid.y, seg.mid.z]}
            rotation={[seg.pitch, seg.yaw, seg.bank]}
          >
            {/* 1. Glossy Turquoise Slide Chute Bed */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.3, 0.1, seg.len * 1.05]} />
              <meshStandardMaterial color="#00F5D4" roughness={0.18} metalness={0.15} />
            </mesh>

            {/* 2. Left High Safety Tubular Rail (Candy Magenta) */}
            <mesh position={[-0.66, 0.25, 0]} castShadow>
              <boxGeometry args={[0.12, 0.44, seg.len * 1.05]} />
              <meshStandardMaterial color="#FF007F" roughness={0.25} />
            </mesh>
            <mesh position={[-0.66, 0.47, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, seg.len * 1.05, 8]} />
              <meshStandardMaterial color="#FF007F" roughness={0.25} />
            </mesh>

            {/* 3. Right High Safety Tubular Rail (Sunshine Yellow) */}
            <mesh position={[0.66, 0.25, 0]} castShadow>
              <boxGeometry args={[0.12, 0.44, seg.len * 1.05]} />
              <meshStandardMaterial color="#FFBE0B" roughness={0.25} />
            </mesh>
            <mesh position={[0.66, 0.47, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, seg.len * 1.05, 8]} />
              <meshStandardMaterial color="#FFBE0B" roughness={0.25} />
            </mesh>
          </group>
        ))}

        {/* Animated Water Stream Flowing Down the Slide Bed */}
        <group ref={waterFlowRef}>
          {segments.map((seg, idx) => (
            <group
              key={`slide-water-${idx}`}
              position={[seg.mid.x, seg.mid.y + 0.06, seg.mid.z]}
              rotation={[seg.pitch, seg.yaw, seg.bank]}
            >
              <mesh>
                <boxGeometry args={[1.1, 0.02, seg.len * 1.02]} />
                <meshStandardMaterial
                  color="#48CAE4"
                  emissive="#0096C7"
                  emissiveIntensity={0.3}
                  roughness={0.05}
                  transparent
                  opacity={0.82}
                />
              </mesh>
            </group>
          ))}
        </group>

        {/* Clean Tubular Support Pylons Anchoring Slide */}
        {supportPylons.map((pylon, idx) => {
          const height = Math.max(0.4, pylon.deckTopY - pylon.groundY);
          const midY = pylon.groundY + height / 2;
          return (
            <group key={`pylon-${idx}`} position={[pylon.pylonX, midY, pylon.pylonZ]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.1, 0.1, height, 10]} />
                <meshStandardMaterial color="#FFB703" roughness={0.3} metalness={0.4} />
              </mesh>
              <mesh position={[0, -height / 2 + 0.06, 0]} receiveShadow>
                <cylinderGeometry args={[0.24, 0.26, 0.12, 10]} />
                <meshStandardMaterial color="#CBD5E1" roughness={0.7} />
              </mesh>
              <mesh position={[0, height / 2 - 0.04, 0]}>
                <boxGeometry args={[1.35, 0.08, 0.25]} />
                <meshStandardMaterial color="#3A86FF" />
              </mesh>
            </group>
          );
        })}

        {/* Splash Apron Scoop entering the Pool Water (At X: 2.2, Z: -28.6) */}
        <group position={[2.2, 0.32, -28.6]} rotation={[-0.08, 0.72, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.4, 0.08, 0.9]} />
            <meshStandardMaterial color="#00F5D4" roughness={0.15} />
          </mesh>
          <mesh position={[0, -0.02, 0.45]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 1.4, 12]} />
            <meshStandardMaterial color="#00F5D4" />
          </mesh>
        </group>

        {/* Animated Water Mist & Splash Spray at Pool Landing Zone */}
        <group ref={sprayMistRef} position={[2.2, 0.3, -28.6]}>
          {[
            [-0.3, 0, 0.3],
            [0.3, 0, 0.3],
            [0, 0, 0.5],
            [-0.45, 0, 0.1],
            [0.45, 0, 0.1],
          ].map((sp, idx) => (
            <mesh key={`splash-drop-${idx}`} position={sp as [number, number, number]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color="#E0FBFC" transparent opacity={0.8} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};

// ==============================================================
// 4. INTERACTIVE SPRINGBOARD DIVING BOARD (PAPAN LONCAT INDAH)
// ==============================================================
const InteractiveDivingBoard: React.FC = () => {
  return (
    <group position={[5.0, 0.36, -24.8]}>
      {/* Chrome Fulcrum Base Stand on North Deck */}
      <mesh position={[0, 0.15, 0.4]} castShadow>
        <boxGeometry args={[0.8, 0.3, 0.4]} />
        <meshStandardMaterial color="#4A4E69" roughness={0.4} />
      </mesh>
      {/* Chrome Fulcrum Roller Support */}
      <mesh position={[0, 0.28, -0.1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.85, 12]} />
        <meshStandardMaterial color="#CED4DA" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Springy Azure Blue Diving Board (Extending out over pool water) */}
      <mesh position={[0, 0.35, -0.7]} rotation={[-0.04, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.08, 2.0]} />
        <meshStandardMaterial color="#0077B6" roughness={0.3} />
      </mesh>
      {/* Textured White Non-slip Grip Tip */}
      <mesh position={[0, 0.40, -1.45]}>
        <boxGeometry args={[0.75, 0.02, 0.45]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
      </mesh>

      {/* Glowing Star Emblem marking super spring jump spot */}
      <mesh position={[0, 0.42, -1.45]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, 0.18, 5]} />
        <meshBasicMaterial color="#FFD166" />
      </mesh>

      {/* Billboard Prompt Label */}
      <Billboard position={[0, 1.25, -1.3]}>
        <Text fontSize={0.2} color="#0077B6" outlineWidth={0.02} outlineColor="#FFF" anchorY="middle">
          🤸‍♀️ Papan Loncat Indah (Boing!)
        </Text>
      </Billboard>
    </group>
  );
};

// ==============================================================
// 5. INFLATABLE FLOATIES & POOL TOYS
// ==============================================================
export const FlamingoFloatModel: React.FC = () => {
  return (
    <group>
      <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.9, 0.3, 16, 24]} />
        <meshStandardMaterial color="#FF69B4" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.85, -0.9]} rotation={[-0.2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 1.2, 10]} />
        <meshStandardMaterial color="#FF69B4" roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.45, -1.05]} castShadow>
        <sphereGeometry args={[0.24, 12, 12]} />
        <meshStandardMaterial color="#FF69B4" roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.72, -1.05]}>
        <cylinderGeometry args={[0.14, 0.1, 0.16, 6]} />
        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.38, -1.35]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.1, 0.35, 8]} />
        <meshStandardMaterial color="#2B2D42" />
      </mesh>
      {[-0.16, 0.16].map((ex, idx) => (
        <mesh key={idx} position={[ex, 1.5, -1.1]}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshStandardMaterial color="#000" />
        </mesh>
      ))}
      <mesh position={[0, 0.45, 1.0]} rotation={[-0.4, 0, 0]} castShadow>
        <coneGeometry args={[0.25, 0.5, 6]} />
        <meshStandardMaterial color="#FF85A1" />
      </mesh>
    </group>
  );
};

export const DonutFloatModel: React.FC = () => {
  return (
    <group>
      <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.85, 0.32, 16, 24]} />
        <meshStandardMaterial color="#E9C46A" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.85, 0.25, 16, 24]} />
        <meshStandardMaterial color="#FF007F" roughness={0.3} />
      </mesh>
      {[
        { x: -0.6, z: 0.5, c: '#FFBE0B' },
        { x: 0.6, z: 0.5, c: '#00F5D4' },
        { x: -0.7, z: -0.4, c: '#FFF' },
        { x: 0.7, z: -0.4, c: '#8338EC' },
        { x: 0.0, z: 0.85, c: '#3A86FF' },
        { x: 0.0, z: -0.85, c: '#FFD166' },
      ].map((sp, idx) => (
        <mesh key={idx} position={[sp.x, 0.42, sp.z]} rotation={[0, idx * 0.8, 0]}>
          <boxGeometry args={[0.06, 0.03, 0.14]} />
          <meshStandardMaterial color={sp.c} />
        </mesh>
      ))}
    </group>
  );
};

const RubberDuckModel: React.FC = () => {
  return (
    <group>
      <mesh position={[0, 0.18, 0]} castShadow>
        <sphereGeometry args={[0.32, 12, 12]} />
        <meshStandardMaterial color="#FFD166" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.42, -0.18]} castShadow>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color="#FFD166" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.38, -0.36]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <meshStandardMaterial color="#FB5607" />
      </mesh>
      {[-0.1, 0.1].map((ex, idx) => (
        <mesh key={idx} position={[ex, 0.46, -0.28]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}
    </group>
  );
};

const BeachBallModel: React.FC = () => {
  return (
    <group>
      <mesh position={[0, 0.25, 0]} castShadow>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial color="#FF006E" roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.25, 0]} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[0.322, 0.04, 8, 20]} />
        <meshStandardMaterial color="#FFBE0B" />
      </mesh>
      <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[0.322, 0.04, 8, 20]} />
        <meshStandardMaterial color="#3A86FF" />
      </mesh>
    </group>
  );
};

// ==============================================================
// 6. POOLSIDE SUN LOUNGERS & TROPICAL FRUIT REFRESHMENT BAR
// ==============================================================
const PoolsideCabanaAndLoungers: React.FC = () => {
  return (
    <group position={[-10.0, 0.36, -31.0]}>
      {/* Luxury Sun Lounger 1 (Pink Striped) */}
      <group position={[0, 0, -1.2]} rotation={[0, 0.2, 0]}>
        <mesh position={[0, 0.12, 0]} castShadow>
          <boxGeometry args={[1.1, 0.18, 2.4]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.23, 0]} castShadow>
          <boxGeometry args={[1.0, 0.06, 2.3]} />
          <meshStandardMaterial color="#FF69B4" />
        </mesh>
        <mesh position={[0, 0.45, -0.7]} rotation={[-0.45, 0, 0]}>
          <boxGeometry args={[1.0, 0.08, 1.0]} />
          <meshStandardMaterial color="#FF69B4" />
        </mesh>
        <mesh position={[0, 0.62, -0.9]} rotation={[-0.45, 0, 0]}>
          <boxGeometry args={[0.7, 0.1, 0.35]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      </group>

      {/* Luxury Sun Lounger 2 (Mint Striped) */}
      <group position={[0, 0, 1.2]} rotation={[0, -0.2, 0]}>
        <mesh position={[0, 0.12, 0]} castShadow>
          <boxGeometry args={[1.1, 0.18, 2.4]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.23, 0]} castShadow>
          <boxGeometry args={[1.0, 0.06, 2.3]} />
          <meshStandardMaterial color="#2EC4B6" />
        </mesh>
        <mesh position={[0, 0.45, -0.7]} rotation={[-0.45, 0, 0]}>
          <boxGeometry args={[1.0, 0.08, 1.0]} />
          <meshStandardMaterial color="#2EC4B6" />
        </mesh>
        <mesh position={[0, 0.62, -0.9]} rotation={[-0.45, 0, 0]}>
          <boxGeometry args={[0.7, 0.1, 0.35]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      </group>

      {/* Tropical Parasol Beach Umbrella */}
      <group position={[-1.2, 0, 0]}>
        <mesh position={[0, 1.4, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 2.8, 8]} />
          <meshStandardMaterial color="#6F4E37" />
        </mesh>
        <mesh position={[0, 2.7, 0]} castShadow>
          <coneGeometry args={[1.8, 0.8, 12]} />
          <meshStandardMaterial color="#FFB703" roughness={0.4} />
        </mesh>
        <mesh position={[0, 2.45, 0]}>
          <cylinderGeometry args={[1.81, 1.81, 0.1, 12, 1, true]} />
          <meshStandardMaterial color="#E76F51" />
        </mesh>
      </group>

      {/* Refreshment Bar Table */}
      <group position={[1.2, 0, 0]}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.6, 0.6, 0.7, 16]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.72, 0]} receiveShadow>
          <cylinderGeometry args={[0.65, 0.65, 0.05, 16]} />
          <meshStandardMaterial color="#F4A261" />
        </mesh>

        {/* Sliced Watermelon Plate */}
        <mesh position={[0.15, 0.76, 0.15]}>
          <cylinderGeometry args={[0.18, 0.18, 0.08, 8, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#E63946" />
        </mesh>

        {/* Fresh Green Coconut with Straw */}
        <mesh position={[-0.2, 0.82, -0.15]}>
          <sphereGeometry args={[0.14, 10, 10]} />
          <meshStandardMaterial color="#55A630" />
        </mesh>
        <mesh position={[-0.2, 0.98, -0.15]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.25, 6]} />
          <meshStandardMaterial color="#FFBE0B" />
        </mesh>

        {/* Glass Pitcher */}
        <mesh position={[-0.1, 0.85, 0.2]}>
          <cylinderGeometry args={[0.1, 0.12, 0.28, 10]} />
          <meshStandardMaterial color="#FFD166" transparent opacity={0.7} />
        </mesh>
      </group>
    </group>
  );
};

// ==============================================================
// 7. GRAND BACKYARD GARDEN PROMENADE & RESORT FLOWERBEDS
// ==============================================================
const BackyardGardenPromenade: React.FC = () => {
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const isNight = timeOfDay === 'malam' || timeOfDay === 'sore' || timeOfDay === 'subuh';

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Main Broad Limestone Promenade from Pergola (Z: -14.2) to Pool Deck (Z: -21.5) */}
      {[-14.5, -15.7, -16.9, -18.1, -19.3, -20.5].map((pz, idx) => (
        <group key={`walk-${idx}`} position={[0, 0.04, pz]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[3.4, 1.1]} />
            <meshStandardMaterial color="#F1F5F9" roughness={0.7} />
          </mesh>
          {/* Subtle Stone Paver Edging */}
          {[-1.72, 1.72].map((bx, bi) => (
            <mesh key={bi} position={[bx, 0.03, 0]}>
              <boxGeometry args={[0.08, 0.05, 1.1]} />
              <meshStandardMaterial color="#CBD5E1" roughness={0.75} />
            </mesh>
          ))}
        </group>
      ))}

      {/* 2. Stepping Stone Pathway to Secret Treehouse & Swing (West: X from 0 to -18) */}
      {[-3.5, -7.0, -10.5, -14.0].map((px, idx) => (
        <mesh
          key={`path-w-${idx}`}
          position={[px, 0.04, -18.0 - idx * 1.5]}
          rotation={[-Math.PI / 2, 0, idx * 0.15]}
          receiveShadow
        >
          <circleGeometry args={[0.7, 14]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.8} />
        </mesh>
      ))}

      {/* 3. Stepping Stone Pathway to Gazebo & Sunflowers (East: X from 0 to +18) */}
      {[3.5, 7.0, 10.5, 14.0].map((px, idx) => (
        <mesh
          key={`path-e-${idx}`}
          position={[px, 0.04, -18.0 - idx * 2.2]}
          rotation={[-Math.PI / 2, 0, -idx * 0.15]}
          receiveShadow
        >
          <circleGeometry args={[0.7, 14]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.8} />
        </mesh>
      ))}

      {/* 4. Symmetrical Manicured Flowerbeds Flanking Main Walkway */}
      {[-2.35, 2.35].map((fx, fi) => (
        <group key={`flowerbed-${fi}`} position={[fx, 0, -17.5]}>
          {/* Rich Mulch Bed */}
          <mesh position={[0, 0.04, 0]} receiveShadow>
            <boxGeometry args={[0.9, 0.08, 5.2]} />
            <meshStandardMaterial color="#4A3728" roughness={0.9} />
          </mesh>
          {/* Stone Curb Border */}
          <mesh position={[fi === 0 ? 0.48 : -0.48, 0.06, 0]}>
            <boxGeometry args={[0.08, 0.1, 5.2]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.6} />
          </mesh>
          {/* Blooming Flowers */}
          {[-2.1, -1.3, -0.5, 0.5, 1.3, 2.1].map((bz, bi) => (
            <group key={bi} position={[0, 0.08, bz]}>
              <mesh position={[0, 0.12, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.25, 6]} />
                <meshStandardMaterial color="#2D6A4F" />
              </mesh>
              <mesh position={[0, 0.26, 0]}>
                <sphereGeometry args={[0.13, 8, 8]} />
                <meshStandardMaterial
                  color={
                    bi % 4 === 0
                      ? '#FF5D8F'
                      : bi % 4 === 1
                      ? '#7209B7'
                      : bi % 4 === 2
                      ? '#4CC9F0'
                      : '#FFB703'
                  }
                  roughness={0.4}
                />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* 5. Cozy Low-Profile Stone Garden Lanterns (Nestled in Flowerbeds, No High Poles!) */}
      {[
        { x: -2.35, z: -15.5 },
        { x: 2.35, z: -15.5 },
        { x: -2.35, z: -19.5 },
        { x: 2.35, z: -19.5 },
      ].map((lan, idx) => (
        <group key={`stone-lantern-${idx}`} position={[lan.x, 0, lan.z]}>
          {/* Stone Base Plinth */}
          <mesh position={[0, 0.06, 0]} receiveShadow>
            <boxGeometry args={[0.32, 0.12, 0.32]} />
            <meshStandardMaterial color="#64748B" roughness={0.8} />
          </mesh>
          {/* Stone Pillar */}
          <mesh position={[0, 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.08, 0.14, 8]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.7} />
          </mesh>
          {/* Frosted Glowing Lantern Core */}
          <mesh position={[0, 0.32, 0]}>
            <boxGeometry args={[0.2, 0.16, 0.2]} />
            <meshStandardMaterial
              color="#FFF1D6"
              emissive={isNight ? '#FFD166' : '#FFE6A7'}
              emissiveIntensity={isNight ? 1.6 : 0.3}
            />
          </mesh>
          {/* Japanese Pagoda Curved Roof Cap */}
          <mesh position={[0, 0.44, 0]} castShadow>
            <coneGeometry args={[0.25, 0.1, 4]} />
            <meshStandardMaterial color="#475569" roughness={0.7} />
          </mesh>
          {isNight && (
            <pointLight position={[0, 0.32, 0]} color="#FFE6A7" intensity={0.5} distance={5} />
          )}
        </group>
      ))}
    </group>
  );
};

// ==============================================================
// 8. SPACIOUS BACKYARD PERIMETER WHITE PICKET FENCE
// ==============================================================
// Placed far out along outer property boundaries so it never clutters the yard!
const BackyardPerimeterFence: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* North Backyard Fence (Z: -50.0, spanning X: -26 to +26) */}
      {[-24, -18, -12, -6, 0, 6, 12, 18, 24].map((fx, idx) => (
        <group key={`fence-n-${idx}`} position={[fx, 0, -50.0]}>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[5.8, 0.08, 0.06]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.85, 0]}>
            <boxGeometry args={[5.8, 0.08, 0.06]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
          </mesh>
          {[-2.2, -1.4, -0.6, 0.2, 1.0, 1.8].map((px, pi) => (
            <group key={pi} position={[px, 0.6, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.12, 1.1, 0.04]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
              </mesh>
              <mesh position={[0, 0.6, 0]} rotation={[0, 0, Math.PI / 4]}>
                <boxGeometry args={[0.085, 0.085, 0.042]} />
                <meshStandardMaterial color="#FFFFFF" />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* West Fence (X: -27.0, Z: -16 to -50) */}
      {[-20, -28, -36, -44].map((fz, idx) => (
        <group key={`fence-w-${idx}`} position={[-27.0, 0, fz]}>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[0.06, 0.08, 7.8]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.85, 0]}>
            <boxGeometry args={[0.06, 0.08, 7.8]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
          </mesh>
          {[-3, -1.5, 0, 1.5, 3].map((pz, pi) => (
            <mesh key={pi} position={[0, 0.6, pz]} castShadow>
              <boxGeometry args={[0.04, 1.1, 0.12]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
            </mesh>
          ))}
        </group>
      ))}

      {/* East Fence (X: +27.0, Z: -16 to -50) */}
      {[-20, -28, -36, -44].map((fz, idx) => (
        <group key={`fence-e-${idx}`} position={[27.0, 0, fz]}>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[0.06, 0.08, 7.8]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.85, 0]}>
            <boxGeometry args={[0.06, 0.08, 7.8]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
          </mesh>
          {[-3, -1.5, 0, 1.5, 3].map((pz, pi) => (
            <mesh key={pi} position={[0, 0.6, pz]} castShadow>
              <boxGeometry args={[0.04, 1.1, 0.12]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Lush Green Boxwood Hedges along Rear Fence Line */}
      {[-22, -15, -8, 0, 8, 15, 22].map((hx, idx) => (
        <mesh key={`hedge-${idx}`} position={[hx, 0.4, -49.5]} castShadow>
          <sphereGeometry args={[0.75, 10, 10]} />
          <meshStandardMaterial color="#2D6A4F" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
};

// ==============================================================
// 9. SECRET TREEHOUSE WITH TELESCOPE & CABIN (WEST ZONE)
// ==============================================================
const SecretTreehouse: React.FC = () => {
  return (
    <group position={[-20.0, 0, -28.0]}>
      {/* Massive Oak Tree Trunk */}
      <mesh position={[0, 2.4, 0]} castShadow>
        <cylinderGeometry args={[0.85, 1.25, 4.8, 10]} />
        <meshStandardMaterial color="#582F0E" roughness={0.9} />
      </mesh>
      {[0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].map((ang, idx) => (
        <mesh
          key={idx}
          position={[Math.cos(ang) * 0.95, 0.3, Math.sin(ang) * 0.95]}
          rotation={[0.4 * Math.sin(ang), 0, 0.4 * Math.cos(ang)]}
        >
          <cylinderGeometry args={[0.2, 0.35, 1.0, 6]} />
          <meshStandardMaterial color="#582F0E" />
        </mesh>
      ))}

      {/* Massive Tree Foliage Canopy */}
      <mesh position={[0, 6.2, 0]} castShadow>
        <sphereGeometry args={[3.8, 14, 14]} />
        <meshStandardMaterial color="#2D6A4F" roughness={0.7} />
      </mesh>
      <mesh position={[1.5, 7.2, -1.0]} castShadow>
        <sphereGeometry args={[2.7, 12, 12]} />
        <meshStandardMaterial color="#386641" roughness={0.7} />
      </mesh>
      <mesh position={[-1.5, 7.0, 1.2]} castShadow>
        <sphereGeometry args={[2.6, 12, 12]} />
        <meshStandardMaterial color="#40916C" roughness={0.7} />
      </mesh>

      {/* Wooden Treehouse Deck Platform (Y: 3.4) */}
      <mesh position={[0, 3.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.4, 0.22, 4.4]} />
        <meshStandardMaterial color="#8D5B4C" roughness={0.7} />
      </mesh>
      {[-2.1, 2.1].map((rx, idx) => (
        <mesh key={idx} position={[rx, 3.9, 0]}>
          <boxGeometry args={[0.12, 0.8, 4.4]} />
          <meshStandardMaterial color="#6F4E37" />
        </mesh>
      ))}
      <mesh position={[0, 3.9, -2.1]}>
        <boxGeometry args={[4.4, 0.8, 0.12]} />
        <meshStandardMaterial color="#6F4E37" />
      </mesh>

      {/* Cozy Treehouse Cabin House */}
      <group position={[0.5, 3.5, 0.5]}>
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[2.6, 2.2, 2.4]} />
          <meshStandardMaterial color="#B08968" roughness={0.8} />
        </mesh>
        <mesh position={[0, 2.6, 0]} castShadow>
          <coneGeometry args={[2.2, 1.3, 4]} />
          <meshStandardMaterial color="#C85A32" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.3, 1.21]}>
          <circleGeometry args={[0.4, 12]} />
          <meshStandardMaterial color="#90E0EF" roughness={0.2} />
        </mesh>
      </group>

      {/* Brass Telescope on Deck */}
      <group position={[-1.6, 4.1, 1.5]} rotation={[0, -0.6, 0.2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.09, 0.65, 8]} />
          <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.5, 6]} />
          <meshStandardMaterial color="#6F4E37" />
        </mesh>
      </group>

      {/* Wooden Ladder from Ground to Platform */}
      {[0.5, 1.0, 1.5, 2.0, 2.5, 3.0].map((ly, idx) => (
        <mesh key={idx} position={[-2.1, ly, 1.2]} castShadow>
          <boxGeometry args={[0.7, 0.08, 0.14]} />
          <meshStandardMaterial color="#A67C52" />
        </mesh>
      ))}
    </group>
  );
};

// ==============================================================
// 10. FAMILY GLAMPING TEEPEE TENT & CAMPFIRE (NORTHWEST ZONE)
// ==============================================================
const FamilyGlampingCamp: React.FC = () => {
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const isNight = timeOfDay === 'malam' || timeOfDay === 'sore' || timeOfDay === 'subuh';

  return (
    <group position={[-19.0, 0, -44.0]}>
      {/* Striped Teepee Tent */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 1.8, 0]} castShadow>
          <coneGeometry args={[2.2, 3.6, 6]} />
          <meshStandardMaterial color="#FEFAE0" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.1, 0]}>
          <coneGeometry args={[2.22, 0.4, 6]} />
          <meshStandardMaterial color="#E07A5F" />
        </mesh>
        {[0, 1, 2, 3].map((pi) => (
          <mesh
            key={pi}
            position={[0, 3.7, 0]}
            rotation={[0.15 * Math.sin(pi * 1.5), pi * 0.8, 0.15 * Math.cos(pi * 1.5)]}
          >
            <cylinderGeometry args={[0.04, 0.04, 1.2, 6]} />
            <meshStandardMaterial color="#7F4F24" />
          </mesh>
        ))}
        <mesh position={[0, 0.7, 1.8]}>
          <boxGeometry args={[0.9, 1.3, 0.05]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      </group>

      {/* Red & White Checkered Picnic Blanket */}
      <mesh position={[3.2, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.6, 2.6]} />
        <meshStandardMaterial color="#E63946" roughness={0.9} />
      </mesh>
      <mesh position={[3.2, 0.22, -0.6]} castShadow>
        <boxGeometry args={[0.65, 0.35, 0.45]} />
        <meshStandardMaterial color="#D4A373" roughness={0.7} />
      </mesh>

      {/* Cozy Campfire Ring with Marshmallows */}
      <group position={[2.8, 0, 2.2]}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((si) => {
          const ang = (si * Math.PI * 2) / 8;
          return (
            <mesh key={si} position={[Math.cos(ang) * 0.7, 0.08, Math.sin(ang) * 0.7]} scale={[0.2, 0.15, 0.2]}>
              <sphereGeometry args={[0.6, 6, 6]} />
              <meshStandardMaterial color="#78716C" roughness={0.9} />
            </mesh>
          );
        })}
        <mesh position={[0, 0.12, 0]} rotation={[0, 0.6, 0]}>
          <boxGeometry args={[0.7, 0.14, 0.2]} />
          <meshStandardMaterial color="#4A2810" />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <coneGeometry args={[0.28, 0.45, 6]} />
          <meshStandardMaterial
            color="#FF5400"
            emissive={isNight ? '#FF5400' : '#FF7B00'}
            emissiveIntensity={isNight ? 1.5 : 0.8}
          />
        </mesh>
        {isNight && <pointLight position={[0, 0.5, 0]} color="#FF8500" intensity={1.2} distance={8} />}

        {/* Marshmallow Skewer */}
        <mesh position={[0.25, 0.45, 0.25]} rotation={[0.4, 0, -0.4]}>
          <cylinderGeometry args={[0.015, 0.015, 0.7, 6]} />
          <meshStandardMaterial color="#7F4F24" />
        </mesh>
        <mesh position={[0.45, 0.65, 0.45]}>
          <cylinderGeometry args={[0.04, 0.04, 0.08, 8]} />
          <meshStandardMaterial color="#FEFAE0" />
        </mesh>
      </group>

      {/* Fairy String Lights */}
      {[-2, 0, 2].map((lx, idx) => (
        <group key={idx} position={[lx, 2.8, 2.2]}>
          <mesh>
            <sphereGeometry args={[0.09, 8, 8]} />
            <meshStandardMaterial
              color="#FFE6A7"
              emissive={isNight ? '#FFD166' : '#FFE6A7'}
              emissiveIntensity={isNight ? 1.2 : 0.4}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ==============================================================
// 11. SUNFLOWER GARDEN, WOODEN GAZEBO & AFTERNOON TEA (EAST ZONE)
// ==============================================================
const SunflowerGarden: React.FC = () => {
  return (
    <group position={[20.0, 0, -32.0]}>
      {/* Rustic Wooden Gazebo */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.16, 0]} receiveShadow>
          <cylinderGeometry args={[2.5, 2.6, 0.3, 8]} />
          <meshStandardMaterial color="#B08968" roughness={0.7} />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((pi) => {
          const ang = (pi * Math.PI * 2) / 6;
          return (
            <mesh key={pi} position={[Math.cos(ang) * 2.1, 1.5, Math.sin(ang) * 2.1]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 2.5, 8]} />
              <meshStandardMaterial color="#6F4E37" />
            </mesh>
          );
        })}
        <mesh position={[0, 3.2, 0]} castShadow>
          <coneGeometry args={[2.8, 1.2, 8]} />
          <meshStandardMaterial color="#C85A32" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.45, -1.2]} castShadow>
          <boxGeometry args={[2.0, 0.1, 0.5]} />
          <meshStandardMaterial color="#6F4E37" />
        </mesh>

        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.65, 0.65, 0.6, 12]} />
          <meshStandardMaterial color="#9C6644" />
        </mesh>
        <mesh position={[0, 0.85, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        {[-0.2, 0.2].map((cx, idx) => (
          <mesh key={idx} position={[cx, 0.83, 0.15]}>
            <cylinderGeometry args={[0.04, 0.03, 0.06, 6]} />
            <meshStandardMaterial color="#FFB703" />
          </mesh>
        ))}
      </group>

      {/* Cheerful Sunflowers */}
      {[-8, -5, -2, 2, 5, 8].map((sx, idx) => (
        <group key={idx} position={[sx, 0, -3.2]}>
          <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.03, 0.04, 1.6, 6]} />
            <meshStandardMaterial color="#386641" />
          </mesh>
          <mesh position={[0, 1.6, 0.1]} rotation={[0.2, 0, 0]}>
            <circleGeometry args={[0.32, 12]} />
            <meshStandardMaterial color="#FFBE0B" />
          </mesh>
          <mesh position={[0, 1.6, 0.11]} rotation={[0.2, 0, 0]}>
            <circleGeometry args={[0.16, 10]} />
            <meshStandardMaterial color="#582F0E" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ==============================================================
// 12. BACKYARD GARDEN SWING (AYUNAN GANTUNG TAMAN)
// ==============================================================
const BackyardGardenSwing: React.FC = () => {
  const swingGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!swingGroupRef.current) return;
    const t = state.clock.getElapsedTime();
    swingGroupRef.current.rotation.x = Math.sin(t * 1.5) * 0.1;
  });

  return (
    <group position={[-15.0, 0, -22.0]} rotation={[0, 0.25, 0]}>
      {/* Flagstone Paver Pad Beneath Swing */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.0, 16]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.8} />
      </mesh>

      {/* Rustic Wooden A-Frame Legs */}
      {[-1.3, 1.3].map((ax, idx) => (
        <group key={idx} position={[ax, 0, 0]}>
          <mesh position={[0, 1.4, -0.6]} rotation={[0.25, 0, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 3.0, 8]} />
            <meshStandardMaterial color="#6F4E37" />
          </mesh>
          <mesh position={[0, 1.4, 0.6]} rotation={[-0.25, 0, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 3.0, 8]} />
            <meshStandardMaterial color="#6F4E37" />
          </mesh>
          {/* Wildflower Cluster around Base */}
          <group position={[0, 0.04, 0]}>
            <mesh position={[0, 0.12, 0]}>
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshStandardMaterial color="#55A630" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.25, 0]}>
              <sphereGeometry args={[0.1, 6, 6]} />
              <meshStandardMaterial color={idx === 0 ? '#9D4EDD' : '#FF70A6'} />
            </mesh>
          </group>
        </group>
      ))}

      {/* Top Crossbeam */}
      <mesh position={[0, 2.75, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 2.9, 8]} />
        <meshStandardMaterial color="#582F0E" />
      </mesh>

      {/* Gentle Swaying Swing Seat */}
      <group ref={swingGroupRef} position={[0, 2.7, 0]}>
        {[-0.45, 0.45].map((cx, idx) => (
          <mesh key={idx} position={[cx, -1.1, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 2.2, 6]} />
            <meshStandardMaterial color="#CBD5E1" metalness={0.8} />
          </mesh>
        ))}
        <mesh position={[0, -2.2, 0]} castShadow>
          <boxGeometry args={[1.1, 0.08, 0.4]} />
          <meshStandardMaterial color="#DDA15E" />
        </mesh>
      </group>
    </group>
  );
};

// ==============================================================
// MAIN COMPONENT: BACKYARD WATERPARK (SPACIOUS & EXPANDED)
// ==============================================================
export const BackyardWaterpark: React.FC = () => {
  const flamingoBobRef = useRef<THREE.Group>(null);
  const donutBobRef = useRef<THREE.Group>(null);
  const duckBobRef = useRef<THREE.Group>(null);
  const ballBobRef = useRef<THREE.Group>(null);
  const activeRide = useGameStore((s) => s.activeRide);
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const isNight = timeOfDay === 'malam' || timeOfDay === 'sore' || timeOfDay === 'subuh';

  useEffect(() => {
    // 1. Water Slide Top Tower Platform (Y: 4.05) at [8.5, 0, -37.0]
    const slideTopBox = new THREE.Box3(
      new THREE.Vector3(7.2, 0, -38.4),
      new THREE.Vector3(9.8, 4.05, -35.6)
    );
    // 2. Secret Treehouse Deck Platform (Y: 3.4) at [-20.0, 0, -28.0]
    const treehouseBox = new THREE.Box3(
      new THREE.Vector3(-22.2, 0, -30.2),
      new THREE.Vector3(-17.8, 3.45, -25.8)
    );
    // 3. Glamping picnic ground at [-19.0, 0, -44.0]
    const campBox = new THREE.Box3(
      new THREE.Vector3(-21.5, 0, -46.5),
      new THREE.Vector3(-16.5, 0.4, -41.5)
    );

    // 4. Elevated Pool Deck Platform Frame Colliders (Y: 0.36)
    // Pool basin: X [-8, 8], Z [-37, -25]
    // Surrounding deck: X [-12, 12], Z [-40.5, -21.5]
    const deckN = {
      box: new THREE.Box3(new THREE.Vector3(-12.0, 0, -25.2), new THREE.Vector3(12.0, 0.36, -21.5)),
      type: 'ground' as const,
    };
    const deckS = {
      box: new THREE.Box3(new THREE.Vector3(-12.0, 0, -40.5), new THREE.Vector3(12.0, 0.36, -36.8)),
      type: 'ground' as const,
    };
    const deckE = {
      box: new THREE.Box3(new THREE.Vector3(7.8, 0, -36.8), new THREE.Vector3(12.0, 0.36, -25.2)),
      type: 'ground' as const,
    };
    const deckW = {
      box: new THREE.Box3(new THREE.Vector3(-12.0, 0, -36.8), new THREE.Vector3(-7.8, 0.36, -25.2)),
      type: 'ground' as const,
    };
    const poolFloor = {
      box: new THREE.Box3(new THREE.Vector3(-7.8, 0, -36.8), new THREE.Vector3(7.8, 0.25, -25.2)),
      type: 'ground' as const,
    };

    // 5. Springboard Diving Board Super Bouncy Trampoline Collider (at [5.0, 0.45, -26.0])
    const divingBoardCollider = {
      box: new THREE.Box3(new THREE.Vector3(4.4, 0, -26.5), new THREE.Vector3(5.6, 0.50, -24.5)),
      type: 'trampoline' as const,
    };

    const poolColliders = [
      { box: slideTopBox, type: 'ground' as const },
      { box: treehouseBox, type: 'ground' as const },
      { box: campBox, type: 'ground' as const },
      deckN,
      deckS,
      deckE,
      deckW,
      poolFloor,
      divingBoardCollider,
    ];
    colliders.push(...poolColliders);

    // Solid Obstacles (Perimeter fences, gazebo, treehouse trunk, teepee tent, slide tower)
    const solids: SolidCollider[] = [
      // 1. Backyard North, West, East perimeter fences
      addSolidBox([-26.5, 0, -50.4], [26.5, 1.8, -49.6], 'backyard_fence_north'),
      addSolidBox([-27.4, 0, -50.5], [-26.6, 1.8, -15.5], 'backyard_fence_west'),
      addSolidBox([26.6, 0, -50.5], [27.4, 1.8, -15.5], 'backyard_fence_east'),
      // 2. Gazebo table & 6 pillars
      addSolidCylinder(20.0, -32.0, 0.75, 0, 1.2, 'gazebo_table'),
      ...[0, 1, 2, 3, 4, 5].map((pi) => {
        const ang = (pi * Math.PI * 2) / 6;
        return addSolidCylinder(
          20.0 + Math.cos(ang) * 2.1,
          -32.0 + Math.sin(ang) * 2.1,
          0.16,
          0,
          2.6,
          `gazebo_pillar_${pi}`
        );
      }),
      // 3. Treehouse sturdy tree trunk
      addSolidCylinder(-18.0, -28.0, 0.9, 0, 6.0, 'treehouse_trunk'),
      // 4. Glamping Teepee Tent
      addSolidCylinder(-19.0, -44.0, 2.2, 0, 3.6, 'glamping_teepee'),
      // 5. Water Slide Tower Platform Base
      addSolidBox([7.2, 0, -38.8], [9.8, 3.8, -35.2], 'slide_tower_base'),
      // 6. Garden swing A-frames
      addSolidCylinder(-16.3, -22.0, 0.25, 0, 3.5, 'garden_swing_left'),
      addSolidCylinder(-13.7, -22.0, 0.25, 0, 3.5, 'garden_swing_right'),
    ];

    return () => {
      poolColliders.forEach((c) => {
        const idx = colliders.indexOf(c);
        if (idx !== -1) colliders.splice(idx, 1);
      });
      solids.forEach((s) => removeSolidCollider(s));
    };
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Gentle bobbing for floats on top of sparkling pool water
    if (flamingoBobRef.current && activeRide !== 'flamingo') {
      flamingoBobRef.current.position.y = 0.30 + Math.sin(t * 2.0) * 0.035;
      flamingoBobRef.current.rotation.z = Math.sin(t * 1.5) * 0.03;
    }
    if (donutBobRef.current) {
      donutBobRef.current.position.y = 0.30 + Math.cos(t * 1.8) * 0.03;
      donutBobRef.current.rotation.y = t * 0.2;
    }
    if (duckBobRef.current) {
      duckBobRef.current.position.y = 0.30 + Math.sin(t * 2.2 + 1) * 0.025;
      duckBobRef.current.rotation.y = Math.sin(t * 0.8) * 0.3;
    }
    if (ballBobRef.current) {
      ballBobRef.current.position.y = 0.28 + Math.cos(t * 2.4) * 0.02;
      ballBobRef.current.rotation.x = t * 0.5;
    }

    // Proximity checks for waterpark attractions
    const playerPos = gameStore.getState().playerPos;

    // 1. Water Slide proximity check (Stairs entry at [8.5, 0, -40.5] and Tower Platform at [8.5, 4.0, -37.0])
    const distSlideStairs = Math.hypot(playerPos[0] - 8.5, playerPos[2] - -40.0);
    const distSlideDeck = Math.hypot(playerPos[0] - 8.5, playerPos[2] - -37.0);
    const isNearSlide = (distSlideStairs < 4.0 || distSlideDeck < 2.5) && activeRide === 'none';

    // 2. Flamingo Float proximity check (at [-3.0, 0, -30.0])
    const distFlamingo = Math.hypot(playerPos[0] - -3.0, playerPos[2] - -30.0);
    // 3. Treehouse proximity check (Ladder is at [-22.0, 0, -27.0])
    const distTree = Math.hypot(playerPos[0] - -22.0, playerPos[2] - -27.0);
    // 4. Glamping Campfire (at [-16.0, 0, -42.0])
    const distCamp = Math.hypot(playerPos[0] - -16.0, playerPos[2] - -42.0);

    if (isNearSlide) {
      gameStore.setNearbyInteractable({
        id: 'pool_slide',
        title: 'Seluncuran Istana Air Ceria 🛝🌊✨',
        prompt: 'Tekan [E] untuk Meluncur Wuuush! Byuuuur ke Kolam Renang!',
      });
    } else if (distFlamingo < 3.5 && activeRide === 'none') {
      gameStore.setNearbyInteractable({
        id: 'flamingo_float',
        title: 'Pelampung Flamingo Gemas 🦩💖',
        prompt: 'Tekan [E] untuk Naik Pelampung Flamingo Cantik! ✨',
      });
    } else if (distTree < 4.0) {
      gameStore.setNearbyInteractable({
        id: 'treehouse',
        title: 'Rumah Pohon Rahasia 🏡🌳',
        prompt: 'Tekan [E] untuk Panjat ke Rumah Pohon Rahasia! ✨',
      });
    } else if (distCamp < 4.0) {
      gameStore.setNearbyInteractable({
        id: 'marshmallow',
        title: 'Piknik & Bakar Marshmallow ⛺🍡',
        prompt: 'Tekan [E] untuk Nikmati Marshmallow Bakar Manis! (+Speed Boost ⚡)',
      });
    } else {
      const cur = gameStore.getState().nearbyInteractable;
      if (
        cur?.id === 'pool_slide' ||
        cur?.id === 'flamingo_float' ||
        cur?.id === 'treehouse' ||
        cur?.id === 'marshmallow'
      ) {
        gameStore.setNearbyInteractable(null);
      }
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ============================================================== */}
      {/* 1. ELEVATED POOL DECK PLATFORM (Warm Timber & White Marble)   */}
      {/* ============================================================== */}
      <group position={[0, 0, -31]}>
        {/* Warm Timber Deck Border Planks */}
        {/* North Deck Plank */}
        <mesh position={[0, 0.18, 7.8]} receiveShadow>
          <boxGeometry args={[24, 0.36, 3.8]} />
          <meshStandardMaterial color="#B08968" roughness={0.65} />
        </mesh>
        {/* South Deck Plank */}
        <mesh position={[0, 0.18, -7.8]} receiveShadow>
          <boxGeometry args={[24, 0.36, 3.8]} />
          <meshStandardMaterial color="#B08968" roughness={0.65} />
        </mesh>
        {/* East Deck Plank */}
        <mesh position={[10.0, 0.18, 0]} receiveShadow>
          <boxGeometry args={[4.0, 0.36, 12.0]} />
          <meshStandardMaterial color="#B08968" roughness={0.65} />
        </mesh>
        {/* West Deck Plank */}
        <mesh position={[-10.0, 0.18, 0]} receiveShadow>
          <boxGeometry args={[4.0, 0.36, 12.0]} />
          <meshStandardMaterial color="#B08968" roughness={0.65} />
        </mesh>

        {/* White Marble Coping Rim Borders */}
        <mesh position={[0, 0.34, 6.1]} receiveShadow>
          <boxGeometry args={[16.8, 0.06, 0.4]} />
          <meshStandardMaterial color="#F8F9FA" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.34, -6.1]} receiveShadow>
          <boxGeometry args={[16.8, 0.06, 0.4]} />
          <meshStandardMaterial color="#F8F9FA" roughness={0.35} />
        </mesh>
        <mesh position={[8.1, 0.34, 0]} receiveShadow>
          <boxGeometry args={[0.4, 0.06, 12.4]} />
          <meshStandardMaterial color="#F8F9FA" roughness={0.35} />
        </mesh>
        <mesh position={[-8.1, 0.34, 0]} receiveShadow>
          <boxGeometry args={[0.4, 0.06, 12.4]} />
          <meshStandardMaterial color="#F8F9FA" roughness={0.35} />
        </mesh>

        {/* Four Luxury Corner Terracotta Planters with Tropical Broadleaf Palms */}
        {[
          { x: -11.0, z: 6.8 },
          { x: 11.0, z: 6.8 },
          { x: -11.0, z: -6.8 },
          { x: 11.0, z: -6.8 },
        ].map((pot, pidx) => (
          <group key={`planter-${pidx}`} position={[pot.x, 0.36, pot.z]}>
            {/* Terracotta Urn Pot */}
            <mesh position={[0, 0.32, 0]} castShadow>
              <cylinderGeometry args={[0.42, 0.3, 0.64, 12]} />
              <meshStandardMaterial color="#E07A5F" roughness={0.7} />
            </mesh>
            {/* Dark Soil */}
            <mesh position={[0, 0.62, 0]}>
              <cylinderGeometry args={[0.39, 0.39, 0.05, 12]} />
              <meshStandardMaterial color="#3D2614" roughness={0.9} />
            </mesh>
            {/* Tropical Palm Fronds */}
            {[0, Math.PI * 0.4, Math.PI * 0.8, Math.PI * 1.2, Math.PI * 1.6].map((pang, fi) => (
              <mesh
                key={fi}
                position={[Math.cos(pang) * 0.28, 0.85, Math.sin(pang) * 0.28]}
                rotation={[0.35 * Math.sin(pang), pang, 0.35 * Math.cos(pang)]}
                castShadow
              >
                <sphereGeometry args={[0.26, 8, 8]} />
                <meshStandardMaterial color={fi % 2 === 0 ? '#2D6A4F' : '#40916C'} roughness={0.6} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Resort Wooden Post & Lifebuoy Ring on East Deck */}
        <group position={[11.2, 0.36, 0]}>
          <mesh position={[0, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
            <meshStandardMaterial color="#8D5B4C" roughness={0.7} />
          </mesh>
          <mesh position={[0, 1.05, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
            <torusGeometry args={[0.26, 0.07, 12, 24]} />
            <meshStandardMaterial color="#E63946" roughness={0.3} />
          </mesh>
          {/* White Lifebuoy Stripes */}
          {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((sang, si) => (
            <mesh
              key={si}
              position={[Math.cos(sang) * 0.26, 1.05 + Math.sin(sang) * 0.26, 0]}
              rotation={[0, 0, sang]}
            >
              <boxGeometry args={[0.05, 0.16, 0.15]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
          ))}
        </group>

        {/* Stainless Steel Deep-End Pool Ladder Handrails (Northeast rim) */}
        <group position={[6.8, 0.36, -5.9]}>
          {[-0.3, 0.3].map((lx, idx) => (
            <mesh key={idx} position={[lx, 0.4, 0]} castShadow>
              <cylinderGeometry args={[0.025, 0.025, 0.8, 10]} />
              <meshStandardMaterial color="#CED4DA" metalness={0.9} roughness={0.1} />
            </mesh>
          ))}
          {/* Ladder Rungs dipping into pool water */}
          {[0.2, 0.0, -0.2].map((ry, ri) => (
            <mesh key={ri} position={[0, ry, -0.12]}>
              <boxGeometry args={[0.56, 0.03, 0.04]} />
              <meshStandardMaterial color="#CED4DA" metalness={0.9} roughness={0.1} />
            </mesh>
          ))}
        </group>

        {/* Flush Recessed Deck Night Lights */}
        {[
          { x: -11.4, z: -3.5 },
          { x: -11.4, z: 3.5 },
          { x: 11.4, z: -3.5 },
          { x: 11.4, z: 3.5 },
          { x: -5.0, z: 9.2 },
          { x: 5.0, z: 9.2 },
          { x: -5.0, z: -9.2 },
          { x: 5.0, z: -9.2 },
        ].map((dl, dli) => (
          <group key={`deck-light-${dli}`} position={[dl.x, 0.365, dl.z]}>
            <mesh>
              <cylinderGeometry args={[0.08, 0.08, 0.015, 12]} />
              <meshStandardMaterial
                color="#FFE6A7"
                emissive={isNight ? '#FFD166' : '#FFE6A7'}
                emissiveIntensity={isNight ? 1.6 : 0.2}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* ============================================================== */}
      {/* 2. MAIN SWIMMING POOL & WATER MUSHROOM FOUNTAIN                */}
      {/* ============================================================== */}
      <AnimatedPoolWater />
      <WaterMushroomFountain />

      {/* ============================================================== */}
      {/* 3. GRAND WATERPARK CASTLE SLIDE (SLEEK, CLEAN, ZERO ARTIFACTS)*/}
      {/* ============================================================== */}
      <GrandWaterparkSlide />

      {/* ============================================================== */}
      {/* 4. INTERACTIVE SPRINGBOARD DIVING BOARD (BOING!)               */}
      {/* ============================================================== */}
      <InteractiveDivingBoard />

      {/* ============================================================== */}
      {/* 5. INFLATABLE FLOATIES & CUTE FLOATING POOL TOYS               */}
      {/* ============================================================== */}
      {activeRide !== 'flamingo' && (
        <group ref={flamingoBobRef} position={[-3.0, 0.30, -30.0]}>
          <FlamingoFloatModel />
          <Billboard position={[0, 1.8, 0]}>
            <Text fontSize={0.22} color="#FF007F" outlineWidth={0.03} outlineColor="#FFF" anchorY="middle">
              🦩 Pelampung Flamingo
            </Text>
          </Billboard>
        </group>
      )}

      {/* Rainbow Donut Float */}
      <group ref={donutBobRef} position={[4.0, 0.30, -33.5]}>
        <DonutFloatModel />
      </group>

      {/* Cute Floating Yellow Rubber Duck */}
      <group ref={duckBobRef} position={[-4.5, 0.30, -27.5]}>
        <RubberDuckModel />
      </group>

      {/* Floating Rainbow Beach Ball */}
      <group ref={ballBobRef} position={[3.5, 0.30, -27.5]}>
        <BeachBallModel />
      </group>

      {/* ============================================================== */}
      {/* 6. POOLSIDE SUN LOUNGERS & TROPICAL FRUIT REFRESHMENT BAR      */}
      {/* ============================================================== */}
      <PoolsideCabanaAndLoungers />

      {/* ============================================================== */}
      {/* 7. GRAND BACKYARD GARDEN PROMENADE, PATHWAYS & FLOWERS         */}
      {/* ============================================================== */}
      <BackyardGardenPromenade />

      {/* ============================================================== */}
      {/* 8. WHITE PICKET FENCE & PERIMETER HEDGES (OUTER BOUNDARIES)    */}
      {/* ============================================================== */}
      <BackyardPerimeterFence />

      {/* ============================================================== */}
      {/* 9. SECRET TREEHOUSE & GIANT OAK TREE (WEST ZONE)               */}
      {/* ============================================================== */}
      <SecretTreehouse />

      {/* ============================================================== */}
      {/* 10. FAMILY GLAMPING TEEPEE TENT & CAMPFIRE (NORTHWEST ZONE)    */}
      {/* ============================================================== */}
      <FamilyGlampingCamp />

      {/* ============================================================== */}
      {/* 11. SUNFLOWER GARDEN, WOODEN GAZEBO & TEA (EAST ZONE)          */}
      {/* ============================================================== */}
      <SunflowerGarden />

      {/* ============================================================== */}
      {/* 12. BACKYARD GARDEN SWING                                      */}
      {/* ============================================================== */}
      <BackyardGardenSwing />
    </group>
  );
};
