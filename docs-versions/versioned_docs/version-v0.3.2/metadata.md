---
id: "metadata"
title: "Metadata"
sidebar_label: "Metadata"
---

Project-specific behavior lives under `.dagger` in the caller's Rush
repository. This module treats those files as the public extension contract.

Exact field validation is defined by JSON schemas under
[`../schemas`](https://github.com/BootstrapLaboratory/rush-delivery/blob/v0.3.2/schemas).

## Deploy Services Mesh

`.dagger/deploy/services-mesh.yaml` defines deploy target ordering:

- `services.<target>.deploy_after` lists targets that must finish first.
- Targets with no dependency can run in the same deploy wave.
- Service names must match deploy target metadata names.

Schema:
[`../schemas/deploy-services-mesh.schema.json`](https://github.com/BootstrapLaboratory/rush-delivery/blob/v0.3.2/schemas/deploy-services-mesh.schema.json)

## Deploy Targets

Deploy targets live in `.dagger/deploy/targets`.

Each target declares:

- `name`: target name. It should match the metadata filename and Rush package.
- `deploy_script`: repository-relative script executed by the target runtime.
- `runtime.image`: base image for the executor container.
- `runtime.install`: toolchain preparation commands.
- `runtime.pass_env`: allowed 1:1 host-to-container environment variables.
- `runtime.env`: static container environment values.
- `runtime.dry_run_defaults`: safe defaults used during dry-runs.
- `runtime.required_host_env`: host environment keys required for live runs.
- `runtime.file_mounts`: files mounted into the runtime container from the
  deploy runtime files bundle, or from host env paths for compatibility.
- `runtime.workspace`: directories and files mounted under `/workspace`.

If `runtime.workspace.mode` is `full`, the whole prepared repository is mounted.
If mode is omitted, only listed `dirs` and `files` are mounted.

Runtime file mounts use a `source` path relative to the `runtimeFiles` bundle.
`target` is optional and defaults to `/runtime-files/<source>`.

```yaml
runtime:
  env:
    GOOGLE_APPLICATION_CREDENTIALS: /runtime-files/gcp-credentials.json
  file_mounts:
    - source: gcp-credentials.json
```

The `source` path must stay inside the runtime files bundle: no absolute paths
and no `..` segments. Live deploys that reference `source` mounts require the
`runtimeFiles` Dagger input. Dry-runs report the intended mount and do not
require the file.

Compatibility mounts can still read a host path from an allowlisted environment
variable and mount it at an explicit target:

```yaml
runtime:
  required_host_env:
    - GOOGLE_GHA_CREDS_PATH
  file_mounts:
    - source_var: GOOGLE_GHA_CREDS_PATH
      target: /tmp/gcp-credentials.json
```

Schema:
[`../schemas/deploy-target.schema.json`](https://github.com/BootstrapLaboratory/rush-delivery/blob/v0.3.2/schemas/deploy-target.schema.json)

## Package Targets

Package targets live in `.dagger/package/targets`.

Supported artifact types:

- `directory`: an already-built repository directory.
- `rush_deploy_archive`: a Rush deploy output packaged for a deploy target.

Schema:
[`../schemas/package-target.schema.json`](https://github.com/BootstrapLaboratory/rush-delivery/blob/v0.3.2/schemas/package-target.schema.json)

## Validation Targets

Validation targets live in `.dagger/validate/targets`.

They declare optional backing services and ordered validation steps. This keeps
target-specific smoke checks in metadata while the runner stays generic.

Schema:
[`../schemas/validation-target.schema.json`](https://github.com/BootstrapLaboratory/rush-delivery/blob/v0.3.2/schemas/validation-target.schema.json)

## Toolchain Images

Toolchain image provider metadata lives in
`.dagger/toolchain-images/providers.yaml`.

It declares optional registry providers for reusable framework toolchain images.
Provider `off` needs no metadata. Provider `github` uses GHCR with environment
keys for repository, username, and token.

Schema:
[`../schemas/toolchain-image-providers.schema.json`](https://github.com/BootstrapLaboratory/rush-delivery/blob/v0.3.2/schemas/toolchain-image-providers.schema.json)

## Rush Cache

Rush cache metadata lives in `.dagger/rush-cache/providers.yaml`.

The `cache` section defines:

- `version`: user-controlled cache salt.
- `key_files`: files whose contents invalidate the cache.
- `paths`: repository-relative Rush install cache paths restored into the
  Dagger-owned source.

The `providers` section declares optional storage adapters.

Schema:
[`../schemas/rush-cache-providers.schema.json`](https://github.com/BootstrapLaboratory/rush-delivery/blob/v0.3.2/schemas/rush-cache-providers.schema.json)
