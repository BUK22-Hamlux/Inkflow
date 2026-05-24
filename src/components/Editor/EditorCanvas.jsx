import { useEffect, useRef, useState } from "react";
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
import {
  Table,
  TableRow,
  TableCell,
  TableHeader,
} from "@tiptap/extension-table";
import { Extension, ResizableNodeView } from "@tiptap/core";
import DragHandle from "@tiptap/extension-drag-handle";
import Dropcursor from "@tiptap/extension-dropcursor";
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

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "left",
        parseHTML: (element) => element.getAttribute("data-align") || "left",
        renderHTML: (attributes) => ({
          "data-align": attributes.align || "left",
        }),
      },
    };
  },

  addNodeView() {
    if (!this.options.resize?.enabled || typeof document === "undefined") {
      return null;
    }

    const { directions, minWidth, minHeight, alwaysPreserveAspectRatio } =
      this.options.resize;

    const applyImageAttributes = (element, attrs) => {
      const nextAttrs = {
        ...this.options.HTMLAttributes,
        src: attrs.src,
        alt: attrs.alt,
        title: attrs.title,
        "data-align": attrs.align || "left",
      };

      Object.entries(nextAttrs).forEach(([key, value]) => {
        if (value == null || value === "") {
          element.removeAttribute(key);
        } else {
          element.setAttribute(key, value);
        }
      });

      if (attrs.width) {
        element.style.width = `${attrs.width}px`;
      }
      if (attrs.height) {
        element.style.height = `${attrs.height}px`;
      }
    };

    return ({ node, getPos, editor }) => {
      const element = document.createElement("img");
      applyImageAttributes(element, node.attrs);

      const nodeView = new ResizableNodeView({
        element,
        editor,
        node,
        getPos,
        onResize: (width, height) => {
          element.style.width = `${width}px`;
          element.style.height = `${height}px`;
        },
        onCommit: (width, height) => {
          const pos = getPos();
          if (pos === undefined) return;

          editor
            .chain()
            .setNodeSelection(pos)
            .updateAttributes(this.name, { width, height })
            .run();
        },
        onUpdate: (updatedNode) => {
          if (updatedNode.type !== node.type) return false;
          applyImageAttributes(element, updatedNode.attrs);
          return true;
        },
        options: {
          directions,
          min: {
            width: minWidth,
            height: minHeight,
          },
          preserveAspectRatio: alwaysPreserveAspectRatio === true,
        },
      });

      return nodeView;
    };
  },
});

const EditorCanvas = () => {
  const { initialContent, setEditor } = useEditorContext();
  const canvasRef = useRef(null);
  const [pageCount, setPageCount] = useState(1);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: { depth: 100, newGroupDelay: 500 },
        heading: { levels: [1, 2, 3, 4] },
      }),

      TextStyle,
      FontSize,
      FontFamily.configure({ types: ["textStyle"] }),
      Color.configure({ types: ["textStyle"] }),
      Underline,

      // Modern extended marks
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

      ResizableImage.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: "inkflow-resizable-image max-w-full h-auto rounded-lg",
        },
        resize: {
          enabled: true,
          directions: [
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ],
          minWidth: 80,
          minHeight: 80,
          alwaysPreserveAspectRatio: true,
        },
      }),

      DragHandle.configure({
        render: () => {
          const element = document.createElement("div");
          element.classList.add("inkflow-drag-grip");
          element.textContent = "::";
          return element;
        },
        nested: true,
      }),

      Dropcursor.configure({
        color: "#3b82f6", // Customizes the drop horizontal indicator line color
        width: 2, // Thicker drop destination indicator line (in px)
      }),

      // Modern Table Nodes
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
        class: "ProseMirror outline-none min-h-[inherit] ",
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
    if (import.meta.env.DEV) {
      console.log("Editor State:", editorState);
    }
  }, [editorState]);

  // Unified Single effect layout to pass instance upwards
  useEffect(() => {
    if (!editor) return;
    setEditor(editor);
  }, [editor, setEditor]);

  // Safe initial hydration handle
  useEffect(() => {
    if (!editor || !initialContent) return;
    // Don't overwrite if content matches to avoid cursor jump fights
    if (editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent, false);
    }
  }, [editor, initialContent]);

  useEffect(() => {
    if (!editor || !canvasRef.current) return;

    const pageHeight = 1056;
    const measurePages = () => {
      const editorElement = canvasRef.current?.querySelector(".ProseMirror");
      if (!editorElement) return;

      const nextPageCount = Math.max(
        1,
        Math.ceil(editorElement.scrollHeight / pageHeight),
      );

      setPageCount(nextPageCount);
    };

    measurePages();

    const resizeObserver = new ResizeObserver(measurePages);
    resizeObserver.observe(canvasRef.current);

    const editorElement = canvasRef.current.querySelector(".ProseMirror");
    if (editorElement) {
      resizeObserver.observe(editorElement);
    }

    editor.on("transaction", measurePages);
    editor.on("update", measurePages);

    return () => {
      resizeObserver.disconnect();
      editor.off("transaction", measurePages);
      editor.off("update", measurePages);
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
      ref={canvasRef}
      className="editor-canvas"
      aria-label="Document editor canvas"
      style={{ "--inkflow-document-height": `${pageCount * 1056}px` }}
    >
      <div className="editor-page-stack" aria-hidden="true">
        {Array.from({ length: pageCount }, (_, index) => (
          <div key={index} className="editor-page">
            <span className="editor-page-number">Page {index + 1}</span>
          </div>
        ))}
      </div>
      <div className="editor-content-layer">
        <EditorContent editor={editor} aria-label="Document editing area" />
      </div>
    </article>
  );
};

export default EditorCanvas;
