---
id: "development"
title: "Development"
sidebar_label: "Development"
description: "Maintain this repository and generated documentation."
---
This page is for maintaining the Rush Delivery repository itself. User-facing
setup lives in the [Quick Start](../quick-start/github-actions).

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
[`../website-docusaurus`](https://github.com/BootstrapLaboratory/rush-delivery/blob/v0.3.4/website-docusaurus). It uses Docusaurus, generates
docs pages from `website-docusaurus/docs-tree.yaml`, and is deployed by
[`../.github/workflows/pages.yml`](https://github.com/BootstrapLaboratory/rush-delivery/blob/v0.3.4/.github/workflows/pages.yml).

```sh
npm run site:docusaurus:check
npm run site:docusaurus:build
```

The Astro + Starlight comparison site remains under [`../website`](https://github.com/BootstrapLaboratory/rush-delivery/blob/v0.3.4/website).

```sh
npm run site:check
npm run site:build
```

## Generated Site Inputs

The root [`docs`](https://github.com/BootstrapLaboratory/rush-delivery/blob/v0.3.4/docs) directory is the source of truth for generated website
docs. When adding or renaming public docs pages, update both:

- [`../website-docusaurus/docs-tree.yaml`](https://github.com/BootstrapLaboratory/rush-delivery/blob/v0.3.4/website-docusaurus/docs-tree.yaml)
- [`../website/docs-tree.yaml`](https://github.com/BootstrapLaboratory/rush-delivery/blob/v0.3.4/website/docs-tree.yaml)

Schemas under [`../schemas`](https://github.com/BootstrapLaboratory/rush-delivery/blob/v0.3.4/schemas) are copied into the static site during
website builds and are published under `/rush-delivery/schemas/`.
