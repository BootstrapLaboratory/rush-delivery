# Add Runtime Files Bundle

## Context

CI Git source mode no longer mounts the caller repository into the Dagger
workflow. Deploy-only credential files that CI writes to the host workspace
therefore should not be modeled as repo-relative host paths.

## Goal

Add a late-bound `runtimeFiles` directory input that deploy target metadata can
use to mount ephemeral credential/config files into deploy runtime containers.

## Design

- Keep existing `source_var` file mounts working for compatibility.
- Add `source` for runtime-file bundle paths.
- Make `target` optional for runtime-file mounts and default it to
  `/runtime-files/<source>`.
- Reject absolute runtime-file sources and parent-directory segments.
- Require `runtimeFiles` only for live deploys that use runtime-file mounts.
- Do not require or read runtime files during dry-runs.

## Non-Goals

- Do not include runtime files in source acquisition, Rush cache, package
  artifacts, toolchain hashes, or package manifests.
- Do not remove existing `source_var` mount support in this task.

## Checklist

- [x] Inspect current deploy mount model, parser, runtime env, and executor.
- [x] Extend deploy target model and parser for runtime-file mounts.
- [x] Thread `runtimeFiles?: Directory` through `workflow` and `deployRelease`.
- [x] Mount runtime bundle files only inside live deploy target containers.
- [x] Update schemas and docs.
- [x] Add unit tests for parsing, defaults, dry-run output, and live validation.
- [x] Run typecheck, tests, and available Dagger smoke checks.

## Validation

- `yarn typecheck`
- `yarn test`
- `git diff --check`
- `dagger call ping` attempted; blocked by local engine setup:
  `driver for scheme "image" was not available`
