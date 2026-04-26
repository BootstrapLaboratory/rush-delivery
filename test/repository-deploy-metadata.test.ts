import * as assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import * as path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { parseDeployTarget } from "../src/stages/deploy/parse-deploy-target.ts";
import {
  servicesMeshPath,
  targetDefinitionPath,
} from "../src/stages/deploy/metadata-paths.ts";
import { parseServicesMesh } from "../src/planning/parse-services-mesh.ts";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDirectory, "fixtures/rush-repo");
const fixtureServicesMeshPath = path.join(repoRoot, servicesMeshPath);

async function readFixtureServicesMesh() {
  return parseServicesMesh(await readFile(fixtureServicesMeshPath, "utf8"));
}

test("loads every target YAML referenced by the fixture services mesh", async () => {
  const mesh = await readFixtureServicesMesh();
  const loadedTargets = await Promise.all(
    Object.keys(mesh.services)
      .sort()
      .map(async (target) => ({
        definition: parseDeployTarget(
          await readFile(
            path.join(repoRoot, targetDefinitionPath(target)),
            "utf8",
          ),
        ),
        target,
      })),
  );

  for (const { definition, target } of loadedTargets) {
    assert.equal(
      definition.name,
      target,
      `target definition "${target}" must declare a matching name`,
    );
  }
});

test("every fixture services mesh target has a deploy script that exists on disk", async () => {
  const mesh = await readFixtureServicesMesh();

  await Promise.all(
    Object.keys(mesh.services).map(async (target) => {
      const definition = parseDeployTarget(
        await readFile(
          path.join(repoRoot, targetDefinitionPath(target)),
          "utf8",
        ),
      );
      const deployScriptPath = path.resolve(repoRoot, definition.deploy_script);
      await access(deployScriptPath);
      assert.ok(
        deployScriptPath.endsWith(definition.deploy_script),
        `target "${target}" deploy script should resolve correctly`,
      );
    }),
  );
});
