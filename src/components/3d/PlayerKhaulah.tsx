import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gameStore, useGameStore } from '../../state/useGameStore';
import { soundManager } from '../../sound/audioManager';
import { colliders, resolveHorizontalCollisions } from '../../state/colliders';
import { SwanBoatModel } from './Environment/SunnyBeachLake';
import { MiniFireTruckModel } from './Environment/TownStreet';
import { getTrainTrackPose } from './Environment/VillageTrain';
import { getWaterSlidePose } from './Environment/waterSlideTrajectory';
import { getWaterStatus } from '../../state/waterZones';

interface WaterRippleEffectsProps {
  inWaterRef: React.MutableRefObject<boolean>;
  isMovingRef: React.MutableRefObject<boolean>;
  waterSurfaceYRef: React.MutableRefObject<number>;
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
}

// Interactive 3D Water Ripples & Splash FX surrounding Khaulah in water
const WaterRippleEffects: React.FC<WaterRippleEffectsProps> = ({
  inWaterRef,
  isMovingRef,
  waterSurfaceYRef,
  playerPosRef,
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const wakeRef = useRef<THREE.Mesh>(null);
  const bubblesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!rootRef.current) return;
    const inWater = inWaterRef.current;
    rootRef.current.visible = inWater;
    if (!inWater) return;

    const t = state.clock.getElapsedTime();
    const isMoving = isMovingRef.current;

    // Adjust local Y offset to match exact water surface
    const surfaceY = waterSurfaceYRef.current;
    const playerY = playerPosRef.current.y;
    rootRef.current.position.y = THREE.MathUtils.clamp(surfaceY - playerY + 0.006, -0.4, 0.4);

    // Ripple 1
    if (ring1Ref.current) {
      const p1 = (t * 0.95) % 1;
      const s1 = 0.5 + p1 * 1.5;
      ring1Ref.current.scale.set(s1, s1, 1);
      const mat1 = ring1Ref.current.material as THREE.MeshBasicMaterial;
      if (mat1) mat1.opacity = Math.max(0, (1 - p1) * 0.55);
    }

    // Ripple 2
    if (ring2Ref.current) {
      const p2 = (t * 0.95 + 0.5) % 1;
      const s2 = 0.5 + p2 * 1.5;
      ring2Ref.current.scale.set(s2, s2, 1);
      const mat2 = ring2Ref.current.material as THREE.MeshBasicMaterial;
      if (mat2) mat2.opacity = Math.max(0, (1 - p2) * 0.55);
    }

    // Wake ripple trailing behind player
    if (wakeRef.current) {
      if (isMoving) {
        wakeRef.current.visible = true;
        const pw = (t * 2.2) % 1;
        const sw = 0.6 + pw * 1.1;
        wakeRef.current.scale.set(sw, sw * 0.75, 1);
        const matw = wakeRef.current.material as THREE.MeshBasicMaterial;
        if (matw) matw.opacity = Math.max(0, (1 - pw) * 0.45);
      } else {
        wakeRef.current.visible = false;
      }
    }

    // Foam bubbles
    if (bubblesRef.current) {
      const speed = isMoving ? 14 : 4;
      bubblesRef.current.children.forEach((c, idx) => {
        const mesh = c as THREE.Mesh;
        mesh.position.y = Math.sin(t * speed + idx * 1.3) * 0.02;
        const bs = isMoving ? 0.8 + Math.sin(t * 12 + idx) * 0.25 : 0.5;
        mesh.scale.set(bs, bs, bs);
      });
    }
  });

  return (
    <group ref={rootRef} visible={false}>
      {/* Concentric ripples */}
      <mesh ref={ring1Ref} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.42, 24]} />
        <meshBasicMaterial color="#E0FBFC" transparent opacity={0.5} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.42, 24]} />
        <meshBasicMaterial color="#BEE9E8" transparent opacity={0.5} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Trailing wake ripple */}
      <mesh ref={wakeRef} position={[0, 0.002, -0.42]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.34, 20]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.4} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Water splash bubbles */}
      <group ref={bubblesRef}>
        {[
          [-0.26, 0.15],
          [0.26, 0.15],
          [-0.18, -0.25],
          [0.18, -0.25],
          [0, 0.28],
          [0, -0.36],
        ].map(([px, pz], idx) => (
          <mesh key={idx} position={[px, 0.01, pz]}>
            <sphereGeometry args={[0.032, 8, 8]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.2} transparent opacity={0.8} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export const PlayerKhaulah: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const skirtRef = useRef<THREE.Group>(null);
  const hijabDrapeRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Group>(null);
  const rightEyeRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const wingsRef = useRef<THREE.Group>(null);

  // Advanced Animation State Refs
  const squashScale = useRef(new THREE.Vector3(1, 1, 1));
  const targetSquash = useRef(new THREE.Vector3(1, 1, 1));
  const wasGrounded = useRef(false);
  const lastVelocityY = useRef(0);
  const blinkTimer = useRef(2.5);
  const isBlinking = useRef(false);
  const blinkDuration = useRef(0);
  const currentEyeScaleY = useRef(1.0);
  const currentBankAngle = useRef(0);
  const currentForwardLean = useRef(0);

  const activeAccessory = useGameStore((s) => s.activeAccessory);
  const activeEmote = useGameStore((s) => s.activeEmote);
  const speedBuffTimeLeft = useGameStore((s) => s.speedBuffTimeLeft);
  const isRidingScooter = useGameStore((s) => s.isRidingScooter);
  const activeRide = useGameStore((s) => s.activeRide);
  const timeOfDay = useGameStore((s) => s.timeOfDay);

  // Character physical state: start at saved position from localStorage
  const initialPlayerPos = gameStore.getState().playerPos;
  const pos = useRef(new THREE.Vector3(initialPlayerPos[0], initialPlayerPos[1], initialPlayerPos[2]));
  const velocityY = useRef(0);
  const isGrounded = useRef(false);
  const moveSpeed = 10.5;
  const jumpVelocity = 11;
  const trampolineJumpVelocity = 24;
  const gravity = 25;
  const facingAngle = useRef(0);
  const slideTimer = useRef(0);
  const poolSlideTimer = useRef(0);

  // Water interaction state refs
  const wasInWater = useRef(false);
  const waterStepTimer = useRef(0);
  const lastWaterMessageTime = useRef(0);
  const currentInWater = useRef(false);
  const currentWaterSurfaceY = useRef(0.16);
  const isMovingRef = useRef(false);

  // Keyboard input state
  const keys = useRef<{ [key: string]: boolean }>({});
  const coyoteTimer = useRef(0);
  const jumpBufferTimer = useRef(0);
  const lastRespawn = useRef(0);
  const lastTeleport = useRef(0);

  const isShiftLock = useGameStore((s) => s.isShiftLock);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger game keybinds if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      keys.current[e.code] = true;
      if (e.code === 'Space') {
        gameStore.setJumpPressed(true);
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        gameStore.toggleShiftLock();
      } else if (e.code === 'KeyM') {
        const isOpen = gameStore.getState().isMagicModalOpen;
        if (isOpen) {
          gameStore.closeMagicModal();
        } else {
          gameStore.openMagicModal();
        }
      } else if (e.code === 'KeyH') {
        const ride = gameStore.getState().activeRide;
        if (ride === 'train') {
          soundManager.playTrainWhistle();
          gameStore.setMessage('Tuut.. tuuut! Kereta Mini Khaulah melaju riang! 🚂💨✨');
        } else if (ride === 'firetruck') {
          soundManager.playFireSiren();
          gameStore.setMessage('Niu.. niu.. niu! Pasukan Damkar Cilik Khaulah siap menolong! 🚒🚨✨');
        } else if (ride === 'boat') {
          soundManager.playWaterSplash();
          gameStore.setMessage('Kecipak kecipuk! Perahu bebek Khaulah mendayung santai! 🦢🌊✨');
        } else {
          gameStore.ringBell();
        }
      } else if (e.code === 'KeyE') {
        const ride = gameStore.getState().activeRide;
        if (ride !== 'none') {
          gameStore.setActiveRide('none');
          if (ride === 'boat') {
            pos.current.set(-56.5, 0.38, 44.0);
          } else if (ride === 'carousel') {
            pos.current.set(58, 0.4, 36);
          } else if (ride === 'ferris') {
            pos.current.set(73, 0.4, 46);
          } else if (ride === 'flamingo') {
            pos.current.set(4, 0.4, -20);
          } else if (ride === 'pool_slide') {
            pos.current.set(2.2, 0.4, -28.6);
          } else if (ride === 'swing') {
            pos.current.set(-7.9, 0.4, 43.8);
          }
          gameStore.setMessage('Hore! Khaulah selesai bermain wahana! ✨');
          return;
        }

        if (gameStore.getState().isRidingScooter) {
          gameStore.dismountScooter();
          return;
        }

        const near = gameStore.getState().nearbyInteractable;
        if (near) {
          if (near.id === 'scooter') {
            gameStore.mountScooter();
          } else if (near.id === 'bu_guru') {
            const quest = gameStore.getState().schoolQuest;
            const allCollected = quest.backpack && quest.waterBottle && quest.drawingBook;
            if (quest.completed) {
              gameStore.openDialog({
                speaker: 'Ibu Santi',
                role: 'Guru TK Karang Tengah 1 Atap 👩‍🏫',
                avatarBg: 'bg-emerald-600',
                text: 'Assalamu\'alaikum Khaulah bidadari shalihah! MasyaAllah, Khaulah selalu rajin dan ceria di sekolah. Ayo belajar, bernyanyi, dan bermain bersama teman-teman! 🌸🎒',
              });
            } else if (allCollected) {
              gameStore.openDialog({
                speaker: 'Ibu Santi',
                role: 'Guru TK Karang Tengah 1 Atap 👩‍🏫',
                avatarBg: 'bg-emerald-600',
                text: 'MasyaAllah Khaulah hebat sekali! Tas Ransel TK, Botol Minum, dan Buku Gambar semuanya sudah lengkap dibawa! Khaulah murid teladan TK Karang Tengah 1 Atap! Ini Piagam Penghargaan untuk Khaulah!',
                actionText: '🏅 Terima Piagam Penghargaan Murid Teladan! 🌸',
                actionType: 'complete_quest',
              });
            } else {
              const missing: string[] = [];
              if (!quest.backpack) missing.push('Tas Ransel TK 🎒');
              if (!quest.waterBottle) missing.push('Botol Minum 🍼');
              if (!quest.drawingBook) missing.push('Buku Gambar 🎨');
              gameStore.openDialog({
                speaker: 'Ibu Santi',
                role: 'Guru TK Karang Tengah 1 Atap 👩‍🏫',
                avatarBg: 'bg-emerald-600',
                text: `Assalamu'alaikum Khaulah sayang! Sebelum mulai belajar, ayo cari perlengkapan yang belum lengkap dulu ya: ${missing.join(', ')}. Ada di sekitar teras rumah dan taman!`,
              });
            }
          } else if (near.id === 'abi') {
            gameStore.openDialog({
              speaker: 'Abi',
              role: 'Ayah Tercinta 💻',
              avatarBg: 'bg-blue-600',
              text: 'Assalamu\'alaikum Khaulah putri shalihah Abi! Abi sedang fokus menyelesaikan pekerjaan dan coding di laptop untuk keluarga. Tapi melihat senyum ceria Khaulah membuat lelah Abi langsung hilang! Semangat selalu ya nak!',
              actionText: '💻 Tos Semangat sama Abi! ✨',
              actionType: 'high_five',
            });
          } else if (near.id === 'ummi') {
            gameStore.openDialog({
              speaker: 'Ummi',
              role: 'Ibu Tercinta Bercadar 🧕',
              avatarBg: 'bg-rose-500',
              text: 'Assalamu\'alaikum Khaulah bidadari kecil Ummi! Kebersihan itu sebagian dari iman, nak. Ummi sedang menyapu teras agar rumah kita selalu asri dan rapi. Ummi sudah siapkan bekal cinta terenak untuk Khaulah, ayo ambil sayang!',
              actionText: '🧹 Ambil Bekal Berkah Ummi! (+Speed Boost ⚡)',
              actionType: 'take_snack',
            });
          } else if (near.id === 'khalid') {
            gameStore.openDialog({
              speaker: 'Adek Khalid',
              role: 'Pemain Drumband Cilik 👦🥁',
              avatarBg: 'bg-amber-500',
              text: 'Kak Khaulah lihat nih! Khalid lagi latihan drumband! Dum-tak-tak-dum ratatat! Nanti pas pawai drum band di TK, Khalid mau main paling hebat bareng Kak Khaulah!',
              actionText: '🥁 Main Drumband Bareng Khalid! 🎶',
              actionType: 'play_drumband',
            });
          } else if (near.id === 'faqih') {
            gameStore.openDialog({
              speaker: 'Adek Faqih',
              role: 'Adik Gemas Balap Mobilan 👶🚗',
              avatarBg: 'bg-emerald-500',
              text: 'Ngeeeng! Brum brum pip pip! Adek Faqih lagi seru banget ngebutin mobil-mobilan di karpet lintasan! Kak Khaulah ayo balapan mobilan bareng Faqih!',
              actionText: '🚗 Balapan Mobilan bareng Faqih! 💨',
              actionType: 'play_toycar',
            });
          } else if (near.id === 'slide') {
            const distSq = Math.pow(pos.current.x - 9, 2) + Math.pow(pos.current.z - 42, 2);
            if (distSq < 25.0) {
              gameStore.setActiveRide('slide');
            }
          } else if (near.id === 'swing') {
            const distSq = Math.pow(pos.current.x - (-9), 2) + Math.pow(pos.current.z - 42, 2);
            if (distSq < 25.0) {
              gameStore.setActiveRide('swing');
            }
          } else if (near.id === 'farm_bunny') {
            gameStore.executeDialogAction('feed_animal');
          } else if (near.id === 'farm_sheep') {
            soundManager.playAnimalSound('sheep');
            gameStore.setMessage('Mbaaa~ Domba berbulu awan kapas dielus lembut oleh Khaulah! 🐑💖');
          } else if (near.id === 'pak_tani') {
            gameStore.openDialog({
              speaker: 'Pak Tani Ceria',
              role: 'Sahabat Hewan & Kebun 👨‍🌾',
              avatarBg: 'bg-emerald-600',
              text: 'Assalamu\'alaikum Khaulah sayang! Senang sekali Khaulah berkunjung ke peternakan desa. Hewan-hewan jinak ini suka sekali makan wortel segar dan apel manis! Ayo beri makan kelinci lucunya ya!',
              actionText: '🥕 Beri Wortel Segar ke Kelinci! ✨',
              actionType: 'feed_animal',
            });
          } else if (near.id === 'swan_boat') {
            gameStore.setActiveRide('boat');
            pos.current.set(-61.5, 0.20, 44.0);
            facingAngle.current = Math.PI / 2;
            soundManager.playWaterSplash();
          } else if (near.id === 'mart_cashier') {
            gameStore.executeDialogAction('scan_grocery');
          } else if (near.id === 'bakery_cake') {
            gameStore.openDialog({
              speaker: 'Chef Bakery Ceria',
              role: 'Pembuat Kue Manis 🧁',
              avatarBg: 'bg-rose-500',
              text: 'Assalamu\'alaikum Khaulah bidadari manis! Ini Chef baru saja memanggang donat meses pelangi dan kue ulang tahun lezat! Mau cicipi donatnya?',
              actionText: '🍩 Cicipi Donat Pelangi! (+Speed Boost ⚡)',
              actionType: 'buy_icecream',
            });
          } else if (near.id === 'firetruck') {
            gameStore.setActiveRide('firetruck');
          } else if (near.id === 'carousel') {
            gameStore.setActiveRide('carousel');
          } else if (near.id === 'ferris_wheel') {
            gameStore.setActiveRide('ferris');
          } else if (near.id === 'carnival_candy') {
            gameStore.executeDialogAction('buy_icecream');
          } else if (near.id === 'village_train') {
            gameStore.setActiveRide('train');
          } else if (near.id === 'pool_slide') {
            poolSlideTimer.current = 0;
            gameStore.setActiveRide('pool_slide');
          } else if (near.id === 'flamingo_float') {
            gameStore.setActiveRide('flamingo');
          } else if (near.id === 'treehouse') {
            pos.current.set(-20, 3.8, -28);
            soundManager.playJump();
            gameStore.setMessage('Khaulah memanjat ke Rumah Pohon Rahasia! Pemandangannya indah sekali! 🏡🌳✨');
          } else if (near.id === 'marshmallow') {
            gameStore.executeDialogAction('take_snack');
            gameStore.setMessage('Nyam nyam! Khaulah menikmati marshmallow bakar manis! (+Speed Boost ⚡🍡)');
          }
        } else {
          gameStore.triggerEmote('wave');
          gameStore.setMessage('Khaulah menyapa teman-teman! 👋✨');
        }
      } else if (e.code === 'KeyQ') {
        gameStore.triggerEmote('dance');
        gameStore.setMessage('Hore! Khaulah berjoget ceria! 💃🎶');
      } else if (e.code === 'KeyR') {
        gameStore.triggerRespawn();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
      if (e.code === 'Space') {
        gameStore.setJumpPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const footstepTimer = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.1);

    // Speed Buff & Scooter Speed Tick
    gameStore.tickSpeedBuff(dt);
    gameStore.tickJumpBuff(dt);
    const speedBuff = gameStore.getState().speedBuffTimeLeft;
    const ridingScooter = gameStore.getState().isRidingScooter;
    const activeRide = gameStore.getState().activeRide;

    // Detect water status across all environments (River canal, Backyard Pool, Sunny Beach Lake)
    const waterStatus = getWaterStatus(pos.current.x, pos.current.y, pos.current.z);
    let inWater = waterStatus.inWater && activeRide === 'none';
    if (isGrounded.current && pos.current.y >= waterStatus.surfaceY + 0.06) {
      inWater = false;
    }
    currentInWater.current = inWater;
    currentWaterSurfaceY.current = waterStatus.surfaceY;

    // Water entry splash sound, auto dismount scooter, and greeting notification
    if (inWater && !wasInWater.current) {
      soundManager.playWaterSplash();
      if (ridingScooter) {
        gameStore.dismountScooter();
      }
      const curT = state.clock.getElapsedTime();
      if (curT - lastWaterMessageTime.current > 12) {
        lastWaterMessageTime.current = curT;
        gameStore.setMessage('Byuuuur! Khaulah berenang & bermain air segar! 🌊🏊‍♀️✨');
      }
    }
    wasInWater.current = inWater;

    let effectiveMoveSpeed = moveSpeed;
    if (ridingScooter) {
      effectiveMoveSpeed = speedBuff > 0 ? 26.0 : 20.0;
    } else if (activeRide === 'firetruck') {
      effectiveMoveSpeed = speedBuff > 0 ? 25.0 : 19.0;
    } else if (activeRide === 'boat') {
      effectiveMoveSpeed = 8.5;
    } else if (inWater) {
      // Natural gentle water resistance for joyful wading & swimming
      effectiveMoveSpeed = speedBuff > 0 ? 12.0 : 8.0;
    } else if (speedBuff > 0) {
      effectiveMoveSpeed = 15.0;
    }

    // Check external respawn trigger (e.g. from R key)
    const currentRespawn = gameStore.getState().respawnTrigger;
    if (currentRespawn !== lastRespawn.current) {
      lastRespawn.current = currentRespawn;
      pos.current.set(0, 0.8, -4);
      velocityY.current = 0;
      gameStore.savePosition([0, 0.8, -4], true);
    }

    // Check external teleport trigger (from Magic Wand / Presets)
    const currentTeleport = gameStore.getState().teleportTrigger;
    if (currentTeleport !== lastTeleport.current) {
      lastTeleport.current = currentTeleport;
      const target = gameStore.getState().teleportTarget;
      if (target) {
        pos.current.set(target[0], target[1], target[2]);
        velocityY.current = 0;
        gameStore.savePosition(target, true);
      }
    }

    // Check Active Ride State (Perosotan / Ayunan)
    if (activeRide === 'slide') {
      slideTimer.current += dt * 0.85;
      if (slideTimer.current < 0.28) {
        // Climbing ladder
        const t = slideTimer.current / 0.28;
        pos.current.set(9, 0.4 + t * 2.1, 43.2 - t * 1.2);
        facingAngle.current = Math.PI;

        const climb = Math.sin(slideTimer.current * 30);
        if (leftArmRef.current) leftArmRef.current.rotation.x = climb * 0.7;
        if (rightArmRef.current) rightArmRef.current.rotation.x = -climb * 0.7;
        if (leftLegRef.current) leftLegRef.current.rotation.x = -climb * 0.6;
        if (rightLegRef.current) rightLegRef.current.rotation.x = climb * 0.6;
      } else if (slideTimer.current < 0.42) {
        // Sitting at top
        pos.current.set(9, 2.5, 42.0);
        facingAngle.current = Math.PI;
        if (leftArmRef.current) { leftArmRef.current.rotation.x = -0.5; leftArmRef.current.rotation.z = -0.3; }
        if (rightArmRef.current) { rightArmRef.current.rotation.x = -0.5; rightArmRef.current.rotation.z = 0.3; }
        if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.PI * 0.45;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.PI * 0.45;
        if (skirtRef.current) skirtRef.current.rotation.x = -Math.PI * 0.35;
      } else if (slideTimer.current < 0.88) {
        // Sliding down chute wuuush: joyful hands in the air!
        const t = (slideTimer.current - 0.42) / 0.46;
        pos.current.set(9, 2.5 - t * 2.1, 42.0 - t * 3.8);
        facingAngle.current = Math.PI;

        if (leftArmRef.current) { leftArmRef.current.rotation.x = -Math.PI * 0.85; leftArmRef.current.rotation.z = -0.35; }
        if (rightArmRef.current) { rightArmRef.current.rotation.x = -Math.PI * 0.85; rightArmRef.current.rotation.z = 0.35; }
        if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.PI * 0.45;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.PI * 0.45;
        if (skirtRef.current) skirtRef.current.rotation.x = -Math.PI * 0.35;
        if (hijabDrapeRef.current) hijabDrapeRef.current.rotation.x = 0.35;
      } else {
        // Finished slide!
        pos.current.set(9, 0.4, 38.2);
        slideTimer.current = 0;
        gameStore.setActiveRide('none');
        gameStore.setMessage('WUUUSSHH! Hore, Khaulah meluncur seru di perosotan TK! 🛝✨');
      }
      groupRef.current.position.copy(pos.current);
      groupRef.current.rotation.y = facingAngle.current;
      gameStore.setPlayerMotion([pos.current.x, pos.current.y, pos.current.z], facingAngle.current, true);
      return;
    } else {
      slideTimer.current = 0;
    }

    if (activeRide === 'swing') {
      const time = state.clock.getElapsedTime();
      const swingAngle = Math.sin(time * 2.4) * 0.52;
      const L = 2.6;
      const seatY = 3.7 - L * Math.cos(swingAngle);
      const seatZ = 42.0 - L * Math.sin(swingAngle);

      pos.current.set(-7.9, seatY - 0.42, seatZ);
      facingAngle.current = 0;

      // Body dynamic lean: bersandar ke belakang saat ayunan melambung ke depan, condong ke depan saat mengayun ke belakang
      if (modelRef.current) {
        modelRef.current.rotation.x = swingAngle * 0.75;
      }

      // Pose duduk memegang rantai ayunan & menendang kaki ke depan saat melambung
      if (leftArmRef.current) { leftArmRef.current.rotation.x = -0.75 + swingAngle * 0.2; leftArmRef.current.rotation.z = -0.18; }
      if (rightArmRef.current) { rightArmRef.current.rotation.x = -0.75 + swingAngle * 0.2; rightArmRef.current.rotation.z = 0.18; }
      if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.PI * 0.38 + swingAngle * 0.45;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.PI * 0.38 + swingAngle * 0.45;
      if (skirtRef.current) skirtRef.current.rotation.x = -Math.PI * 0.32;
      if (headRef.current) headRef.current.rotation.x = -swingAngle * 0.35;

      if (keys.current['Space'] || gameStore.getState().isJumpPressed) {
        gameStore.setActiveRide('none');
        velocityY.current = 7.5;
        pos.current.z += 1.3;
        gameStore.setMessage('Hoppp! Khaulah melompat turun dari ayunan! 🎡✨');
      }

      groupRef.current.position.copy(pos.current);
      groupRef.current.rotation.y = facingAngle.current;
      gameStore.setPlayerMotion([pos.current.x, pos.current.y, pos.current.z], facingAngle.current, false);
      return;
    }

    // Carousel ride
    if (activeRide === 'carousel') {
      const time = state.clock.getElapsedTime();
      const angle = time * 0.45;
      const r = 2.8;
      pos.current.set(58 + Math.cos(angle) * r, 1.25 + Math.sin(time * 3) * 0.18, 41 - Math.sin(angle) * r);
      facingAngle.current = angle - Math.PI;

      if (leftArmRef.current) { leftArmRef.current.rotation.x = -0.7; leftArmRef.current.rotation.z = -0.2; }
      if (rightArmRef.current) { rightArmRef.current.rotation.x = -Math.PI * 0.7 + Math.sin(time * 6) * 0.3; rightArmRef.current.rotation.z = 0.4; }
      if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.PI * 0.4;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.PI * 0.4;
      if (skirtRef.current) skirtRef.current.rotation.x = -Math.PI * 0.3;

      if (keys.current['Space'] || gameStore.getState().isJumpPressed) {
        gameStore.setActiveRide('none');
        pos.current.set(58, 0.4, 36);
        velocityY.current = 6;
      }

      groupRef.current.position.copy(pos.current);
      groupRef.current.rotation.y = facingAngle.current;
      gameStore.setPlayerMotion([pos.current.x, pos.current.y, pos.current.z], facingAngle.current, false);
      return;
    }

    // Ferris Wheel ride
    if (activeRide === 'ferris') {
      const time = state.clock.getElapsedTime();
      const angle = time * 0.22;
      const r = 5.2;
      pos.current.set(73 + Math.cos(angle) * r, 7.0 + Math.sin(angle) * r - 0.2, 51);
      facingAngle.current = Math.PI / 2;

      if (leftArmRef.current) { leftArmRef.current.rotation.x = -0.5; leftArmRef.current.rotation.z = -0.2; }
      if (rightArmRef.current) { rightArmRef.current.rotation.x = -0.5; rightArmRef.current.rotation.z = 0.2; }
      if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.PI * 0.4;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.PI * 0.4;
      if (skirtRef.current) skirtRef.current.rotation.x = -Math.PI * 0.3;

      if (keys.current['Space'] || gameStore.getState().isJumpPressed) {
        gameStore.setActiveRide('none');
        pos.current.set(73, 0.4, 46);
        velocityY.current = 6;
      }

      groupRef.current.position.copy(pos.current);
      groupRef.current.rotation.y = facingAngle.current;
      gameStore.setPlayerMotion([pos.current.x, pos.current.y, pos.current.z], facingAngle.current, false);
      return;
    }

    // Village Train ride
    if (activeRide === 'train') {
      const time = state.clock.getElapsedTime();
      const trainProgress = (time * 0.025) % 1;
      const trainPose = getTrainTrackPose(trainProgress);
      pos.current.set(trainPose.pos.x, 0.9, trainPose.pos.z);
      facingAngle.current = trainPose.heading;

      if (leftArmRef.current) { leftArmRef.current.rotation.x = -0.6; leftArmRef.current.rotation.z = -0.2; }
      if (rightArmRef.current) { rightArmRef.current.rotation.x = -Math.PI * 0.75 + Math.sin(time * 5) * 0.25; rightArmRef.current.rotation.z = 0.35; }
      if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.PI * 0.35;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.PI * 0.35;
      if (skirtRef.current) skirtRef.current.rotation.x = -Math.PI * 0.25;

      if (keys.current['Space'] || gameStore.getState().isJumpPressed) {
        gameStore.setActiveRide('none');
        velocityY.current = 6;
        pos.current.y += 0.5;
      }

      groupRef.current.position.copy(pos.current);
      groupRef.current.rotation.y = facingAngle.current;
      gameStore.setPlayerMotion([pos.current.x, pos.current.y, pos.current.z], facingAngle.current, true);
      return;
    }

    // Backyard Waterpark: Grand Waterpark Castle Slide
    if (activeRide === 'pool_slide') {
      poolSlideTimer.current += dt * 0.72;
      if (poolSlideTimer.current < 0.28) {
        // Phase 1: Climbing stairs (Stairs from Z: -40.5 to Z: -37.8, Y: 0.4 to 4.05)
        const t = poolSlideTimer.current / 0.28;
        pos.current.set(8.5, 0.4 + t * 3.65, -40.5 + t * 2.7);
        facingAngle.current = 0; // facing North towards deck

        const climb = Math.sin(poolSlideTimer.current * 30);
        if (leftArmRef.current) leftArmRef.current.rotation.x = climb * 0.7;
        if (rightArmRef.current) rightArmRef.current.rotation.x = -climb * 0.7;
        if (leftLegRef.current) leftLegRef.current.rotation.x = -climb * 0.6;
        if (rightLegRef.current) rightLegRef.current.rotation.x = climb * 0.6;
        if (groupRef.current) groupRef.current.rotation.z = 0;
      } else if (poolSlideTimer.current < 0.40) {
        // Phase 2: Sitting ready at slide entrance launch tub (at [8.0, 4.0, -36.0])
        const walkT = (poolSlideTimer.current - 0.28) / 0.12;
        pos.current.set(8.5 - walkT * 0.5, 4.05 - walkT * 0.05, -37.8 + walkT * 1.8);
        const startPose = getWaterSlidePose(0);
        facingAngle.current = startPose.heading;

        if (leftArmRef.current) { leftArmRef.current.rotation.x = -0.5; leftArmRef.current.rotation.z = -0.3; }
        if (rightArmRef.current) { rightArmRef.current.rotation.x = -0.5; rightArmRef.current.rotation.z = 0.3; }
        if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.PI * 0.45;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.PI * 0.45;
        if (skirtRef.current) skirtRef.current.rotation.x = -Math.PI * 0.35;
        if (groupRef.current) groupRef.current.rotation.z = 0;
      } else if (poolSlideTimer.current < 0.88) {
        // Phase 3: Sliding down the exact 3D parametric flume curve wuuush!
        const progress = (poolSlideTimer.current - 0.40) / 0.48;
        const eased = Math.pow(progress, 1.25);
        const pose = getWaterSlidePose(eased);

        pos.current.set(pose.pos.x, pose.pos.y + 0.14, pose.pos.z);
        facingAngle.current = pose.heading;
        if (groupRef.current) groupRef.current.rotation.z = pose.bankAngle;

        // Joyful arms raised high in the air (\o/)
        if (leftArmRef.current) { leftArmRef.current.rotation.x = -Math.PI * 0.85; leftArmRef.current.rotation.z = -0.35; }
        if (rightArmRef.current) { rightArmRef.current.rotation.x = -Math.PI * 0.85; rightArmRef.current.rotation.z = 0.35; }
        if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.PI * 0.45;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.PI * 0.45;
        if (skirtRef.current) skirtRef.current.rotation.x = -Math.PI * 0.35;
        if (hijabDrapeRef.current) hijabDrapeRef.current.rotation.x = 0.4;
      } else {
        // Phase 4: Splashing down into the pool water byuuur!
        pos.current.set(2.2, 0.28, -28.6);
        poolSlideTimer.current = 0;
        if (groupRef.current) groupRef.current.rotation.z = 0;
        soundManager.playWaterSplash();
        gameStore.setActiveRide('none');
        gameStore.setMessage('BYUUUUUR! 🌊 Hore, Khaulah meluncur super seru di Seluncuran Istana Air! 🛝✨');
      }
      groupRef.current.position.copy(pos.current);
      groupRef.current.rotation.y = facingAngle.current;
      gameStore.setPlayerMotion([pos.current.x, pos.current.y, pos.current.z], facingAngle.current, true);
      return;
    } else {
      poolSlideTimer.current = 0;
    }

    // Backyard Waterpark: Flamingo Float ride
    if (activeRide === 'flamingo') {
      const time = state.clock.getElapsedTime();
      const bob = Math.sin(time * 2.0) * 0.04;
      pos.current.set(-3.0, 0.28 + bob, -30.0);
      facingAngle.current = 0;

      if (leftArmRef.current) { leftArmRef.current.rotation.x = -0.6; leftArmRef.current.rotation.z = -0.2; }
      if (rightArmRef.current) { rightArmRef.current.rotation.x = -Math.PI * 0.7 + Math.sin(time * 5) * 0.3; rightArmRef.current.rotation.z = 0.35; }
      if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.PI * 0.35;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.PI * 0.35;
      if (skirtRef.current) skirtRef.current.rotation.x = -Math.PI * 0.25;

      if (keys.current['Space'] || gameStore.getState().isJumpPressed) {
        gameStore.setActiveRide('none');
        velocityY.current = 7;
        pos.current.y += 0.5;
        soundManager.playWaterSplash();
        gameStore.setMessage('Hoppp! Khaulah melompat dari pelampung flamingo! 🦩🌊');
      }

      groupRef.current.position.copy(pos.current);
      groupRef.current.rotation.y = facingAngle.current;
      gameStore.setPlayerMotion([pos.current.x, pos.current.y, pos.current.z], facingAngle.current, false);
      return;
    }

    // 1. Gather Input
    let moveX = 0;
    let moveZ = 0;

    if (keys.current['KeyW'] || keys.current['ArrowUp']) moveZ += 1;
    if (keys.current['KeyS'] || keys.current['ArrowDown']) moveZ -= 1;
    if (keys.current['KeyA']) moveX -= 1;
    if (keys.current['KeyD']) moveX += 1;

    const joy = gameStore.getState().joystickVector;
    if (Math.abs(joy.x) > 0.05 || Math.abs(joy.y) > 0.05) {
      moveX += joy.x;
      moveZ -= joy.y;
    }

    const inputLength = Math.hypot(moveX, moveZ);
    const isMoving = inputLength > 0.1;
    isMovingRef.current = isMoving;

    // 2. Camera-relative direction calculation
    const camera = state.camera;
    const camForward = new THREE.Vector3();
    camera.getWorldDirection(camForward);
    camForward.y = 0;
    camForward.normalize();

    // Camera-relative Right vector (screen right)
    const camRight = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), camForward).negate().normalize();

    const moveDirection = new THREE.Vector3();
    if (isMoving) {
      const normX = moveX / (inputLength > 1 ? inputLength : 1);
      const normZ = moveZ / (inputLength > 1 ? inputLength : 1);

      moveDirection.addScaledVector(camForward, normZ);
      moveDirection.addScaledVector(camRight, normX);
      moveDirection.normalize();

      if (!isShiftLock) {
        const targetAngle = Math.atan2(moveDirection.x, moveDirection.z);
        let diff = targetAngle - facingAngle.current;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        facingAngle.current += diff * Math.min(dt * 14, 1);
      }
    }

    if (isShiftLock) {
      const camTargetAngle = Math.atan2(camForward.x, camForward.z);
      let diff = camTargetAngle - facingAngle.current;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      facingAngle.current += diff * Math.min(dt * 18, 1);
    }

    // Apply horizontal motion with speed buff and sub-stepped solid collision resolution
    const playerRadius = 0.45;
    const hSpeed = effectiveMoveSpeed * Math.min(inputLength, 1);
    const deltaX = moveDirection.x * hSpeed * dt;
    const deltaZ = moveDirection.z * hSpeed * dt;
    const moveDist = Math.hypot(deltaX, deltaZ);

    if (moveDist > 0.0001) {
      // Sub-stepping when moving fast (especially on scooter) prevents tunneling through thin fences/walls
      const steps = moveDist > 0.25 ? 3 : moveDist > 0.12 ? 2 : 1;
      const stepX = deltaX / steps;
      const stepZ = deltaZ / steps;

      for (let s = 0; s < steps; s++) {
        pos.current.x += stepX;
        pos.current.z += stepZ;
        resolveHorizontalCollisions(pos.current, playerRadius, 1.4, 0.25);
      }
    } else {
      resolveHorizontalCollisions(pos.current, playerRadius, 1.4, 0.25);
    }

    // 3. Jump Physics with Coyote Time and Jump Buffer
    const jumpRequested = gameStore.getState().isJumpPressed || keys.current['Space'];

    if (isGrounded.current) {
      coyoteTimer.current = 0.18;
    } else {
      coyoteTimer.current = Math.max(0, coyoteTimer.current - dt);
    }

    if (jumpRequested) {
      jumpBufferTimer.current = 0.15;
    } else {
      jumpBufferTimer.current = Math.max(0, jumpBufferTimer.current - dt);
    }

    if (jumpBufferTimer.current > 0 && (isGrounded.current || coyoteTimer.current > 0)) {
      const hasJumpBuff = gameStore.getState().jumpBuffTimeLeft > 0;
      velocityY.current = inWater ? 11.5 : hasJumpBuff ? 20.0 : jumpVelocity;
      isGrounded.current = false;
      coyoteTimer.current = 0;
      jumpBufferTimer.current = 0;
      if (inWater) {
        soundManager.playWaterSplash();
      } else if (hasJumpBuff) {
        soundManager.playTrampoline();
      } else {
        soundManager.playJump();
      }
      targetSquash.current.set(0.86, 1.25, 0.86);
    }

    // 4. Ground Collision Detection & Buoyancy
    let groundedThisFrame = false;

    if (activeRide === 'boat') {
      pos.current.y = 0.20 + Math.sin(state.clock.getElapsedTime() * 2.5) * 0.03;
      velocityY.current = 0;
      groundedThisFrame = true;
      // Clamp boat inside lake water boundary so it never glides onto land or clips through trees
      pos.current.x = THREE.MathUtils.clamp(pos.current.x, -74.5, -55.5);
      pos.current.z = THREE.MathUtils.clamp(pos.current.z, 40.5, 55.5);
    } else {
      velocityY.current -= gravity * dt;
      pos.current.y += velocityY.current * dt;
    }

    const playerFeet = pos.current.y;

    // Prioritize trampoline collisions first so overlapping ground pads never override super-jump
    if (activeRide !== 'boat') {
      for (const col of colliders) {
        if (col.type !== 'trampoline') continue;
        const box = col.box;
        if (
          pos.current.x >= box.min.x - playerRadius &&
          pos.current.x <= box.max.x + playerRadius &&
          pos.current.z >= box.min.z - playerRadius &&
          pos.current.z <= box.max.z + playerRadius
        ) {
          const platformTop = box.max.y;
          if (playerFeet <= platformTop + 0.4 && playerFeet >= platformTop - 1.4 && velocityY.current <= 0) {
            pos.current.y = platformTop;
            velocityY.current = trampolineJumpVelocity;
            groundedThisFrame = false;
            soundManager.playTrampoline();
            gameStore.setMessage('WUUUSSHH! Trampolin Super Tinggi! 🚀');
            targetSquash.current.set(0.75, 1.4, 0.75);
            break;
          }
        }
      }
    }

    // Check standard ground platforms - always select the highest solid supporting platform directly beneath the player's feet
    let bestPlatformTop: number | null = null;
    if (activeRide !== 'boat' && !groundedThisFrame && velocityY.current <= 1.0) {
      for (const col of colliders) {
        if (col.type === 'trampoline') continue;
        const box = col.box;
        if (
          pos.current.x >= box.min.x - playerRadius &&
          pos.current.x <= box.max.x + playerRadius &&
          pos.current.z >= box.min.z - playerRadius &&
          pos.current.z <= box.max.z + playerRadius
        ) {
          const platformTop = box.max.y;
          // Step-up tolerance: allows climbing up bridge ramps/curbs up to 0.40m, and landing from above
          if (playerFeet <= platformTop + 0.40 && playerFeet >= platformTop - 1.2) {
            if (bestPlatformTop === null || platformTop > bestPlatformTop) {
              bestPlatformTop = platformTop;
            }
          }
        }
      }
    }

    if (bestPlatformTop !== null) {
      pos.current.y = bestPlatformTop;
      velocityY.current = 0;
      groundedThisFrame = true;
    }

    // Re-evaluate water status at current post-movement position
    const curWaterStatus = getWaterStatus(pos.current.x, pos.current.y, pos.current.z);
    let effectiveInWater = curWaterStatus.inWater && activeRide === 'none';

    // If grounded on a platform strictly above water level (e.g. bridge deck at 0.51 vs water at 0.16),
    // strictly suppress water state so no swimming/waterstep/splash can trigger
    if (groundedThisFrame && pos.current.y >= curWaterStatus.surfaceY + 0.06) {
      effectiveInWater = false;
    }

    // Apply water buoyancy if player is swimming / floating in deep water without solid ground above water
    if (activeRide !== 'boat' && effectiveInWater) {
      const waterBob = Math.sin(state.clock.getElapsedTime() * 2.6) * 0.022;
      const targetWaterY = curWaterStatus.surfaceY + 0.02 + waterBob;

      if (velocityY.current > 0) {
        // Leaping upward out of water
      } else if (pos.current.y <= targetWaterY + 0.08) {
        // Floating buoyant in water
        pos.current.y = targetWaterY;
        velocityY.current = 0;
        groundedThisFrame = true;
      }
    }

    // Synchronize inWater state for animations, particle effects, sound and store updates
    inWater = effectiveInWater;
    currentInWater.current = effectiveInWater;

    // Landing Impact Detection
    if (!wasGrounded.current && groundedThisFrame) {
      if (inWater) {
        soundManager.playWaterSplash();
      } else {
        const impact = Math.min(Math.abs(lastVelocityY.current) / 14, 1);
        if (impact > 0.15) {
          targetSquash.current.set(1 + impact * 0.18, Math.max(0.78, 1 - impact * 0.22), 1 + impact * 0.18);
        }
      }
    }
    wasGrounded.current = groundedThisFrame;
    lastVelocityY.current = velocityY.current;
    isGrounded.current = groundedThisFrame;

    // Respawn if falling
    if (pos.current.y < -12) {
      const respawnPoint = gameStore.getLastSafePosition();
      pos.current.set(respawnPoint[0], respawnPoint[1] + 1.2, respawnPoint[2]);
      velocityY.current = 0;
      soundManager.playFamilyChord();
      gameStore.setMessage('Hati-hati! Khaulah kembali ke tempat aman! 🌸✨');
    }

    resolveHorizontalCollisions(pos.current, playerRadius, 1.4, 0.25);

    groupRef.current.position.copy(pos.current);
    groupRef.current.rotation.y = facingAngle.current;

    gameStore.setPlayerMotion([pos.current.x, pos.current.y, pos.current.z], facingAngle.current, isMoving, inWater);

    // 5. Procedural Animations
    const time = state.clock.getElapsedTime();

    // Procedural Eye Blinking (Every 3-5s, blink for 120ms)
    blinkTimer.current -= dt;
    if (blinkTimer.current <= 0) {
      isBlinking.current = true;
      blinkDuration.current = 0.12;
      blinkTimer.current = 2.8 + Math.random() * 2.5;
    }
    if (isBlinking.current) {
      blinkDuration.current -= dt;
      if (blinkDuration.current <= 0) {
        isBlinking.current = false;
      }
    }
    const targetEyeScaleY = isBlinking.current ? 0.08 : 1.0;
    // Damping terkontrol dengan batas aman mutlak [0.08, 1.0] agar tidak pernah meledak/overshoot saat terjadi frame lag
    const eyeAlpha = Math.min(dt * 24, 1.0);
    currentEyeScaleY.current = THREE.MathUtils.clamp(
      THREE.MathUtils.lerp(currentEyeScaleY.current, targetEyeScaleY, eyeAlpha),
      0.08,
      1.0
    );

    if (leftEyeRef.current) {
      leftEyeRef.current.scale.y = currentEyeScaleY.current;
    }
    if (rightEyeRef.current) {
      rightEyeRef.current.scale.y = currentEyeScaleY.current;
    }

    // Body Leaning & Banking
    const targetForwardLean = inWater
      ? (isMoving ? 0.22 : 0.04)
      : (isMoving && isGrounded.current ? 0.09 : 0);
    currentForwardLean.current = THREE.MathUtils.lerp(
      currentForwardLean.current,
      targetForwardLean,
      Math.min(dt * 10, 1.0)
    );

    const targetBank = isMoving ? -moveX * 0.12 : 0;
    currentBankAngle.current = THREE.MathUtils.lerp(
      currentBankAngle.current,
      targetBank,
      Math.min(dt * 8, 1.0)
    );

    if (modelRef.current) {
      modelRef.current.rotation.x = currentForwardLean.current;
      modelRef.current.rotation.z = currentBankAngle.current;

      // Squash & Stretch Spring Interpolation dengan batas aman
      targetSquash.current.lerp(new THREE.Vector3(1, 1, 1), Math.min(dt * 7, 1.0));
      squashScale.current.lerp(targetSquash.current, Math.min(dt * 14, 1.0));
      squashScale.current.x = THREE.MathUtils.clamp(squashScale.current.x, 0.7, 1.35);
      squashScale.current.y = THREE.MathUtils.clamp(squashScale.current.y, 0.7, 1.35);
      squashScale.current.z = THREE.MathUtils.clamp(squashScale.current.z, 0.7, 1.35);
      modelRef.current.scale.copy(squashScale.current);
    }

    // Vehicle Stance: Boat / Fire Truck OR Scooter Riding Stance OR In-Water Swimming/Treading OR Walking / Running Cycle
    if (activeRide === 'boat' || activeRide === 'firetruck') {
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.7;
        leftArmRef.current.rotation.y = 0.25;
        leftArmRef.current.rotation.z = -0.15;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -0.7;
        rightArmRef.current.rotation.y = -0.25;
        rightArmRef.current.rotation.z = 0.15;
      }
      if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.PI * 0.4;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.PI * 0.4;
      if (skirtRef.current) skirtRef.current.rotation.x = -Math.PI * 0.3;
    } else if (isRidingScooter) {
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.75;
        leftArmRef.current.rotation.y = 0.2;
        leftArmRef.current.rotation.z = -0.22;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -0.75;
        rightArmRef.current.rotation.y = -0.2;
        rightArmRef.current.rotation.z = 0.22;
      }
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = -0.1;
        leftLegRef.current.rotation.z = 0;
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = isMoving ? Math.sin(time * 12) * 0.45 : 0;
        rightLegRef.current.rotation.z = 0;
      }
      if (skirtRef.current) {
        skirtRef.current.rotation.x = isMoving ? -0.15 : 0;
      }
      if (hijabDrapeRef.current) {
        hijabDrapeRef.current.rotation.x = isMoving ? 0.15 : 0;
      }
    } else if (inWater) {
      if (isMoving && isGrounded.current) {
        // --- ANIMASI BERENANG & MENGAYUH DI AIR (SWIMMING & WADING MOTION) ---
        const swimCycle = Math.sin(time * 9.0);
        const swimCos = Math.cos(time * 9.0);

        // Ayunan tangan renang mengayuh air ceria (joyful swimming paddle strokes)
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -0.75 + swimCycle * 0.65;
          leftArmRef.current.rotation.y = 0.22 + swimCos * 0.22;
          leftArmRef.current.rotation.z = -0.42 - Math.max(0, swimCycle) * 0.22;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -0.75 - swimCycle * 0.65;
          rightArmRef.current.rotation.y = -0.22 - swimCos * 0.22;
          rightArmRef.current.rotation.z = 0.42 + Math.max(0, -swimCycle) * 0.22;
        }

        // Tendangan kaki renang ceria & lentur (flutter kicks)
        if (leftLegRef.current) {
          leftLegRef.current.rotation.x = -0.32 + Math.sin(time * 11) * 0.45;
          leftLegRef.current.rotation.z = -0.06;
        }
        if (rightLegRef.current) {
          rightLegRef.current.rotation.x = -0.32 - Math.sin(time * 11) * 0.45;
          rightLegRef.current.rotation.z = 0.06;
        }

        // Kepala mendongak ceria di atas air
        if (headRef.current) {
          headRef.current.rotation.x = -0.14;
          headRef.current.rotation.y = Math.sin(time * 4.5) * 0.06;
          headRef.current.rotation.z = 0;
        }

        // Rok dan juntai jilbab mengalir anggun di arus air
        if (skirtRef.current) {
          skirtRef.current.rotation.x = -0.22 + Math.sin(time * 9) * 0.05;
          skirtRef.current.rotation.z = Math.sin(time * 9) * 0.06;
        }
        if (hijabDrapeRef.current) {
          hijabDrapeRef.current.rotation.x = 0.20 + Math.sin(time * 9 - 0.4) * 0.06;
        }

        // Suara langkah kecipak air berirama
        waterStepTimer.current += dt;
        if (waterStepTimer.current > 0.38) {
          soundManager.playWaterStep();
          waterStepTimer.current = 0;
        }
      } else if (!isGrounded.current) {
        // --- LOMPATAN DI AIR (JUMPING IN / OUT OF WATER) ---
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -Math.PI * 0.82 + Math.sin(time * 10) * 0.08;
          leftArmRef.current.rotation.z = -0.35;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -Math.PI * 0.82 - Math.sin(time * 10) * 0.08;
          rightArmRef.current.rotation.z = 0.35;
        }
        if (leftLegRef.current) leftLegRef.current.rotation.x = -0.25;
        if (rightLegRef.current) rightLegRef.current.rotation.x = 0.15;
        if (skirtRef.current) skirtRef.current.rotation.x = -0.15;
        if (hijabDrapeRef.current) hijabDrapeRef.current.rotation.x = 0.15;
      } else {
        // --- ANIMASI TERAPUNG SANTAI DI AIR (IDLE TREADING WATER & BUOYANCY) ---
        const idleFloat = Math.sin(time * 2.8);
        const idleFloatCos = Math.cos(time * 2.8);

        // Tangan mengayuh santai ke samping untuk mengapung (treading water)
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -0.42 + idleFloat * 0.12;
          leftArmRef.current.rotation.y = 0.25 + idleFloatCos * 0.14;
          leftArmRef.current.rotation.z = -0.42 + idleFloat * 0.08;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -0.42 - idleFloat * 0.12;
          rightArmRef.current.rotation.y = -0.25 - idleFloatCos * 0.14;
          rightArmRef.current.rotation.z = 0.42 - idleFloat * 0.08;
        }

        // Kaki mengapung santai dengan kayuhan lembut
        if (leftLegRef.current) {
          leftLegRef.current.rotation.x = -0.20 + idleFloat * 0.12;
          leftLegRef.current.rotation.z = -0.06;
        }
        if (rightLegRef.current) {
          rightLegRef.current.rotation.x = -0.20 - idleFloat * 0.12;
          rightLegRef.current.rotation.z = 0.06;
        }

        // Kepala menoleh lembut menikmati sejuknya air
        if (headRef.current) {
          headRef.current.rotation.x = -0.06;
          headRef.current.rotation.y = Math.sin(time * 1.4) * 0.08;
          headRef.current.rotation.z = Math.cos(time * 1.8) * 0.04;
        }

        // Gerakan bernapas halus pada dada saat mengapung
        if (torsoRef.current) {
          torsoRef.current.position.y = 0.96 + Math.sin(time * 2.6) * 0.015;
        }

        // Rok & jilbab mengapung lembut di permukaan air
        if (skirtRef.current) {
          skirtRef.current.rotation.x = -0.12 + Math.sin(time * 2.6) * 0.04;
          skirtRef.current.rotation.z = Math.sin(time * 2.0) * 0.04;
        }
        if (hijabDrapeRef.current) {
          hijabDrapeRef.current.rotation.x = 0.12 + Math.sin(time * 2.4) * 0.04;
        }
      }
    } else if (isMoving && isGrounded.current) {
      const walkCycle = Math.sin(time * 14);
      if (leftArmRef.current) leftArmRef.current.rotation.x = walkCycle * 0.65;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -walkCycle * 0.65;
      if (leftLegRef.current) leftLegRef.current.rotation.x = -walkCycle * 0.75;
      if (rightLegRef.current) rightLegRef.current.rotation.x = walkCycle * 0.75;
      if (headRef.current) headRef.current.rotation.y = Math.sin(time * 7) * 0.06;

      footstepTimer.current += dt;
      if (footstepTimer.current > 0.35) {
        soundManager.playFootstep();
        footstepTimer.current = 0;
      }

      // Secondary motion on Skirt & Hijab Drape while moving
      if (skirtRef.current) {
        skirtRef.current.rotation.z = Math.sin(time * 14) * 0.08;
        skirtRef.current.rotation.x = Math.sin(time * 14) * 0.04;
      }
      if (hijabDrapeRef.current) {
        hijabDrapeRef.current.rotation.x = -0.1 + Math.sin(time * 14 - 0.4) * 0.08;
      }
    } else if (!isGrounded.current) {
      // Multi-Stage Jump & In-Air Physics
      if (velocityY.current > 2.5) {
        // Stage 1: Ascent - Joyful hands reaching up, legs tucked back
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -Math.PI * 0.75 + Math.sin(time * 8) * 0.08;
          leftArmRef.current.rotation.z = -0.3;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -Math.PI * 0.75 - Math.sin(time * 8) * 0.08;
          rightArmRef.current.rotation.z = 0.3;
        }
        if (leftLegRef.current) leftLegRef.current.rotation.x = -0.25;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -0.15;
      } else if (velocityY.current >= -2.5) {
        // Stage 2: Apex - Gliding / balancing pose at highest point
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -0.4;
          leftArmRef.current.rotation.z = -0.65;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -0.4;
          rightArmRef.current.rotation.z = 0.65;
        }
        if (leftLegRef.current) leftLegRef.current.rotation.x = 0.1;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -0.1;
      } else {
        // Stage 3: Descent / Falling - Arms flare for balance, preparing feet
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -Math.PI * 0.55;
          leftArmRef.current.rotation.z = -0.45;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -Math.PI * 0.55;
          rightArmRef.current.rotation.z = 0.45;
        }
        if (leftLegRef.current) leftLegRef.current.rotation.x = 0.25;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -0.2;
      }

      // Air flutter on Skirt & Hijab Drape
      if (skirtRef.current) {
        skirtRef.current.rotation.x = THREE.MathUtils.clamp(-velocityY.current * 0.02, -0.22, 0.22);
        skirtRef.current.rotation.z = THREE.MathUtils.lerp(skirtRef.current.rotation.z, 0, Math.min(dt * 10, 1.0));
      }
      if (hijabDrapeRef.current) {
        hijabDrapeRef.current.rotation.x = THREE.MathUtils.clamp(-velocityY.current * 0.025, -0.28, 0.28);
      }
    } else {
      // Idle: Gentle breathing, natural eye movement & relaxed posture
      const idle = Math.sin(time * 3);
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = idle * 0.05;
        leftArmRef.current.rotation.z = 0.04;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -idle * 0.05;
        rightArmRef.current.rotation.z = -0.04;
      }
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(time * 1.4) * 0.08;
        headRef.current.rotation.z = Math.cos(time * 1.8) * 0.03;
      }

      // Breathing movement on Torso & Hijab
      if (torsoRef.current) {
        torsoRef.current.position.y = 0.96 + Math.sin(time * 2.8) * 0.012;
      }
      if (hijabDrapeRef.current) {
        hijabDrapeRef.current.rotation.x = Math.sin(time * 2.5) * 0.03;
      }
      if (skirtRef.current) {
        skirtRef.current.rotation.set(0, 0, 0);
      }
    }

    if (activeEmote === 'dance') {
      const danceCycle = Math.sin(time * 16);
      groupRef.current.rotation.y += Math.sin(time * 10) * 0.2;
      if (leftArmRef.current) leftArmRef.current.rotation.z = -1.2 + danceCycle * 0.4;
      if (rightArmRef.current) rightArmRef.current.rotation.z = 1.2 - danceCycle * 0.4;
      if (headRef.current) headRef.current.position.y = 1.52 + Math.abs(danceCycle) * 0.15;
    } else if (activeEmote === 'wave') {
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -Math.PI * 0.8;
        rightArmRef.current.rotation.z = 0.4 + Math.sin(time * 15) * 0.4;
      }
    }

    if (wingsRef.current && activeAccessory === 'fairy_wings') {
      wingsRef.current.rotation.y = Math.sin(time * 30) * 0.45;
    }
  });

  return (
    <group ref={groupRef} position={[0, 2, 0]}>
      {/* Visual Model Root for Squash/Stretch & Banking Leans */}
      <group ref={modelRef}>
        {/* ======================================================== */}
        {/* 1. HEAD & BEAUTIFUL HIJAB (WAJAH MANIS & JILBAB PUTIH KHAULAH) */}
        {/* ======================================================== */}
        <group ref={headRef} position={[0, 1.52, 0]}>
          {/* Face Base: Kulit Halus Bersih Manis */}
          <mesh castShadow>
            <sphereGeometry args={[0.34, 32, 32]} />
            <meshStandardMaterial color="#F7D5B8" roughness={0.4} />
          </mesh>

          {/* --- DUA MATA BERSIH, INDAH, JELAS, DAN CERIA (TANPA KESAN TOPENG) --- */}
          {/* MATA KIRI (LEFT EYE) */}
          <group ref={leftEyeRef} position={[-0.115, 0.04, 0.322]}>
            {/* Putih Mata Bersih (Sclera) */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.058, 0.058, 0.006, 16]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
            {/* Iris Cokelat Hangat & Pupil */}
            <mesh position={[0, 0, 0.004]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.044, 0.044, 0.006, 16]} />
              <meshBasicMaterial color="#2B1810" />
            </mesh>
            {/* Pupil Hitam Tengah */}
            <mesh position={[0, 0, 0.007]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.028, 0.028, 0.006, 16]} />
              <meshBasicMaterial color="#110B0E" />
            </mesh>
            {/* Kilau Cahaya Utama (Sparkle 1) */}
            <mesh position={[-0.015, 0.016, 0.012]}>
              <sphereGeometry args={[0.014, 10, 10]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
            {/* Kilau Cahaya Sekunder (Sparkle 2) */}
            <mesh position={[0.014, -0.014, 0.012]}>
              <sphereGeometry args={[0.008, 8, 8]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
            {/* Garis Kelopak Mata Atas Halus & Ramping */}
            <mesh position={[0, 0.052, 0.005]} rotation={[0, 0, 0.06]}>
              <boxGeometry args={[0.08, 0.008, 0.008]} />
              <meshBasicMaterial color="#2B1810" />
            </mesh>
          </group>

          {/* MATA KANAN (RIGHT EYE) */}
          <group ref={rightEyeRef} position={[0.115, 0.04, 0.322]}>
            {/* Putih Mata Bersih (Sclera) */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.058, 0.058, 0.006, 16]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
            {/* Iris Cokelat Hangat & Pupil */}
            <mesh position={[0, 0, 0.004]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.044, 0.044, 0.006, 16]} />
              <meshBasicMaterial color="#2B1810" />
            </mesh>
            {/* Pupil Hitam Tengah */}
            <mesh position={[0, 0, 0.007]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.028, 0.028, 0.006, 16]} />
              <meshBasicMaterial color="#110B0E" />
            </mesh>
            {/* Kilau Cahaya Utama (Sparkle 1) */}
            <mesh position={[-0.015, 0.016, 0.012]}>
              <sphereGeometry args={[0.014, 10, 10]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
            {/* Kilau Cahaya Sekunder (Sparkle 2) */}
            <mesh position={[0.014, -0.014, 0.012]}>
              <sphereGeometry args={[0.008, 8, 8]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
            {/* Garis Kelopak Mata Atas Halus & Ramping */}
            <mesh position={[0, 0.052, 0.005]} rotation={[0, 0, -0.06]}>
              <boxGeometry args={[0.08, 0.008, 0.008]} />
              <meshBasicMaterial color="#2B1810" />
            </mesh>
          </group>

          {/* ALIS LEMBUT RAMPING (Ditempatkan di atas, tidak menempel pada mata) */}
          <mesh position={[-0.115, 0.135, 0.315]} rotation={[0, 0, 0.08]}>
            <boxGeometry args={[0.075, 0.009, 0.008]} />
            <meshBasicMaterial color="#3D261D" />
          </mesh>
          <mesh position={[0.115, 0.135, 0.315]} rotation={[0, 0, -0.08]}>
            <boxGeometry args={[0.075, 0.009, 0.008]} />
            <meshBasicMaterial color="#3D261D" />
          </mesh>

          {/* PIPI MERONA MANIS LEMBUT */}
          <mesh position={[-0.17, -0.045, 0.30]}>
            <circleGeometry args={[0.042, 16]} />
            <meshBasicMaterial color="#FF8DA1" transparent opacity={0.65} />
          </mesh>
          <mesh position={[0.17, -0.045, 0.30]}>
            <circleGeometry args={[0.042, 16]} />
            <meshBasicMaterial color="#FF8DA1" transparent opacity={0.65} />
          </mesh>

          {/* HIDUNG CILIK MANIS */}
          <mesh position={[0, 0.005, 0.338]}>
            <sphereGeometry args={[0.018, 10, 10]} />
            <meshStandardMaterial color="#E8A888" roughness={0.5} />
          </mesh>

          {/* SENYUM MANIS CERIA KHAULAH */}
          <group position={[0, -0.08, 0.325]}>
            {/* Curved Smile Line */}
            <mesh position={[0, 0, 0]}>
              <torusGeometry args={[0.055, 0.012, 8, 16, Math.PI]} />
              <meshStandardMaterial color="#C2185B" />
            </mesh>
            {/* Gigi Putih Rapi Mungil */}
            <mesh position={[0, 0.008, 0.002]}>
              <boxGeometry args={[0.065, 0.012, 0.008]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          </group>

          {/* JILBAB PUTIH BERGO BERSIH (OUTER HIJAB HOOD - TANPA CIPUT GELAP) */}
          <mesh position={[0, 0.04, -0.05]} castShadow>
            <sphereGeometry args={[0.375, 32, 28]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
          </mesh>

          {/* BINGKAI BERGO LEMBUT MEMBINGKAI WAJAH DENGAN RAPI */}
          <mesh position={[0, 0.06, 0.08]} rotation={[0.22, 0, 0]}>
            <torusGeometry args={[0.335, 0.038, 16, 32, Math.PI * 1.5]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
          </mesh>

          {/* JILBAB BERGO MENJUNTAI KE BAHU (SHOULDER DRAPE) */}
          <group ref={hijabDrapeRef} position={[0, -0.05, 0.01]}>
            <mesh position={[0, -0.17, 0]}>
              <cylinderGeometry args={[0.26, 0.52, 0.38, 32]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.55} />
            </mesh>
          </group>

        {/* --- ACCESSORIES (Bisa Dipakai di Atas Hijab) --- */}
        {activeAccessory === 'princess_crown' && (
          <group position={[0, 0.44, 0]}>
            <mesh>
              <cylinderGeometry args={[0.22, 0.18, 0.18, 5]} />
              <meshStandardMaterial color="#FFD700" metalness={0.7} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.12, 0.15]}>
              <sphereGeometry args={[0.04, 12, 12]} />
              <meshStandardMaterial color="#E63946" />
            </mesh>
          </group>
        )}

        {activeAccessory === 'cat_ears' && (
          <group position={[0, 0.4, 0]}>
            <mesh position={[-0.18, 0.12, 0]} rotation={[0, 0, -0.2]}>
              <coneGeometry args={[0.1, 0.2, 4]} />
              <meshStandardMaterial color="#FF9F1C" />
            </mesh>
            <mesh position={[0.18, 0.12, 0]} rotation={[0, 0, 0.2]}>
              <coneGeometry args={[0.1, 0.2, 4]} />
              <meshStandardMaterial color="#FF9F1C" />
            </mesh>
          </group>
        )}

        {activeAccessory === 'star_halo' && (
          <group position={[0, 0.58, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh>
              <torusGeometry args={[0.3, 0.03, 16, 32]} />
              <meshStandardMaterial color="#FFD166" emissive="#FFD166" emissiveIntensity={0.6} />
            </mesh>
          </group>
        )}

        {activeAccessory === 'bunny_ears' && (
          <group position={[0, 0.4, 0]}>
            <mesh position={[-0.18, 0.2, 0]} rotation={[0, 0, -0.1]}>
              <cylinderGeometry args={[0.05, 0.07, 0.35, 12]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
            <mesh position={[0.18, 0.2, 0]} rotation={[0, 0, 0.1]}>
              <cylinderGeometry args={[0.05, 0.07, 0.35, 12]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
          </group>
        )}
      </group>

      {/* Leher Halus (Connecting Neck) */}
      <mesh position={[0, 1.34, 0]}>
        <cylinderGeometry args={[0.11, 0.13, 0.16, 16]} />
        <meshStandardMaterial color="#F5CEAB" roughness={0.4} />
      </mesh>

      {/* ======================================================== */}
      {/* 2. TORSO & SERAGAM SEKOLAH (Rompi Biru & Kemeja Putih) */}
      {/* ======================================================== */}
      <group ref={torsoRef} position={[0, 0.96, 0]}>
        {/* Kemeja Putih Dasar */}
        <mesh castShadow>
          <boxGeometry args={[0.56, 0.62, 0.34]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
        </mesh>

        {/* Kerah Kemeja Putih di Atas Rompi */}
        <mesh position={[0, 0.32, 0]}>
          <cylinderGeometry args={[0.18, 0.22, 0.06, 16]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
        </mesh>

        {/* Rompi Biru Cerah (Persis Foto Seragam Khaulah) */}
        <mesh position={[0, -0.02, 0]} castShadow>
          <boxGeometry args={[0.59, 0.60, 0.37]} />
          <meshStandardMaterial color="#1E88E5" roughness={0.35} />
        </mesh>

        {/* Potongan V-Neck Rompi (Menampakkan Kemeja Putih di Dalam) */}
        <mesh position={[0, 0.22, 0.19]}>
          <planeGeometry args={[0.2, 0.22]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
        </mesh>

        {/* Lajur Kancing Rompi Tengah */}
        <mesh position={[0, -0.03, 0.191]}>
          <boxGeometry args={[0.08, 0.52, 0.012]} />
          <meshStandardMaterial color="#1976D2" roughness={0.3} />
        </mesh>

        {/* 3 Kancing Biru Bulat di Depan Rompi (Persis di Foto) */}
        {[0.12, -0.03, -0.18].map((yOffset, idx) => (
          <group key={idx} position={[0, yOffset, 0.2]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.026, 0.026, 0.014, 16]} />
              <meshStandardMaterial color="#0D47A1" roughness={0.2} />
            </mesh>
            <mesh position={[0, 0, 0.009]}>
              <sphereGeometry args={[0.009, 8, 8]} />
              <meshBasicMaterial color="#90CAF9" />
            </mesh>
          </group>
        ))}

        {/* Logo Bordir Hijau Sekolah di Sisi Kiri Rompi (Persis di Foto) */}
        <group position={[0.16, 0.11, 0.195]}>
          <mesh>
            <boxGeometry args={[0.11, 0.08, 0.01]} />
            <meshStandardMaterial color="#00897B" roughness={0.4} />
          </mesh>
          {/* Border List Kuning Emas */}
          <mesh position={[0, 0, 0.006]}>
            <boxGeometry args={[0.09, 0.025, 0.004]} />
            <meshBasicMaterial color="#FFF59D" />
          </mesh>
        </group>
      </group>

      {/* Fairy Wings (di Belakang Rompi) */}
      {activeAccessory === 'fairy_wings' && (
        <group ref={wingsRef} position={[0, 1.05, -0.22]}>
          <mesh position={[-0.32, 0.15, 0]} rotation={[0, 0.2, 0.2]}>
            <planeGeometry args={[0.55, 0.48]} />
            <meshStandardMaterial color="#80DED9" transparent opacity={0.8} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.32, 0.15, 0]} rotation={[0, -0.2, -0.2]}>
            <planeGeometry args={[0.55, 0.48]} />
            <meshStandardMaterial color="#80DED9" transparent opacity={0.8} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* ======================================================== */}
      {/* 3. ROK LIPIT BIRU (A-Line Pleated Skirt) */}
      {/* ======================================================== */}
      <group ref={skirtRef} position={[0, 0.62, 0]}>
        {/* Bentuk Rok Mengembang Menawan */}
        <mesh castShadow>
          <cylinderGeometry args={[0.31, 0.44, 0.32, 24]} />
          <meshStandardMaterial color="#1E88E5" roughness={0.4} />
        </mesh>

        {/* Lipatan Rok Lipit (Pleats) */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const r = 0.41;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}
              rotation={[0, -angle, 0]}
            >
              <boxGeometry args={[0.025, 0.32, 0.02]} />
              <meshStandardMaterial color="#1565C0" roughness={0.4} />
            </mesh>
          );
        })}
      </group>

      {/* ======================================================== */}
      {/* 4. LENGAN KEMEJA PUTIH & TANGAN (Arms & Hands) */}
      {/* ======================================================== */}
      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.38, 1.2, 0]}>
        {/* White Sleeve */}
        <mesh position={[0, -0.25, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.085, 0.5, 16]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
        </mesh>
        {/* Sleeve Cuff */}
        <mesh position={[0, -0.48, 0]}>
          <cylinderGeometry args={[0.095, 0.095, 0.06, 16]} />
          <meshStandardMaterial color="#F5F5F5" roughness={0.4} />
        </mesh>
        {/* Hand with Thumb */}
        <group position={[0, -0.56, 0]}>
          <mesh>
            <sphereGeometry args={[0.075, 12, 12]} />
            <meshStandardMaterial color="#F5CEAB" roughness={0.4} />
          </mesh>
          <mesh position={[0.04, 0.02, 0.02]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#F5CEAB" roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.38, 1.2, 0]}>
        {/* White Sleeve */}
        <mesh position={[0, -0.25, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.085, 0.5, 16]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
        </mesh>
        {/* Sleeve Cuff */}
        <mesh position={[0, -0.48, 0]}>
          <cylinderGeometry args={[0.095, 0.095, 0.06, 16]} />
          <meshStandardMaterial color="#F5F5F5" roughness={0.4} />
        </mesh>
        {/* Hand with Thumb */}
        <group position={[0, -0.56, 0]}>
          <mesh>
            <sphereGeometry args={[0.075, 12, 12]} />
            <meshStandardMaterial color="#F5CEAB" roughness={0.4} />
          </mesh>
          <mesh position={[-0.04, 0.02, 0.02]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#F5CEAB" roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* ======================================================== */}
      {/* 5. KAKI, KAUS KAKI PUTIH & SEPATU SEKOLAH (Legs & Shoes) */}
      {/* ======================================================== */}
      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.15, 0.44, 0]}>
        {/* White Socks / Stockings */}
        <mesh position={[0, -0.2, 0]} castShadow>
          <cylinderGeometry args={[0.085, 0.08, 0.44, 16]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
        </mesh>
        {/* Shiny Black School Shoe */}
        <group position={[0, -0.44, 0.04]}>
          <mesh castShadow>
            <boxGeometry args={[0.18, 0.12, 0.28]} />
            <meshStandardMaterial color="#1E1E24" roughness={0.25} metalness={0.15} />
          </mesh>
          {/* Shoe White Sole */}
          <mesh position={[0, -0.055, 0]}>
            <boxGeometry args={[0.19, 0.024, 0.29]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          {/* Shoe Buckle / Strap */}
          <mesh position={[0, 0.065, 0.02]}>
            <boxGeometry args={[0.16, 0.02, 0.06]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        </group>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.15, 0.44, 0]}>
        {/* White Socks / Stockings */}
        <mesh position={[0, -0.2, 0]} castShadow>
          <cylinderGeometry args={[0.085, 0.08, 0.44, 16]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
        </mesh>
        {/* Shiny Black School Shoe */}
        <group position={[0, -0.44, 0.04]}>
          <mesh castShadow>
            <boxGeometry args={[0.18, 0.12, 0.28]} />
            <meshStandardMaterial color="#1E1E24" roughness={0.25} metalness={0.15} />
          </mesh>
          {/* Shoe White Sole */}
          <mesh position={[0, -0.055, 0]}>
            <boxGeometry args={[0.19, 0.024, 0.29]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          {/* Shoe Buckle / Strap */}
          <mesh position={[0, 0.065, 0.02]}>
            <boxGeometry args={[0.16, 0.02, 0.06]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        </group>
      </group>
      </group>

      {/* Bekal Cinta Ummi: Magical Speed Boost Sparkle Ring */}
      {speedBuffTimeLeft > 0 && (
        <group position={[0, 0.04, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.45, 0.65, 24]} />
            <meshBasicMaterial color="#FFD166" transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
          <pointLight color="#FFD166" intensity={1.5} distance={4} />
        </group>
      )}

      {/* ======================================================== */}
      {/* 6. SKUTER PINK KHAULAH (KENDARAAN KETIKA DIKENDARAI)     */}
      {/* ======================================================== */}
      {isRidingScooter && (
        <group position={[0, 0.02, 0]} rotation={[0, Math.PI, 0]}>
          {/* Deck (Pijakan Kaki Pink) */}
          <mesh position={[0, 0.06, 0]} castShadow>
            <boxGeometry args={[0.3, 0.05, 0.96]} />
            <meshStandardMaterial color="#FF2A85" roughness={0.3} metalness={0.1} />
          </mesh>
          {/* Sparkle Grip Tape */}
          <mesh position={[0, 0.09, 0]}>
            <planeGeometry args={[0.22, 0.82]} />
            <meshStandardMaterial color="#FFD166" roughness={0.6} />
          </mesh>

          {/* Rear Wheel */}
          <group position={[0, 0.06, 0.42]} rotation={[0, 0, Math.PI / 2]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.1, 0.1, 0.07, 14]} />
              <meshStandardMaterial color="#2B2D42" roughness={0.8} />
            </mesh>
            <mesh>
              <cylinderGeometry args={[0.06, 0.06, 0.075, 14]} />
              <meshStandardMaterial color="#06D6A0" metalness={0.5} />
            </mesh>
          </group>

          {/* Front Wheel */}
          <group position={[0, 0.06, -0.42]} rotation={[0, 0, Math.PI / 2]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.1, 0.1, 0.07, 14]} />
              <meshStandardMaterial color="#2B2D42" roughness={0.8} />
            </mesh>
            <mesh>
              <cylinderGeometry args={[0.06, 0.06, 0.075, 14]} />
              <meshStandardMaterial color="#06D6A0" metalness={0.5} />
            </mesh>
          </group>

          {/* Steering Stem & Handlebars */}
          <group position={[0, 0.06, -0.38]}>
            {/* Lower Stem */}
            <mesh position={[0, 0.38, 0]} rotation={[0.08, 0, 0]} castShadow>
              <cylinderGeometry args={[0.022, 0.022, 0.72, 10]} />
              <meshStandardMaterial color="#FFFFFF" metalness={0.6} roughness={0.2} />
            </mesh>

            {/* Handlebars */}
            <group position={[0, 0.72, -0.04]}>
              {/* Crossbar */}
              <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.018, 0.018, 0.54, 10]} />
                <meshStandardMaterial color="#06D6A0" roughness={0.4} />
              </mesh>
              {/* Grips */}
              <mesh position={[-0.23, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.028, 0.028, 0.09, 8]} />
                <meshStandardMaterial color="#FF69B4" roughness={0.5} />
              </mesh>
              <mesh position={[0.23, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.028, 0.028, 0.09, 8]} />
                <meshStandardMaterial color="#FF69B4" roughness={0.5} />
              </mesh>
              {/* Bell on Left */}
              <group position={[-0.13, 0.038, 0.01]}>
                <mesh castShadow>
                  <sphereGeometry args={[0.03, 10, 10]} />
                  <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
                </mesh>
              </group>
              {/* Headlight on Front */}
              <group position={[0, 0, -0.05]}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.032, 0.032, 0.03, 10]} />
                  <meshStandardMaterial color="#333333" />
                </mesh>
                <mesh position={[0, 0, -0.016]}>
                  <circleGeometry args={[0.03, 10]} />
                  <meshStandardMaterial color="#FFF9A6" emissive="#FFF9A6" emissiveIntensity={0.8} />
                </mesh>
                <pointLight color="#FFF9A6" intensity={1.6} distance={4.5} position={[0, 0, -0.2]} />
              </group>
            </group>
          </group>

          {/* Sparkle Tail Trail behind scooter rear */}
          <pointLight color="#FF007F" intensity={0.9} distance={2.5} position={[0, 0.1, 0.48]} />
        </group>
      )}

      {/* ======================================================== */}
      {/* 7. PERAHU BEBEK KAYUH KETIKA DIKENDARAI                  */}
      {/* ======================================================== */}
      {activeRide === 'boat' && (
        <group position={[0, -0.15, 0.2]} rotation={[0, Math.PI, 0]}>
          <SwanBoatModel isRiding />
        </group>
      )}

      {/* ======================================================== */}
      {/* 8. MOBIL DAMKAR CILIK KETIKA DIKENDARAI                  */}
      {/* ======================================================== */}
      {activeRide === 'firetruck' && (
        <group position={[0, -0.2, 0]} rotation={[0, Math.PI, 0]}>
          <MiniFireTruckModel isRiding />
        </group>
      )}

      {/* ======================================================== */}
      {/* 9. COZY NIGHT LANTERN AURA DI SEKITAR KHAULAH            */}
      {/* ======================================================== */}
      {timeOfDay === 'malam' && (
        <pointLight
          position={[0, 1.4, 0]}
          color="#FFE5A3"
          intensity={1.15}
          distance={9.0}
          decay={1.6}
        />
      )}

      {/* ======================================================== */}
      {/* 10. EFEK RIAK AIR & BUIH INTERAKTIF KETIKA DI AIR        */}
      {/* ======================================================== */}
      <WaterRippleEffects
        inWaterRef={currentInWater}
        isMovingRef={isMovingRef}
        waterSurfaceYRef={currentWaterSurfaceY}
        playerPosRef={pos}
      />
    </group>
  );
};
