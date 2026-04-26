import * as assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import * as path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { validationTargetsDirectory } from "../src/stages/validate/metadata-paths.ts";
import { parseValidationTarget } from "../src/stages/validate/parse-validation-target.ts";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDirectory, "fixtures/rush-repo");
const fixtureValidationTargetsDirectory = path.join(
  repoRoot,
  validationTargetsDirectory,
);

test("loads every fixture validation target metadata file", async () => {
  const entries = await readdir(fixtureValidationTargetsDirectory);
  const targetFiles = entries.filter((entry) => entry.endsWith(".yaml")).sort();

  assert.ok(
    targetFiles.length > 0,
    "expected at least one validation target metadata file",
  );

  await Promise.all(
    targetFiles.map(async (targetFile) => {
      const target = path.basename(targetFile, ".yaml");
      const definition = parseValidationTarget(
        await readFile(
          path.join(fixtureValidationTargetsDirectory, targetFile),
          "utf8",
        ),
      );

      assert.equal(
        definition.name,
        target,
        `validation target definition "${target}" must declare a matching name`,
      );
    }),
  );
});
