# Add Validate Provider Policies

## Goal

Make PR validation reuse the same provider-aware Rush setup as the release
workflow while keeping PR package permissions read-only by default. Validation
should pull existing toolchain images and Rush install caches when available,
build locally on misses, and avoid publishing from PR jobs unless the caller
explicitly chooses a publishing policy.

## Target User Shape

```yaml
name: ci-validate

on:
  pull_request:

permissions:
  contents: read
  packages: read

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: BootstrapLaboratory/rush-delivery@v0.3.4
        with:
          entrypoint: validate
          toolchain-image-provider: github
          toolchain-image-policy: pull-or-build
          rush-cache-provider: github
          rush-cache-policy: pull-or-build
```

Trusted release workflows keep publishing behavior:

```yaml
permissions:
  contents: write
  packages: write

with:
  toolchain-image-provider: github
  toolchain-image-policy: lazy
  rush-cache-provider: github
  rush-cache-policy: lazy
```

## Plan

- [x] Add `pull-or-build` policy support for toolchain images:
      pull an existing image when present, build locally on missing image, and
      never publish.
- [x] Add `pull-or-build` policy support for Rush install cache:
      restore an existing cache when present, run install locally on missing
      cache, and never publish.
- [x] Leave current `lazy` behavior unchanged for trusted workflows.
- [x] Keep `off` behavior unchanged.
- [x] Extend the public `validate` Dagger function with
      `toolchainImageProvider`, `toolchainImagePolicy`, `rushCacheProvider`,
      and `rushCachePolicy` inputs.
- [x] Forward provider and policy inputs from the GitHub Action when
      `entrypoint=validate`.
- [x] Refactor shared Rush setup so `workflow` and `validate` use the same
      provider parsing, metadata loading, toolchain resolution, Rush cache
      resolution, Rush install, and publish/no-publish policy decisions where
      their flows overlap.
- [x] Preserve logical differences:
      `workflow` still detects, builds, packages, and deploys; `validate` still
      detects PR validation targets and runs validation stages only.
- [x] Add tests for:
      toolchain `pull-or-build`, Rush cache `pull-or-build`, `lazy` publish
      compatibility, validate action args, and provider option parsing.
- [x] Update README, GitHub Action docs, Public API docs, Entrypoints docs, and
      quick-start material with read-only PR validation provider settings.
- [x] Run validation:
      `npm test`, `npm run typecheck`, `npm run site:docusaurus:check`,
      `npm run site:check`, `git diff --check`, and `trunk check -a -y`.

## Notes

- Current `validate` does source acquisition but does not use the provider-aware
  Rush setup path that `workflow` uses.
- Toolchain images and Rush install caches are already content-addressed with
  `sha256-*` tags, so publishing misses should not overwrite unrelated release
  artifacts. The new policy is still needed so PR jobs can run with
  `packages: read`.
- `pull-or-build` is intentionally different from a fail-on-miss read-only
  policy. It optimizes PR speed when artifacts exist but remains functional
  when they do not.
