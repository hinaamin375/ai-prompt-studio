import { useMemo } from "react";

import type { Prompt } from "../../../types/prompt";

import { extractVariables } from "../../analysis/utils/extractVariables";
import { PromptSelector } from "./PromptSelector";

export interface PromptSelection {
  promptId?: number;
  variables: Record<string, string>;
}

interface PromptSelectionPanelProps {
  title: string;
  prompts: Prompt[];
  selection: PromptSelection;
  onChange: (selection: PromptSelection) => void;
}

export function PromptSelectionPanel({
  title,
  prompts,
  selection,
  onChange,
}: PromptSelectionPanelProps) {
  const selectedPrompt = prompts.find(
    (prompt) => prompt.id === selection.promptId,
  );

  const variables = useMemo(() => {
    if (!selectedPrompt) {
      return [];
    }

    return extractVariables(
      `${selectedPrompt.system_prompt}\n${selectedPrompt.user_prompt}`,
    );
  }, [selectedPrompt]);

  function changePrompt(promptId: number) {
    onChange({
      promptId,
      variables: {},
    });
  }

  function changeVariable(name: string, value: string) {
    onChange({
      ...selection,
      variables: {
        ...selection.variables,
        [name]: value,
      },
    });
  }

  return (
    <section className="comparison-column">
      <h2>{title}</h2>

      <PromptSelector
        label="Prompt"
        prompts={prompts}
        value={selection.promptId}
        onChange={changePrompt}
      />

      {!selectedPrompt && (
        <p>Select a prompt to continue.</p>
      )}

      {selectedPrompt && (
        <>
          <h3>Variables</h3>

          {variables.length === 0 && (
            <p>No variables detected.</p>
          )}

          {variables.map((variable) => (
            <div
              key={variable}
              className="form-field"
            >
              <label>{variable}</label>

              <input
                value={
                  selection.variables[variable] ?? ""
                }
                onChange={(event) =>
                  changeVariable(
                    variable,
                    event.target.value,
                  )
                }
              />
            </div>
          ))}
        </>
      )}
    </section>
  );
}