import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Billboard, Text } from '@react-three/drei';
import { useGameStore, gameStore, SandboxObject, SandboxPart } from '../../../state/useGameStore';
import { soundManager } from '../../../sound/audioManager';

// Safe renderer for individual geometric part with fallbacks
export const RenderSandboxPart: React.FC<{ part: SandboxPart }> = ({ part }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = part.color || '#F472B6';
  const emissive = part.emissive || '#000000';
  const emissiveIntensity = part.emissiveIntensity ?? 0.2;
  const roughness = part.roughness ?? 0.35;
  const metalness = part.metalness ?? 0.1;
  const opacity = part.opacity ?? 1.0;
  const transparent = opacity < 1.0;
  const args = part.args || [];

  const geometry = useMemo(() => {
    try {
      switch (part.shape) {
        case 'box':
          return new THREE.BoxGeometry(args[0] ?? 1, args[1] ?? 1, args[2] ?? 1);
        case 'sphere':
          return new THREE.SphereGeometry(args[0] ?? 0.5, args[1] ?? 16, args[2] ?? 16);
        case 'cylinder':
          return new THREE.CylinderGeometry(
            args[0] ?? 0.5,
            args[1] ?? 0.5,
            args[2] ?? 1,
            args[3] ?? 16
          );
        case 'cone':
          return new THREE.ConeGeometry(args[0] ?? 0.5, args[1] ?? 1, args[2] ?? 16);
        case 'torus':
          return new THREE.TorusGeometry(
            args[0] ?? 0.6,
            args[1] ?? 0.2,
            args[2] ?? 12,
            args[3] ?? 24
          );
        case 'capsule':
          return new THREE.CapsuleGeometry(
            args[0] ?? 0.3,
            args[1] ?? 0.6,
            args[2] ?? 8,
            args[3] ?? 16
          );
        case 'ring':
          return new THREE.RingGeometry(args[0] ?? 0.3, args[1] ?? 0.7, args[2] ?? 16);
        case 'dodecahedron':
          return new THREE.DodecahedronGeometry(args[0] ?? 0.5, args[1] ?? 0);
        default:
          return new THREE.SphereGeometry(0.5, 12, 12);
      }
    } catch {
      return new THREE.SphereGeometry(0.5, 12, 12);
    }
  }, [part.shape, JSON.stringify(args)]);

  const partScale: [number, number, number] = useMemo(() => {
    if (typeof part.scale === 'number') {
      return [part.scale, part.scale, part.scale];
    }
    if (Array.isArray(part.scale) && part.scale.length === 3) {
      return part.scale as [number, number, number];
    }
    return [1, 1, 1];
  }, [part.scale]);

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={part.pos || [0, 0, 0]}
      rotation={part.rot || [0, 0, 0]}
      scale={partScale}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        roughness={roughness}
        metalness={metalness}
        transparent={transparent}
        opacity={opacity}
      />
    </mesh>
  );
};

