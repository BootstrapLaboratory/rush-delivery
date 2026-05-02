# Refactor Versioned Docs Storage

## Goal

Move canonical versioned documentation snapshots out of `website-docusaurus`
and into a root-level `docs-versions` directory, while keeping Docusaurus builds
compatible with its native versioned docs file layout.

## Decisions

- Root `docs/` remains the current editable documentation source.
- Root `docs-versions/` becomes the canonical source for released docs
  snapshots, sidebars, and `versions.json`.
- `website-docusaurus` remains the renderer and receives Docusaurus-native
  version files as generated inputs before build/start/check.
- Generated Docusaurus-local version files are ignored by Git.
- Astro/Starlight remains current-only.

## Plan

- [x] Add a root `docs-versions/` layout containing:
  - [x] `versions.json`
  - [x] `versioned_docs/`
  - [x] `versioned_sidebars/`
- [x] Update the version snapshot generator to write canonical files into
      `docs-versions/`.
- [x] Add a Docusaurus sync script that copies canonical root version files into
      Docusaurus' expected local paths.
- [x] Update Docusaurus scripts so `start`, `build`, and `check` sync versioned
      inputs before invoking Docusaurus.
- [x] Ignore generated Docusaurus-local versioning files.
- [x] Update maintainer documentation to describe the new source/generated
      split.
- [x] Verify:
  - [x] Regenerate canonical versioned docs.
  - [x] Run `npm run site:docusaurus:check`.
  - [x] Run `npm run site:check`.
  - [x] Run `git diff --check`.
