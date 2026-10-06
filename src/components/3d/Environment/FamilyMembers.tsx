import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { gameStore, useGameStore, TimeOfDay } from '../../../state/useGameStore';
import { addSolidBox, removeSolidCollider, SolidCollider } from '../../../state/colliders';

// ============================================================================
// LIVING NPC DIRECTOR: JADWAL KEHIDUPAN KELUARGA DI RUMAH LUAS
// ============================================================================
export const FAMILY_SCHEDULE: Record<
  TimeOfDay,
  {
    abi: { pos: [number, number, number]; status: string; text: string };
    ummi: { pos: [number, number, number]; status: string; text: string };
    faqih: { pos: [number, number, number]; status: string; text: string };
    khalid: { pos: [number, number, number]; status: string; text: string };
  }
> = {
  subuh: {
    abi: {
      pos: [154.8, 0.2, -15.0],
      status: 'Sholat & Dzikir di Musholla 🌅',
      text: 'Assalamu\'alaikum Kak Khaulah putri shalihah Abi! Fajar Subuh yang sejuk dan damai. Abi baru selesai sholat Subuh dan berdzikir mendoakan Kak Khaulah agar selalu cerdas, shalihah, dan bahagia! Abi sayang Khaulah!',
    },
    ummi: {
      pos: [165.5, 0.2, -9.5],
      status: 'Menyiapkan Sarapan di Dapur 🧕🍳',
      text: 'Assalamu\'alaikum Kak Khaulah bidadari shalihah Ummi! Ummi sedang menyiapkan sarapan kue pelangi dan susu hangat yang lezat di dapur. Ayo sarapan berkah dulu ya sayang!',
    },
    faqih: {
      pos: [160.0, 0.2, -10.5],
      status: 'Cilukba di Kereta Dorong 👶🍼',
      text: 'Uwaaa~ Cilukba! Adek Faqih bangun pagi ceria di kereta dorong hangat menyapa Kak Khaulah! 👶🍼',
    },
    khalid: {
      pos: [165.5, 0.2, -15.5],
      status: 'Bangun Tidur di Kasur Awan 👦💤',
      text: 'Hoaaam... Kak Khaulah! Khalid baru bangun tidur nih di kasur, tapi langsung semangat pas lihat Kak Khaulah! Ayo main bareng Khalid!',
    },
  },
  siang: {
    abi: {
      pos: [154.8, 0.2, -9.5],
      status: 'Fokus Coding Laptop 💻',
      text: 'Assalamu\'alaikum Kak Khaulah putri shalihah Abi! Abi sedang fokus mengetik kode dan coding di laptop untuk keluarga. Senyum ceria Kak Khaulah bikin semangat Abi berkobar terus!',
    },
    ummi: {
      pos: [165.5, 0.2, -9.5],
      status: 'Membuat Camilan Lezat di Dapur 🧕🧁',
      text: 'Assalamu\'alaikum Kak Khaulah sayang! Kebersihan itu sebagian dari iman, nak. Ummi sedang menyiapkan bekal cinta terenak di dapur untuk Khaulah, ayo ambil sayang!',
    },
    faqih: {
      pos: [165.5, 0.2, -13.5],
      status: 'Balap Mobilan di Karpet 🚗💨',
      text: 'Ngeeeng! Brum brum pip pip! Adek Faqih lagi seru banget ngebutin mobil-mobilan di karpet sirkuit lintasan! Kak Khaulah ayo balapan bareng!',
    },
    khalid: {
      pos: [163.5, 0.2, -13.5],
      status: 'Latihan Drumband 🥁🎶',
      text: 'Kak Khaulah lihat nih! Khalid lagi latihan drumband! Dum-tak-tak-dum ratatat! Mau ajak Khalid ikut jalan-jalan keliling desa?',
    },
  },
  sore: {
    abi: {
      pos: [158.8, 0.2, -11.5],
      status: 'Santai Minum Teh Sore di Sofa 🍵🛋️',
      text: 'Alhamdulillah, senja sore yang syahdu di ruang tengah rumah kita. Senang sekali melihat Kak Khaulah bermain ceria dan sehat selalu!',
    },
    ummi: {
      pos: [165.5, 0.2, -9.5],
      status: 'Menyiapkan Teh & Buah Segar 🌸🫖',
      text: 'Senja sore yang indah, nak. Ummi sedang menyiapkan teh hangat dan buah manis di dapur. Ada donat manis untuk Khaulah!',
    },
    faqih: {
      pos: [164.2, 0.2, -12.5],
      status: 'Main Kerincingan Lucu 🪇✨',
      text: 'Kring kring! Adek Faqih goyang-goyangkan kerincingan warna-warni sambil tertawa riang menyapa Kak Khaulah! 🪇👶',
    },
    khalid: {
      pos: [160.0, 0.2, -11.5],
      status: 'Parade Drumband Cilik 🎶🥁',
      text: 'Dum-dum-tak! Adek Khalid siap mimpin parade drumband cilik! Kak Khaulah mau ajak Khalid ikut jalan-jalan keluar?',
    },
  },
  malam: {
    abi: {
      pos: [158.8, 0.2, -11.5],
      status: 'Kumpul Hangat di Sofa 🌙📖',
      text: 'MasyaAllah, malam bertabur bintang nan damai. Istirahat yang cukup ya anak pintar Abi, besok kita berpetualang lagi!',
    },
    ummi: {
      pos: [161.2, 0.2, -11.5],
      status: 'Mendongeng di Karpet 🧕📖',
      text: 'Malam bertabur bintang nan damai. Ummi sedang membacakan dongeng kisah nabi yang penuh hikmah. Jangan lupa cuci kaki, sikat gigi, dan berdoa sebelum tidur ya bidadari shalihah Ummi.',
    },
    faqih: {
      pos: [166.5, 0.2, -16.0],
      status: 'Tidur Pulas di Boks Bayi 💤👶',
      text: 'Ssshh... Adek Faqih tertidur pulas memeluk mobil-mobilan kesayangannya di boks bayi yang hangat! 💤👶',
    },
    khalid: {
      pos: [160.4, 0.2, -11.5],
      status: 'Dengarkan Dongeng Ummi 📖🧸',
      text: 'Kak Khaulah sini duduk bareng Khalid di karpet! Kita dengarkan dongeng Ummi sambil santai bersama keluarga!',
    },
  },
};

