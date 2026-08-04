import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { listPrompts } from "../api/prompts";
import { PromptLibrary } from "../features/prompts/components/PromptLibrary";

export function PromptsPage() {
  const promptsQuery = useQuery({
    queryKey: ["prompts"],
    queryFn: listPrompts,
  });

  if (promptsQuery.isPending) {
    return (
      <section>
        <header className="page-header">
          <p className="eyebrow">
            Prompt Management
          </p>

          <h2>Prompt Library</h2>

          <p>Loading your saved prompts...</p>
        </header>

        <div className="card">
          Loading prompts...
        </div>
      </section>
    );
  }

  if (
    promptsQuery.isError ||
    !promptsQuery.data
  ) {
    return (
      <section>
        <header className="page-header">
          <p className="eyebrow">
            Prompt Management
          </p>

          <h2>Prompt Library</h2>
        </header>

        <div className="card">
          <h3>Unable to load prompts</h3>

          <p>
            Confirm the backend is running and
            try again.
          </p>

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              promptsQuery.refetch()
            }
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <header className="page-header page-header-row">
        <div>
          <p className="eyebrow">
            Prompt Management
          </p>

          <h2>Prompt Library</h2>

          <p>
            Search, organize, and manage your
            saved prompts.
          </p>
        </div>

        <Link
          to="/prompts/new"
          className="primary-button"
        >
          New Prompt
        </Link>
      </header>

      {promptsQuery.data.length === 0 ? (
        <div className="card empty-state">
          <h3>No prompts yet</h3>

          <p>
            Create your first prompt to begin
            analyzing and comparing it.
          </p>

          <Link
            to="/prompts/new"
            className="primary-button"
          >
            Create Prompt
          </Link>
        </div>
      ) : (
        <PromptLibrary
          prompts={promptsQuery.data}
        />
      )}
    </section>
  );
}