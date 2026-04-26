export const RUNTIME_FILES_MOUNT_ROOT = "/runtime-files";

export type HostFileMountSpec = {
  kind: "host_path";
  source_var: string;
  target: string;
};

export type RuntimeFileMountSpec = {
  kind: "runtime_file";
  source: string;
  target: string;
};

export type FileMountSpec = HostFileMountSpec | RuntimeFileMountSpec;

export type DeployWorkspaceSpec = {
  dirs: string[];
  files: string[];
  mode?: "full";
};

export type DeployRuntimeSpec = {
  dry_run_defaults: Record<string, string>;
  env: Record<string, string>;
  file_mounts: FileMountSpec[];
  image: string;
  install: string[];
  pass_env: string[];
  required_host_env: string[];
  workspace: DeployWorkspaceSpec;
};

export type DeployTargetDefinition = {
  deploy_script: string;
  name: string;
  runtime: DeployRuntimeSpec;
};
