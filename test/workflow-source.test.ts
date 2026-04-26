import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildSourceBootstrapToolchainOptions,
  buildWorkflowSourcePlan,
} from "../src/workflow/source-options.ts";

const commitSha = "0123456789abcdef0123456789abcdef01234567";

test("builds Git workflow source plan without a mounted repo", () => {
  const plan = buildWorkflowSourcePlan({
    deployTagPrefix: "deploy/prod",
    gitSha: commitSha,
    sourceAuthTokenEnv: "GITHUB_TOKEN",
    sourceMode: "git",
    sourceRef: "refs/heads/main",
    sourceRepositoryUrl: "https://github.com/BeltOrg/beltapp.git",
  });

  assert.equal(plan.mode, "git");
  assert.equal(plan.repositoryUrl, "https://github.com/BeltOrg/beltapp.git");
  assert.deepEqual(plan.auth, {
    tokenEnv: "GITHUB_TOKEN",
    username: "x-access-token",
  });
});

test("source acquisition bootstraps without source-owned provider metadata when provider is off", () => {
  assert.deepEqual(
    buildSourceBootstrapToolchainOptions({
      toolchainImageProvider: "off",
    }),
    {
      toolchainImageProvider: "off",
    },
  );
});

test("source acquisition can use default GitHub toolchain provider before metadata exists", () => {
  assert.deepEqual(
    buildSourceBootstrapToolchainOptions({
      hostEnv: {
        GITHUB_ACTOR: "beltbot",
        GITHUB_REPOSITORY: "BeltOrg/beltapp",
        GITHUB_TOKEN: "token",
      },
      toolchainImageProvider: "github",
    }),
    {
      toolchainImageProvider: "github",
      toolchainImageProviders: {
        providers: {
          github: {
            image_namespace: "rush-delivery-toolchains",
            kind: "github_container_registry",
            registry: "ghcr.io",
            repository_env: "GITHUB_REPOSITORY",
            token_env: "GITHUB_TOKEN",
            username_env: "GITHUB_ACTOR",
          },
        },
      },
    },
  );
});

test("source acquisition falls back when GitHub bootstrap env is unavailable", () => {
  assert.deepEqual(
    buildSourceBootstrapToolchainOptions({
      hostEnv: {
        CUSTOM_GITHUB_REPOSITORY: "BeltOrg/beltapp",
        CUSTOM_GITHUB_TOKEN: "token",
        CUSTOM_GITHUB_ACTOR: "beltbot",
      },
      toolchainImageProvider: "github",
    }),
    {
      toolchainImageProvider: "off",
    },
  );
});

test("local copy workflow source remains available for mounted repo runs", () => {
  const plan = buildWorkflowSourcePlan({
    gitSha: commitSha,
    sourceMode: "local_copy",
  });

  assert.equal(plan.mode, "local_copy");
  assert.equal(plan.sourcePath, "/workspace");
});
