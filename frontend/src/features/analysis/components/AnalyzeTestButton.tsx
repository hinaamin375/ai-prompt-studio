import { usePromptAnalysis } from "../hooks/usePromptAnalysis";

interface AnalyzeTestButtonProps {
  promptId: number;
}

export function AnalyzeTestButton({
  promptId,
}: AnalyzeTestButtonProps) {
  const analysisMutation = usePromptAnalysis();

  function handleAnalyze(): void {
    analysisMutation.mutate(
      {
        promptId,
        data: {
          variables: {},
        },
      },
      {
        onSuccess: (result) => {
          console.log("Prompt analysis:", result);
        },
        onError: (error) => {
          console.error(
            "Prompt analysis failed:",
            error,
          );
        },
      },
    );
  }

  return (
    <div>
      <button
        type="button"
        className="primary-button"
        onClick={handleAnalyze}
        disabled={analysisMutation.isPending}
      >
        {analysisMutation.isPending
          ? "Analyzing..."
          : "Analyze prompt"}
      </button>

      {analysisMutation.isError && (
        <p className="field-error">
          The prompt could not be analyzed.
        </p>
      )}

      {analysisMutation.isSuccess && (
        <p>
          Analysis completed. Open the browser console
          to inspect the result.
        </p>
      )}
    </div>
  );
}