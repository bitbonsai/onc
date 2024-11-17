// tests/utils/docker.test.js
import { test } from "node:test";
import assert from "node:assert";
import {
  checkContainer,
  checkContainerRunning,
  isPortAvailable,
} from "../../src/utils/docker.js";

test("Docker utilities", async (t) => {
  await t.test("isPortAvailable returns true for unused port", async () => {
    const result = await isPortAvailable(9999);
    assert.strictEqual(result, true);
  });

  await t.test("isPortAvailable returns false for used port", async () => {
    // Start a process on port 8090
    const server = await startTestServer(8090);
    const result = await isPortAvailable(8090);
    assert.strictEqual(result, false);
    await server.close();
  });
});
