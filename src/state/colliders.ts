import * as THREE from 'three';

export interface PlatformCollider {
  box: THREE.Box3;
  type: 'ground' | 'trampoline' | 'checkpoint' | 'star';
  meta?: any;
}

export const colliders: PlatformCollider[] = [];

export interface SolidBoxCollider {
  type: 'box';
  box: THREE.Box3;
  id?: string;
}

export interface SolidCylinderCollider {
  type: 'cylinder';
  x: number;
  z: number;
  radius: number;
  minY: number;
  maxY: number;
  id?: string;
}

export type SolidCollider = SolidBoxCollider | SolidCylinderCollider;

export const solidColliders: SolidCollider[] = [];

export function addSolidBox(
  min: [number, number, number],
  max: [number, number, number],
  id?: string
): SolidBoxCollider {
  const col: SolidBoxCollider = {
    type: 'box',
    box: new THREE.Box3(new THREE.Vector3(...min), new THREE.Vector3(...max)),
    id,
  };
  solidColliders.push(col);
  return col;
}

export function addSolidCylinder(
  x: number,
  z: number,
  radius: number,
  minY: number,
  maxY: number,
  id?: string
): SolidCylinderCollider {
  const col: SolidCylinderCollider = {
    type: 'cylinder',
    x,
    z,
    radius,
    minY,
    maxY,
    id,
  };
  solidColliders.push(col);
  return col;
}

export function removeSolidCollider(col: SolidCollider): void {
  const idx = solidColliders.indexOf(col);
  if (idx !== -1) {
    solidColliders.splice(idx, 1);
  }
}

/**
 * Resolves horizontal collision between player's cylinder and all registered solid obstacles.
 * Pushes player smoothly away along collision normal, allowing natural wall sliding.
 */
export function resolveHorizontalCollisions(
  pos: THREE.Vector3,
  playerRadius: number = 0.45,
  playerHeight: number = 1.4,
  stepHeight: number = 0.25,
  iterations: number = 3
): boolean {
  const py = pos.y;
  let anyResolved = false;

  for (let it = 0; it < iterations; it++) {
    let hadCollisionThisPass = false;

    for (let i = 0; i < solidColliders.length; i++) {
      const col = solidColliders[i];

      if (col.type === 'box') {
        const b = col.box;
        // Check if player's body vertically overlaps the obstacle
        // If obstacle is below stepHeight or above player's head, ignore
        if (b.max.y <= py + stepHeight || b.min.y >= py + playerHeight) {
          continue;
        }

        const closestX = Math.max(b.min.x, Math.min(pos.x, b.max.x));
        const closestZ = Math.max(b.min.z, Math.min(pos.z, b.max.z));
        const dx = pos.x - closestX;
        const dz = pos.z - closestZ;
        const dSq = dx * dx + dz * dz;

        if (dSq > 0.000001) {
          if (dSq < playerRadius * playerRadius) {
            const dist = Math.sqrt(dSq);
            const overlap = playerRadius - dist;
            pos.x += (dx / dist) * overlap;
            pos.z += (dz / dist) * overlap;
            hadCollisionThisPass = true;
            anyResolved = true;
          }
        } else {
          // Player center is inside the box! Push out to closest face
          const dMinX = pos.x - b.min.x;
          const dMaxX = b.max.x - pos.x;
          const dMinZ = pos.z - b.min.z;
          const dMaxZ = b.max.z - pos.z;
          const minD = Math.min(dMinX, dMaxX, dMinZ, dMaxZ);

          if (minD === dMinX) pos.x = b.min.x - playerRadius;
          else if (minD === dMaxX) pos.x = b.max.x + playerRadius;
          else if (minD === dMinZ) pos.z = b.min.z - playerRadius;
          else pos.z = b.max.z + playerRadius;

          hadCollisionThisPass = true;
          anyResolved = true;
        }
      } else if (col.type === 'cylinder') {
        if (col.maxY <= py + stepHeight || col.minY >= py + playerHeight) {
          continue;
        }

        const dx = pos.x - col.x;
        const dz = pos.z - col.z;
        const dSq = dx * dx + dz * dz;
        const minDist = playerRadius + col.radius;

        if (dSq < minDist * minDist) {
          const dist = Math.sqrt(dSq);
          if (dist > 0.0001) {
            const overlap = minDist - dist;
            pos.x += (dx / dist) * overlap;
            pos.z += (dz / dist) * overlap;
          } else {
            pos.x += minDist;
          }
          hadCollisionThisPass = true;
          anyResolved = true;
        }
      }
    }

    if (!hadCollisionThisPass) break;
  }

  return anyResolved;
}

const cameraRay = new THREE.Ray();
const cameraDirection = new THREE.Vector3();
const cameraHit = new THREE.Vector3();

/** Keep the camera on the player's side of solid walls and furniture. */
export function constrainCameraPosition(target: THREE.Vector3, position: THREE.Vector3): void {
  cameraDirection.subVectors(position, target);
  const distance = cameraDirection.length();
  if (distance < 0.001) return;
  cameraDirection.divideScalar(distance);
  cameraRay.set(target, cameraDirection);
  let allowedDistance = distance;
  for (const collider of solidColliders) {
    if (collider.type !== 'box' || collider.box.containsPoint(target)) continue;
    if (cameraRay.intersectBox(collider.box, cameraHit)) {
      allowedDistance = Math.min(allowedDistance, Math.max(0.1, target.distanceTo(cameraHit) - 0.25));
    }
  }
  if (allowedDistance < distance) position.copy(target).addScaledVector(cameraDirection, allowedDistance);
}
