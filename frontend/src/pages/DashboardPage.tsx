import {
  useQueries,
  useQuery,
} from "@tanstack/react-query";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  EmptyWorkspaceIllustration,
} from "../features/dashboard/components/EmptyWorkspaceIllustration";

import {
  listProviders,
} from "../features/playground/api/providers";

import {
  listPromptRuns,
} from "../features/runHistory/api/runHistory";

import type {
  PromptRunHistory,
} from "../features/runHistory/types/runHistory";

import {
  listPromptTestSuiteRuns,
} from "../features/testCases/api/testCases";

import type {
  PromptTestSuiteRunResponse,
} from "../features/testCases/types/testCase";

import {
  useCollections,
} from "../features/prompts/hooks/useCollections";

import {
  usePrompts,
} from "../features/prompts/hooks/usePrompts";

import type {
  Collection,
} from "../types/collection";

import type {
  Prompt,
} from "../types/prompt";


type EmptyStateIconName =
  | "link"
  | "document"
  | "play"
  | "chart"
  | "lock"
  | "shield"
  | "speed";


type OverviewIconName =
  | "prompt"
  | "run"
  | "health"
  | "models"
  | "suite"
  | "compare"
  | "edit";


type ActivityItem = {
  id: string;
  type: "suite" | "run" | "edit";
  title: string;
  detail: string;
  createdAt: string;
};


