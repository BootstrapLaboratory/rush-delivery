import type { EnvPassthroughSpec } from "./env.ts";

export type PackageArtifactDefinition =
  | {
      kind: "directory";
      path: string;
    }
  | {
      kind: "rush_deploy_archive";
      output: string;
      project: string;
      scenario: string;
    };

export type PackageBuildSpec = EnvPassthroughSpec;

export type PackageTargetDefinition = {
  artifact: PackageArtifactDefinition;
  build: PackageBuildSpec;
  name: string;
};
