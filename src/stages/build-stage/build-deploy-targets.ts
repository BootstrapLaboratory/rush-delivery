import { Directory, File } from "@dagger.io/dagger";

import { parseCiPlan } from "../../ci-plan/parse-ci-plan.ts";
import { logSection } from "../../logging/sections.ts";
import { installRush, prepareRushContainer } from "../../rush/container.ts";
import { parseDeployEnvFile } from "../deploy/runtime-env.ts";
import {
  resolvePackageBuildEnvironment,
  withBuildEnvironment,
} from "./build-env.ts";
import { buildRushBuildSteps } from "./rush-build-plan.ts";

const WORKDIR = "/workspace";

export async function buildDeployTargets(
  repo: Directory,
  ciPlanFile: File,
  deployEnvFile?: File,
  dryRun: boolean = false,
): Promise<Directory> {
  const ciPlan = parseCiPlan(await ciPlanFile.contents());
  const hostEnv = deployEnvFile
    ? parseDeployEnvFile(await deployEnvFile.contents())
    : {};

  logSection("Rush build");

  if (ciPlan.deploy_targets.length === 0) {
    console.log("[build] no deploy targets selected");
    return repo;
  }

  console.log(`[build] Rush targets: ${ciPlan.deploy_targets.join(", ")}`);

  const buildEnv = await resolvePackageBuildEnvironment(
    repo,
    ciPlan.deploy_targets,
    hostEnv,
    {
      dryRun,
      requirePackageTargets: true,
      stage: "build",
    },
  );
  if (Object.keys(buildEnv).length > 0) {
    console.log(
      `[build] Environment: ${Object.keys(buildEnv).sort().join(", ")}`,
    );
  }

  let container = withBuildEnvironment(
    installRush(await prepareRushContainer(repo)).withEnvVariable(
      "FAILURE_MODE",
      "deploy",
    ),
    buildEnv,
  );

  for (const { command, args } of buildRushBuildSteps(ciPlan)) {
    console.log(`[build] Rush command: ${args[1]}`);
    container = container.withExec([command, ...args], {
      expand: false,
    });
  }

  return container.directory(WORKDIR);
}
