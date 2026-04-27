# Add Rush Delivery Tutorial

## Goal

Add a new top-level documentation section named `Tutorial` to the Rush Delivery
website. The tutorial should be a professional, easy-to-read, multi-chapter
walkthrough that shows how to take a Rush monorepo and configure it for
deployment with Rush Delivery.

The tutorial should use the public example repository as the concrete reference:

- `https://github.com/BootstrapLaboratory/typescript_monorepo_nestjs_relay_trunk`

At the start of the tutorial, mention that this repository is a fully working
Rush Delivery setup that deploys:

- a NestJS backend to Google Cloud Run
- a React frontend to Cloudflare Pages
- automated PR validation through Rush Delivery

The tutorial should not focus on the application business logic. It should focus
on the reusable Rush, `.dagger`, provider, packaging, validation, and GitHub
Actions patterns that another project can copy and adapt.

## Example Repository Findings

The example repo was cloned and inspected from:

```text
https://github.com/BootstrapLaboratory/typescript_monorepo_nestjs_relay_trunk
```

Observed setup:

- Rush projects are defined in `rush.json`:
  - `api-contract` at `libs/api`
  - `server` at `apps/server`
  - `webapp` at `apps/webapp`
- Rush commands are configured in `common/config/rush/command-line.json`:
  - `verify`
  - `lint`
  - `test`
  - `dev`
- Backend packaging uses Rush deploy:
  - `.dagger/package/targets/server.yaml`
  - `common/config/rush/deploy-server.json`
  - output: `common/deploy/server`
- Frontend packaging uses a built directory:
  - `.dagger/package/targets/webapp.yaml`
  - output: `apps/webapp/dist`
- Deploy graph is declared in `.dagger/deploy/services-mesh.yaml`:
  - `server` deploys first
  - `webapp` deploys after `server`
- Deploy runtime metadata lives in:
  - `.dagger/deploy/targets/server.yaml`
  - `.dagger/deploy/targets/webapp.yaml`
- Provider-backed artifacts are configured in:
  - `.dagger/toolchain-images/providers.yaml`
  - `.dagger/rush-cache/providers.yaml`
- PR validation metadata lives in:
  - `.dagger/validate/targets/server.yaml`
- GitHub Actions workflows:
  - `.github/workflows/pr-validate.yaml`
  - `.github/workflows/main-workflow.yaml`
  - `.github/workflows/force-deploy-server.yaml`
  - `.github/workflows/force-deploy-webapp.yaml`

Important behavior to explain:

- PR validation uses `packages: read` and `pull-or-build` provider policies.
- Main release workflow uses `packages: write` and `lazy` policies.
- The Rush install cache and toolchain images are stored in GHCR.
- Runtime files are late-bound with `runtime-file-map`.
- Google Cloud and Cloudflare are concrete examples, not hard requirements of
  Rush Delivery.

## Proposed Tutorial Structure

Create the tutorial source files under `docs/tutorial`.

Recommended chapters:

- [x] `docs/tutorial/README.md`
      Title: `Tutorial`
      Purpose: orient the reader, link to the example repository, explain the
      final architecture, and state what the tutorial will and will not cover.
- [x] `docs/tutorial/01-rush-monorepo-baseline.md`
      Explain the minimum Rush setup Rush Delivery expects:
      `rush.json`, project names, project folders, package scripts, lockfile,
      and why Rush project names must match deployment metadata names.
- [x] `docs/tutorial/02-rush-commands.md`
      Explain the Rush commands used by Rush Delivery validation and builds:
      `verify`, `lint`, `test`, `build`, and how selected projects are passed
      through Rush.
- [x] `docs/tutorial/03-dagger-metadata-map.md`
      Explain the `.dagger` directory layout and give a map of which metadata
      file controls which part of the workflow.
- [x] `docs/tutorial/04-provider-artifacts.md`
      Explain toolchain image and Rush cache providers, GHCR metadata,
      `lazy`, `pull-or-build`, and the PR/release permission split.
