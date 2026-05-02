# Add Versioned Documentation

## Goal

Publish documentation for released Rush Delivery versions while keeping the current authoring flow simple and preserving stable public docs URLs.

## Context

- Current editable documentation lives in `docs/`.
- Public Docusaurus docs are generated into `website-docusaurus/docs` from `docs/` and `website-docusaurus/docs-tree.yaml`.
- Public Astro/Starlight docs are generated into `website/src/content/docs/docs` from `docs/` and `website/docs-tree.yaml`.
- Internal AI/process documentation currently lives under `docs/ai`, but it should not become part of public versioned docs.
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
- [x] Move internal AI docs out of public docs, likely from `docs/ai` to `.ai`, and update `AGENTS.md` references in the same change.
- [x] Inventory old tags first, because early releases may not have meaningful docs worth publishing.
- [x] Decide per release whether docs are worth publishing instead of blindly snapshotting every patch release.

## Implementation Plan

- [ ] Inventory release tags:
  - [ ] List `v0.*.*` tags in release order.
  - [ ] For each tag, inspect whether `docs/`, website docs trees, and relevant README files exist.
  - [ ] Record missing/low-value docs versions and propose whether to skip or publish them with an archived/unmaintained banner.
- [ ] Prepare internal docs move:
  - [ ] Move `docs/ai` to `.ai`.
  - [ ] Update `AGENTS.md` and any internal references from `docs/ai/...` to `.ai/...`.
  - [ ] Ensure public docs sync scripts no longer see internal AI docs.
- [ ] Create a repeatable snapshot script:
  - [ ] Checkout each release tag into a temporary worktree or detached clone.
  - [ ] Copy the public docs source from each tag to a temp staging directory.
  - [ ] Normalize old docs through the current docs-tree format when possible.
  - [ ] Generate Docusaurus-compatible versioned docs and sidebars.
  - [ ] Fail clearly when a tag does not contain expected docs inputs.
- [ ] Add Docusaurus versioning files:
  - [ ] Add `website-docusaurus/versions.json`.
  - [ ] Add `website-docusaurus/versioned_docs/version-vX.Y.Z/...`.
  - [ ] Add `website-docusaurus/versioned_sidebars/version-vX.Y.Z-sidebars.json`.
  - [ ] Configure `lastVersion`, `versions`, banners, badges, and current docs behavior.
  - [ ] Add a `docsVersionDropdown` navbar item.
- [ ] Align generated docs:
  - [ ] Ensure generated current docs still come from root `docs/`.
  - [ ] Ensure historic docs do not get overwritten by `sync-docs`.
  - [ ] Ensure relative links resolve inside each version.
  - [ ] Ensure schema links in historical docs point to matching schema versions where available.
- [ ] Update website UX:
  - [ ] Decide the homepage "Quick Start" and "Docs" links target latest stable docs.
  - [ ] Add clear version labels/banners for older docs.
  - [ ] Ensure search behavior is acceptable with multiple versions.
- [ ] Document release process:
  - [ ] Add a maintainer note describing how to cut a new docs version after a release.
  - [ ] Add guidance for when patch releases should or should not create a docs snapshot.
  - [ ] Mention the relationship between versioned docs and versioned schemas.
- [ ] Verify:
  - [ ] Run `npm run site:docusaurus:check`.
  - [ ] Run `npm run site:check`.
  - [ ] Run Docusaurus build and inspect version dropdown routes.
  - [ ] Check generated URLs for latest and historical versions.
  - [ ] Run `git diff --check`.

## Risks

- Duplicating every patch release may create noise and slower builds without meaningful user value.
- Older tags may not contain the same docs tree format, so snapshot generation may need compatibility handling.
- Moving `docs/ai` requires updating agent instructions atomically to avoid breaking future agent behavior.
- Relative links that work in current docs may need adjustment for Docusaurus versioned docs.
- Astro/Starlight may diverge from Docusaurus if we only version Docusaurus.

## References

- Docusaurus versioning stores current docs in `docs/`, frozen docs in `versioned_docs/version-[versionName]/`, sidebars in `versioned_sidebars/`, and version order in `versions.json`.
- Docusaurus recommends keeping the number of active built versions small and using versioned docs only when the documentation really changes between versions.