// Single Animated Sandbox Entity (Non-kickable)
const SingleSandboxEntity: React.FC<{ item: SandboxObject }> = ({ item }) => {
  const groupRef = useRef<THREE.Group>(null);
  const currentPos = useRef(new THREE.Vector3(...item.position));
  const squishAnim = useRef(0);
  const lastBounce = useRef(0);
  const wasNear = useRef(false);

  const seed = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < item.id.length; i++) hash += item.id.charCodeAt(i);
    return (hash % 100) / 10;
  }, [item.id]);

  // Compute maximum height among parts for the billboard placement
  const maxPartHeight = useMemo(() => {
    let maxH = 1.2;
    for (const p of item.parts) {
      if (p.pos && p.pos[1] > maxH) maxH = p.pos[1];
    }
    return maxH + 0.5;
  }, [item.parts]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    const playerPos = gameStore.getState().playerPos;
    const sandboxRidingId = gameStore.getState().sandboxRidingId;
    const isMounted = sandboxRidingId === item.id;

    // 1. Vehicle Mount Handling (Khaulah is driving this object!)
    if (isMounted) {
      const facing = gameStore.getState().playerFacingAngle;
      groupRef.current.position.set(
        playerPos[0],
        Math.max(0.08, playerPos[1] - 0.05),
        playerPos[2]
      );
      groupRef.current.rotation.y = facing;
      groupRef.current.scale.set(item.scale, item.scale, item.scale);
      return;
    }

    // Squish animation recovery
    if (squishAnim.current > 0) {
      squishAnim.current = Math.max(0, squishAnim.current - delta * 3.5);
    }

    const baseScale = item.scale || 1.0;
    const squishFactor = squishAnim.current;
    groupRef.current.scale.set(
      baseScale * (1 + squishFactor * 0.35),
      baseScale * (1 - squishFactor * 0.45),
      baseScale * (1 + squishFactor * 0.35)
    );

    // 2. Behavior animations
    switch (item.behavior) {
      case 'bounce': {
        const hop = Math.abs(Math.sin(t * 3.6 + seed));
        groupRef.current.position.set(
          currentPos.current.x,
          currentPos.current.y + hop * 0.75,
          currentPos.current.z
        );
        groupRef.current.rotation.y = t * 0.8 + seed;
        break;
      }
      case 'float': {
        groupRef.current.position.set(
          currentPos.current.x,
          currentPos.current.y + 0.4 + Math.sin(t * 2.2 + seed) * 0.3,
          currentPos.current.z
        );
        groupRef.current.rotation.y = t * 0.45 + seed;
        groupRef.current.rotation.z = Math.sin(t * 1.6 + seed) * 0.08;
        break;
      }
      case 'spin': {
        groupRef.current.position.set(
          currentPos.current.x,
          currentPos.current.y + Math.sin(t * 1.8 + seed) * 0.12,
          currentPos.current.z
        );
        groupRef.current.rotation.y = t * 2.2 + seed;
        break;
      }
      case 'orbit': {
        const orbitRadius = 2.2;
        groupRef.current.position.set(
          currentPos.current.x + Math.cos(t * 1.3 + seed) * orbitRadius,
          currentPos.current.y + 0.3 + Math.sin(t * 2.5 + seed) * 0.18,
          currentPos.current.z + Math.sin(t * 1.3 + seed) * orbitRadius
        );
        groupRef.current.rotation.y = -t * 1.3;
        break;
      }
      case 'follow': {
        const dx = playerPos[0] - groupRef.current.position.x;
        const dz = playerPos[2] - groupRef.current.position.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 2.2 && dist < 28) {
          const spd = 2.5 * delta;
          groupRef.current.position.x += (dx / dist) * spd;
          groupRef.current.position.z += (dz / dist) * spd;
          groupRef.current.rotation.y = Math.atan2(dx, dz);
          groupRef.current.position.y = currentPos.current.y + Math.abs(Math.sin(t * 5.5)) * 0.22;
          groupRef.current.rotation.z = Math.sin(t * 5.5) * 0.06;
        } else {
          groupRef.current.position.y = currentPos.current.y + Math.sin(t * 1.6) * 0.06;
        }
        break;
      }
      case 'trampoline': {
        groupRef.current.position.copy(currentPos.current);
        const distSq =
          (playerPos[0] - currentPos.current.x) ** 2 + (playerPos[2] - currentPos.current.z) ** 2;
        if (distSq < 2.2 && Math.abs(playerPos[1] - currentPos.current.y) < 1.4) {
          if (Date.now() - lastBounce.current > 900) {
            lastBounce.current = Date.now();
            squishAnim.current = 1.0;
            gameStore.addJumpBuff(12);
            soundManager.playTrampoline();
          }
        }
        break;
      }
      default: {
        // Idle gentle breathing
        groupRef.current.position.set(
          currentPos.current.x,
          currentPos.current.y + Math.sin(t * 1.5 + seed) * 0.06,
          currentPos.current.z
        );
        break;
      }
    }

    // 3. Dynamic Nearby Interaction Context
    const distToPlayer = Math.hypot(
      playerPos[0] - groupRef.current.position.x,
      playerPos[2] - groupRef.current.position.z
    );

    if (distToPlayer < 2.2 && !isMounted) {
      wasNear.current = true;
      let promptText = `Kagumi ${item.title} ✨`;
      let actionId = `sandbox_look_${item.id}`;

      if (item.interactionType === 'rideable') {
        promptText = `Naiki ${item.title} 🚗`;
        actionId = `sandbox_ride_${item.id}`;
      } else if (item.interactionType === 'edible') {
        promptText = `Makan ${item.title} 😋`;
        actionId = `sandbox_eat_${item.id}`;
      } else if (item.interactionType === 'companion') {
        promptText = `Elus & Sapa ${item.title} 💖`;
        actionId = `sandbox_pet_${item.id}`;
      } else if (item.interactionType === 'musical') {
        promptText = `Mainkan ${item.title} 🎶`;
        actionId = `sandbox_music_${item.id}`;
      } else if (item.interactionType === 'trampoline') {
        promptText = `Lompat di ${item.title} 🦘`;
        actionId = `sandbox_bounce_${item.id}`;
      }

      const curInteractable = gameStore.getState().nearbyInteractable;
      if (!curInteractable || curInteractable.id !== actionId) {
        gameStore.setNearbyInteractable({
          id: actionId,
          title: item.title,
          prompt: promptText,
        });
      }
    } else if (distToPlayer >= 2.6 && wasNear.current) {
      wasNear.current = false;
      const curInteractable = gameStore.getState().nearbyInteractable;
      if (curInteractable && curInteractable.id.endsWith(item.id)) {
        gameStore.setNearbyInteractable(null);
      }
    }
  });

  const getTagColor = () => {
    switch (item.interactionType) {
      case 'rideable':
        return '#EC4899';
      case 'edible':
        return '#F59E0B';
      case 'companion':
        return '#8B5CF6';
      case 'musical':
        return '#3B82F6';
      case 'trampoline':
        return '#EF4444';
      default:
        return '#7C3AED';
    }
  };

  const getTagIcon = () => {
    switch (item.interactionType) {
      case 'rideable':
        return '🚗';
      case 'edible':
        return '😋';
      case 'companion':
        return '💖';
      case 'musical':
        return '🎶';
      case 'trampoline':
        return '🦘';
      default:
        return '✨';
    }
  };

  return (
    <group ref={groupRef} position={item.position}>
      {/* Magic Ground Aura Ring */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55 * item.scale, 0.72 * item.scale, 24]} />
        <meshBasicMaterial color="#F472B6" transparent opacity={0.4} />
      </mesh>

      {/* Point Light for glowing aura */}
      <pointLight color="#FDE047" distance={3.5} intensity={0.6} position={[0, 1.0, 0]} />

      {/* Render all 3D parts */}
      {item.parts.map((part, idx) => (
        <RenderSandboxPart key={`${item.id}_part_${idx}`} part={part} />
      ))}

      {/* Floating 3D Title Banner with Interaction Icon */}
      <Billboard position={[0, maxPartHeight * item.scale + 0.35, 0]}>
        <mesh>
          <planeGeometry args={[Math.max(1.5, item.title.length * 0.11), 0.36]} />
          <meshBasicMaterial color={getTagColor()} transparent opacity={0.88} />
        </mesh>
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.13}
          color="#FFFBEB"
          anchorX="center"
          anchorY="middle"
        >
          {`${getTagIcon()} ${item.title}`}
        </Text>
      </Billboard>
    </group>
  );
};

export const MagicSandboxRenderer: React.FC = () => {
  const sandboxObjects = useGameStore((s) => s.sandboxObjects);

  // Kickable objects are handled by Rapier physics in PhysicsWorld
  const nonKickableObjects = useMemo(
    () => (sandboxObjects || []).filter((obj) => obj.interactionType !== 'kickable'),
    [sandboxObjects]
  );

  if (!nonKickableObjects || nonKickableObjects.length === 0) return null;

  return (
    <group>
      {nonKickableObjects.map((obj) => (
        <SingleSandboxEntity key={obj.id} item={obj} />
      ))}
    </group>
  );
};
