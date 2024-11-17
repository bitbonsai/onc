// src/commands/docker.js
import { exec, spawn } from "child_process";
import { promisify } from "util";
import kleur from "kleur";
import ora from "ora";
import path from "path";

const execAsync = promisify(exec);

// Get possible container names
async function findRunningContainer() {
  const currentDir = process.cwd();
  const projectDir = path.basename(path.dirname(path.dirname(currentDir)));
  const possibleNames = [
    projectDir, // test-project
    `${projectDir}-pb`, // test-project-pb
  ];

  try {
    const { stdout } = await execAsync('docker ps --format "{{.Names}}"');
    const runningContainers = stdout.trim().split("\n");
    const foundContainer = possibleNames.find((name) =>
      runningContainers.includes(name),
    );
    return foundContainer;
  } catch (error) {
    return null;
  }
}

async function executeCommand(command) {
  try {
    const { stdout, stderr } = await execAsync(command);
    return { stdout, stderr };
  } catch (error) {
    throw new Error(error.stderr || error.message);
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

export async function handleDockerCommand(subcommand, args) {
  const spinner = ora().start();

  try {
    switch (subcommand) {
      case "build": {
        spinner.text = "Building Docker image...";
        await executeCommand("npm run docker:build");
        spinner.succeed("Docker image built successfully");
        break;
      }
      case "up": {
        spinner.text = "Starting container...";
        try {
          await executeCommand("npm run docker:start");
          spinner.succeed("Container started successfully");
        } catch (error) {
          if (error.message.includes("No such container")) {
            await executeCommand("npm run docker:run");
            spinner.succeed("Container started successfully");
          } else if (error.message.includes("already in use")) {
            spinner.info("Container already exists. Try:");
            console.log(kleur.blue("\n  bit docker down"));
            console.log(kleur.blue("  bit docker up\n"));
            process.exit(1);
          } else {
            throw error;
          }
        }
        break;
      }
      case "down": {
        spinner.text = "Stopping container...";
        await executeCommand("npm run docker:stop");
        spinner.succeed("Container stopped successfully");
        break;
      }
      case "logs": {
        spinner.stop();
        const containerName = await findRunningContainer();

        if (!containerName) {
          console.error(kleur.red("Container not found. Is it running?"));
          console.log(kleur.blue("\nTry starting it first:"));
          console.log(kleur.blue("  bit docker up"));
          process.exit(1);
        }

        const follow = args.includes("-f") || args.includes("--follow");
        try {
          if (follow) {
            await execAsync(`docker logs -f ${containerName}`, {
              stdio: "inherit",
            });
          } else {
            const { stdout } = await executeCommand(
              `docker logs ${containerName}`,
            );
            console.log(stdout);
          }
        } catch (error) {
          throw error;
        }
        break;
      }
      case "shell": {
        spinner.stop();
        const containerName = await findRunningContainer();

        if (!containerName) {
          console.error(kleur.red("Container not found. Is it running?"));
          console.log(kleur.blue("\nTry starting it first:"));
          console.log(kleur.blue("  bit docker up"));
          process.exit(1);
        }

        try {
          const shell = spawn("docker", ["exec", "-it", containerName, "sh"], {
            stdio: "inherit",
            shell: true,
          });

          shell.on("error", (error) => {
            console.error(kleur.red("Failed to start shell:"), error.message);
            process.exit(1);
          });

          shell.on("exit", (code) => {
            if (code !== 0) {
              console.error(kleur.red(`Shell exited with code ${code}`));
              process.exit(code);
            }
          });
        } catch (error) {
          console.error(
            kleur.red("Failed to access container shell:"),
            error.message,
          );
          process.exit(1);
        }
        break;
      }

      default: {
        spinner.fail(kleur.red(`Unknown docker command: ${subcommand}`));
        process.exit(1);
      }
    }
  } catch (error) {
    spinner.fail(kleur.red(error.message));
    console.log("\nTry running these commands to fix common issues:");
    console.log(kleur.blue("  bit docker down"));
    console.log(kleur.blue("  bit docker up"));
    process.exit(1);
  }
}
