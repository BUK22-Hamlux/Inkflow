import { useState, useRef, useCallback } from "react";
import { useEditorContext } from "../../context/EditorContext";
import useTheme from "../../hooks/useTheme";
import { saveDocument } from "../../utils/localStorage";
import toast from "react-hot-toast";
import MenuItem from "./MenuItem";
import {
  PenLine,
  Sun,
  Moon,
  FilePlus,
  FolderOpen,
  Save,
  Download,
  Printer,
  Undo2,
  Redo2,
  Scissors,
  Copy,
  ClipboardPaste,
  Search,
  Bold,
  Italic,
  Underline,
  Columns2,
  Eye,
  Keyboard,
  Info,
  Link,
  ImageIcon,
  Minus,
  Table,
  ChevronRight,
  Check,
} from "lucide-react";

// ── Reusable menu action row ──────────────────────────────────
export const MenuAction = ({
  icon: Icon,
  label,
  shortcut,
  onClick,
  disabled = false,
  hasSub = false,
  isChecked = false,
}) => (
  <button
    type="button"
    role="menuitem"
    onClick={onClick}
    disabled={disabled}
    aria-disabled={disabled}
    aria-haspopup={hasSub ? "menu" : undefined}
    aria-checked={isChecked ? "true" : undefined}
    className={`
      w-full px-3 py-1.5
      flex items-center gap-2.5
      text-xs text-left
      transition-colors duration-100
      disabled:opacity-40 disabled:cursor-not-allowed
      ${
        disabled
          ? "text-text-muted"
          : "text-text-primary hover:bg-accent-secondary hover:text-accent-primary"
      }
    `}
  >
    {/* Left icon or checkmark space */}
    <span className="w-3.5 shrink-0 flex items-center justify-center">
      {isChecked ? (
        <Check size={12} aria-hidden="true" className="text-accent-primary" />
      ) : Icon ? (
        <Icon size={13} aria-hidden="true" className="text-text-secondary" />
      ) : null}
    </span>

    <span className="flex-1">{label}</span>

    {shortcut && (
      <span className="text-text-muted text-[10px] ml-4 shrink-0">
        {shortcut}
      </span>
    )}
    {hasSub && (
      <ChevronRight
        size={11}
        aria-hidden="true"
        className="text-text-muted shrink-0"
      />
    )}
  </button>
);

// ── Thin separator inside a dropdown ─────────────────────────
export const MenuSeparator = () => (
  <div
    className="my-1 mx-2 h-px bg-border-toolbar"
    role="separator"
    aria-hidden="true"
  />
);

