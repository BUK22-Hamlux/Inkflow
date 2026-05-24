import { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import ColorPicker from "../Toolbar/ColorPicker";
import MobileToolbarSheetButtons from "../../config/mobileToolbarSheetButtons";
import { X } from "lucide-react";

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
    if (isOpen) setTimeout(() => closeRef.current?.focus(), 50);
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
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleTextColorChange = useCallback(
    (color) => {
      if (!editor) return;
      if (!color) {
        editor.chain().focus().unsetColor().run();
        return;
      }
      editor.chain().focus().setColor(color).run();
    },
    [editor],
  );

  const handleHighlightChange = useCallback(
    (color) => {
      if (!editor) return;
      if (!color) {
        editor.chain().focus().unsetHighlight().run();
        return;
      }
      editor.chain().focus().setHighlight({ color }).run();
    },
    [editor],
  );

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
      <div
        className="fixed inset-0 z-40 bg-overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="All formatting tools"
        className="fixed bottom-0 left-0 right-0 z-50 animate-sheet-up rounded-t-2xl bg-modal shadow-modal flex flex-col overflow-hidden animate-sheet-up"
        style={{ height: "60vh" }}
      >
        <div className="flex items-center justify-between p-5 pb-3 shrink-0 border-b border-border-toolbar">
          <h2 className="text-sm font-semibold text-text-primary">
            Formatting
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close formatting panel"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-accent-secondary text-text-primary transition-colors duration-150 hover:bg-accent-primary hover:text-text-on-accent"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mb-6">
            <p className="text-[10px] font-semibold tracking-widest uppercase mb-3 px-1 text-text-muted">
              Color
            </p>

            <div className="flex gap-4 px-1">
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-16 h-16 rounded-xl bg-accent-secondary flex items-center justify-center"
                  aria-label="Text color"
                >
                  <ColorPicker
                    type="text"
                    currentColor={editorState?.currentTextColor}
                    onColorChange={handleTextColorChange}
                    disabled={!editor}
                  />
                </div>
                <span className="text-[10px] font-medium text-text-secondary">
                  Text Color
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-16 h-16 rounded-xl bg-accent-secondary flex items-center justify-center"
                  aria-label="Highlight color"
                >
                  <ColorPicker
                    type="highlight"
                    currentColor={editorState?.currentHighlightColor}
                    onColorChange={handleHighlightChange}
                    disabled={!editor}
                  />
                </div>
                <span className="text-[10px] font-medium text-text-secondary">
                  Highlight
                </span>
              </div>
            </div>
          </div>

          {MobileToolbarSheetButtons.map((section) => (
            <div key={section.label} className="mb-6">
              <p className="text-[10px] font-semibold tracking-widest uppercase mb-3 px-1 text-text-muted">
                {section.label}
              </p>

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
                      className={` flex flex-col items-center justify-center w-full h-16 rounded-xl transition-all duration-150 active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed
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
