import {
  useQuery,
} from "@tanstack/react-query";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  getPrompt,
} from "../api/prompts";

import {
  PromptPlayground,
} from "../features/playground";


export function PlaygroundPage() {
  const params = useParams();

  const promptId =
    Number(params.promptId);


  const promptQuery = useQuery({
    queryKey: [
      "prompts",
      promptId,
    ],

    queryFn: () =>
      getPrompt(promptId),

    enabled:
      Number.isInteger(promptId)
      && promptId > 0,
  });


  if (promptQuery.isPending) {
    return (
      <p>
        Loading playground...
      </p>
    );
  }


  if (
    promptQuery.isError ||
    !promptQuery.data
  ) {
    return (
      <div className="card">
        <h2>
          Prompt not found
        </h2>

        <Link to="/prompts">
          Return to prompt library
        </Link>
      </div>
    );
  }


  const prompt =
    promptQuery.data;


  return (
    <section className="playground-page">
      <header className="page-header playground-page-header">
        <div>
          <p className="eyebrow">
            Prompt Playground
          </p>

          <h1>
            {prompt.title}
          </h1>

          <p>
            Test variables and inspect the
            rendered prompt before running it
            with an AI model.
          </p>
        </div>


        <div className="playground-page-actions">
          <Link
            className="secondary-button"
            to={`/prompts/${prompt.id}/edit`}
          >
            Edit prompt
          </Link>

          <Link
            to="/prompts"
            className="secondary-button"
          >
            Back to library
          </Link>
        </div>
      </header>


      <PromptPlayground
        prompt={prompt}
      />
    </section>
  );
}