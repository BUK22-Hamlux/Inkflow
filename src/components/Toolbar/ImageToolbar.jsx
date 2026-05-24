import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ImageUp,
  Pencil,
  Trash2,
} from "lucide-react";
import { useEditorContext } from "../../context/EditorContext";
import useEditorState from "../../hooks/useEditorState";
import useImageActions from "../../hooks/useImageActions";
import Divider from "../UI/Divider";

const ImageToolbar = () => {
  const { editor } = useEditorContext();
  const editorState = useEditorState(editor);
  const imageActions = useImageActions(editor);

  if (!editor || !editorState?.isImage) return null;

  const currentAlign = editorState.imageAttrs?.align ?? "left";

  const btn = (label, icon, onClick, isActive = false) => {
    const Icon = icon;
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-pressed={isActive}
        title={label}
        className={`
          flex items-center gap-1.5
          px-2 h-7 rounded-md
          text-xs
          transition-all duration-100
          shrink-0
          ${
            isActive
              ? "bg-accent-primary text-text-on-accent"
              : "text-text-primary hover:bg-accent-secondary hover:text-accent-primary"
          }
        `}
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
        overflow-x-auto
      "
      role="toolbar"
      aria-label="Image editing tools"
    >
      <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mr-2 shrink-0">
        Image
      </span>

      <Divider />

      {btn(
        "Align left",
        AlignLeft,
        () => imageActions.alignSelectedImage("left"),
        currentAlign === "left",
      )}
      {btn(
        "Align center",
        AlignCenter,
        () => imageActions.alignSelectedImage("center"),
        currentAlign === "center",
      )}
      {btn(
        "Align right",
        AlignRight,
        () => imageActions.alignSelectedImage("right"),
        currentAlign === "right",
      )}

      <Divider />

      {btn("Details", Pencil, imageActions.updateSelectedImageDetails)}
      {btn("Replace URL", ImageUp, imageActions.replaceSelectedImage)}

      <Divider />

      {btn("Delete image", Trash2, imageActions.deleteSelectedImage)}
    </div>
  );
};

export default ImageToolbar;
