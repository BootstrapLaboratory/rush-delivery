import type { EnvPassthroughSpec, HostEnv } from "../model/env.ts";

function isNonEmptyString(value: string | undefined): value is string {
  return typeof value === "string" && value.length > 0;
}

type ResolveEnvironmentInput = {
  context: string;
  dryRun: boolean;
  hostEnv: HostEnv;
  spec: EnvPassthroughSpec;
  target: string;
};

function resolveSourceValue(
  input: ResolveEnvironmentInput,
  sourceName: string,
  targetName: string,
): string {
  const hostValue = input.hostEnv[sourceName];

  if (isNonEmptyString(hostValue)) {
    return hostValue;
  }

  const dryRunDefault = input.spec.dry_run_defaults[sourceName];
  if (input.dryRun && isNonEmptyString(dryRunDefault)) {
    return dryRunDefault;
  }

  const mappingHint =
    sourceName === targetName ? "" : ` mapped to "${targetName}"`;

  throw new Error(
    `Missing required host environment variable "${sourceName}"${mappingHint} for ${input.context} "${input.target}".`,
  );
}

function assignResolvedValue(
  envVars: Record<string, string>,
  name: string,
  value: string,
  input: ResolveEnvironmentInput,
): void {
  const existingValue = envVars[name];

  if (existingValue !== undefined && existingValue !== value) {
    throw new Error(
      `Environment variable "${name}" for ${input.context} "${input.target}" is resolved more than once with different values.`,
    );
  }

  envVars[name] = value;
}

export function resolvePassThroughEnvironment(
  input: ResolveEnvironmentInput,
): Record<string, string> {
  const envVars: Record<string, string> = {};

  for (const name of input.spec.pass_env) {
    assignResolvedValue(
      envVars,
      name,
      resolveSourceValue(input, name, name),
      input,
    );
  }

  for (const [targetName, sourceName] of Object.entries(input.spec.map_env)) {
    assignResolvedValue(
      envVars,
      targetName,
      resolveSourceValue(input, sourceName, targetName),
      input,
    );
  }

  return envVars;
}
