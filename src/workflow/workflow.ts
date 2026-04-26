import { Directory, File, Socket } from "@dagger.io/dagger";

import { deployRelease } from "../stages/deploy/deploy-release.ts";
import { logSection } from "../logging/sections.ts";
import { validateMetadataContract } from "../metadata/dagger-metadata-contract.ts";
import { formatMetadataContractValidationResult } from "../metadata/metadata-contract.ts";
import {
  parseToolchainImagePolicy,
  parseToolchainImageProvider,
} from "../toolchain-images/options.ts";
import { parseToolchainImageProviders } from "../toolchain-images/parse-providers.ts";
import { toolchainImageProvidersPath } from "../toolchain-images/metadata-paths.ts";
import {
  parseRushCachePolicy,
  parseRushCacheProvider,
} from "../rush-cache/options.ts";
import { parseRushCacheProviders } from "../rush-cache/parse-providers.ts";
import { rushCacheProvidersPath } from "../rush-cache/metadata-paths.ts";
import { parseDeployEnvFile } from "../stages/deploy/runtime-env.ts";
import { resolveSource } from "../source/resolve-source.ts";
import { buildWorkflowSourcePlan } from "./source-options.ts";
import { runBuildPackageWorkflow } from "./build-package-runner.ts";

const PACKAGE_MANIFEST_PATH = ".dagger/runtime/package-manifest.json";

export type WorkflowInput = {
  artifactPrefix?: string;
  deployEnvFile?: File;
  deployTagPrefix?: string;
  dockerSocket?: Socket;
  dryRun?: boolean;
  environment?: string;
  eventName?: string;
  forceTargetsJson?: string;
  gitSha: string;
  hostWorkspaceDir?: string;
  prBaseSha?: string;
  repo?: Directory;
  runtimeFiles?: Directory;
  rushCachePolicy?: string;
  rushCacheProvider?: string;
  sourceAuthTokenEnv?: string;
  sourceAuthUsername?: string;
  sourceMode?: string;
  sourceRef?: string;
  sourceRepositoryUrl?: string;
  toolchainImagePolicy?: string;
  toolchainImageProvider?: string;
};

export async function workflow(input: WorkflowInput): Promise<string> {
  const {
    artifactPrefix = "deploy-target",
    deployEnvFile,
    deployTagPrefix = "deploy/prod",
    dockerSocket,
    dryRun = true,
    environment = "prod",
    eventName = "push",
    forceTargetsJson = "[]",
    gitSha,
    hostWorkspaceDir = "",
    prBaseSha = "",
    repo,
    runtimeFiles,
    rushCachePolicy = "lazy",
    rushCacheProvider = "off",
    sourceAuthTokenEnv = "",
    sourceAuthUsername = "",
    sourceMode = "local_copy",
    sourceRef = "",
    sourceRepositoryUrl = "",
    toolchainImagePolicy = "lazy",
    toolchainImageProvider = "off",
  } = input;

  logSection("Release workflow");
  const hostEnv = deployEnvFile
    ? parseDeployEnvFile(await deployEnvFile.contents())
    : {};
  const sourcePlan = buildWorkflowSourcePlan({
    sourceAuthTokenEnv,
    sourceAuthUsername,
    deployTagPrefix,
    gitSha,
    prBaseSha,
    sourceMode,
    sourceRef,
    sourceRepositoryUrl,
  });
  const parsedToolchainImageProvider = parseToolchainImageProvider(
    toolchainImageProvider,
  );
  parseToolchainImagePolicy(toolchainImagePolicy);

  logSection("Source acquisition");
  console.log(`[source] mode=${sourcePlan.mode}`);
  const sourceRepo = await resolveSource(sourcePlan, { hostEnv, repo });

  logSection("Metadata contract");

  console.log(
    formatMetadataContractValidationResult(
      await validateMetadataContract(sourceRepo),
    ),
  );

  const parsedRushCacheProvider = parseRushCacheProvider(rushCacheProvider);
  parseRushCachePolicy(rushCachePolicy);
  const toolchainImageProviders =
    parsedToolchainImageProvider === "off"
      ? undefined
      : parseToolchainImageProviders(
          await sourceRepo.file(toolchainImageProvidersPath).contents(),
        );
  const rushCacheProviders = parseRushCacheProviders(
    await sourceRepo.file(rushCacheProvidersPath).contents(),
  );

  const { ciPlan, repo: packagedRepo } = await runBuildPackageWorkflow(
    sourceRepo,
    eventName,
    forceTargetsJson,
    prBaseSha,
    deployTagPrefix,
    artifactPrefix,
    {
      hostEnv,
      rushCacheProvider: parsedRushCacheProvider,
      rushCacheProviders,
      toolchainImageProvider: parsedToolchainImageProvider,
      toolchainImageProviders,
    },
  );

  console.log(
    `[workflow] mode=${ciPlan.mode} deploy_targets=${JSON.stringify(ciPlan.deploy_targets)} validate_targets=${JSON.stringify(ciPlan.validate_targets)}`,
  );

  const deployTagTokenEnv =
    sourcePlan.mode === "git" ? (sourcePlan.auth?.tokenEnv ?? "") : "";

  return deployRelease(
    packagedRepo,
    gitSha,
    JSON.stringify(ciPlan.deploy_targets),
    environment,
    dryRun,
    deployEnvFile,
    packagedRepo.file(PACKAGE_MANIFEST_PATH),
    hostWorkspaceDir,
    toolchainImageProvider,
    toolchainImagePolicy,
    dockerSocket,
    packagedRepo,
    deployTagTokenEnv,
    runtimeFiles,
  );
}
