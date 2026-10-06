import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, gameStore } from '../../state/useGameStore';

const tempTarget = new THREE.Vector3();
const tempDesiredCamPos = new THREE.Vector3();

export const CameraController: React.FC = () => {
  const { camera, gl } = useThree();

  const camDistance = useRef(7.5);
  const camAngleX = useRef(0);
  const camAngleY = useRef(0.38); // Comfortable downward tilt

  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const lastManualInputTime = useRef<number>(0);

  const initialPlayerPos = gameStore.getState().playerPos;
  const currentCamPos = useRef(
    new THREE.Vector3(initialPlayerPos[0], initialPlayerPos[1] + 4.5, initialPlayerPos[2] - 7.5)
  );
  const currentTargetPos = useRef(
    new THREE.Vector3(initialPlayerPos[0], initialPlayerPos[1] + 1.25, initialPlayerPos[2])
  );

  const isShiftLock = useGameStore((s) => s.isShiftLock);
  const targetDistance = useGameStore((s) => s.cameraDistance);

  // Prevent right-click context menu on MacBook / browser & sync pointer lock
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleLockChange = () => {
      if (!document.pointerLockElement && gameStore.getState().isShiftLock) {
        gameStore.toggleShiftLock();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('pointerlockchange', handleLockChange);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('pointerlockchange', handleLockChange);
    };
  }, []);

  // Request or exit pointer lock on Shift Lock state change
  useEffect(() => {
    if (isShiftLock) {
      gl.domElement.requestPointerLock?.();
    } else {
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
    }
  }, [isShiftLock, gl]);

  useEffect(() => {
    const canvas = gl.domElement;

    // Roblox behavior:
    // 1-finger trackpad touch only moves the cursor freely.
    // Camera drag only engages with right-click, middle-click, or Ctrl+click.
    const handlePointerDown = (e: PointerEvent) => {
      if (e.clientY < 75) return; // Top HUD clicks

      if (e.button === 2 || e.button === 1 || (e.ctrlKey && e.button === 0)) {
        isDragging.current = true;
        lastPointer.current = { x: e.clientX, y: e.clientY };
        lastManualInputTime.current = Date.now();
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isShiftLock) {
        // Shift lock mode: mouse movement directly controls camera
        const dx = e.movementX || 0;
        const dy = e.movementY || 0;
        camAngleX.current -= dx * 0.0022;
        camAngleY.current = Math.max(0.08, Math.min(1.25, camAngleY.current + dy * 0.0018));
        lastManualInputTime.current = Date.now();
        return;
      }

      if (!isDragging.current) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };

      camAngleX.current -= dx * 0.0028;
      camAngleY.current = Math.max(0.08, Math.min(1.25, camAngleY.current + dy * 0.0022));
      lastManualInputTime.current = Date.now();
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    // MacBook Trackpad 2-finger swipe & pinch gestures (matching Roblox on Mac):
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Pinch gesture on MacBook Trackpad (or Ctrl/Meta + wheel):
      if (e.ctrlKey || e.metaKey) {
        const zoomStep = e.deltaY * 0.01;
        gameStore.zoomCamera(zoomStep);
        return;
      }

      // Discrete external mouse wheel notch (zooms camera):
      const isDiscreteWheel = e.deltaMode !== 0 || (Math.abs(e.deltaX) === 0 && Math.abs(e.deltaY) >= 40);
      if (isDiscreteWheel && !('ontouchstart' in window)) {
        gameStore.zoomCamera(e.deltaY * 0.006);
        return;
      }

      // MacBook Trackpad 2-Finger Swipe (Roblox / Brookhaven camera control):
      // Reduced sensitivity (~65% gentler) so gentle 2-finger swipes feel precise, buttery smooth, and comfortable
      camAngleX.current += e.deltaX * 0.0018;
      camAngleY.current = Math.max(0.08, Math.min(1.25, camAngleY.current - e.deltaY * 0.0014));
      lastManualInputTime.current = Date.now();
    };

    // Roblox standard keyboard shortcuts for camera:
    // I / O for zoom, < / > for rotate
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyI') {
        gameStore.zoomCamera(-1.0); // zoom in
      } else if (e.code === 'KeyO') {
        gameStore.zoomCamera(1.0); // zoom out
      } else if (e.code === 'Comma') {
        camAngleX.current += 0.25; // rotate left
        lastManualInputTime.current = Date.now();
      } else if (e.code === 'Period') {
        camAngleX.current -= 0.25; // rotate right
        lastManualInputTime.current = Date.now();
      }
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gl, isShiftLock]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const motion = gameStore.getState();
    const playerPos = motion.playerPos;
    const isMoving = motion.isPlayerMoving;
    const facingAngle = motion.playerFacingAngle;

    // Brookhaven Soft Auto-Follow:
    // When character is walking and no manual trackpad input occurred in the last ~1.2s,
    // smoothly and gently align camera behind player's moving direction.
    if (!isShiftLock && isMoving && Date.now() - lastManualInputTime.current > 1200) {
      let diff = facingAngle - camAngleX.current;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;

      const followRate = Math.min(dt * 2.2, 1);
      camAngleX.current += diff * followRate;
    }

    // Smoothly interpolate camera distance
    camDistance.current = THREE.MathUtils.lerp(camDistance.current, targetDistance, dt * 8);

    // Target is slightly above player center
    tempTarget.set(playerPos[0], playerPos[1] + 1.25, playerPos[2]);
    currentTargetPos.current.lerp(tempTarget, dt * 8);

    // Camera spherical position offset
    const cosY = Math.cos(camAngleY.current);
    const sinY = Math.sin(camAngleY.current);
    const offsetX = -Math.sin(camAngleX.current) * cosY * camDistance.current;
    const offsetZ = -Math.cos(camAngleX.current) * cosY * camDistance.current;
    const offsetY = sinY * camDistance.current + 0.8;

    tempDesiredCamPos.set(
      currentTargetPos.current.x + offsetX,
      currentTargetPos.current.y + offsetY,
      currentTargetPos.current.z + offsetZ
    );

    currentCamPos.current.lerp(tempDesiredCamPos, dt * 7);

    camera.position.copy(currentCamPos.current);
    camera.lookAt(currentTargetPos.current);
  });

  return null;
};
