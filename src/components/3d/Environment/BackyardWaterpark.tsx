import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, gameStore } from '../../../state/useGameStore';
import { soundManager } from '../../../sound/audioManager';
import { colliders } from '../../../state/colliders';

// Animated Sparkling Pool Water
const AnimatedPoolWater: React.FC = () => {
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!waterRef.current) return;
    const t = state.clock.getElapsedTime();
    waterRef.current.position.y = 0.28 + Math.sin(t * 2.2) * 0.012;
  });

  return (
    <group position={[4, 0, -24]}>
      {/* Pool Basin Floor - Azure Mosaic Tiles */}
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[12.4, 0.08, 8.4]} />
        <meshStandardMaterial color="#48CAE4" roughness={0.25} />
      </mesh>

      {/* Pool Basin Mosaic Interior Walls */}
      <mesh position={[0, 0.18, 4.1]}>
        <boxGeometry args={[12.4, 0.28, 0.2]} />
        <meshStandardMaterial color="#0096C7" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.18, -4.1]}>
        <boxGeometry args={[12.4, 0.28, 0.2]} />
        <meshStandardMaterial color="#0096C7" roughness={0.3} />
      </mesh>
      <mesh position={[6.1, 0.18, 0]}>
        <boxGeometry args={[0.2, 0.28, 8.2]} />
        <meshStandardMaterial color="#0096C7" roughness={0.3} />
      </mesh>
      <mesh position={[-6.1, 0.18, 0]}>
        <boxGeometry args={[0.2, 0.28, 8.2]} />
        <meshStandardMaterial color="#0096C7" roughness={0.3} />
      </mesh>

      {/* Crystal Clear Swimming Pool Water Surface */}
      <mesh ref={waterRef} position={[0, 0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12.0, 8.0]} />
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

      {/* Stainless Steel Pool Handrails at Entrance Steps */}
      {[-0.6, 0.6].map((hx, idx) => (
        <group key={idx} position={[hx, 0.55, 4.0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.8, 12]} />
            <meshStandardMaterial color="#CED4DA" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Built-in Shallow Entrance Steps */}
      {[0.20, 0.12, 0.06].map((sy, idx) => (
        <mesh key={idx} position={[0, sy, 3.4 - idx * 0.45]}>
          <boxGeometry args={[2.6, 0.08, 0.45]} />
          <meshStandardMaterial color="#90E0EF" roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
};

// Cute Water Mushroom Fountain (Spouting fresh water into shallow pool)
const WaterMushroomFountain: React.FC = () => {
  const dropletsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!dropletsRef.current) return;
    const t = state.clock.getElapsedTime();
    dropletsRef.current.children.forEach((child, i) => {
      const drop = child as THREE.Mesh;
      const progress = ((t * 2.5 + i * 0.2) % 1);
      drop.position.y = 1.3 - progress * 1.1;
      const mat = drop.material as THREE.MeshStandardMaterial;
      if (mat) mat.opacity = 1 - progress * 0.6;
    });
  });

  return (
    <group position={[0, 0.28, -21.5]}>
      {/* Mushroom Fountain Stem */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 1.5, 12]} />
        <meshStandardMaterial color="#E0FBFC" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Yellow/Orange Mushroom Cap */}
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

// Giant Pink Inflatable Flamingo Float Model
export const FlamingoFloatModel: React.FC = () => {
  return (
    <group>
      {/* Inflatable Ring Body */}
      <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.9, 0.3, 16, 24]} />
        <meshStandardMaterial color="#FF69B4" roughness={0.35} />
      </mesh>
      {/* Flamingo Elegant Curved Neck */}
      <mesh position={[0, 0.85, -0.9]} rotation={[-0.2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 1.2, 10]} />
        <meshStandardMaterial color="#FF69B4" roughness={0.35} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.45, -1.05]} castShadow>
        <sphereGeometry args={[0.24, 12, 12]} />
        <meshStandardMaterial color="#FF69B4" roughness={0.35} />
      </mesh>
      {/* Golden Princess Crown atop Flamingo */}
      <mesh position={[0, 1.72, -1.05]}>
        <cylinderGeometry args={[0.14, 0.1, 0.16, 6]} />
        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Beak (Black tip, pink base) */}
      <mesh position={[0, 1.38, -1.35]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.1, 0.35, 8]} />
        <meshStandardMaterial color="#2B2D42" />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.16, 1.5, -1.1]}>
        <sphereGeometry args={[0.035, 6, 6]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      <mesh position={[-0.16, 1.5, -1.1]}>
        <sphereGeometry args={[0.035, 6, 6]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      {/* Fluffy Tail */}
      <mesh position={[0, 0.45, 1.0]} rotation={[-0.4, 0, 0]} castShadow>
        <coneGeometry args={[0.25, 0.5, 6]} />
        <meshStandardMaterial color="#FF85A1" />
      </mesh>
    </group>
  );
};

