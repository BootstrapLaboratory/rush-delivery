# Quick Start

Rush Delivery is a Dagger module for Rush-based release workflows. It owns the
release path from source acquisition through detect, validate, build, package,
and deploy while keeping project-specific behavior in metadata.

Use the GitHub Action for normal GitHub CI. Use the command-line form when you
want the same workflow from another CI provider or a custom runner script. Use
the local form when you need to test unpushed changes from your working tree.

## GitHub Actions

Pin Rush Delivery to a released tag and advance that tag intentionally when you
want new behavior.

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
        uses: BootstrapLaboratory/rush-delivery@v0.3.0
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

The action prepares the Dagger CLI, deploy env file, runtime files bundle, Git
source coordinates, and source auth token plumbing for you.

## CI Using Command Line

Use the raw Dagger command when your CI provider is not GitHub Actions, or when
you want to own all surrounding shell steps yourself.

```sh
RUSH_DELIVERY_MODULE=github.com/BootstrapLaboratory/rush-delivery@v0.3.0
RUNTIME_FILES_DIR="${RUNNER_TEMP}/rush-delivery-runtime-files"
DEPLOY_ENV_FILE="${RUNNER_TEMP}/dagger-deploy.env"
SOURCE_REPOSITORY_URL="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}.git"

mkdir -p "${RUNTIME_FILES_DIR}"
cp "${GCP_CREDENTIALS_FILE}" "${RUNTIME_FILES_DIR}/gcp-credentials.json"

cat > "${DEPLOY_ENV_FILE}" <<EOF
GCP_PROJECT_ID=${GCP_PROJECT_ID}
GITHUB_ACTOR=${GITHUB_ACTOR}
GITHUB_REPOSITORY=${GITHUB_REPOSITORY}
GITHUB_TOKEN=${GITHUB_TOKEN}
EOF

dagger -m "${RUSH_DELIVERY_MODULE}" call workflow \
  --git-sha="${GITHUB_SHA}" \
  --event-name="${GITHUB_EVENT_NAME}" \
  --force-targets-json="${FORCE_TARGETS_JSON:-[]}" \
  --deploy-tag-prefix=deploy/prod \
  --artifact-prefix=deploy-target \
  --environment=prod \
  --dry-run=false \
  --deploy-env-file="${DEPLOY_ENV_FILE}" \
  --toolchain-image-provider=github \
  --rush-cache-provider=github \
  --source-mode=git \
  --source-repository-url="${SOURCE_REPOSITORY_URL}" \
  --source-ref="${GITHUB_REF}" \
  --source-auth-token-env=GITHUB_TOKEN \
  --runtime-files="${RUNTIME_FILES_DIR}" \
  --docker-socket=/var/run/docker.sock
```

This mode clones the target repository inside Dagger, so the CI runner does not
need to mount the repository into the module.

## Local Runs Against Unpushed Changes

For local testing, pass the working tree explicitly. This keeps unpushed edits
available to Dagger and avoids relying on a remote Git ref that does not contain
your latest changes.

```sh
RUSH_DELIVERY_MODULE=github.com/BootstrapLaboratory/rush-delivery@v0.3.0

dagger -m "${RUSH_DELIVERY_MODULE}" call workflow \
  --repo=. \
  --git-sha="$(git rev-parse HEAD)" \
  --event-name=manual \
  --force-targets-json='[]' \
  --environment=prod \
  --dry-run=true \
  --toolchain-image-provider=off \
  --rush-cache-provider=off \
  --source-mode=local_copy
```

Keep live deploy credentials out of source. If a local live deploy needs files
such as cloud credentials, pass them through a runtime files directory and refer
to them from target metadata.

## Next Steps

- Read the [Introduction](README.md) for the docs map.
- Use [GitHub Action usage](github-actions.md) for all action inputs.
- Use [Metadata contracts](metadata.md) to define deploy targets and runtime
  requirements.
- Use the [Public Dagger API](api.md) when calling individual module functions.
