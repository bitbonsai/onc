export default function generateDockerignore() {
  return `
.git
.gitignore
node_modules
pb_data
README.md
`.trim();
}
