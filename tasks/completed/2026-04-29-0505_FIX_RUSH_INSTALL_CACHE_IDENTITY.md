# Fix Rush Install Cache Identity

## Context

Rush install cache currently uses a content-addressed GHCR image tag derived
from project key files, cache paths, and toolchain identity. That makes cache
reuse brittle: if Rush, PNPM, or package-manager behavior changes how install
state is calculated, the module can miss an otherwise useful cache before Rush
has a chance to reconcile it.

The cache should behave like a reusable mutable install-state snapshot:
restore the latest project cache when it exists, run `rush install`, and publish
an updated snapshot only from trusted workflows.

## Decisions

- Keep the public module provider/policy API shape.
- Stop using dependency key-file contents as the GHCR cache artifact identity.
- Use a stable per-project Rush install cache reference for restore.
- Preserve `lazy` as trusted workflow behavior: restore, install, publish.
- Preserve `pull-or-build` as PR behavior: restore, install, do not publish.
- Prefer action-level defaults for `entrypoint=validate` so PR users get safe
  read-only cache/image policies without repeating both policy inputs.

## Checklist

- [x] Replace Rush install cache reference tagging with a stable cache tag.
- [x] Keep metadata version available as an explicit manual cache namespace bump.
- [x] Keep restore-before-install behavior for both trusted workflow and PR validation.
- [x] Ensure `lazy` publishes the post-install cache even when restore succeeded.
- [x] Ensure `pull-or-build` never publishes the post-install cache.
- [x] Update GitHub Action defaults so `entrypoint=validate` defaults provider policies to `pull-or-build`.
- [x] Update tests for stable cache references, publish behavior, and validate defaults.
- [x] Update docs/schema examples so users do not think cache key files are required for normal cache freshness.
- [x] Run the relevant test suite and site checks.
