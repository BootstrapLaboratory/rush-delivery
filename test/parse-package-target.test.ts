import * as assert from "node:assert/strict";
import { test } from "node:test";

import { parsePackageTarget } from "../src/stages/package-stage/parse-package-target.ts";

test("parses directory package artifact metadata", () => {
  const definition = parsePackageTarget(`
name: webapp

artifact:
  kind: directory
  path: apps/webapp/dist
`);

  assert.deepStrictEqual(definition, {
    artifact: {
      kind: "directory",
      path: "apps/webapp/dist",
    },
    build: {
      dry_run_defaults: {},
      map_env: {},
      pass_env: [],
    },
    name: "webapp",
  });
});

test("parses Rush deploy archive package artifact metadata", () => {
  const definition = parsePackageTarget(`
name: server

artifact:
  kind: rush_deploy_archive
  project: server
  scenario: server
  output: common/deploy/server
`);

  assert.deepStrictEqual(definition, {
    artifact: {
      kind: "rush_deploy_archive",
      output: "common/deploy/server",
      project: "server",
      scenario: "server",
    },
    build: {
      dry_run_defaults: {},
      map_env: {},
      pass_env: [],
    },
    name: "server",
  });
});

test("parses package build environment metadata", () => {
  const definition = parsePackageTarget(`
name: webapp

build:
  pass_env:
    - WEBAPP_URL
    - WEBAPP_URL
  map_env:
    VITE_GRAPHQL_HTTP: WEBAPP_VITE_GRAPHQL_HTTP
  dry_run_defaults:
    WEBAPP_URL: https://webapp.example.test
    WEBAPP_VITE_GRAPHQL_HTTP: https://api.example.test/graphql

artifact:
  kind: directory
  path: apps/webapp/dist
`);

  assert.deepStrictEqual(definition.build, {
    dry_run_defaults: {
      WEBAPP_URL: "https://webapp.example.test",
      WEBAPP_VITE_GRAPHQL_HTTP: "https://api.example.test/graphql",
    },
    map_env: {
      VITE_GRAPHQL_HTTP: "WEBAPP_VITE_GRAPHQL_HTTP",
    },
    pass_env: ["WEBAPP_URL"],
  });
});

test("fails when package build map_env source is invalid", () => {
  assert.throws(
    () =>
      parsePackageTarget(`
name: webapp

build:
  map_env:
    VITE_GRAPHQL_HTTP: webapp_vite_graphql_http

artifact:
  kind: directory
  path: apps/webapp/dist
`),
    /Package target build map_env value for "VITE_GRAPHQL_HTTP" "webapp_vite_graphql_http" must match/,
  );
});

test("fails when artifact kind is unsupported", () => {
  assert.throws(
    () =>
      parsePackageTarget(`
name: webapp

artifact:
  kind: custom
  path: apps/webapp/dist
`),
    /Unsupported package target artifact kind "custom"\./,
  );
});

test("fails when directory artifact path is missing", () => {
  assert.throws(
    () =>
      parsePackageTarget(`
name: webapp

artifact:
  kind: directory
`),
    /Package target artifact path must be a non-empty string\./,
  );
});
