import EditorLayout from "../layouts/EditorLayout";
import EditorCanvas from "../components/Editor/EditorCanvas";
import Toolbar from "../components/Toolbar/Toolbar";
import MenuBar from "../components/MenuBar/MenuBar";
import MobileToolbar from "../components/Toolbar/MobileToolbar";
import useWindowSize from "../hooks/useWindowSize";
import { Toaster } from "react-hot-toast";

const EditorPage = () => {
  const { isMobile } = useWindowSize();

  return (
    <>
      <Toaster />
      <EditorLayout
        menuBar={<MenuBar />}
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