// Rainbow Glazed Donut Float Model
export const DonutFloatModel: React.FC = () => {
  return (
    <group>
      {/* Donut Dough Base */}
      <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.85, 0.32, 16, 24]} />
        <meshStandardMaterial color="#E9C46A" roughness={0.6} />
      </mesh>
      {/* Pink Strawberry Glaze */}
      <mesh position={[0, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.85, 0.25, 16, 24]} />
        <meshStandardMaterial color="#FF007F" roughness={0.3} />
      </mesh>
      {/* Rainbow Sprinkles */}
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

// Curved Kids' Water Slide
const CurvedWaterSlide: React.FC = () => {
  return (
    <group position={[10, 0, -29]}>
      {/* Tower Support Pillars */}
      {[-0.9, 0.9].map((px, idx) => (
        <React.Fragment key={idx}>
          <mesh position={[px, 1.7, -0.9]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 3.4, 8]} />
            <meshStandardMaterial color="#3A86FF" />
          </mesh>
          <mesh position={[px, 1.7, 0.9]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 3.4, 8]} />
            <meshStandardMaterial color="#3A86FF" />
          </mesh>
        </React.Fragment>
      ))}

      {/* Top Platform Deck */}
      <mesh position={[0, 3.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.16, 2.2]} />
        <meshStandardMaterial color="#FFBE0B" roughness={0.5} />
      </mesh>
      {/* Platform Safety Railings */}
      <mesh position={[-1.05, 3.9, 0]}>
        <boxGeometry args={[0.1, 0.9, 2.2]} />
        <meshStandardMaterial color="#FB5607" />
      </mesh>
      <mesh position={[0, 3.9, -1.05]}>
        <boxGeometry args={[2.2, 0.9, 0.1]} />
        <meshStandardMaterial color="#FB5607" />
      </mesh>

      {/* Ladder Steps at Back */}
      {[0.5, 1.0, 1.5, 2.0, 2.5, 3.0].map((ly, idx) => (
        <mesh key={idx} position={[0, ly, 1.05]} castShadow>
          <boxGeometry args={[1.4, 0.1, 0.2]} />
          <meshStandardMaterial color="#FF006E" />
        </mesh>
      ))}

      {/* Water Slide Chute (Slanting down toward pool at Z: +5) */}
      <group position={[-1.8, 1.7, 2.5]} rotation={[-0.45, 0.35, 0]}>
        {/* Slide Chute Bed */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.4, 0.12, 6.2]} />
          <meshStandardMaterial color="#00F5D4" roughness={0.15} metalness={0.1} />
        </mesh>
        {/* Safety Bumpers */}
        <mesh position={[-0.72, 0.22, 0]}>
          <boxGeometry args={[0.14, 0.42, 6.2]} />
          <meshStandardMaterial color="#8338EC" />
        </mesh>
        <mesh position={[0.72, 0.22, 0]}>
          <boxGeometry args={[0.14, 0.42, 6.2]} />
          <meshStandardMaterial color="#8338EC" />
        </mesh>
      </group>

      {/* Water Spray Arch at Entrance */}
      <mesh position={[-0.8, 4.3, 0.9]} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[0.7, 0.05, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#00B4D8" />
      </mesh>
    </group>
  );
};

