import {
  useMemo,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  toast,
} from "sonner";

import type {
  Prompt,
} from "../../../types/prompt";

import {
  extractVariables,
} from "../../analysis/utils/extractVariables";

import {
  listProviders,
} from "../../playground/api/providers";

import {
  createPromptTestCase,
  deletePromptTestCase,
  listPromptTestCases,
  listPromptTestSuiteRuns,
  runPromptTestCase,
  runPromptTestSuite,
  updatePromptTestCase,
} from "../api/testCases";

import type {
  PromptTestCaseCreate,
  PromptTestCaseRunRequest,
  PromptTestCaseRunResponse,
} from "../types/testCase";
import {
  RegressionHistory,
} from "./RegressionHistory";
import {
  TestCaseForm,
} from "./TestCaseForm";

import {
  TestCaseRunResult,
} from "./TestCaseRunResult";


interface PromptTestCasesProps {
  prompt: Prompt;
}


interface RunMutationInput {
  testCaseId: number;
  request: PromptTestCaseRunRequest;
}


export function PromptTestCases({
  prompt,
}: PromptTestCasesProps) {
  const queryClient =
    useQueryClient();

  const [
    showCreateForm,
    setShowCreateForm,
  ] = useState(false);
  const [
  editingTestCaseId,
  setEditingTestCaseId,
] = useState<number | null>(null);
  const [
    providerId,
    setProviderId,
  ] = useState("gemini");

  const [
    temperature,
    setTemperature,
  ] = useState(0.2);

  const [
    maxOutputTokens,
    setMaxOutputTokens,
  ] = useState(500);
const [
  isRunningAll,
  setIsRunningAll,
] = useState(false);


  const [
    runResults,
    setRunResults,
  ] = useState<
    Record<
      number,
      PromptTestCaseRunResponse
    >
  >({});


  const variableNames = useMemo(() => {
    return extractVariables(
      [
        prompt.system_prompt ?? "",
        prompt.user_prompt,
      ].join("\n"),
    );
  }, [
    prompt.system_prompt,
    prompt.user_prompt,
  ]);


  const testCasesQuery = useQuery({
    queryKey: [
      "prompt-test-cases",
      prompt.id,
    ],

    queryFn: () =>
      listPromptTestCases(
        prompt.id,
      ),
  });
const suiteHistoryQuery = useQuery({
  queryKey: [
    "prompt-test-suite-runs",
    prompt.id,
  ],

  queryFn: () =>
    listPromptTestSuiteRuns(
      prompt.id,
    ),
});

  const providersQuery = useQuery({
    queryKey: ["providers"],
    queryFn: listProviders,
  });


  const createMutation = useMutation({
    mutationFn: (
      data: PromptTestCaseCreate,
    ) =>
      createPromptTestCase(
        prompt.id,
        data,
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          "prompt-test-cases",
          prompt.id,
        ],
      });

      setShowCreateForm(false);

      toast.success(
        "Test case created",
      );
    },

    onError: () => {
      toast.error(
        "Could not create test case",
      );
    },
  });


  const deleteMutation = useMutation({
    mutationFn: (
      testCaseId: number,
    ) =>
      deletePromptTestCase(
        prompt.id,
        testCaseId,
      ),

    onSuccess: async (
      _,
      testCaseId,
    ) => {
      await queryClient.invalidateQueries({
        queryKey: [
          "prompt-test-cases",
          prompt.id,
        ],
      });

      setRunResults(
        (current) => {
          const next = {
            ...current,
          };

          delete next[
            testCaseId
          ];

          return next;
        },
      );

      toast.success(
        "Test case deleted",
      );
    },
  });
