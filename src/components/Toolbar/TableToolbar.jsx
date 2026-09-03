import { useEditorContext } from "../../context/EditorContext";
import useEditorState from "../../hooks/useEditorState";
import {
  Columns2,
  Rows3,
  Trash2,
  ArrowLeftFromLine,
  ArrowRightFromLine,
  ArrowUpFromLine,
  ArrowDownFromLine,
  Merge,
  TableProperties,
} from "lucide-react";
import Divider from "../UI/Divider";

const TableToolbar = () => {
  const { editor } = useEditorContext();
  const editorState = useEditorState(editor);

  // Only show when cursor is inside a table
  if (!editorState?.isInTable) return null;
  if (!editor) return null;

  const btn = (label, icon, onClick, ariaLabel) => {
    const Icon = icon;
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel || label}
        title={label}
        className="
          flex items-center gap-1.5
          px-2 h-7 rounded-md
          text-xs text-text-primary
          hover:bg-accent-secondary hover:text-accent-primary
          transition-all duration-100
          shrink-0
        "
      >
        <Icon size={13} aria-hidden="true" />
        <span className="hidden sm:block">{label}</span>
      </button>
    );
  };

  return (
    <div
      className="
        w-full flex items-center gap-1 px-3 py-1
        bg-accent-secondary
        border-b border-border-toolbar
        overflow-x-auto contextual-toolbar
      "
      role="toolbar"
      aria-label="Table editing tools"
    >
      <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mr-2 shrink-0">
        Table
      </span>

      <Divider />

      {btn(
        "Add col before",
        ArrowLeftFromLine,
        () => editor.chain().focus().addColumnBefore().run(),
        "Add column before current column",
      )}
      {btn(
        "Add col after",
        ArrowRightFromLine,
        () => editor.chain().focus().addColumnAfter().run(),
        "Add column after current column",
      )}
      {btn(
        "Delete col",
        Columns2,
        () => editor.chain().focus().deleteColumn().run(),
        "Delete current column",
      )}

      <Divider />

      {btn(
        "Add row above",
        ArrowUpFromLine,
        () => editor.chain().focus().addRowBefore().run(),
        "Add row above current row",
      )}
      {btn(
        "Add row below",
        ArrowDownFromLine,
        () => editor.chain().focus().addRowAfter().run(),
        "Add row below current row",
      )}
      {btn(
        "Delete row",
        Rows3,
        () => editor.chain().focus().deleteRow().run(),
        "Delete current row",
      )}

      <Divider />

      {btn(
        "Merge cells",
        Merge,
        () => editor.chain().focus().mergeOrSplit().run(),
        "Merge selected cells or split current cell",
      )}

      <Divider />

      {btn(
        "Header row",
        TableProperties,
        () => editor.chain().focus().toggleHeaderRow().run(),
        "Toggle header row",
      )}

      <Divider />

      {btn(
        "Delete table",
        Trash2,
        () => {
          if (window.confirm("Delete this table?")) {
            editor.chain().focus().deleteTable().run();
          }
        },
        "Delete entire table",
      )}
    </div>
  );
};

export default TableToolbar;
