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
import ParagraphStyleSelector from "./ParagraphStyleSelector";

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
          chain.toggleBold.toggleBold().run();
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
      if (editor.isActive("highlight", { color })) {
        editor.chain().focus().unsetHighlight().run();
      } else {
        editor.chain().focus().setHighlight({ color }).run();
      }
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
      <ParagraphStyleSelector
        disable={false}
        currentParagraphStyle={getActiveParagraphLabel(editorState)}
        onParagraphStyleChange={handleParagraphStyle}
      />
      <Divider />

      <FontFamilySelector
        currentFont={editorState.currentFontFamily}
        onFontChange={handleFontChange}
        disabled={!editor}
      />
      <Divider />
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
