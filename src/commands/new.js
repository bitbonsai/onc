import { mkdir, writeFile } from "fs/promises";
import kleur from "kleur";
import ora from "ora";
import fetch from "node-fetch";
import { exec, spawn } from "child_process";
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

    return new Promise((resolve, reject) => {
      const process = spawn(
        "npx",
        [
          "create-astro@latest",
          "--template",
          "minimal",
          "--install",
          "--no-git",
          "--skip-houston",
          "--yes",
          ".",
        ],
        {
          cwd: `${projectPath}/apps/web`,
          stdio: "inherit", // This will show the output directly
          shell: true,
        },
      );

      process.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Astro creation failed with code ${code}`));
        }
      });

      process.on("error", (err) => {
        reject(new Error(`Failed to start Astro creation: ${err.message}`));
      });
    });
  } catch (error) {
    throw new Error(`Failed to create Astro app: ${error.message}`);
  }
}

export async function createProject(name) {
  const spinner = ora("Creating project...").start();
  const projectPath = `./${name}`;

  try {
    // Create root directory
    await mkdir(projectPath);
    await mkdir(`${projectPath}/apps`);

    // Create PocketBase setup
    await createPocketBase(projectPath, name, spinner);
    spinner.succeed("PocketBase setup completed");

    // Create Astro app
    await createAstro(projectPath, spinner);
    spinner.succeed("Astro setup completed");

    // Final success message with CLI-based instructions
    console.log("\n" + kleur.bold("Project created successfully! 🎉"));

    console.log("\n" + kleur.bold("Next steps:"));
    console.log(kleur.blue(`  cd ${name}`));
    console.log(kleur.blue("  bit pb setup    # First-time PocketBase setup"));
    console.log(kleur.blue("  bit pb start    # Start PocketBase"));
    console.log(
      kleur.blue("  bit start       # Start both PocketBase and Astro"),
    );

    console.log("\n" + kleur.bold("Available endpoints:"));
    console.log("PocketBase:  " + kleur.green("http://localhost:8090"));
    console.log("Admin UI:    " + kleur.green("http://localhost:8090/_/"));
    console.log("Astro:       " + kleur.green("http://localhost:4321"));

    console.log("\n" + kleur.bold("Project structure:"));
    console.log(kleur.blue(`${name}/`));
    console.log(kleur.blue("├── apps/"));
    console.log(kleur.blue("│   ├── web/          # Astro app"));
    console.log(kleur.blue("│   │   ├── src/"));
    console.log(kleur.blue("│   │   │   ├── components/"));
    console.log(kleur.blue("│   │   │   ├── layouts/"));
    console.log(kleur.blue("│   │   │   └── pages/"));
    console.log(kleur.blue("│   │   └── package.json"));
    console.log(kleur.blue("│   └── pb/           # PocketBase"));
    console.log(kleur.blue("│       ├── pb_data/"));
    console.log(kleur.blue("│       ├── pb_migrations/"));
    console.log(kleur.blue("│       ├── pb_hooks/"));
    console.log(kleur.blue("│       ├── Dockerfile"));
    console.log(kleur.blue("│       └── package.json"));
    console.log(kleur.blue("└── .github/"));
    console.log(kleur.blue("    └── workflows/"));
    console.log(kleur.blue("        └── deploy_pocketbase.yml"));
  } catch (error) {
    spinner.fail(kleur.red("Failed to create project"));
    console.error(kleur.red(error.message));
    process.exit(1);
  }
}
