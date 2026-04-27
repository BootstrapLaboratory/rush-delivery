import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildSourceAcquisitionPlan,
  buildWorkflowSourcePlan,
} from "../src/source/source-options.ts";

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

test("local copy workflow source remains available for mounted repo runs", () => {
  const plan = buildWorkflowSourcePlan({
    gitSha: commitSha,
    sourceMode: "local_copy",
  });

  assert.equal(plan.mode, "local_copy");
  assert.deepEqual(plan.cleanupPaths, ["common/temp", ".dagger/runtime"]);
});

test("local copy validation source can omit git sha", () => {
  const plan = buildSourceAcquisitionPlan({
    sourceMode: "local_copy",
  });

  assert.equal(plan.mode, "local_copy");
});

test("git validation source requires full commit sha", () => {
  assert.throws(
    () =>
      buildSourceAcquisitionPlan({
        sourceMode: "git",
        sourceRepositoryUrl: "https://github.com/BeltOrg/beltapp.git",
      }),
    /Git source commit SHA must be a non-empty string/,
  );
});