const updateMutation = useMutation({
  mutationFn: ({
    testCaseId,
    data,
  }: {
    testCaseId: number;
    data: PromptTestCaseCreate;
  }) =>
    updatePromptTestCase(
      prompt.id,
      testCaseId,
      data,
    ),

  onSuccess: async (
    _,
    variables,
  ) => {
    await queryClient.invalidateQueries({
      queryKey: [
        "prompt-test-cases",
        prompt.id,
      ],
    });

    setRunResults(
      (current) => {
        const next = {
          ...current,
        };

        delete next[
          variables.testCaseId
        ];

        return next;
      },
    );

    setEditingTestCaseId(null);

    toast.success(
      "Test case updated",
    );
  },

  onError: () => {
    toast.error(
      "Could not update test case",
    );
  },
});

  const runMutation = useMutation<
    PromptTestCaseRunResponse,
    Error,
    RunMutationInput
  >({
    mutationFn: ({
      testCaseId,
      request,
    }) =>
      runPromptTestCase(
        prompt.id,
        testCaseId,
        request,
      ),

    onSuccess: async (
      result,
    ) => {
      setRunResults(
        (current) => ({
          ...current,
          [result.test_case_id]:
            result,
        }),
      );

      await queryClient.invalidateQueries({
        queryKey: [
          "prompt-runs",
          prompt.id,
        ],
      });

      if (result.passed) {
        toast.success(
          "Test passed",
        );
      } else {
        toast.error(
          "Test failed",
          {
            description:
              `${result.failed_count} checks failed.`,
          },
        );
      }
    },

    onError: () => {
      toast.error(
        "Could not run test case",
      );
    },
  });


  const providers =
    providersQuery.data ?? [];

  const selectedProvider =
    providers.find(
      (provider) =>
        provider.id === providerId,
    );

  const testCases =
    testCasesQuery.data ?? [];


  function handleRun(
    testCaseId: number,
  ): void {
    if (!selectedProvider) {
      toast.error(
        "Select a configured provider.",
      );

      return;
    }

    runMutation.mutate({
      testCaseId,

      request: {
        provider:
          selectedProvider.id,

        model:
          selectedProvider
            .default_model,

        temperature,

        max_output_tokens:
          maxOutputTokens,
      },
    });
  }
