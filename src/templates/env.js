export default function generateEnvFiles() {
  const envLocal = `
# Local Development
PB_ADMIN_EMAIL=
PB_ADMIN_PASSWORD=
FLY_API_TOKEN=
`.trim();

  const envExample = `
# Copy this to .env.local and fill in values
PB_ADMIN_EMAIL=admin@example.com
PB_ADMIN_PASSWORD=your_password
FLY_API_TOKEN=your_token
`.trim();

  return { envLocal, envExample };
}
