# 🌱 gan

> **G**enerate **A**pp **N**ow - A simple CLI for building web apps

Built by [BitBonsai](https://github.com/bitbonsai)

## What's this?

Just a tiny tool to help you spin up web projects faster. No magic, just convenience.

## Global Installation

### npm

```bash
npm install -g gan
```

### yarn

```bash
yarn global add gan
```

### pnpm

```bash
pnpm add -g gan
```

## Quick Start

**# Create a project**

```bash
gan new my-cool-project
```

**# Run local development**

```bash
gan dev
```

**# Deploy to production**

```bash
gan deploy
```

## What You Get

- 🚀 Astro.js project
- 📦 PocketBase database
- 🐳 Docker setup
- 🚢 fly.io deployment config

## Commands That Actually Work

- `gan new` - Start a new project
- `gan dev` - Run local development
- `gan docker` - Docker-related commands
- `gan db` - Database management
- `gan deploy` - Ship it to production

## Project Structure

```
my-project/
├── apps/
│   ├── web/    # Your Astro app
│   └── pb/     # PocketBase setup
└── .github/
    └── workflows/
        └── deploy_pocketbase.yml  # Automated deployment
```

## Automated Deployment

Our GitHub Actions workflow automates the deployment of your PocketBase backend to fly.io. Here's what it does:

- 🔍 Triggers on pushes to the `main` branch
- 🚢 Deploys only when changes are made to the PocketBase directory
- 🛡️ Uses a secure, revocable deployment token
- 🤖 Completely hands-off deployment process

### Workflow Configuration

```yaml
name: Deploy PocketBase
on:
  push:
    branches: [main]
    paths:
      - "apps/pb/**"

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
```

## Setting Up Deployment Token

1. Generate a fly.io deployment token

```bash
fly tokens create deploy
```

2. Add the token to your GitHub repository:

   - Go to your GitHub repository
   - Navigate to Settings → Secrets → Actions
   - Create a new repository secret
   - Name the secret: `FLY_API_TOKEN`
   - Paste the token from fly.io

## Why Another Tool?

Because setting up projects shouldn't feel like homework.

## Contributing

Found a bug? Open an issue.

Want a feature? Send a PR.

No complicated guidelines. Just be cool.

## License

MIT © BitBonsai
