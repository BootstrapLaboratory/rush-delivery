# Add GitHub Action Wrapper

## Context

Rush Delivery currently works as a Dagger module called directly with the
`dagger` CLI. GitHub Actions callers still need repeated setup glue for
installing Dagger, writing the deploy env file, preparing runtime files, and
assembling the long `workflow` call.

## Goal

Add a thin GitHub composite action that keeps the Dagger module as the source of
truth while making GitHub CI usage concise and reusable.

## Design

- Add root `action.yml` so consumers can use
  `BootstrapLaboratory/rush-delivery@<version>`.
- Use `dagger/dagger-for-github` for Dagger CLI installation and execution.
- Default the module path to the checked-out action directory so the action tag
  and module version match.
- Accept a multiline deploy env block and write it to a temporary env file.
- Accept runtime file copy mappings and build the runtime files bundle.
- Keep provider authentication outside the generic action.
- Keep raw `dagger` command usage fully supported.

## Checklist

- [x] Define the action inputs, outputs, and Dagger invocation shape.
- [x] Add the GitHub Action adapter script.
- [x] Add docs and examples for the GitHub Action mode.
- [x] Add tests for env writing, runtime file mapping, and call argument output.
- [x] Run typecheck, tests, shell checks, and available Dagger smoke checks.

## Validation

- `bash -n github-action/prepare-workflow.sh`
- `yarn typecheck`
- `yarn test`
- `git diff --check`
- `dagger call ping` attempted; blocked by local engine setup:
  `driver for scheme "image" was not available`
