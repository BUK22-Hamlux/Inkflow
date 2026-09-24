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

const EditorPage = () => {
  const { isMobile } = useWindowSize();
  const { editor, isSidebarOpen } = useEditorContext();
  const editorState = useEditorState(editor);
  const isInsideTable = editorState?.isInTable ?? false;
  const isImageSelected = editorState?.isImage ?? false;

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
          Words: 0 | Characters: 0
        </div>
      }
    />
  );
};

export default EditorPage;
