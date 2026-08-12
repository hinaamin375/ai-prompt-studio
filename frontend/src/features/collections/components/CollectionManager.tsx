import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  toast,
} from "sonner";

import type {
  Collection,
} from "../../../types/collection";

import {
  useCollections,
} from "../../prompts/hooks/useCollections";

import {
  usePrompts,
} from "../../prompts/hooks/usePrompts";

import {
  useCollectionMutations,
} from "../hooks/useCollectionMutations";


export function CollectionManager() {
  const [
    newCollectionName,
    setNewCollectionName,
  ] = useState("");

  const [
    editingCollectionId,
    setEditingCollectionId,
  ] = useState<number | null>(null);

  const [
    editingName,
    setEditingName,
  ] = useState("");


  const {
    data: collections = [],
    isLoading: collectionsLoading,
    isError: collectionsError,
  } = useCollections();


  const {
    data: prompts = [],
    isLoading: promptsLoading,
  } = usePrompts();

  const unassignedPromptCount =
  prompts.filter(
    (prompt) =>
      prompt.collection_id === null,
  ).length;


  const {
    createCollection,
    updateCollection,
    deleteCollection,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCollectionMutations();


  function getPromptCount(
    collectionId: number,
  ): number {
    return prompts.filter(
      (prompt) =>
        prompt.collection_id ===
        collectionId,
    ).length;
  }


  async function handleCreate(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const name =
      newCollectionName.trim();

    if (!name) {
      toast.error(
        "Enter a collection name.",
      );

      return;
    }


    const duplicate =
      collections.some(
        (collection) =>
          collection.name
            .trim()
            .toLowerCase() ===
          name.toLowerCase(),
      );

    if (duplicate) {
      toast.error(
        "A collection with this name already exists.",
      );

      return;
    }


    try {
      await createCollection({
        name,
      });

      setNewCollectionName("");

      toast.success(
        `Collection "${name}" created.`,
      );
    } catch {
      toast.error(
        "Unable to create collection.",
      );
    }
  }


  function startEditing(
    collection: Collection,
  ): void {
    setEditingCollectionId(
      collection.id,
    );

    setEditingName(
      collection.name,
    );
  }


  function cancelEditing(): void {
    setEditingCollectionId(null);
    setEditingName("");
  }


  async function saveEditing(
    collection: Collection,
  ): Promise<void> {
    const name =
      editingName.trim();

    if (!name) {
      toast.error(
        "Collection name cannot be empty.",
      );

      return;
    }


    const duplicate =
      collections.some(
        (item) =>
          item.id !== collection.id &&
          item.name
            .trim()
            .toLowerCase() ===
          name.toLowerCase(),
      );

    if (duplicate) {
      toast.error(
        "A collection with this name already exists.",
      );

      return;
    }


    if (name === collection.name) {
      cancelEditing();

      return;
    }


    try {
      await updateCollection({
        collectionId:
          collection.id,

        data: {
          name,
        },
      });

      cancelEditing();

      toast.success(
        "Collection renamed.",
      );
    } catch {
      toast.error(
        "Unable to rename collection.",
      );
    }
  }


  async function handleDelete(
    collection: Collection,
  ): Promise<void> {
    const promptCount =
      getPromptCount(
        collection.id,
      );

    const promptMessage =
      promptCount > 0
        ? `\n\n${promptCount} ${
            promptCount === 1
              ? "prompt is"
              : "prompts are"
          } currently assigned to this collection. ${
            promptCount === 1
              ? "It"
              : "They"
          } will become unassigned.`
        : "";

    const confirmed =
      window.confirm(
        `Delete "${collection.name}"?${promptMessage}\n\nThe prompts themselves will not be deleted.`,
      );

    if (!confirmed) {
      return;
    }


    try {
      await deleteCollection(
        collection.id,
      );

      if (
        editingCollectionId ===
        collection.id
      ) {
        cancelEditing();
      }

      toast.success(
        `Collection "${collection.name}" deleted.`,
      );
    } catch {
      toast.error(
        "Unable to delete collection.",
      );
    }
  }


  return (
    <section className="collection-manager">
      <div className="collection-create-card">
        <div>
          <h2>
            Create collection
          </h2>

          <p>
            Group related prompts so they
            are easier to organize and
            filter.
          </p>
        </div>


        <form
          className="collection-create-form"
          onSubmit={handleCreate}
        >
          <div className="collection-name-field">
            <label htmlFor="new-collection-name">
              Collection name
            </label>

            <input
              id="new-collection-name"
              type="text"
              value={newCollectionName}
              maxLength={100}
              placeholder="e.g. Work"
              disabled={isCreating}
              onChange={(event) =>
                setNewCollectionName(
                  event.target.value,
                )
              }
            />
          </div>


          <button
            type="submit"
            className="primary-button"
            disabled={
              isCreating ||
              !newCollectionName.trim()
            }
          >
            {isCreating
              ? "Creating..."
              : "Create collection"}
          </button>
        </form>
      </div>
 <div className="collection-unassigned-card">
  <div>
    <span className="collection-unassigned-label">
      Unassigned prompts
    </span>

    <strong className="collection-unassigned-count">
      {promptsLoading
        ? "..."
        : unassignedPromptCount}
    </strong>

    <p>
      {promptsLoading
        ? "Checking prompt assignments..."
        : unassignedPromptCount === 1
          ? "1 prompt is not assigned to a collection."
          : `${unassignedPromptCount} prompts are not assigned to a collection.`}
    </p>
  </div>

  <Link
    className="secondary-button collection-view-link"
    to="/prompts?collection=none"
  >
    View unassigned
  </Link>
</div>

      <div className="collection-list-section">
        <div className="collection-list-heading">
          <div>
            <h2>
              Your collections
            </h2>

            <p>
              View, rename, or delete
              existing collections.
            </p>
          </div>

          {!collectionsLoading && (
            <span className="collection-count">
              {collections.length}{" "}
              {collections.length === 1
                ? "collection"
                : "collections"}
            </span>
          )}
        </div>


        {collectionsLoading && (
          <div className="collection-state-card">
            Loading collections...
          </div>
        )}


        {collectionsError && (
          <div className="collection-state-card">
            <h3>
              Unable to load collections
            </h3>

            <p>
              Check that the backend is
              running and try again.
            </p>
          </div>
        )}


        {!collectionsLoading &&
          !collectionsError &&
          collections.length === 0 && (
            <div className="collection-state-card">
              <h3>
                No collections yet
              </h3>

              <p>
                Create your first
                collection above.
              </p>
            </div>
          )}


        {!collectionsLoading &&
          !collectionsError &&
          collections.length > 0 && (
            <div className="collection-list">
              {collections.map(
                (collection) => {
                  const isEditing =
                    editingCollectionId ===
                    collection.id;

                  const promptCount =
                    getPromptCount(
                      collection.id,
                    );

                  return (
                    <article
                      key={collection.id}
                      className="collection-row"
                    >
                      <div className="collection-row-main">
                        <div
                          className="collection-icon"
                          aria-hidden="true"
                        >
                          📁
                        </div>


                        {isEditing ? (
                          <div className="collection-edit-field">
                            <label
                              className="sr-only"
                              htmlFor={`collection-${collection.id}`}
                            >
                              Collection name
                            </label>

                            <input
                              id={`collection-${collection.id}`}
                              type="text"
                              value={
                                editingName
                              }
                              maxLength={100}
                              autoFocus
                              disabled={
                                isUpdating
                              }
                              onChange={(
                                event,
                              ) =>
                                setEditingName(
                                  event
                                    .target
                                    .value,
                                )
                              }
                              onKeyDown={(
                                event,
                              ) => {
                                if (
                                  event.key ===
                                  "Enter"
                                ) {
                                  event.preventDefault();

                                  void saveEditing(
                                    collection,
                                  );
                                }

                                if (
                                  event.key ===
                                  "Escape"
                                ) {
                                  cancelEditing();
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <div className="collection-details">
                            <h3>
                              {
                                collection.name
                              }
                            </h3>

                            <div className="collection-meta">
                              <span>
                                {promptsLoading
                                  ? "Loading prompts..."
                                  : `${promptCount} ${
                                      promptCount === 1
                                        ? "prompt"
                                        : "prompts"
                                    }`}
                              </span>

                              <span
                                aria-hidden="true"
                              >
                                ·
                              </span>

                              <span>
                                Collection #
                                {
                                  collection.id
                                }
                              </span>
                            </div>
                          </div>
                        )}
                      </div>


                      <div className="collection-row-actions">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              className="primary-button"
                              disabled={
                                isUpdating ||
                                !editingName.trim()
                              }
                              onClick={() =>
                                void saveEditing(
                                  collection,
                                )
                              }
                            >
                              {isUpdating
                                ? "Saving..."
                                : "Save"}
                            </button>

                            <button
                              type="button"
                              className="secondary-button"
                              disabled={
                                isUpdating
                              }
                              onClick={
                                cancelEditing
                              }
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <Link
                              className="secondary-button collection-view-link"
                              to={`/prompts?collection=${collection.id}`}
                            >
                              View prompts
                            </Link>

                            <button
                              type="button"
                              className="secondary-button"
                              disabled={
                                isDeleting
                              }
                              onClick={() =>
                                startEditing(
                                  collection,
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="danger-button"
                              disabled={
                                isDeleting
                              }
                              onClick={() =>
                                void handleDelete(
                                  collection,
                                )
                              }
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          )}
      </div>
    </section>
  );
}