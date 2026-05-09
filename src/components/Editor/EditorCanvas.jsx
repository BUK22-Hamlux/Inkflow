import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import FontFamily from "@tiptap/extension-font-family";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Extension } from "@tiptap/core";
import { useEditorContext } from "../../context/EditorContext";
import useEditorState from "../../hooks/useEditorState";

// ── FontSize custom extension ─────────────────────────────────
const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) =>
              element.style.fontSize?.replace(/['"]+/g, "") || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run(),
    };
  },
});

// ── Fix 1: Bold stripping color ───────────────────────────────
// The root cause: when Bold matches a <strong> tag, ProseMirror
// marks it as "consumed" and TextStyle never gets to read the
// inline style on the same element — so color is lost.
//
// The fix from the official TipTap discussion (github #5912):
// Extend TextStyle with higher priority and consuming:false
// so it can parse style attributes even after Bold has
// already matched the same element.
const FixedTextStyle = TextStyle.extend({
  // Higher priority than Bold (which defaults to 100)
  // ensures TextStyle runs its parseHTML FIRST
  priority: 1000,

  parseHTML() {
    return [
      // Keep the original TextStyle parseHTML rules
      ...(this.parent?.() ?? []),
      {
        // Also match ANY element that has a style attribute
        // consuming: false means "don't stop other rules
        // from also matching this element"
        // This is what allows Bold AND TextStyle to both
        // apply to the same <strong style="color:red"> element
        tag: "[style]",
        consuming: false,
      },
    ];
  },
});

// ── Fix 2: Highlight bleeding into new text ───────────────────
// inclusive: false means when cursor is at the END of a
// highlighted range, new typed characters do NOT inherit
// the highlight. Matches MS Word behaviour exactly.
const NonInclusiveHighlight = Highlight.extend({
  inclusive: false,
});

const EditorCanvas = () => {
  const { initialContent, setEditor } = useEditorContext();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: {
          depth: 100,
          newGroupDelay: 500,
        },
        heading: {
          levels: [1, 2, 3, 4],
        },
        underline: false,
        link: false,
      }),

      // FixedTextStyle MUST come before Color and FontFamily
      // The priority:1000 and consuming:false fix the
      // bold-strips-color bug permanently
      FixedTextStyle,

      FontSize,

      FontFamily.configure({
        types: ["textStyle"],
      }),

      Color.configure({
        types: ["textStyle"],
      }),

      Underline,

      // NonInclusiveHighlight fixes highlight bleeding
      // into new text when spacebar is pressed
      NonInclusiveHighlight.configure({
        multicolor: true,
      }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
        defaultAlignment: "left",
      }),

      Subscript,
      Superscript,

      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),

      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: { class: "editor-image" },
      }),
    ],

    content: initialContent ?? "<p></p>",

    editorProps: {
      attributes: {
        class: "ProseMirror",
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": "Document editor. Start typing your document here.",
        "data-placeholder": "Start typing your document...",
        spellcheck: "true",
      },
    },

    autofocus: "end",
  });

  const editorState = useEditorState(editor);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Editor State:", editorState);
    }
  }, [editorState]);

  useEffect(() => {
    if (editor) setEditor(editor);
  }, [editor, setEditor]);

  useEffect(() => {
    if (!editor || !initialContent) return;
    editor.commands.setContent(initialContent);
    editor.commands.focus("end");
  }, [editor, initialContent]);

  useEffect(() => {
    return () => {
      if (editor) editor.destroy();
    };
  }, [editor]);

  if (!editor) {
    return (
      <div
        className="editor-canvas"
        role="status"
        aria-label="Editor is loading"
        aria-busy="true"
      >
        <div className="flex items-center justify-center min-h-96">
          <div
            className="w-8 h-8 border-4 border-accent-secondary border-t-accent-primary rounded-full animate-spin"
            aria-hidden="true"
          />
        </div>
      </div>
    );
  }

  return (
    <article className="editor-canvas" aria-label="Document editor canvas">
      <EditorContent editor={editor} aria-label="Document editing area" />
    </article>
  );
};

export default EditorCanvas;
