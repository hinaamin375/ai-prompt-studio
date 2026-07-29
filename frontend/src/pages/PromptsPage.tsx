import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { listPrompts } from "../api/prompts";
import { PromptList } from "../features/prompts/PromptList";

export function PromptsPage() {
  const promptsQuery = useQuery({
    queryKey: ["prompts"],
    queryFn: listPrompts,
  });

  if (promptsQuery.isPending) {
    return <p>Loading prompts...</p>;
  }

  if (promptsQuery.isError) {
    return (
      <div role="alert" className="card">
        <h2>Unable to load prompts</h2>
        <p>
          Confirm that the backend is running and try
          again.
        </p>
      </div>
    );
  }

  return (
    <section>
      <header className="page-header page-header-row">
        <div>
          <p className="eyebrow">Prompt management</p>
          <h2>Prompt Library</h2>
          <p>
            Create and manage reusable AI prompt
            templates.
          </p>
        </div>

        <Link
          to="/prompts/new"
          className="primary-button"
        >
          New prompt
        </Link>
      </header>

      {promptsQuery.data.length === 0 ? (
        <div className="card empty-state">
          <h3>No prompts yet</h3>
          <p>
            Create your first prompt to begin building
            your library.
          </p>

          <Link
            to="/prompts/new"
            className="primary-button"
          >
            Create prompt
          </Link>
        </div>
      ) : (
        <PromptList
          prompts={promptsQuery.data}
        />
      )}
    </section>
  );
}