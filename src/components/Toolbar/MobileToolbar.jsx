import { useState, useCallback } from "react";
import { useEditorContext } from "../../context/EditorContext";
import useEditorState from "../../hooks/useEditorState";
import useImageActions from "../../hooks/useImageActions";
import MobileToolbarSheet from "./MobileToolbarSheet";
import ToolbarButton from "./ToolbarButton";
import FontFamilySelector from "./FontFamilySelector";
import FontSizeSelector from "./FontSizeSelector";
import { MoreHorizontal } from "lucide-react";

const ESSENTIAL_TOOLS = [
  { id: "undo", icon: "Undo", label: "Undo", action: "undo" },
  { id: "redo", icon: "Redo", label: "Redo", action: "redo" },
];

const ACTIVE_STATE_MAP = {
  bold: "isBold",
  italic: "isItalic",
  underline: "isUnderline",
  strike: "isStrikethrough",
  subscript: "isSubscript",
  superscript: "isSuperscript",
  highlight: "isHighlight",
  link: "isLink",
  bulletList: "isBulletList",
  orderedList: "isOrderedList",
  alignLeft: "alignLeft",
  alignCenter: "alignCenter",
  alignRight: "alignRight",
  alignJustify: "alignJustify",
};

const MobileToolbar = () => {
  const { editor } = useEditorContext();
  const editorState = useEditorState(editor);
  const imageActions = useImageActions(editor);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleCommand = (action) => {
    if (!editor) return;
    const chain = editor.chain().focus();

    switch (action) {
      case "undo":
        chain.undo().run();
        break;
      case "redo":
        chain.redo().run();
        break;
      case "bold":
        chain.toggleBold().run();
        break;
      case "italic":
        chain.toggleItalic().run();
        break;
      case "underline":
        chain.toggleUnderline().run();
        break;
      case "strike":
        chain.toggleStrike().run();
        break;
      case "subscript":
        chain.toggleSubscript().run();
        break;
      case "superscript":
        chain.toggleSuperscript().run();
        break;

      case "bulletList":
        chain.toggleBulletList().run();
        break;
      case "orderedList":
        chain.toggleOrderedList().run();
        break;
      case "alignLeft":
        chain.setTextAlign("left").run();
        break;
      case "alignCenter":
        chain.setTextAlign("center").run();
        break;
      case "alignRight":
        chain.setTextAlign("right").run();
        break;
      case "alignJustify":
        chain.setTextAlign("justify").run();
        break;
      case "link":
        handleLinkInsert();
        break;
      case "image":
        imageActions.insertImageFromUrl();
        break;
      case "horizontalRule":
        chain.setHorizontalRule().run();
        break;
      case "highlight":
      case "clearFormatting":
        chain.clearNodes().unsetAllMarks().run();
        break;
      default:
        break;
    }
  };

  const handleLinkInsert = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href ?? "";
    const url = window.prompt("Enter URL:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  };

  const getIsActive = (tool) => {
    if (!tool.isToggle || !editorState) return false;
    const key = ACTIVE_STATE_MAP[tool.id];
    return key ? !!editorState[key] : false;
  };

  const getIsDisabled = (tool) => {
    if (!editor) return true;
    if (tool.action === "undo") return !editorState?.canUndo;
    if (tool.action === "redo") return !editorState?.canRedo;
    return false;
  };

  const handleFontChange = useCallback(
    (fontValue) => {
      if (!editor) return;
      editor.chain().focus().setFontFamily(fontValue).run();
    },
    [editor],
  );

  const handleSizeChange = useCallback(
    (size) => {
      if (!editor) return;
      editor.chain().focus().setFontSize(`${size}px`).run();
    },
    [editor],
  );

  return (
    <>
      <nav
        className="w-full h-full relative"
        aria-label="Mobile formatting toolbar"
        role="toolbar"
        aria-orientation="horizontal"
      >
        <div
          className="flex items-center h-full gap-1 px-2"
          style={{
            overflowX: "auto",
            overflowY: "visible",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
          aria-label="Essential formatting tools"
        >
          <style>{`
            .mobile-toolbar-scroll::-webkit-scrollbar { display: none; }
          `}</style>

          <FontFamilySelector
            currentFont={editorState.currentFontFamily}
            disabled={!editor}
            onFontChange={handleFontChange}
          />
          <FontSizeSelector
            currentSize={editorState.currentFontSize}
            disabled={!editor}
            onSizeChange={handleSizeChange}
          />

          {ESSENTIAL_TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = getIsActive(tool);
            const isDisabled = getIsDisabled(tool);

            return (
              <ToolbarButton
                key={tool.id}
                icon={tool.icon}
                label={tool.label}
                isActive={isActive}
                onClick={() => handleCommand(tool.action)}
                disabled={isDisabled}
                size={15}
              />
            );
          })}

          <button
            type="button"
            onClick={() => setIsSheetOpen(true)}
            aria-label="Show all formatting options"
            aria-expanded={isSheetOpen}
            aria-haspopup="dialog"
            className=" toolbar-btn shrink-0 ml-1 flex items-center gap-1 min-w-max px-2 text-xs font-medium text-text-secondary"
          >
            <MoreHorizontal size={16} aria-hidden="true" />
            <span className="text-[11px]">More</span>
          </button>
        </div>

        <div
          className="absolute right-0 top-0 h-full w-12 pointer-events-none"
          style={{
            background:
              "linear-gradient(to left, var(--bg-toolbar) 20%, transparent 100%)",
          }}
          aria-hidden="true"
        />
      </nav>

      <MobileToolbarSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onCommand={handleCommand}
        editorState={editorState}
        editor={editor}
      />
    </>
  );
};

export default MobileToolbar;
