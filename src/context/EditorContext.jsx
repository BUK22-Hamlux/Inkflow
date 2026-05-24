import { createContext, useContext, useState } from "react";
import toast from "react-hot-toast";
import { generateDocId, saveDocument } from "../utils/localStorage";

const EditorContext = createContext(null);

export const EditorProvider = ({ children }) => {
  const [appState, setAppState] = useState("welcome");
  const [currentDocId, setCurrentDocId] = useState(null);
  const [currentTitle, setCurrentTitle] = useState("Untitled Document");
  const [initialContent, setInitialContent] = useState(null);
  const [editor, setEditorInstance] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  const setEditor = (editorInstance) => {
    setEditorInstance(editorInstance);
  };

  const getEditor = () => editor;

  const openNewDocument = () => {
    const id = generateDocId();
    const newDoc = {
      id,
      title: "Untitled Document",
      content: null,
      wordCount: 0,
      preview: "",
      createdAt: new Date().toISOString(),
      lastEditedAt: new Date().toISOString(),
    };
    const saved = saveDocument(newDoc);
    setCurrentDocId(id);
    setCurrentTitle("Untitled Document");
    setInitialContent(null);
    setAppState("editing");

    if (saved) {
      toast.success("New document created");
    } else {
      toast.error("Document created, but it could not be saved locally.");
    }
  };

  const openExistingDocument = (doc, options = {}) => {
    const { showToast = true } = options;

    setCurrentDocId(doc.id);
    setCurrentTitle(doc.title || "Untitled Document");
    setInitialContent(doc.content ?? null);
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
    isExportModalOpen,
    isShortcutsModalOpen,
    isFindReplaceOpen,
    isAboutModalOpen,
    setCurrentTitle,
    setEditor,
    getEditor,
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
