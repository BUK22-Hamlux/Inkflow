import { useState, useRef } from "react";
import { useEditorContext } from "../../context/EditorContext";
import useTheme from "../../hooks/useTheme";
import useMenuActions from "../../hooks/useMenuActions";
import MenuItem from "./MenuItem";
import { MenuAction, MenuSeparator } from "./MenuAction";
import TablePicker from "../Toolbar/TablePicker";
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
} from "lucide-react";
import themes from "../../config/themes";
import Divider from "../UI/Divider";

const MenuBar = () => {
  const { currentTitle, setCurrentTitle, isSidebarOpen } = useEditorContext();
  const { theme } = useTheme();

  const actions = useMenuActions();

  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(currentTitle);
  const titleInputRef = useRef(null);

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

  const ThemeIcon = theme === "dark" || theme === "dark-purple" ? Sun : Moon;

  return (
    <>
      <input
        ref={actions.fileInputRef}
        type="file"
        accept=".docx,.txt"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={actions.onFileSelected}
      />
      <input
        ref={actions.imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={actions.onImageSelected}
      />

      <header
        className="w-full h-full flex items-center px-3 gap-1"
        role="banner"
        aria-label="InkFlow application menu bar"
      >
        {/* ── Logo ─────────────────────────────────────── */}
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

        <Divider />

        <nav
          className="flex items-center gap-0.5"
          role="menubar"
          aria-label="Application menus"
        >
          {/* File */}
          <MenuItem
            label="File"
            isOpen={actions.openMenu === "File"}
            onToggle={() => actions.toggleMenu("File")}
            onClose={actions.closeMenu}
          >
            <MenuAction
              icon={FilePlus}
              label="New Document"
              shortcut="Ctrl+N"
              onClick={actions.newDocument}
            />
            <MenuAction
              icon={FolderOpen}
              label="Open File"
              shortcut="Ctrl+O"
              onClick={actions.openFile}
            />
            <MenuSeparator />
            <MenuAction
              icon={Save}
              label="Save"
              shortcut="Ctrl+S"
              onClick={actions.saveCurrentDocument}
              disabled={!actions.editor}
            />
            <MenuAction
              icon={Download}
              label="Export"
              shortcut="Ctrl+Shift+E"
              onClick={actions.openExportModal}
              disabled={!actions.editor}
            />
            <MenuSeparator />
            <MenuAction
              icon={Printer}
              label="Print"
              shortcut="Ctrl+P"
              onClick={actions.printDocument}
              disabled={!actions.editor}
            />
          </MenuItem>

          {/* Edit */}
          <MenuItem
            label="Edit"
            isOpen={actions.openMenu === "Edit"}
            onToggle={() => actions.toggleMenu("Edit")}
            onClose={actions.closeMenu}
          >
            <MenuAction
              icon={Undo2}
              label="Undo"
              shortcut="Ctrl+Z"
              onClick={() => actions.cmd((e) => e.chain().focus().undo().run())}
              disabled={!actions.editor}
            />
            <MenuAction
              icon={Redo2}
              label="Redo"
              shortcut="Ctrl+Y"
              onClick={() => actions.cmd((e) => e.chain().focus().redo().run())}
              disabled={!actions.editor}
            />
            <MenuSeparator />
            <MenuAction
              icon={Scissors}
              label="Cut"
              shortcut="Ctrl+X"
              onClick={() => {
                actions.closeMenu();
                document.execCommand("cut");
              }}
            />
            <MenuAction
              icon={Copy}
              label="Copy"
              shortcut="Ctrl+C"
              onClick={() => {
                actions.closeMenu();
                document.execCommand("copy");
              }}
            />
            <MenuAction
              icon={ClipboardPaste}
              label="Paste"
              shortcut="Ctrl+V"
              onClick={() => {
                actions.closeMenu();
                document.execCommand("paste");
              }}
            />
            <MenuSeparator />
            <MenuAction
              icon={Copy}
              label="Select All"
              shortcut="Ctrl+A"
              onClick={() =>
                actions.cmd((e) => e.chain().focus().selectAll().run())
              }
              disabled={!actions.editor}
            />
            <MenuAction
              icon={Search}
              label="Find & Replace"
              shortcut="Ctrl+F"
              onClick={actions.openFindReplace}
            />
          </MenuItem>

          {/* View */}
          <MenuItem
            label="View"
            isOpen={actions.openMenu === "View"}
            onToggle={() => actions.toggleMenu("View")}
            onClose={actions.closeMenu}
          >
            <div role="group" aria-label="Theme options" className="pb-1">
              <p className="px-3 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                Theme
              </p>
              {themes.map((t) => (
                <MenuAction
                  key={t.id}
                  label={t.label}
                  isChecked={theme === t.id}
                  onClick={() => actions.selectTheme(t.id)}
                />
              ))}
            </div>
            <MenuSeparator />
            <MenuAction
              icon={Columns2}
              label="Toggle Sidebar"
              isChecked={isSidebarOpen}
              onClick={actions.toggleSidebar}
            />
            <MenuAction
              icon={Eye}
              label="Focus Mode"
              shortcut="Ctrl+Shift+F"
              onClick={actions.openFocusMode}
              disabled={!actions.editor}
            />
          </MenuItem>

          {/* Insert */}
          <MenuItem
            label="Insert"
            isOpen={actions.openMenu === "Insert"}
            onToggle={() => actions.toggleMenu("Insert")}
            onClose={actions.closeMenu}
          >
            <MenuAction
              icon={Link}
              label="Link"
              onClick={actions.insertLink}
              disabled={!actions.editor}
            />
            <MenuAction
              icon={ImageIcon}
              label="Image"
              onClick={actions.insertImage}
              disabled={!actions.editor}
            />
            <MenuAction
              icon={Minus}
              label="Horizontal Rule"
              onClick={actions.insertHorizontalRule}
              disabled={!actions.editor}
            />
          </MenuItem>

          <TablePicker
            onInsert={(rows, cols) => {
              actions.closeMenu();
              actions.insertTable(rows, cols);
            }}
            onOpen={actions.closeMenu}
            disabled={!actions.editor}
          />

          {/* Format */}
          <MenuItem
            label="Format"
            isOpen={actions.openMenu === "Format"}
            onToggle={() => actions.toggleMenu("Format")}
            onClose={actions.closeMenu}
          >
            <MenuAction
              icon={Bold}
              label="Bold"
              shortcut="Ctrl+B"
              onClick={() =>
                actions.cmd((e) => e.chain().focus().toggleBold().run())
              }
              disabled={!actions.editor}
            />
            <MenuAction
              icon={Italic}
              label="Italic"
              shortcut="Ctrl+I"
              onClick={() =>
                actions.cmd((e) => e.chain().focus().toggleItalic().run())
              }
              disabled={!actions.editor}
            />
            <MenuAction
              icon={Underline}
              label="Underline"
              shortcut="Ctrl+U"
              onClick={() =>
                actions.cmd((e) => e.chain().focus().toggleUnderline().run())
              }
              disabled={!actions.editor}
            />
          </MenuItem>

          {/* Help */}
          <MenuItem
            label="Help"
            isOpen={actions.openMenu === "Help"}
            onToggle={() => actions.toggleMenu("Help")}
            onClose={actions.closeMenu}
          >
            <MenuAction
              icon={Keyboard}
              label="Keyboard Shortcuts"
              shortcut="Ctrl+?"
              onClick={actions.openShortcuts}
            />
            <MenuSeparator />
            <MenuAction
              icon={Info}
              label="About InkFlow"
              onClick={actions.openAbout}
            />
          </MenuItem>
        </nav>

        {/* ── Document title ───────────────────────────── */}
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
              className=" text-sm font-medium text-text-primary bg-transparent border-b border-accent-primary outline-none text-center min-w-32 max-w-72 pb-0.5
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

        {/* ── Right side controls ──────────────────────── */}
        <div
          className="flex items-center gap-1.5 ml-auto shrink-0"
          role="group"
          aria-label="Application controls"
        >
          <button
            type="button"
            onClick={actions.cycleThroughThemes}
            aria-label={`Current theme: ${theme}. Click to switch theme`}
            className="toolbar-btn text-text-secondary hover:text-text-primary"
          >
            <ThemeIcon size={16} aria-hidden="true" />
          </button>

          <div
            className="w-7 h-7 rounded-full bg-accent-secondary flex items-center justify-center text-xs font-semibold text-accent-primary select-none shrink-0"
            role="img"
            aria-label="User avatar"
          >
            U
          </div>

          <button
            type="button"
            aria-label="Share this document"
            className="h-7 px-3 flex items-center bg-accent-primary hover:bg-accent-primary-hover text-text-on-accent rounded-lg text-xs font-semibold transition-colors duration-150 shrink-0"
          >
            Share
          </button>
        </div>
      </header>
    </>
  );
};

export default MenuBar;
