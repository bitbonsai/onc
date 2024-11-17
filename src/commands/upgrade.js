import { exec } from "child_process";
import { promisify } from "util";
import kleur from "kleur";
import ora from "ora";

const execAsync = promisify(exec);

async function isGloballyInstalled() {
  try {
    await execAsync("npm list -g @mauricio.wolff/bit");
    return true;
  } catch {
    return false;
  }
}

async function getCurrentVersion() {
  try {
    const { stdout } = await execAsync(
      "npm list -g @mauricio.wolff/bit --json",
    );
    const parsed = JSON.parse(stdout);
    return parsed.dependencies["@mauricio.wolff/bit"].version;
  } catch (error) {
    throw new Error("Failed to get current version");
  }
}

async function getLatestVersion() {
  const response = await fetch(
    "https://registry.npmjs.org/@mauricio.wolff/bit/latest",
  );
  if (!response.ok) {
    throw new Error("Failed to fetch latest version from npm");
  }
  const data = await response.json();
  return data.version;
}

export async function handleUpgradeCommand() {
  const spinner = ora("Checking for updates...").start();

  try {
    // Check if globally installed
    if (!(await isGloballyInstalled())) {
      spinner.fail("bit is not installed globally");
      console.log(kleur.yellow("\nInstall globally with:"));
      console.log(kleur.blue("  npm install -g @mauricio.wolff/bit"));
      process.exit(1);
    }

    // Get current and latest versions
    const current = await getCurrentVersion();
    const latest = await getLatestVersion();

    if (latest === current) {
      spinner.succeed("Already using the latest version!");
      return;
    }

    // Perform upgrade
    spinner.text = `Upgrading from ${current} to ${latest}...`;
    await execAsync("npm install -g @mauricio.wolff/bit@latest");

    spinner.succeed(
      `Successfully upgraded bit from ${kleur.yellow(current)} to ${kleur.green(latest)}`,
    );

    // Show what's new
    console.log("\nWhat's new:");
    try {
      const changelogUrl =
        "https://raw.githubusercontent.com/bitbonsai/bit/main/CHANGELOG.md";
      const changelogResponse = await fetch(changelogUrl);
      if (changelogResponse.ok) {
        const changelog = await changelogResponse.text();
        console.log(kleur.gray(changelog.split("\n").slice(0, 10).join("\n")));
      }
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
