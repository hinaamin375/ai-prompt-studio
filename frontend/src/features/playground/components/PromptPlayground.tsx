import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  usePromptAnalysis,
} from "../../analysis";

import {
  extractVariables,
} from "../../analysis/utils/extractVariables";

import type {
  Prompt,
} from "../../../types/prompt";


interface PromptPlaygroundProps {
  prompt: Prompt;
}


export function PromptPlayground({
  prompt,
}: PromptPlaygroundProps) {
  const variableNames = useMemo(
    () =>
      extractVariables(
        [
          prompt.system_prompt ?? "",
          prompt.user_prompt,
        ].join("\n"),
      ),
    [
      prompt.system_prompt,
      prompt.user_prompt,
    ],
  );

  const [values, setValues] = useState<
    Record<string, string>
  >({});

  const analysisMutation =
    usePromptAnalysis();


  useEffect(() => {
    setValues((currentValues) => {
      const nextValues:
        Record<string, string> = {};

      for (const name of variableNames) {
        nextValues[name] =
          currentValues[name] ?? "";
      }

      return nextValues;
    });
  }, [variableNames]);


  useEffect(() => {
    const timeout = window.setTimeout(
      () => {
        analysisMutation.mutate({
          promptId: prompt.id,
          data: {
            variables: values,
          },
        });
      },
      300,
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    prompt.id,
    values,
  ]);


  function handleVariableChange(
    variableName: string,
    value: string,
  ): void {
    setValues((currentValues) => ({
      ...currentValues,
      [variableName]: value,
    }));
  }


  const analysis =
    analysisMutation.data;

  const renderedMessages =
    analysis?.rendered_document?.messages ?? [];


  return (
    <div className="playground">
      <div className="playground-grid">
        <section className="playground-panel">
          <div className="playground-panel-header">
            <div>
              <p className="eyebrow">
                Inputs
              </p>

              <h2>Variables</h2>

              <p>
                Supply values for the template
                variables in this prompt.
              </p>
            </div>

            <span className="playground-count">
              {variableNames.length}
            </span>
          </div>


          <div className="playground-panel-body">
            {variableNames.length === 0 ? (
              <div className="playground-empty">
                This prompt has no template
                variables.
              </div>
            ) : (
              <div className="playground-fields">
                {variableNames.map(
                  (variableName) => (
                    <div
                      key={variableName}
                      className="playground-field"
                    >
                      <label
                        htmlFor={
                          `playground-${variableName}`
                        }
                      >
                        {variableName
                          .replaceAll("_", " ")
                          .replace(
                            /\b\w/g,
                            (character) =>
                              character.toUpperCase(),
                          )}
                      </label>

                      <textarea
                        id={
                          `playground-${variableName}`
                        }
                        value={
                          values[
                            variableName
                          ] ?? ""
                        }
                        rows={4}
                        placeholder={
                          `Enter ${variableName}`
                        }
                        onChange={(event) =>
                          handleVariableChange(
                            variableName,
                            event.target.value,
                          )
                        }
                      />

                      <code>
                        {`{{${variableName}}}`}
                      </code>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </section>


        <section className="playground-panel">
          <div className="playground-panel-header">
            <div>
              <p className="eyebrow">
                Preview
              </p>

              <h2>Rendered Prompt</h2>

              <p>
                Updates automatically as variable
                values change.
              </p>
            </div>

            {analysisMutation.isPending && (
              <span className="playground-status">
                Rendering...
              </span>
            )}
          </div>


          <div className="playground-panel-body">
            {analysisMutation.isError && (
              <div className="playground-error">
                Could not render this prompt.
              </div>
            )}


            {!analysis &&
              analysisMutation.isPending && (
                <div className="playground-empty">
                  Preparing preview...
                </div>
              )}


            {analysis && (
              <>
                <div className="playground-rendered">
                  {renderedMessages.map(
                    (message, index) => (
                      <div
                        key={index}
                        className="playground-message"
                      >
                        <div className="playground-role">
                          {message.role}
                        </div>

                        <pre>
                          {message.content}
                        </pre>
                      </div>
                    ),
                  )}
                </div>


                {analysis.missing_variables.length >
                  0 && (
                  <div className="playground-missing">
                    <strong>
                      Missing variables
                    </strong>

                    <div className="playground-chips">
                      {analysis.missing_variables.map(
                        (name) => (
                          <code key={name}>
                            {`{{${name}}}`}
                          </code>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>


      {analysis && (
        <section className="playground-summary">
          <div className="playground-stat">
            <strong>
              {analysis.statistics.characters}
            </strong>
            <span>Characters</span>
          </div>

          <div className="playground-stat">
            <strong>
              {analysis.statistics.words}
            </strong>
            <span>Words</span>
          </div>

          <div className="playground-stat">
            <strong>
              {analysis.statistics.lines}
            </strong>
            <span>Lines</span>
          </div>

          <div className="playground-stat">
            <strong>
              {analysis.statistics.estimated_tokens}
            </strong>
            <span>Est. tokens</span>
          </div>
        </section>
      )}


      {analysis &&
        (
          analysis.warnings.length > 0 ||
          analysis.errors.length > 0
        ) && (
          <section className="playground-alerts">
            {analysis.errors.map(
              (error) => (
                <div
                  key={error}
                  className="playground-alert error"
                >
                  {error}
                </div>
              ),
            )}

            {analysis.warnings.map(
              (warning) => (
                <div
                  key={warning}
                  className="playground-alert warning"
                >
                  {warning}
                </div>
              ),
            )}
          </section>
        )}
    </div>
  );
}