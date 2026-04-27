# Deploy Targets

Deploy target metadata tells Rush Delivery how to run a target-specific deploy
script in a Dagger container. The example target files live in
`.dagger/deploy/targets`.

Each target has two main parts:

- `deploy_script`
- `runtime`

## Deploy Script

The deploy script is product-owned executable behavior. In the example:

- `server` runs `deploy/cloudrun/scripts/deploy-server.sh`
- `webapp` runs `deploy/cloudflare-pages/scripts/deploy-webapp.sh`

Rush Delivery prepares the runtime, mounts the package artifact, passes allowed
environment, then executes the script.

## Runtime Image And Workspace

The runtime image is the base container for deployment.

The workspace section limits which repository paths are visible to the deploy
runtime. For the backend, the example includes the deploy bundle, deploy
scripts, smoke tests, and Dockerfile. For the webapp, it includes the static
output and Cloudflare deploy scripts.

Use a narrow workspace. It keeps deploy containers smaller and avoids
accidentally depending on unrelated files.

## Runtime Install Commands

Install commands prepare provider tooling. The backend runtime installs Docker
CLI and Google Cloud CLI. The webapp runtime installs Git and uses Wrangler from
the deploy script.

These commands also participate in toolchain image hashing. If the commands
change, Rush Delivery derives a new toolchain image tag.

## Environment

`pass_env` lists environment variables that Rush Delivery may pass from the
deploy env file into the runtime. Static `env` values are set directly by
metadata.

The backend uses static env to point cloud SDKs at the mounted credentials file:

```yaml
env:
  GOOGLE_APPLICATION_CREDENTIALS: /runtime-files/gcp-credentials.json
```

The live value of the credentials file never lives in source. It is copied into
the action runtime files bundle and mounted by metadata.

## Dry-Run Defaults

`dry_run_defaults` make dry-runs useful without requiring production secrets.
Every required `pass_env` value that is not available in dry-run mode should
have a harmless placeholder.

Dry-runs should show what would happen, not accidentally deploy.

## Runtime Files

Runtime files are late-bound deploy-only files. The example maps the Google
auth file in GitHub Actions:

```yaml
runtime-file-map: |
  ${{ steps.auth.outputs.credentials_file_path }}=>gcp-credentials.json
```

The backend metadata mounts it with:

```yaml
file_mounts:
  - source: gcp-credentials.json
```

Runtime files are not source, cache inputs, package artifacts, or toolchain
image inputs.

## Checklist

- Keep deploy scripts in the product repository.
- Mount only the workspace paths the script needs.
- Put provider tooling in runtime install commands.
- Use `pass_env` as an allowlist.
- Use `dry_run_defaults` for harmless dry-run values.
- Use runtime files for credentials and other deploy-only files.

Next: [Validation Targets](08-validation-targets.md).
