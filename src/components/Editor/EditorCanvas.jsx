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
import { useEditorContext } from "../../context/EditorContext";

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
      }),

      TextStyle,

      FontFamily.configure({
        types: ["textStyle"],
      }),

      Color.configure({
        types: ["textStyle"],
      }),

      Underline,

      Highlight.configure({
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
        HTMLAttributes: {
          class: "editor-image",
        },
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

  useEffect(() => {
    if (editor) {
      setEditor(editor);
    }
  }, [editor, setEditor]);

  useEffect(() => {
    if (!editor) return;
    if (!initialContent) return;

    const isHtml = typeof initialContent === "string";
    const isEmpty = editor.isEmpty;

    if (isHtml && isEmpty) {
      editor.commands.setContent(initialContent);
      editor.commands.focus("end");
    } else if (isHtml && !isEmpty) {
      editor.commands.setContent(initialContent);
      editor.commands.focus("end");
    }
  }, [editor, initialContent]);

  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
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
    <article
      className="editor-canvas"
      aria-label="Document editor canvas"
      role="main"
    >
      <EditorContent editor={editor} aria-label="Document editing area" />
    </article>
  );
};

export default EditorCanvas;
