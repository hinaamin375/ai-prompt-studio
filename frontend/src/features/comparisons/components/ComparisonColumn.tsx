import type { Prompt } from "../../../types/prompt";

import { PromptSelector } from "./PromptSelector";

interface ComparisonColumnProps {
  title: string;

  prompts: Prompt[];

  selectedPromptId?: number;

  onPromptChange: (
    promptId: number,
  ) => void;

  children: React.ReactNode;
}

export function ComparisonColumn({
  title,
  prompts,
  selectedPromptId,
  onPromptChange,
  children,
}: ComparisonColumnProps) {
  return (
    <section className="comparison-column">

      <h2>{title}</h2>

      <PromptSelector
        label="Prompt"
        prompts={prompts}
        value={selectedPromptId}
        onChange={onPromptChange}
      />

      {children}

    </section>
  );
}