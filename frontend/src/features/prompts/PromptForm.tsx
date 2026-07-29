import { useForm } from "react-hook-form";

import type {
  PromptCreate,
} from "../../types/prompt";

interface PromptFormProps {
  initialValues?: PromptCreate;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (
    values: PromptCreate,
  ) => Promise<void>;
}

const defaultValues: PromptCreate = {
  title: "",
  description: "",
  system_prompt: "",
  user_prompt: "",
};

export function PromptForm({
  initialValues = defaultValues,
  submitLabel,
  isSubmitting,
  onSubmit,
}: PromptFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PromptCreate>({
    defaultValues: initialValues,
  });

  return (
    <form
      className="prompt-form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="form-field">
        <label htmlFor="title">
          Title
        </label>

        <input
          id="title"
          type="text"
          {...register("title", {
            required: "Title is required.",
            maxLength: {
              value: 200,
              message:
                "Title cannot exceed 200 characters.",
            },
          })}
        />

        {errors.title && (
          <p className="field-error">
            {errors.title.message}
          </p>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="description">
          Description
        </label>

        <textarea
          id="description"
          rows={3}
          {...register("description")}
        />
      </div>

      <div className="form-field">
        <label htmlFor="system-prompt">
          System prompt
        </label>

        <textarea
          id="system-prompt"
          rows={8}
          placeholder="You are a helpful assistant..."
          {...register("system_prompt")}
        />

        <p className="field-help">
          Define the AI's role, behavior, and
          constraints.
        </p>
      </div>

      <div className="form-field">
        <label htmlFor="user-prompt">
          User prompt
        </label>

        <textarea
          id="user-prompt"
          rows={12}
          placeholder="Summarize the following text: {{text}}"
          {...register("user_prompt", {
            required: "User prompt is required.",
          })}
        />

        {errors.user_prompt && (
          <p className="field-error">
            {errors.user_prompt.message}
          </p>
        )}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="primary-button"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : submitLabel}
        </button>
      </div>
    </form>
  );
}