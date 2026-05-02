# Add Versioned Documentation

## Goal

Publish documentation for released Rush Delivery versions while keeping the current authoring flow simple and preserving stable public docs URLs.

## Context

- Current editable documentation lives in `docs/`.
- Public Docusaurus docs are generated into `website-docusaurus/docs` from `docs/` and `website-docusaurus/docs-tree.yaml`.
- Public Astro/Starlight docs are generated into `website/src/content/docs/docs` from `docs/` and `website/docs-tree.yaml`.
- Internal AI/process documentation has moved to `.ai`, so it is outside public versioned docs.
- Release schemas already use stable version snapshots under `schemas/vX.Y.Z/`.
- Existing release tags include `v0.1.0` through `v0.5.0`.

## Recommended Direction

Use Docusaurus native docs versioning for the canonical public documentation site:

- Keep `docs/` as current editable docs.
- Generate Docusaurus version snapshots under `website-docusaurus/versioned_docs/version-vX.Y.Z/`.
- Generate matching sidebars under `website-docusaurus/versioned_sidebars/version-vX.Y.Z-sidebars.json`.
- Maintain `website-docusaurus/versions.json` from newest to oldest.
- Configure Docusaurus navbar with `docsVersionDropdown`.
- Configure current/latest behavior intentionally so `/docs` points at the latest stable release and current docs do not accidentally become a misleading prerelease.

Do not place version folders directly inside root `docs/` unless we intentionally choose a custom versioning system. Docusaurus already has the routing and navigation conventions we want, and matching them will reduce custom code.

For Astro/Starlight, either:

- keep it as an unversioned showcase/preview site using current docs only, or
- implement a small custom version route later if we decide Astro must remain feature-equivalent with Docusaurus.

## Confirmed Decisions

- [x] Make Docusaurus the canonical versioned docs site.
- [x] Keep Astro/Starlight unversioned for now, unless there is a strong reason to support versioned docs there too.
- [x] Move internal AI docs out of public docs to `.ai`, and update `AGENTS.md` references in the same change.
- [x] Inventory old tags first, because early releases may not have meaningful docs worth publishing.
- [x] Decide per release whether docs are worth publishing instead of blindly snapshotting every patch release.

## Implementation Plan

- [x] Inventory release tags:
  - [x] List `v0.*.*` tags in release order.
  - [x] For each tag, inspect whether `docs/`, website docs trees, and relevant README files exist.
  - [x] Record missing/low-value docs versions and propose whether to skip or publish them with an archived/unmaintained banner.
- [x] Prepare internal docs move:
  - [x] Move `docs/ai` to `.ai`.
  - [x] Update `AGENTS.md` and any internal references from `docs/ai/...` to `.ai/...`.
  - [x] Ensure public docs sync scripts no longer see internal AI docs.
- [x] Create a repeatable snapshot script:
  - [x] Read each release tag directly from Git.
  - [x] Copy the public docs source from each tag into Docusaurus versioned docs.
  - [x] Normalize old docs through the docs-tree format when available.
  - [x] Generate Docusaurus-compatible versioned docs and sidebars.
  - [x] Fail clearly when a tag does not contain expected docs inputs.
- [x] Add Docusaurus versioning files:
  - [x] Add `website-docusaurus/versions.json`.
  - [x] Add `website-docusaurus/versioned_docs/version-vX.Y.Z/...`.
  - [x] Add `website-docusaurus/versioned_sidebars/version-vX.Y.Z-sidebars.json`.
  - [x] Configure `lastVersion`, `versions`, banners, badges, and current docs behavior.
  - [x] Add a `docsVersionDropdown` navbar item.
- [x] Align generated docs:
  - [x] Ensure generated current docs still come from root `docs/`.
  - [x] Ensure historic docs do not get overwritten by `sync-docs`.
  - [x] Ensure relative links resolve inside each version.
  - [x] Ensure schema links in historical docs point to matching schema versions where available.
- [x] Update website UX:
  - [x] Decide the homepage "Quick Start" and "Docs" links target latest stable docs.
  - [x] Add clear version labels/banners for older docs.
  - [x] Ensure search behavior is acceptable with multiple versions.
- [x] Document release process:
  - [x] Add a maintainer note describing how to cut a new docs version after a release.
  - [x] Add guidance for when patch releases should or should not create a docs snapshot.
  - [x] Mention the relationship between versioned docs and versioned schemas.
- [x] Verify:
  - [x] Run `npm run site:docusaurus:check`.
  - [x] Run `npm run site:check`.
  - [x] Run Docusaurus build and inspect version dropdown routes.
  - [x] Check generated URLs for latest and historical versions.
  - [x] Run `git diff --check`.

## Risks

- Duplicating every patch release may create noise and slower builds without meaningful user value.
- Older tags may not contain the same docs tree format, so snapshot generation may need compatibility handling.
- Moving `.ai` references requires updating agent instructions atomically to avoid breaking future agent behavior.
- Relative links that work in current docs may need adjustment for Docusaurus versioned docs.
- Astro/Starlight may diverge from Docusaurus if we only version Docusaurus.

## References

- Docusaurus versioning stores current docs in `docs/`, frozen docs in `versioned_docs/version-[versionName]/`, sidebars in `versioned_sidebars/`, and version order in `versions.json`.
- Docusaurus recommends keeping the number of active built versions small and using versioned docs only when the documentation really changes between versions.
