import { useState, useEffect, useCallback } from "react";

const DEFAULT_STATE = {
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrikethrough: false,
  isSubscript: false,
  isSuperscript: false,
  isHighlight: false,
  isLink: false,
  isImage: false,

  isH1: false,
  isH2: false,
  isH3: false,
  isParagraph: false,
  isBulletList: false,
  isOrderedList: false,
  isBlockquote: false,
  isCode: false,

  alignLeft: true,
  alignCenter: false,
  alignRight: false,
  alignJustify: false,

  currentFontFamily: "",
  currentFontSize: "14",
  currentTextColor: "#000000",
  currentHighlightColor: "",

  canUndo: false,
  canRedo: false,

  imageAttrs: null,
};

const useEditorState = (editor) => {
  const [editorState, setEditorState] = useState(DEFAULT_STATE);

  const readState = useCallback(() => {
    if (!editor || editor.isDestroyed) return;

    setEditorState({
      isBold: editor.isActive("bold"),
      isItalic: editor.isActive("italic"),
      isUnderline: editor.isActive("underline"),
      isStrikethrough: editor.isActive("strike"),
      isSubscript: editor.isActive("subscript"),
      isSuperscript: editor.isActive("superscript"),
      isHighlight: editor.isActive("highlight"),
      isLink: editor.isActive("link"),
      isImage: editor.isActive("image"),

      isInTable: editor.isActive("table"),

      isH1: editor.isActive("heading", { level: 1 }),
      isH2: editor.isActive("heading", { level: 2 }),
      isH3: editor.isActive("heading", { level: 3 }),
      isParagraph: editor.isActive("paragraph"),
      isBulletList: editor.isActive("bulletList"),
      isOrderedList: editor.isActive("orderedList"),
      isBlockquote: editor.isActive("blockquote"),
      isCode: editor.isActive("code"),

      alignLeft: editor.isActive({ textAlign: "left" }),
      alignCenter: editor.isActive({ textAlign: "center" }),
      alignRight: editor.isActive({ textAlign: "right" }),
      alignJustify: editor.isActive({ textAlign: "justify" }),

      currentFontFamily: editor.getAttributes("textStyle").fontFamily ?? "",
      currentFontSize: editor.getAttributes("textStyle").fontSize
        ? editor.getAttributes("textStyle").fontSize.replace("px", "")
        : "14",
      currentTextColor: editor.getAttributes("textStyle").color ?? "#000000",
      currentHighlightColor: editor.getAttributes("highlight").color ?? "",

      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),

      imageAttrs: editor.isActive("image")
        ? editor.getAttributes("image")
        : null,
    });
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    readState();

    editor.on("transaction", readState);
    editor.on("selectionUpdate", readState);
    editor.on("focus", readState);

    return () => {
      editor.off("transaction", readState);
      editor.off("selectionUpdate", readState);
      editor.off("focus", readState);
    };
  }, [editor, readState]);

  return editorState;
};

export default useEditorState;
