// src/commands/start.js
import { exec } from "child_process";
import { promisify } from "util";
import kleur from "kleur";
import ora from "ora";

const execAsync = promisify(exec);

export async function handleStartCommand() {
  const spinner = ora("Starting development environment...").start();

  try {
    // Start PocketBase
    spinner.text = "Starting PocketBase...";
    try {
      await execAsync("npm run docker:start", { cwd: "apps/pb" });
    } catch (error) {
      // If container doesn't exist, try to run a new one
      await execAsync("npm run docker:run", { cwd: "apps/pb" });
    }
    spinner.succeed("PocketBase is running");

    // Start Astro in a new terminal
    spinner.text = "Starting Astro...";
    try {
      if (process.platform === "darwin") {
        // macOS
        await execAsync(
          `osascript -e 'tell app "Terminal" to do script "cd ${process.cwd()}/apps/web && npm run dev"'`,
        );
      } else if (process.platform === "win32") {
        // Windows
        await execAsync(
          `start cmd.exe /K "cd ${process.cwd()}/apps/web && npm run dev"`,
        );
      } else {
        // Linux
        await execAsync(
          `x-terminal-emulator -e "cd ${process.cwd()}/apps/web && npm run dev"`,
        );
      }
      spinner.succeed("Astro dev server started in new terminal");
    } catch (error) {
      spinner.warn("Could not start Astro automatically");
      console.log(kleur.blue("\nStart Astro manually in a new terminal:"));
      console.log(kleur.blue("  cd apps/web && npm run dev"));
    }

    console.log("\nAvailable endpoints:");
    console.log("PocketBase:  " + kleur.green("http://localhost:8090"));
    console.log("Admin UI:    " + kleur.green("http://localhost:8090/_/"));
    console.log("Astro:       " + kleur.green("http://localhost:4321"));
  } catch (error) {
    spinner.fail(kleur.red("Failed to start development environment"));
    console.error(kleur.red(error.message));
    process.exit(1);
  }
}
