# Support Git Source CI Workflow

## Context

Rush Delivery is now consumed as a standalone Dagger module. CI should be able
to run the main workflow without mounting the caller repository with `--repo`;
the workflow should clone the source repository inside Dagger from Git
coordinates and credentials.

Local development still needs `--repo` for unpushed changes and offline runs, so
`source-mode=local_copy` remains supported.

## Goal

Make `source-mode=git` the recommended CI path that does not require `--repo`,
while preserving `source-mode=local_copy --repo=...` for local development.

## Non-Goals

- Do not remove `repo` support.
- Do not remove the existing local-copy source path.
- Do not change target metadata contracts beyond docs needed for the new source
  mode guidance.

## Phases

- [x] Inspect current workflow source resolution and provider metadata ordering.
- [x] Make the public workflow entrypoint accept optional `repo`.
- [x] Require `repo` only for `source-mode=local_copy`.
- [x] Ensure `source-mode=git` clones before reading source-owned metadata.
- [x] Mount deploy runtime files from the resolved source repository.
- [x] Add focused tests for Git mode without `repo` and local-copy mode with
      `repo`.
- [x] Update docs with recommended CI and local command shapes.
- [x] Run typecheck, tests, and Dagger smoke checks where available.

## Validation

- `yarn typecheck` passed.
- `yarn test` passed.
- `git diff --check` passed.
- Dagger smoke checks were attempted with `dagger call ping` and
  `dagger -m /workspace call ping`, but this environment could not start the
  Dagger engine: `driver for scheme "image" was not available`.
