import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  RemoveFormatting,
  X,
} from "lucide-react";

const SHEET_SECTIONS = [
  {
    label: "Format",
    tools: [
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
        id: "strike",
        icon: Strikethrough,
        label: "Strike",
        action: "strike",
        isToggle: true,
      },
      {
        id: "subscript",
        icon: Subscript,
        label: "Sub",
        action: "subscript",
        isToggle: true,
      },
      {
        id: "superscript",
        icon: Superscript,
        label: "Super",
        action: "superscript",
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
        id: "clearFormatting",
        icon: RemoveFormatting,
        label: "Clear",
        action: "clearFormatting",
        isToggle: false,
      },
    ],
  },
  {
    label: "Alignment",
    tools: [
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
      {
        id: "alignRight",
        icon: AlignRight,
        label: "Right",
        action: "alignRight",
        isToggle: true,
      },
      {
        id: "alignJustify",
        icon: AlignJustify,
        label: "Justify",
        action: "alignJustify",
        isToggle: true,
      },
    ],
  },
  {
    label: "Lists",
    tools: [
      {
        id: "bulletList",
        icon: List,
        label: "Bullets",
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
    ],
  },
  {
    label: "History",
    tools: [
      {
        id: "undo",
        icon: Undo2,
        label: "Undo",
        action: "undo",
        isToggle: false,
      },
      {
        id: "redo",
        icon: Redo2,
        label: "Redo",
        action: "redo",
        isToggle: false,
      },
    ],
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

const MobileToolbarSheet = ({
  isOpen,
  onClose,
  onCommand,
  editorState,
  editor,
}) => {
  const sheetRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet panel */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="All formatting tools"
        className="
          fixed bottom-0 left-0 right-0 z-50
          rounded-t-2xl
          bg-modal shadow-modal
          flex flex-col overflow-hidden
          animate-sheet-up
        "
        style={{ height: "60vh" }}
      >
        {/* Drag handle */}
        <div
          className="flex justify-center pt-3 pb-2 shrink-0"
          aria-hidden="true"
        >
          <div className="w-10 h-1 rounded-full bg-border-input" />
        </div>

        {/* Sheet header */}
        <div className="flex items-center justify-between px-5 pb-3 shrink-0 border-b border-border-toolbar">
          <h2 className="text-sm font-semibold text-text-primary">
            Formatting
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close formatting panel"
            className="
              w-8 h-8 rounded-full
              flex items-center justify-center
              bg-accent-secondary text-text-primary
              transition-colors duration-150
              hover:bg-accent-primary hover:text-text-on-accent
            "
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable tool grid */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {SHEET_SECTIONS.map((section) => (
            <div key={section.label} className="mb-6">
              {/* Section label */}
              <p className="text-[10px] font-semibold tracking-widest uppercase mb-3 px-1 text-text-muted">
                {section.label}
              </p>

              {/* 4-column icon grid */}
              <div
                className="grid grid-cols-4 gap-2"
                role="group"
                aria-label={`${section.label} tools`}
              >
                {section.tools.map((tool) => {
                  const Icon = tool.icon;
                  const isActive = getIsActive(tool);
                  const isDisabled = getIsDisabled(tool);

                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => onCommand(tool.action)}
                      disabled={isDisabled}
                      aria-label={tool.label}
                      aria-pressed={tool.isToggle ? isActive : undefined}
                      aria-disabled={isDisabled}
                      className={`
                        flex flex-col items-center justify-center
                        w-full h-16 rounded-xl
                        transition-all duration-150
                        active:scale-95
                        disabled:opacity-35 disabled:cursor-not-allowed
                        ${
                          isActive
                            ? "bg-accent-primary text-text-on-accent"
                            : "bg-accent-secondary text-text-primary hover:bg-accent-primary hover:text-text-on-accent"
                        }
                      `}
                    >
                      <Icon
                        size={22}
                        strokeWidth={isActive ? 2.5 : 1.8}
                        aria-hidden="true"
                      />
                      <span className="text-[10px] font-medium mt-1.5 leading-none">
                        {tool.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>,
    document.body,
  );
};

export default MobileToolbarSheet;
