import {
  useMemo,
} from "react";

import {
  useQueries,
  useQuery,
} from "@tanstack/react-query";

import {
  Link,
} from "react-router-dom";

import {
  listProviderConnections,
} from "../features/providerConnections/api/providerConnections";

import {
  usePrompts,
} from "../features/prompts/hooks/usePrompts";

import {
  listPromptRuns,
} from "../features/runHistory/api/runHistory";


type StepState = "complete" | "current" | "upcoming";

interface OnboardingStep {
  number: number;
  title: string;
  description: string;
  state: StepState;
}

function StepMark({
  state,
  number,
}: {
  state: StepState;
  number: number;
}) {
  return (
    <span className={`onboarding-step-mark onboarding-step-mark--${state}`}>
      {state === "complete" ? "✓" : number}
    </span>
  );
}

export function OnboardingPage() {
  const promptsQuery = usePrompts();

  const providerConnectionsQuery = useQuery({
    queryKey: ["provider-connections"],
    queryFn: listProviderConnections,
  });

  const prompts = useMemo(
    () => promptsQuery.data ?? [],
    [promptsQuery.data],
  );

  const runQueries = useQueries({
    queries: prompts.map((prompt) => ({
      queryKey: ["prompt-runs", prompt.id],
      queryFn: () => listPromptRuns(prompt.id),
      staleTime: 15_000,
    })),
  });

  const connectedProviders =
    providerConnectionsQuery.data?.filter(
      (provider) => provider.connected,
    ) ?? [];

  const hasProvider = connectedProviders.length > 0;
  const hasPrompt = prompts.length > 0;
  const hasRun = runQueries.some(
    (query) => (query.data?.length ?? 0) > 0,
  );
  const isComplete = hasProvider && hasPrompt && hasRun;

  const isLoading =
    promptsQuery.isPending ||
    providerConnectionsQuery.isPending ||
    runQueries.some((query) => query.isPending);

  const hasError =
    promptsQuery.isError ||
    providerConnectionsQuery.isError ||
    runQueries.some((query) => query.isError);

  const currentStep = !hasProvider
    ? 1
    : !hasPrompt
      ? 2
      : !hasRun
        ? 3
        : 4;

  const steps: OnboardingStep[] = [
    {
      number: 1,
      title: "Connect a model provider",
      description: "Bring your own API key. Credentials stay encrypted and workspace-scoped.",
      state: hasProvider
        ? "complete"
        : currentStep === 1
          ? "current"
          : "upcoming",
    },
    {
      number: 2,
      title: "Create your first prompt",
      description: "Build a reusable system and user prompt with variables when you need them.",
      state: hasPrompt
        ? "complete"
        : currentStep === 2
          ? "current"
          : "upcoming",
    },
    {
      number: 3,
      title: "Run it with a real model",
      description: "Use your connected provider, inspect the output, and keep the run in history.",
      state: hasRun
        ? "complete"
        : currentStep === 3
          ? "current"
          : "upcoming",
    },
    {
      number: 4,
      title: "Your workspace is ready",
      description: "Continue into testing, regression, comparisons, and version history.",
      state: isComplete ? "complete" : "upcoming",
    },
  ];

  const firstPrompt = prompts[0];

  if (isLoading) {
    return (
      <main className="onboarding-page onboarding-page--state">
        <span className="product-dashboard-state-spinner" />
        <strong>Preparing your workspace...</strong>
        <p>Checking your setup progress.</p>
      </main>
    );
  }

  if (hasError) {
    return (
      <main className="onboarding-page onboarding-page--state">
        <strong>We could not load your setup progress.</strong>
        <p>Refresh the page after confirming the backend is running.</p>
      </main>
    );
  }

  return (
    <main className="onboarding-page">
      <header className="onboarding-header">
        <div>
          <span className="page-eyebrow">Workspace setup</span>
          <h1>
            {isComplete
              ? "You’re ready to build."
              : "Set up Prompt Studio in minutes."}
          </h1>
          <p>
            {isComplete
              ? "Your provider, first prompt, and first model run are all in place."
              : "Complete three practical steps and your workspace is ready for real prompt development."}
          </p>
        </div>

        <span className="onboarding-progress-pill">
          {Math.min(currentStep, 4)} / 4
        </span>
      </header>

      <section className="onboarding-layout">
        <aside className="onboarding-progress-card">
          <div className="onboarding-progress-heading">
            <strong>Getting started</strong>
            <span>{isComplete ? "Complete" : "In progress"}</span>
          </div>

          <div className="onboarding-progress-track">
            <span
              style={{
                width: `${isComplete ? 100 : ((currentStep - 1) / 3) * 100}%`,
              }}
            />
          </div>

          <div className="onboarding-step-list">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`onboarding-step-row onboarding-step-row--${step.state}`}
              >
                <StepMark state={step.state} number={step.number} />
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="onboarding-action-card">
          {!hasProvider && (
            <>
              <span className="onboarding-action-kicker">Step 1 · Model provider</span>
              <h2>Connect the model you already use.</h2>
              <p>
                Start with Gemini or Qwen, or connect another supported provider.
                Prompt Studio encrypts the API key on the server and never returns the raw key to the browser.
              </p>

              <div className="onboarding-mini-grid">
                <article>
                  <span>01</span>
                  <strong>Bring your own key</strong>
                  <p>You pay the model provider directly for inference.</p>
                </article>
                <article>
                  <span>02</span>
                  <strong>Workspace isolated</strong>
                  <p>Credentials belong only to the active workspace.</p>
                </article>
              </div>

              <Link to="/providers" className="onboarding-primary-action">
                Connect a Model Provider <span aria-hidden="true">→</span>
              </Link>
            </>
          )}

          {hasProvider && !hasPrompt && (
            <>
              <span className="onboarding-action-kicker">Step 2 · First prompt</span>
              <h2>Turn an idea into a reusable prompt.</h2>
              <p>
                Your provider is connected. Create a prompt with a clear system instruction,
                user message, and optional variables. You can refine it later with versions and tests.
              </p>

              <div className="onboarding-success-note">
                <span>✓</span>
                <div>
                  <strong>{connectedProviders.length} provider{connectedProviders.length === 1 ? "" : "s"} connected</strong>
                  <p>{connectedProviders.map((provider) => provider.name).join(" · ")}</p>
                </div>
              </div>

              <Link to="/prompts/new?onboarding=1" className="onboarding-primary-action">
                Create Your First Prompt <span aria-hidden="true">→</span>
              </Link>
            </>
          )}

          {hasProvider && hasPrompt && !hasRun && firstPrompt && (
            <>
              <span className="onboarding-action-kicker">Step 3 · First run</span>
              <h2>Run your prompt against a real model.</h2>
              <p>
                Open the Playground, provide any required variables, choose a connected model,
                and run the prompt. The result will be saved to your workspace run history.
              </p>

              <div className="onboarding-prompt-preview">
                <span>Ready to run</span>
                <strong>{firstPrompt.title}</strong>
                <p>{firstPrompt.description || "Your first Prompt Studio prompt."}</p>
              </div>

              <Link
                to={`/prompts/${firstPrompt.id}/playground?onboarding=1`}
                className="onboarding-primary-action"
              >
                Open Playground <span aria-hidden="true">→</span>
              </Link>
            </>
          )}

          {isComplete && (
            <>
              <span className="onboarding-action-kicker">Setup complete</span>
              <h2>Your Prompt Studio workspace is live.</h2>
              <p>
                You have a connected model provider, at least one prompt, and a real model run.
                The workspace is ready for regression tests, comparisons, versions, and everyday prompt work.
              </p>

              <div className="onboarding-complete-grid">
                <article>
                  <strong>{connectedProviders.length}</strong>
                  <span>Connected provider{connectedProviders.length === 1 ? "" : "s"}</span>
                </article>
                <article>
                  <strong>{prompts.length}</strong>
                  <span>Prompt{prompts.length === 1 ? "" : "s"}</span>
                </article>
                <article>
                  <strong>✓</strong>
                  <span>First run complete</span>
                </article>
              </div>

              <div className="onboarding-complete-actions">
                <Link to="/" className="onboarding-primary-action">
                  Go to Overview <span aria-hidden="true">→</span>
                </Link>
                <Link to="/prompts" className="onboarding-secondary-action">
                  View Prompts
                </Link>
              </div>
            </>
          )}
        </section>
      </section>

      {!isComplete && (
        <footer className="onboarding-footer-note">
          <span>Private by design</span>
          <p>Your prompts and provider connections are isolated to this workspace.</p>
        </footer>
      )}
    </main>
  );
}
