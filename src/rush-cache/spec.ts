import type {
  NormalizedRushCacheSpec,
  RushCacheConfig,
  RushCacheSpec,
} from "../model/rush-cache.ts";

export const RUSH_CACHE_TAG_PATTERN = /^[A-Za-z0-9_][A-Za-z0-9._-]{0,127}$/;

export type BuildRushCacheSpecInput = {
  config: RushCacheConfig;
};

export function buildRushCacheSpec(
  input: BuildRushCacheSpecInput,
): RushCacheSpec {
  return {
    paths: [...input.config.paths].sort(),
    version: input.config.version,
  };
}

export function normalizeRushCacheSpec(
  spec: RushCacheSpec,
): NormalizedRushCacheSpec {
  return {
    paths: [...spec.paths].sort(),
    version: spec.version,
  };
}

export function rushCacheTag(spec: RushCacheSpec): string {
  if (!RUSH_CACHE_TAG_PATTERN.test(spec.version)) {
    throw new Error(
      `Rush cache version "${spec.version}" must match ${RUSH_CACHE_TAG_PATTERN} so it can be used as an OCI tag.`,
    );
  }

  return spec.version;
}
