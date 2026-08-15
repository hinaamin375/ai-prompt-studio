import { Link } from "react-router-dom";

import {
  useCollections,
} from "../features/prompts/hooks/useCollections";

import {
  usePrompts,
} from "../features/prompts/hooks/usePrompts";

import type {
  Prompt,
} from "../types/prompt";


function formatDate(
  dateValue: string,
): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(dateValue));
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
    .slice(0, 5);
}


export function DashboardPage() {
  const promptsQuery =
    usePrompts();

  const collectionsQuery =
    useCollections();

  const prompts =
    promptsQuery.data ?? [];

  const collections =
    collectionsQuery.data ?? [];

  const favoriteCount =
    prompts.filter(
      (prompt) => prompt.favorite,
    ).length;

  const recentPrompts =
    getRecentPrompts(prompts);

  const collectionOverview =
  collections.map((collection) => ({
    ...collection,
    promptCount: prompts.filter(
      (prompt) =>
        prompt.collection_id === collection.id,
    ).length,
  }));

 const unassignedPromptCount =
  prompts.filter(
    (prompt) =>
      prompt.collection_id === null,
  ).length;

  const isLoading =
    promptsQuery.isPending ||
    collectionsQuery.isPending;

  const hasError =
    promptsQuery.isError ||
    collectionsQuery.isError;


  if (isLoading) {
    return (
      <main className="dashboard-page">
        <div className="page-header">
          <div>
            <p className="eyebrow">
              Overview
            </p>

            <h1>Dashboard</h1>

            <p>
              Loading your Prompt Studio
              workspace...
            </p>
          </div>
        </div>

        <div className="card dashboard-loading">
          Loading dashboard...
        </div>
      </main>
    );
  }


  if (hasError) {
    return (
      <main className="dashboard-page">
        <div className="page-header">
          <div>
            <p className="eyebrow">
              Overview
            </p>

            <h1>Dashboard</h1>
          </div>
        </div>

        <div
          className="error-banner"
          role="alert"
        >
          Dashboard data could not be loaded.
          Make sure the backend is running and
          try again.
        </div>
      </main>
    );
  }


  return (
    <main className="dashboard-page">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">
            Prompt Studio
          </p>

          <h1>Dashboard</h1>

          <p>
            Manage your prompts, collections,
            favorites, and comparison workflow
            from one place.
          </p>
        </div>

        <Link
          to="/prompts/new"
          className="primary-button"
        >
          New Prompt
        </Link>
      </div>


      <section
        className="dashboard-stats"
        aria-label="Workspace statistics"
      >
        <Link
          to="/prompts"
          className="dashboard-stat-card"
        >
          <span className="dashboard-stat-label">
            Total Prompts
          </span>

          <strong>
            {prompts.length}
          </strong>

          <span className="dashboard-stat-help">
            Saved prompts
          </span>
        </Link>


        <Link
          to="/prompts"
          className="dashboard-stat-card"
        >
          <span className="dashboard-stat-label">
            Favorites
          </span>

          <strong>
            {favoriteCount}
          </strong>

          <span className="dashboard-stat-help">
            Favorite prompts
          </span>
        </Link>


        <Link
          to="/collections"
          className="dashboard-stat-card"
        >
          <span className="dashboard-stat-label">
            Collections
          </span>

          <strong>
            {collections.length}
          </strong>

          <span className="dashboard-stat-help">
            Prompt collections
          </span>
        </Link>
      </section>


      <div className="dashboard-content-grid">
        <section className="card dashboard-recent">
          <div className="dashboard-section-header">
            <div>
              <h2>
                Recent Prompts
              </h2>

              <p>
                Your most recently updated
                prompts.
              </p>
            </div>

            <Link
              to="/prompts"
              className="dashboard-text-link"
            >
              View all
            </Link>
          </div>


          {recentPrompts.length === 0 ? (
            <div className="dashboard-empty">
              <h3>
                No prompts yet
              </h3>

              <p>
                Create your first prompt to
                start building your library.
              </p>

              <Link
                to="/prompts/new"
                className="primary-button"
              >
                Create Prompt
              </Link>
            </div>
          ) : (
            <div className="dashboard-prompt-list">
              {recentPrompts.map(
                (prompt) => (
                  <Link
                    key={prompt.id}
                    to={
                      `/prompts/${prompt.id}/edit`
                    }
                    className="dashboard-prompt-row"
                  >
                    <div className="dashboard-prompt-main">
                      <div className="dashboard-prompt-title">
                        <strong>
                          {prompt.title}
                        </strong>

                        {prompt.favorite && (
                          <span
                            className="dashboard-favorite"
                            aria-label="Favorite"
                            title="Favorite"
                          >
                            ★
                          </span>
                        )}
                      </div>

                      <p>
                        {prompt.description
                          ?.trim() ||
                          "No description provided."}
                      </p>
                    </div>

                    <div className="dashboard-prompt-date">
                      <span>
                        Updated
                      </span>

                      <time
                        dateTime={
                          prompt.updated_at
                        }
                      >
                        {formatDate(
                          prompt.updated_at,
                        )}
                      </time>
                    </div>
                  </Link>
                ),
              )}
            </div>
          )}
        </section>


        <aside className="dashboard-side-column">
          <section className="card dashboard-quick-actions">
            <div className="dashboard-section-header">
              <div>
                <h2>
                  Quick Actions
                </h2>

                <p>
                  Jump directly into common
                  tasks.
                </p>
              </div>
            </div>


            <div className="dashboard-action-list">
              <Link
                to="/prompts/new"
                className="dashboard-action"
              >
                <div>
                  <strong>
                    Create Prompt
                  </strong>

                  <span>
                    Build a new reusable prompt.
                  </span>
                </div>

                <span
                  className="dashboard-action-arrow"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>


              <Link
                to="/comparisons"
                className="dashboard-action"
              >
                <div>
                  <strong>
                    Compare Prompts
                  </strong>

                  <span>
                    Compare two saved prompts.
                  </span>
                </div>

                <span
                  className="dashboard-action-arrow"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>


              <Link
                to="/collections"
                className="dashboard-action"
              >
                <div>
                  <strong>
                    Manage Collections
                  </strong>

                  <span>
                    Organize your prompt
                    library.
                  </span>
                </div>

                <span
                  className="dashboard-action-arrow"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>


              <Link
                to="/prompts"
                className="dashboard-action"
              >
                <div>
                  <strong>
                    Prompt Library
                  </strong>

                  <span>
                    Browse all saved prompts.
                  </span>
                </div>

                <span
                  className="dashboard-action-arrow"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
            </div>
          </section>
          <section className="card dashboard-collections">
  <div className="dashboard-section-header">
    <div>
      <h2>
        Collection Overview
      </h2>

      <p>
        See how your prompts are organized.
      </p>
    </div>

    <Link
      to="/collections"
      className="dashboard-text-link"
    >
      Manage
    </Link>
  </div>

  <div className="dashboard-collection-list">
    {collectionOverview.map(
      (collection) => (
        <Link
          key={collection.id}
          to="/prompts"
          className="dashboard-collection-row"
        >
          <div className="dashboard-collection-name">
            <span
              className="dashboard-collection-icon"
              aria-hidden="true"
            >
              □
            </span>

            <span>
              {collection.name}
            </span>
          </div>

          <strong>
            {collection.promptCount}
          </strong>
        </Link>
      ),
    )}

    <Link
      to="/prompts"
      className="dashboard-collection-row"
    >
      <div className="dashboard-collection-name">
        <span
          className="dashboard-collection-icon"
          aria-hidden="true"
        >
          □
        </span>

        <span>
          No collection
        </span>
      </div>

      <strong>
        {unassignedPromptCount}
      </strong>
    </Link>
  </div>
</section>


          <section className="card dashboard-workspace">
            <h2>
              Workspace
            </h2>

            <div className="dashboard-workspace-row">
              <span>
                Prompts
              </span>

              <strong>
                {prompts.length}
              </strong>
            </div>

            <div className="dashboard-workspace-row">
              <span>
                Favorites
              </span>

              <strong>
                {favoriteCount}
              </strong>
            </div>

            <div className="dashboard-workspace-row">
              <span>
                Collections
              </span>

              <strong>
                {collections.length}
              </strong>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}