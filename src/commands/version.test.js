// tests/commands/version.test.js
import { test } from "node:test";
import assert from "node:assert";
import { execa } from "execa";
import stripAnsi from "strip-ansi";

test("version command", async (t) => {
  await t.test("shows current version", async () => {
    const { stdout } = await execa("node", ["../../src/cli.js", "version"]);
    const cleanOutput = stripAnsi(stdout);
    assert.match(cleanOutput, /bit version \d+\.\d+\.\d+/);
  });
});

// tests/commands/upgrade.test.js
import { test } from "node:test";
import assert from "node:assert";
import { execa } from "execa";
import stripAnsi from "strip-ansi";

test("upgrade command", async (t) => {
  await t.test("checks for updates", async () => {
    const { stdout } = await execa("node", ["../../src/cli.js", "upgrade"]);
    const cleanOutput = stripAnsi(stdout);

    // Should either show "Already using latest version" or "Successfully upgraded"
    assert.ok(
      cleanOutput.includes("latest version") ||
        cleanOutput.includes("Successfully upgraded"),
    );
  });
});
