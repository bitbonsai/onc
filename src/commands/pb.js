// src/commands/pb.js
import { exec } from "child_process";
import { promisify } from "util";
import kleur from "kleur";
import ora from "ora";

const execAsync = promisify(exec);

export async function handlePocketBaseCommand(subcommand) {
  const spinner = ora().start();

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
        try {
          await execAsync("npm run docker:start", { cwd: "apps/pb" });
        } catch (error) {
          // If container doesn't exist, try to run a new one
          await execAsync("npm run docker:run", { cwd: "apps/pb" });
        }
        spinner.succeed("PocketBase is running");
        console.log("\nAvailable at:");
        console.log(kleur.green("  http://localhost:8090"));
        console.log(kleur.green("  http://localhost:8090/_/") + " (Admin UI)");
        break;
      }
      case "stop": {
        spinner.text = "Stopping PocketBase...";
        await execAsync("npm run docker:stop", { cwd: "apps/pb" });
        spinner.succeed("PocketBase stopped");
        break;
      }
      default: {
        spinner.fail(kleur.red(`Unknown PocketBase command: ${subcommand}`));
        process.exit(1);
      }
    }
  } catch (error) {
    spinner.fail(kleur.red(error.message));
    process.exit(1);
  }
}
