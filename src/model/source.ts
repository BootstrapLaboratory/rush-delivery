export type SourceMode = "local_copy" | "git";

export type SourceAuth = {
  tokenEnv: string;
  username: string;
};

export type LocalCopySourcePlan = {
  cleanupPaths: string[];
  mode: "local_copy";
  removeNodeModules: boolean;
  sourcePath: string;
  workdir: string;
};

export type GitSourcePlan = {
  auth?: SourceAuth;
  commitSha: string;
  deployTagPrefix: string;
  mode: "git";
  prBaseSha?: string;
  ref?: string;
  repositoryUrl: string;
};

export type SourcePlan = GitSourcePlan | LocalCopySourcePlan;
