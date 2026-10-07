import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const temp = await mkdtemp(join(tmpdir(), 'khaulah-tests-'));
try {
  const output = join(temp, 'game.mjs');
  await build({
    stdin: { contents: "export { gameStore } from './src/state/useGameStore'; export { soundManager } from './src/sound/audioManager'; export { processMagicPrompt } from './src/services/aiService'; export { isGameInputBlocked } from './src/state/gameInput'; export { constrainCameraPosition, addSolidBox, removeSolidCollider } from './src/state/colliders'; export { Vector3 } from 'three'; export { getWaterStatus } from './src/state/waterZones'; export { entersSchoolGoal } from './src/state/worldLocations'; export { dailyDate, recordDailyActivity, getDailyMissionProgress } from './src/state/dailyMissions';", resolveDir: process.cwd() },
    bundle: true, platform: 'node', format: 'esm', outfile: output,
    plugins: [{ name: 'confetti-stub', setup(build) {
      build.onResolve({ filter: /^canvas-confetti$/ }, () => ({ path: 'confetti', namespace: 'test' }));
      build.onLoad({ filter: /.*/, namespace: 'test' }, () => ({ contents: 'export default () => {};', loader: 'js' }));
    } }],
  });
  const { gameStore: store, soundManager, processMagicPrompt, isGameInputBlocked } = await import(pathToFileURL(output));
  const { constrainCameraPosition, addSolidBox, removeSolidCollider, Vector3 } = await import(pathToFileURL(output));
  const wall = addSolidBox([-5, 0, -4], [5, 5, -3]);
  const target = new Vector3(0, 2, 0);
  const camera = new Vector3(0, 2, -8);
  constrainCameraPosition(target, camera);
  assert.equal(camera.z, -2.75);
  const clearCamera = new Vector3(0, 2, 8);
  constrainCameraPosition(target, clearCamera);
  assert.equal(clearCamera.z, 8);
  removeSolidCollider(wall);
  soundManager.setMuted(true);
  store.setWelcomeOpen(false);
  assert.equal(isGameInputBlocked(store.getState()), false);
  store.openMagicModal();
  assert.equal(isGameInputBlocked(store.getState()), true);
  store.closeMagicModal();
  store.setActiveRide('train');
  store.mountScooter();
  store.teleportPlayerTo([160, 0.4, -2.5]);
  assert.equal(store.getState().isInsideHouse, true);
  assert.equal(store.getState().activeRide, 'none');
  assert.equal(store.getState().isRidingScooter, false);
  store.teleportToPreset('pantai');
  assert.equal(store.getState().isInsideHouse, false);
  for (const preset of ['bukit_pelangi', 'desa_sawah', 'hutan_ajaib', 'lembah_salju', 'masjid']) {
    store.teleportToPreset(preset);
    assert.equal(store.getState().isInsideHouse, false, `${preset} must stay outdoors`);
    assert.equal(store.getState().activeRide, 'none');
  }
  assert.ok(store.getState().teleportTarget);
  store.teleportToPreset('bukit_pelangi');
  assert.ok(store.getState().teleportTarget[1] > 8.8, 'spawn above the hill surface');
  store.openMapModal();
  assert.equal(isGameInputBlocked(store.getState()), true);
  store.openStickerModal();
  assert.equal(store.getState().isMapModalOpen, false);
  store.setPhotoMode(true);
  assert.equal(store.getState().isStickerModalOpen, false);
  assert.equal(isGameInputBlocked(store.getState()), true);
  store.setPhotoMode(false);
  assert.equal(isGameInputBlocked(store.getState()), false);
  store.unlockSticker('invalid_sticker');
  assert.equal(store.getState().unlockedStickers.invalid_sticker, undefined);
  store.unlockSticker('foto');
  let stickerNotifications = 0;
  const stopSticker = store.subscribe(() => stickerNotifications++);
  store.unlockSticker('foto');
  stopSticker();
  assert.equal(stickerNotifications, 0, 'duplicate sticker should not notify');
  const { dailyDate, entersSchoolGoal, getWaterStatus } = await import(pathToFileURL(output));
  assert.equal(dailyDate(new Date(2026, 9, 7, 23, 59)), '2026-10-07');
  assert.equal(dailyDate(new Date(2026, 9, 8, 0, 0)), '2026-10-08');
  assert.equal(entersSchoolGoal({ x: 16, y: 0.6, z: 47 }, { x: 16, y: 0.6, z: 49 }), true);
  assert.equal(entersSchoolGoal({ x: 16, y: 0.6, z: 49 }, { x: 16, y: 0.6, z: 47 }), false);
  assert.equal(entersSchoolGoal({ x: 18, y: 0.6, z: 47 }, { x: 18, y: 0.6, z: 49 }), false);
  assert.equal(entersSchoolGoal({ x: 16, y: 3, z: 47 }, { x: 16, y: 3, z: 49 }), false);
  assert.equal(getWaterStatus(-180, 0.16, -20).zone, 'ocean');
  assert.equal(getWaterStatus(-150, 0.55, -20).inWater, false);
  assert.equal(getWaterStatus(-105, 0.4, -15).inWater, false);
  store.setActiveRide('hot_air_balloon');
  store.dismountRide();
  assert.equal(store.getState().activeRide, 'none');
  assert.deepEqual(store.getState().teleportTarget, [53, 0.8, 85]);
  const before = store.getState().teleportTrigger;
  store.teleportPlayerTo([Infinity, 0, 0]);
  assert.equal(store.getState().teleportTrigger, before);
  store.teleportPlayerTo([160, 0.4, -2.5]);
  store.triggerRespawn();
  assert.equal(store.getState().isInsideHouse, false);
  assert.deepEqual(store.getState().playerPos, [0, 0.8, -4]);
  store.completeSchoolQuest();
  assert.equal(store.getState().schoolQuest.completed, false);
  for (const item of ['backpack', 'waterBottle', 'drawingBook']) store.collectQuestItem(item);
  store.completeSchoolQuest();
  assert.equal(store.getState().schoolQuest.completed, true);
  for (let i = 0; i < 10; i++) store.spawnMagicItems('balloon', { count: 1e8 });
  const items = store.getState().spawnedItems;
  assert.equal(items.length, 50);
  assert.equal(new Set(items.map(item => item.id)).size, 50);
  let notifications = 0;
  const unsubscribe = store.subscribe(() => notifications++);
  store.setJoystick({ x: 0, y: 0 });
  store.removeSpawnedItem('missing');
  assert.equal(notifications, 0);
  unsubscribe();
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: '{"speech":"Test","action":"set_time","actionParam":"invalid"}' } }] }) });
  const oldWarn = console.warn;
  console.warn = () => {};
  try {
    assert.equal((await processMagicPrompt('jadikan siang')).actionParam, 'siang');
    globalThis.fetch = async () => { throw new Error('offline'); };
    for (const [prompt, action] of [['pasar malam', 'teleport'], ['telinga kelinci', 'set_accessory'], ['hujan balon', 'spawn_balloons'], ['gelembung', 'spawn_bubbles'], ['hujan bintang', 'spawn_stars'], ['kue ulang tahun', 'spawn_cake']]) {
      assert.equal((await processMagicPrompt(prompt)).action, action, prompt);
    }
  } finally { console.warn = oldWarn; }
  const storage = new Map([
    ['khaulah_unlocked_stickers', 'null'],
    ['khaulah_school_quest', '{"completed":true,"backpack":true}'],
    ['khaulah_daily_missions', '{"date":"1999-01-01","completed":["gol","foto"]}'],
  ]);
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  };
  globalThis.window = { localStorage: globalThis.localStorage, addEventListener() {} };
  try {
    const reloaded = await import(`${pathToFileURL(output)}?storage-test`);
    reloaded.soundManager.setMuted(true);
    assert.deepEqual(reloaded.getDailyMissionProgress().completed, []);
    reloaded.recordDailyActivity('foto');
    reloaded.recordDailyActivity('foto');
    reloaded.recordDailyActivity('unknown');
    assert.deepEqual(reloaded.getDailyMissionProgress().completed, ['foto']);
    assert.equal(reloaded.gameStore.getState().unlockedStickers.rumah, true);
    assert.equal(reloaded.gameStore.getState().schoolQuest.completed, false);
    for (const item of ['backpack', 'waterBottle', 'drawingBook']) reloaded.gameStore.collectQuestItem(item);
    reloaded.gameStore.completeSchoolQuest();
    // Simulate a new browser document while preserving only persisted storage.
    globalThis.window = { localStorage: globalThis.localStorage, addEventListener() {} };
    const restored = await import(`${pathToFileURL(output)}?school-restored`);
    assert.deepEqual(restored.getDailyMissionProgress().completed, ['foto']);
    assert.equal(restored.gameStore.getState().schoolQuest.completed, true);
    assert.equal(restored.gameStore.getState().unlockedStickers.tk, true);
  } finally {
    delete globalThis.localStorage;
    delete globalThis.window;
  }
  console.log('PASS: location transitions, input blocking, quest prerequisites, bounded effects, unique IDs, no-op notifications, goal crossings, ocean zones, safe ride exits, save recovery, daily missions, AI validation and offline spells.');
} finally { await rm(temp, { recursive: true, force: true }); }
