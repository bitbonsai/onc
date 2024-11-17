// src/commands/version.js
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import kleur from "kleur";

export async function handleVersionCommand() {
  try {
    // Get package.json path
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const packagePath = join(__dirname, "../../package.json");

    // Read package.json
    const pkg = JSON.parse(await readFile(packagePath, "utf8"));

    // Display version
    console.log(`bit version ${kleur.green(pkg.version)}`);

    // Check for updates
    const latestVersion = await getLatestVersion();
    if (latestVersion && latestVersion !== pkg.version) {
      console.log(
        kleur.yellow("\nUpdate available!") +
          kleur.gray(` ${pkg.version} → ${latestVersion}`),
      );
      console.log(kleur.blue("Run `bit upgrade` to update"));
    }
  } catch (error) {
    console.error(kleur.red("Error getting version:", error.message));
    process.exit(1);
  }
}

async function getLatestVersion() {
  try {
    const response = await fetch("https://registry.npmjs.org/bit/latest");
    const data = await response.json();
    return data.version;
  } catch (error) {
    return null;
  }
}
