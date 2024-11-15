import { exec } from "child_process";
import { promisify } from "util";
import chalk from "chalk";

const execAsync = promisify(exec);

const tools = {
  node: {
    command: "node --version",
    installGuide: "Install Node.js from https://nodejs.org",
    required: ["new", "dev", "deploy"],
  },
  docker: {
    command: "docker --version",
    installGuide:
      "Install Docker Desktop from https://www.docker.com/products/docker-desktop",
    required: ["dev", "docker", "deploy"],
  },
  fly: {
    command: "fly version",
    installGuide:
      "Install fly CLI with: curl -L https://fly.io/install.sh | sh",
    required: ["deploy"],
  },
};

export async function checkRequiredTools(command) {
  const requiredForCommand = Object.entries(tools).filter(([_, tool]) =>
    tool.required.includes(command),
  );

  for (const [name, tool] of requiredForCommand) {
    try {
      await execAsync(tool.command);
    } catch (error) {
      console.error(chalk.red(`\n${name} is not installed`));
      console.log("\nTo install:");
      console.log(chalk.blue(tool.installGuide));
      console.log("\nThen try again.");
      process.exit(1);
    }
  }
}
