export default function generateFlyToml(appName) {
  return `
app = "${appName}"

[http_service]
  type = "requests"
  soft_limit = 500
  hard_limit = 550

[mounts]
  source = "pbdata"
  destination = "/pb/pb_data"
`.trim();
}
