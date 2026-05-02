# Development

This page is for maintaining the Rush Delivery repository itself. User-facing
setup lives in the [Quick Start](quick-start/github-actions.md).

## Local Checks

Run the Dagger self-check before changing metadata, schemas, or module source:

```sh
dagger call self-check
```

Run the TypeScript and test suite from the repository root:

```sh
npm run typecheck
npm test
```

## Website Checks

The public GitHub Pages site currently builds from
[`../website-docusaurus`](../website-docusaurus). It uses Docusaurus, generates
docs pages from `website-docusaurus/docs-tree.yaml`, and is deployed by
[`../.github/workflows/pages.yml`](../.github/workflows/pages.yml).

```sh
npm run site:docusaurus:check
npm run site:docusaurus:build
```

The Astro + Starlight comparison site remains under [`../website`](../website).

```sh
npm run site:check
npm run site:build
```

## Generated Site Inputs

The root [`docs`](.) directory is the source of truth for generated website
docs. When adding or renaming public docs pages, update both:

- [`../website-docusaurus/docs-tree.yaml`](../website-docusaurus/docs-tree.yaml)
- [`../website/docs-tree.yaml`](../website/docs-tree.yaml)

Schemas under [`../schemas`](../schemas) are copied into the static site during
website builds and are published under `/rush-delivery/schemas/`. Exact release
schemas also live under versioned subdirectories such as
`/rush-delivery/schemas/v0.5.0/`.

When releasing a version that changes schema behavior, keep the versioned
schema directory immutable and update the root schemas to the current release
shape.
