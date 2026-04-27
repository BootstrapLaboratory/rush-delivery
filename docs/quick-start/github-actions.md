# GitHub Actions

Rush Delivery is a Dagger module for Rush-based release workflows. It owns the
release path from source acquisition through detect, validate, build, package,
and deploy while keeping project-specific behavior in metadata.

Use the GitHub Action for normal GitHub CI. It prepares the Dagger CLI, deploy
env file, runtime files bundle, Git source coordinates, and source auth token
plumbing for you.

Pin Rush Delivery to a released tag and advance that tag intentionally when you
want new behavior.

## Pull Request Validation

Use `entrypoint: validate` for PR CI. The action resolves the pull request
source through Git source mode, so the workflow does not need to check out the
repository for normal validation.

```yaml
name: ci-validate

on:
  pull_request:

permissions:
  contents: read

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: BootstrapLaboratory/rush-delivery@v0.3.3
        with:
          entrypoint: validate
```

## Release Workflow

Use the default `workflow` entrypoint for release CI.

```yaml
permissions:
  contents: write
  id-token: write
  packages: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - id: auth
        name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v3
        with:
          workload_identity_provider: ${{ vars.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account: ${{ vars.GCP_SERVICE_ACCOUNT }}

      - name: Rush Delivery
        uses: BootstrapLaboratory/rush-delivery@v0.3.3
        with:
          dry-run: "false"
          force-targets-json: ${{ inputs.force_targets_json || '[]' }}
          environment: prod
          deploy-tag-prefix: deploy/prod
          artifact-prefix: deploy-target
          toolchain-image-provider: github
          rush-cache-provider: github
          deploy-env: |
            GCP_PROJECT_ID=${{ vars.GCP_PROJECT_ID }}
            GCP_ARTIFACT_REGISTRY_REPOSITORY=${{ vars.GCP_ARTIFACT_REGISTRY_REPOSITORY }}
            GITHUB_ACTOR=${{ github.actor }}
            GITHUB_REPOSITORY=${{ github.repository }}
            GITHUB_TOKEN=${{ github.token }}
          runtime-file-map: |
            ${{ steps.auth.outputs.credentials_file_path }}=>gcp-credentials.json
```

Next, see [CI Using Command Line](ci-cli.md) if you want to call the module
directly from a custom CI script.

For the broader docs map, start from the [Introduction](../README.md).
