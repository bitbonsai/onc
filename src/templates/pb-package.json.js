export default function generatePackageJson(projectName) {
  const containerName = `${projectName}-pb`; // Add -pb suffix for clarity

  return {
    name: projectName,
    private: true,
    version: "0.0.1",
    description: "PocketBase deployment with Docker and fly.io",
    scripts: {
      dev: "npm run docker:start || npm run docker:run",
      "docker:build": `docker build -t ${containerName} .`,
      "docker:run": `docker run --name ${containerName} -d -p 8090:8090 -v ./pb_data:/pb/pb_data -v ./pb_migrations:/pb/pb_migrations -v ./pb_hooks:/pb/pb_hooks ${containerName}`,
      "docker:start": `docker start ${containerName}`,
      "docker:stop": `docker stop ${containerName} || true`,
      "docker:rm": `docker rm ${containerName} || true`,
      "docker:rebuild":
        "npm run docker:stop && npm run docker:rm && npm run docker:build && npm run docker:run",
      "docker:logs": `docker logs ${containerName}`,
      "docker:logs:follow": `docker logs -f ${containerName}`,
      "docker:shell": `docker exec -it ${containerName} sh`,
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