// ============================================================================
// 1. ABI MODEL (AYAH - 27 TAHUN, PRIA MUDA TAMPAN, MULTI-ACTIVITY PROPS)
// ============================================================================
const AbiModel: React.FC<{ position: [number, number, number]; statusTag?: string }> = ({ position, statusTag }) => {
  const groupRef = useRef<THREE.Group>(null);
  const characterRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const teaCupRef = useRef<THREE.Group>(null);
  const screenGlowRef = useRef<THREE.PointLight>(null);
  const eyeScale = useRef(1);
  const blinkTimer = useRef(3.0);
  const currentPos = useRef(new THREE.Vector3(position[0], position[1], position[2]));

  const timeOfDay = useGameStore((s) => s.timeOfDay);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    const playerPos = gameStore.getState().playerPos;

    // Smooth movement towards scheduled position
    currentPos.current.x = THREE.MathUtils.lerp(currentPos.current.x, position[0], delta * 2.2);
    currentPos.current.y = THREE.MathUtils.lerp(currentPos.current.y, position[1], delta * 2.2);
    currentPos.current.z = THREE.MathUtils.lerp(currentPos.current.z, position[2], delta * 2.2);
    groupRef.current.position.copy(currentPos.current);

    // Blinking eye animation
    blinkTimer.current -= delta;
    if (blinkTimer.current <= 0) {
      eyeScale.current = 0.1;
      if (blinkTimer.current <= -0.15) {
        eyeScale.current = 1.0;
        blinkTimer.current = 2.5 + Math.random() * 3.0;
      }
    }

    const dx = playerPos[0] - currentPos.current.x;
    const dz = playerPos[2] - currentPos.current.z;
    const distSq = dx * dx + dz * dz;

    if (distSq < 16.0) {
      // Look towards Khaulah & smile warmly
      const targetAngle = Math.atan2(dx, dz);
      if (characterRef.current) {
        characterRef.current.rotation.y = THREE.MathUtils.lerp(characterRef.current.rotation.y, targetAngle, delta * 4);
      }
      if (headRef.current) {
        headRef.current.rotation.x = -0.05 + Math.sin(time * 2.5) * 0.05;
        headRef.current.rotation.y = Math.sin(time * 2.0) * 0.08;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -0.6;
        rightArmRef.current.rotation.z = -0.9 + Math.sin(time * 5) * 0.3;
      }
    } else {
      if (characterRef.current) {
        characterRef.current.rotation.y = THREE.MathUtils.lerp(characterRef.current.rotation.y, 0, delta * 3);
      }

      // Activity-specific natural gestures
      if (timeOfDay === 'siang') {
        // Typing on laptop
        if (headRef.current) {
          headRef.current.rotation.x = 0.18 + Math.sin(time * 1.6) * 0.04;
          headRef.current.rotation.y = Math.sin(time * 1.2) * 0.03;
        }
        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.rotation.x = -0.72 + Math.sin(time * 14) * 0.05;
          rightArmRef.current.rotation.x = -0.72 + Math.cos(time * 14) * 0.05;
          rightArmRef.current.rotation.z = -0.18;
          leftArmRef.current.rotation.z = 0.18;
        }
        if (screenGlowRef.current) {
          screenGlowRef.current.intensity = 0.6 + Math.sin(time * 8) * 0.15;
        }
      } else if (timeOfDay === 'sore') {
        // Afternoon tea: lifting teacup to sip and lowering it
        const teaSipPhase = Math.sin(time * 0.8);
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -0.5 - Math.max(0, teaSipPhase) * 0.5;
          rightArmRef.current.rotation.z = -0.3 + Math.max(0, teaSipPhase) * 0.2;
        }
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -0.3;
          leftArmRef.current.rotation.z = 0.2;
        }
      } else if (timeOfDay === 'subuh') {
        // Subuh prayer & dhikr hands raised in dua
        if (headRef.current) {
          headRef.current.rotation.x = 0.12 + Math.sin(time * 1.0) * 0.03;
        }
        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.rotation.x = -0.65;
          leftArmRef.current.rotation.z = 0.35 + Math.sin(time * 2) * 0.03;
          rightArmRef.current.rotation.x = -0.65;
          rightArmRef.current.rotation.z = -0.35 - Math.sin(time * 2) * 0.03;
        }
      } else {
        // Malam: Relaxing
        if (leftArmRef.current) leftArmRef.current.rotation.x = -0.3;
        if (rightArmRef.current) rightArmRef.current.rotation.x = -0.3;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Floor Contact Shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>

      {/* ============================================================== */}
      {/* ACTIVITY EQUIPMENT 1: SIANG - CODING WORKSTATION               */}
      {/* ============================================================== */}
      {timeOfDay === 'siang' && (
        <group position={[0, 0, 0.45]}>
          {/* Work Desk */}
          <mesh position={[0, 0.76, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.2, 0.06, 0.65]} />
            <meshStandardMaterial color="#D4A373" roughness={0.5} />
          </mesh>
          {/* Table Legs */}
          {[-0.52, 0.52].map((tx, i) =>
            [-0.22, 0.22].map((tz, j) => (
              <mesh key={`leg-${i}-${j}`} position={[tx, 0.38, tz]} castShadow>
                <cylinderGeometry args={[0.025, 0.022, 0.72, 8]} />
                <meshStandardMaterial color="#2B2D42" roughness={0.4} />
              </mesh>
            ))
          )}
          {/* Modern Laptop with Glowing Code Screen */}
          <group position={[0, 0.79, 0]}>
            <mesh position={[0, 0.01, 0]} castShadow>
              <boxGeometry args={[0.46, 0.018, 0.32]} />
              <meshStandardMaterial color="#CED4DA" metalness={0.8} roughness={0.25} />
            </mesh>
            <group position={[0, 0.018, -0.15]} rotation={[-Math.PI / 6, 0, 0]}>
              <mesh position={[0, 0.16, 0]} castShadow>
                <boxGeometry args={[0.46, 0.32, 0.015]} />
                <meshStandardMaterial color="#CED4DA" metalness={0.85} roughness={0.25} />
              </mesh>
              {/* Screen Display */}
              <mesh position={[0, 0.16, 0.008]}>
                <boxGeometry args={[0.43, 0.29, 0.002]} />
                <meshStandardMaterial color="#0F172A" emissive="#1E293B" emissiveIntensity={0.4} />
              </mesh>
              {/* Syntax Lines */}
              {[-0.08, -0.04, 0, 0.04, 0.08].map((ly, idx) => (
                <mesh key={idx} position={[0, 0.16 + ly, 0.01]}>
                  <planeGeometry args={[0.34, 0.015]} />
                  <meshBasicMaterial color={['#38BDF8', '#4ADE80', '#F472B6', '#FBBF24', '#60A5FA'][idx]} />
                </mesh>
              ))}
              <pointLight ref={screenGlowRef} position={[0, 0.16, 0.15]} color="#38BDF8" intensity={0.7} distance={1.8} />
            </group>
          </group>
          {/* Steaming Coffee Mug */}
          <group position={[0.42, 0.79, 0]}>
            <mesh position={[0, 0.08, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.045, 0.14, 12]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
            </mesh>
            <Sparkles count={5} position={[0, 0.22, 0]} scale={0.2} size={1.5} speed={0.5} color="#F8F9FA" />
          </group>
        </group>
      )}

      {/* ============================================================== */}
      {/* ACTIVITY EQUIPMENT 2: SUBUH - SAJADAH MUSHASHOLLA              */}
      {/* ============================================================== */}
      {timeOfDay === 'subuh' && (
        <group position={[0, 0.03, 0]}>
          {/* Turkish Emerald Green Prayer Mat */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[1.2, 1.8]} />
            <meshStandardMaterial color="#1B4332" roughness={0.7} />
          </mesh>
          {/* Golden Arch Border on Sajadah */}
          <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.0, 1.6]} />
            <meshBasicMaterial color="#2D6A4F" />
          </mesh>
          <mesh position={[0, 0.003, -0.3]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.2, 0.35, 16]} />
            <meshBasicMaterial color="#D4AF37" />
          </mesh>
          {/* Golden Tasbih Beads */}
          <group position={[0.5, 0.02, 0.2]}>
            {[0, 0.06, 0.12, 0.18].map((tz, ti) => (
              <mesh key={ti} position={[0, 0, tz]}>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshStandardMaterial color="#DDA15E" metalness={0.4} />
              </mesh>
            ))}
          </group>
          {/* Spiritual Morning Light */}
          <Sparkles count={8} position={[0, 0.8, 0]} scale={1.2} size={1.8} speed={0.4} color="#FEF08A" />
        </group>
      )}

      {/* ============================================================== */}
      {/* ACTIVITY EQUIPMENT 3: SORE - AFTERNOON TEA TABLE               */}
      {/* ============================================================== */}
      {timeOfDay === 'sore' && (
        <group position={[0, 0, 0.5]}>
          {/* Terrace Round Tea Table */}
          <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.45, 0.45, 0.05, 20]} />
            <meshStandardMaterial color="#DDB892" roughness={0.6} />
          </mesh>
          {/* Table Pedestal */}
          <mesh position={[0, 0.32, 0]}>
            <cylinderGeometry args={[0.04, 0.08, 0.62, 12]} />
            <meshStandardMaterial color="#7F4F24" />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.04, 16]} />
            <meshStandardMaterial color="#7F4F24" />
          </mesh>
          {/* Porcelain Teapot */}
          <group position={[-0.15, 0.72, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.09, 12, 12]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
            </mesh>
            <mesh position={[0.09, 0.02, 0]}>
              <cylinderGeometry args={[0.015, 0.025, 0.08, 8]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
          </group>
          {/* Plate with Tea Biscuits */}
          <mesh position={[0.15, 0.68, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.015, 16]} />
            <meshStandardMaterial color="#E2E8F0" />
          </mesh>
          <mesh position={[0.15, 0.7, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.02, 10]} />
            <meshStandardMaterial color="#D4A373" />
          </mesh>
        </group>
      )}

      {/* ========================================================= */}
      {/* ABI CHARACTER (27 TAHUN, PRIA MUDA TAMPAN, TANPA KACAMATA) */}
      {/* ========================================================= */}
      <group ref={characterRef} position={[0, 0, -0.1]}>
        {/* Shoes */}
        <mesh position={[-0.18, 0.1, 0.2]} castShadow>
          <boxGeometry args={[0.18, 0.14, 0.38]} />
          <meshStandardMaterial color="#1E1E24" roughness={0.7} />
        </mesh>
        <mesh position={[0.18, 0.1, 0.2]} castShadow>
          <boxGeometry args={[0.18, 0.14, 0.38]} />
          <meshStandardMaterial color="#1E1E24" roughness={0.7} />
        </mesh>

        {/* Navy Trouser Legs */}
        <mesh position={[-0.18, 0.32, 0.2]} castShadow>
          <cylinderGeometry args={[0.12, 0.13, 0.38, 10]} />
          <meshStandardMaterial color="#1D2A44" roughness={0.7} />
        </mesh>
        <mesh position={[0.18, 0.32, 0.2]} castShadow>
          <cylinderGeometry args={[0.12, 0.13, 0.38, 10]} />
          <meshStandardMaterial color="#1D2A44" roughness={0.7} />
        </mesh>
        <mesh position={[-0.18, 0.49, 0.08]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.14, 0.34, 10]} />
          <meshStandardMaterial color="#1D2A44" roughness={0.7} />
        </mesh>
        <mesh position={[0.18, 0.49, 0.08]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.14, 0.34, 10]} />
          <meshStandardMaterial color="#1D2A44" roughness={0.7} />
        </mesh>

        {/* Torso: Elegant Modern Koko Shirt in Royal Blue */}
        <mesh position={[0, 1.05, -0.05]} castShadow>
          <boxGeometry args={[0.68, 0.82, 0.4]} />
          <meshStandardMaterial color="#2563EB" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.1, 0.155]}>
          <boxGeometry args={[0.1, 0.72, 0.02]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
        </mesh>

        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.38, 1.35, 0]}>
          <mesh position={[0, -0.22, 0.12]} rotation={[0.4, 0, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.08, 0.46, 10]} />
            <meshStandardMaterial color="#2563EB" roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.42, 0.26]} castShadow>
            <sphereGeometry args={[0.085, 10, 10]} />
            <meshStandardMaterial color="#E8BE96" roughness={0.6} />
          </mesh>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.38, 1.35, 0]}>
          <mesh position={[0, -0.22, 0.12]} rotation={[0.4, 0, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.08, 0.46, 10]} />
            <meshStandardMaterial color="#2563EB" roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.42, 0.26]} castShadow>
            <sphereGeometry args={[0.085, 10, 10]} />
            <meshStandardMaterial color="#E8BE96" roughness={0.6} />
          </mesh>

          {/* Held Porcelain Teacup when timeOfDay is 'sore' */}
          {timeOfDay === 'sore' && (
            <group ref={teaCupRef} position={[0, -0.46, 0.32]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.045, 0.035, 0.08, 10]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
              </mesh>
            </group>
          )}
        </group>

        {/* Head & Friendly Face */}
        <group ref={headRef} position={[0, 1.72, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.26, 16, 16]} />
            <meshStandardMaterial color="#E8BE96" roughness={0.6} />
          </mesh>
          {/* Short Stylish Jet-Black Hair */}
          <mesh position={[0, 0.12, -0.04]}>
            <sphereGeometry args={[0.27, 14, 14]} />
            <meshStandardMaterial color="#1B1B1E" roughness={0.7} />
          </mesh>
          {/* Eyes with Sparkle */}
          {[-0.09, 0.09].map((ex, i) => (
            <group key={i} position={[ex, 0.03, 0.24]}>
              <mesh scale={[1, eyeScale.current, 1]}>
                <sphereGeometry args={[0.035, 8, 8]} />
                <meshBasicMaterial color="#1E1E24" />
              </mesh>
              <mesh position={[0.01, 0.015, 0.03]}>
                <sphereGeometry args={[0.01, 6, 6]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
            </group>
          ))}
          {/* Gentle Smile */}
          <mesh position={[0, -0.1, 0.23]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshStandardMaterial color="#A84242" />
          </mesh>
        </group>
      </group>

      {/* Floating Billboard Name Tag */}
      <Billboard position={[0, 2.35, 0]}>
        <mesh>
          <planeGeometry args={[statusTag ? 2.5 : 1.4, 0.46]} />
          <meshBasicMaterial color="#1D4ED8" transparent opacity={0.88} />
        </mesh>
        <Text position={[0, statusTag ? 0.08 : 0, 0.02]} fontSize={0.18} color="#FFFFFF" anchorX="center" anchorY="middle">
          Abi 💻
        </Text>
        {statusTag && (
          <Text position={[0, -0.11, 0.02]} fontSize={0.11} color="#BAE6FD" anchorX="center" anchorY="middle">
            {statusTag}
          </Text>
        )}
      </Billboard>
    </group>
  );
};

