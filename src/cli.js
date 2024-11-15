#!/usr/bin/env node
import meow from "meow";
import kleur from "kleur";
import process from "node:process";
import { checkRequiredTools } from "./utils/check-tools.js";
import { createProject } from "./commands/new.js";
import { handleDockerCommand } from "./commands/docker.js";
import { handleDbCommand } from "./commands/db.js";

const cli = meow(
  `
  ${kleur.cyan("🌱 onc")}  ${kleur.gray("One Nice CLI")}

  ${kleur.bold("Usage:")}
    ${kleur.green("$")} onc <command> [options]

  ${kleur.bold("Commands:")}
    ${kleur.blue("new")} [name]      Create a new project
    ${kleur.blue("dev")}            Start development environment

    ${kleur.bold("Docker Commands:")}
    ${kleur.blue("docker build")}    Build Docker image
    ${kleur.blue("docker up")}       Start container
    ${kleur.blue("docker down")}     Stop container
    ${kleur.blue("docker logs")}     Show container logs
    ${kleur.blue("docker shell")}    Access container shell

    ${kleur.bold("Database Commands:")}
    ${kleur.blue("db studio")}       Open PocketBase Admin UI
    ${kleur.blue("db backup")}       Create database backup
    ${kleur.blue("db migrate")}      Create new migration

    ${kleur.blue("deploy")}         Deploy to fly.io

  ${kleur.bold("Examples:")}
    ${kleur.green("$")} onc new my-awesome-app
    ${kleur.green("$")} onc docker logs
    ${kleur.green("$")} onc db studio
    ${kleur.green("$")} onc deploy

  ${kleur.gray("For more info, visit: https://github.com/bitbonsai/onc")}
`,
  {
    importMeta: import.meta,
    flags: {
      // We'll add flags later as needed
    },
    description: false,
  },
);

async function run() {
  const command = cli.input[0];
  const subcommand = cli.input[1];
  const args = cli.input.slice(2);

  if (!command) {
    cli.showHelp(0);
    process.exit(0);
  }

  // Check required tools before executing command
  await checkRequiredTools(command);

  switch (command) {
    case "new": {
      const projectName = subcommand;
      if (!projectName) {
        console.error(kleur.red("Project name is required"));
        process.exit(1);
      }
      await createProject(projectName);
      break;
    }
    case "docker": {
      if (!subcommand) {
        console.error(kleur.red("Docker subcommand is required"));
        console.log(kleur.blue("\nAvailable commands:"));
        console.log("  build    Build Docker image");
        console.log("  up       Start container");
        console.log("  down     Stop container");
        console.log("  logs     Show container logs");
        console.log("  shell    Access container shell");
        process.exit(1);
      }
      await handleDockerCommand(subcommand, args);
      break;
    }
    case "db": {
      if (!subcommand) {
        console.error(kleur.red("Database subcommand is required"));
        console.log(kleur.blue("\nAvailable commands:"));
        console.log("  studio   Open PocketBase Admin UI");
        console.log("  backup   Create database backup");
        console.log("  migrate  Create new migration");
        process.exit(1);
      }
      await handleDbCommand(subcommand, args);
      break;
    }
    case "dev": {
      console.log(kleur.cyan("Starting development environment..."));
      // TODO: Implement dev command
      break;
    }
    case "deploy": {
      console.log(kleur.cyan("Deploying..."));
      // TODO: Implement deploy command
      break;
    }
    default: {
      console.log(kleur.red(`Unknown command: ${command}`));
      cli.showHelp(0);
      process.exit(1);
    }
  }
}

run().catch((error) => {
  console.error(kleur.red("Error:"), error.message);
  process.exit(1);
});
