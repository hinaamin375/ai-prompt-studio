import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  usePromptVersion,
  usePromptVersions,
  useRestorePromptVersion,
} from "../hooks/usePromptVersions";


interface PromptVersionHistoryProps {
  promptId: number;
}


function formatVersionDate(
  dateValue: string,
): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue));
}


export function PromptVersionHistory({
  promptId,
}: PromptVersionHistoryProps) {
  const [selectedVersion, setSelectedVersion] =
    useState<number | null>(null);

  const versionsQuery =
    usePromptVersions(promptId);

  const versionQuery =
    usePromptVersion(
      promptId,
      selectedVersion,
    );

  const restoreMutation =
    useRestorePromptVersion(promptId);

  const versions = useMemo(() => {
    return [...(versionsQuery.data ?? [])].sort(
      (left, right) =>
        right.version - left.version,
    );
  }, [versionsQuery.data]);


  async function handleRestore(): Promise<void> {
    if (selectedVersion === null) {
      return;
    }

    const confirmed = window.confirm(
      `Restore version ${selectedVersion}?\n\n` +
        "Your current prompt will be replaced with " +
        "the contents of this version. The current " +
        "state will remain available in version history.",
    );

    if (!confirmed) {
      return;
    }

    try {
      await restoreMutation.mutateAsync({
        version: selectedVersion,
      });

      toast.success(
        `Version ${selectedVersion} restored successfully.`,
      );

      setSelectedVersion(null);
    } catch {
      toast.error(
        "Could not restore prompt version.",
        {
          description: "Please try again.",
        },
      );
    }
  }


  if (versionsQuery.isPending) {
    return (
      <section className="prompt-version-history card">
        <h3>Version History</h3>

        <p className="prompt-version-message">
          Loading version history...
        </p>
      </section>
    );
  }


  if (versionsQuery.isError) {
    return (
      <section className="prompt-version-history card">
        <h3>Version History</h3>

        <div
          role="alert"
          className="error-banner"
        >
          Version history could not be loaded.
        </div>
      </section>
    );
  }


  return (
    <section className="prompt-version-history card">
      <div className="prompt-version-header">
        <div>
          <h3>Version History</h3>

          <p>
            Review previous versions of this prompt
            or restore an earlier version.
          </p>
        </div>

        <span className="prompt-version-count">
          {versions.length}
        </span>
      </div>


      {versions.length === 0 ? (
        <div className="prompt-version-empty">
          <p>
            No previous versions yet.
          </p>

          <span>
            Version history will appear after this
            prompt is updated.
          </span>
        </div>
      ) : (
        <div className="prompt-version-layout">
          <div className="prompt-version-list">
            {versions.map((version) => {
              const isSelected =
                selectedVersion ===
                version.version;

              return (
                <button
                  key={version.id}
                  type="button"
                  className={
                    isSelected
                      ? "prompt-version-item selected"
                      : "prompt-version-item"
                  }
                  onClick={() =>
                    setSelectedVersion(
                      version.version,
                    )
                  }
                >
                  <div className="prompt-version-item-top">
                    <strong>
                      Version {version.version}
                    </strong>

                    <span>
                      View
                    </span>
                  </div>

                  <time
                    dateTime={version.created_at}
                  >
                    {formatVersionDate(
                      version.created_at,
                    )}
                  </time>
                </button>
              );
            })}
          </div>


          <div className="prompt-version-detail">
            {selectedVersion === null ? (
              <div className="prompt-version-placeholder">
                <strong>
                  Select a version
                </strong>

                <p>
                  Choose a version to inspect its
                  saved prompt contents.
                </p>
              </div>
            ) : versionQuery.isPending ? (
              <div className="prompt-version-placeholder">
                <p>
                  Loading version{" "}
                  {selectedVersion}...
                </p>
              </div>
            ) : versionQuery.isError ||
              !versionQuery.data ? (
              <div
                role="alert"
                className="error-banner"
              >
                This version could not be loaded.
              </div>
            ) : (
              <>
                <div className="prompt-version-detail-header">
                  <div>
                    <p className="eyebrow">
                      Saved snapshot
                    </p>

                    <h4>
                      Version{" "}
                      {versionQuery.data.version}
                    </h4>

                    <time
                      dateTime={
                        versionQuery.data.created_at
                      }
                    >
                      {formatVersionDate(
                        versionQuery.data.created_at,
                      )}
                    </time>
                  </div>

                  <button
                    type="button"
                    className="primary-button"
                    disabled={
                      restoreMutation.isPending
                    }
                    onClick={handleRestore}
                  >
                    {restoreMutation.isPending
                      ? "Restoring..."
                      : "Restore this version"}
                  </button>
                </div>


                <div className="prompt-version-fields">
                  <div className="prompt-version-field">
                    <span>Title</span>

                    <p>
                      {versionQuery.data.title}
                    </p>
                  </div>


                  <div className="prompt-version-field">
                    <span>Description</span>

                    <p>
                      {versionQuery.data.description
                        ?.trim() ||
                        "No description provided."}
                    </p>
                  </div>


                  <div className="prompt-version-field">
                    <span>System prompt</span>

                    <pre>
                      {versionQuery.data.system_prompt
                        ?.trim() ||
                        "No system prompt provided."}
                    </pre>
                  </div>


                  <div className="prompt-version-field">
                    <span>User prompt</span>

                    <pre>
                      {
                        versionQuery.data
                          .user_prompt
                      }
                    </pre>
                  </div>


                  <div className="prompt-version-metadata">
                    <span>
                      {versionQuery.data.favorite
                        ? "★ Favorite"
                        : "Not favorite"}
                    </span>

                    <span>
                      {versionQuery.data
                        .collection_id === null
                        ? "No collection"
                        : `Collection #${
                            versionQuery.data
                              .collection_id
                          }`}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}