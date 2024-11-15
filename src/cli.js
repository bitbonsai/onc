#!/usr/bin/env node
import meow from 'meow';
import chalk from 'chalk';
import process from 'node:process';
import { checkRequiredTools } from './utils/check-tools.js';

const cli = meow(`
  ${chalk.cyan('🌱 gan')}  ${chalk.gray('Generate App Now')}

  ${chalk.bold('Usage:')}
    ${chalk.green('$')} gan <command> [options]

  ${chalk.bold('Commands:')}
    ${chalk.blue('new')} [name]      Create a new project
    ${chalk.blue('dev')}            Start development environment
    ${chalk.blue('docker')}         Docker related commands
    ${chalk.blue('db')}             Database related commands
    ${chalk.blue('deploy')}         Deploy to fly.io

  ${chalk.bold('Options:')}
    ${chalk.magenta('--help')}        Show this help message
    ${chalk.magenta('--version')}     Show version number

  ${chalk.bold('Examples:')}
    ${chalk.green('$')} gan new my-awesome-app
    ${chalk.green('$')} gan dev
    ${chalk.green('$')} gan deploy

  ${chalk.gray('For more info, visit: https://github.com/bitbonsai/gan')}
`, {
    importMeta: import.meta,
    flags: {
        // We'll add flags later as needed
    },
    description: false,
});

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
        case 'new': {
            console.log('\x1b[36m%s\x1b[0m', 'Creating new project...'); // Cyan
            break;
        }
        case 'dev': {
            console.log('\x1b[36m%s\x1b[0m', 'Starting development environment...'); // Cyan
            break;
        }
        case 'deploy': {
            console.log('\x1b[36m%s\x1b[0m', 'Deploying...'); // Cyan
            break;
        }
        default: {
            console.log('\x1b[31m%s\x1b[0m', `Unknown command: ${command}`); // Red
            cli.showHelp(0);
            process.exit(1);
        }
    }
}

run().catch(error => {
    console.error('\x1b[31m%s\x1b[0m', 'Error:', error.message); // Red
    process.exit(1);
});
