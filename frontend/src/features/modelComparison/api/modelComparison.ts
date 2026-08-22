import {
  runPrompt,
} from "../../playground/api/promptRuns";

import type {
  ModelComparisonRequest,
  ModelComparisonResult,
} from "../types/modelComparison";


export async function compareModels(
  request: ModelComparisonRequest,
): Promise<ModelComparisonResult> {
  const [
    left,
    right,
  ] = await Promise.all([
    runPrompt(
      request.promptId,
      {
        provider:
          request.left.provider,

        model:
          request.left.model,

        variables:
          request.variables,
      },
    ),

    runPrompt(
      request.promptId,
      {
        provider:
          request.right.provider,

        model:
          request.right.model,

        variables:
          request.variables,
      },
    ),
  ]);

  return {
    left,
    right,
  };
}