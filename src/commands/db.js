import { exec } from "child_process";
import { promisify } from "util";
import kleur from "kleur";
import ora from "ora";
import open from "open";

const execAsync = promisify(exec);

export async function handleDbCommand(subcommand, args) {
  const spinner = ora().start();

  try {
    switch (subcommand) {
      case "studio": {
        spinner.text = "Opening PocketBase Admin UI...";
        await open("http://localhost:8090/_/");
        spinner.succeed("Admin UI opened in browser");
        break;
      }
      case "backup": {
        spinner.text = "Creating database backup...";
        await execAsync("npm run db:backup");
        spinner.succeed("Database backup created successfully");
        break;
      }
      case "migrate": {
        spinner.text = "Creating migration...";
        await execAsync("npm run db:migrate:create");
        spinner.succeed("Migration file created successfully");
        break;
      }
      default: {
        spinner.fail(kleur.red(`Unknown database command: ${subcommand}`));
        process.exit(1);
      }
    }
  } catch (error) {
    spinner.fail(kleur.red(error.message));
    process.exit(1);
  }
}
