export default function generateGithubWorkflow() {
  return `
name: Deploy PocketBase
on:
  push:
    branches: [main]
    paths:
      - 'apps/pb/**'

jobs:
  deploy:
    name: Deploy PocketBase
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/pb
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: \${{ secrets.FLY_API_TOKEN }}
`.trim();
}
