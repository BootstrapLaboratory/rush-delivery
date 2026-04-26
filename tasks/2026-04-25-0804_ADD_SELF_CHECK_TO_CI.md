# Add Self-Check To CI

## Context

The standalone Dagger module now exposes `dagger call self-check`, which runs
the framework typecheck and test suite from one entrypoint.

This should become the standard automated health gate for the standalone
Dagger framework repository.

## Goal

Make `self-check` the canonical CI guard for the Dagger framework.

## Checklist

- [ ] Add a CI job that runs `dagger call self-check`.
- [ ] Ensure the job runs on Dagger source, schema, metadata, and task-file
      changes.
- [ ] Document `self-check` as the local and CI framework health command.
- [ ] Decide whether any older separate Dagger typecheck/test/metadata CI steps
      can be removed after `self-check` is wired.

## Validation

- [ ] Run the new CI path once and confirm `self-check` passes.
- [ ] Confirm the command still works locally with `dagger call self-check`.
