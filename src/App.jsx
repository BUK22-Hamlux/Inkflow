import { ThemeProvider } from "./context/ThemeContext";
import { EditorProvider, useEditorContext } from "./context/EditorContext";
import { Toaster } from "react-hot-toast";
import WelcomePage from "./pages/WelcomePage";
import EditorPage from "./pages/EditorPage";

const AppContent = () => {
  const { appState } = useEditorContext();

  return (
    <>
      <Toaster />
      {appState === "welcome" && <WelcomePage />}
      {appState === "editing" && <EditorPage />}
      {appState === "focusMode" && <EditorPage />}
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <EditorProvider>
        <AppContent />
      </EditorProvider>
    </ThemeProvider>
  );
};

export default App;
