import { useState, useCallback, useRef } from "react";
import { useEditorContext } from "../context/EditorContext";
import useTheme from "./useTheme";
import useImageActions from "./useImageActions";
import { saveDocument } from "../utils/localStorage";
import toast from "react-hot-toast";

const THEME_ORDER = [
  "light",
  "dark",
  "purple",
  "teal",
  "rose",
  "amber",
  "dark-purple",
];

const useMenuActions = () => {
  const {
    currentDocId,
    currentTitle,
    editor,
    openNewDocument,
    enterFocusMode,
    setIsSidebarOpen,
    setIsExportModalOpen,
    setIsShortcutsModalOpen,
    setIsFindReplaceOpen,
    setIsAboutModalOpen,
  } = useEditorContext();

  const { theme, setTheme } = useTheme();
  const imageActions = useImageActions(editor);

  // ── Which menu is open ──────────────────────────────────────
  const [openMenu, setOpenMenu] = useState(null);

  const closeMenu = useCallback(() => {
    setOpenMenu(null);
  }, []);

  const toggleMenu = useCallback((name) => {
    setOpenMenu((prev) => (prev === name ? null : name));
  }, []);

  // ── Hidden file input refs ──────────────────────────────────
  const fileInputRef = useRef(null);

  // ── Helper: close menu then run an editor command ───────────
  // Usage: cmd(e => e.chain().focus().toggleBold().run())
  const cmd = useCallback(
    (fn) => {
      closeMenu();
      if (!editor) return;
      fn(editor);
    },
    [editor, closeMenu],
  );

  // ── Theme ───────────────────────────────────────────────────
  const cycleThroughThemes = useCallback(() => {
    const current = THEME_ORDER.indexOf(theme);
    const next = (current + 1) % THEME_ORDER.length;
    setTheme(THEME_ORDER[next]);
  }, [theme, setTheme]);

  const selectTheme = useCallback(
    (id) => {
      closeMenu();
      setTheme(id);
    },
    [closeMenu, setTheme],
  );

  // ── File menu ───────────────────────────────────────────────
  const newDocument = useCallback(() => {
    closeMenu();
    openNewDocument();
  }, [closeMenu, openNewDocument]);

  const openFile = useCallback(() => {
    closeMenu();
    fileInputRef.current?.click();
  }, [closeMenu]);

  const onFileSelected = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    // Full open logic coming Day 20
  }, []);

  const saveCurrentDocument = useCallback(() => {
    closeMenu();
    if (!editor || !currentDocId) return;

    const content = editor.getJSON();
    const plainText = editor.getText();
    const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;

    saveDocument({
      id: currentDocId,
      title: currentTitle,
      content,
      wordCount,
      preview: plainText.slice(0, 120),
      lastEditedAt: new Date().toISOString(),
    });

    toast.success("Document saved", {
      duration: 2000,
      position: "bottom-right",
      style: {
        background: "var(--bg-modal)",
        color: "var(--text-primary)",
        border: "1px solid var(--status-success)",
        borderLeft: "4px solid var(--status-success)",
        borderRadius: "10px",
        fontSize: "13px",
      },
    });
  }, [editor, currentDocId, currentTitle, closeMenu]);

  const openExportModal = useCallback(() => {
    closeMenu();
    setIsExportModalOpen(true);
  }, [closeMenu, setIsExportModalOpen]);

  const printDocument = useCallback(() => {
    closeMenu();
    window.print();
  }, [closeMenu]);

  // ── Edit menu ───────────────────────────────────────────────
  const openFindReplace = useCallback(() => {
    closeMenu();
    setIsFindReplaceOpen(true);
  }, [closeMenu, setIsFindReplaceOpen]);

  // ── View menu ───────────────────────────────────────────────
  const toggleSidebar = useCallback(() => {
    closeMenu();
    setIsSidebarOpen((prev) => !prev);
  }, [closeMenu, setIsSidebarOpen]);

  const openFocusMode = useCallback(() => {
    closeMenu();
    enterFocusMode();
  }, [closeMenu, enterFocusMode]);

  // ── Insert menu ─────────────────────────────────────────────
  const insertLink = useCallback(() => {
    closeMenu();
    if (!editor) return;
    const existing = editor.getAttributes("link").href ?? "";
    const url = window.prompt("Enter URL:", existing);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor, closeMenu]);

  const insertImage = useCallback(() => {
    closeMenu();
    imageActions.chooseImageFile();
  }, [closeMenu, imageActions]);

  const insertHorizontalRule = useCallback(() => {
    cmd((e) => e.chain().focus().setHorizontalRule().run());
  }, [cmd]);

  const insertTable = useCallback(
    (rows = 3, cols = 3) => {
      cmd((e) =>
        e
          .chain()
          .focus()
          .insertTable({
            rows,
            cols,
            withHeaderRow: true,
          })
          .run(),
      );
    },
    [cmd],
  );

  // ── Help menu ───────────────────────────────────────────────
  const openShortcuts = useCallback(() => {
    closeMenu();
    setIsShortcutsModalOpen(true);
  }, [closeMenu, setIsShortcutsModalOpen]);

  const openAbout = useCallback(() => {
    closeMenu();
    setIsAboutModalOpen(true);
  }, [closeMenu, setIsAboutModalOpen]);

  // ── Everything the MenuBar needs ────────────────────────────
  return {
    // Menu open/close state
    openMenu,
    closeMenu,
    toggleMenu,

    // File input refs
    fileInputRef,
    imageInputRef: imageActions.imageInputRef,

    // Editor and theme state (read-only)
    editor,
    theme,

    // Helper
    cmd,

    // Theme actions
    cycleThroughThemes,
    selectTheme,

    // File menu actions
    newDocument,
    openFile,
    onFileSelected,
    saveCurrentDocument,
    openExportModal,
    printDocument,

    // Edit menu actions
    openFindReplace,

    // View menu actions
    toggleSidebar,
    openFocusMode,

    // Insert menu actions
    insertLink,
    insertImage,
    onImageSelected: imageActions.onImageSelected,
    insertHorizontalRule,
    insertTable,

    // Help menu actions
    openShortcuts,
    openAbout,
  };
};

export default useMenuActions;
