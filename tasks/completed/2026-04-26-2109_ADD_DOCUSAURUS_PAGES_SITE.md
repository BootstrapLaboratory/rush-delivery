# Add Docusaurus Pages Site

## Context

The Astro + Starlight site works, but we want a Docusaurus comparison site with
a custom homepage and idiomatic Docusaurus docs structure. GitHub Pages should
deploy this Docusaurus version for review.

## Goal

Add a Docusaurus website under `website-docusaurus/`, generate docs from a
simple tree, switch the Pages workflow to build and deploy it, then commit and
push the result.

## Design

- Keep the custom homepage at `/`.
- Use Docusaurus classic preset, TypeScript config, and React homepage.
- Generate Docusaurus docs from a `docs-tree.yaml` file instead of manually
  copying repo Markdown.
- Keep the Astro site in place for comparison, but switch Pages deployment to
  `website-docusaurus`.
- Keep generated docs/build artifacts out of git.

## Checklist

- [x] Create Docusaurus project structure.
- [x] Add docs-tree driven doc generation and sidebar.
- [x] Implement custom homepage styling and content.
- [x] Switch GitHub Pages workflow to Docusaurus build output.
- [x] Update docs/root scripts.
- [x] Run validations.
- [x] Commit and push.

## Validation

- `npm run site:docusaurus:check`
- `npm run site:docusaurus:build`
- `npm run site:check`
- `npm run site:build`
- `npm run typecheck`
- `npm test`
- YAML parse check for `.github/workflows/pages.yml`,
  `website-docusaurus/docs-tree.yaml`, and `website/docs-tree.yaml`
- `git diff --check`

`trunk check -a -y` was not run because `trunk` is not installed in this
workspace.
