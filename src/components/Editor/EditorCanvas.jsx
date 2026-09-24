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
import {
  Table,
  TableRow,
  TableCell,
  TableHeader,
} from "@tiptap/extension-table";
import { Extension } from "@tiptap/core";
import DragHandle from "@tiptap/extension-drag-handle";
import Dropcursor from "@tiptap/extension-dropcursor";
import { ImageResize } from "tiptap-extension-resize-image";
import { useEditorContext } from "../../context/EditorContext";
import useEditorState from "../../hooks/useEditorState";

// ── MODERN COMPACT FONT SIZE EXTENSION ──────────────────────────
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
            parseHTML: (el) => el.style.fontSize?.replace(/['"]+/g, "") || null,
            renderHTML: (attrs) =>
              attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
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
          chain().setMark("textStyle", { fontSize: null }).run(),
    };
  },
});

const EditorCanvas = () => {
  const { initialContent, setEditor } = useEditorContext();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: { depth: 100, newGroupDelay: 500 },
        heading: { levels: [1, 2, 3, 4] },
        dropcursor: false, // Prevents duplicate dropcursor warning
      }),

      TextStyle,
      FontSize,
      FontFamily.configure({ types: ["textStyle"] }),
      Color.configure({ types: ["textStyle"] }),
      Underline,

      Highlight.extend({ inclusive: false }).configure({ multicolor: true }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
        defaultAlignment: "left",
      }),
      Subscript,
      Superscript,

      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),

      ImageResize.configure({
        inline: false,
        HTMLAttributes: {
          class: "inkflow-resizable-image max-w-full h-auto rounded-lg",
        },
      }),

      DragHandle.configure({
        render: () => {
          const element = document.createElement("div");
          element.classList.add("inkflow-drag-grip");
          element.innerHTML = "⋮⋮";
          return element;
        },
        nested: true,
      }),

      Dropcursor.configure({
        color: "#3b82f6",
        width: 2,
      }),

      Table.configure({
        resizable: true,
        handleWidth: 5,
        cellMinWidth: 50,
        lastColumnResizable: false,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],

    content: initialContent ?? "<p></p>",

    editorProps: {
      attributes: {
        class: "ProseMirror outline-none",
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
    if (!editor) return;
    setEditor(editor);
  }, [editor, setEditor]);

  useEffect(() => {
    if (!editor || !initialContent) return;
    if (editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent, false);
    }
  }, [editor, initialContent]);

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
