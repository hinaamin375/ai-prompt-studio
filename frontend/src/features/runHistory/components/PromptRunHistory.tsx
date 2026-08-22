import {
  useState,
} from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  listPromptRuns,
} from "../api/runHistory";


interface PromptRunHistoryProps {
  promptId: number;
}


function formatDate(
  dateValue: string,
): string {
  return new Intl.DateTimeFormat(
    "en",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(
    new Date(dateValue),
  );
}


function formatDuration(
  durationMs: number,
): string {
  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }

  return `${(
    durationMs / 1000
  ).toFixed(2)} s`;
}


function formatTokens(
  tokens: number | null,
): string {
  if (tokens === null) {
    return "—";
  }

  return new Intl.NumberFormat(
    "en",
  ).format(tokens);
}


function formatProvider(
  provider: string,
): string {
  if (!provider) {
    return provider;
  }

  return (
    provider.charAt(0).toUpperCase() +
    provider.slice(1)
  );
}


export function PromptRunHistory({
  promptId,
}: PromptRunHistoryProps) {
  const [
    expandedRunId,
    setExpandedRunId,
  ] = useState<number | null>(null);


  const runsQuery = useQuery({
    queryKey: [
      "prompt-runs",
      promptId,
    ],

    queryFn: () =>
      listPromptRuns(promptId),

    enabled:
      Number.isInteger(promptId) &&
      promptId > 0,
  });


  function toggleRun(
    runId: number,
  ): void {
    setExpandedRunId(
      (currentRunId) =>
        currentRunId === runId
          ? null
          : runId,
    );
  }


  if (runsQuery.isPending) {
    return (
      <section className="prompt-run-history">
        <div className="prompt-run-history-heading">
          <div>
            <p className="eyebrow">
              Execution
            </p>

            <h3>
              Run History
            </h3>
          </div>
        </div>

        <p>
          Loading run history...
        </p>
      </section>
    );
  }


  if (runsQuery.isError) {
    return (
      <section className="prompt-run-history">
        <div className="prompt-run-history-heading">
          <div>
            <p className="eyebrow">
              Execution
            </p>

            <h3>
              Run History
            </h3>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              void runsQuery.refetch();
            }}
          >
            Retry
          </button>
        </div>

        <p>
          Could not load run history.
        </p>
      </section>
    );
  }


  const runs =
    runsQuery.data ?? [];


  return (
    <section className="prompt-run-history">
      <div className="prompt-run-history-heading">
        <div>
          <p className="eyebrow">
            Execution
          </p>

          <h3>
            Run History
          </h3>

          <p>
            Previous AI executions for
            this prompt.
          </p>
        </div>


        <div className="prompt-run-history-actions">
          <span className="prompt-run-count">
            {runs.length}{" "}
            {runs.length === 1
              ? "run"
              : "runs"}
          </span>

          <button
            type="button"
            className="secondary-button"
            disabled={
              runsQuery.isFetching
            }
            onClick={() => {
              void runsQuery.refetch();
            }}
          >
            {runsQuery.isFetching
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>
      </div>


      {runs.length === 0 ? (
        <div className="prompt-run-empty">
          <strong>
            No runs yet
          </strong>

          <p>
            Run this prompt with an AI
            provider and the execution
            will appear here.
          </p>
        </div>
      ) : (
        <div className="prompt-run-list">
          {runs.map((run) => {
            const expanded =
              expandedRunId === run.id;

            return (
              <article
                key={run.id}
                className="prompt-run-item"
              >
                <div className="prompt-run-main">
                  <div className="prompt-run-provider">
                    <strong>
                      {formatProvider(
                        run.provider,
                      )}
                    </strong>

                    <span>
                      {run.model}
                    </span>
                  </div>


                  <div className="prompt-run-stat">
                    <span>
                      Total tokens
                    </span>

                    <strong>
                      {formatTokens(
                        run.total_tokens,
                      )}
                    </strong>
                  </div>


                  <div className="prompt-run-stat">
                    <span>
                      Runtime
                    </span>

                    <strong>
                      {formatDuration(
                        run.duration_ms,
                      )}
                    </strong>
                  </div>


                  <div className="prompt-run-date">
                    {formatDate(
                      run.created_at,
                    )}
                  </div>


                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      toggleRun(run.id)
                    }
                  >
                    {expanded
                      ? "Hide Result"
                      : "View Result"}
                  </button>
                </div>


                {expanded && (
                  <div className="prompt-run-details">
                    <div className="prompt-run-token-grid">
                      <div>
                        <span>
                          Input
                        </span>

                        <strong>
                          {formatTokens(
                            run.input_tokens,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Output
                        </span>

                        <strong>
                          {formatTokens(
                            run.output_tokens,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Total
                        </span>

                        <strong>
                          {formatTokens(
                            run.total_tokens,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Runtime
                        </span>

                        <strong>
                          {formatDuration(
                            run.duration_ms,
                          )}
                        </strong>
                      </div>
                    </div>


                    {Object.keys(
                      run.variables,
                    ).length > 0 && (
                      <div className="prompt-run-variables">
                        <h4>
                          Variables
                        </h4>

                        <div className="prompt-run-variable-list">
                          {Object.entries(
                            run.variables,
                          ).map(
                            ([
                              name,
                              value,
                            ]) => (
                              <div
                                key={name}
                                className="prompt-run-variable"
                              >
                                <strong>
                                  {name}
                                </strong>

                                <span>
                                  {String(
                                    value,
                                  )}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}


                    <div className="prompt-run-response">
                      <div className="prompt-run-response-heading">
                        <h4>
                          AI Response
                        </h4>

                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => {
                            void navigator.clipboard.writeText(
                              run.output_text,
                            );
                          }}
                        >
                          Copy
                        </button>
                      </div>

                      <div className="prompt-run-response-content">
                        <ReactMarkdown
                          remarkPlugins={[
                            remarkGfm,
                          ]}
                        >
                          {run.output_text}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}