// tests/helpers.js
import { access } from "fs/promises";

export async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function startTestServer(port) {
  return new Promise((resolve) => {
    const server = require("http")
      .createServer()
      .listen(port, () => resolve(server));
  });
}

export async function cleanupTestProject() {
  try {
    await execAsync("rm -rf test-project");
    await execAsync("docker rm -f test-project-pb");
  } catch (error) {
    // Ignore cleanup errors
  }
}
