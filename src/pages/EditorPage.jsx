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

const EditorPage = () => {
  const { isMobile } = useWindowSize();
  const {
    editor,
    isSidebarOpen,
    currentDocId,
    currentTitle,
    pageSettings,
    saveCurrentDocument,
  } = useEditorContext();
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

  return (
    <EditorLayout
      menuBar={<MenuBar />}
      toolbar={
        <div className="flex w-full flex-col">
          {isMobile ? <MobileToolbar /> : <Toolbar />}
          {isInsideTable && <TableToolbar />}
          {isImageSelected && <ImageToolbar />}
        </div>
      }
      sidebar={isSidebarOpen ? <DocumentSettings /> : null}
      canvas={<EditorCanvas />}
      statusBar={
        <div className="h-full flex items-center px-4 text-xs text-text-secondary">
          Words: {wordCount} | Characters: {text.length}
        </div>
      }
    />
  );
};

export default EditorPage;
