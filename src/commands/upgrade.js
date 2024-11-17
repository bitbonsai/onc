// src/commands/upgrade.js
import { exec } from "child_process";
import { promisify } from "util";
import kleur from "kleur";
import ora from "ora";

const execAsync = promisify(exec);

export async function handleUpgradeCommand() {
  const spinner = ora("Checking for updates...").start();

  try {
    // Get current version
    const { stdout: currentVersion } = await execAsync(
      "npm list -g bit --json",
    );
    const current = JSON.parse(currentVersion).dependencies.bit.version;

    // Get latest version
    const response = await fetch("https://registry.npmjs.org/bit/latest");
    const { version: latest } = await response.json();

    if (latest === current) {
      spinner.succeed("Already using the latest version!");
      return;
    }

    // Perform upgrade
    spinner.text = `Upgrading from ${current} to ${latest}...`;
    await execAsync("npm install -g bit@latest");

    spinner.succeed(
      `Successfully upgraded bit from ${kleur.yellow(current)} to ${kleur.green(latest)}`,
    );

    // Show what's new
    console.log("\nWhat's new:");
    try {
      const changelogUrl =
        "https://raw.githubusercontent.com/bitbonsai/bit/main/CHANGELOG.md";
      const changelogResponse = await fetch(changelogUrl);
      const changelog = await changelogResponse.text();

      // Show latest changes (you'll need to maintain a CHANGELOG.md)
      console.log(kleur.gray(changelog.split("\n").slice(0, 10).join("\n")));
    } catch (error) {
      // Silently fail if changelog isn't available
    }
  } catch (error) {
    spinner.fail(kleur.red("Failed to upgrade:"));
    console.error(kleur.red(error.message));

    if (error.message.includes("EACCES")) {
      console.log(kleur.yellow("\nTry running with sudo:"));
      console.log(kleur.blue("  sudo bit upgrade"));
    }

    process.exit(1);
  }
}
