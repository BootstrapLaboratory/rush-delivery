# Provider Adapters

Rush Delivery keeps provider behavior behind explicit adapters. Local use works
with providers off; CI can opt into adapters by passing provider names and
credentials.

## Source Providers

`sourceMode=local_copy` copies the caller-provided `repo` directory into a
Dagger-owned workspace. Use it for local development, offline runs, and
unpushed changes. It requires `--repo`.

`sourceMode=git` clones or fetches the source from provider-neutral coordinates.
This is the recommended CI path and does not require `--repo`:

- `sourceRepositoryUrl`
- `sourceRef`
- `gitSha`
- `prBaseSha` when validating pull requests
- `sourceAuthTokenEnv` when private source access is required

The token value is read from the deploy environment file, not printed in logs.

## Toolchain Image Providers

`toolchainImageProvider=off` builds toolchain containers inside the current
Dagger run.

`toolchainImageProvider=github` uses GitHub Container Registry as an OCI image
store for content-addressed toolchain images. Image references are derived from
normalized runtime specs and provider metadata.

Use `toolchainImagePolicy=lazy` to pull an existing image or build and publish a
missing one.

## Rush Cache Providers

`rushCacheProvider=off` keeps Rush install behavior local to the current Dagger
engine.

`rushCacheProvider=github` stores a compressed Rush install cache archive in a
GHCR image. Cache keys are derived from configured metadata, key file contents,
cache paths, and the Rush workflow toolchain identity.

Use `rushCachePolicy=lazy` to restore an existing cache or publish a missing
cache after a successful install.

## Deploy Providers

Deploy providers are target-level concerns. A target runtime decides what
environment variables, file mounts, static env values, workspace paths, and
tooling it needs through deploy target metadata.

The framework only passes allowlisted data into each target runtime.

Deploy-only files should be passed through `runtimeFiles` and mounted from
target metadata. This keeps credentials out of source acquisition, Rush cache,
package artifacts, toolchain image hashes, logs, and generated manifests.

## CI Provider Responsibilities

A CI provider should provide:

- Dagger CLI availability.
- Source coordinates for Git source mode.
- A deploy environment file with provider credentials and project settings.
- A runtime files directory for deploy-only credential or config files when
  targets need file mounts.
- Optional Docker socket for targets that build container images.
- Permissions for any selected provider adapters.

The CI provider should not compute deploy plans, package artifacts, update
deploy tags, or encode target-specific behavior.
