# Rush Delivery

Rush Delivery is a Dagger module for Rush-based release workflows. It owns the
release path from source acquisition through detect, validate, build, package,
and deploy while keeping project-specific behavior in metadata.

Start here:

- [Documentation index](docs/README.md)
- [Public Dagger API](docs/api.md)
- [GitHub Action usage](docs/github-actions.md)
- [Entrypoints reference](docs/entrypoints.md)
- [Workflow guide](docs/workflows.md)
- [Metadata contracts](docs/metadata.md)
- [Provider adapters](docs/providers.md)
- [AI architecture notes](docs/ai/architecture.md)

Common local checks:

```sh
dagger call self-check
```

Recommended GitHub Actions usage wraps the Dagger workflow and prepares deploy
env/runtime files for you:

```yaml
- name: Rush Delivery
  uses: BootstrapLaboratory/rush-delivery@v0.3.0
  with:
    dry-run: "false"
    force-targets-json: ${{ inputs.force_targets_json || '[]' }}
    deploy-env: |
      CLOUDFLARE_API_TOKEN=${{ secrets.CLOUDFLARE_API_TOKEN }}
    runtime-file-map: |
      ${{ steps.auth.outputs.credentials_file_path }}=>gcp-credentials.json
```

Recommended CI usage clones the Rush repository inside Dagger from Git source
coordinates:

```sh
RUSH_DELIVERY_MODULE=github.com/OWNER/rush-delivery@VERSION

mkdir -p "$RUNNER_TEMP/rush-delivery-runtime-files"
cp "$GCP_CREDENTIALS_FILE" \
  "$RUNNER_TEMP/rush-delivery-runtime-files/gcp-credentials.json"

dagger -m "$RUSH_DELIVERY_MODULE" call workflow \
  --git-sha="$(git rev-parse HEAD)" \
  --event-name=workflow_call \
  --force-targets-json='["server","webapp"]' \
  --dry-run=true \
  --toolchain-image-provider=off \
  --rush-cache-provider=off \
  --source-mode=git \
  --source-repository-url="$SOURCE_REPOSITORY_URL" \
  --source-ref="$SOURCE_REF" \
  --source-auth-token-env=GITHUB_TOKEN \
  --runtime-files="$RUNNER_TEMP/rush-delivery-runtime-files"
```

For local runs against unpushed changes, pass the working tree explicitly:

```sh
dagger -m "$RUSH_DELIVERY_MODULE" call workflow \
  --repo=. \
  --git-sha="$(git rev-parse HEAD)" \
  --dry-run=true \
  --source-mode=local_copy
```
