import { Upload, FileText } from "lucide-react";

const DragAndDropSection = ({
  isDraggingOver,
  handleOpenFileClick,
  fileInputRef,
  handleFileInputChange,
}) => {
  return (
    <section className="w-full max-w-lg mb-8" aria-label="File drop zone">
      <div
        className={`
              w-full rounded-2xl py-14 px-8
              flex flex-col items-center justify-center text-center
              cursor-pointer transition-all duration-200 group
              ${
                isDraggingOver
                  ? "border-2 border-solid border-accent-primary bg-accent-secondary scale-[1.02]"
                  : "border-2 border-dashed border-border-input bg-editor hover:border-accent-primary hover:bg-accent-secondary"
              }
            `}
        role="button"
        aria-label="Drag and drop a .docx or .txt file here, or click to browse files"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleOpenFileClick();
        }}
        onClick={handleOpenFileClick}
      >
        <div
          className={`
                w-16 h-16 rounded-full flex items-center justify-center mb-5 transition-all duration-200
                ${
                  isDraggingOver
                    ? "bg-accent-primary scale-110"
                    : "bg-accent-secondary group-hover:bg-accent-primary group-hover:scale-110"
                }
              `}
          aria-hidden="true"
        >
          <Upload
            size={28}
            className={`transition-all duration-200 ${isDraggingOver ? "text-text-on-accent" : "text-accent-primary group-hover:text-text-on-accent"}`}
            strokeWidth={1.8}
          />
        </div>

        <p className="text-base font-semibold text-text-primary mb-1">
          {isDraggingOver
            ? "Drop your file here"
            : "Drag and drop your file here"}
        </p>
        <p className="text-sm text-text-muted mb-4">
          {isDraggingOver
            ? "Release to open"
            : "or click anywhere in this box to browse"}
        </p>

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-input bg-app"
          aria-label="Supported file formats: .docx and .txt"
        >
          <FileText size={13} className="text-text-muted" aria-hidden="true" />
          <span className="text-xs text-text-muted font-medium">
            .docx and .txt supported
          </span>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.txt"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleFileInputChange}
      />
    </section>
  );
};

export default DragAndDropSection;
