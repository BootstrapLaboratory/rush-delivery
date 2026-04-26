import { dag, type Container, type Directory } from "@dagger.io/dagger";

import type {
  GitSourcePlan,
  LocalCopySourcePlan,
  SourcePlan,
} from "../model/source.ts";
import type {
  ToolchainImageProvider,
  ToolchainImageProvidersDefinition,
} from "../model/toolchain-image.ts";
import { rushWorkflowToolchainSpec } from "../rush/container.ts";
import {
  buildResolvedToolchainContainer,
  resolveToolchainImage,
} from "../toolchain-images/resolve.ts";
import { buildLocalCopySourceCommand } from "./source-commands.ts";

export type ResolveSourceOptions = {
  hostEnv?: Record<string, string>;
  repo?: Directory;
  toolchainImageProvider?: ToolchainImageProvider;
  toolchainImageProviders?: ToolchainImageProvidersDefinition;
};

function requireHostEnv(
  hostEnv: Record<string, string>,
  name: string,
  context: string,
): string {
  const value = hostEnv[name];

  if (value === undefined || value.length === 0) {
    throw new Error(`${context} requires host env ${name}.`);
  }

  return value;
}

async function sourceBaseContainer(
  options: ResolveSourceOptions,
): Promise<Container> {
  return buildResolvedToolchainContainer(
    await resolveToolchainImage(rushWorkflowToolchainSpec(), {
      hostEnv: options.hostEnv,
      provider: options.toolchainImageProvider,
      providers: options.toolchainImageProviders,
    }),
  );
}

function gitRepository(
  plan: GitSourcePlan,
  hostEnv: Record<string, string>,
): ReturnType<typeof dag.git> {
  if (plan.auth === undefined) {
    return dag.git(plan.repositoryUrl);
  }

  const token = requireHostEnv(
    hostEnv,
    plan.auth.tokenEnv,
    "Git source authentication",
  );
  const secret = dag.setSecret("rush-delivery-git-token", token);

  return dag.git(plan.repositoryUrl, {
    httpAuthToken: secret,
    httpAuthUsername: plan.auth.username,
  });
}

async function resolveLocalCopySource(
  plan: LocalCopySourcePlan,
  options: ResolveSourceOptions,
): Promise<Directory> {
  if (options.repo === undefined) {
    throw new Error("Local copy source mode requires a repo directory.");
  }

  return (await sourceBaseContainer(options))
    .withDirectory(plan.sourcePath, options.repo)
    .withExec(["bash", "-lc", buildLocalCopySourceCommand(plan)], {
      expand: false,
    })
    .directory(plan.workdir);
}

async function resolveGitSource(
  plan: GitSourcePlan,
  options: ResolveSourceOptions,
): Promise<Directory> {
  return gitRepository(plan, options.hostEnv ?? {})
    .commit(plan.commitSha)
    // Rush compares against deploy tags and PR bases, so keep full history.
    .tree({ depth: -1, discardGitDir: false, includeTags: true });
}

export async function resolveSource(
  plan: SourcePlan,
  options: ResolveSourceOptions = {},
): Promise<Directory> {
  switch (plan.mode) {
    case "local_copy":
      return resolveLocalCopySource(plan, options);
    case "git":
      return resolveGitSource(plan, options);
  }
}
