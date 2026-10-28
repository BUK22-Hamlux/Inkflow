import { useCallback, useEffect, useState } from "react";
import { FileText, LogOut, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEditorContext } from "../context/EditorContext";
import { deleteAccountDocument, getAccountDocument, listAccountDocuments } from "../lib/api";
import formatDate from "../helper/FormatDate";
import { deleteDocument, getAllDocuments, getDocumentById, saveDocument } from "../utils/localStorage";

const AccountDashboard = () => {
  const { user, endSession } = useAuth();
  const {
    openNewDocument,
    openExistingDocument,
    returnToWelcome,
    syncPendingDocuments,
    restorePreviousVersion,
    retryDocumentSync,
  } = useEditorContext();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openingId, setOpeningId] = useState(null);
  const [error, setError] = useState("");
  const [offlineMessage, setOfflineMessage] = useState("");

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    setError("");
    setOfflineMessage("");
    try {
      await syncPendingDocuments();
      const remoteDocuments = await listAccountDocuments();
      const localDocuments = await getAllDocuments(user.id);
      const merged = new Map(remoteDocuments.map((document) => [document.id, {
        ...document,
        lastEditedAt: document.updatedAt,
        syncStatus: "synced",
      }]));
      for (const local of localDocuments) {
        if (local.syncStatus === "pending_delete") merged.delete(local.id);
        else if (local.syncStatus !== "synced" && local.syncStatus !== "local" || !merged.has(local.id)) {
          merged.set(local.id, local);
        } else if (local.previousVersions?.length) {
          merged.set(local.id, { ...merged.get(local.id), previousVersions: local.previousVersions });
        }
      }
      setDocuments([...merged.values()].sort((a, b) =>
        new Date(b.lastEditedAt || b.updatedAt || 0) - new Date(a.lastEditedAt || a.updatedAt || 0),
      ));
    } catch (loadError) {
      const cached = await getAllDocuments(user.id);
      setDocuments(cached.filter((document) => document.syncStatus !== "pending_delete"));
      if (cached.length) setOfflineMessage("Offline: showing this account's documents saved on this device.");
      else setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, [syncPendingDocuments, user?.id]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleOpenDocument = async (id) => {
    setOpeningId(id);
    setError("");
    try {
      let document = await getDocumentById(id);
      if (navigator.onLine && document?.syncStatus === "synced") {
        try {
          document = await getAccountDocument(id);
          await saveDocument({
            ...document,
            ownerUserId: user.id,
            lastEditedAt: document.updatedAt,
            serverUpdatedAt: document.updatedAt,
            syncStatus: "synced",
          });
        } catch {
          // A cached copy can still be opened when the server is unreachable.
        }
      }
      if (!document) document = await getAccountDocument(id);
      openExistingDocument(document, { storage: "account" });
    } catch (openError) {
      setError(openError.message);
      setOpeningId(null);
    }
  };

  const handleDeleteDocument = async (document) => {
    const local = await getDocumentById(document.id);
    await saveDocument({
      ...(local || document),
      id: document.id,
      ownerUserId: user.id,
      syncStatus: "pending_delete",
    });
    setDocuments((current) => current.filter((item) => item.id !== document.id));
    try {
      if (navigator.onLine) {
        await deleteAccountDocument(document.id, {
          expectedUpdatedAt: local?.serverUpdatedAt || document.serverUpdatedAt || document.updatedAt || null,
          title: local?.title || document.title,
          content: local?.content,
          preview: local?.preview || document.preview,
          wordCount: local?.wordCount || document.wordCount,
          pageSettings: local?.pageSettings,
        });
      }
      await deleteDocument(document.id);
    } catch (deleteError) {
      if (deleteError.status === 409) {
        const pendingDelete = await getDocumentById(document.id);
        const conflicted = {
          ...pendingDelete,
          syncStatus: "delete_conflict",
          serverConflictDocument: deleteError.data?.document || null,
        };
        await saveDocument(conflicted);
        setDocuments((current) => [conflicted, ...current.filter((item) => item.id !== document.id)]);
      } else if (!navigator.onLine || !deleteError.status || deleteError.status >= 500) {
        setOfflineMessage("Delete is queued on this device and will retry when the connection is available.");
        void syncPendingDocuments();
      } else if (deleteError.status === 401) {
        const pendingDelete = await getDocumentById(document.id);
        if (pendingDelete) await saveDocument({ ...pendingDelete, syncStatus: "auth_required_delete" });
        setError("Sign in again to finish deleting this document.");
      } else {
        setError(deleteError.message);
      }
    }
  };

  const restoreAccountVersion = async (document) => {
    const remote = document.serverConflictDocument;
    if (!remote) return;
    await saveDocument({
      ...remote,
      ownerUserId: user.id,
      syncStatus: "synced",
      serverUpdatedAt: remote.updatedAt,
      updatedAt: remote.updatedAt,
      lastEditedAt: remote.updatedAt,
    });
    await loadDocuments();
  };

  const deleteChangedAccountVersion = async (document) => {
    try {
      await deleteAccountDocument(document.id, { force: true });
      await deleteDocument(document.id);
      await loadDocuments();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const handleRetrySync = async (id) => {
    await retryDocumentSync(id);
    await loadDocuments();
  };

  const handleRestorePreviousVersion = async (id) => {
    const document = await getDocumentById(id);
    const versionIndex = document?.previousVersions?.findLastIndex((version) => !version.deletedAt) ?? -1;
    if (versionIndex < 0) return;
    await restorePreviousVersion(id, versionIndex);
    await loadDocuments();
  };

  const handleSignInAgain = () => {
    endSession();
    returnToWelcome();
  };

  const handleSignOut = () => {
    endSession();
    returnToWelcome();
  };

  return (
    <main className="min-h-screen bg-app px-4 py-10 text-text-primary">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border-toolbar pb-5">
          <div>
            <p className="text-sm font-semibold text-accent-primary">InkFlow</p>
            <h1 className="mt-1 text-2xl font-semibold">Your documents</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Signed in as {user?.name || user?.email}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-lg border border-border-input px-3 py-2 text-sm text-text-secondary hover:bg-accent-secondary"
          >
            <LogOut size={16} aria-hidden="true" />
            Sign out
          </button>
        </header>

        <section className="mt-8" aria-labelledby="account-recent-heading">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="account-recent-heading" className="text-lg font-semibold">
                Recent work
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Documents saved to your account.
              </p>
            </div>
            <button
              type="button"
              onClick={openNewDocument}
              className="inline-flex items-center gap-2 rounded-lg bg-accent-primary px-4 py-2.5 text-sm font-semibold text-text-on-accent hover:bg-accent-primary-hover"
            >
              <Plus size={17} aria-hidden="true" />
              New document
            </button>
          </div>

          {error && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-danger bg-danger-bg px-4 py-3 text-sm text-danger" role="alert">
              <span>{error}</span>
              <button type="button" onClick={loadDocuments} className="font-medium underline">
                Retry
              </button>
            </div>
          )}

          {offlineMessage && (
            <p className="mb-4 text-sm text-text-secondary" role="status">{offlineMessage}</p>
          )}

          {isLoading ? (
            <p className="py-10 text-center text-sm text-text-muted" role="status">
              Loading your documents...
            </p>
          ) : documents.length === 0 ? (
            <div className="border-t border-border-toolbar py-12 text-center">
              <FileText size={28} className="mx-auto mb-3 text-text-muted" aria-hidden="true" />
              <p className="text-sm font-medium">No account documents yet</p>
              <p className="mt-1 text-sm text-text-secondary">
                Create a document and it will be saved to this account.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border-toolbar border-y border-border-toolbar">
              {documents.map((document) => (
                <li key={document.id}>
                  <div className="group flex items-center gap-3 py-3">
                    <button
                      type="button"
                      onClick={() => handleOpenDocument(document.id)}
                      disabled={openingId !== null || document.syncStatus === "delete_conflict" || document.syncStatus === "auth_required_delete"}
                      className="flex min-w-0 flex-1 items-center gap-4 text-left disabled:opacity-60"
                    >
                      <FileText size={19} className="shrink-0 text-accent-primary" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {document.title || "Untitled Document"}
                        </span>
                        <span className="mt-1 block truncate text-xs text-text-muted">
                          {document.preview || "No preview available"}
                        </span>
                        {document.syncStatus === "conflict" && (
                          <span className="mt-1 block text-xs text-text-muted">Keeping this device's copy and syncing</span>
                        )}
                        {document.previousVersions?.some((version) => !version.deletedAt) && (
                          <span className="mt-1 block text-xs text-text-muted">Previous account version saved on this device</span>
                        )}
                        {document.syncStatus === "pending" && (
                          <span className="mt-1 block text-xs text-text-muted">Waiting to sync</span>
                        )}
                        {document.syncStatus === "auth_required" && (
                          <span className="mt-1 block text-xs text-danger">Sign in again to sync this document</span>
                        )}
                        {document.syncStatus === "sync_error" && (
                          <span className="mt-1 block text-xs text-danger">Sync needs attention: {document.syncError || "request rejected"}</span>
                        )}
                        {document.syncStatus === "delete_conflict" && (
                          <span className="mt-1 block text-xs text-danger">The account copy changed before this queued delete.</span>
                        )}
                        {document.syncStatus === "auth_required_delete" && (
                          <span className="mt-1 block text-xs text-danger">Sign in again to finish deleting this document</span>
                        )}
                      </span>
                      <span className="shrink-0 text-right text-xs text-text-muted">
                        {formatDate(document.lastEditedAt || document.updatedAt)}
                        <span className="mt-1 block">{document.wordCount || 0} words</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(document)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-muted opacity-100 transition-opacity hover:bg-status-danger-bg hover:text-status-danger sm:opacity-0 sm:focus:opacity-100 sm:group-hover:opacity-100"
                      aria-label={`Delete document: ${document.title || "Untitled Document"}`}
                      title="Delete document"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </div>
                  {document.previousVersions?.some((version) => !version.deletedAt) && (
                    <div className="flex flex-wrap items-center gap-2 pb-3 pl-9">
                      <span className="mr-auto text-xs text-text-secondary">The device copy is current. The previous account version is saved on this device.</span>
                      <button type="button" onClick={() => handleRestorePreviousVersion(document.id)} className="rounded-md border border-border-input px-2.5 py-1.5 text-xs font-medium hover:bg-accent-secondary">
                        Restore previous account version
                      </button>
                    </div>
                  )}
                  {document.syncStatus === "delete_conflict" && (
                    <div className="flex flex-wrap items-center gap-2 pb-3 pl-9">
                      <span className="mr-auto text-xs text-text-secondary">The queued delete did not remove the newer account copy.</span>
                      <button type="button" onClick={() => restoreAccountVersion(document)} className="rounded-md border border-border-input px-2.5 py-1.5 text-xs font-medium hover:bg-accent-secondary">Keep account copy</button>
                      <button type="button" onClick={() => deleteChangedAccountVersion(document)} className="rounded-md bg-status-danger-bg px-2.5 py-1.5 text-xs font-medium text-status-danger">Delete account copy</button>
                    </div>
                  )}
                  {(document.syncStatus === "sync_error" || document.syncStatus === "pending") && (
                    <div className="pb-3 pl-9">
                      <button type="button" onClick={() => handleRetrySync(document.id)} className="text-xs font-medium text-accent-primary hover:underline">Retry sync</button>
                    </div>
                  )}
                  {(document.syncStatus === "auth_required" || document.syncStatus === "auth_required_delete") && (
                    <div className="pb-3 pl-9">
                      <button type="button" onClick={handleSignInAgain} className="text-xs font-medium text-accent-primary hover:underline">Sign in again</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default AccountDashboard;
