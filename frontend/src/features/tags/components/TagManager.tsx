import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createTag,
  deleteTag,
  listTags,
  updateTag,
} from "../../../api/tags";

import type {
  Tag,
} from "../../../types/tag";


function getErrorMessage(
  error: unknown,
): string {
  if (
    typeof error === "object"
    && error !== null
    && "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            error?: {
              message?: string;
            };
          };
        };
      }
    ).response;

    const message =
      response?.data?.error?.message;

    if (message) {
      return message;
    }
  }

  return "Something went wrong. Please try again.";
}


export function TagManager() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] =
    useState("");

  const [editingTagId, setEditingTagId] =
    useState<number | null>(null);

  const [editingName, setEditingName] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingTagId, setDeletingTagId] =
    useState<number | null>(null);

  const [error, setError] =
    useState<string | null>(null);


  const loadTags = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await listTags();

        setTags(data);
      } catch (loadError) {
        setError(
          getErrorMessage(loadError),
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );


  useEffect(() => {
    void loadTags();
  }, [loadTags]);


  async function handleCreateTag(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const name = newTagName.trim();

    if (!name) {
      setError(
        "Enter a tag name before adding it.",
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const createdTag =
        await createTag({
          name,
        });

      setTags((currentTags) =>
        [...currentTags, createdTag].sort(
          (left, right) =>
            left.name.localeCompare(
              right.name,
            ),
        ),
      );

      setNewTagName("");
    } catch (createError) {
      setError(
        getErrorMessage(createError),
      );
    } finally {
      setSaving(false);
    }
  }


  function beginEditing(
    tag: Tag,
  ) {
    setEditingTagId(tag.id);
    setEditingName(tag.name);
    setError(null);
  }


  function cancelEditing() {
    setEditingTagId(null);
    setEditingName("");
    setError(null);
  }


  async function handleRenameTag(
    tagId: number,
  ) {
    const name = editingName.trim();

    if (!name) {
      setError(
        "Tag name cannot be empty.",
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updatedTag =
        await updateTag(
          tagId,
          {
            name,
          },
        );

      setTags((currentTags) =>
        currentTags
          .map((tag) =>
            tag.id === tagId
              ? updatedTag
              : tag,
          )
          .sort(
            (left, right) =>
              left.name.localeCompare(
                right.name,
              ),
          ),
      );

      setEditingTagId(null);
      setEditingName("");
    } catch (updateError) {
      setError(
        getErrorMessage(updateError),
      );
    } finally {
      setSaving(false);
    }
  }


  async function handleDeleteTag(
    tag: Tag,
  ) {
    const confirmed = window.confirm(
      `Delete the "${tag.name}" tag?\n\n`
      + "The tag will be removed from prompts that use it.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingTagId(tag.id);
      setError(null);

      await deleteTag(tag.id);

      setTags((currentTags) =>
        currentTags.filter(
          (currentTag) =>
            currentTag.id !== tag.id,
        ),
      );

      if (editingTagId === tag.id) {
        cancelEditing();
      }
    } catch (deleteError) {
      setError(
        getErrorMessage(deleteError),
      );
    } finally {
      setDeletingTagId(null);
    }
  }


  return (
    <div className="tag-manager">
      <div className="tag-manager__header">
        <div>
          <h2>Tags</h2>

          <p>
            Create and manage reusable tags
            for organizing your prompts.
          </p>
        </div>

        <span className="tag-manager__count">
          {tags.length}
          {" "}
          {tags.length === 1
            ? "tag"
            : "tags"}
        </span>
      </div>


      <form
        className="tag-manager__create"
        onSubmit={handleCreateTag}
      >
        <div className="tag-manager__create-field">
          <label htmlFor="new-tag-name">
            Create tag
          </label>

          <input
            id="new-tag-name"
            type="text"
            value={newTagName}
            maxLength={50}
            placeholder="e.g. research"
            disabled={saving}
            onChange={(event) =>
              setNewTagName(
                event.target.value,
              )
            }
          />
        </div>

        <button
          type="submit"
          className="tag-manager__add-button"
          disabled={
            saving
            || !newTagName.trim()
          }
        >
          {saving
            ? "Adding..."
            : "Add tag"}
        </button>
      </form>


      {error && (
        <div
          className="tag-manager__error"
          role="alert"
        >
          {error}
        </div>
      )}


      <div className="tag-manager__list">
        {loading && (
          <div className="tag-manager__state">
            Loading tags...
          </div>
        )}


        {!loading && tags.length === 0 && (
          <div className="tag-manager__empty">
            <strong>No tags yet</strong>

            <p>
              Create your first tag to start
              organizing prompts.
            </p>
          </div>
        )}


        {!loading
          && tags.map((tag) => {
            const editing =
              editingTagId === tag.id;

            const deleting =
              deletingTagId === tag.id;

            return (
              <div
                key={tag.id}
                className="tag-manager__row"
              >
                <div className="tag-manager__tag">
                  {editing ? (
                    <input
                      type="text"
                      value={editingName}
                      maxLength={50}
                      autoFocus
                      disabled={saving}
                      aria-label={`Rename ${tag.name}`}
                      onChange={(event) =>
                        setEditingName(
                          event.target.value,
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter"
                        ) {
                          event.preventDefault();

                          void handleRenameTag(
                            tag.id,
                          );
                        }

                        if (
                          event.key === "Escape"
                        ) {
                          cancelEditing();
                        }
                      }}
                    />
                  ) : (
                    <span className="tag-manager__badge">
                      {tag.name}
                    </span>
                  )}
                </div>


                <div className="tag-manager__actions">
                  {editing ? (
                    <>
                      <button
                        type="button"
                        className="tag-manager__save"
                        disabled={
                          saving
                          || !editingName.trim()
                        }
                        onClick={() =>
                          void handleRenameTag(
                            tag.id,
                          )
                        }
                      >
                        Save
                      </button>

                      <button
                        type="button"
                        className="tag-manager__cancel"
                        disabled={saving}
                        onClick={
                          cancelEditing
                        }
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="tag-manager__rename"
                        disabled={deleting}
                        onClick={() =>
                          beginEditing(tag)
                        }
                      >
                        Rename
                      </button>

                      <button
                        type="button"
                        className="tag-manager__delete"
                        disabled={deleting}
                        onClick={() =>
                          void handleDeleteTag(
                            tag,
                          )
                        }
                      >
                        {deleting
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}