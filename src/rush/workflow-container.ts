import type { Container, Directory } from "@dagger.io/dagger";

import type { RushCacheProvidersDefinition } from "../model/rush-cache.ts";
import {
  publishResolvedRushInstallCache,
  resolveRushInstallCache,
} from "../rush-cache/resolve.ts";
import { buildRushCacheSpec } from "../rush-cache/spec.ts";
import { installRush, prepareRushContainer } from "./container.ts";
import type { RushProviderOptions } from "./provider-options.ts";

export type RushWorkflowContainerOptions = RushProviderOptions & {
  hostEnv?: Record<string, string>;
};

function buildRushInstallCacheSpec(providers: RushCacheProvidersDefinition) {
  return buildRushCacheSpec({
    config: providers.cache,
  });
}

export async function prepareRushWorkflowContainer(
  repo: Directory,
  options: RushWorkflowContainerOptions,
): Promise<Container> {
  return prepareRushContainer(repo, {
    hostEnv: options.hostEnv,
    policy: options.toolchainImagePolicy,
    provider: options.toolchainImageProvider,
    providers: options.toolchainImageProviders,
  });
}

export async function installRushWithCache(
  repo: Directory,
  container: Container,
  options: RushWorkflowContainerOptions,
): Promise<Container> {
  const cacheSpec = buildRushInstallCacheSpec(options.rushCacheProviders);
  const resolvedCache = await resolveRushInstallCache(container, cacheSpec, {
    hostEnv: options.hostEnv,
    policy: options.rushCachePolicy,
    provider: options.rushCacheProvider,
    providers: options.rushCacheProviders,
  });
  const rushContainer = installRush(resolvedCache.container, {
    beforeInstallCommand: resolvedCache.restoreCommand,
  });

  await publishResolvedRushInstallCache(rushContainer, resolvedCache);

  return rushContainer;
}
