// utils/ports.js
async function isPortAvailable(port) {
  try {
    const { stdout } = await execAsync(`lsof -i :${port}`);
    return stdout.trim() === "";
  } catch (error) {
    // If lsof command fails, it usually means no process is using the port
    return true;
  }
}

async function getProcessUsingPort(port) {
  try {
    const { stdout } = await execAsync(`lsof -i :${port} -t`);
    return stdout.trim();
  } catch (error) {
    return null;
  }
}
