# Public Dagger API

When consuming this module from CI, prefer Git source mode so Dagger clones the
Rush repository internally. Use `--repo=.` only for local-copy runs against a
checked-out working tree.

```sh
RUSH_DELIVERY_MODULE=github.com/OWNER/rush-delivery@VERSION
```

GitHub Actions can use the root action wrapper instead of assembling the raw
command. See [GitHub Action usage](github-actions.md).

## Entrypoints

`workflow` is the normal release orchestrator. It resolves source, validates
metadata, computes the CI plan, builds selected deploy targets, packages their
artifacts, and deploys them in dependency order.

```sh
dagger -m "$RUSH_DELIVERY_MODULE" call workflow \
  --git-sha="$GIT_SHA" \
  --event-name=push \
  --dry-run=false \
  --deploy-env-file="$DEPLOY_ENV_FILE" \
  --runtime-files="$RUNTIME_FILES_DIR" \
  --source-mode=git \
  --source-repository-url="$SOURCE_REPOSITORY_URL" \
  --source-ref="$SOURCE_REF" \
  --source-auth-token-env=GITHUB_TOKEN
```

`self-check` is the framework health check. It runs the Dagger module
typecheck and unit tests from this repository.

```sh
dagger call self-check
```

`validate` runs pull-request validation for affected Rush projects and any
target-specific validation metadata.

```sh
dagger -m "$RUSH_DELIVERY_MODULE" call validate \
  --git-sha="$GIT_SHA" \
  --event-name=pull_request \
  --pr-base-sha="$PR_BASE_SHA" \
  --deploy-env-file="$DEPLOY_ENV_FILE" \
  --source-mode=git \
  --source-repository-url="$SOURCE_REPOSITORY_URL" \
  --source-ref="$SOURCE_REF" \
  --source-auth-token-env=GITHUB_TOKEN
```

For local validation against unpushed changes, use `--repo=.` with
`--source-mode=local_copy`.

See [Entrypoints reference](entrypoints.md) for every callable function,
including separate `detect`, `build`, `package`, `deploy`, metadata validation,
and diagnostic entrypoints.

## Key Inputs

`repo` is the caller's Rush repository directory for `sourceMode=local_copy`.
Git source mode does not require it.

`gitSha` is the commit being validated or released. It is required for Git
source mode.

`eventName`, `forceTargetsJson`, `prBaseSha`, and `deployTagPrefix` shape
detection. Forced targets are used by manual deploy wrappers.

`deployEnvFile` is a newline-delimited environment file. The framework reads it
once, then passes only target-allowed variables to runtime containers.

`runtimeFiles` is an optional directory of deploy-only files such as cloud
credentials, kubeconfig files, or signing material. Deploy target metadata can
mount files from this bundle without making them part of source, package
artifacts, cache keys, or toolchain image hashes.

`sourceMode` is `git` or `local_copy`. Git mode is the recommended CI path and
uses provider-neutral source coordinates. Local-copy mode needs `repo` and is
intended for local tests, offline runs, and unpushed changes.

`toolchainImageProvider` and `rushCacheProvider` are `off` by default. Provider
`github` enables GHCR-backed toolchain images or Rush install cache.

`dockerSocket` is optional. Live Cloud Run image builds need it; dry-runs and
non-Docker targets do not.

## Defaults

Local defaults favor portability: provider-off, dry-run enabled, and
`local_copy` source mode. CI should opt into provider adapters explicitly.
