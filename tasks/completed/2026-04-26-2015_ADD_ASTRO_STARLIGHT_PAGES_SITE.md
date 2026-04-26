# Add Astro Starlight Pages Site

## Context

Rush Delivery needs a public GitHub Pages site with a designed homepage and an
easy docs navigation model. The module docs should remain usable in the repo,
while the published site provides a more approachable landing page and quick
start path.

## Goal

Add an Astro + Starlight website under `website/`, driven by a small docs tree,
and deploy it to GitHub Pages from GitHub Actions.

## Design

- Put the custom advertisement homepage at `/`.
- Put Starlight documentation pages under `/docs`.
- Keep docs navigation in `website/docs-tree.yaml`.
- Reuse existing Markdown docs through generated wrapper pages where practical.
- Add a GitHub Pages deployment workflow using the official Pages artifact flow.
- Keep the website project isolated from the Dagger module runtime.

## Checklist

- [x] Create the Astro + Starlight website project structure.
- [x] Add docs-tree driven docs pages and sidebar configuration.
- [x] Design and implement the homepage.
- [x] Add GitHub Pages deployment workflow.
- [x] Update root documentation with website/deploy instructions.
- [x] Run website build, typecheck/tests, and available validation.

## Validation

- `npm run site:check`
- `npm run site:build`
- `yarn typecheck`
- `yarn test`
- `git diff --check`
- YAML parse check for `.github/workflows/pages.yml` and `website/docs-tree.yaml`
- `dagger call ping` attempted; blocked by local engine setup:
  `driver for scheme "image" was not available`
