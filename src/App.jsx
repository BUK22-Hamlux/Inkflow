import { ThemeProvider } from "./context/ThemeContext";
import { EditorProvider, useEditorContext } from "./context/EditorContext";
import { DialogProvider } from "./context/DialogProvider";
import AppToaster from "./components/UI/AppToaster";
import WelcomePage from "./pages/WelcomePage";
import EditorPage from "./pages/EditorPage";

const AppContent = () => {
  const { appState } = useEditorContext();

  return (
    <>
      <AppToaster />
      {appState === "welcome" && <WelcomePage />}
      {appState === "editing" && <EditorPage />}
      {appState === "focusMode" && <EditorPage />}
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <DialogProvider>
        <EditorProvider>
          <AppContent />
        </EditorProvider>
      </DialogProvider>
    </ThemeProvider>
  );
};

export default App;
