# GitHub Actions

The example repository uses GitHub Actions as a thin Rush Delivery adapter. The
workflows do not calculate deploy plans or run Rush directly. They provide
permissions, credentials, env, runtime files, and action inputs.

## Pull Request Validation

The PR workflow uses the `validate` entrypoint:

```yaml
permissions:
  contents: read
  packages: read

steps:
  - uses: BootstrapLaboratory/rush-delivery@v0.4.1
    with:
      entrypoint: validate
      toolchain-image-provider: github
      rush-cache-provider: github
```

No checkout step is needed for normal PR validation. The action passes Git
source coordinates to Dagger, and Rush Delivery acquires the source inside the
Dagger workflow.

`packages: read` is enough because the validate defaults use `pull-or-build`,
which never publishes provider artifacts.

## Main Release Workflow

The main workflow runs on pushes to `main` and can also be called by manual
force-deploy workflows.

The job needs stronger permissions:

```yaml
permissions:
  contents: write
  id-token: write
  packages: write
```

The example authenticates to Google Cloud before calling Rush Delivery, then
passes the generated credentials file as a runtime file:

```yaml
runtime-file-map: |
  ${{ steps.auth.outputs.credentials_file_path }}=>gcp-credentials.json
```

The deploy env block passes product settings and provider secrets:

```yaml
deploy-env: |
  GCP_PROJECT_ID=${{ vars.GCP_PROJECT_ID }}
  CLOUDFLARE_API_TOKEN=${{ secrets.CLOUDFLARE_API_TOKEN }}
```

Rush Delivery reads the deploy env file once, then only passes variables that
target metadata allows through `pass_env`.

## Forced Deploy Workflows

The example has small manual workflows for single-target deploys. They reuse
the main workflow and pass `force_targets_json`:

```yaml
with:
  force_targets_json: '["server"]'
```

This keeps the deployment path identical. Manual deploys still use the same
metadata, provider settings, runtime files, package logic, and deploy mesh.

## Version Pinning

Pin Rush Delivery to a released tag:

```yaml
uses: BootstrapLaboratory/rush-delivery@v0.4.1
```

Advance the tag intentionally when you want new behavior. Do not use an
unversioned branch in production CI.

## Checklist

- PR workflow uses `contents: read` and `packages: read`.
- PR workflow uses validate defaults or explicit `pull-or-build` policies.
- Release workflow uses `packages: write`.
- Runtime files carry credential files.
- Deploy env carries settings and secrets.
- Manual force deploy workflows reuse the main workflow.

Next: [Local Dry Runs](10-local-dry-runs.md).