async function handleRunAll(): Promise<void> {
  if (!selectedProvider) {
    toast.error(
      "Select a configured provider.",
    );

    return;
  }

  if (testCases.length === 0) {
    toast.info(
      "There are no test cases to run.",
    );

    return;
  }

  setIsRunningAll(true);

  try {
    const suite =
      await runPromptTestSuite(
        prompt.id,
        {
          provider:
            selectedProvider.id,

          model:
            selectedProvider
              .default_model,

          temperature,

          max_output_tokens:
            maxOutputTokens,
        },
      );

    await queryClient.invalidateQueries({
      queryKey: [
        "prompt-runs",
        prompt.id,
      ],
    });

    await queryClient.invalidateQueries({
      queryKey: [
        "prompt-test-suite-runs",
        prompt.id,
      ],
    });

    if (suite.failed_tests === 0) {
      toast.success(
        `All ${suite.total_tests} tests passed`,
      );
    } else {
      toast.error(
        `${suite.passed_tests} of ${suite.total_tests} tests passed`,
        {
          description:
            `${suite.failed_assertions} assertions failed.`,
        },
      );
    }
  } catch {
    toast.error(
      "Could not run the test suite.",
    );
  } finally {
    setIsRunningAll(false);
  }
}

  return (
    <section className="prompt-test-cases">
      <div className="prompt-test-cases-heading">
        <div>
          <p className="eyebrow">
            Regression Testing
          </p>

          <h2>
            Prompt Test Cases
          </h2>

          <p>
            Save repeatable inputs and
            assertions for this prompt.
          </p>
        </div>

        <div className="test-case-header-actions">
  <button
    type="button"
    className="secondary-button"
    disabled={
      isRunningAll ||
      testCases.length === 0
    }
    onClick={() => {
      void handleRunAll();
    }}
  >
    {isRunningAll
  ? "Running All Tests..."
  : "▶ Run All Tests"}
  </button>

  <button
    type="button"
    className="primary-button"
    disabled={isRunningAll}
    onClick={() => {
  setEditingTestCaseId(null);

  setShowCreateForm(
    (current) =>
      !current,
  );
}}
  >
    {showCreateForm
      ? "Close Form"
      : "+ New Test Case"}
  </button>
</div>
      </div>


      {showCreateForm && (
        <div className="test-case-create-card">
          <TestCaseForm
            variableNames={
              variableNames
            }
            submitLabel="Create Test Case"
            isSubmitting={
              createMutation.isPending
            }
            onCancel={() =>
              setShowCreateForm(false)
            }
            onSubmit={async (
              values,
            ) => {
              await createMutation.mutateAsync(
                values,
              );
            }}
          />
        </div>
      )}


      <div className="test-case-run-settings">
        <div>
          <h3>
            Run Settings
          </h3>

          <p>
            These settings are used when
            running a saved test case.
          </p>
        </div>

        <div className="test-case-run-settings-grid">
          <div className="playground-field">
            <label>
              Provider
            </label>

            <select
              value={providerId}
              disabled={
  providersQuery.isPending ||
  isRunningAll
}
              onChange={(event) =>
                setProviderId(
                  event.target.value,
                )
              }
            >
              {providers.map(
                (provider) => (
                  <option
                    key={provider.id}
                    value={provider.id}
                  >
                    {provider.name}
                  </option>
                ),
              )}
            </select>
          </div>


          <div className="playground-field">
            <label>
              Model
            </label>

            <input
              readOnly
              value={
                selectedProvider
                  ?.default_model ?? ""
              }
            />
          </div>


          <div className="playground-field">
            <label>
              Temperature
            </label>

            <input
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(event) =>
                setTemperature(
                  Number(
                    event.target.value,
                  ),
                )
              }
            />
          </div>


          <div className="playground-field">
            <label>
              Max Output Tokens
            </label>

            <input
              type="number"
              min="1"
              max="32768"
              value={maxOutputTokens}
              onChange={(event) =>
                setMaxOutputTokens(
                  Number(
                    event.target.value,
                  ),
                )
              }
            />
          </div>
        </div>
      </div>


      {testCasesQuery.isPending ? (
        <div className="analysis-empty-state">
          Loading test cases...
        </div>
      ) : testCasesQuery.isError ? (
        <div className="analysis-message-group error">
          Could not load test cases.
        </div>
      ) : testCases.length === 0 ? (
        <div className="test-case-empty">
          <strong>
            No test cases yet
          </strong>

          <p>
            Create a test case to start
            validating this prompt.
          </p>
        </div>
      ) : (
        
        <div className="test-case-list">
          {testCases.map(
            (testCase) => {
              const isRunning =
                runMutation.isPending &&
                runMutation.variables
                  ?.testCaseId ===
                  testCase.id;

              const result =
                runResults[
                  testCase.id
                ];

              return (
                <article
                  key={testCase.id}
                  className="test-case-card"
                >
                  <div className="test-case-card-heading">
                    <div>
                      <h3>
                        {testCase.name}
                      </h3>

                      {testCase.description && (
                        <p>
                          {
                            testCase.description
                          }
                        </p>
                      )}
                    </div>

                    <div className="test-case-card-actions">
                      <button
                        type="button"
                        className="primary-button"
                        disabled={
                          isRunning ||
  isRunningAll
                        }
                        onClick={() =>
                          handleRun(
                            testCase.id,
                          )
                        }
                      >
                        {isRunning
                          ? "Running..."
                          : "▶ Run Test"}
                      </button>
<button
  type="button"
  className="secondary-button"
  disabled={
    isRunning ||
    isRunningAll ||
    updateMutation.isPending
  }
  onClick={() => {
    setShowCreateForm(false);

    setEditingTestCaseId(
      testCase.id,
    );
  }}
>
  Edit
</button>
                      <button
                        type="button"
                        className="danger-button"
                        disabled={
  deleteMutation.isPending ||
  isRunningAll
}
                        onClick={() => {
                          const confirmed =
                            window.confirm(
                              "Delete this test case?",
                            );

                          if (confirmed) {
                            deleteMutation.mutate(
                              testCase.id,
                            );
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

{editingTestCaseId ===
  testCase.id && (
  <div className="test-case-edit-form">
    <TestCaseForm
      variableNames={
        variableNames
      }
      initialValues={{
        name:
          testCase.name,

        description:
          testCase.description,

        variables:
          testCase.variables,

        expected_contains:
          testCase.expected_contains,
      }}
      submitLabel="Save Changes"
      isSubmitting={
        updateMutation.isPending
      }
      onCancel={() =>
        setEditingTestCaseId(
          null,
        )
      }
      onSubmit={async (
        values,
      ) => {
        await updateMutation.mutateAsync({
          testCaseId:
            testCase.id,

          data:
            values,
        });
      }}
    />
  </div>
)}
{editingTestCaseId !==
  testCase.id && (
  <div className="test-case-saved-data">
                    <div>
                      <h4>
                        Variables
                      </h4>

                      {Object.entries(
                        testCase.variables,
                      ).map(
                        ([
                          name,
                          value,
                        ]) => (
                          <div
                            key={name}
                            className="test-case-data-row"
                          >
                            <strong>
                              {name}
                            </strong>

                            <span>
                              {String(value)}
                            </span>
                          </div>
                        ),
                      )}
                    </div>


                    <div>
                      <h4>
                        Expected Contains
                      </h4>

                      {testCase
                        .expected_contains
                        .length === 0 ? (
                        <span>
                          No assertions
                        </span>
                      ) : (
                        <div className="test-case-expectations">
                          {testCase
                            .expected_contains
                            .map(
                              (
                                expected,
                              ) => (
                                <code
                                  key={
                                    expected
                                  }
                                >
                                  {
                                    expected
                                  }
                                </code>
                              ),
                            )}
                        </div>
                      )}
                    </div>
                  </div>
  )}

                  {result &&
  editingTestCaseId !==
    testCase.id && (
    <TestCaseRunResult
      result={result}
    />
)}
                </article>
              );
            },
          )}
        </div>
        
      )}
      <RegressionHistory
  runs={
    suiteHistoryQuery.data ?? []
  }
  isLoading={
    suiteHistoryQuery.isPending
  }
  isError={
    suiteHistoryQuery.isError
  }
/>
    </section>
  );
}