function formatRelativeDate(
  dateValue: string,
): string {
  const date = new Date(dateValue);
  const now = new Date();
  const differenceMs = now.getTime() - date.getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (differenceMs < minute) {
    return "Just now";
  }

  if (differenceMs < hour) {
    const minutes = Math.max(
      1,
      Math.floor(differenceMs / minute),
    );
    return `${minutes}m ago`;
  }

  if (differenceMs < day) {
    const hours = Math.max(
      1,
      Math.floor(differenceMs / hour),
    );
    return `${hours}h ago`;
  }

  if (differenceMs < 7 * day) {
    const days = Math.max(
      1,
      Math.floor(differenceMs / day),
    );
    return days === 1 ? "Yesterday" : `${days}d ago`;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}


function getRecentPrompts(
  prompts: Prompt[],
): Prompt[] {
  return [...prompts]
    .sort(
      (left, right) =>
        new Date(
          right.updated_at,
        ).getTime() -
        new Date(
          left.updated_at,
        ).getTime(),
    )
    .slice(0, 4);
}


function EmptyStateIcon({
  name,
}: {
  name: EmptyStateIconName;
}) {
  const paths: Record<EmptyStateIconName, React.ReactNode> = {
    link: (
      <>
        <path d="m10 13 4-4" />
        <path d="M7.5 15.5 5 18a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0" transform="translate(3 0)" />
        <path d="m16.5 8.5 2.5-2.5a3.5 3.5 0 0 1 5 5l-4 4a3.5 3.5 0 0 1-5 0" transform="translate(-3 0)" />
      </>
    ),
    document: (
      <>
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v5h5M9 12h6M9 16h6" />
      </>
    ),
    play: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m10 8 6 4-6 4z" />
      </>
    ),
    chart: (
      <path d="M5 20V11M12 20V5M19 20v-7" />
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 19 6v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" />
        <path d="m9 12 2 2 4-5" />
      </>
    ),
    speed: (
      <path d="M4 20V10M10 20V5M16 20v-8M22 20V8" />
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}


function OverviewIcon({
  name,
}: {
  name: OverviewIconName;
}) {
  const paths: Record<OverviewIconName, React.ReactNode> = {
    prompt: (
      <>
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v5h5M9 12h6M9 16h5" />
      </>
    ),
    run: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m10 8 6 4-6 4z" />
      </>
    ),
    health: (
      <>
        <path d="M12 3 19 6v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" />
        <path d="m9 12 2 2 4-5" />
      </>
    ),
    models: (
      <>
        <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
        <path d="m4 12 8 4.5 8-4.5M4 16.5l8 4.5 8-4.5" />
      </>
    ),
    suite: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8.5 12 2.2 2.2 4.8-5" />
      </>
    ),
    compare: (
      <>
        <path d="M7 4v16M17 4v16" />
        <path d="m4 7 3-3 3 3M14 17l3 3 3-3" />
      </>
    ),
    edit: (
      <>
        <path d="M4 20h4l11-11-4-4L4 16z" />
        <path d="m13.5 6.5 4 4" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}


function NewUserOverview() {
  const steps = [
    {
      icon: "link" as const,
      tone: "peach",
      title: "Connect a provider",
      description:
        "Add your own API key for the AI models you use.",
    },
    {
      icon: "document" as const,
      tone: "mint",
      title: "Create your first prompt",
      description:
        "Start from scratch and build a reusable prompt.",
    },
    {
      icon: "play" as const,
      tone: "sand",
      title: "Run and test",
      description:
        "Try real inputs, review results and add test cases.",
    },
    {
      icon: "chart" as const,
      tone: "coral",
      title: "Compare and improve",
      description:
        "Track versions and find what works best.",
    },
  ];

  return (
    <main className="new-user-overview">
      <section className="new-user-hero">
        <div className="new-user-hero-copy">
          <p className="new-user-kicker">
            Welcome to
          </p>

          <h1>
            <span>AI Prompt</span>{" "}
            <strong>Studio</strong>
          </h1>

          <h2>
            Turn ideas into powerful prompts.
          </h2>

          <p className="new-user-intro">
            Create, test and compare prompts across the AI
            models you already use — with your own API keys.
          </p>

          <div className="new-user-actions">
            <Link
              to="/providers"
              className="new-user-primary-action"
            >
              Connect a Model Provider
              <span aria-hidden="true">→</span>
            </Link>

            <Link
              to="/prompts"
              className="new-user-secondary-action"
            >
              Explore Prompt Studio
            </Link>
          </div>

          <div className="new-user-trust-row">
            <span>
              <EmptyStateIcon name="lock" />
              Your API keys stay protected
            </span>

            <span>
              <EmptyStateIcon name="shield" />
              You stay in control
            </span>

            <span>
              <EmptyStateIcon name="speed" />
              Start testing in minutes
            </span>
          </div>
        </div>

        <EmptyWorkspaceIllustration />
      </section>

      <section className="new-user-steps">
        <div className="new-user-steps-heading">
          <h2>Get started in 4 simple steps</h2>
          <p>
            Go from an idea to a tested prompt in minutes.
          </p>
        </div>

        <div className="new-user-step-grid">
          {steps.map((step, index) => (
            <div
              className="new-user-step-wrap"
              key={step.title}
            >
              <article className="new-user-step">
                <span
                  className={`new-user-step-icon new-user-step-icon--${step.tone}`}
                >
                  <EmptyStateIcon name={step.icon} />
                </span>

                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>

              {index < steps.length - 1 && (
                <span
                  className="new-user-step-arrow"
                  aria-hidden="true"
                >
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}


function PopulatedOverview({
  prompts,
  collections,
}: {
  prompts: Prompt[];
  collections: Collection[];
}) {
  const recentPrompts = getRecentPrompts(prompts);

  const providerQuery = useQuery({
    queryKey: ["providers"],
    queryFn: listProviders,
  });

  const runQueries = useQueries({
    queries: prompts.map((prompt) => ({
      queryKey: ["prompt-runs", prompt.id],
      queryFn: () => listPromptRuns(prompt.id),
      staleTime: 30_000,
    })),
  });

  const suiteQueries = useQueries({
    queries: prompts.map((prompt) => ({
      queryKey: ["prompt-test-suite-runs", prompt.id],
      queryFn: () => listPromptTestSuiteRuns(prompt.id),
      staleTime: 30_000,
    })),
  });

  const runsByPrompt = new Map<number, PromptRunHistory[]>();
  const suitesByPrompt = new Map<
    number,
    PromptTestSuiteRunResponse[]
  >();

  prompts.forEach((prompt, index) => {
    runsByPrompt.set(
      prompt.id,
      runQueries[index]?.data ?? [],
    );
    suitesByPrompt.set(
      prompt.id,
      suiteQueries[index]?.data ?? [],
    );
  });

  const allRuns = Array.from(runsByPrompt.values()).flat();
  const allSuites = Array.from(suitesByPrompt.values()).flat();

  const latestSuites = prompts
    .map((prompt) => {
      const suites = suitesByPrompt.get(prompt.id) ?? [];
      return [...suites].sort(
        (left, right) =>
          new Date(right.created_at).getTime() -
          new Date(left.created_at).getTime(),
      )[0];
    })
    .filter(
      (suite): suite is PromptTestSuiteRunResponse =>
        Boolean(suite),
    );

  const totalLatestTests = latestSuites.reduce(
    (total, suite) => total + suite.total_tests,
    0,
  );
  const passedLatestTests = latestSuites.reduce(
    (total, suite) => total + suite.passed_tests,
    0,
  );
  const failedLatestTests = latestSuites.reduce(
    (total, suite) => total + suite.failed_tests,
    0,
  );
  const testHealth = totalLatestTests
    ? Math.round(
        (passedLatestTests / totalLatestTests) * 100,
      )
    : null;

  const collectionNameById = new Map(
    collections.map((collection) => [
      collection.id,
      collection.name,
    ]),
  );

  const activities: ActivityItem[] = [
    ...allSuites.map((suite) => {
      const prompt = prompts.find(
        (item) => item.id === suite.prompt_id,
      );
      const passed = suite.failed_tests === 0;

      return {
        id: `suite-${suite.id}`,
        type: "suite" as const,
        title: passed
          ? "Regression suite passed"
          : "Regression suite needs attention",
        detail: `${prompt?.title ?? "Prompt"} · ${suite.passed_tests}/${suite.total_tests} tests passed`,
        createdAt: suite.created_at,
      };
    }),
    ...allRuns.map((run) => {
      const prompt = prompts.find(
        (item) => item.id === run.prompt_id,
      );

      return {
        id: `run-${run.id}`,
        type: "run" as const,
        title: "Prompt run completed",
        detail: `${prompt?.title ?? "Prompt"} · ${run.model}`,
        createdAt: run.created_at,
      };
    }),
    ...prompts.map((prompt) => ({
      id: `prompt-${prompt.id}-${prompt.updated_at}`,
      type: "edit" as const,
      title: "Prompt updated",
      detail: prompt.title,
      createdAt: prompt.updated_at,
    })),
  ]
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    )
    .slice(0, 4);

  const latestRunByPrompt = new Map<
    number,
    PromptRunHistory
  >();

  prompts.forEach((prompt) => {
    const runs = runsByPrompt.get(prompt.id) ?? [];
    const latest = [...runs].sort(
      (left, right) =>
        new Date(right.created_at).getTime() -
        new Date(left.created_at).getTime(),
    )[0];

    if (latest) {
      latestRunByPrompt.set(prompt.id, latest);
    }
  });

  const secondaryDataLoading =
    runQueries.some((query) => query.isPending) ||
    suiteQueries.some((query) => query.isPending);

  return (
    <main className="populated-overview">
      <header className="populated-overview-header">
        <div>
          <h1>Overview</h1>
          <p>
            Monitor your prompts, model activity and testing
            health.
          </p>
        </div>

        <Link
          to="/prompts/new"
          className="populated-new-prompt"
        >
          <span aria-hidden="true">＋</span>
          New Prompt
        </Link>
      </header>

      <section
        className="populated-stat-grid"
        aria-label="Workspace overview"
      >
        <Link
          to="/prompts"
          className="populated-stat-card populated-stat-card--peach"
        >
          <span className="populated-stat-icon">
            <OverviewIcon name="prompt" />
          </span>
          <div>
            <span className="populated-stat-label">Prompts</span>
            <strong>{prompts.length}</strong>
            <small>
              {collections.length} {collections.length === 1
                ? "collection"
                : "collections"}
            </small>
          </div>
          <span className="populated-stat-shape" />
        </Link>

        <div className="populated-stat-card populated-stat-card--mint">
          <span className="populated-stat-icon">
            <OverviewIcon name="run" />
          </span>
          <div>
            <span className="populated-stat-label">Runs</span>
            <strong>
              {secondaryDataLoading ? "—" : allRuns.length}
            </strong>
            <small>
              {secondaryDataLoading
                ? "Loading activity"
                : "Across all prompts"}
            </small>
          </div>
          <span className="populated-stat-bars" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </div>

        <Link
          to="/prompts"
          className="populated-stat-card populated-stat-card--sand"
        >
          <span className="populated-stat-icon">
            <OverviewIcon name="health" />
          </span>
          <div>
            <span className="populated-stat-label">Test Health</span>
            <strong>
              {secondaryDataLoading
                ? "—"
                : testHealth === null
                  ? "—"
                  : `${testHealth}%`}
            </strong>
            <small>
              {secondaryDataLoading
                ? "Loading test results"
                : totalLatestTests === 0
                  ? "No regression suites yet"
                  : `${passedLatestTests} / ${totalLatestTests} tests passing`}
            </small>
          </div>
          <span className="populated-stat-trend" aria-hidden="true" />
        </Link>

        <Link
          to="/providers"
          className="populated-stat-card populated-stat-card--cream"
        >
          <span className="populated-stat-icon">
            <OverviewIcon name="models" />
          </span>
          <div>
            <span className="populated-stat-label">Model Providers</span>
            <strong>
              {providerQuery.isPending
                ? "—"
                : `${providerQuery.data?.length ?? 0} connected`}
            </strong>
            <small>
              {providerQuery.data?.length
                ? providerQuery.data
                    .slice(0, 3)
                    .map((provider) => provider.name)
                    .join(" · ")
                : "Connect a provider"}
            </small>
          </div>
          <span className="populated-stat-orbs" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </Link>
      </section>

      <section className="populated-overview-grid">
        <article className="populated-panel populated-recent-prompts">
          <div className="populated-panel-heading">
            <h2>Recent Prompts</h2>
            <Link to="/prompts">
              View all <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="populated-prompt-list">
            {recentPrompts.map((prompt, index) => {
              const latestRun = latestRunByPrompt.get(prompt.id);
              const collectionName = prompt.collection_id
                ? collectionNameById.get(prompt.collection_id)
                : null;
              const tones = ["peach", "sand", "coral", "mint"];

              return (
                <Link
                  key={prompt.id}
                  to={`/prompts/${prompt.id}/edit`}
                  className="populated-prompt-row"
                >
                  <span
                    className={`populated-prompt-icon populated-prompt-icon--${tones[index % tones.length]}`}
                  >
                    <OverviewIcon name="prompt" />
                  </span>

                  <div className="populated-prompt-copy">
                    <div className="populated-prompt-title-line">
                      <strong>{prompt.title}</strong>
                      {collectionName && (
                        <span className="populated-prompt-badge">
                          {collectionName}
                        </span>
                      )}
                    </div>

                    <p>
                      {prompt.description?.trim() ||
                        "No description provided."}
                    </p>

                    <small>
                      {latestRun
                        ? `${latestRun.model} · `
                        : ""}
                      Updated {formatRelativeDate(prompt.updated_at)}
                    </small>
                  </div>

                  <span
                    className="populated-row-menu"
                    aria-hidden="true"
                  >
                    ···
                  </span>
                </Link>
              );
            })}
          </div>
        </article>

        <article className="populated-panel populated-recent-activity">
          <div className="populated-panel-heading">
            <h2>Recent Activity</h2>
          </div>

          {secondaryDataLoading ? (
            <div className="populated-activity-loading">
              <span className="product-dashboard-state-spinner" />
              <span>Loading recent activity...</span>
            </div>
          ) : (
            <div className="populated-activity-list">
              {activities.map((activity) => (
                <div
                  className="populated-activity-row"
                  key={activity.id}
                >
                  <span
                    className={`populated-activity-icon populated-activity-icon--${activity.type}`}
                  >
                    <OverviewIcon
                      name={
                        activity.type === "suite"
                          ? "suite"
                          : activity.type === "run"
                            ? "run"
                            : "edit"
                      }
                    />
                  </span>

                  <div>
                    <strong>{activity.title}</strong>
                    <p>{activity.detail}</p>
                    <small>
                      {formatRelativeDate(activity.createdAt)}
                    </small>
                  </div>
                </div>
              ))}

              {activities.length === 0 && (
                <div className="populated-activity-empty">
                  Your recent runs and tests will appear here.
                </div>
              )}
            </div>
          )}
        </article>
      </section>

      <section className="populated-cta">
        <div className="populated-cta-copy">
          <span className="populated-cta-kicker">
            Keep building
          </span>
          <h2>Turn ideas into powerful prompts.</h2>
          <p>
            Create, test and compare prompts across the AI
            models you use.
          </p>

          <div className="populated-cta-actions">
            <Link
              to="/prompts/new"
              className="populated-cta-primary"
            >
              Create a New Prompt
              <span aria-hidden="true">→</span>
            </Link>

            <Link
              to="/comparisons"
              className="populated-cta-secondary"
            >
              Explore Comparisons
            </Link>
          </div>
        </div>

        <div className="populated-cta-art" aria-hidden="true">
          <span className="populated-cta-sun" />
          <span className="populated-cta-arch" />
          <span className="populated-cta-plant">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="populated-cta-laptop">
            <i />
          </span>
          <span className="populated-cta-books">
            <i />
            <i />
            <i />
          </span>
        </div>
      </section>

      {!secondaryDataLoading && failedLatestTests > 0 && (
        <Link
          to="/prompts"
          className="populated-regression-note"
        >
          <span>
            <OverviewIcon name="health" />
            {failedLatestTests} failing {failedLatestTests === 1
              ? "test needs"
              : "tests need"} your attention.
          </span>
          <strong>Review regression results →</strong>
        </Link>
      )}
    </main>
  );
}


export function DashboardPage() {
  const [searchParams] = useSearchParams();
  const promptsQuery = usePrompts();
  const collectionsQuery = useCollections();

  const prompts = promptsQuery.data ?? [];
  const collections = collectionsQuery.data ?? [];

  const isLoading =
    promptsQuery.isPending ||
    collectionsQuery.isPending;

  const hasError =
    promptsQuery.isError ||
    collectionsQuery.isError;

  if (isLoading) {
    return (
      <main className="dashboard-page product-dashboard-state">
        <div className="product-dashboard-state-card">
          <span className="product-dashboard-state-spinner" />
          <strong>Opening your workspace...</strong>
          <p>Loading your prompts and collections.</p>
        </div>
      </main>
    );
  }

  if (hasError) {
    return (
      <main className="dashboard-page product-dashboard-state">
        <div
          className="product-dashboard-state-card product-dashboard-state-card--error"
          role="alert"
        >
          <strong>We could not load your workspace.</strong>
          <p>
            Make sure the backend is running and refresh the
            page to try again.
          </p>
        </div>
      </main>
    );
  }

  const forceNewUser =
    searchParams.get("preview") === "new-user";
  const forcePopulated =
    searchParams.get("preview") === "populated";

  if (forceNewUser || (prompts.length === 0 && !forcePopulated)) {
    return <NewUserOverview />;
  }

  return (
    <PopulatedOverview
      prompts={prompts}
      collections={collections}
    />
  );
}
