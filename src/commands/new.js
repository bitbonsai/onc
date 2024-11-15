import { mkdir, writeFile } from "fs/promises";
import kleur from "kleur";
import ora from "ora";
import fetch from "node-fetch";
import { exec } from "child_process";
import { promisify } from "util";
import generatePackageJson from "../templates/pb-package.json.js";
import generateDockerfile from "../templates/dockerfile.js";
import generateFlyToml from "../templates/fly.toml.js";

const execAsync = promisify(exec);

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

async function createPocketBase(projectPath, projectName, spinner) {
  // Create PocketBase directories
  spinner.text = "Creating PocketBase directories...";
  await mkdir(`${projectPath}/apps/pb/pb_migrations`, { recursive: true });
  await mkdir(`${projectPath}/apps/pb/pb_hooks`, { recursive: true });
  await mkdir(`${projectPath}/apps/pb/pb_data`, { recursive: true });
  await mkdir(`${projectPath}/.github/workflows`, { recursive: true });

  // Create .gitkeep files
  await writeFile(`${projectPath}/apps/pb/pb_migrations/.gitkeep`, "");
  await writeFile(`${projectPath}/apps/pb/pb_hooks/.gitkeep`, "");

  // Get PocketBase version
  spinner.text = "Fetching latest PocketBase version...";
  const pbVersion = await getLatestPocketBaseVersion();

  // Generate configuration files
  spinner.text = "Generating PocketBase configuration files...";
  const files = [
    [`${projectPath}/apps/pb/package.json`, generatePackageJson(projectName)],
    [`${projectPath}/apps/pb/Dockerfile`, generateDockerfile(pbVersion)],
    [`${projectPath}/apps/pb/fly.toml`, generateFlyToml(projectName)],
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
}

async function createAstro(projectPath, spinner) {
  spinner.text = "Creating Astro app...";
  try {
    // Create web directory
    await mkdir(`${projectPath}/apps/web`, { recursive: true });

    // Initialize Astro with npm create
    const command =
      "npm create astro@latest apps/web -- --template minimal --install --no-git --typescript strict --skip-houston";
    await execAsync(command, {
      cwd: projectPath,
      stdio: "inherit",
    });

    spinner.succeed("Astro app created successfully");
  } catch (error) {
    throw new Error(`Failed to create Astro app: ${error.message}`);
  }
}

export async function createProject(name) {
  const spinner = ora("Creating project...").start();
  const projectPath = `./${name}`;

  try {
    // Create root project directory
    await mkdir(projectPath);
    await mkdir(`${projectPath}/apps`);

    // Create PocketBase setup
    await createPocketBase(projectPath, name, spinner);
    spinner.succeed("PocketBase setup completed");

    // Create Astro app
    await createAstro(projectPath, spinner);

    // Final success message
    console.log("\n" + kleur.bold("Project created successfully! Next steps:"));

    // PocketBase instructions
    console.log("\n" + kleur.bold("Start PocketBase:"));
    console.log(kleur.blue(`  cd ${name}/apps/pb`));
    console.log(kleur.blue("  npm install"));
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

    // Astro instructions
    console.log("\n" + kleur.bold("Start Astro dev server:"));
    console.log(kleur.blue(`  cd ${name}/apps/web`));
    console.log(kleur.blue("  npm run dev"));
    console.log(
      "\nAstro will be available at: " + kleur.green("http://localhost:3000"),
    );
  } catch (error) {
    spinner.fail(kleur.red("Failed to create project"));
    console.error(kleur.red(error.message));
    process.exit(1);
  }
}
