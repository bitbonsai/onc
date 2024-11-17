// tests/integration/full-workflow.test.js
import { test } from "node:test";
import assert from "node:assert";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

test("Full workflow integration test", async (t) => {
  try {
    // Create new project
    await t.test("creates new project", async () => {
      await execAsync("bit new test-project");
      assert.ok(await fileExists("test-project"));
    });

    // Setup PocketBase
    await t.test("sets up PocketBase", async () => {
      await execAsync("cd test-project && bit pb setup");
      assert.ok(await fileExists("test-project/apps/pb/Dockerfile"));
    });

    // Start services
    await t.test("starts all services", async () => {
      await execAsync("cd test-project && bit start");

      // Check if services are running
      const pbHealth = await fetch("http://localhost:8090/api/health");
      assert.equal(pbHealth.status, 200);

      const astroHealth = await fetch("http://localhost:4321");
      assert.equal(astroHealth.status, 200);
    });
  } finally {
    // Cleanup after tests
    await execAsync("npm run test:clean");
  }
});
