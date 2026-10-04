import * as THREE from 'three';

export interface PlatformCollider {
  box: THREE.Box3;
  type: 'ground' | 'trampoline' | 'checkpoint' | 'star';
  meta?: any;
}

export const colliders: PlatformCollider[] = [];
