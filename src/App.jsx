import { ThemeProvider } from "./context/ThemeContext";
import { EditorProvider } from "./context/EditorContext";

const App = () => {
  return (
    <ThemeProvider>
      <EditorProvider>
        <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-app)" }}>
          <p style={{ color: "var(--text-primary)", padding: "2rem" }}>
            InkFlow is loading... Day 4 complete.
          </p>
        </div>
      </EditorProvider>
    </ThemeProvider>
  );
};

export default App;
