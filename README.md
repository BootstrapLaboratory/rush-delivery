# Rush Delivery

Rush Delivery is a Dagger module for Rush-based release workflows. It owns the
release path from source acquisition through detect, validate, build, package,
and deploy while keeping project-specific behavior in metadata.

Start here:

- [Documentation index](docs/README.md)
- [Public Dagger API](docs/api.md)
- [Entrypoints reference](docs/entrypoints.md)
- [Workflow guide](docs/workflows.md)
- [Metadata contracts](docs/metadata.md)
- [Provider adapters](docs/providers.md)
- [AI architecture notes](docs/ai/architecture.md)

Common local checks:

```sh
dagger call self-check
```

External callers should run from the Rush repository they want to release and
pass that repository explicitly:

```sh
RUSH_DELIVERY_MODULE=github.com/OWNER/rush-delivery@VERSION

dagger -m "$RUSH_DELIVERY_MODULE" call workflow \
  --repo=. \
  --git-sha="$(git rev-parse HEAD)" \
  --event-name=workflow_call \
  --force-targets-json='["server","webapp"]' \
  --dry-run=true \
  --toolchain-image-provider=off \
  --rush-cache-provider=off \
  --source-mode=local_copy
```
