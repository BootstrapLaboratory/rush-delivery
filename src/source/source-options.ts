import type { SourcePlan } from "../model/source.ts";
import { buildSourcePlan } from "./source-plan.ts";

export type SourceAcquisitionInput = {
  deployTagPrefix?: string;
  gitSha?: string;
  prBaseSha?: string;
  sourceAuthTokenEnv?: string;
  sourceAuthUsername?: string;
  sourceMode?: string;
  sourceRef?: string;
  sourceRepositoryUrl?: string;
};

export type WorkflowSourceInput = SourceAcquisitionInput & {
  gitSha: string;
};

export function buildSourceAcquisitionPlan(
  input: SourceAcquisitionInput = {},
): SourcePlan {
  return buildSourcePlan({
    authTokenEnv:
      input.sourceAuthTokenEnv === undefined ||
      input.sourceAuthTokenEnv.length === 0
        ? undefined
        : input.sourceAuthTokenEnv,
    authUsername:
      input.sourceAuthUsername === undefined ||
      input.sourceAuthUsername.length === 0
        ? undefined
        : input.sourceAuthUsername,
    commitSha: input.gitSha,
    deployTagPrefix: input.deployTagPrefix,
    mode: input.sourceMode,
    prBaseSha: input.prBaseSha,
    ref:
      input.sourceRef === undefined || input.sourceRef.length === 0
        ? undefined
        : input.sourceRef,
    repositoryUrl:
      input.sourceRepositoryUrl === undefined ||
      input.sourceRepositoryUrl.length === 0
        ? undefined
        : input.sourceRepositoryUrl,
  });
}

export function buildWorkflowSourcePlan(
  input: WorkflowSourceInput,
): SourcePlan {
  return buildSourceAcquisitionPlan(input);
}