- [x] `docs/tutorial/05-package-targets.md`
      Explain package target metadata:
      `rush_deploy_archive` for backend deploy bundles and `directory` for
      frontend static assets.
- [x] `docs/tutorial/06-deploy-mesh.md`
      Explain the service mesh, target ordering, and deploy waves using the
      server-then-webapp example.
- [x] `docs/tutorial/07-deploy-targets.md`
      Explain deploy target runtime metadata:
      runtime image, workspace selection, install commands, `pass_env`, static
      env, dry-run defaults, runtime files, and deploy scripts.
- [x] `docs/tutorial/08-validation-targets.md`
      Explain validation target metadata using the server example with
      Postgres, Redis, migrations, server startup, and smoke checks.
- [x] `docs/tutorial/09-github-actions.md`
      Explain PR validation, main release workflow, forced deploy wrappers,
      permissions, runtime files, deploy env, and action inputs.
- [x] `docs/tutorial/10-local-dry-runs.md`
      Explain local validation and dry-run workflows against unpushed changes
      using `--repo=.` and provider-off settings.
- [x] `docs/tutorial/11-adapting-to-your-project.md`
      Explain how to adapt the example to different apps, deployment targets,
      providers, and CI environments without copying irrelevant application
      details.

## Website Integration Plan

- [x] Add a third top-level docs tree named `Tutorial`.
- [x] Update `website-docusaurus/docs-tree.yaml` with a `tutorialItems` list.
- [x] Update `website/docs-tree.yaml` with a matching `tutorialItems` list.
- [x] Update Docusaurus docs tree helpers to load and flatten `tutorialItems`.
- [x] Add a Docusaurus navbar item for `Tutorial`.
- [x] Add a Docusaurus sidebar named `tutorialSidebar`.
- [x] Update the Astro/Starlight docs tree helper to include a top-level
      `Tutorial` sidebar group.
- [x] Ensure generated docs link rewriting still works for tutorial pages.
- [x] Add homepage links or footer links to `Tutorial` only if they improve the
      first-screen flow; keep the homepage clean if it starts feeling crowded.

## Writing Guidelines

- [x] Use the example repository as a teaching aid, not as a dump of copied
      configuration.
- [x] Link to the public example repository when a full file is useful.
- [x] Keep code snippets small and explain why each field exists.
- [x] Use relative links for links inside this repository.
- [x] Avoid stale migration/history language.
- [x] Separate transferable Rush Delivery concepts from provider-specific
      Google Cloud Run and Cloudflare Pages details.
- [x] Prefer "copy this shape, then adapt these fields" over long prose.
- [x] Include callouts for security-sensitive choices:
      `packages: read` in PRs, `pull-or-build` in PRs, runtime files for
      credentials, and `packages: write` only in trusted release workflows.
- [x] Include short troubleshooting notes where the example reveals common
      failure modes:
      missing provider env, missing runtime files, mismatched target names,
      missing Rush cache key files, and deploy artifact path mistakes.

## Acceptance Criteria

- [x] The Docusaurus site has top-level navbar items:
      `Docs`, `Quick Start`, and `Tutorial`.
- [x] The Astro/Starlight site exposes a distinct `Tutorial` section.
- [x] Tutorial pages are authored under `docs/tutorial`.
- [x] The tutorial index clearly introduces the example repository and what it
      deploys.
- [x] The tutorial explains the complete path from Rush project definition to
      PR validation and release deployment.
- [x] The tutorial links to the public example repository where useful.
- [x] The tutorial is readable as a start-to-finish guide and also useful as
      individual reference chapters.
- [x] `npm run site:docusaurus:check` passes.
- [x] `npm run site:check` passes.
- [x] `trunk check -a -y` passes.

## Out Of Scope

- Rewriting the example repository.
- Teaching NestJS, Relay, React, Google Cloud Run, or Cloudflare Pages business
  logic in depth.
- Making Rush Delivery provider-specific to Google Cloud or Cloudflare.
- Adding generated screenshots unless later needed for homepage polish.
