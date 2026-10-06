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
    stdin: { contents: "export { gameStore } from './src/state/useGameStore'; export { soundManager } from './src/sound/audioManager'; export { processMagicPrompt } from './src/services/aiService'; export { isGameInputBlocked } from './src/state/gameInput'; export { constrainCameraPosition, addSolidBox, removeSolidCollider } from './src/state/colliders'; export { Vector3 } from 'three';", resolveDir: process.cwd() },
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
  console.log('PASS: location transitions, input blocking, quest prerequisites, bounded effects, unique IDs, no-op notifications, AI validation and offline spells.');
} finally { await rm(temp, { recursive: true, force: true }); }
