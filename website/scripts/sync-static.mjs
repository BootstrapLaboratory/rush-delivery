import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { repoRoot, websiteRoot } from "../src/lib/docs-tree.mjs";

const schemasSourceDir = path.join(repoRoot, "schemas");
const schemasTargetDir = path.join(websiteRoot, "public", "schemas");

async function main() {
  await rm(schemasTargetDir, { force: true, recursive: true });
  await mkdir(path.dirname(schemasTargetDir), { recursive: true });
  await cp(schemasSourceDir, schemasTargetDir, { recursive: true });
}

await main();
