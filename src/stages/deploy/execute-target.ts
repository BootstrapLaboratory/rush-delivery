import { Directory, Socket } from "@dagger.io/dagger";

import type { DeployTargetResult } from "../../model/deploy-result.ts";
import type { PackageManifestArtifact } from "../../model/package-manifest.ts";
import type {
  ToolchainImagePolicy,
  ToolchainImageProvider,
  ToolchainImageProvidersDefinition,
} from "../../model/toolchain-image.ts";
import { logSubsection } from "../../logging/sections.ts";
import { deployTargetToolchainImageSpec } from "../../toolchain-images/spec.ts";
import {
  buildResolvedToolchainContainer,
  resolveToolchainImage,
} from "../../toolchain-images/resolve.ts";
import { applyRuntimeWorkspace } from "./runtime-workspace.ts";
import { loadDeployTargetDefinition } from "./load-deploy-metadata.ts";
import {
  getRequiredRepoRelativeHostPathSource,
  resolveSpecEnvironment,
  validateRuntimeFilesProvided,
  validateRequiredHostEnv,
} from "./runtime-env.ts";
import {
  buildDeployTargetCommand,
  deployTagName,
  updateDeployTagWithGithubApi,
} from "./deploy-tag.ts";
import { formatDryRunSummary } from "./dry-run-summary.ts";

export async function executeTarget(
  repo: Directory,
  runtimeMountRepo: Directory,
  target: string,
  artifact: PackageManifestArtifact,
  gitSha: string,
  environment: string,
  dryRun: boolean,
  hostEnv: Record<string, string>,
  hostWorkspaceDir: string,
  wave: number,
  toolchainImageProvider: ToolchainImageProvider = "off",
  toolchainImagePolicy: ToolchainImagePolicy = "lazy",
  toolchainImageProviders?: ToolchainImageProvidersDefinition,
  dockerSocket?: Socket,
  deployTagTokenEnv: string = "",
  runtimeFiles?: Directory,
): Promise<DeployTargetResult> {
  const definition = await loadDeployTargetDefinition(repo, target);
  validateRequiredHostEnv(definition.runtime, hostEnv, dryRun, target);
  validateRuntimeFilesProvided(
    definition.runtime.file_mounts,
    runtimeFiles,
    dryRun,
    target,
  );
  const artifactPath = `/workspace/${artifact.deploy_path}`;
  const deployTag = deployTagName(environment, target);
  const envVars = {
    ARTIFACT_PATH: artifactPath,
    DRY_RUN: dryRun ? "1" : "0",
    GIT_SHA: gitSha,
    ...resolveSpecEnvironment(definition.runtime, hostEnv, dryRun, target),
  };
  const command = buildDeployTargetCommand(definition.deploy_script);

  logSubsection(`Deploy target: ${target} (wave ${wave})`);
  console.log(`[deploy-release] wave ${wave}: starting ${target}`);

  if (dryRun) {
    const output = formatDryRunSummary({
      artifact,
      artifactPath,
      definition,
      deployTag,
      dockerSocketEnabled: dockerSocket !== undefined,
      environment,
      envVars,
      gitSha,
      wave,
    });
    console.log(output.trimEnd());

    return {
      artifactPath: envVars.ARTIFACT_PATH,
      output,
      status: "success",
      target,
      wave,
    };
  }

  const toolchainImage = await resolveToolchainImage(
    deployTargetToolchainImageSpec(definition),
    {
      hostEnv,
      policy: toolchainImagePolicy,
      provider: toolchainImageProvider,
      providers: toolchainImageProviders,
    },
  );
  let container = applyRuntimeWorkspace(
    buildResolvedToolchainContainer(toolchainImage),
    repo,
    definition.runtime.workspace,
  ).withWorkdir("/workspace");

  for (const fileMount of definition.runtime.file_mounts) {
    if (fileMount.kind === "host_path") {
      const sourcePath = getRequiredRepoRelativeHostPathSource(
        hostEnv,
        fileMount.source_var,
        target,
        hostWorkspaceDir,
      );
      container = container.withMountedFile(
        fileMount.target,
        runtimeMountRepo.file(sourcePath),
      );
      continue;
    }

    if (runtimeFiles === undefined) {
      throw new Error(
        `Runtime files directory is required for target "${target}" because it references "${fileMount.source}".`,
      );
    }

    const runtimeFile = runtimeFiles.file(fileMount.source);

    try {
      await runtimeFile.sync();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      throw new Error(
        `Runtime file "${fileMount.source}" for target "${target}" was not found in runtimeFiles: ${message}`,
      );
    }

    container = container.withMountedFile(fileMount.target, runtimeFile);
  }

  if (dockerSocket !== undefined) {
    container = container.withUnixSocket("/var/run/docker.sock", dockerSocket);
  }

  for (const [name, value] of Object.entries(envVars)) {
    container = container.withEnvVariable(name, value);
  }

  const deployOutput = await container
    .withExec(["bash", "-lc", command])
    .stdout();
  const tagOutput = await updateDeployTagWithGithubApi(
    environment,
    target,
    gitSha,
    hostEnv,
    deployTagTokenEnv,
  );
  const output = `${deployOutput}${tagOutput}`;

  console.log(`[deploy-release] wave ${wave}: finished ${target}`);

  return {
    artifactPath: envVars.ARTIFACT_PATH,
    output,
    status: "success",
    target,
    wave,
  };
}
