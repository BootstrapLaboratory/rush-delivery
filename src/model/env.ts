export type EnvPassthroughSpec = {
  dry_run_defaults: Record<string, string>;
  map_env: Record<string, string>;
  pass_env: string[];
};

export type HostEnv = Record<string, string | undefined>;
