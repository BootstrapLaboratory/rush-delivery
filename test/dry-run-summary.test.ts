import * as assert from "node:assert/strict";
import { test } from "node:test";

import { formatDryRunSummary } from "../src/stages/deploy/dry-run-summary.ts";

test("dry-run output lists runtime file bundle mounts", () => {
  const output = formatDryRunSummary({
    artifact: {
      deploy_path: "deploy/server",
      kind: "directory",
      path: "deploy/server",
    },
    artifactPath: "/workspace/deploy/server",
    definition: {
      deploy_script: "deploy/server.sh",
      name: "server",
      runtime: {
        dry_run_defaults: {},
        env: {},
        file_mounts: [
          {
            kind: "runtime_file",
            source: "gcp-credentials.json",
            target: "/runtime-files/gcp-credentials.json",
          },
        ],
        image: "node:24-bookworm-slim",
        install: [],
        map_env: {},
        pass_env: [],
        required_host_env: [],
        workspace: {
          dirs: [],
          files: [],
        },
      },
    },
    deployTag: "deploy/prod/server",
    dockerSocketEnabled: false,
    environment: "prod",
    envVars: {},
    gitSha: "abc123",
    wave: 1,
  });

  assert.match(
    output,
    /source=gcp-credentials\.json target=\/runtime-files\/gcp-credentials\.json/,
  );
});
