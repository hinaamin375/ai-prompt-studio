import { usePrompts } from "../features/prompts/hooks/usePrompts";

import { PromptComparisonPanel } from "../features/comparisons/components/PromptComparisonPanel";

export default function ComparisonsPage() {
  const { data: prompts = [] } = usePrompts();

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">
          Prompt Management
        </p>

        <h2>Prompt Comparison</h2>

        <p>
          Compare two saved prompts side by side
          using the Prompt Engine.
        </p>
      </header>

      <PromptComparisonPanel
        prompts={prompts}
      />
    </>
  );
}