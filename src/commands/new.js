import { mkdir, writeFile } from "fs/promises";
import kleur from "kleur";
import ora from "ora";
import fetch from "node-fetch";
import generatePackageJson from "../templates/pb-package.json.js";
import generateDockerfile from "../templates/dockerfile.js";
import generateFlyToml from "../templates/fly.toml.js";

async function getLatestPocketBaseVersion() {
  try {
    const response = await fetch(
      "https://api.github.com/repos/pocketbase/pocketbase/releases/latest",
    );
    const data = await response.json();
    return data.tag_name.replace("v", "");
  } catch (error) {
    return "0.22.25";
  }
}

export async function createProject(name) {
  const spinner = ora("Creating project...").start();

  try {
    // Create directory structure
    spinner.text = "Creating directories...";
    await mkdir(`${name}/apps/pb/pb_migrations`, { recursive: true });
    await mkdir(`${name}/apps/pb/pb_hooks`, { recursive: true });
    await mkdir(`${name}/apps/pb/pb_data`, { recursive: true });
    await mkdir(`${name}/.github/workflows`, { recursive: true });

    // Create .gitkeep files
    await writeFile(`${name}/apps/pb/pb_migrations/.gitkeep`, "");
    await writeFile(`${name}/apps/pb/pb_hooks/.gitkeep`, "");

    // Get PocketBase version
    spinner.text = "Fetching latest PocketBase version...";
    const pbVersion = await getLatestPocketBaseVersion();

    // Generate configuration files
    spinner.text = "Generating configuration files...";

    const files = [
      [`${name}/apps/pb/package.json`, generatePackageJson(name)],
      [`${name}/apps/pb/Dockerfile`, generateDockerfile(pbVersion)],
      [`${name}/apps/pb/fly.toml`, generateFlyToml(name)],
    ];

    // Write all files
    await Promise.all(
      files.map(([path, content]) =>
        writeFile(
          path,
          typeof content === "string"
            ? content
            : JSON.stringify(content, null, 2),
        ),
      ),
    );

    spinner.succeed(kleur.green(`Project ${name} created successfully`));

    // Show next steps
    console.log("\n" + kleur.bold("Next steps:"));
    console.log(kleur.blue(`  cd ${name}/apps/pb`));
    console.log(kleur.blue("  npm install"));
    console.log("\n" + kleur.bold("Build and run the Docker container:"));
    console.log(kleur.blue("  npm run docker:build"));
    console.log(kleur.blue("  npm run docker:run"));

    console.log(
      "\nPocketBase will be available at: " +
        kleur.green("http://localhost:8090"),
    );
    console.log(
      "Admin UI will be available at: " +
        kleur.green("http://localhost:8090/_/"),
    );
  } catch (error) {
    spinner.fail(kleur.red("Failed to create project"));
    console.error(kleur.red(error.message));
    process.exit(1);
  }
}
