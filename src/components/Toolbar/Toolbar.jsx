import { useCallback } from "react";
import toolbarConfig from "../../config/toolbarConfig";
import { useEditorContext } from "../../context/EditorContext";
import useEditorState from "../../hooks/useEditorState";
import ToolbarButton from "./ToolbarButton";
import FontFamilySelector from "./FontFamilySelector";
import FontSizeSelector from "./FontSizeSelector";
import ColorPicker from "./ColorPicker";
import Divider from "../UI/Divider";
import Dropdown from "../UI/Dropdown";

const PARAGRAPH_STYLES = [
  { label: "Normal Text", command: "paragraph", attrs: null },
  { label: "Heading 1", command: "heading", attrs: { level: 1 } },
  { label: "Heading 2", command: "heading", attrs: { level: 2 } },
  { label: "Heading 3", command: "heading", attrs: { level: 3 } },
  { label: "Blockquote", command: "blockquote", attrs: null },
  { label: "Code Block", command: "codeBlock", attrs: null },
];

const getActiveParagraphLabel = (editorState) => {
  if (editorState.isH1) return "Heading 1";
  if (editorState.isH2) return "Heading 2";
  if (editorState.isH3) return "Heading 3";
  if (editorState.isBlockquote) return "Blockquote";
  if (editorState.isCode) return "Code Block";
  return "Normal Text";
};

const Toolbar = () => {
  const { editor } = useEditorContext();
  const editorState = useEditorState(editor);

  const handleCommand = useCallback(
    (action) => {
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
        case "bulletList":
          chain.toggleBulletList().run();
          break;
        case "orderedList":
          chain.toggleOrderedList().run();
          break;
        case "link":
          handleLinkInsert();
          break;
        case "image":
          handleImageInsert();
          break;
        case "horizontalRule":
          chain.setHorizontalRule().run();
          break;
        case "clearFormatting":
          chain.clearNodes().unsetAllMarks().run();
          break;
        default:
          console.warn(`Unknown toolbar action: ${action}`);
      }
    },
    [editor],
  );

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

  const handleImageInsert = () => {
    if (!editor) return;
    const url = window.prompt("Enter image URL:");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  const handleParagraphStyle = useCallback(
    (style) => {
      if (!editor) return;
      const chain = editor.chain().focus();
      switch (style.command) {
        case "paragraph":
          chain.setParagraph().run();
          break;
        case "heading":
          chain.setHeading(style.attrs).run();
          break;
        case "blockquote":
          chain.toggleBlockquote().run();
          break;
        case "codeBlock":
          chain.toggleCodeBlock().run();
          break;
        default:
          break;
      }
    },
    [editor],
  );

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

  const handleTextColorChange = useCallback(
    (color) => {
      if (!editor) return;
      editor.chain().focus().setColor(color).run();
    },
    [editor],
  );

  const handleHighlightChange = useCallback(
    (color) => {
      if (!editor) return;
      editor.chain().focus().setHighlight({ color }).run();
    },
    [editor],
  );

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

  const getIsActive = (item) => {
    if (!editorState) return false;
    const key = ACTIVE_STATE_MAP[item.id];
    if (!key) return false;
    return !!editorState[key];
  };

  const getIsDisabled = (item) => {
    if (!editor) return true;
    if (item.action === "undo") return !editorState.canUndo;
    if (item.action === "redo") return !editorState.canRedo;
    return false;
  };

  return (
    <nav
      className="w-full h-full flex items-center px-3 gap-1 overflow-x-auto"
      aria-label="Text formatting toolbar"
      role="toolbar"
      aria-orientation="horizontal"
    >
      <Dropdown
        trigger={
          <button
            type="button"
            aria-label={`Paragraph style: ${getActiveParagraphLabel(editorState)}. Click to change`}
            className="
              h-8 px-3
              flex items-center gap-1.5
              rounded-md text-xs font-medium
              text-text-primary
              hover:bg-accent-secondary
              transition-all duration-100
              border border-transparent hover:border-border-input
              min-w-32
            "
          >
            <span className="truncate flex-1 text-left">
              {getActiveParagraphLabel(editorState)}
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 4L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        }
        align="left"
        width="180px"
        disabled={!editor}
      >
        <div
          role="listbox"
          aria-label="Paragraph style options"
          className="py-1"
        >
          {PARAGRAPH_STYLES.map((style) => {
            const isSelected =
              getActiveParagraphLabel(editorState) === style.label;
            return (
              <button
                key={style.label}
                role="option"
                aria-selected={isSelected}
                type="button"
                onClick={() => handleParagraphStyle(style)}
                className="
                  w-full px-3 py-2
                  text-left text-sm
                  text-text-primary
                  hover:bg-accent-secondary
                  transition-colors duration-100
                  flex items-center justify-between gap-2
                "
              >
                <span
                  style={{
                    fontSize:
                      style.label === "Heading 1"
                        ? "18px"
                        : style.label === "Heading 2"
                          ? "15px"
                          : style.label === "Heading 3"
                            ? "13px"
                            : "13px",
                    fontWeight: style.label.startsWith("Heading")
                      ? "600"
                      : "400",
                  }}
                >
                  {style.label}
                </span>
                {isSelected && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 7L5.5 10.5L12 3.5"
                      stroke="var(--accent-primary)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </Dropdown>

      <Divider />

      <FontFamilySelector
        currentFont={editorState.currentFontFamily}
        onFontChange={handleFontChange}
        disabled={!editor}
      />

      <FontSizeSelector
        currentSize={editorState.currentFontSize}
        onSizeChange={handleSizeChange}
        disabled={!editor}
      />

      <Divider />

      {toolbarConfig
        .filter((group) => group.group === "format")
        .flatMap((group) => group.items)
        .map((item) => (
          <ToolbarButton
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={getIsActive(item)}
            isDisabled={getIsDisabled(item)}
            onClick={() => handleCommand(item.action)}
          />
        ))}

      <Divider />

      <ColorPicker
        type="text"
        currentColor={editorState.currentTextColor}
        onColorChange={handleTextColorChange}
        disabled={!editor}
      />

      <ColorPicker
        type="highlight"
        currentColor={editorState.currentHighlightColor}
        onColorChange={handleHighlightChange}
        disabled={!editor}
      />

      <Divider />

      {toolbarConfig
        .filter((group) => group.group === "alignment")
        .flatMap((group) => group.items)
        .map((item) => (
          <ToolbarButton
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={getIsActive(item)}
            isDisabled={!editor}
            onClick={() => handleCommand(item.action)}
          />
        ))}

      <Divider />

      {toolbarConfig
        .filter((group) => group.group === "lists")
        .flatMap((group) => group.items)
        .map((item) => (
          <ToolbarButton
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={getIsActive(item)}
            isDisabled={!editor}
            onClick={() => handleCommand(item.action)}
          />
        ))}

      <Divider />

      {toolbarConfig
        .filter((group) => group.group === "history")
        .flatMap((group) => group.items)
        .map((item) => (
          <ToolbarButton
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={false}
            isDisabled={getIsDisabled(item)}
            onClick={() => handleCommand(item.action)}
          />
        ))}

      <Divider />

      {toolbarConfig
        .filter((group) => group.group === "insert" || group.group === "extras")
        .flatMap((group) => group.items)
        .map((item) => (
          <ToolbarButton
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={false}
            isDisabled={!editor}
            onClick={() => handleCommand(item.action)}
          />
        ))}
    </nav>
  );
};

export default Toolbar;
