import { useForm } from "react-hook-form";
import { useEffect } from "react";
import type {
  PromptCreate,
} from "../../types/prompt";
import { useCollections } from "./hooks/useCollections";


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
  collection_id: null,
};


export function PromptForm({
  initialValues = defaultValues,
  submitLabel,
  isSubmitting,
  onSubmit,
}: PromptFormProps) {
  const {
    data: collections = [],
    isLoading: collectionsLoading,
    isError: collectionsError,
  } = useCollections();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PromptCreate>({
    defaultValues: initialValues,
  });
  useEffect(() => {
  reset(initialValues);
}, [
  initialValues.title,
  initialValues.description,
  initialValues.system_prompt,
  initialValues.user_prompt,
  initialValues.collection_id,
  reset,
]);


  async function handleFormSubmit(
    values: PromptCreate,
  ): Promise<void> {
    await onSubmit({
      ...values,
      collection_id:
        values.collection_id ?? null,
    });
  }


  return (
    <form
      className="prompt-form"
      onSubmit={handleSubmit(handleFormSubmit)}
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
        <label htmlFor="collection">
          Collection
        </label>

        <select
          id="collection"
          disabled={
            collectionsLoading ||
            collectionsError
          }
          {...register("collection_id", {
            setValueAs: (value) => {
              if (
                value === "" ||
                value === null ||
                value === undefined
              ) {
                return null;
              }

              return Number(value);
            },
          })}
        >
          <option value="">
            No collection
          </option>

          {collections.map((collection) => (
            <option
              key={collection.id}
              value={collection.id}
            >
              {collection.name}
            </option>
          ))}
        </select>

        {collectionsLoading && (
          <p className="field-help">
            Loading collections...
          </p>
        )}

        {collectionsError && (
          <p className="field-error">
            Collections could not be loaded.
          </p>
        )}
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