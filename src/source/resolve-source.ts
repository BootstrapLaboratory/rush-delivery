import { dag, type Directory, ExistsType } from "@dagger.io/dagger";

import type {
  GitSourcePlan,
  LocalCopySourcePlan,
  SourcePlan,
} from "../model/source.ts";

export type ResolveSourceOptions = {
  hostEnv?: Record<string, string>;
  repo?: Directory;
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

async function withoutPathIfExists(
  repo: Directory,
  path: string,
): Promise<Directory> {
  if (await repo.exists(path, { expectedType: ExistsType.DirectoryType })) {
    return repo.withoutDirectory(path);
  }

  if (await repo.exists(path, { expectedType: ExistsType.RegularType })) {
    return repo.withoutFile(path);
  }

  return repo;
}

async function directoryEntries(
  repo: Directory,
  path: string,
): Promise<string[]> {
  return path.length === 0 ? repo.entries() : repo.entries({ path });
}

function joinPath(parent: string, child: string): string {
  return parent.length === 0 ? child : `${parent}/${child}`;
}

async function withoutNestedNodeModules(
  repo: Directory,
  path = "",
): Promise<Directory> {
  let nextRepo = repo;

  for (const entry of await directoryEntries(repo, path)) {
    if (entry === ".git") {
      continue;
    }

    const entryPath = joinPath(path, entry);

    if (
      !(await repo.exists(entryPath, {
        expectedType: ExistsType.DirectoryType,
      }))
    ) {
      continue;
    }

    if (entry === "node_modules") {
      nextRepo = nextRepo.withoutDirectory(entryPath);
      continue;
    }

    nextRepo = await withoutNestedNodeModules(nextRepo, entryPath);
  }

  return nextRepo;
}

async function resolveLocalCopySource(
  plan: LocalCopySourcePlan,
  options: ResolveSourceOptions,
): Promise<Directory> {
  if (options.repo === undefined) {
    throw new Error("Local copy source mode requires a repo directory.");
  }

  let nextRepo = options.repo;

  for (const cleanupPath of plan.cleanupPaths) {
    nextRepo = await withoutPathIfExists(nextRepo, cleanupPath);
  }

  return plan.removeNodeModules ? withoutNestedNodeModules(nextRepo) : nextRepo;
}

async function resolveGitSource(
  plan: GitSourcePlan,
  options: ResolveSourceOptions,
): Promise<Directory> {
  return (
    gitRepository(plan, options.hostEnv ?? {})
      .commit(plan.commitSha)
      // Rush compares against deploy tags and PR bases, so keep full history.
      .tree({ depth: -1, discardGitDir: false, includeTags: true })
  );
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
