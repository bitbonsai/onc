#!/usr/bin/env node
import meow from "meow";
import chalk from "chalk";
import process from "node:process";
import { checkRequiredTools } from "./utils/check-tools.js";
import { createProject } from "./commands/new.js";

const cli = meow(
  `
  ${chalk.cyan("🌱 onc")}  ${chalk.gray("Generate App Now")}

  ${chalk.bold("Usage:")}
    ${chalk.green("$")} onc <command> [options]

  ${chalk.bold("Commands:")}
    ${chalk.blue("new")} [name]      Create a new project
    ${chalk.blue("dev")}            Start development environment
    ${chalk.blue("docker")}         Docker related commands
    ${chalk.blue("db")}             Database related commands
    ${chalk.blue("deploy")}         Deploy to fly.io

  ${chalk.bold("Options:")}
    ${chalk.magenta("--help")}        Show this help message
    ${chalk.magenta("--version")}     Show version number

  ${chalk.bold("Examples:")}
    ${chalk.green("$")} onc new my-awesome-app
    ${chalk.green("$")} onc dev
    ${chalk.green("$")} onc deploy

  ${chalk.gray("For more info, visit: https://github.com/bitbonsai/onc")}
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
      const projectName = args[0];
      if (!projectName) {
        console.error(chalk.red("Project name is required"));
        process.exit(1);
      }
      await createProject(projectName);
      break;
    }
    // ... rest of cases
  }
}

run().catch((error) => {
  console.error("\x1b[31m%s\x1b[0m", "Error:", error.message); // Red
  process.exit(1);
});
