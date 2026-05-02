import * as assert from "node:assert/strict";
import { test } from "node:test";

import { resolvePassThroughEnvironment } from "../src/env/pass-through.ts";

test("resolves pass-through and mapped environment variables", () => {
  assert.deepEqual(
    resolvePassThroughEnvironment({
      context: "package target build",
      dryRun: false,
      hostEnv: {
        SOURCE_GRAPHQL_HTTP: "https://api.example.test/graphql",
        WEBAPP_URL: "https://webapp.example.test",
      },
      spec: {
        dry_run_defaults: {},
        map_env: {
          VITE_GRAPHQL_HTTP: "SOURCE_GRAPHQL_HTTP",
        },
        pass_env: ["WEBAPP_URL"],
      },
      target: "webapp",
    }),
    {
      VITE_GRAPHQL_HTTP: "https://api.example.test/graphql",
      WEBAPP_URL: "https://webapp.example.test",
    },
  );
});

test("fails when mapped environment source is missing", () => {
  assert.throws(
    () =>
      resolvePassThroughEnvironment({
        context: "package target build",
        dryRun: false,
        hostEnv: {},
        spec: {
          dry_run_defaults: {},
          map_env: {
            VITE_GRAPHQL_HTTP: "SOURCE_GRAPHQL_HTTP",
          },
          pass_env: [],
        },
        target: "webapp",
      }),
    /Missing required host environment variable "SOURCE_GRAPHQL_HTTP" mapped to "VITE_GRAPHQL_HTTP" for package target build "webapp"\./,
  );
});

test("fails when one target env name resolves to two values", () => {
  assert.throws(
    () =>
      resolvePassThroughEnvironment({
        context: "package target build",
        dryRun: false,
        hostEnv: {
          TARGET_ENV: "direct",
          UPSTREAM_ENV: "mapped",
        },
        spec: {
          dry_run_defaults: {},
          map_env: {
            TARGET_ENV: "UPSTREAM_ENV",
          },
          pass_env: ["TARGET_ENV"],
        },
        target: "webapp",
      }),
    /Environment variable "TARGET_ENV" for package target build "webapp" is resolved more than once with different values\./,
  );
});