// ============================================================================
// 2. UMMI MODEL (IBU - 26 TAHUN, BERCADAR / NIQAB, MULTI-ACTIVITY PROPS)
// ============================================================================
const UmmiModel: React.FC<{ position: [number, number, number]; statusTag?: string }> = ({ position, statusTag }) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const broomRef = useRef<THREE.Group>(null);
  const wateringCanRef = useRef<THREE.Group>(null);
  const spatulaRef = useRef<THREE.Group>(null);
  const eyeScale = useRef(1);
  const blinkTimer = useRef(2.5);
  const currentPos = useRef(new THREE.Vector3(position[0], position[1], position[2]));

  const timeOfDay = useGameStore((s) => s.timeOfDay);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    const playerPos = gameStore.getState().playerPos;

    currentPos.current.x = THREE.MathUtils.lerp(currentPos.current.x, position[0], delta * 2.2);
    currentPos.current.y = THREE.MathUtils.lerp(currentPos.current.y, position[1], delta * 2.2);
    currentPos.current.z = THREE.MathUtils.lerp(currentPos.current.z, position[2], delta * 2.2);
    groupRef.current.position.copy(currentPos.current);

    blinkTimer.current -= delta;
    if (blinkTimer.current <= 0) {
      eyeScale.current = 0.1;
      if (blinkTimer.current <= -0.14) {
        eyeScale.current = 1.0;
        blinkTimer.current = 2.8 + Math.random() * 2.5;
      }
    }

    const dx = playerPos[0] - currentPos.current.x;
    const dz = playerPos[2] - currentPos.current.z;
    const distSq = dx * dx + dz * dz;

    if (distSq < 16.0) {
      const targetAngle = Math.atan2(dx, dz);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetAngle, delta * 4);
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.6;
        leftArmRef.current.rotation.z = 0.8 + Math.sin(time * 5) * 0.25;
      }
    } else {
      if (timeOfDay === 'siang') {
        // Sweeping motion
        const sweepPhase = Math.sin(time * 3.5);
        if (broomRef.current) {
          broomRef.current.rotation.z = sweepPhase * 0.3;
          broomRef.current.position.x = 0.35 + sweepPhase * 0.18;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -0.5 + sweepPhase * 0.15;
        }
      } else if (timeOfDay === 'subuh') {
        // Cooking stir motion
        const cookPhase = Math.sin(time * 4);
        if (spatulaRef.current) {
          spatulaRef.current.rotation.z = cookPhase * 0.25;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -0.6 + cookPhase * 0.1;
        }
      } else if (timeOfDay === 'sore') {
        // Watering flower can tilt
        if (wateringCanRef.current) {
          wateringCanRef.current.rotation.z = -0.3 + Math.sin(time * 1.5) * 0.1;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -0.6;
        }
      } else {
        // Malam: Reading storybook
        if (leftArmRef.current) leftArmRef.current.rotation.x = -0.5;
        if (rightArmRef.current) rightArmRef.current.rotation.x = -0.5;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Floor Contact Shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>

      {/* ============================================================== */}
      {/* ACTIVITY EQUIPMENT: SUBUH - KITCHEN BREAKFAST STOVE            */}
      {/* ============================================================== */}
      {timeOfDay === 'subuh' && (
        <group position={[0, 0, 0.45]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[0.9, 0.85, 0.5]} />
            <meshStandardMaterial color="#F8FAFC" />
          </mesh>
          <mesh position={[0, 0.88, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.04, 16]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>
          {/* Frying Pan with Fluffy Pancake */}
          <group position={[0, 0.91, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.14, 0.12, 0.03, 16]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
            <mesh position={[0.18, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.015, 0.015, 0.15, 8]} />
              <meshStandardMaterial color="#7F4F24" />
            </mesh>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.02, 12]} />
              <meshStandardMaterial color="#F59E0B" />
            </mesh>
            <Sparkles count={6} position={[0, 0.15, 0]} scale={0.3} size={1.5} speed={0.6} color="#FEF08A" />
          </group>
        </group>
      )}

      {/* ============================================================== */}
      {/* ACTIVITY EQUIPMENT: SORE - FLOWER POTS & WATERING STREAM       */}
      {/* ============================================================== */}
      {timeOfDay === 'sore' && (
        <group position={[0.4, 0, 0.4]}>
          {/* Flower Pots */}
          {[-0.25, 0.25].map((px, pi) => (
            <group key={pi} position={[px, 0, 0]}>
              <mesh position={[0, 0.15, 0]} castShadow>
                <cylinderGeometry args={[0.14, 0.1, 0.28, 12]} />
                <meshStandardMaterial color="#B45309" roughness={0.7} />
              </mesh>
              <mesh position={[0, 0.35, 0]}>
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshStandardMaterial color={pi === 0 ? '#E11D48' : '#F59E0B'} />
              </mesh>
            </group>
          ))}
          {/* Animated Sparkling Water Droplets */}
          <Sparkles count={10} position={[0, 0.35, 0]} scale={0.4} size={1.8} speed={1.2} color="#38BDF8" />
        </group>
      )}

      {/* ============================================================== */}
      {/* ACTIVITY EQUIPMENT: MALAM - OPEN GOLDEN STORYBOOK              */}
      {/* ============================================================== */}
      {timeOfDay === 'malam' && (
        <group position={[0, 0.75, 0.25]} rotation={[0.4, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.04, 0.3]} />
            <meshStandardMaterial color="#831843" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.025, 0]}>
            <boxGeometry args={[0.4, 0.02, 0.28]} />
            <meshStandardMaterial color="#FEF9C3" />
          </mesh>
          <Sparkles count={6} position={[0, 0.1, 0]} scale={0.4} size={2.0} speed={0.4} color="#FDE047" />
        </group>
      )}

      {/* ========================================================= */}
      {/* UMMI CHARACTER (26 TAHUN, BERCADAR/NIQAB, ABAYA PINK BLUSH) */}
      {/* ========================================================= */}
      <group position={[0, 0, 0]}>
        {/* Elegant Long Abaya Dress */}
        <mesh position={[0, 0.85, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.52, 1.6, 16]} />
          <meshStandardMaterial color="#D8829D" roughness={0.6} />
        </mesh>

        {/* Hijab Syar'i (Kerudung Panjang Menutup Dada & Punggung) */}
        <mesh position={[0, 1.45, -0.02]} castShadow>
          <cylinderGeometry args={[0.32, 0.44, 0.85, 16]} />
          <meshStandardMaterial color="#F4ACB7" roughness={0.65} />
        </mesh>

        {/* Head */}
        <group ref={headRef} position={[0, 1.82, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color="#F4ACB7" roughness={0.65} />
          </mesh>
          {/* Eyes Peeking above Niqab */}
          {[-0.08, 0.08].map((ex, i) => (
            <group key={i} position={[ex, 0.04, 0.23]}>
              <mesh scale={[1, eyeScale.current, 1]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshBasicMaterial color="#2B2D42" />
              </mesh>
              <mesh position={[0.008, 0.012, 0.025]}>
                <sphereGeometry args={[0.008, 6, 6]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
            </group>
          ))}
          {/* Gentle Niqab / Cadar Fabric */}
          <mesh position={[0, -0.08, 0.22]}>
            <boxGeometry args={[0.28, 0.22, 0.08]} />
            <meshStandardMaterial color="#D8829D" roughness={0.65} />
          </mesh>
        </group>

        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.35, 1.4, 0]}>
          <mesh position={[0, -0.22, 0.08]} rotation={[0.3, 0, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.065, 0.45, 10]} />
            <meshStandardMaterial color="#D8829D" roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.42, 0.16]}>
            <sphereGeometry args={[0.065, 8, 8]} />
            <meshStandardMaterial color="#FCE7D0" />
          </mesh>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.35, 1.4, 0]}>
          <mesh position={[0, -0.22, 0.08]} rotation={[0.3, 0, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.065, 0.45, 10]} />
            <meshStandardMaterial color="#D8829D" roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.42, 0.16]}>
            <sphereGeometry args={[0.065, 8, 8]} />
            <meshStandardMaterial color="#FCE7D0" />
          </mesh>

          {/* Held Broom when timeOfDay is 'siang' */}
          {timeOfDay === 'siang' && (
            <group ref={broomRef} position={[0, -0.45, 0.1]}>
              <mesh position={[0, 0.3, 0]} castShadow>
                <cylinderGeometry args={[0.02, 0.02, 1.1, 8]} />
                <meshStandardMaterial color="#7F4F24" />
              </mesh>
              <mesh position={[0, -0.3, 0]} castShadow>
                <boxGeometry args={[0.28, 0.24, 0.08]} />
                <meshStandardMaterial color="#DDA15E" />
              </mesh>
            </group>
          )}

          {/* Held Spatula when timeOfDay is 'subuh' */}
          {timeOfDay === 'subuh' && (
            <group ref={spatulaRef} position={[0, -0.45, 0.1]}>
              <mesh position={[0, 0.1, 0]} castShadow>
                <cylinderGeometry args={[0.015, 0.015, 0.32, 8]} />
                <meshStandardMaterial color="#7F4F24" />
              </mesh>
              <mesh position={[0, -0.08, 0]}>
                <boxGeometry args={[0.08, 0.1, 0.02]} />
                <meshStandardMaterial color="#CBD5E1" metalness={0.5} />
              </mesh>
            </group>
          )}

          {/* Held Watering Can when timeOfDay is 'sore' */}
          {timeOfDay === 'sore' && (
            <group ref={wateringCanRef} position={[0, -0.45, 0.1]}>
              <mesh position={[0, 0, 0]} castShadow>
                <cylinderGeometry args={[0.09, 0.11, 0.18, 12]} />
                <meshStandardMaterial color="#06D6A0" />
              </mesh>
              <mesh position={[0.1, 0.05, 0]} rotation={[0, 0, -Math.PI / 4]}>
                <cylinderGeometry args={[0.02, 0.03, 0.16, 8]} />
                <meshStandardMaterial color="#06D6A0" />
              </mesh>
            </group>
          )}
        </group>
      </group>

      {/* Floating Billboard Name Tag */}
      <Billboard position={[0, 2.45, 0]}>
        <mesh>
          <planeGeometry args={[statusTag ? 2.5 : 1.3, 0.46]} />
          <meshBasicMaterial color="#E07A5F" transparent opacity={0.88} />
        </mesh>
        <Text position={[0, statusTag ? 0.08 : 0, 0.02]} fontSize={0.18} color="#FFFFFF" anchorX="center" anchorY="middle">
          Ummi 🧕
        </Text>
        {statusTag && (
          <Text position={[0, -0.11, 0.02]} fontSize={0.11} color="#FFF1F2" anchorX="center" anchorY="middle">
            {statusTag}
          </Text>
        )}
      </Billboard>
    </group>
  );
};

