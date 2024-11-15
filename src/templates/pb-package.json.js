// templates/pb-package.json.js
export default function generatePackageJson(projectName) {
  return {
    name: projectName,
    private: true,
    version: "0.0.1",
    description: "PocketBase deployment with Docker and fly.io",
    scripts: {
      // Development
      dev: "npm run docker:start || npm run docker:run",
      predev: "npm run docker:stop || true",

      // Docker commands
      "docker:build": `docker build -t ${projectName} .`,
      "docker:run": `docker run --name ${projectName} -d -p 8090:8090 -v ./pb_data:/pb/pb_data -v ./pb_migrations:/pb/pb_migrations -v ./pb_hooks:/pb/pb_hooks ${projectName}`,
      "docker:start": `docker start ${projectName}`,
      "docker:stop": `docker stop ${projectName} || true`,
      "docker:rm": `docker rm ${projectName} || true`,
      "docker:rebuild":
        "npm run docker:stop && npm run docker:rm && npm run docker:build && npm run docker:run",
      "docker:logs": `docker logs ${projectName}`,
      "docker:logs:follow": `docker logs -f ${projectName}`,
      "docker:shell": `docker exec -it ${projectName} sh`,

      // Database commands
      "db:studio": "open http://localhost:8090/_/",
      "db:backup": `docker exec ${projectName} cp /pb/pb_data/data.db /pb/pb_data/backup_$(date +%Y%m%d_%H%M%S).db`,
      "db:migrate:create":
        "echo 'migration_name_here' > ./pb_migrations/$(date +%Y%m%d_%H%M%S)_migration.js",

      // Deployment
      deploy: "fly deploy",
    },
    keywords: ["pocketbase", "fly", "CMS", "deployment", "CI/CD"],
    license: "MIT",
  };
}
