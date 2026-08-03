import type { Prompt } from "../../../types/prompt";
interface PromptSelectorProps {
  label: string;
  prompts: Prompt[];
  value?: number;
  onChange: (promptId: number) => void;
}

export function PromptSelector({
  label,
  prompts,
  value,
  onChange,
}: PromptSelectorProps) {
  return (
    <div className="form-field">
      <label>{label}</label>

      <select
        value={value ?? ""}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
      >
        <option value="">
          Select a prompt...
        </option>

        {prompts.map((prompt) => (
          <option
            key={prompt.id}
            value={prompt.id}
          >
            {prompt.title}
          </option>
        ))}
      </select>
    </div>
  );
}