// ============================================================================
// 3. KHALID MODEL (ADEK KHALID - 4 TAHUN, DRUMBAND & FOLLOW MODE)
// ============================================================================
const KhalidModel: React.FC<{ position: [number, number, number]; statusTag?: string }> = ({ position, statusTag }) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

  const isFollowing = useGameStore((s) => s.isKhalidFollowing);
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const currentPos = useRef(new THREE.Vector3(position[0], position[1], position[2]));
  const wasFollowing = useRef(false);
  const [speechBubbleText, setSpeechBubbleText] = useState<string | null>(null);
  const bubbleTimer = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    const playerPos = gameStore.getState().playerPos;
    const speedBuff = gameStore.getState().speedBuffTimeLeft;
    const isRidingScooter = gameStore.getState().isRidingScooter;
    const isJumpPressed = gameStore.getState().isJumpPressed;

    if (isFollowing) {
      if (!wasFollowing.current) {
        wasFollowing.current = true;
        setSpeechBubbleText('Tunggu Khalid Kakak! 🏃‍♂️💨');
        bubbleTimer.current = 4.0;
      }

      const pVec = new THREE.Vector3(playerPos[0], playerPos[1], playerPos[2]);
      const distToPlayer = currentPos.current.distanceTo(pVec);

      // Smart Teleport if too far
      if (distToPlayer > 32.0) {
        currentPos.current.set(playerPos[0] - 1.5, Math.max(0.2, playerPos[1]), playerPos[2] - 1.5);
        setSpeechBubbleText('Wuuush! Khalid sampai! ✨');
        bubbleTimer.current = 3.0;
      }

      const facing = gameStore.getState().playerFacingAngle;
      const targetX = playerPos[0] - Math.sin(facing) * 1.8 + Math.cos(facing) * 0.8;
      const targetZ = playerPos[2] - Math.cos(facing) * 1.8 - Math.sin(facing) * 0.8;
      const targetY = Math.max(0.2, playerPos[1]);

      const dx = targetX - currentPos.current.x;
      const dz = targetZ - currentPos.current.z;
      const distToTarget = Math.hypot(dx, dz);

      if (distToPlayer > 2.2) {
        const speed = speedBuff > 0 || isRidingScooter ? 20.0 : 11.0;
        const step = Math.min(distToTarget, speed * delta);
        if (distToTarget > 0.05) {
          currentPos.current.x += (dx / distToTarget) * step;
          currentPos.current.z += (dz / distToTarget) * step;
        }
        currentPos.current.y = THREE.MathUtils.lerp(currentPos.current.y, targetY, delta * 8);

        const moveAngle = Math.atan2(dx, dz);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, moveAngle, delta * 12);

        const runCadence = time * 18;
        const runBounce = Math.abs(Math.sin(runCadence)) * 0.08;
        groupRef.current.position.y = currentPos.current.y + runBounce;

        if (leftLegRef.current && rightLegRef.current) {
          leftLegRef.current.rotation.x = Math.sin(runCadence) * 0.65;
          rightLegRef.current.rotation.x = -Math.sin(runCadence) * 0.65;
        }

        const drumBeat = Math.sin(time * 20);
        if (leftArmRef.current) leftArmRef.current.rotation.x = -0.7 + drumBeat * 0.45;
        if (rightArmRef.current) rightArmRef.current.rotation.x = -0.7 + Math.cos(time * 20) * 0.45;

        bubbleTimer.current -= delta;
        if (bubbleTimer.current <= 0) {
          const quotes = ['Lari Kak Khaulah! 🏃‍♂️💨', 'Kejar aku hehe! 😆', 'Seru banget! ✨', 'Adek Khalid gak capek! ⚡'];
          setSpeechBubbleText(quotes[Math.floor(Math.random() * quotes.length)]);
          bubbleTimer.current = 8.0 + Math.random() * 6.0;
        }
      } else {
        const faceAngle = Math.atan2(playerPos[0] - currentPos.current.x, playerPos[2] - currentPos.current.z);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, faceAngle, delta * 6);
        groupRef.current.position.y = currentPos.current.y;

        if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
        if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
        if (leftArmRef.current) leftArmRef.current.rotation.x = -0.65 + Math.sin(time * 8) * 0.2;
        if (rightArmRef.current) rightArmRef.current.rotation.x = -0.65 + Math.cos(time * 8) * 0.2;

        bubbleTimer.current -= delta;
        if (bubbleTimer.current <= 0) {
          setSpeechBubbleText('Main apa lagi Kakak? ✨');
          bubbleTimer.current = 10.0 + Math.random() * 8.0;
        }
      }

      if (isJumpPressed) {
        groupRef.current.position.y += 0.25;
      }

      groupRef.current.position.x = currentPos.current.x;
      groupRef.current.position.z = currentPos.current.z;
      gameStore.setKhalidPos([currentPos.current.x, currentPos.current.y, currentPos.current.z]);
    } else {
      wasFollowing.current = false;
      currentPos.current.x = THREE.MathUtils.lerp(currentPos.current.x, position[0], delta * 2.5);
      currentPos.current.y = THREE.MathUtils.lerp(currentPos.current.y, position[1], delta * 2.5);
      currentPos.current.z = THREE.MathUtils.lerp(currentPos.current.z, position[2], delta * 2.5);
      groupRef.current.position.copy(currentPos.current);
      gameStore.setKhalidPos([currentPos.current.x, currentPos.current.y, currentPos.current.z]);

      if (timeOfDay === 'siang') {
        // Active drumming ratatat
        const drumBeat = Math.sin(time * 16);
        if (leftArmRef.current) leftArmRef.current.rotation.x = -0.7 + drumBeat * 0.45;
        if (rightArmRef.current) rightArmRef.current.rotation.x = -0.7 + Math.cos(time * 16) * 0.45;
        groupRef.current.position.y += Math.abs(Math.sin(time * 8)) * 0.05;
      } else if (timeOfDay === 'subuh') {
        // Yawning / eye rub on bed
        if (rightArmRef.current) rightArmRef.current.rotation.x = -1.2 + Math.sin(time * 2) * 0.2;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Floor Contact Shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.7, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>

      {/* ============================================================== */}
      {/* ACTIVITY EQUIPMENT: SUBUH - CHILDREN BED WITH STARRY BLANKET   */}
      {/* ============================================================== */}
      {!isFollowing && timeOfDay === 'subuh' && (
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[1.2, 0.35, 1.6]} />
            <meshStandardMaterial color="#93C5FD" />
          </mesh>
          <mesh position={[0, 0.45, -0.5]}>
            <boxGeometry args={[0.7, 0.12, 0.4]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <Sparkles count={5} position={[0, 0.6, 0]} scale={0.8} size={1.8} speed={0.4} color="#FDE047" />
        </group>
      )}

      {/* ============================================================== */}
      {/* ACTIVITY EQUIPMENT: SIANG - SNARE DRUM & DRUMSTICKS            */}
      {/* ============================================================== */}
      {(isFollowing || timeOfDay === 'siang') && (
        <group position={[0, 0.72, 0.28]} rotation={[0.2, 0, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.18, 16]} />
            <meshStandardMaterial color="#E63946" metalness={0.2} roughness={0.4} />
          </mesh>
          {/* Top Drum Head */}
          <mesh position={[0, 0.091, 0]}>
            <cylinderGeometry args={[0.225, 0.225, 0.01, 16]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
          </mesh>
          {/* Drum Rims */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.23, 0.23, 0.03, 16]} />
            <meshStandardMaterial color="#F1FAEE" metalness={0.8} />
          </mesh>
          {/* Floating Music Notes Sparkles */}
          <Sparkles count={4} position={[0, 0.25, 0]} scale={0.4} size={2.0} speed={0.8} color="#FEF08A" />
        </group>
      )}

      {/* ========================================================= */}
      {/* KHALID CHARACTER BODY (4 TAHUN, BALITA CERIA DRUMBAND)    */}
      {/* ========================================================= */}
      <group position={[0, 0, 0]}>
        {/* Legs */}
        <group ref={leftLegRef} position={[-0.14, 0.4, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <cylinderGeometry args={[0.075, 0.075, 0.4, 10]} />
            <meshStandardMaterial color="#1D3557" />
          </mesh>
          <mesh position={[0, -0.4, 0.06]} castShadow>
            <boxGeometry args={[0.13, 0.09, 0.24]} />
            <meshStandardMaterial color="#E63946" />
          </mesh>
        </group>
        <group ref={rightLegRef} position={[0.14, 0.4, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <cylinderGeometry args={[0.075, 0.075, 0.4, 10]} />
            <meshStandardMaterial color="#1D3557" />
          </mesh>
          <mesh position={[0, -0.4, 0.06]} castShadow>
            <boxGeometry args={[0.13, 0.09, 0.24]} />
            <meshStandardMaterial color="#E63946" />
          </mesh>
        </group>

        {/* Torso: Red Drumband Shirt */}
        <mesh position={[0, 0.75, 0]} castShadow>
          <boxGeometry args={[0.5, 0.55, 0.32]} />
          <meshStandardMaterial color="#E63946" />
        </mesh>
        <mesh position={[0, 0.75, 0.165]}>
          <boxGeometry args={[0.08, 0.5, 0.01]} />
          <meshStandardMaterial color="#FFD166" />
        </mesh>

        {/* Arms */}
        <group ref={leftArmRef} position={[-0.28, 0.95, 0]}>
          <mesh position={[0, -0.16, 0.1]} rotation={[0.4, 0, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.055, 0.35, 8]} />
            <meshStandardMaterial color="#E63946" />
          </mesh>
          <mesh position={[0, -0.32, 0.22]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#FCD5B5" />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.28, 0.95, 0]}>
          <mesh position={[0, -0.16, 0.1]} rotation={[0.4, 0, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.055, 0.35, 8]} />
            <meshStandardMaterial color="#E63946" />
          </mesh>
          <mesh position={[0, -0.32, 0.22]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#FCD5B5" />
          </mesh>
        </group>

        {/* Head */}
        <group ref={headRef} position={[0, 1.3, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.24, 14, 14]} />
            <meshStandardMaterial color="#FCD5B5" />
          </mesh>
          {/* Black Hair */}
          <mesh position={[0, 0.1, -0.04]}>
            <sphereGeometry args={[0.25, 12, 12]} />
            <meshStandardMaterial color="#1E1E24" />
          </mesh>
          {/* Drumband Hat */}
          <mesh position={[0, 0.26, 0]}>
            <cylinderGeometry args={[0.18, 0.2, 0.18, 12]} />
            <meshStandardMaterial color="#E63946" />
          </mesh>
          <mesh position={[0, 0.36, 0]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#FFD166" />
          </mesh>
          {/* Laughing Cheeks & Smile */}
          <mesh position={[-0.1, -0.03, 0.22]}>
            <circleGeometry args={[0.035, 8]} />
            <meshBasicMaterial color="#FF8FA3" transparent opacity={0.7} />
          </mesh>
          <mesh position={[0.1, -0.03, 0.22]}>
            <circleGeometry args={[0.035, 8]} />
            <meshBasicMaterial color="#FF8FA3" transparent opacity={0.7} />
          </mesh>
        </group>
      </group>

      {/* Floating Speech Bubble */}
      {speechBubbleText && (
        <Billboard position={[0, 2.38, 0]}>
          <mesh>
            <planeGeometry args={[Math.max(1.8, speechBubbleText.length * 0.11), 0.36]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.92} />
          </mesh>
          <Text position={[0, 0, 0.02]} fontSize={0.13} color="#1F2937" anchorX="center" anchorY="middle">
            {speechBubbleText}
          </Text>
        </Billboard>
      )}

      {/* Floating Billboard Name Tag */}
      <Billboard position={[0, 1.95, 0]}>
        <mesh>
          <planeGeometry args={[statusTag || isFollowing ? 2.5 : 1.6, 0.46]} />
          <meshBasicMaterial color={isFollowing ? '#10B981' : '#E63946'} transparent opacity={0.88} />
        </mesh>
        <Text position={[0, statusTag || isFollowing ? 0.08 : 0, 0.02]} fontSize={0.18} color="#FFFFFF" anchorX="center" anchorY="middle">
          {isFollowing ? 'Adek Khalid 🏃‍♂️' : 'Adek Khalid 🥁'}
        </Text>
        {(statusTag || isFollowing) && (
          <Text position={[0, -0.11, 0.02]} fontSize={0.11} color="#FEF08A" anchorX="center" anchorY="middle">
            {isFollowing ? 'Ikut Kak Khaulah ✨' : statusTag}
          </Text>
        )}
      </Billboard>
    </group>
  );
};

// ============================================================================
// 4. FAQIH MODEL (ADEK FAQIH - 2 TAHUN, BALITA GEMAS, MULTI-ACTIVITY PROPS)
// ============================================================================
const FaqihModel: React.FC<{ position: [number, number, number]; statusTag?: string }> = ({ position, statusTag }) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const toyCarRef = useRef<THREE.Group>(null);
  const rightHandRef = useRef<THREE.Group>(null);
  const cribBlanketRef = useRef<THREE.Mesh>(null);
  const currentPos = useRef(new THREE.Vector3(position[0], position[1], position[2]));

  const timeOfDay = useGameStore((s) => s.timeOfDay);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    const playerPos = gameStore.getState().playerPos;

    currentPos.current.x = THREE.MathUtils.lerp(currentPos.current.x, position[0], delta * 2.2);
    currentPos.current.y = THREE.MathUtils.lerp(currentPos.current.y, position[1], delta * 2.2);
    currentPos.current.z = THREE.MathUtils.lerp(currentPos.current.z, position[2], delta * 2.2);
    groupRef.current.position.copy(currentPos.current);

    const dx = playerPos[0] - currentPos.current.x;
    const dz = playerPos[2] - currentPos.current.z;
    const distSq = dx * dx + dz * dz;

    if (distSq < 16.0) {
      const targetAngle = Math.atan2(dx, dz);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetAngle, delta * 3.5);
    }

    if (timeOfDay === 'siang') {
      // Pushing toy car forward and back
      const carCycle = Math.sin(time * 2.6);
      if (toyCarRef.current) {
        toyCarRef.current.position.z = 0.3 + carCycle * 0.25;
      }
      if (rightHandRef.current) {
        rightHandRef.current.rotation.x = 0.35 + carCycle * 0.2;
      }
    } else if (timeOfDay === 'subuh') {
      // Peekaboo hand waving in stroller
      if (rightHandRef.current) {
        rightHandRef.current.rotation.x = -0.5 + Math.sin(time * 5) * 0.3;
      }
    } else if (timeOfDay === 'malam') {
      // Sleeping in crib with rhythmic breathing
      if (cribBlanketRef.current) {
        cribBlanketRef.current.scale.y = 1.0 + Math.sin(time * 1.8) * 0.08;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Floor Contact Shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.7, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>

      {/* ============================================================== */}
      {/* ACTIVITY EQUIPMENT: SUBUH - BABY STROLLER / KERETA DORONG       */}
      {/* ============================================================== */}
      {timeOfDay === 'subuh' && (
        <group position={[0, 0, 0]}>
          {/* Stroller Frame */}
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[0.65, 0.5, 0.8]} />
            <meshStandardMaterial color="#06D6A0" roughness={0.4} />
          </mesh>
          {/* Stroller Canopy */}
          <mesh position={[0, 0.78, -0.15]} rotation={[-0.3, 0, 0]}>
            <cylinderGeometry args={[0.34, 0.34, 0.65, 12, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#118AB2" side={THREE.DoubleSide} />
          </mesh>
          {/* Stroller Wheels */}
          {[-0.35, 0.35].map((wx, i) =>
            [-0.3, 0.3].map((wz, j) => (
              <mesh key={`swheel-${i}-${j}`} position={[wx, 0.12, wz]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.1, 0.1, 0.05, 12]} />
                <meshStandardMaterial color="#1E293B" />
              </mesh>
            ))
          )}
          {/* Mini Baby Milk Bottle */}
          <mesh position={[0.34, 0.6, 0.1]}>
            <cylinderGeometry args={[0.04, 0.04, 0.14, 8]} />
            <meshStandardMaterial color="#FFFFFF" transparent opacity={0.9} />
          </mesh>
        </group>
      )}

      {/* ============================================================== */}
      {/* ACTIVITY EQUIPMENT: SIANG - TOY RACE CAR & CIRCUIT PLAY MAT    */}
      {/* ============================================================== */}
      {timeOfDay === 'siang' && (
        <group position={[0, 0.025, 0]}>
          {/* Soft Oval Play Mat */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[0.85, 24]} />
            <meshStandardMaterial color="#80ED99" roughness={0.7} />
          </mesh>
          {/* Race Track Ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
            <ringGeometry args={[0.38, 0.72, 24]} />
            <meshBasicMaterial color="#4A5568" />
          </mesh>
          {/* Cruising Toy Car */}
          <group ref={toyCarRef} position={[0, 0.08, 0.3]}>
            <mesh castShadow>
              <boxGeometry args={[0.22, 0.1, 0.34]} />
              <meshStandardMaterial color="#E63946" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.08, -0.02]}>
              <boxGeometry args={[0.18, 0.08, 0.16]} />
              <meshStandardMaterial color="#93C5FD" transparent opacity={0.8} />
            </mesh>
            {/* 4 Wheels */}
            {[-0.12, 0.12].map((wx, i) =>
              [-0.1, 0.1].map((wz, j) => (
                <mesh key={`carw-${i}-${j}`} position={[wx, -0.02, wz]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.045, 0.045, 0.03, 10]} />
                  <meshStandardMaterial color="#1E1E24" />
                </mesh>
              ))
            )}
          </group>
        </group>
      )}

      {/* ============================================================== */}
      {/* ACTIVITY EQUIPMENT: SORE - BABY RATTLE MARACAS                 */}
      {/* ============================================================== */}
      {timeOfDay === 'sore' && (
        <group position={[0.22, 0.45, 0.2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.16, 8]} />
            <meshStandardMaterial color="#FFD166" />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.06, 10, 10]} />
            <meshStandardMaterial color="#EF476F" />
          </mesh>
          <Sparkles count={5} position={[0, 0.15, 0]} scale={0.3} size={1.8} speed={0.8} color="#FEF08A" />
        </group>
      )}

      {/* ============================================================== */}
      {/* ACTIVITY EQUIPMENT: MALAM - BABY CRIB WITH MOBILE TOY & ZZZ    */}
      {/* ============================================================== */}
      {timeOfDay === 'malam' && (
        <group position={[0, 0, 0]}>
          {/* White Wooden Crib Rails */}
          <mesh position={[0, 0.35, 0]} castShadow>
            <boxGeometry args={[0.8, 0.6, 1.2]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
          </mesh>
          {/* Soft Mattress & Blanket */}
          <mesh ref={cribBlanketRef} position={[0, 0.42, 0]}>
            <boxGeometry args={[0.72, 0.18, 1.1]} />
            <meshStandardMaterial color="#BAE6FD" roughness={0.8} />
          </mesh>
          {/* Soft Zzz / Star Glow */}
          <Sparkles count={6} position={[0, 0.7, 0]} scale={0.6} size={1.5} speed={0.3} color="#C4B5FD" />
        </group>
      )}

      {/* ========================================================= */}
      {/* FAQIH CHARACTER BODY (2 TAHUN, BALITA GEMAS)              */}
      {/* ========================================================= */}
      <group position={[0, 0, 0]}>
        {/* Chubby Torso in Mint Green Romper */}
        <mesh position={[0, 0.38, 0]} castShadow>
          <sphereGeometry args={[0.26, 12, 12]} />
          <meshStandardMaterial color="#2A9D8F" roughness={0.6} />
        </mesh>

        {/* Right Arm */}
        <group ref={rightHandRef} position={[0.22, 0.45, 0]}>
          <mesh position={[0, -0.1, 0.08]} rotation={[0.4, 0, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.045, 0.22, 8]} />
            <meshStandardMaterial color="#FCD5B5" />
          </mesh>
        </group>

        {/* Head */}
        <group ref={headRef} position={[0, 0.74, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.22, 14, 14]} />
            <meshStandardMaterial color="#FCD5B5" />
          </mesh>
          {/* Tiny Brown Tuft Hair */}
          <mesh position={[0, 0.18, -0.02]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#4A2810" />
          </mesh>
          {/* Chubby Rosy Cheeks */}
          <mesh position={[-0.1, -0.04, 0.19]}>
            <circleGeometry args={[0.035, 8]} />
            <meshBasicMaterial color="#FF80AB" transparent opacity={0.75} />
          </mesh>
          <mesh position={[0.1, -0.04, 0.19]}>
            <circleGeometry args={[0.035, 8]} />
            <meshBasicMaterial color="#FF80AB" transparent opacity={0.75} />
          </mesh>
        </group>
      </group>

      {/* Floating Billboard Name Tag */}
      <Billboard position={[0, 1.45, 0]}>
        <mesh>
          <planeGeometry args={[statusTag ? 2.5 : 1.5, 0.46]} />
          <meshBasicMaterial color="#2A9D8F" transparent opacity={0.88} />
        </mesh>
        <Text position={[0, statusTag ? 0.08 : 0, 0.02]} fontSize={0.18} color="#FFFFFF" anchorX="center" anchorY="middle">
          Adek Faqih 🚗
        </Text>
        {statusTag && (
          <Text position={[0, -0.11, 0.02]} fontSize={0.11} color="#E0F2FE" anchorX="center" anchorY="middle">
            {statusTag}
          </Text>
        )}
      </Billboard>
    </group>
  );
};

// ============================================================================
// MAIN FAMILY COMPONENT WITH PROXIMITY DETECTION & INTERACTION
// ============================================================================
export const FamilyMembers: React.FC = () => {
  const lastNearId = useRef<string | null>(null);
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const isKhalidFollowing = useGameStore((s) => s.isKhalidFollowing);
  const isInsideHouse = useGameStore((s) => s.isInsideHouse);
  const schedule = FAMILY_SCHEDULE[timeOfDay] || FAMILY_SCHEDULE.siang;

  const getDynamicMembers = () => {
    const all = [
      {
        id: 'abi',
        pos: schedule.abi.pos,
        title: 'Abi',
        prompt: `Tekan [E] untuk Sapa Abi! 💻 (${schedule.abi.status})`,
        dialog: {
          speaker: 'Abi',
          role: `Ayah Tercinta 💻 (${schedule.abi.status})`,
          avatarBg: 'bg-blue-600',
          text: schedule.abi.text,
          actionText: '💻 Tos Semangat sama Abi! ✨',
          actionType: 'high_five' as const,
        },
      },
      {
        id: 'ummi',
        pos: schedule.ummi.pos,
        title: 'Ummi',
        prompt: `Tekan [E] untuk Sapa Ummi! 🧕 (${schedule.ummi.status})`,
        dialog: {
          speaker: 'Ummi',
          role: `Ibu Tercinta Bercadar 🧕 (${schedule.ummi.status})`,
          avatarBg: 'bg-rose-500',
          text: schedule.ummi.text,
          actionText: '🧹 Ambil Bekal Berkah Ummi! (+Speed Boost ⚡)',
          actionType: 'take_snack' as const,
        },
      },
      {
        id: 'khalid',
        pos: isKhalidFollowing ? gameStore.getState().khalidPos : schedule.khalid.pos,
        title: 'Adek Khalid',
        prompt: isKhalidFollowing
          ? 'Tekan [E] untuk Suruh Khalid Istirahat! 👦🏠'
          : `Tekan [E] untuk Ajak Khalid Ikut! 👦🏃‍♂️ (${schedule.khalid.status})`,
        dialog: {
          speaker: 'Adek Khalid',
          role: isKhalidFollowing ? 'Sahabat Petualang Cilik 👦🏃‍♂️' : `Pemain Drumband Cilik 👦🥁 (${schedule.khalid.status})`,
          avatarBg: 'bg-amber-500',
          text: isKhalidFollowing
            ? 'Kak Khaulah! Khalid senang banget ikut lari-larian keliling desa! Mau Khalid terus ikut petualangan, atau istirahat di sini dulu?'
            : schedule.khalid.text,
          actionText: isKhalidFollowing ? '🏠 Adek Khalid Istirahat di Rumah Dulu 🌸' : '🏃‍♂️ Ajak Adek Khalid Ikut Petualangan! ✨',
          actionType: 'toggle_khalid_follow' as const,
        },
      },
      {
        id: 'faqih',
        pos: schedule.faqih.pos,
        title: 'Adek Faqih',
        prompt: `Tekan [E] untuk Main bareng Faqih! 👶 (${schedule.faqih.status})`,
        dialog: {
          speaker: 'Adek Faqih',
          role: `Adik Gemas Balap Mobilan 👶🚗 (${schedule.faqih.status})`,
          avatarBg: 'bg-emerald-500',
          text: schedule.faqih.text,
          actionText: '🚗 Balapan Mobilan bareng Faqih! 💨',
          actionType: 'play_toycar' as const,
        },
      },
    ];

    if (!isInsideHouse) {
      return isKhalidFollowing ? [all[2]] : [];
    }
    return all;
  };

  useFrame(() => {
    const playerPos = gameStore.getState().playerPos;
    const members = getDynamicMembers();

    let closestMember: (typeof members)[0] | null = null;
    let closestDistSq = Infinity;

    for (const m of members) {
      const distSq =
        Math.pow(playerPos[0] - m.pos[0], 2) +
        Math.pow(playerPos[1] - m.pos[1], 2) +
        Math.pow(playerPos[2] - m.pos[2], 2);
      const effectiveDist = m.id === 'khalid' && isKhalidFollowing ? distSq + 1.6 : distSq;

      if (effectiveDist < 6.0 && effectiveDist < closestDistSq) {
        closestDistSq = effectiveDist;
        closestMember = m;
      }
    }

    if (closestMember) {
      if (lastNearId.current !== closestMember.id) {
        lastNearId.current = closestMember.id;
        gameStore.setNearbyInteractable({
          id: closestMember.id,
          title: closestMember.title,
          prompt: closestMember.prompt,
        });
      }
    } else {
      if (lastNearId.current !== null) {
        lastNearId.current = null;
        gameStore.setNearbyInteractable(null);
      }
    }
  });

  const members = getDynamicMembers();

  return (
    <group>
      {/* 1. Abi (Hanya di dalam rumah) */}
      {isInsideHouse && (
        <group
          onClick={(e) => {
            e.stopPropagation();
            const abiM = members.find((m) => m.id === 'abi');
            if (abiM) gameStore.openDialog(abiM.dialog);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          <AbiModel position={schedule.abi.pos} statusTag={schedule.abi.status} />
        </group>
      )}

      {/* 2. Ummi (Hanya di dalam rumah) */}
      {isInsideHouse && (
        <group
          onClick={(e) => {
            e.stopPropagation();
            const ummiM = members.find((m) => m.id === 'ummi');
            if (ummiM) gameStore.openDialog(ummiM.dialog);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          <UmmiModel position={schedule.ummi.pos} statusTag={schedule.ummi.status} />
        </group>
      )}

      {/* 3. Adek Khalid (Di dalam rumah ATAU ikut Kak Khaulah ke luar) */}
      {(isInsideHouse || isKhalidFollowing) && (
        <group
          onClick={(e) => {
            e.stopPropagation();
            const khalidM = members.find((m) => m.id === 'khalid');
            if (khalidM) gameStore.openDialog(khalidM.dialog);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          <KhalidModel position={schedule.khalid.pos} statusTag={schedule.khalid.status} />
        </group>
      )}

      {/* 4. Adek Faqih (Hanya di dalam rumah) */}
      {isInsideHouse && (
        <group
          onClick={(e) => {
            e.stopPropagation();
            const faqihM = members.find((m) => m.id === 'faqih');
            if (faqihM) gameStore.openDialog(faqihM.dialog);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          <FaqihModel position={schedule.faqih.pos} statusTag={schedule.faqih.status} />
        </group>
      )}
    </group>
  );
};
