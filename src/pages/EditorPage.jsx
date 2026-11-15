import { useEffect } from "react";
import EditorLayout from "../layouts/EditorLayout";
import EditorCanvas from "../components/Editor/EditorCanvas";
import Toolbar from "../components/Toolbar/Toolbar";
import MobileToolbar from "../components/Toolbar/MobileToolbar";
import MenuBar from "../components/MenuBar/MenuBar";
import TableToolbar from "../components/Toolbar/TableToolbar";
import ImageToolbar from "../components/Toolbar/ImageToolbar";
import DocumentSettings from "../components/Sidebar/DocumentSettings";
import { useEditorContext } from "../context/EditorContext";
import useWindowSize from "../hooks/useWindowSize";
import useEditorState from "../hooks/useEditorState";
import toast from "react-hot-toast";
import ExportModal from "../components/Modals/ExportModal";
import ShortcutsModal from "../components/Modals/ShortcutsModal";
import AboutModal from "../components/Modals/AboutModal";
import FindReplacePanel from "../components/Modals/FindReplacePanel";

const EditorPage = () => {
  const { isMobile } = useWindowSize();
  const {
    editor,
    appState,
    isSidebarOpen,
    currentDocId,
    currentTitle,
    pageSettings,
    saveCurrentDocument,
    exitFocusMode,
    isExportModalOpen,
    isShortcutsModalOpen,
    isFindReplaceOpen,
    isAboutModalOpen,
    setIsExportModalOpen,
    setIsShortcutsModalOpen,
    setIsFindReplaceOpen,
    setIsAboutModalOpen,
  } = useEditorContext();
  const isFocusMode = appState === "focusMode";
  const editorState = useEditorState(editor);
  const isInsideTable = editorState?.isInTable ?? false;
  const isImageSelected = editorState?.isImage ?? false;
  const text = editor?.getText() || "";
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  useEffect(() => {
    if (!editor || !currentDocId) return undefined;

    let saveTimer;
    const scheduleSave = () => {
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => {
        saveCurrentDocument().catch((error) => {
          console.error("Document autosave failed:", error);
          toast.error(error.message || "Document could not be saved.");
        });
      }, 900);
    };

    editor.on("update", scheduleSave);
    scheduleSave();
    return () => {
      window.clearTimeout(saveTimer);
      editor.off("update", scheduleSave);
    };
  }, [editor, currentDocId, currentTitle, pageSettings, saveCurrentDocument]);

  useEffect(() => {
    const handleSaveShortcut = (event) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "s") return;
      event.preventDefault();
      saveCurrentDocument().catch((error) => {
        console.error("Document save failed:", error);
        toast.error(error.message || "Document could not be saved.");
      });
    };
    window.addEventListener("keydown", handleSaveShortcut);
    return () => window.removeEventListener("keydown", handleSaveShortcut);
  }, [saveCurrentDocument]);

  return (
    <>
    <EditorLayout
      focusMode={isFocusMode}
      menuBar={isFocusMode ? (
        <div className="flex h-full items-center justify-end px-3">
          <button type="button" onClick={exitFocusMode} className="h-8 rounded-md border border-border-input px-3 text-sm text-text-primary hover:bg-accent-secondary">
            Exit focus mode
          </button>
        </div>
      ) : <MenuBar />}
      toolbar={isFocusMode ? null : (
        <div className="flex w-full flex-col">
          {isMobile ? <MobileToolbar /> : <Toolbar />}
          {isInsideTable && <TableToolbar />}
          {isImageSelected && <ImageToolbar />}
        </div>
      )}
      sidebar={!isFocusMode && isSidebarOpen ? <DocumentSettings /> : null}
      canvas={<EditorCanvas />}
      statusBar={
        <div className="h-full flex items-center px-4 text-xs text-text-secondary">
          Words: {wordCount} | Characters: {text.length}
        </div>
      }
    />
    {isExportModalOpen && <ExportModal editor={editor} title={currentTitle} pageSettings={pageSettings} onClose={() => setIsExportModalOpen(false)} />}
    {isShortcutsModalOpen && <ShortcutsModal onClose={() => setIsShortcutsModalOpen(false)} />}
    {isFindReplaceOpen && <FindReplacePanel editor={editor} onClose={() => setIsFindReplaceOpen(false)} />}
    {isAboutModalOpen && <AboutModal onClose={() => setIsAboutModalOpen(false)} />}
    </>
  );
};

export default EditorPage;