// ── MenuBar ───────────────────────────────────────────────────
const MenuBar = () => {
  const {
    currentTitle,
    setCurrentTitle,
    currentDocId,
    openNewDocument,
    editor,
    isSidebarOpen,
    setIsSidebarOpen,
    setIsExportModalOpen,
    setIsShortcutsModalOpen,
    setIsFindReplaceOpen,
    setIsAboutModalOpen,
    enterFocusMode,
  } = useEditorContext();

  const { theme, setTheme, themes } = useTheme();

  const [openMenu, setOpenMenu] = useState(null);
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(currentTitle);

  const titleInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // ── Menu open/close ─────────────────────────────────────────
  const handleMenuToggle = useCallback((name) => {
    setOpenMenu((prev) => (prev === name ? null : name));
  }, []);

  const closeMenu = useCallback(() => setOpenMenu(null), []);

  // ── Wrapped editor command — closes menu then runs command ──
  const cmd = useCallback(
    (fn) => {
      closeMenu();
      if (!editor) return;
      fn(editor);
    },
    [editor, closeMenu],
  );

  // ── Title editing ───────────────────────────────────────────
  const handleTitleClick = () => {
    setTitleDraft(currentTitle);
    setIsTitleEditing(true);
    setTimeout(() => titleInputRef.current?.select(), 0);
  };

  const handleTitleBlur = () => {
    const trimmed = titleDraft.trim();
    setCurrentTitle(trimmed || "Untitled Document");
    setIsTitleEditing(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter") titleInputRef.current?.blur();
    if (e.key === "Escape") {
      setTitleDraft(currentTitle);
      setIsTitleEditing(false);
    }
  };

  // ── Theme toggle ────────────────────────────────────────────
  const THEME_ORDER = [
    "light",
    "dark",
    "purple",
    "teal",
    "rose",
    "amber",
    "dark-purple",
  ];

  const handleThemeCycle = () => {
    const idx = THEME_ORDER.indexOf(theme);
    const next = (idx + 1) % THEME_ORDER.length;
    setTheme(THEME_ORDER[next]);
  };

  const ThemeIcon = theme === "dark" || theme === "dark-purple" ? Sun : Moon;

  // ── File input handlers ─────────────────────────────────────
  const handleOpenFileClick = () => {
    closeMenu();
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // useDropZone processes files — we reuse the same logic
    // by dispatching a custom event that WelcomePage listens to
    // For now this just closes — full wiring happens Day 20
    e.target.value = "";
  };

  const handleImageInsert = () => {
    closeMenu();
    imageInputRef.current?.click();
  };

  const handleImageInputChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      editor.chain().focus().setImage({ src: event.target.result }).run();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── Link insert ─────────────────────────────────────────────
  const handleLinkInsert = () => {
    closeMenu();
    if (!editor) return;
    const previous = editor.getAttributes("link").href ?? "";
    const url = window.prompt("Enter URL:", previous);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  };

  // ── Table insert ────────────────────────────────────────────
  const handleTableInsert = () => {
    closeMenu();
    if (!editor) return;
    // Basic 3x3 table via HTML — TipTap renders it correctly
    editor
      .chain()
      .focus()
      .insertContent(
        `
      <table>
        <tbody>
          <tr><td><p></p></td><td><p></p></td><td><p></p></td></tr>
          <tr><td><p></p></td><td><p></p></td><td><p></p></td></tr>
          <tr><td><p></p></td><td><p></p></td><td><p></p></td></tr>
        </tbody>
      </table>
    `,
      )
      .run();
  };

  // ── Save ────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
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

  // Add missing imports at top of file
  // import { saveDocument } from "../../utils/localStorage";
  // import toast from "react-hot-toast";

  // ── Menus definition ────────────────────────────────────────
  const MENUS = [
    {
      name: "File",
      content: (
        <>
          <MenuAction
            icon={FilePlus}
            label="New Document"
            shortcut="Ctrl+N"
            onClick={() => {
              closeMenu();
              openNewDocument();
            }}
          />
          <MenuAction
            icon={FolderOpen}
            label="Open File"
            shortcut="Ctrl+O"
            onClick={handleOpenFileClick}
          />
          <MenuSeparator />
          <MenuAction
            icon={Save}
            label="Save"
            shortcut="Ctrl+S"
            onClick={handleSave}
            disabled={!editor}
          />
          <MenuAction
            icon={Download}
            label="Export"
            shortcut="Ctrl+Shift+E"
            onClick={() => {
              closeMenu();
              setIsExportModalOpen(true);
            }}
            disabled={!editor}
          />
          <MenuSeparator />
          <MenuAction
            icon={Printer}
            label="Print"
            shortcut="Ctrl+P"
            onClick={() => {
              closeMenu();
              window.print();
            }}
            disabled={!editor}
          />
        </>
      ),
    },
    {
      name: "Edit",
      content: (
        <>
          <MenuAction
            icon={Undo2}
            label="Undo"
            shortcut="Ctrl+Z"
            onClick={() => cmd((e) => e.chain().focus().undo().run())}
            disabled={!editor}
          />
          <MenuAction
            icon={Redo2}
            label="Redo"
            shortcut="Ctrl+Y"
            onClick={() => cmd((e) => e.chain().focus().redo().run())}
            disabled={!editor}
          />
          <MenuSeparator />
          <MenuAction
            icon={Scissors}
            label="Cut"
            shortcut="Ctrl+X"
            onClick={() => {
              closeMenu();
              document.execCommand("cut");
            }}
          />
          <MenuAction
            icon={Copy}
            label="Copy"
            shortcut="Ctrl+C"
            onClick={() => {
              closeMenu();
              document.execCommand("copy");
            }}
          />
          <MenuAction
            icon={ClipboardPaste}
            label="Paste"
            shortcut="Ctrl+V"
            onClick={() => {
              closeMenu();
              document.execCommand("paste");
            }}
          />
          <MenuSeparator />
          <MenuAction
            icon={Copy}
            label="Select All"
            shortcut="Ctrl+A"
            onClick={() => cmd((e) => e.chain().focus().selectAll().run())}
            disabled={!editor}
          />
          <MenuAction
            icon={Search}
            label="Find & Replace"
            shortcut="Ctrl+F"
            onClick={() => {
              closeMenu();
              setIsFindReplaceOpen(true);
            }}
          />
        </>
      ),
    },
    {
      name: "View",
      content: (
        <>
          {/* Theme options — each one is a checked menu item */}
          <div role="group" aria-label="Theme options" className="pb-1">
            <p className="px-3 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              Theme
            </p>
            {themes.map((t) => (
              <MenuAction
                key={t.id}
                label={t.label}
                isChecked={theme === t.id}
                onClick={() => {
                  closeMenu();
                  setTheme(t.id);
                }}
              />
            ))}
          </div>

          <MenuSeparator />

          <MenuAction
            icon={Columns2}
            label="Toggle Sidebar"
            isChecked={isSidebarOpen}
            onClick={() => {
              closeMenu();
              setIsSidebarOpen((prev) => !prev);
            }}
          />
          <MenuAction
            icon={Eye}
            label="Focus Mode"
            shortcut="Ctrl+Shift+F"
            onClick={() => {
              closeMenu();
              enterFocusMode();
            }}
            disabled={!editor}
          />
        </>
      ),
    },
    {
      name: "Insert",
      content: (
        <>
          <MenuAction
            icon={Link}
            label="Link"
            onClick={handleLinkInsert}
            disabled={!editor}
          />
          <MenuAction
            icon={ImageIcon}
            label="Image"
            onClick={handleImageInsert}
            disabled={!editor}
          />
          <MenuAction
            icon={Minus}
            label="Horizontal Rule"
            onClick={() =>
              cmd((e) => e.chain().focus().setHorizontalRule().run())
            }
            disabled={!editor}
          />
          <MenuAction
            icon={Table}
            label="Table (3×3)"
            onClick={handleTableInsert}
            disabled={!editor}
          />
        </>
      ),
    },
    {
      name: "Format",
      content: (
        <>
          <MenuAction
            icon={Bold}
            label="Bold"
            shortcut="Ctrl+B"
            onClick={() => cmd((e) => e.chain().focus().toggleBold().run())}
            disabled={!editor}
          />
          <MenuAction
            icon={Italic}
            label="Italic"
            shortcut="Ctrl+I"
            onClick={() => cmd((e) => e.chain().focus().toggleItalic().run())}
            disabled={!editor}
          />
          <MenuAction
            icon={Underline}
            label="Underline"
            shortcut="Ctrl+U"
            onClick={() =>
              cmd((e) => e.chain().focus().toggleUnderline().run())
            }
            disabled={!editor}
          />
        </>
      ),
    },
    {
      name: "Help",
      content: (
        <>
          <MenuAction
            icon={Keyboard}
            label="Keyboard Shortcuts"
            shortcut="Ctrl+?"
            onClick={() => {
              closeMenu();
              setIsShortcutsModalOpen(true);
            }}
          />
          <MenuSeparator />
          <MenuAction
            icon={Info}
            label="About InkFlow"
            onClick={() => {
              closeMenu();
              setIsAboutModalOpen(true);
            }}
          />
        </>
      ),
    },
  ];

  return (
    <>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.txt"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleFileInputChange}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleImageInputChange}
      />

      <header
        className="w-full h-full flex items-center px-3 gap-1"
        role="banner"
        aria-label="InkFlow application menu bar"
      >
        {/* ── Logo ───────────────────────────────────────── */}
        <div
          className="flex items-center gap-1.5 mr-2 shrink-0"
          aria-label="InkFlow"
        >
          <div
            className="w-6 h-6 rounded-md bg-accent-primary flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <PenLine
              size={13}
              className="text-text-on-accent"
              strokeWidth={2.5}
            />
          </div>
          <span
            className="text-sm font-semibold text-text-primary hidden sm:block"
            aria-hidden="true"
          >
            InkFlow
          </span>
        </div>

        {/* ── Thin divider ───────────────────────────────── */}
        <div
          className="w-px h-4 bg-border-toolbar mx-1 shrink-0"
          aria-hidden="true"
          role="separator"
        />

        {/* ── Menu items ─────────────────────────────────── */}
        <nav
          className="flex items-center gap-0.5"
          role="menubar"
          aria-label="Application menus"
        >
          {MENUS.map((menu) => (
            <MenuItem
              key={menu.name}
              label={menu.name}
              isOpen={openMenu === menu.name}
              onToggle={() => handleMenuToggle(menu.name)}
              onClose={closeMenu}
            >
              {menu.content}
            </MenuItem>
          ))}
        </nav>

        {/* ── Document title ──────────────────────────────── */}
        <div
          className="flex-1 flex items-center justify-center px-4"
          aria-label="Document title area"
        >
          {isTitleEditing ? (
            <input
              ref={titleInputRef}
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              aria-label="Document title — press Enter to save, Escape to cancel"
              className="
                text-sm font-medium text-text-primary
                bg-transparent
                border-b border-accent-primary
                outline-none text-center
                min-w-32 max-w-72 pb-0.5
              "
              maxLength={100}
            />
          ) : (
            <button
              type="button"
              onClick={handleTitleClick}
              aria-label={`Document title: ${currentTitle}. Click to edit`}
              className={`
                text-sm font-medium text-center
                max-w-72 truncate rounded px-1 py-0.5
                transition-colors duration-150
                hover:bg-accent-secondary cursor-text
                ${
                  currentTitle === "Untitled Document"
                    ? "text-text-muted"
                    : "text-text-primary"
                }
              `}
            >
              {currentTitle || "Untitled Document"}
            </button>
          )}
        </div>

        {/* ── Right side controls ─────────────────────────── */}
        <div
          className="flex items-center gap-1.5 ml-auto shrink-0"
          role="group"
          aria-label="Application controls"
        >
          {/* Theme toggle */}
          <button
            type="button"
            onClick={handleThemeCycle}
            aria-label={`Current theme: ${theme}. Click to switch theme`}
            className="toolbar-btn text-text-secondary hover:text-text-primary"
          >
            <ThemeIcon size={16} aria-hidden="true" />
          </button>

          {/* User avatar */}
          <div
            className="
              w-7 h-7 rounded-full
              bg-accent-secondary
              flex items-center justify-center
              text-xs font-semibold text-accent-primary
              select-none shrink-0
            "
            role="img"
            aria-label="User avatar"
          >
            U
          </div>

          {/* Share button */}
          <button
            type="button"
            aria-label="Share this document"
            className="
              h-7 px-3
              flex items-center
              bg-accent-primary hover:bg-accent-primary-hover
              text-text-on-accent
              rounded-lg text-xs font-semibold
              transition-colors duration-150 shrink-0
            "
          >
            Share
          </button>
        </div>
      </header>
    </>
  );
};

export default MenuBar;
