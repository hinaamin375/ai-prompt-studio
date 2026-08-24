import {
  useEffect,
  useState,
} from "react";

import type {
  PromptTestCaseCreate,
} from "../types/testCase";


interface TestCaseFormProps {
  variableNames: string[];

  initialValues?: PromptTestCaseCreate;

  submitLabel: string;

  isSubmitting?: boolean;

  onSubmit: (
    values: PromptTestCaseCreate,
  ) => Promise<void> | void;

  onCancel?: () => void;
}


export function TestCaseForm({
  variableNames,
  initialValues,
  submitLabel,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: TestCaseFormProps) {
  const [
    name,
    setName,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    variables,
    setVariables,
  ] = useState<Record<string, string>>(
    {},
  );

  const [
    expectedContains,
    setExpectedContains,
  ] = useState("");


  useEffect(() => {
    setName(
      initialValues?.name ?? "",
    );

    setDescription(
      initialValues?.description ?? "",
    );

    const nextVariables:
      Record<string, string> = {};

    for (
      const variableName
      of variableNames
    ) {
      const value =
        initialValues?.variables[
          variableName
        ];

      nextVariables[variableName] =
        value === undefined ||
        value === null
          ? ""
          : String(value);
    }

    setVariables(nextVariables);

    setExpectedContains(
      initialValues
        ?.expected_contains
        .join("\n") ?? "",
    );
  }, [
    initialValues,
    variableNames,
  ]);


  function handleVariableChange(
    variableName: string,
    value: string,
  ): void {
    setVariables(
      (current) => ({
        ...current,
        [variableName]: value,
      }),
    );
  }


  async function handleSubmit(
    event: React.FormEvent,
  ): Promise<void> {
    event.preventDefault();

    const checks =
      expectedContains
        .split("\n")
        .map(
          (item) =>
            item.trim(),
        )
        .filter(Boolean);

    await onSubmit({
      name: name.trim(),

      description:
        description.trim() || null,

      variables,

      expected_contains:
        checks,
    });
  }


  return (
    <form
      className="test-case-form"
      onSubmit={handleSubmit}
    >
      <div className="test-case-form-grid">
        <div className="playground-field">
          <label htmlFor="test-case-name">
            Test Name
          </label>

          <input
            id="test-case-name"
            value={name}
            maxLength={200}
            required
            disabled={isSubmitting}
            placeholder="Backend technology test"
            onChange={(event) =>
              setName(
                event.target.value,
              )
            }
          />
        </div>


        <div className="playground-field">
          <label htmlFor="test-case-description">
            Description
          </label>

          <input
            id="test-case-description"
            value={description}
            disabled={isSubmitting}
            placeholder="What should this test verify?"
            onChange={(event) =>
              setDescription(
                event.target.value,
              )
            }
          />
        </div>
      </div>


      <div className="test-case-form-section">
        <h4>
          Variables
        </h4>

        {variableNames.length === 0 ? (
          <div className="analysis-empty-state">
            This prompt has no template
            variables.
          </div>
        ) : (
          <div className="test-case-variable-grid">
            {variableNames.map(
              (variableName) => (
                <div
                  key={variableName}
                  className="playground-field"
                >
                  <label
                    htmlFor={
                      `test-variable-${variableName}`
                    }
                  >
                    {variableName}
                  </label>

                  <input
                    id={
                      `test-variable-${variableName}`
                    }
                    value={
                      variables[
                        variableName
                      ] ?? ""
                    }
                    required
                    disabled={
                      isSubmitting
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


      <div className="test-case-form-section">
        <div className="playground-field">
          <label htmlFor="test-case-expected">
            Expected Contains
          </label>

          <textarea
            id="test-case-expected"
            value={expectedContains}
            rows={5}
            disabled={isSubmitting}
            placeholder={
              "Python\nFastAPI\nbackend"
            }
            onChange={(event) =>
              setExpectedContains(
                event.target.value,
              )
            }
          />

          <span className="playground-field-help">
            Enter one expected phrase per
            line. Matching is
            case-insensitive.
          </span>
        </div>
      </div>


      <div className="test-case-form-actions">
        {onCancel && (
          <button
            type="button"
            className="secondary-button"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          className="primary-button"
          disabled={
            isSubmitting ||
            !name.trim()
          }
        >
          {isSubmitting
            ? "Saving..."
            : submitLabel}
        </button>
      </div>
    </form>
  );
}