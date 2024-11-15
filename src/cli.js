#!/usr/bin/env node
import meow from "meow";
import kleur from "kleur";
import process from "node:process";
import { checkRequiredTools } from "./utils/check-tools.js";

const cli = meow(
  `
  ${kleur.cyan("🌱 onc")}  ${kleur.gray("One Nice CLI")}

  ${kleur.bold("Usage:")}
    ${kleur.green("$")} onc <command> [options]

  ${kleur.bold("Commands:")}
    ${kleur.blue("new")} [name]      Create a new project
    ${kleur.blue("dev")}            Start development environment
    ${kleur.blue("docker")}         Docker related commands
    ${kleur.blue("db")}             Database related commands
    ${kleur.blue("deploy")}         Deploy to fly.io

  ${kleur.bold("Options:")}
    ${kleur.magenta("--help")}        Show this help message
    ${kleur.magenta("--version")}     Show version number

  ${kleur.bold("Examples:")}
    ${kleur.green("$")} onc new my-awesome-app
    ${kleur.green("$")} onc dev
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
  const args = cli.input.slice(1);

  if (!command) {
    cli.showHelp(0);
    process.exit(0);
  }

  // Check required tools before executing command
  await checkRequiredTools(command);

  switch (command) {
    case "new": {
      console.log(kleur.cyan("Creating new project..."));
      break;
    }
    case "dev": {
      console.log(kleur.cyan("Starting development environment..."));
      break;
    }
    case "deploy": {
      console.log(kleur.cyan("Deploying..."));
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
