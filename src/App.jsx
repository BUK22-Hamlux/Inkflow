import { ThemeProvider } from "./context/ThemeContext";
import { EditorProvider, useEditorContext } from "./context/EditorContext";
import { DialogProvider } from "./context/DialogProvider";
import AppToaster from "./components/UI/AppToaster";
import WelcomePage from "./pages/WelcomePage";
import EditorPage from "./pages/EditorPage";
import AccountDashboard from "./pages/AccountDashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";

const AppContent = () => {
  const { appState } = useEditorContext();
  const { user } = useAuth();

  return (
    <>
      <AppToaster />
      {appState === "welcome" && (user ? <AccountDashboard /> : <WelcomePage />)}
      {appState === "editing" && <EditorPage />}
      {appState === "focusMode" && <EditorPage />}
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <DialogProvider>
        <AuthProvider>
          <EditorProvider>
            <AppContent />
          </EditorProvider>
        </AuthProvider>
      </DialogProvider>
    </ThemeProvider>
  );
};

export default App;
