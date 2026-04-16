import { useState } from "react";
import { FileEdit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { deleteDocument } from "../../utils/localStorage";
import formatDate from "../../helper/FormatDate";

const DocumentCard = ({ doc, onOpen, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    setIsDeleting(true);

    const success = deleteDocument(doc.id);

    if (success) {
      toast.success(`"${doc.title}" deleted`, {
        duration: 3000,
        position: "bottom-right",
        style: {
          background: "var(--bg-modal)",
          color: "var(--text-primary)",
          border: "1px solid var(--status-success)",
          borderLeft: "4px solid var(--status-success)",
          borderRadius: "10px",
          fontSize: "13px",
        },
      });
      onDelete(doc.id);
    } else {
      setIsDeleting(false);
      toast.error("Could not delete document. Please try again.", {
        duration: 3000,
        position: "bottom-right",
        style: {
          background: "var(--bg-modal)",
          color: "var(--text-primary)",
          border: "1px solid var(--status-danger)",
          borderLeft: "4px solid var(--status-danger)",
          borderRadius: "10px",
          fontSize: "13px",
        },
      });
    }
  };

  if (isDeleting) return null;

  return (
    <li>
      <div
        onClick={() => onOpen(doc)}
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen(doc);
          }
        }}
        className="w-full bg-editor border border-border-toolbar rounded-2xl p-4 flex items-center gap-4 cursor-pointer group"
        aria-label={`Open document: ${doc.title}. Last edited ${formatDate(doc.lastEditedAt)}. ${doc.wordCount ?? 0} words.`}
      >
        {/* Document icon */}
        <div
          className="
            w-10 h-10 rounded-xl bg-accent-secondary
            flex items-center justify-center shrink-0
            group-hover:bg-accent-primary transition-all duration-150
          "
          aria-hidden="true"
        >
          <FileEdit
            size={18}
            className="text-accent-primary group-hover:text-text-on-accent transition-all duration-150"
            strokeWidth={1.8}
          />
        </div>

        {/* Document info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate mb-0.5">
            {doc.title || "Untitled Document"}
          </p>
          <p className="text-xs text-text-muted truncate leading-relaxed">
            {doc.preview ? doc.preview : "No preview available"}
          </p>
        </div>

        {/* Meta info + delete */}
        <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
          <span className="text-xs text-text-muted whitespace-nowrap">
            {formatDate(doc.lastEditedAt)}
          </span>
          <span className="text-xs text-text-muted whitespace-nowrap">
            {(doc.wordCount ?? 0).toLocaleString()} words
          </span>

          {/* Delete button */}
          <button
            onClick={handleDelete}
            className="
              mt-1 w-6 h-6 rounded-md
              flex items-center justify-center
              text-text-muted hover:text-status-danger
              hover:bg-status-danger-bg
              transition-all duration-150
              opacity-0 group-hover:opacity-100
            "
            aria-label={`Delete document: ${doc.title}`}
            title={`Delete "${doc.title}"`}
          >
            <Trash2 size={13} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </div>
    </li>
  );
};

export default DocumentCard;
