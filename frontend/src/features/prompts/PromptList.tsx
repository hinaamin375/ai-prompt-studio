import type { Prompt } from "../../types/prompt";
import { PromptCard } from "./components/PromptCard";

interface PromptListProps {
  prompts: Prompt[];
}

export function PromptList({
  prompts,
}: PromptListProps) {
  return (
    <div className="prompt-grid">
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
        />
      ))}
    </div>
  );
}