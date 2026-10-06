import * as THREE from 'three';

/**
 * Mathematical 3D trajectory for the Grand Waterpark Slide (Seluncuran Istana Air Ceria).
 * This shared spline guarantees 100% mathematical alignment between the 3D flume mesh
 * and Player Khaulah's sliding physics animation.
 */

// Spline control points for the expanded, grand scale slide:
// P0: Launch tub on tower deck (X: 8.0, Y: 4.0, Z: -36.0)
// P1: High banked introductory curve (X: 7.2, Y: 3.25, Z: -34.4)
// P2: Mid-slope thrilling speed drop (X: 5.8, Y: 2.1, Z: -32.4)
// P3: Deceleration transition scoop (X: 4.2, Y: 1.0, Z: -30.4)
// P4: Splashdown exit apron skimming right above pool water (X: 2.2, Y: 0.32, Z: -28.6)
export const SLIDE_CONTROL_POINTS = [
  new THREE.Vector3(8.0, 4.0, -36.0),
  new THREE.Vector3(7.2, 3.25, -34.4),
  new THREE.Vector3(5.8, 2.1, -32.4),
  new THREE.Vector3(4.2, 1.0, -30.4),
  new THREE.Vector3(2.2, 0.32, -28.6),
];

export const waterSlideCurve = new THREE.CatmullRomCurve3(SLIDE_CONTROL_POINTS, false, 'centripetal', 0.5);

export interface WaterSlidePose {
  pos: THREE.Vector3;
  tangent: THREE.Vector3;
  heading: number;
  bankAngle: number;
}

/**
 * Returns the exact 3D position, forward tangent, heading angle, and banking angle
 * for a normalized progress t in [0, 1].
 */
export function getWaterSlidePose(t: number): WaterSlidePose {
  const clampedT = THREE.MathUtils.clamp(t, 0, 1);
  const pos = waterSlideCurve.getPoint(clampedT);
  const tangent = waterSlideCurve.getTangent(clampedT).normalize();
  const heading = Math.atan2(tangent.x, tangent.z);

  // Bank angle: gentle inward tilt when negotiating the curve in the middle section
  const bankAngle = Math.sin(clampedT * Math.PI) * -0.24;

  return {
    pos,
    tangent,
    heading,
    bankAngle,
  };
}
