import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, gameStore } from '../../../state/useGameStore';
import { soundManager } from '../../../sound/audioManager';

/**
 * Balon Udara (Hot Air Balloon Ride)
 * Huge colorful balloon that lifts Khaulah high into the sky for a scenic flight tour of the entire island!
 */
export const BalonUdara: React.FC = () => {
  const activeRide = useGameStore((s) => s.activeRide);
  const isRiding = activeRide === 'hot_air_balloon';
  const groupRef = useRef<THREE.Group>(null);
  const burnerGlowRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    if (isRiding) {
      const motion = gameStore.getState();
      groupRef.current.position.set(motion.playerPos[0], motion.playerPos[1] - 0.1, motion.playerPos[2]);
      groupRef.current.rotation.y = motion.playerFacingAngle;
    }
    const t = state.clock.getElapsedTime();

    // Proximity check when parked
    const p = gameStore.getState().playerPos;
    const distBalloon = Math.hypot(p[0] - 50, p[2] - 85);
    const near = gameStore.getState().nearbyInteractable;

    if (!isRiding && distBalloon < 5.0 && p[1] < 3.0) {
      if (near?.id !== 'hot_air_balloon') {
        gameStore.setNearbyInteractable({
          id: 'hot_air_balloon',
          title: 'Balon Udara Fantasi 🎈☁️',
          prompt: 'Tekan [E] untuk Terbang Keliling Pulau Menembus Awan! ✨',
        });
      }
    } else if (near?.id === 'hot_air_balloon' && !isRiding && distBalloon >= 5.0) {
      gameStore.setNearbyInteractable(null);
    }

    // Flame flicker
    if (burnerGlowRef.current) {
      burnerGlowRef.current.intensity = 1.5 + Math.sin(t * 12) * 0.4;
    }

    // Parked gentle bob
    if (!isRiding) {
      groupRef.current.position.set(50, 0.4 + Math.sin(t * 1.8) * 0.15, 85);
      groupRef.current.rotation.y = Math.sin(t * 0.6) * 0.1;
    }
  });

  // When Khaulah is riding, the balloon is rendered in PlayerKhaulah or follows player flight trajectory!

  return (
    <group
      ref={groupRef}
      position={[50, 0.4, 85]}
      onClick={(e) => {
        e.stopPropagation();
        if (isRiding) return;
        gameStore.setActiveRide('hot_air_balloon');
        gameStore.unlockSticker('balon');
        soundManager.playMagicSpell();
        gameStore.setMessage('WUUUSSH! Balon Udara Fantasi terbang tinggi menembus awan! 🎈☁️✨');
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {/* 1. WICKER PASSENGER BASKET */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 1.1, 1.6]} />
        <meshStandardMaterial color="#B45309" roughness={0.9} />
      </mesh>
      {/* Basket Rim */}
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[1.7, 0.1, 1.7]} />
        <meshStandardMaterial color="#78350F" />
      </mesh>

      {/* 2. BURNER & SUPPORT ROPES */}
      {/* Support Poles */}
      {[
        [-0.7, -0.7],
        [0.7, -0.7],
        [-0.7, 0.7],
        [0.7, 0.7],
      ].map(([rx, rz], idx) => (
        <mesh key={idx} position={[rx, 1.8, rz]}>
          <cylinderGeometry args={[0.025, 0.025, 1.5, 6]} />
          <meshStandardMaterial color="#475569" metalness={0.7} />
        </mesh>
      ))}

      {/* Burner Flame Core */}
      <mesh position={[0, 2.5, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#F97316" emissive="#EA580C" emissiveIntensity={1.2} />
      </mesh>
      <pointLight ref={burnerGlowRef} color="#F97316" intensity={1.8} distance={8} position={[0, 2.5, 0]} />

      {/* 3. MASSIVE COLORFUL BALLOON ENVELOPE */}
      <group position={[0, 7.8, 0]}>
        {/* Main Tear-Drop / Spherical Balloon */}
        <mesh castShadow>
          <sphereGeometry args={[4.2, 24, 20]} />
          <meshStandardMaterial color="#EF4444" roughness={0.3} />
        </mesh>
        {/* Rainbow Stripes across balloon */}
        {[
          { color: '#F59E0B', rotY: 0 },
          { color: '#10B981', rotY: Math.PI / 3 },
          { color: '#3B82F6', rotY: (Math.PI * 2) / 3 },
          { color: '#8B5CF6', rotY: Math.PI },
          { color: '#EC4899', rotY: (Math.PI * 4) / 3 },
        ].map((st, i) => (
          <mesh key={i} rotation={[0, st.rotY, 0]}>
            <sphereGeometry args={[4.23, 16, 12, 0, 0.5]} />
            <meshStandardMaterial color={st.color} roughness={0.3} />
          </mesh>
        ))}
        {/* Lower Neck Cone */}
        <mesh position={[0, -3.4, 0]}>
          <coneGeometry args={[1.5, 2.2, 16, 1, true]} />
          <meshStandardMaterial color="#EF4444" roughness={0.3} />
        </mesh>
      </group>

      <Billboard position={[0, 3.2, 0]}>
        <Text fontSize={0.25} color="#EF4444" outlineWidth={0.03} outlineColor="#FFF" anchorY="middle">
          🎈 Balon Udara Fantasi
        </Text>
      </Billboard>
    </group>
  );
};
