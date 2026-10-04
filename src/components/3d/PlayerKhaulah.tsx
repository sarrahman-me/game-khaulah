import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gameStore, useGameStore } from '../../state/useGameStore';
import { soundManager } from '../../sound/audioManager';
import { colliders } from '../../state/colliders';



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
  const currentBankAngle = useRef(0);
  const currentForwardLean = useRef(0);

  const activeAccessory = useGameStore((s) => s.activeAccessory);
  const activeEmote = useGameStore((s) => s.activeEmote);
  const speedBuffTimeLeft = useGameStore((s) => s.speedBuffTimeLeft);

  // Character physical state
  const pos = useRef(new THREE.Vector3(0, 1, -4));
  const velocityY = useRef(0);
  const isGrounded = useRef(false);
  const moveSpeed = 9;
  const jumpVelocity = 11;
  const trampolineJumpVelocity = 24;
  const gravity = 25;
  const facingAngle = useRef(0);
  const slideTimer = useRef(0);

  // Keyboard input state
  const keys = useRef<{ [key: string]: boolean }>({});
  const coyoteTimer = useRef(0);
  const jumpBufferTimer = useRef(0);
  const lastRespawn = useRef(0);

  const isShiftLock = useGameStore((s) => s.isShiftLock);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === 'Space') {
        gameStore.setJumpPressed(true);
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        gameStore.toggleShiftLock();
      } else if (e.code === 'KeyE') {
        const near = gameStore.getState().nearbyInteractable;
        if (near) {
          if (near.id === 'abi') {
            gameStore.openDialog({
              speaker: 'Abi',
              role: 'Ayah Hebat',
              avatarBg: 'bg-blue-600',
              text: 'Assalamu\'alaikum Khaulah sayang! Semangat belajar dan bermain di TK Karang Tengah ya. Khaulah adalah anak shalihah kebanggaan Abi!',
              actionText: '✋ Tos Hebat sama Abi!',
              actionType: 'high_five',
            });
          } else if (near.id === 'ummi') {
            gameStore.openDialog({
              speaker: 'Ummi',
              role: 'Ibu Tercinta',
              avatarBg: 'bg-rose-500',
              text: 'Khaulah sayang, Ummi sudah siapkan kue pelangi lezat untuk bekal Khaulah. Habiskan ya sayang, supaya Khaulah bertenaga dan lari super cepat!',
              actionText: '🍰 Ambil Bekal Cinta Ummi (+Speed Boost!)',
              actionType: 'take_snack',
            });
          } else if (near.id === 'khalid') {
            gameStore.openDialog({
              speaker: 'Adek Khalid',
              role: 'Adik Periang',
              avatarBg: 'bg-amber-500',
              text: 'Mbak Khaulah! Ayo main bola bareng Khalid! Nanti kita main ayunan bareng di TK ya!',
              actionText: '⚽ Main Bola Bersama Khalid!',
              actionType: 'play_ball',
            });
          } else if (near.id === 'faqih') {
            gameStore.openDialog({
              speaker: 'Adek Faqih',
              role: 'Adik Bayi Lucu',
              avatarBg: 'bg-emerald-500',
              text: 'Ciluk... BAAA! Adek Faqih tersenyum gembira sambil menggoyangkan mainan kerincingan melihat Mbak Khaulah!',
              actionText: '👶 Peluk Sayang Adek Faqih!',
              actionType: 'cuddle_baby',
            });
          } else if (near.id === 'slide') {
            gameStore.setActiveRide('slide');
          } else if (near.id === 'swing') {
            gameStore.setActiveRide('swing');
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

    // Speed Buff Tick
    gameStore.tickSpeedBuff(dt);
    const speedBuff = gameStore.getState().speedBuffTimeLeft;
    const effectiveMoveSpeed = speedBuff > 0 ? 13.5 : moveSpeed;

    // Check external respawn trigger (e.g. from R key)
    const currentRespawn = gameStore.getState().respawnTrigger;
    if (currentRespawn !== lastRespawn.current) {
      lastRespawn.current = currentRespawn;
      const respawnPoint = gameStore.getState().checkpointPosition;
      pos.current.set(respawnPoint[0], respawnPoint[1] + 2, respawnPoint[2]);
      velocityY.current = 0;
    }

    // Check Active Ride State (Perosotan / Ayunan)
    const activeRide = gameStore.getState().activeRide;
    if (activeRide === 'slide') {
      slideTimer.current += dt * 0.85;
      if (slideTimer.current < 0.28) {
        // Climbing ladder
        const t = slideTimer.current / 0.28;
        pos.current.set(8, 0.4 + t * 1.9, 27.2 - t * 1.2);
        facingAngle.current = Math.PI;

        const climb = Math.sin(slideTimer.current * 30);
        if (leftArmRef.current) leftArmRef.current.rotation.x = climb * 0.7;
        if (rightArmRef.current) rightArmRef.current.rotation.x = -climb * 0.7;
        if (leftLegRef.current) leftLegRef.current.rotation.x = -climb * 0.6;
        if (rightLegRef.current) rightLegRef.current.rotation.x = climb * 0.6;
      } else if (slideTimer.current < 0.42) {
        // Sitting at top
        pos.current.set(8, 2.3, 26);
        facingAngle.current = 0;
        if (leftArmRef.current) { leftArmRef.current.rotation.x = -0.5; leftArmRef.current.rotation.z = -0.3; }
        if (rightArmRef.current) { rightArmRef.current.rotation.x = -0.5; rightArmRef.current.rotation.z = 0.3; }
        if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.PI * 0.45;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.PI * 0.45;
        if (skirtRef.current) skirtRef.current.rotation.x = -Math.PI * 0.35;
      } else if (slideTimer.current < 0.88) {
        // Sliding down chute wuuush: joyful hands in the air!
        const t = (slideTimer.current - 0.42) / 0.46;
        pos.current.set(8, 2.3 - t * 1.9, 26 - t * 4.2);
        facingAngle.current = 0;

        if (leftArmRef.current) { leftArmRef.current.rotation.x = -Math.PI * 0.85; leftArmRef.current.rotation.z = -0.35; }
        if (rightArmRef.current) { rightArmRef.current.rotation.x = -Math.PI * 0.85; rightArmRef.current.rotation.z = 0.35; }
        if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.PI * 0.45;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.PI * 0.45;
        if (skirtRef.current) skirtRef.current.rotation.x = -Math.PI * 0.35;
        if (hijabDrapeRef.current) hijabDrapeRef.current.rotation.x = 0.35;
      } else {
        // Finished slide!
        pos.current.set(8, 0.4, 21.6);
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
      const swingPhase = Math.sin(time * 2.5);
      const swingZ = 26 + swingPhase * 1.3;
      const swingY = 0.9 + Math.abs(swingPhase) * 0.25;
      pos.current.set(-6.9, swingY, swingZ);
      facingAngle.current = 0;

      // Realistic sitting pose holding chains & swinging legs
      if (leftArmRef.current) { leftArmRef.current.rotation.x = -0.7; leftArmRef.current.rotation.z = -0.15; }
      if (rightArmRef.current) { rightArmRef.current.rotation.x = -0.7; rightArmRef.current.rotation.z = 0.15; }
      if (leftLegRef.current) leftLegRef.current.rotation.x = -0.55 + swingPhase * 0.55;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -0.55 + swingPhase * 0.55;
      if (skirtRef.current) skirtRef.current.rotation.x = -0.45;
      if (headRef.current) headRef.current.rotation.x = -0.15;

      if (keys.current['Space'] || gameStore.getState().isJumpPressed) {
        gameStore.setActiveRide('none');
        velocityY.current = 8;
        pos.current.z += 1.2;
        gameStore.setMessage('Hoppp! Khaulah melompat turun dari ayunan! 🎡✨');
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
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) moveX -= 1;
    if (keys.current['KeyD'] || keys.current['ArrowRight']) moveX += 1;

    const joy = gameStore.getState().joystickVector;
    if (Math.abs(joy.x) > 0.05 || Math.abs(joy.y) > 0.05) {
      moveX += joy.x;
      moveZ -= joy.y;
    }

    const inputLength = Math.hypot(moveX, moveZ);
    const isMoving = inputLength > 0.1;

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

    // Apply horizontal motion with speed buff
    pos.current.x += moveDirection.x * effectiveMoveSpeed * dt * Math.min(inputLength, 1);
    pos.current.z += moveDirection.z * effectiveMoveSpeed * dt * Math.min(inputLength, 1);

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
      velocityY.current = jumpVelocity;
      isGrounded.current = false;
      coyoteTimer.current = 0;
      jumpBufferTimer.current = 0;
      soundManager.playJump();
      targetSquash.current.set(0.86, 1.25, 0.86);
    }

    // Gravity
    velocityY.current -= gravity * dt;
    pos.current.y += velocityY.current * dt;

    // 4. Ground Collision Detection
    let groundedThisFrame = false;
    const playerFeet = pos.current.y;
    const playerRadius = 0.55;

    // Prioritize trampoline collisions first so overlapping ground pads never override super-jump
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

    // Then check standard ground platforms
    if (!groundedThisFrame && velocityY.current <= 0) {
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
          if (playerFeet <= platformTop + 0.35 && playerFeet >= platformTop - 1.2 && velocityY.current <= 0) {
            pos.current.y = platformTop;
            velocityY.current = 0;
            groundedThisFrame = true;
            break;
          }
        }
      }
    }

    // Landing Impact Detection
    if (!wasGrounded.current && groundedThisFrame) {
      const impact = Math.min(Math.abs(lastVelocityY.current) / 14, 1);
      if (impact > 0.15) {
        targetSquash.current.set(1 + impact * 0.18, Math.max(0.78, 1 - impact * 0.22), 1 + impact * 0.18);
      }
    }
    wasGrounded.current = groundedThisFrame;
    lastVelocityY.current = velocityY.current;
    isGrounded.current = groundedThisFrame;

    // Respawn if falling
    if (pos.current.y < -12) {
      const respawnPoint = gameStore.getState().checkpointPosition;
      pos.current.set(respawnPoint[0], respawnPoint[1] + 2, respawnPoint[2]);
      velocityY.current = 0;
      soundManager.playCheckpoint();
      gameStore.setMessage('Jangan khawatir, Khaulah kembali ke awan aman! ☁️✨');
    }

    groupRef.current.position.copy(pos.current);
    groupRef.current.rotation.y = facingAngle.current;

    gameStore.setPlayerMotion([pos.current.x, pos.current.y, pos.current.z], facingAngle.current, isMoving);

    // 5. Procedural Animations
    const time = state.clock.getElapsedTime();

    // Procedural Eye Blinking (Every 3-5s, blink for 120ms)
    blinkTimer.current -= dt;
    if (blinkTimer.current <= 0) {
      isBlinking.current = true;
      blinkDuration.current = 0.13;
      blinkTimer.current = 2.8 + Math.random() * 2.5;
    }
    if (isBlinking.current) {
      blinkDuration.current -= dt;
      if (blinkDuration.current <= 0) {
        isBlinking.current = false;
      }
    }
    const eyeScaleY = isBlinking.current ? 0.08 : 1.0;
    if (leftEyeRef.current) {
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, eyeScaleY, dt * 35);
    }
    if (rightEyeRef.current) {
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, eyeScaleY, dt * 35);
    }

    // Body Leaning & Banking
    const targetForwardLean = isMoving && isGrounded.current ? 0.09 : 0;
    currentForwardLean.current = THREE.MathUtils.lerp(currentForwardLean.current, targetForwardLean, dt * 10);

    const targetBank = isMoving ? -moveX * 0.12 : 0;
    currentBankAngle.current = THREE.MathUtils.lerp(currentBankAngle.current, targetBank, dt * 8);

    if (modelRef.current) {
      modelRef.current.rotation.x = currentForwardLean.current;
      modelRef.current.rotation.z = currentBankAngle.current;

      // Squash & Stretch Spring Interpolation
      targetSquash.current.lerp(new THREE.Vector3(1, 1, 1), dt * 7);
      squashScale.current.lerp(targetSquash.current, dt * 16);
      modelRef.current.scale.copy(squashScale.current);
    }

    // Walking / Running Cycle
    if (isMoving && isGrounded.current) {
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
        skirtRef.current.rotation.z = THREE.MathUtils.lerp(skirtRef.current.rotation.z, 0, dt * 10);
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
          {/* Face Base: Kulit Halus Sawo Matang Manis */}
          <mesh castShadow>
            <sphereGeometry args={[0.34, 32, 32]} />
            <meshStandardMaterial color="#F5CEAB" roughness={0.4} />
          </mesh>

          {/* --- DUA MATA BULAT BESAR BERBINAR (LEFT & RIGHT EYES) --- */}
          {/* MATA KIRI (LEFT EYE) */}
          <group ref={leftEyeRef} position={[-0.13, 0.04, 0.312]} rotation={[0, -0.1, 0]}>
          {/* Putih Mata (Sclera) */}
          <mesh>
            <sphereGeometry args={[0.075, 16, 16]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          {/* Iris Cokelat Hangat */}
          <mesh position={[0, 0, 0.018]}>
            <sphereGeometry args={[0.052, 16, 16]} />
            <meshStandardMaterial color="#2B1810" roughness={0.2} />
          </mesh>
          {/* Pupil Hitam */}
          <mesh position={[0, 0, 0.03]}>
            <sphereGeometry args={[0.036, 16, 16]} />
            <meshBasicMaterial color="#0A050A" />
          </mesh>
          {/* Kilau Cahaya Utama (Sparkle 1) */}
          <mesh position={[-0.018, 0.02, 0.042]}>
            <sphereGeometry args={[0.016, 12, 12]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          {/* Kilau Cahaya Sekunder (Sparkle 2) */}
          <mesh position={[0.018, -0.018, 0.042]}>
            <sphereGeometry args={[0.009, 8, 8]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          {/* Garis Kelopak Mata Atas Lembut */}
          <mesh position={[0, 0.062, 0.022]} rotation={[0, 0, 0.05]}>
            <boxGeometry args={[0.11, 0.018, 0.02]} />
            <meshBasicMaterial color="#1E1216" />
          </mesh>
        </group>

        {/* MATA KANAN (RIGHT EYE) - IDENTIK DAN JELAS KELIHATAN */}
        <group ref={rightEyeRef} position={[0.13, 0.04, 0.312]} rotation={[0, 0.1, 0]}>
          {/* Putih Mata (Sclera) */}
          <mesh>
            <sphereGeometry args={[0.075, 16, 16]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          {/* Iris Cokelat Hangat */}
          <mesh position={[0, 0, 0.018]}>
            <sphereGeometry args={[0.052, 16, 16]} />
            <meshStandardMaterial color="#2B1810" roughness={0.2} />
          </mesh>
          {/* Pupil Hitam */}
          <mesh position={[0, 0, 0.03]}>
            <sphereGeometry args={[0.036, 16, 16]} />
            <meshBasicMaterial color="#0A050A" />
          </mesh>
          {/* Kilau Cahaya Utama (Sparkle 1) */}
          <mesh position={[-0.018, 0.02, 0.042]}>
            <sphereGeometry args={[0.016, 12, 12]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          {/* Kilau Cahaya Sekunder (Sparkle 2) */}
          <mesh position={[0.018, -0.018, 0.042]}>
            <sphereGeometry args={[0.009, 8, 8]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          {/* Garis Kelopak Mata Atas Lembut */}
          <mesh position={[0, 0.062, 0.022]} rotation={[0, 0, -0.05]}>
            <boxGeometry args={[0.11, 0.018, 0.02]} />
            <meshBasicMaterial color="#1E1216" />
          </mesh>
        </group>

        {/* ALIS LEMBUT KIRI (LEFT EYEBROW) */}
        <mesh position={[-0.13, 0.15, 0.3]} rotation={[0, 0, 0.08]}>
          <boxGeometry args={[0.11, 0.022, 0.018]} />
          <meshBasicMaterial color="#261A1D" />
        </mesh>

        {/* ALIS LEMBUT KANAN (RIGHT EYEBROW) */}
        <mesh position={[0.13, 0.15, 0.3]} rotation={[0, 0, -0.08]}>
          <boxGeometry args={[0.11, 0.022, 0.018]} />
          <meshBasicMaterial color="#261A1D" />
        </mesh>

        {/* PIPI MERONA KIRI (LEFT BLUSH) */}
        <mesh position={[-0.19, -0.05, 0.28]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#F48FB1" roughness={0.6} />
        </mesh>

        {/* PIPI MERONA KANAN (RIGHT BLUSH) */}
        <mesh position={[0.19, -0.05, 0.28]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#F48FB1" roughness={0.6} />
        </mesh>

        {/* HIDUNG CILIK MANIS */}
        <mesh position={[0, 0.0, 0.335]}>
          <sphereGeometry args={[0.024, 12, 12]} />
          <meshStandardMaterial color="#E2A984" roughness={0.5} />
        </mesh>

        {/* SENYUM MANIS BERGIGI RAPI & CERIA */}
        <group position={[0, -0.095, 0.325]}>
          {/* Sweet Open Smile with Soft Curved Shape */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.02, 16, 1, false, Math.PI, Math.PI]} />
            <meshBasicMaterial color="#B71C1C" />
          </mesh>
          {/* Gigi Putih Rapi di Bagian Atas */}
          <mesh position={[0, 0.018, 0.008]}>
            <boxGeometry args={[0.11, 0.022, 0.012]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>

        {/* CIPUT HITAM DI DAHI KHAULAH (INNER CIPUT MELENGKUNG RAPI) */}
        <mesh position={[0, 0.16, 0.06]} rotation={[0.3, 0, 0]}>
          <cylinderGeometry args={[0.33, 0.35, 0.14, 32, 1, true, -Math.PI * 0.45, Math.PI * 0.9]} />
          <meshStandardMaterial color="#1E1E22" roughness={0.7} side={THREE.DoubleSide} />
        </mesh>

        {/* JILBAB PUTIH BAGIAN ATAS & BELAKANG (OUTER HIJAB HOOD) */}
        <mesh position={[0, 0.04, -0.05]} castShadow>
          <sphereGeometry args={[0.375, 32, 28]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
        </mesh>

        {/* BINGKAI BERGO MELENGKUNG LEMBUT DI SEKELILING WAJAH */}
        <mesh position={[0, 0.06, 0.08]} rotation={[0.22, 0, 0]}>
          <torusGeometry args={[0.335, 0.045, 16, 32, Math.PI * 1.5]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
        </mesh>

        {/* JILBAB BERGO MENJUTAI KE BAHU (SHOULDER DRAPE) */}
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
    </group>
  );
};
