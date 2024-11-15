export default function generateGitignore() {
  return `
pb_data/*
!pb_data/.gitignore

node_modules/
npm-debug.log*

.env
.env.local
.env.*.local

.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
`.trim();
}
