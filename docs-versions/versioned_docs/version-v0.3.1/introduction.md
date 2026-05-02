---
id: "introduction"
title: "Introduction"
sidebar_label: "Introduction"
---
Rush Delivery is a provider-adaptable Dagger module for Rush monorepos. The
framework assumes Rush is the project graph and uses `.dagger/` metadata as the
extension surface for validation, packaging, deployment, caches, and toolchains.

## Guides

- [Quick Start](../quick-start/github-actions): recommended ways to run Rush
  Delivery from GitHub Actions, CI scripts, and local working trees.
- [Public Dagger API](../api): callable functions and when to use them.
- [GitHub Action usage](../github-action): GitHub CI wrapper for the workflow
  entrypoint.
- [Entrypoints reference](../entrypoints): every callable Dagger function and
  separate-use workflow.
- [Workflow guide](../workflows): local and CI workflow shapes.
- [Metadata contracts](../metadata): files under `.dagger/` that define target
  behavior.
- [Provider adapters](../providers): source, registry, cache, and CI-provider
  boundaries.
- [AI architecture](https://github.com/BootstrapLaboratory/rush-delivery/blob/v0.3.1/docs/ai/architecture.md): high-level design map for future
  coding agents.
- [AI conventions](https://github.com/BootstrapLaboratory/rush-delivery/blob/v0.3.1/docs/ai/conventions.md): contribution rules and invariants.

## Website

The public GitHub Pages site currently builds from
[`../website-docusaurus`](https://github.com/BootstrapLaboratory/rush-delivery/blob/v0.3.1/website-docusaurus). It uses Docusaurus, generates
docs pages from `website-docusaurus/docs-tree.yaml`, and is deployed by
[`../.github/workflows/pages.yml`](https://github.com/BootstrapLaboratory/rush-delivery/blob/v0.3.1/.github/workflows/pages.yml).

The Astro + Starlight comparison site remains under [`../website`](https://github.com/BootstrapLaboratory/rush-delivery/blob/v0.3.1/website).

## Source Of Truth

The schemas under [`../schemas`](https://github.com/BootstrapLaboratory/rush-delivery/blob/v0.3.1/schemas) are the field-level metadata
contract. These docs explain intent and usage; schemas define file shape.
