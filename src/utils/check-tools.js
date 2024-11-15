import { exec } from 'child_process';
import { promisify } from 'util';
import ora from 'ora';

const execAsync = promisify(exec);

const tools = {
    node: {
        command: 'node --version',
        installGuide: 'Install Node.js from https://nodejs.org',
        required: ['new', 'dev', 'deploy']
    },
    docker: {
        command: 'docker --version',
        installGuide: 'Install Docker Desktop from https://www.docker.com/products/docker-desktop',
        required: ['dev', 'docker', 'deploy']
    },
    fly: {
        command: 'fly version',
        installGuide: 'Install fly CLI with: curl -L https://fly.io/install.sh | sh',
        required: ['deploy']
    }
};

export async function checkRequiredTools(command) {
    const spinner = ora('Checking required tools...').start();

    const requiredForCommand = Object.entries(tools)
        .filter(([_, tool]) => tool.required.includes(command));

    for (const [name, tool] of requiredForCommand) {
        try {
            await execAsync(tool.command);
            spinner.succeed(`${name} is available`);
        } catch (error) {
            spinner.fail(`${name} is not available`);
            console.log(`\nTo install ${name}:`);
            console.log(tool.installGuide);
            console.log('\nThen try again.');
            process.exit(1);
        }
    }
}

export async function checkDocker() {
    try {
        // Check if installed
        await execAsync('docker --version');

        // Check if daemon running
        await execAsync('docker info');
    } catch (error) {
        if (error.message.includes('Cannot connect to the Docker daemon')) {
            console.log('\nDocker is installed but not running.');
            console.log('Please start Docker Desktop and try again.');
            process.exit(1);
        }
        console.log('\nDocker is not installed.');
        console.log('Install Docker Desktop from https://www.docker.com/products/docker-desktop');
        process.exit(1);
    }
}
