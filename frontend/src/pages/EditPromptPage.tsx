import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  deletePrompt,
  getPrompt,
  updatePrompt,
} from "../api/prompts";
import { AnalysisPanel } from "../features/analysis";
import { PromptForm } from "../features/prompts/PromptForm";
import type {
  PromptCreate,
  PromptUpdate,
} from "../types/prompt";

export function EditPromptPage() {
  const params = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const promptId = Number(params.promptId);

  const promptQuery = useQuery({
    queryKey: ["prompts", promptId],
    queryFn: () => getPrompt(promptId),
    enabled: Number.isInteger(promptId),
  });

  const updateMutation = useMutation({
    mutationFn: (data: PromptUpdate) =>
      updatePrompt(promptId, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["prompts"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["prompts", promptId],
      });

      navigate("/prompts");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePrompt(promptId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["prompts"],
      });

      navigate("/prompts");
    },
  });

  async function handleUpdate(
    values: PromptCreate,
  ): Promise<void> {
    await updateMutation.mutateAsync({
      ...values,
      description:
        values.description?.trim() || null,
      system_prompt:
        values.system_prompt?.trim() || null,
    });
  }

  async function handleDelete(): Promise<void> {
    const confirmed = window.confirm(
      "Delete this prompt permanently?",
    );

    if (!confirmed) {
      return;
    }

    await deleteMutation.mutateAsync();
  }

  if (promptQuery.isPending) {
    return <p>Loading prompt...</p>;
  }

  if (
    promptQuery.isError ||
    !promptQuery.data
  ) {
    return (
      <div className="card">
        <h2>Prompt not found</h2>

        <Link to="/prompts">
          Return to prompt library
        </Link>
      </div>
    );
  }

  const initialValues: PromptCreate = {
    title: promptQuery.data.title,
    description:
      promptQuery.data.description ?? "",
    system_prompt:
      promptQuery.data.system_prompt ?? "",
    user_prompt:
      promptQuery.data.user_prompt,
  };

  return (
    <section>
      <header className="page-header page-header-row">
        <div>
          <p className="eyebrow">
            Prompt Management
          </p>

          <h2>Edit Prompt</h2>

          <p>
            Update or delete this prompt.
          </p>
        </div>

        <button
          type="button"
          className="danger-button"
          disabled={deleteMutation.isPending}
          onClick={handleDelete}
        >
          {deleteMutation.isPending
            ? "Deleting..."
            : "Delete Prompt"}
        </button>
      </header>

      {updateMutation.isError && (
        <div
          role="alert"
          className="error-banner"
        >
          Changes could not be saved.
        </div>
      )}

      <div className="editor-card">
        <PromptForm
          initialValues={initialValues}
          submitLabel="Save Changes"
          isSubmitting={
            updateMutation.isPending
          }
          onSubmit={handleUpdate}
        />
      </div>

      <div className="card analysis-test-card">
        <h3>Prompt Analysis</h3>

        <p>
          Analyze this saved prompt using the
          Prompt Engine.
        </p>

      <AnalysisPanel
  prompt={promptQuery.data}
/>
      </div>
    </section>
  );
}