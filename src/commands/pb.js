// src/commands/pb.js
import { exec } from "child_process";
import { promisify } from "util";
import kleur from "kleur";
import ora from "ora";

const execAsync = promisify(exec);

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

async function checkContainer(containerName) {
  try {
    const { stdout } = await execAsync(
      `docker ps -a --filter "name=${containerName}" --format '{{.Names}}'`,
    );
    return stdout.trim() !== "";
  } catch (error) {
    return false;
  }
}

async function checkContainerRunning(containerName) {
  try {
    const { stdout } = await execAsync(
      `docker ps --filter "name=${containerName}" --format '{{.Names}}'`,
    );
    return stdout.trim() !== "";
  } catch (error) {
    return false;
  }
}

export async function handlePocketBaseCommand(subcommand, args = []) {
  const spinner = ora().start();
  const projectName = process.cwd().split("/").pop(); // Get current directory name
  const containerName = `${projectName}-pb`;
  const requiredPort = 8090;

  try {
    switch (subcommand) {
      case "setup": {
        spinner.text = "Installing PocketBase dependencies...";
        await execAsync("npm install", { cwd: "apps/pb" });

        spinner.text = "Building Docker image...";
        await execAsync("npm run docker:build", { cwd: "apps/pb" });
        spinner.succeed("PocketBase setup completed");
        break;
      }

      case "start": {
        spinner.text = "Starting PocketBase...";

        // Check if port is available
        if (!(await isPortAvailable(requiredPort))) {
          const pid = await getProcessUsingPort(requiredPort);
          spinner.fail(
            `Port ${requiredPort} is already in use by process ${pid}`,
          );
          console.log(kleur.yellow("\nTry these commands to fix:"));
          console.log(
            kleur.blue(`  kill ${pid}  # Stop the process using the port`),
          );
          console.log(
            kleur.blue("  onc pb start  # Try starting PocketBase again"),
          );
          process.exit(1);
        }

        // Check container status
        const containerExists = await checkContainer(containerName);
        const isRunning = await checkContainerRunning(containerName);

        if (isRunning) {
          spinner.info("PocketBase is already running");
          console.log("\nAvailable at:");
          console.log(kleur.green("  http://localhost:8090"));
          console.log(
            kleur.green("  http://localhost:8090/_/") + " (Admin UI)",
          );
          process.exit(0);
        }

        try {
          if (containerExists) {
            await execAsync("npm run docker:start", { cwd: "apps/pb" });
          } else {
            await execAsync("npm run docker:run", { cwd: "apps/pb" });
          }

          spinner.succeed("PocketBase is running");
          console.log("\nAvailable at:");
          console.log(kleur.green("  http://localhost:8090"));
          console.log(
            kleur.green("  http://localhost:8090/_/") + " (Admin UI)",
          );
        } catch (error) {
          if (error.message.includes("port is already allocated")) {
            spinner.fail("Port conflict detected");
            console.log(kleur.yellow("\nTry these commands:"));
            console.log(kleur.blue("  onc pb stop"));
            console.log(kleur.blue("  onc pb start"));
          } else {
            throw error;
          }
        }
        break;
      }

      case "stop": {
        spinner.text = "Stopping PocketBase...";
        await execAsync("npm run docker:stop", { cwd: "apps/pb" });
        spinner.succeed("PocketBase stopped");
        break;
      }

      case "cleanup": {
        spinner.text = "Cleaning up PocketBase...";

        // Stop container if running
        await execAsync(`docker stop ${containerName}`).catch(() => {});

        // Remove container
        await execAsync(`docker rm ${containerName}`).catch(() => {});

        // Remove image if --all flag is provided
        if (args.includes("--all")) {
          spinner.text = "Removing Docker image...";
          await execAsync(`docker rmi ${containerName}`).catch(() => {});
        }

        // Remove pb_data if --data flag is provided
        if (args.includes("--data")) {
          spinner.text = "Removing data...";
          await execAsync("rm -rf apps/pb/pb_data/*").catch(() => {});
        }

        spinner.succeed("PocketBase cleaned up successfully");

        // Show what was cleaned
        console.log("\nCleaned:");
        console.log(kleur.blue("  ✓ Stopped container"));
        console.log(kleur.blue("  ✓ Removed container"));
        if (args.includes("--all"))
          console.log(kleur.blue("  ✓ Removed Docker image"));
        if (args.includes("--data"))
          console.log(kleur.blue("  ✓ Removed data"));
        break;
      }

      case "logs": {
        const follow = args.includes("-f") || args.includes("--follow");
        spinner.stop(); // Stop spinner as we'll show logs

        try {
          if (follow) {
            // Use spawn for continuous output
            const { spawn } = require("child_process");
            const logs = spawn("npm", ["run", "docker:logs:follow"], {
              cwd: "apps/pb",
              stdio: "inherit",
            });

            logs.on("error", (error) => {
              console.error(kleur.red("Failed to get logs:", error.message));
              process.exit(1);
            });
          } else {
            const { stdout } = await execAsync("npm run docker:logs", {
              cwd: "apps/pb",
            });
            console.log(stdout);
          }
        } catch (error) {
          console.error(kleur.red("Failed to get logs:", error.message));
          process.exit(1);
        }
        break;
      }

      default: {
        spinner.fail(kleur.red(`Unknown PocketBase command: ${subcommand}`));
        console.log(kleur.blue("\nAvailable commands:"));
        console.log("  setup     First-time PocketBase setup");
        console.log("  start     Start PocketBase");
        console.log("  stop      Stop PocketBase");
        console.log("  cleanup   Clean up PocketBase containers and data");
        console.log("  logs      Show PocketBase logs");
        process.exit(1);
      }
    }
  } catch (error) {
    spinner.fail(kleur.red(error.message));
    process.exit(1);
  }
}
