// tests/commands/pb.test.js
import { test } from 'node:test';
import assert from 'node:assert';
import { execa } from 'execa';
import getPort from 'get-port';
import stripAnsi from 'strip-ansi';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { access, rm } from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_PROJECT = 'test-project';

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function cleanupTestProject() {
  try {
    await rm(TEST_PROJECT, { recursive: true, force: true });
    await execa('docker', ['rm', '-f', `${TEST_PROJECT}-pb`], { reject: false });
  } catch (error) {
    // Ignore cleanup errors
  }
}

test('PocketBase commands', async (t) => {
  // Setup before all tests
  t.beforeEach(async () => {
    await cleanupTestProject();
  });

  // Cleanup after all tests
  t.after(async () => {
    await cleanupTestProject();
  });

  await t.test('setup command creates necessary files', async () => {
    // Create test project
    await execa('node', ['../../src/cli.js', 'new', TEST_PROJECT], {
      cwd: __dirname
    });

    // Run setup
    const { stdout } = await execa('node', ['../../src/cli.js', 'pb', 'setup'], {
      cwd: join(__dirname, TEST_PROJECT)
    });

    // Check output
    const cleanOutput = stripAnsi(stdout);
    assert.ok(cleanOutput.includes('PocketBase setup completed'));

    // Check files
    assert.ok(await fileExists(join(__dirname, TEST_PROJECT, 'apps/pb/Dockerfile')));
    assert.ok(await fileExists(join(__dirname, TEST_PROJECT, 'apps/pb/package.json')));
  });

  await t.test('start command runs container', async () => {
    const testPort = await getPort();

    const { stdout } = await execa('node', ['../../src/cli.js', 'pb', 'start'], {
      cwd: join(__dirname, TEST_PROJECT),
      env: { PB_PORT: testPort.toString() }
    });

    const cleanOutput = stripAnsi(stdout);
    assert.ok(cleanOutput.includes('PocketBase is running'));

    // Verify container is running
    const { stdout: psOutput } = await execa('docker', ['ps']);
    assert.ok(psOutput.includes(`${TEST_PROJECT}-pb`));

    // Verify port is accessible
    try {
      const response = await fetch(`http://localhost:${testPort}/api/health`);
      assert.equal(response.status, 200);
    } catch (error) {
      assert.fail(`Failed to access PocketBase: ${error.message}`);
    }
  });

  await t.test('stop command stops container', async () => {
    const { stdout } = await execa('node', ['../../src/cli.js', 'pb', 'stop'], {
      cwd: join(__dirname, TEST_PROJECT)
    });

    const cleanOutput = stripAnsi(stdout);
    assert.ok(cleanOutput.includes('PocketBase stopped'));

    // Verify container is stopped
    const { stdout: psOutput } = await execa('docker', ['ps']);
    assert.ok(!psOutput.includes(`${TEST_PROJECT}-pb`));
  });

  await t.test('cleanup command removes container and data', async () => {
    // First start the container
    await execa('node', ['../../src/cli.js', 'pb', 'start'], {
      cwd: join(__dirname, TEST_PROJECT)
    });

    // Then cleanup
    const { stdout } = await execa('node', ['../../src/cli.js', 'pb', 'cleanup', '--all', '--data'], {
      cwd: join(__dirname, TEST_PROJECT)
    });

    const cleanOutput = stripAnsi(stdout);
    assert.ok(cleanOutput.includes('PocketBase cleaned up successfully'));

    // Verify container is removed
    const { stdout: psOutput } = await execa('docker', ['ps', '-a']);
    assert.ok(!psOutput.includes(`${TEST_PROJECT}-pb`));

    // Verify image is removed (--all flag)
    const { stdout: imagesOutput } = await execa('docker', ['images']);
    assert.ok(!imagesOutput.includes(`${TEST_PROJECT}-pb`));

    // Verify data is removed (--data flag)
    const dataExists = await fileExists(join(__dirname, TEST_PROJECT, 'apps/pb/pb_data/data.db'));
    assert.equal(dataExists, false);
  });

  await t.test('handles port conflict correctly', async () => {
    // Start a process on the PocketBase port
    const testPort = 8090;
    const server = await new Promise((resolve) => {
      const srv = require('http')
        .createServer()
        .listen(testPort, () => resolve(srv));
    });

    try {
      await execa('node', ['../../src/cli.js', 'pb', 'start'], {
        cwd: join(__dirname, TEST_PROJECT)
      });
      assert.fail('Should have thrown port conflict error');
    } catch (error) {
      const cleanOutput = stripAnsi(error.stdout || '');
      assert.ok(cleanOutput.includes('Port 8090 is already in use'));
    } finally {
      server.close();
    }
  });

  await t.test('logs command shows container logs', async () =>
