---
title: "Package Targets"
sidebar_label: "Package Targets"
---

Package targets describe the deploy artifact for each deploy target. Rush
Delivery builds selected Rush projects first, then materializes the artifacts
declared in `.dagger/package/targets`.

The example has two package styles.

## Rush Deploy Archive

The backend target uses a Rush deploy archive:

```yaml
name: server

artifact:
  kind: rush_deploy_archive
  project: server
  scenario: server
  output: common/deploy/server
```

This points at:

- Rush project `server`
- Rush deploy scenario `server`
- output directory `common/deploy/server`

The deploy scenario lives in
[`common/config/rush/deploy-server.json`](https://github.com/BootstrapLaboratory/typescript_monorepo_nestjs_relay_trunk/blob/main/common/config/rush/deploy-server.json).
It tells Rush deploy how to gather the server package and its production
dependencies into a deployable directory.

Use this style when a backend service needs its package, transitive runtime
dependencies, and local workspace dependencies collected into one bundle.

## Directory Artifact

The frontend target uses a directory artifact:

```yaml
name: webapp

artifact:
  kind: directory
  path: apps/webapp/dist
```

Use this style when the build already produces a deployable directory. Static
frontend assets are the common case.

## Artifact Paths In Deploy Scripts

Rush Delivery passes the selected artifact path to deploy scripts through
`ARTIFACT_PATH`.

For the backend, the deploy script expects an extracted Rush deploy bundle with
`apps/server` inside it. For the frontend, the deploy script expects a static
assets directory.

Keep deploy scripts defensive. They should fail early if `ARTIFACT_PATH` does
not point at the expected shape.

## Checklist

- Create one package target for every deploy target.
- Use `rush_deploy_archive` for backend/runtime bundles.
- Use `directory` for already-built static assets.
- Keep artifact paths relative to the repository root.
- Make deploy scripts validate the artifact shape before deploying.

Next: [Deploy Mesh](../deploy-mesh).
