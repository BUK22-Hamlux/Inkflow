import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { deleteDocument, generateDocId, getAllDocuments, getDocumentById, saveDocument } from "../utils/localStorage";
import { deleteAccountDocument, syncAccountDocument } from "../lib/api";
import { useAuth } from "./AuthContext";

const EditorContext = createContext(null);

const DEFAULT_PAGE_SETTINGS = {
  pageSize: "a4",
  width: 794,
  height: 1056,
  marginTop: 96,
  marginRight: 96,
  marginBottom: 96,
  marginLeft: 96,
  pageGap: 28,
  lineHeight: 1.8,
  paragraphSpacing: 12,
};

export const EditorProvider = ({ children }) => {
  const { user } = useAuth();
  const [appState, setAppState] = useState("welcome");
  const [currentDocId, setCurrentDocId] = useState(null);
  const [currentTitle, setCurrentTitle] = useState("Untitled Document");
  const [initialContent, setInitialContent] = useState(null);
  const [editor, setEditorInstance] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pageSettings, setPageSettings] = useState(DEFAULT_PAGE_SETTINGS);
  const [documentStorage, setDocumentStorage] = useState("local");
  const syncingIds = useRef(new Set());
  const retryTimers = useRef(new Map());
  const pendingSyncRunner = useRef(null);
  const notifiedConflictIds = useRef(new Set());

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  const setEditor = (editorInstance) => {
    setEditorInstance(editorInstance);
  };

  const getEditor = () => editor;

  const updatePageSettings = (updates) => {
    setPageSettings((current) => ({ ...current, ...updates }));
  };

  const resetPageSettings = () => {
    setPageSettings(DEFAULT_PAGE_SETTINGS);
  };

  const scheduleQueueRetry = (id, attempts = 0) => {
    if (retryTimers.current.has(id)) return;
    const delay = Math.min(60000, 2000 * 2 ** Math.min(attempts, 5));
    const timer = window.setTimeout(() => {
      retryTimers.current.delete(id);
      pendingSyncRunner.current?.();
    }, delay);
    retryTimers.current.set(id, timer);
  };

  const syncLocalDocument = useCallback(async (document) => {
    if (!user || !navigator.onLine || syncingIds.current.has(document.id)) return false;
    syncingIds.current.add(document.id);
    let retryDocument = null;
    try {
      const remote = await syncAccountDocument({
        id: document.id,
        title: document.title,
        content: document.content,
        preview: document.preview,
        wordCount: document.wordCount,
        pageSettings: document.pageSettings,
        baseUpdatedAt: document.serverUpdatedAt || null,
        restoreDeleted: document.restoreDeleted || false,
      });
      const latestLocal = await getDocumentById(document.id);
      if (latestLocal && latestLocal.updatedAt === document.updatedAt) {
          await saveDocument({
            ...latestLocal,
            syncStatus: "synced",
          serverUpdatedAt: remote.updatedAt,
          syncAttempts: 0,
          serverConflictDocument: null,
            restoreDeleted: false,
          });
        notifiedConflictIds.current.delete(document.id);
      } else if (latestLocal) {
        const newestLocal = {
          ...latestLocal,
          serverUpdatedAt: remote.updatedAt,
          syncAttempts: 0,
          syncError: null,
        };
        await saveDocument(newestLocal);
        retryDocument = newestLocal;
      }
      const retryTimer = retryTimers.current.get(document.id);
      if (retryTimer) window.clearTimeout(retryTimer);
      retryTimers.current.delete(document.id);
      return true;
    } catch (error) {
      if (error.status === 409 && error.data?.document) {
        const latestLocal = await getDocumentById(document.id);
        const remote = error.data.document;
        if (latestLocal && !remote.deletedAt) {
          const previousVersions = [...(latestLocal.previousVersions || [])];
          if (!previousVersions.some((version) => version.updatedAt === remote.updatedAt)) {
            previousVersions.push(remote);
          }
          const deviceWins = {
            ...latestLocal,
            syncStatus: "pending",
            serverUpdatedAt: remote.updatedAt,
            serverConflictDocument: null,
            previousVersions: previousVersions.slice(-10),
            syncAttempts: 0,
            syncError: null,
          };
          await saveDocument(deviceWins);
          retryDocument = deviceWins;
          if (!notifiedConflictIds.current.has(document.id)) {
            notifiedConflictIds.current.add(document.id);
            toast.success(`"${latestLocal.title}" kept this device's edits. The previous account version is available to restore.`);
          }
        } else if (latestLocal && remote.deletedAt) {
          const previousVersions = [...(latestLocal.previousVersions || [])];
          if (!previousVersions.some((version) => version.updatedAt === remote.updatedAt)) {
            previousVersions.push(remote);
          }
          const deviceWins = {
            ...latestLocal,
            syncStatus: "pending",
            serverUpdatedAt: remote.updatedAt,
            serverConflictDocument: null,
            previousVersions: previousVersions.slice(-10),
            restoreDeleted: true,
            syncAttempts: 0,
          };
          await saveDocument(deviceWins);
          retryDocument = deviceWins;
        }
      } else {
        const latestLocal = await getDocumentById(document.id);
        if (latestLocal && error.status === 401) {
          await saveDocument({ ...latestLocal, syncStatus: "auth_required" });
        } else if (latestLocal && error.status >= 400 && error.status < 500) {
          await saveDocument({ ...latestLocal, syncStatus: "sync_error", syncError: error.message });
        } else if (latestLocal) {
          const syncAttempts = (latestLocal.syncAttempts || 0) + 1;
          await saveDocument({ ...latestLocal, syncStatus: "pending", syncAttempts, syncError: error.message });
          scheduleQueueRetry(document.id, syncAttempts);
        }
      }
      return false;
    } finally {
      syncingIds.current.delete(document.id);
      if (retryDocument) scheduleQueueRetry(document.id, 0);
    }
  }, [user]);

  const syncPendingDocuments = useCallback(async () => {
    if (!user || !navigator.onLine) return;
    const documents = await getAllDocuments(user.id);
    for (const document of documents) {
      if (document.syncStatus === "conflict" && document.serverConflictDocument) {
        const remote = document.serverConflictDocument;
        if (!remote.deletedAt) {
          const previousVersions = [...(document.previousVersions || [])];
          if (!previousVersions.some((version) => version.updatedAt === remote.updatedAt)) previousVersions.push(remote);
          const deviceWins = {
            ...document,
            syncStatus: "pending",
            serverUpdatedAt: remote.updatedAt,
            serverConflictDocument: null,
            previousVersions: previousVersions.slice(-10),
            syncAttempts: 0,
          };
          await saveDocument(deviceWins);
          await syncLocalDocument(deviceWins);
          continue;
        }
      }
      if (document.syncStatus === "pending") await syncLocalDocument(document);
      if (document.syncStatus === "pending_delete") {
        try {
          await deleteAccountDocument(document.id, {
            expectedUpdatedAt: document.serverUpdatedAt || null,
            title: document.title,
            content: document.content,
            preview: document.preview,
            wordCount: document.wordCount,
            pageSettings: document.pageSettings,
          });
          await deleteDocument(document.id);
          const timer = retryTimers.current.get(document.id);
          if (timer) window.clearTimeout(timer);
          retryTimers.current.delete(document.id);
        } catch (error) {
          if (error.status === 409) {
            await saveDocument({
              ...document,
              syncStatus: "delete_conflict",
              serverConflictDocument: error.data?.document || null,
            });
          } else if (error.status === 401) {
            await saveDocument({ ...document, syncStatus: "auth_required_delete" });
          } else if (!error.status || error.status >= 500) {
            const syncAttempts = (document.syncAttempts || 0) + 1;
            await saveDocument({ ...document, syncAttempts });
            scheduleQueueRetry(document.id, syncAttempts);
          } else {
            await saveDocument({ ...document, syncStatus: "sync_error", syncError: error.message });
          }
        }
      }
    }
  }, [user, syncLocalDocument]);

  pendingSyncRunner.current = syncPendingDocuments;

  const resolveConflictKeepLocal = useCallback(async (id) => {
    const document = await getDocumentById(id);
    const remote = document?.serverConflictDocument;
    if (!document || !remote) return false;
    const resolved = {
      ...document,
      syncStatus: "pending",
      serverUpdatedAt: remote.updatedAt,
      serverConflictDocument: null,
      syncAttempts: 0,
      restoreDeleted: Boolean(remote.deletedAt),
    };
    await saveDocument(resolved);
    notifiedConflictIds.current.delete(id);
    return syncLocalDocument(resolved);
  }, [syncLocalDocument]);

  const resolveConflictUseAccount = useCallback(async (id) => {
    const document = await getDocumentById(id);
    const remote = document?.serverConflictDocument;
    if (!document || !remote) return false;
    if (remote.deletedAt) {
      await deleteDocument(id);
      notifiedConflictIds.current.delete(id);
      return true;
    }
    const resolved = {
      ...remote,
      ownerUserId: user?.id,
      syncStatus: "synced",
      serverUpdatedAt: remote.updatedAt,
      lastEditedAt: remote.updatedAt,
      updatedAt: remote.updatedAt,
      serverConflictDocument: null,
    };
    await saveDocument(resolved);
    notifiedConflictIds.current.delete(id);
    return true;
  }, [user]);

  const restorePreviousVersion = useCallback(async (id, versionIndex) => {
    const document = await getDocumentById(id);
    const previousVersions = document?.previousVersions || [];
    const version = previousVersions[versionIndex];
    if (!document || !version || version.deletedAt) return false;
    const now = new Date().toISOString();
    const restored = {
      ...document,
      title: version.title,
      content: version.content,
      preview: version.preview,
      wordCount: version.wordCount,
      pageSettings: version.pageSettings,
      updatedAt: now,
      lastEditedAt: now,
      serverUpdatedAt: document.serverUpdatedAt,
      syncStatus: "pending",
      restoreDeleted: false,
    };
    await saveDocument(restored);
    return syncLocalDocument(restored);
  }, [syncLocalDocument]);

  const retryDocumentSync = useCallback(async (id) => {
    const document = await getDocumentById(id);
    if (!document || !user) return false;
    const retryDocument = { ...document, syncStatus: "pending", syncAttempts: 0 };
    await saveDocument(retryDocument);
    return syncLocalDocument(retryDocument);
  }, [user, syncLocalDocument]);

  useEffect(() => {
    if (!user) return undefined;
    const retrySync = async () => {
      const documents = await getAllDocuments(user.id);
      for (const document of documents) {
        if (document.syncStatus === "auth_required") {
          await saveDocument({ ...document, syncStatus: "pending" });
        }
        if (document.syncStatus === "auth_required_delete") {
          await saveDocument({ ...document, syncStatus: "pending_delete" });
        }
      }
      await syncPendingDocuments();
    };
    const retryWhenOnline = () => syncPendingDocuments();
    window.addEventListener("online", retryWhenOnline);
    retrySync();
    return () => window.removeEventListener("online", retryWhenOnline);
  }, [user, syncPendingDocuments]);

  const openNewDocument = async () => {
    try {
      const now = new Date().toISOString();
      const newDoc = {
        id: generateDocId(),
        title: "Untitled Document",
        content: { type: "doc", content: [{ type: "paragraph" }] },
        wordCount: 0,
        preview: "",
        pageSettings: DEFAULT_PAGE_SETTINGS,
        ownerUserId: user?.id || null,
        syncStatus: user ? "pending" : "local",
        createdAt: now,
        lastEditedAt: now,
        updatedAt: now,
      };
      const saved = await saveDocument(newDoc);
      if (!saved) throw new Error("Document could not be saved locally.");
      setDocumentStorage(user ? "account" : "local");

      setCurrentDocId(newDoc.id);
      setCurrentTitle("Untitled Document");
      setInitialContent(null);
      setPageSettings(DEFAULT_PAGE_SETTINGS);
      setAppState("editing");
      toast.success("New document created");
    } catch (error) {
      console.error("Failed to create new document:", error);
      toast.error(error.message || "Failed to create new document");
    }
  };

  const saveCurrentDocument = useCallback(async () => {
    if (!editor || !currentDocId) return false;

    const plainText = editor.getText();
    const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
    const existingDocument = await getDocumentById(currentDocId);
    const now = new Date().toISOString();
    const documentData = {
      id: currentDocId,
      title: currentTitle,
      content: editor.getJSON(),
      pageSettings,
      wordCount,
      preview: plainText.slice(0, 120),
      ownerUserId: user?.id || null,
      createdAt: existingDocument?.createdAt || now,
      lastEditedAt: now,
      updatedAt: now,
      serverUpdatedAt: existingDocument?.serverUpdatedAt || null,
      syncStatus: existingDocument?.syncStatus === "conflict"
        ? "conflict"
        : user ? "pending" : "local",
      serverConflictDocument: existingDocument?.serverConflictDocument || null,
    };

    const saved = await saveDocument(documentData);
    if (!saved) throw new Error("Document could not be saved locally.");
    if (user && documentData.syncStatus === "pending") void syncLocalDocument(documentData);
    return true;
  }, [editor, currentDocId, currentTitle, pageSettings, user, syncLocalDocument]);

  const openExistingDocument = (doc, options = {}) => {
    const { showToast = true, storage = "local" } = options;

    setCurrentDocId(doc.id);
    setDocumentStorage(storage);
    setCurrentTitle(doc.title || "Untitled Document");
    setInitialContent(doc.content ?? null);
    setPageSettings(doc.pageSettings ?? DEFAULT_PAGE_SETTINGS);
    setPageSettings(doc.pageSettings ?? DEFAULT_PAGE_SETTINGS);
    setAppState("editing");

    if (showToast) {
      toast.success(`"${doc.title || "Untitled Document"}" opened`);
    }
  };

  const returnToWelcome = () => {
    setAppState("welcome");
    setCurrentDocId(null);
    setCurrentTitle("Untitled Document");
    setInitialContent(null);
    setPageSettings(DEFAULT_PAGE_SETTINGS);
    setDocumentStorage("local");
    setPageSettings(DEFAULT_PAGE_SETTINGS);
    setEditorInstance(null);
  };

  const enterFocusMode = () => setAppState("focusMode");
  const exitFocusMode = () => setAppState("editing");

  const value = {
    appState,
    currentDocId,
    currentTitle,
    initialContent,
    editor,
    isSidebarOpen,
    pageSettings,
    documentStorage,

    isExportModalOpen,
    isShortcutsModalOpen,
    isFindReplaceOpen,
    isAboutModalOpen,
    setCurrentTitle,
    setEditor,
    getEditor,
    updatePageSettings,
    resetPageSettings,
    saveCurrentDocument,
    syncPendingDocuments,
    resolveConflictKeepLocal,
    resolveConflictUseAccount,
    restorePreviousVersion,
    retryDocumentSync,

    openNewDocument,
    openExistingDocument,
    returnToWelcome,
    enterFocusMode,
    exitFocusMode,
    setIsSidebarOpen,
    setIsExportModalOpen,
    setIsShortcutsModalOpen,
    setIsFindReplaceOpen,
    setIsAboutModalOpen,
  };

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
};

export const useEditorContext = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditorContext must be used inside EditorProvider");
  }
  return context;
};

export default EditorContext;
