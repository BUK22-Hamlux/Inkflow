import { createContext, useContext, useState } from "react";

const EditorContext = createContext(null);

export const EditorProvider = ({ children }) => {
  const [appState, setAppState] = useState("welcome");
  const [currentDocId, setCurrentDocId] = useState(null);
  const [currentTitle, setCurrentTitle] = useState("Untitled Document");
  const [initialContent, setInitialContent] = useState(null);

  const openNewDocument = () => {
    const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCurrentDocId(id);
    setCurrentTitle("Untitled Document");
    setInitialContent(null);
    setAppState("editing");
  };

  const openExistingDocument = (doc) => {
    setCurrentDocId(doc.id);
    setCurrentTitle(doc.title);
    setInitialContent(doc.content);
    setAppState("editing");
  };

  const returnToWelcome = () => {
    setAppState("welcome");
    setCurrentDocId(null);
    setCurrentTitle("Untitled Document");
    setInitialContent(null);
  };

  const enterFocusMode = () => setAppState("focusMode");
  const exitFocusMode = () => setAppState("editing");

  const value = {
    appState,
    currentDocId,
    currentTitle,
    initialContent,
    setCurrentTitle,
    openNewDocument,
    openExistingDocument,
    returnToWelcome,
    enterFocusMode,
    exitFocusMode,
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
