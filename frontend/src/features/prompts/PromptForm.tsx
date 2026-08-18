import { useEffect } from "react";
import { useForm } from "react-hook-form";

import type {
  PromptCreate,
} from "../../types/prompt";

import { useCollections } from "./hooks/useCollections";
import { useTags } from "./hooks/useTags";


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
  tag_ids: [],
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
    data: tags = [],
    isLoading: tagsLoading,
    isError: tagsError,
  } = useTags();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PromptCreate>({
    defaultValues: initialValues,
  });

  const selectedTagIds =
    watch("tag_ids") ?? [];

  useEffect(() => {
    reset({
      ...initialValues,
      tag_ids:
        initialValues.tag_ids ?? [],
    });
  }, [
    initialValues.title,
    initialValues.description,
    initialValues.system_prompt,
    initialValues.user_prompt,
    initialValues.collection_id,
    initialValues.tag_ids,
    reset,
  ]);

  function toggleTag(
    tagId: number,
  ): void {
    const currentTagIds =
      selectedTagIds ?? [];

    const isSelected =
      currentTagIds.includes(tagId);

    const nextTagIds = isSelected
      ? currentTagIds.filter(
          (id) => id !== tagId,
        )
      : [
          ...currentTagIds,
          tagId,
        ];

    setValue(
      "tag_ids",
      nextTagIds,
      {
        shouldDirty: true,
      },
    );
  }

  async function handleFormSubmit(
    values: PromptCreate,
  ): Promise<void> {
    await onSubmit({
      ...values,
      collection_id:
        values.collection_id ?? null,
      tag_ids:
        values.tag_ids ?? [],
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
        <span className="form-field-label">
          Tags
        </span>

        {tagsLoading && (
          <p className="field-help">
            Loading tags...
          </p>
        )}

        {tagsError && (
          <p className="field-error">
            Tags could not be loaded.
          </p>
        )}

        {!tagsLoading &&
          !tagsError &&
          tags.length === 0 && (
            <p className="field-help">
              No tags have been created yet.
            </p>
          )}

        {!tagsLoading &&
          !tagsError &&
          tags.length > 0 && (
            <div className="prompt-tag-selector">
              {tags.map((tag) => {
                const selected =
                  selectedTagIds.includes(
                    tag.id,
                  );

                return (
                  <button
                    key={tag.id}
                    type="button"
                    className={
                      selected
                        ? "prompt-tag-option selected"
                        : "prompt-tag-option"
                    }
                    aria-pressed={selected}
                    onClick={() =>
                      toggleTag(tag.id)
                    }
                  >
                    <span>
                      {tag.name}
                    </span>

                    {selected && (
                      <span
                        aria-hidden="true"
                      >
                        ×
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

        <p className="field-help">
          Select one or more tags for this
          prompt.
        </p>
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
          placeholder="Summarize the following text:{{text}}"
          {...register("user_prompt", {
            required:
              "User prompt is required.",
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