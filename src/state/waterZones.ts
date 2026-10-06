export interface WaterStatus {
  inWater: boolean;
  surfaceY: number;
  zone: 'river' | 'pool' | 'lake' | 'none';
}

/**
 * Checks whether a given (x, y, z) 3D coordinate is inside a water body
 * and returns the water surface height and zone name.
 */
export function getWaterStatus(x: number, y: number, z: number): WaterStatus {
  // 1. Backyard Waterpark Swimming Pool (Expanded & Centered behind house)
  if (x >= -8.0 && x <= 8.0 && z >= -37.0 && z <= -25.0) {
    // Marble deck coping borders around pool are at Y = 0.36
    if (y < 0.36) {
      return { inWater: true, surfaceY: 0.28, zone: 'pool' };
    }
  }

  // 2. Sunny Beach Lake
  if (x >= -76.0 && x <= -54.0 && z >= 39.0 && z <= 57.0) {
    // Wooden pier platform deck is at Y = 0.36
    const onPier = x >= -61.2 && x <= -52.8 && z >= 42.5 && z <= 45.5 && y >= 0.32;
    if (!onPier) {
      return { inWater: true, surfaceY: 0.18, zone: 'lake' };
    }
  }

  // 3. Continuous Village River
  if (x >= -100 && x <= 100 && z >= 14.65 && z <= 21.35) {
    // Central, West, and East Bridges have deck at Y = 0.50
    const onCentralBridge = x >= -3.8 && x <= 3.8 && y >= 0.30;
    const onWestBridge = x >= -48.8 && x <= -41.2 && y >= 0.30;
    const onEastBridge = x >= 41.2 && x <= 48.8 && y >= 0.30;

    if (!onCentralBridge && !onWestBridge && !onEastBridge) {
      return { inWater: true, surfaceY: 0.16, zone: 'river' };
    }
  }

  return { inWater: false, surfaceY: 0, zone: 'none' };
}
