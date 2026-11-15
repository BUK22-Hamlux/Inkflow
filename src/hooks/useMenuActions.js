import { useState, useCallback } from "react";
import { useEditorContext } from "../context/EditorContext";
import useTheme from "./useTheme";
import useImageActions from "./useImageActions";
import toast from "react-hot-toast";
import openDocx from "../utils/openDocx";
import openTxt from "../utils/openTxt";
import { generateDocId, saveDocument } from "../utils/localStorage";
import { useAuth } from "../context/AuthContext";

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
    pageSettings,
    currentTitle,
    editor,
    saveCurrentDocument: persistCurrentDocument,
    openNewDocument,
    openExistingDocument,
    enterFocusMode,
    setIsSidebarOpen,
    setIsExportModalOpen,
    setIsShortcutsModalOpen,
    setIsFindReplaceOpen,
    setIsAboutModalOpen,
  } = useEditorContext();
  const { user } = useAuth();

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
  const newDocument = useCallback(async () => {
    closeMenu();
    try {
      await openNewDocument();
    } catch (error) {
      console.error("Failed to create new document:", error);
    }
  }, [closeMenu, openNewDocument]);

  const openFile = useCallback(() => {
    closeMenu();
    document.getElementById("inkflow-file-input")?.click();
  }, [closeMenu]);

  const onFileSelected = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const html = file.name.toLowerCase().endsWith(".docx")
        ? await openDocx(file)
        : await openTxt(file);
      const now = new Date().toISOString();
      const plainText = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      const document = {
        id: generateDocId(),
        title: file.name.replace(/\.(docx|txt)$/i, "") || "Untitled Document",
        content: html,
        isHtml: true,
        preview: plainText.slice(0, 120),
        wordCount: plainText ? plainText.split(" ").length : 0,
        ownerUserId: user?.id || null,
        syncStatus: user ? "pending" : "local",
        createdAt: now,
        lastEditedAt: now,
        updatedAt: now,
      };
      if (!await saveDocument(document)) throw new Error("The imported document could not be saved locally.");
      openExistingDocument(document, { storage: user ? "account" : "local" });
    } catch (error) {
      console.error("Failed to open document:", error);
      toast.error(error.message || "The file could not be opened.");
    }
  }, [openExistingDocument, user]);

  const saveCurrentDocument = useCallback(async () => {
    closeMenu();
    if (!editor || !currentDocId) return;

    try {
      await persistCurrentDocument();

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
    } catch (error) {
      console.error("Failed to save document:", error);
      toast.error("Failed to save document", {
        duration: 2000,
        position: "bottom-right",
      });
    }
  }, [editor, currentDocId, persistCurrentDocument, closeMenu]);

  const openExportModal = useCallback(() => {
    closeMenu();
    setIsExportModalOpen(true);
  }, [closeMenu, setIsExportModalOpen]);

  const printDocument = useCallback(async () => {
    closeMenu();
    if (!editor) return;
    const frame = document.createElement("iframe");
    frame.title = "InkFlow print preview";
    Object.assign(frame.style, { position: "fixed", width: "1px", height: "1px", right: "0", bottom: "0", border: "0" });
    document.body.appendChild(frame);
    const printDocument = frame.contentDocument;
    if (!printDocument) {
      frame.remove();
      toast.error("Print preview could not be created.");
      return;
    }
    const width = (pageSettings.width * 25.4) / 96;
    const height = (pageSettings.height * 25.4) / 96;
    const margins = [pageSettings.marginTop, pageSettings.marginRight, pageSettings.marginBottom, pageSettings.marginLeft]
      .map((value) => (value * 25.4) / 96);
    const styles = [...document.querySelectorAll('link[rel="stylesheet"], style')]
      .map((style) => style.outerHTML).join("");
    const content = editor.view.dom.cloneNode(true);
    content.removeAttribute("contenteditable");
    content.querySelectorAll("[data-inkflow-page-spacer], .ProseMirror-gapcursor").forEach((node) => node.remove());
    printDocument.open();
    const printTitle = (currentTitle || "InkFlow document")
      .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    printDocument.write(`<!doctype html><html><head><meta charset="utf-8"><title>${printTitle}</title>${styles}<style>
      @page{size:${width}mm ${height}mm;margin:${margins[0]}mm ${margins[1]}mm ${margins[2]}mm ${margins[3]}mm}
      html,body{margin:0!important;padding:0!important;background:#fff!important;color:#111!important}
      .editor-canvas{width:auto!important;min-height:0!important;margin:0!important;padding:0!important;box-shadow:none!important;background:none!important}
      .ProseMirror{min-height:0!important;width:auto!important;color:#111!important;font-size:12pt!important;line-height:1.5!important}
      .inkflow-page-break{display:block!important;height:0!important;break-after:page!important;page-break-after:always!important}
      [data-inkflow-page-spacer]{display:none!important}
      img{max-width:100%!important}
    </style></head><body></body></html>`);
    printDocument.body.appendChild(content);
    printDocument.close();
    await Promise.race([
      printDocument.fonts?.ready || Promise.resolve(),
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ]);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    frame.contentWindow?.addEventListener("afterprint", () => frame.remove(), { once: true });
    window.setTimeout(() => frame.remove(), 60000);
  }, [closeMenu, currentTitle, editor, pageSettings]);

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
