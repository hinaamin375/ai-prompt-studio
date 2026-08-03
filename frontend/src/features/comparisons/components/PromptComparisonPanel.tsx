import { useState } from "react";

import { PromptSelector } from "./PromptSelector";
import { usePrompts } from "../../prompts/hooks/usePrompts";

export function PromptComparisonPanel({
  title,
}: {
  title: string;
}) {
  const { data: prompts = [] } = usePrompts();

  const [selectedPromptId, setSelectedPromptId] =
    useState<number>();

  return (
    <section className="comparison-column">
      <h2>{title}</h2>

      <PromptSelector
        label="Prompt"
        prompts={prompts}
        value={selectedPromptId}
        onChange={setSelectedPromptId}
      />

      <p>Select a prompt to continue.</p>
    </section>
  );
}