# Add Git Source Validate Action

## Goal

Make pull-request validation consistent with the release workflow by allowing
`validate` to acquire source through the existing Git source mode, then expose
that path through the GitHub Action without requiring callers to install Dagger
or check out the repository for normal PR CI.

## Target User Shape

```yaml
name: ci-validate

on:
  pull_request:

permissions:
  contents: read

jobs:
  dagger-validate:
    runs-on: ubuntu-latest
    steps:
      - uses: BootstrapLaboratory/rush-delivery@v0.3.3
        with:
          entrypoint: validate
          pr-base-sha: ${{ github.event.pull_request.base.sha || '' }}
```

Local validation against unpushed changes must remain available:

```sh
dagger -m "$RUSH_DELIVERY_MODULE" call validate \
  --repo=. \
  --event-name=pull_request \
  --pr-base-sha="$PR_BASE_SHA" \
  --source-mode=local_copy
```

## Plan

- [x] Extend the public `validate` Dagger function with source acquisition
      inputs matching `workflow` where they apply:
      `gitSha`, `deployEnvFile`, `sourceMode`, `sourceRepositoryUrl`,
      `sourceRef`, `sourceAuthTokenEnv`, `sourceAuthUsername`, and optional
      `repo`.
- [x] Reuse the existing source planning and resolution code so `workflow` and
      `validate` share Git clone, auth token, ref, local-copy cleanup, and
      safety behavior.
- [x] Preserve local-copy validation compatibility for existing callers that
      pass `--repo=.`.
- [x] Ensure git-source validation resolves the repository first, validates the
      metadata contract on the resolved source, and then runs the existing
      validation planning and execution path.
- [x] Add GitHub Action `entrypoint` support with at least `workflow` and
      `validate`.
- [x] Add validate-specific action wiring for `validate-targets-json` and an
      optional local `repo` path for local-copy action usage.
- [x] Keep the current action defaults optimized for GitHub CI:
      `source-mode=git`, repository URL from GitHub context, ref from GitHub
      context, and auth token from `GITHUB_TOKEN`.
- [x] Add tests for validate source planning, validate git-source behavior where
      practical, workflow compatibility, and action argument generation for
      `entrypoint=validate`.
- [x] Update README, GitHub Action docs, Public API docs, Entrypoints docs, and
      quick-start material with the new PR validation action shape.
- [x] Run validation:
      `npm test`, `npm run typecheck`, `npm run site:docusaurus:check`,
      `npm run site:check`, `git diff --check`, and `trunk check -a -y`.

## Notes

- `extra-args` cannot solve this alone because the current action prepares
  Dagger args beginning with the hardcoded `workflow` callable.
- `validate` currently requires a `repo: Directory`; that is the core API gap.
- GitHub PR validation should not require checkout once git-source validation is
  implemented.
