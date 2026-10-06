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
    // Marble deck coping borders around pool are at Y = 0.36, water surface at 0.28
    if (y < 0.32) {
      return { inWater: true, surfaceY: 0.28, zone: 'pool' };
    }
  }

  // 2. Sunny Beach Lake
  if (x >= -76.0 && x <= -54.0 && z >= 39.0 && z <= 57.0) {
    // Wooden pier platform deck is at Y = 0.36, water surface at 0.18
    const onPier = x >= -61.5 && x <= -52.5 && z >= 42.0 && z <= 46.0;
    if (!onPier && y < 0.24) {
      return { inWater: true, surfaceY: 0.18, zone: 'lake' };
    }
  }

  // 3. Continuous Village River (Z: 14.5 to 21.5, X: -100 to 100)
  if (x >= -100 && x <= 100 && z >= 14.2 && z <= 21.8) {
    // Bridges cross above the river at deck height Y = 0.50 (water surface is at Y = 0.16)
    // Central Wooden Bridge: X: [-3.5, 3.5]
    // West Rustic Bridge: X: [-49.0, -41.0]
    // East Stone Bridge: X: [41.0, 49.0]
    const onCentralBridge = x >= -3.5 && x <= 3.5;
    const onWestBridge = x >= -49.0 && x <= -41.0;
    const onEastBridge = x >= 41.0 && x <= 49.0;

    // If player is on any of the bridges, they are walking on the wooden/stone deck, NEVER in water!
    if (!onCentralBridge && !onWestBridge && !onEastBridge) {
      // River water surface is at Y = 0.16. Only if player is actually down in the river water (Y <= 0.22)
      if (y <= 0.22) {
        return { inWater: true, surfaceY: 0.16, zone: 'river' };
      }
    }
  }

  return { inWater: false, surfaceY: 0, zone: 'none' };
}
