# Rush Delivery

Rush Delivery is a Dagger module for Rush-based release workflows. It owns the
release path from source acquisition through detect, validate, build, package,
and deploy while keeping project-specific behavior in metadata.

Start here:

- [Quick Start](docs/quick-start/github-actions.md)
- [Introduction](docs/README.md)
- [Public Dagger API](docs/api.md)
- [GitHub Action usage](docs/github-actions.md)
- [Entrypoints reference](docs/entrypoints.md)
- [Workflow guide](docs/workflows.md)
- [Metadata contracts](docs/metadata.md)
- [Provider adapters](docs/providers.md)
- [AI architecture notes](docs/ai/architecture.md)

Common local checks:

```sh
dagger call self-check
```

Website checks:

```sh
npm run site:check
npm run site:build
```
