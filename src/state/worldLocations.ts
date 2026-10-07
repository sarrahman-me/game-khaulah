/** The house interior occupies its own bounded room east of the outdoor world. */
export function isHouseInteriorPosition(pos: readonly number[]): boolean {
  return pos[0] >= 141.5 && pos[0] <= 178.5 && pos[2] >= -25.2 && pos[2] <= 1.2;
}

export const SCHOOL_GOAL: [number, number, number] = [16, 0.2, 48];
interface Point3 { x: number; y: number; z: number }
export function entersSchoolGoal(previous: Point3, current: Point3): boolean {
  const [x, y, z] = SCHOOL_GOAL;
  if (previous.z >= z || current.z < z) return false;
  const fraction = (z - previous.z) / (current.z - previous.z);
  const crossX = previous.x + (current.x - previous.x) * fraction;
  const crossY = previous.y + (current.y - previous.y) * fraction;
  return Math.abs(crossX - x) <= 0.82 && crossY >= y + 0.32 && crossY <= y + 1.42;
}
