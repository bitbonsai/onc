export default function generateReadme(projectName) {
  return `
# ${projectName}

> Full-stack web application with Astro and PocketBase

## Development

\`\`\`bash
# Start PocketBase
npm run dev

# PocketBase Admin UI
http://localhost:8090/_/
\`\`\`

## Project Structure

\`\`\`
${projectName}/
├── apps/
│   ├── web/          # Astro app
│   └── pb/           # PocketBase
│       ├── pb_data/
│       ├── pb_migrations/
│       └── pb_hooks/
└── .github/
    └── workflows/
        └── deploy_pocketbase.yml
\`\`\`

## Deployment

Deployed to fly.io via GitHub Actions.
`.trim();
}
