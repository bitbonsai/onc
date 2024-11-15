#!/usr/bin/env node
import meow from 'meow';
import process from 'node:process';
import { checkRequiredTools } from './utils/check-tools.js';

const cli = meow(`
  Usage
    $ gan <command> [options]

  Commands
    new [name]      Create a new project
    dev            Start development environment
    docker         Docker related commands
    db             Database related commands
    deploy         Deploy to fly.io

  Options
    --help         Show this help message
    --version      Show version number

  Examples
    $ gan new my-awesome-app
    $ gan dev
    $ gan deploy

  For more info, visit:
    https://github.com/yourusername/gan
`, {
    importMeta: import.meta,
    flags: {
        // We'll add flags later as needed
    },
    description: false,
    // Using built-in Node.js colors
    booleanDefault: undefined,
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
