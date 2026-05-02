import { parse as parseYaml } from "yaml";

import { assertKnownKeys } from "../../metadata/parse-utils.ts";
import type {
  PackageArtifactDefinition,
  PackageBuildSpec,
  PackageTargetDefinition,
} from "../../model/package-target.ts";

const ENV_NAME_PATTERN = /^[A-Z][A-Z0-9_]*$/;

function parseRequiredString(rawValue: unknown, name: string): string {
  if (typeof rawValue !== "string" || rawValue.length === 0) {
    throw new Error(`${name} must be a non-empty string.`);
  }

  return rawValue;
}

function parseStringArray(rawValue: unknown, name: string): string[] {
  if (rawValue === undefined) {
    return [];
  }

  if (!Array.isArray(rawValue)) {
    throw new Error(`${name} must be an array.`);
  }

  return rawValue.map((entry) => parseRequiredString(entry, `${name} entry`));
}

function parseEnvNameArray(rawValue: unknown, name: string): string[] {
  const values = parseStringArray(rawValue, name);
  const normalizedValues: string[] = [];

  for (const value of values) {
    if (!ENV_NAME_PATTERN.test(value)) {
      throw new Error(`${name} entry must match ${ENV_NAME_PATTERN}.`);
    }

    if (!normalizedValues.includes(value)) {
      normalizedValues.push(value);
    }
  }

  return normalizedValues;
}

function parseStringRecord(rawValue: unknown, name: string): Record<string, string> {
  if (rawValue === undefined) {
    return {};
  }

  if (
    typeof rawValue !== "object" ||
    rawValue === null ||
    Array.isArray(rawValue)
  ) {
    throw new Error(`${name} must be a mapping.`);
  }

  const normalizedValues: Record<string, string> = {};

  for (const [key, entry] of Object.entries(rawValue)) {
    if (!ENV_NAME_PATTERN.test(key)) {
      throw new Error(`${name} key "${key}" must match ${ENV_NAME_PATTERN}.`);
    }

    if (typeof entry !== "string") {
      throw new Error(`${name} value for "${key}" must be a string.`);
    }

    normalizedValues[key] = entry;
  }

  return normalizedValues;
}

function parseEnvNameRecord(
  rawValue: unknown,
  name: string,
): Record<string, string> {
  const normalizedValues = parseStringRecord(rawValue, name);

  for (const [key, value] of Object.entries(normalizedValues)) {
    if (!ENV_NAME_PATTERN.test(value)) {
      throw new Error(
        `${name} value for "${key}" "${value}" must match ${ENV_NAME_PATTERN}.`,
      );
    }
  }

  return normalizedValues;
}

function parsePackageArtifact(rawValue: unknown): PackageArtifactDefinition {
  if (
    typeof rawValue !== "object" ||
    rawValue === null ||
    Array.isArray(rawValue)
  ) {
    throw new Error("Package target artifact must be a mapping.");
  }

  const kind = parseRequiredString(
    "kind" in rawValue ? rawValue.kind : undefined,
    "Package target artifact kind",
  );

  switch (kind) {
    case "directory":
      assertKnownKeys(
        rawValue as Record<string, unknown>,
        ["kind", "path"],
        "Package target artifact",
      );
      return {
        kind,
        path: parseRequiredString(
          "path" in rawValue ? rawValue.path : undefined,
          "Package target artifact path",
        ),
      };

    case "rush_deploy_archive":
      assertKnownKeys(
        rawValue as Record<string, unknown>,
        ["kind", "output", "project", "scenario"],
        "Package target artifact",
      );
      return {
        kind,
        output: parseRequiredString(
          "output" in rawValue ? rawValue.output : undefined,
          "Package target artifact output",
        ),
        project: parseRequiredString(
          "project" in rawValue ? rawValue.project : undefined,
          "Package target artifact project",
        ),
        scenario: parseRequiredString(
          "scenario" in rawValue ? rawValue.scenario : undefined,
          "Package target artifact scenario",
        ),
      };

    default:
      throw new Error(`Unsupported package target artifact kind "${kind}".`);
  }
}

function parsePackageBuild(rawValue: unknown): PackageBuildSpec {
  if (rawValue === undefined) {
    return {
      dry_run_defaults: {},
      map_env: {},
      pass_env: [],
    };
  }

  if (
    typeof rawValue !== "object" ||
    rawValue === null ||
    Array.isArray(rawValue)
  ) {
    throw new Error("Package target build must be a mapping.");
  }

  assertKnownKeys(
    rawValue as Record<string, unknown>,
    ["dry_run_defaults", "map_env", "pass_env"],
    "Package target build",
  );

  return {
    dry_run_defaults: parseStringRecord(
      "dry_run_defaults" in rawValue ? rawValue.dry_run_defaults : undefined,
      "Package target build dry_run_defaults",
    ),
    map_env: parseEnvNameRecord(
      "map_env" in rawValue ? rawValue.map_env : undefined,
      "Package target build map_env",
    ),
    pass_env: parseEnvNameArray(
      "pass_env" in rawValue ? rawValue.pass_env : undefined,
      "Package target build pass_env",
    ),
  };
}

export function parsePackageTarget(
  packageTargetYaml: string,
): PackageTargetDefinition {
  const parsedValue = parseYaml(packageTargetYaml);

  if (
    typeof parsedValue !== "object" ||
    parsedValue === null ||
    Array.isArray(parsedValue)
  ) {
    throw new Error("Package target file must define a top-level mapping.");
  }

  assertKnownKeys(
    parsedValue as Record<string, unknown>,
    ["artifact", "build", "name"],
    "Package target file",
  );

  return {
    artifact: parsePackageArtifact(
      "artifact" in parsedValue ? parsedValue.artifact : undefined,
    ),
    build: parsePackageBuild(
      "build" in parsedValue ? parsedValue.build : undefined,
    ),
    name: parseRequiredString(
      "name" in parsedValue ? parsedValue.name : undefined,
      "Package target name",
    ),
  };
}
