import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import kleur from "kleur";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function getPackageInfo() {
  try {
    const { stdout } = await execAsync(
      "npm list -g @mauricio.wolff/bit --json",
    );
    const parsed = JSON.parse(stdout);
    return parsed.dependencies["@mauricio.wolff/bit"];
  } catch (error) {
    throw new Error(
      "Failed to get package information. Is bit installed globally?",
    );
  }
}

export async function handleVersionCommand() {
  try {
    const packageInfo = await getPackageInfo();
    console.log(`bit version ${kleur.green(packageInfo.version)}`);

    // Check for updates
    try {
      const response = await fetch(
        "https://registry.npmjs.org/@mauricio.wolff/bit/latest",
      );
      if (!response.ok) {
        throw new Error("Failed to fetch latest version from npm");
      }
      const { version: latestVersion } = await response.json();

      if (latestVersion && latestVersion !== packageInfo.version) {
        console.log(
          kleur.yellow("\nUpdate available!") +
            kleur.gray(` ${packageInfo.version} → ${latestVersion}`),
        );
        console.log(kleur.blue("Run `bit upgrade` to update"));
      }
    } catch (error) {
      // Silently fail version check
    }
  } catch (error) {
    console.error(kleur.red("Error getting version:", error.message));
    process.exit(1);
  }
}