// Secret Wooden Treehouse with Telescope & Spiral Slide
const SecretTreehouse: React.FC = () => {
  return (
    <group position={[-14, 0, -24]}>
      {/* Massive Oak Tree Trunk */}
      <mesh position={[0, 2.4, 0]} castShadow>
        <cylinderGeometry args={[0.75, 1.1, 4.8, 10]} />
        <meshStandardMaterial color="#582F0E" roughness={0.9} />
      </mesh>
      {/* Roots */}
      {[0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].map((ang, idx) => (
        <mesh
          key={idx}
          position={[Math.cos(ang) * 0.9, 0.3, Math.sin(ang) * 0.9]}
          rotation={[0.4 * Math.sin(ang), 0, 0.4 * Math.cos(ang)]}
        >
          <cylinderGeometry args={[0.2, 0.35, 1.0, 6]} />
          <meshStandardMaterial color="#582F0E" />
        </mesh>
      ))}

      {/* Massive Tree Foliage Canopy */}
      <mesh position={[0, 5.8, 0]} castShadow>
        <sphereGeometry args={[3.4, 14, 14]} />
        <meshStandardMaterial color="#2D6A4F" roughness={0.7} />
      </mesh>
      <mesh position={[1.4, 6.8, -1.0]} castShadow>
        <sphereGeometry args={[2.5, 12, 12]} />
        <meshStandardMaterial color="#386641" roughness={0.7} />
      </mesh>
      <mesh position={[-1.4, 6.6, 1.2]} castShadow>
        <sphereGeometry args={[2.4, 12, 12]} />
        <meshStandardMaterial color="#40916C" roughness={0.7} />
      </mesh>

      {/* Wooden Treehouse Deck Platform (Y: 3.4) */}
      <mesh position={[0, 3.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.22, 4.2]} />
        <meshStandardMaterial color="#8D5B4C" roughness={0.7} />
      </mesh>
      {/* Rustic Log Railings */}
      {[-2.0, 2.0].map((rx, idx) => (
        <mesh key={idx} position={[rx, 3.9, 0]}>
          <boxGeometry args={[0.12, 0.8, 4.2]} />
          <meshStandardMaterial color="#6F4E37" />
        </mesh>
      ))}
      <mesh position={[0, 3.9, -2.0]}>
        <boxGeometry args={[4.2, 0.8, 0.12]} />
        <meshStandardMaterial color="#6F4E37" />
      </mesh>

      {/* Cozy Treehouse Cabin House */}
      <group position={[0.5, 3.5, 0.5]}>
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[2.6, 2.2, 2.4]} />
          <meshStandardMaterial color="#B08968" roughness={0.8} />
        </mesh>
        {/* Shingle Roof */}
        <mesh position={[0, 2.6, 0]} castShadow>
          <coneGeometry args={[2.2, 1.3, 4]} />
          <meshStandardMaterial color="#C85A32" roughness={0.6} />
        </mesh>
        {/* Cabin Window */}
        <mesh position={[0, 1.3, 1.21]}>
          <circleGeometry args={[0.4, 12]} />
          <meshStandardMaterial color="#90E0EF" roughness={0.2} />
        </mesh>
      </group>

      {/* Brass Telescope on Deck Facing the Village */}
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
        <mesh key={idx} position={[-2.0, ly, 1.2]} castShadow>
          <boxGeometry args={[0.6, 0.08, 0.12]} />
          <meshStandardMaterial color="#A67C52" />
        </mesh>
      ))}
    </group>
  );
};

