import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateHit,
  healthStatus,
  limitGain,
} from "../src/components/windows/status/status.utils.ts";

test("portrait damage, Limit healing, and shared audio remain consistent", async (t) => {
  const normal = calculateHit(2200, 0.5, 0.5);
  const critical = calculateHit(2200, 0.5, 0);
  assert.equal(normal.health, 2200 - normal.damage);
  assert.equal(critical.health, 2200 - critical.damage);
  assert.ok(critical.damage >= normal.damage * 2);
  assert.equal(calculateHit(1, 0.5, 0).health, 0);
  assert.equal(calculateHit(2200, 0, 0.5).damage, 140);
  assert.equal(calculateHit(2200, 0.999, 0.5).damage, 150);
  assert.equal(healthStatus(551, 2200), "normal");
  assert.equal(healthStatus(550, 2200), "critical");
  assert.equal(healthStatus(0, 2200), "ko");
  assert.equal(limitGain(145, 2200), 24);
  assert.equal(limitGain(1, 2200), 0);

  const stored = new Map([
    ["sound-settings", JSON.stringify({ enabled: false, volume: 20 })],
  ]);
  const gain = { gain: { value: 0 }, connect() {} };
  let contexts = 0;
  let downloads = 0;
  let started = 0;
  const globals = ["localStorage", "document", "AudioContext", "fetch"].map(
    (key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)],
  );
  t.after(() =>
    globals.forEach(([key, descriptor]) => {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }),
  );
  const replace = (key, value) =>
    Object.defineProperty(globalThis, key, {
      value,
      writable: true,
      configurable: true,
    });
  replace("localStorage", {
    getItem: (key) => stored.get(key),
    setItem: (key, value) => stored.set(key, value),
  });
  replace("document", { hidden: false });
  replace(
    "AudioContext",
    class {
      state = "suspended";
      constructor() {
        contexts++;
      }
      createGain() {
        return gain;
      }
      async resume() {
        this.state = "running";
      }
      async decodeAudioData(data) {
        return data;
      }
      createBufferSource() {
        return {
          connect() {},
          start() {
            started++;
          },
        };
      }
    },
  );
  replace("fetch", async () => {
    downloads++;
    return { ok: true, arrayBuffer: async () => new ArrayBuffer(8) };
  });
  const audio = await import("../src/lib/audio.ts");
  assert.deepEqual(audio.defaultSoundSettings, { volume: 20 });
  assert.equal(
    audio.getSoundSettings().volume,
    0,
    "old mute preference survives migration",
  );
  const flush = () => new Promise((resolve) => setImmediate(resolve));
  const advance = () => new Promise((resolve) => setTimeout(resolve, 60));

  audio.playSound("select");
  assert.equal(contexts, 0, "zero volume does not initialize audio");
  assert.equal(downloads, 0);
  audio.setSoundSettings({ volume: 65 });
  audio.playSound("select");
  audio.playSound("select");
  await flush();
  assert.equal(contexts, 1);
  assert.equal(downloads, 8);
  assert.equal(started, 1, "duplicate selection plays once");
  assert.equal(gain.gain.value, 0.65);

  await advance();
  audio.playSound("select");
  audio.setSoundSettings({ volume: 0 });
  audio.setSoundSettings({ volume: 65 });
  await flush();
  assert.equal(
    started,
    1,
    "muting invalidates queued sounds even after re-enabling",
  );
  await advance();
  audio.playSound("error");
  await flush();
  assert.equal(started, 2);
  assert.equal(downloads, 8, "decoded clips are reused");
  audio.setSoundSettings({ volume: 0 });
  assert.equal(gain.gain.value, 0);
  await advance();
  audio.playSound("slash");
  await flush();
  assert.equal(started, 2, "zero volume is silent");
  audio.setSoundSettings({ volume: 200 });
  assert.equal(audio.getSoundSettings().volume, 100);
  assert.equal(JSON.parse(stored.get("sound-settings")).volume, 100);
  assert.equal("enabled" in JSON.parse(stored.get("sound-settings")), false);
  audio.setSoundSettings({ volume: NaN });
  assert.equal(audio.getSoundSettings().volume, 20);

  replace("fetch", async () => {
    throw new Error("Offline");
  });
  const offline = await import("../src/lib/audio.ts?offline-check");
  offline.playSound("error");
  await flush();
  assert.equal(started, 2, "unavailable audio does not interrupt the action");
});
