import EditorLayout from "../layouts/EditorLayout";
import EditorCanvas from "../components/Editor/EditorCanvas";
import Toolbar from "../components/Toolbar/Toolbar";
import MobileToolbar from "../components/Toolbar/MobileToolbar";
import useWindowSize from "../hooks/useWindowSize";
import { useEditorContext } from "../context/EditorContext";
import { Toaster } from "react-hot-toast";

const EditorPage = () => {
  const { returnToWelcome } = useEditorContext();
  const { isMobile } = useWindowSize();

  return (
    <>
      <Toaster />
      <EditorLayout
        menuBar={
          <div className="h-full flex items-center px-4 gap-6 text-text-secondary text-[13px]">
            <button
              onClick={returnToWelcome}
              className="text-text-secondary hover:text-text-primary transition-colors text-xs border border-border-input rounded-md px-2 py-1 hover:bg-accent-secondary"
              aria-label="Return to welcome screen"
            >
              ← Back
            </button>
            <span>File</span>
            <span>Edit</span>
            <span>View</span>
          </div>
        }
        toolbar={isMobile ? <MobileToolbar /> : <Toolbar />}
        sidebar={null}
        canvas={<EditorCanvas />}
        statusBar={
          <div className="h-full flex items-center px-4 text-text-secondary text-xs">
            Words: 0 | Characters: 0
          </div>
        }
      />
    </>
  );
};

export default EditorPage;