// Family Glamping & Marshmallow Campfire Spot
const FamilyGlampingCamp: React.FC = () => {
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const isNight = timeOfDay === 'malam' || timeOfDay === 'sore' || timeOfDay === 'subuh';

  return (
    <group position={[-14, 0, -32]}>
      {/* Colorful Striped Teepee Tent */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 1.8, 0]} castShadow>
          <coneGeometry args={[2.2, 3.6, 6]} />
          <meshStandardMaterial color="#FEFAE0" roughness={0.8} />
        </mesh>
        {/* Tent Pattern Trim */}
        <mesh position={[0, 1.1, 0]}>
          <coneGeometry args={[2.22, 0.4, 6]} />
          <meshStandardMaterial color="#E07A5F" />
        </mesh>
        {/* Tent Poles Protruding from Top */}
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
        {/* Tent Open Entrance */}
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
      {/* Picnic Basket */}
      <mesh position={[3.2, 0.22, -0.6]} castShadow>
        <boxGeometry args={[0.65, 0.35, 0.45]} />
        <meshStandardMaterial color="#D4A373" roughness={0.7} />
      </mesh>

      {/* Cozy Campfire Ring with Marshmallows */}
      <group position={[2.8, 0, 2.2]}>
        {/* Stones Ring */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((si) => {
          const ang = (si * Math.PI * 2) / 8;
          return (
            <mesh key={si} position={[Math.cos(ang) * 0.7, 0.08, Math.sin(ang) * 0.7]} scale={[0.2, 0.15, 0.2]}>
              <sphereGeometry args={[0.6, 6, 6]} />
              <meshStandardMaterial color="#78716C" roughness={0.9} />
            </mesh>
          );
        })}
        {/* Fire Logs */}
        <mesh position={[0, 0.12, 0]} rotation={[0, 0.6, 0]}>
          <boxGeometry args={[0.7, 0.14, 0.2]} />
          <meshStandardMaterial color="#4A2810" />
        </mesh>
        {/* Glowing Campfire Embers */}
        <mesh position={[0, 0.25, 0]}>
          <coneGeometry args={[0.28, 0.45, 6]} />
          <meshStandardMaterial
            color="#FF5400"
            emissive={isNight ? '#FF5400' : '#FF7B00'}
            emissiveIntensity={isNight ? 1.5 : 0.8}
          />
        </mesh>
        {isNight && <pointLight position={[0, 0.5, 0]} color="#FF8500" intensity={1.2} distance={8} />}
      </group>

      {/* Fairy String Lights Around Camp */}
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

// Sunflower Garden & Wooden Gazebo
const SunflowerGarden: React.FC = () => {
  return (
    <group position={[14, 0, -32]}>
      {/* Rustic Wooden Gazebo */}
      <group position={[0, 0, 0]}>
        {/* Gazebo Timber Floor */}
        <mesh position={[0, 0.16, 0]} receiveShadow>
          <cylinderGeometry args={[2.5, 2.6, 0.3, 8]} />
          <meshStandardMaterial color="#B08968" roughness={0.7} />
        </mesh>
        {/* 6 Pillars */}
        {[0, 1, 2, 3, 4, 5].map((pi) => {
          const ang = (pi * Math.PI * 2) / 6;
          return (
            <mesh key={pi} position={[Math.cos(ang) * 2.1, 1.5, Math.sin(ang) * 2.1]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 2.5, 8]} />
              <meshStandardMaterial color="#6F4E37" />
            </mesh>
          );
        })}
        {/* Gazebo Roof */}
        <mesh position={[0, 3.2, 0]} castShadow>
          <coneGeometry args={[2.8, 1.2, 8]} />
          <meshStandardMaterial color="#C85A32" roughness={0.6} />
        </mesh>
        {/* Wooden Bench inside */}
        <mesh position={[0, 0.45, -1.2]} castShadow>
          <boxGeometry args={[2.0, 0.1, 0.5]} />
          <meshStandardMaterial color="#6F4E37" />
        </mesh>
      </group>

      {/* Cheerful Sunflowers along the South Fence */}
      {[-8, -5, -2, 2, 5, 8].map((sx, idx) => (
        <group key={idx} position={[sx, 0, -3.2]}>
          {/* Stalk */}
          <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.03, 0.04, 1.6, 6]} />
            <meshStandardMaterial color="#386641" />
          </mesh>
          {/* Yellow Petals */}
          <mesh position={[0, 1.6, 0.1]} rotation={[0.2, 0, 0]}>
            <circleGeometry args={[0.32, 12]} />
            <meshStandardMaterial color="#FFBE0B" />
          </mesh>
          {/* Dark Seed Center */}
          <mesh position={[0, 1.6, 0.11]} rotation={[0.2, 0, 0]}>
            <circleGeometry args={[0.16, 10]} />
            <meshStandardMaterial color="#582F0E" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export const BackyardWaterpark: React.FC = () => {
  const flamingoBobRef = useRef<THREE.Group>(null);
  const donutBobRef = useRef<THREE.Group>(null);
  const activeRide = useGameStore((s) => s.activeRide);

  useEffect(() => {
    // 1. Water Slide Top Tower Platform (Y: 3.4)
    const slideTopBox = new THREE.Box3(
      new THREE.Vector3(8.8, 0, -30.2),
      new THREE.Vector3(11.2, 3.45, -27.8)
    );
    // 2. Secret Treehouse Deck Platform (Y: 3.4)
    const treehouseBox = new THREE.Box3(
      new THREE.Vector3(-16.2, 0, -26.2),
      new THREE.Vector3(-11.8, 3.45, -21.8)
    );
    // 3. Glamping picnic ground
    const campBox = new THREE.Box3(
      new THREE.Vector3(-16.5, 0, -34.5),
      new THREE.Vector3(-11.5, 0.4, -29.5)
    );

    // 4. Elevated Pool Deck Platform Frame Colliders (Y: 0.36)
    const deckN = { box: new THREE.Box3(new THREE.Vector3(-5, 0, -19.7), new THREE.Vector3(13, 0.36, -17.0)), type: 'ground' as const };
    const deckS = { box: new THREE.Box3(new THREE.Vector3(-5, 0, -31.0), new THREE.Vector3(13, 0.36, -28.3)), type: 'ground' as const };
    const deckE = { box: new THREE.Box3(new THREE.Vector3(10.3, 0, -28.3), new THREE.Vector3(13, 0.36, -19.7)), type: 'ground' as const };
    const deckW = { box: new THREE.Box3(new THREE.Vector3(-5, 0, -28.3), new THREE.Vector3(-2.3, 0.36, -19.7)), type: 'ground' as const };
    const poolFloor = { box: new THREE.Box3(new THREE.Vector3(-2.3, 0, -28.3), new THREE.Vector3(10.3, 0.25, -19.7)), type: 'ground' as const };

    const poolColliders = [
      { box: slideTopBox, type: 'ground' as const },
      { box: treehouseBox, type: 'ground' as const },
      { box: campBox, type: 'ground' as const },
      deckN,
      deckS,
      deckE,
      deckW,
      poolFloor,
    ];
    colliders.push(...poolColliders);

    return () => {
      poolColliders.forEach((c) => {
        const idx = colliders.indexOf(c);
        if (idx !== -1) colliders.splice(idx, 1);
      });
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

    // Proximity checks for waterpark attractions
    const playerPos = gameStore.getState().playerPos;

    // 1. Water Slide proximity check (Ladder is at [10, 0, -28])
    const distSlide = Math.hypot(playerPos[0] - 10, playerPos[2] - (-28));
    // 2. Flamingo Float proximity check (at [4, 0, -22])
    const distFlamingo = Math.hypot(playerPos[0] - 4, playerPos[2] - (-22));
    // 3. Treehouse proximity check (Ladder is at [-16, 0, -23])
    const distTree = Math.hypot(playerPos[0] - (-16), playerPos[2] - (-23));
    // 4. Glamping Campfire (at [-11, 0, -30])
    const distCamp = Math.hypot(playerPos[0] - (-11), playerPos[2] - (-30));

    if (distSlide < 3.8 && activeRide === 'none') {
      gameStore.setNearbyInteractable({
        id: 'pool_slide',
        title: 'Perosotan Air Waterpark 🛝🌊',
        prompt: 'Tekan [E] untuk Meluncur Wuuush! Byuuuur ke Kolam Renang! ✨',
      });
    } else if (distFlamingo < 3.5 && activeRide === 'none') {
      gameStore.setNearbyInteractable({
        id: 'flamingo_float',
        title: 'Pelampung Flamingo Gemas 🦩💖',
        prompt: 'Tekan [E] untuk Naik Pelampung Flamingo Cantik! ✨',
      });
    } else if (distTree < 3.8) {
      gameStore.setNearbyInteractable({
        id: 'treehouse',
        title: 'Rumah Pohon Rahasia 🏡🌳',
        prompt: 'Tekan [E] untuk Panjat ke Rumah Pohon Rahasia! ✨',
      });
    } else if (distCamp < 3.5) {
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
      {/* 1. ELEVATED POOL DECK PLATFORM (Open Timber Frame surrounding pool)  */}
      {/* ============================================================== */}
      <group position={[4, 0, -24]}>
        {/* Warm Timber Deck Border Planks (Framing the pool basin) */}
        {/* North Deck Plank */}
        <mesh position={[0, 0.18, 5.7]} receiveShadow>
          <boxGeometry args={[18, 0.36, 2.6]} />
          <meshStandardMaterial color="#C29B72" roughness={0.7} />
        </mesh>
        {/* South Deck Plank */}
        <mesh position={[0, 0.18, -5.7]} receiveShadow>
          <boxGeometry args={[18, 0.36, 2.6]} />
          <meshStandardMaterial color="#C29B72" roughness={0.7} />
        </mesh>
        {/* East Deck Plank */}
        <mesh position={[7.4, 0.18, 0]} receiveShadow>
          <boxGeometry args={[3.2, 0.36, 8.8]} />
          <meshStandardMaterial color="#C29B72" roughness={0.7} />
        </mesh>
        {/* West Deck Plank */}
        <mesh position={[-7.4, 0.18, 0]} receiveShadow>
          <boxGeometry args={[3.2, 0.36, 8.8]} />
          <meshStandardMaterial color="#C29B72" roughness={0.7} />
        </mesh>

        {/* Pool White Marble Coping Rim Borders (Hollow frame around water) */}
        <mesh position={[0, 0.34, 4.3]} receiveShadow>
          <boxGeometry args={[13.2, 0.06, 0.4]} />
          <meshStandardMaterial color="#F8F9FA" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.34, -4.3]} receiveShadow>
          <boxGeometry args={[13.2, 0.06, 0.4]} />
          <meshStandardMaterial color="#F8F9FA" roughness={0.4} />
        </mesh>
        <mesh position={[6.3, 0.34, 0]} receiveShadow>
          <boxGeometry args={[0.4, 0.06, 8.6]} />
          <meshStandardMaterial color="#F8F9FA" roughness={0.4} />
        </mesh>
        <mesh position={[-6.3, 0.34, 0]} receiveShadow>
          <boxGeometry args={[0.4, 0.06, 8.6]} />
          <meshStandardMaterial color="#F8F9FA" roughness={0.4} />
        </mesh>
      </group>

      {/* ============================================================== */}
      {/* 2. MAIN SWIMMING POOL & WATER MUSHROOM FOUNTAIN                */}
      {/* ============================================================== */}
      <AnimatedPoolWater />
      <WaterMushroomFountain />

      {/* ============================================================== */}
      {/* 3. CURVED KIDS' WATER SLIDE (Byuuur into pool!)                */}
      {/* ============================================================== */}
      <CurvedWaterSlide />

      {/* ============================================================== */}
      {/* 4. INFLATABLE FLOATIES (Flamingo & Rainbow Donut)              */}
      {/* ============================================================== */}
      {activeRide !== 'flamingo' && (
        <group ref={flamingoBobRef} position={[4, 0.30, -22]}>
          <FlamingoFloatModel />
          <Billboard position={[0, 1.8, 0]}>
            <Text fontSize={0.22} color="#FF007F" outlineWidth={0.03} outlineColor="#FFF" anchorY="middle">
              🦩 Pelampung Flamingo
            </Text>
          </Billboard>
        </group>
      )}

      {/* Rainbow Donut Float */}
      <group ref={donutBobRef} position={[7, 0.30, -26]}>
        <DonutFloatModel />
      </group>

      {/* ============================================================== */}
      {/* 5. POOLSIDE SUN LOUNGERS & TROPICAL FRUIT JUICE BAR            */}
      {/* ============================================================== */}
      <group position={[-2, 0.34, -27]}>
        {/* Sun Lounger 1 */}
        <group position={[0, 0, 0]} rotation={[0, 0.2, 0]}>
          <mesh position={[0, 0.15, 0]} castShadow>
            <boxGeometry args={[1.1, 0.2, 2.2]} />
            <meshStandardMaterial color="#FFF" />
          </mesh>
          <mesh position={[0, 0.35, -0.6]} rotation={[-0.4, 0, 0]}>
            <boxGeometry args={[1.05, 0.1, 0.9]} />
            <meshStandardMaterial color="#FF69B4" />
          </mesh>
        </group>
        {/* Tropical Parasol Beach Umbrella */}
        <group position={[1.4, 0, -0.8]}>
          <mesh position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 2.4, 8]} />
            <meshStandardMaterial color="#FFF" />
          </mesh>
          <mesh position={[0, 2.4, 0]} castShadow>
            <coneGeometry args={[1.5, 0.7, 12]} />
            <meshStandardMaterial color="#FFBE0B" />
          </mesh>
        </group>
        {/* Refreshing Juice Table with Sliced Watermelon 🍉 & Coconut 🥥 */}
        <group position={[1.4, 0, 0.6]}>
          <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.5, 0.5, 0.7, 12]} />
            <meshStandardMaterial color="#FFF" />
          </mesh>
          {/* Watermelon Slice */}
          <mesh position={[0, 0.75, 0.1]}>
            <cylinderGeometry args={[0.15, 0.15, 0.08, 8, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#E63946" />
          </mesh>
          {/* Fresh Green Coconut with Paper Straw */}
          <mesh position={[-0.18, 0.76, -0.15]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color="#55A630" />
          </mesh>
          {/* Straw */}
          <mesh position={[-0.18, 0.9, -0.15]} rotation={[0, 0, 0.2]}>
            <cylinderGeometry args={[0.015, 0.015, 0.2, 6]} />
            <meshStandardMaterial color="#FFBE0B" />
          </mesh>
        </group>
      </group>

      {/* ============================================================== */}
      {/* 6. SECRET TREEHOUSE & GIANT OAK TREE                           */}
      {/* ============================================================== */}
      <SecretTreehouse />

      {/* ============================================================== */}
      {/* 7. FAMILY GLAMPING TEEPEE TENT & CAMPFIRE                      */}
      {/* ============================================================== */}
      <FamilyGlampingCamp />

      {/* ============================================================== */}
      {/* 8. SUNFLOWER GARDEN & WOODEN GAZEBO                            */}
      {/* ============================================================== */}
      <SunflowerGarden />
    </group>
  );
};
