import type { SourcePlan } from "../model/source.ts";
import type {
  ToolchainImageProvider,
  ToolchainImageProvidersDefinition,
} from "../model/toolchain-image.ts";
import { buildSourcePlan } from "../source/source-plan.ts";

const SOURCE_BOOTSTRAP_GITHUB_REPOSITORY_ENV = "GITHUB_REPOSITORY";
const SOURCE_BOOTSTRAP_GITHUB_TOKEN_ENV = "GITHUB_TOKEN";
const SOURCE_BOOTSTRAP_GITHUB_USERNAME_ENV = "GITHUB_ACTOR";

export type SourceBootstrapToolchainOptions = {
  toolchainImageProvider: ToolchainImageProvider;
  toolchainImageProviders?: ToolchainImageProvidersDefinition;
};

export type WorkflowSourceInput = {
  deployTagPrefix?: string;
  gitSha: string;
  prBaseSha?: string;
  sourceAuthTokenEnv?: string;
  sourceAuthUsername?: string;
  sourceMode?: string;
  sourceRef?: string;
  sourceRepositoryUrl?: string;
};

export function buildWorkflowSourcePlan(
  input: WorkflowSourceInput,
): SourcePlan {
  return buildSourcePlan({
    authTokenEnv:
      input.sourceAuthTokenEnv === undefined ||
      input.sourceAuthTokenEnv.length === 0
        ? undefined
        : input.sourceAuthTokenEnv,
    authUsername:
      input.sourceAuthUsername === undefined ||
      input.sourceAuthUsername.length === 0
        ? undefined
        : input.sourceAuthUsername,
    commitSha: input.gitSha,
    deployTagPrefix: input.deployTagPrefix,
    mode: input.sourceMode,
    prBaseSha: input.prBaseSha,
    ref:
      input.sourceRef === undefined || input.sourceRef.length === 0
        ? undefined
        : input.sourceRef,
    repositoryUrl:
      input.sourceRepositoryUrl === undefined ||
      input.sourceRepositoryUrl.length === 0
        ? undefined
        : input.sourceRepositoryUrl,
  });
}

function hasNonEmptyHostEnv(
  hostEnv: Record<string, string>,
  name: string,
): boolean {
  return hostEnv[name] !== undefined && hostEnv[name].length > 0;
}

function buildSourceBootstrapGithubProviders(): ToolchainImageProvidersDefinition {
  return {
    providers: {
      github: {
        image_namespace: "rush-delivery-toolchains",
        kind: "github_container_registry",
        registry: "ghcr.io",
        repository_env: SOURCE_BOOTSTRAP_GITHUB_REPOSITORY_ENV,
        token_env: SOURCE_BOOTSTRAP_GITHUB_TOKEN_ENV,
        username_env: SOURCE_BOOTSTRAP_GITHUB_USERNAME_ENV,
      },
    },
  };
}

export function buildSourceBootstrapToolchainOptions(input: {
  hostEnv?: Record<string, string>;
  toolchainImageProvider: ToolchainImageProvider;
}): SourceBootstrapToolchainOptions {
  const { toolchainImageProvider } = input;

  if (toolchainImageProvider === "off") {
    return { toolchainImageProvider: "off" };
  }

  const hostEnv = input.hostEnv ?? {};
  const canUseGithubBootstrap = [
    SOURCE_BOOTSTRAP_GITHUB_REPOSITORY_ENV,
    SOURCE_BOOTSTRAP_GITHUB_TOKEN_ENV,
    SOURCE_BOOTSTRAP_GITHUB_USERNAME_ENV,
  ].every((name) => hasNonEmptyHostEnv(hostEnv, name));

  if (!canUseGithubBootstrap) {
    return { toolchainImageProvider: "off" };
  }

  return {
    toolchainImageProvider: "github",
    toolchainImageProviders: buildSourceBootstrapGithubProviders(),
  };
}
