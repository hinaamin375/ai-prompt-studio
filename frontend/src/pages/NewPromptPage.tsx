import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { createPrompt } from "../api/prompts";
import { PromptForm } from "../features/prompts/PromptForm";
import type { PromptCreate } from "../types/prompt";
import { toast } from "sonner";

export function NewPromptPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createPrompt,

  onSuccess: async () => {
    await queryClient.invalidateQueries({
      queryKey: ["prompts"],
    });

    toast.success("Prompt created successfully");

    navigate("/prompts");
  },

  onError: () => {
    toast.error("Could not create prompt", {
      description: "Please check the form and try again.",
    });
  },
  });

  async function handleSubmit(
    values: PromptCreate,
  ): Promise<void> {
    await createMutation.mutateAsync({
      ...values,
      description:
        values.description?.trim() || null,
      system_prompt:
        values.system_prompt?.trim() || null,
    });
  }

  return (
    <section>
      <header className="page-header">
        <p className="eyebrow">
          Prompt management
        </p>
        <h2>Create Prompt</h2>
        <p>
          Create a reusable prompt template.
        </p>
      </header>

      {createMutation.isError && (
        <div role="alert" className="error-banner">
          The prompt could not be saved. Please try
          again.
        </div>
      )}

      <div className="editor-card">
        <PromptForm
          submitLabel="Create prompt"
          isSubmitting={
            createMutation.isPending
          }
          onSubmit={handleSubmit}
        />
      </div>
    </section>
  );
}