# Fail Deploy Env Collisions

## Goal

Make deploy runtime environment resolution use the same clear security contract
as `pass_env` and `map_env`: no precedence, no silent override.

## Scope

- Fail when deploy target `runtime.env` defines an output name already produced
  by `runtime.pass_env` or `runtime.map_env` with a different value.
- Document that deploy `pass_env`, `map_env`, and static `env` share one output
  namespace.
- Keep build/package/validate env behavior unchanged.

## Checklist

- [x] Add runtime env collision validation for static deploy `env`.
- [x] Add focused tests for static env collisions and matching duplicate values.
- [x] Update metadata, tutorial, and architecture docs.
- [x] Run relevant verification.

## Verification

- `npm test`
- `npm run typecheck`
- `npm run site:docusaurus:check`
- `npm run site:check`
- `git diff --check`
