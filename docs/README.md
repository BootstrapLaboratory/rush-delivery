# Rush Delivery Documentation

Rush Delivery is a provider-adaptable Dagger module for Rush monorepos. The
framework assumes Rush is the project graph and uses `.dagger/` metadata as the
extension surface for validation, packaging, deployment, caches, and toolchains.

## Guides

- [Public Dagger API](api.md): callable functions and when to use them.
- [GitHub Action usage](github-actions.md): GitHub CI wrapper for the workflow
  entrypoint.
- [Entrypoints reference](entrypoints.md): every callable Dagger function and
  separate-use workflow.
- [Workflow guide](workflows.md): local and CI workflow shapes.
- [Metadata contracts](metadata.md): files under `.dagger/` that define target
  behavior.
- [Provider adapters](providers.md): source, registry, cache, and CI-provider
  boundaries.
- [AI architecture](ai/architecture.md): high-level design map for future
  coding agents.
- [AI conventions](ai/conventions.md): contribution rules and invariants.

## Website

The public GitHub Pages site currently builds from
[`../website-docusaurus`](../website-docusaurus). It uses Docusaurus, generates
docs pages from `website-docusaurus/docs-tree.yaml`, and is deployed by
[`../.github/workflows/pages.yml`](../.github/workflows/pages.yml).

The Astro + Starlight comparison site remains under [`../website`](../website).

## Source Of Truth

The schemas under [`../schemas`](../schemas) are the field-level metadata
contract. These docs explain intent and usage; schemas define file shape.
