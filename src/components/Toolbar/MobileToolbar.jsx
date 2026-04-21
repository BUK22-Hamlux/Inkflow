import { useState } from "react";
import { useEditorContext } from "../../context/EditorContext";
import useEditorState from "../../hooks/useEditorState";
import MobileToolbarSheet from "./MobileToolbarSheet";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  Highlighter,
  MoreHorizontal,
} from "lucide-react";

// The most essential tools shown in the scrollable row
const ESSENTIAL_TOOLS = [
  { id: "undo", icon: Undo2, label: "Undo", action: "undo" },
  { id: "redo", icon: Redo2, label: "Redo", action: "redo" },
  { id: "bold", icon: Bold, label: "Bold", action: "bold", isToggle: true },
  {
    id: "italic",
    icon: Italic,
    label: "Italic",
    action: "italic",
    isToggle: true,
  },
  {
    id: "underline",
    icon: Underline,
    label: "Underline",
    action: "underline",
    isToggle: true,
  },
  {
    id: "highlight",
    icon: Highlighter,
    label: "Highlight",
    action: "highlight",
    isToggle: true,
  },
  {
    id: "bulletList",
    icon: List,
    label: "Bullet List",
    action: "bulletList",
    isToggle: true,
  },
  {
    id: "orderedList",
    icon: ListOrdered,
    label: "Numbered",
    action: "orderedList",
    isToggle: true,
  },
  {
    id: "alignLeft",
    icon: AlignLeft,
    label: "Left",
    action: "alignLeft",
    isToggle: true,
  },
  {
    id: "alignCenter",
    icon: AlignCenter,
    label: "Center",
    action: "alignCenter",
    isToggle: true,
  },
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
      case "highlight":
        chain.toggleHighlight({ color: "#fef08a" }).run();
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
      case "clearFormatting":
        chain.clearNodes().unsetAllMarks().run();
        break;
      default:
        break;
    }
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

  return (
    <>
      <nav
        className="w-full h-full relative"
        aria-label="Mobile formatting toolbar"
        role="toolbar"
        aria-orientation="horizontal"
      >
        {/* Scrollable tool row */}
        <div
          className="flex items-center h-full gap-1 px-2"
          style={{
            overflowX: "auto",
            overflowY: "visible",
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE/Edge legacy
            WebkitOverflowScrolling: "touch", // iOS momentum scroll
          }}
          aria-label="Essential formatting tools"
        >
          {/* Hide scrollbar on webkit */}
          <style>{`
            .mobile-toolbar-scroll::-webkit-scrollbar { display: none; }
          `}</style>

          {ESSENTIAL_TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = getIsActive(tool);
            const isDisabled = getIsDisabled(tool);

            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => handleCommand(tool.action)}
                disabled={isDisabled}
                aria-label={tool.label}
                aria-pressed={tool.isToggle ? isActive : undefined}
                aria-disabled={isDisabled}
                className={`
                  toolbar-btn shrink-0
                  ${isActive ? "active" : ""}
                `}
              >
                <Icon
                  size={18}
                  aria-hidden="true"
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setIsSheetOpen(true)}
            aria-label="Show all formatting options"
            aria-expanded={isSheetOpen}
            aria-haspopup="dialog"
            className="
              toolbar-btn shrink-0 ml-1
              flex items-center gap-1
              min-w-max px-2
              text-xs font-medium
              text-text-secondary
            "
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
