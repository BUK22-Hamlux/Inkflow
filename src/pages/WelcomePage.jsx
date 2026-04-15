import { useEditorContext } from "../context/EditorContext";
import { FileText, Plus, FolderOpen, Upload, Clock, FileX } from "lucide-react";
import { useRef } from "react";
import { Toaster } from "react-hot-toast";
import useDropZone from "../hooks/useDropZone";
import inkflow_logo from "../assets/inkflow_logo.png";

const WelcomePage = () => {
  const { openNewDocument, openExistingDocument } = useEditorContext();
  const fileInputRef = useRef(null);

  const handleOpenFileClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileDrop = (html, fileName) => {
    const docName = fileName.replace(/\.(docx|txt)$/i, "");
    openExistingDocument({
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: docName,
      content: html,
      isHtml: true,
    });
  };

  const {
    isDraggingOver,
    isProcessing,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInputChange,
  } = useDropZone({
    enabled: true,
    onFileDrop: handleFileDrop,
  });

  return (
    <>
      <div
        className={`
          min-h-screen flex flex-col items-center justify-center
          px-4 py-12 transition-all duration-200
          ${isDraggingOver ? "bg-accent-secondary" : "bg-app"}
        `}
        role="main"
        aria-label="InkFlow welcome screen"
        aria-busy={isProcessing}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDraggingOver && (
          <div
            className="
              fixed inset-0 z-50
              border-4 border-dashed border-accent-primary
              bg-accent-secondary/60
              flex flex-col items-center justify-center
              pointer-events-none
            "
            role="status"
            aria-live="polite"
            aria-label="Release to open file"
          >
            <div
              className="
              w-24 h-24 rounded-full bg-accent-primary
              flex items-center justify-center mb-6
              animate-bounce
            "
            >
              <Upload
                size={40}
                className="text-text-on-accent"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </div>
            <p className="text-2xl font-bold text-accent-primary">
              Release to open file
            </p>
            <p className="text-sm text-text-secondary mt-2">
              .docx and .txt files supported
            </p>
          </div>
        )}

        {isProcessing && (
          <div
            className="
              fixed inset-0 z-50
              bg-overlay
              flex flex-col items-center justify-center
            "
            role="status"
            aria-live="polite"
            aria-label="Opening your file, please wait"
          >
            <div
              className="
              w-16 h-16 rounded-2xl bg-editor
              flex items-center justify-center mb-4
              shadow-modal
            "
            >
              <div
                className="w-8 h-8 border-4 border-accent-secondary border-t-accent-primary rounded-full animate-spin"
                aria-hidden="true"
              />
            </div>
            <p className="text-sm font-medium text-text-primary">
              Opening your file...
            </p>
          </div>
        )}
        <header className="flex flex-col items-center text-center mb-10">
          <div className="mb-4 w-12 h-auto flex items-center">
            <img src={inkflow_logo} alt="inkflow_logo" />
          </div>

          <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-3">
            InkFlow
          </h1>

          <p className="text-base text-text-secondary max-w-sm leading-relaxed">
            A clean, focused writing experience. Create something great today.
          </p>
        </header>

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
            aria-label="Drag and drop a .docx or .txt file here to open it"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleOpenFileClick();
            }}
            onClick={handleOpenFileClick}
          >
            <div
              className={`
                w-16 h-16 rounded-full flex items-center justify-center mb-5
                transition-all duration-200
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
                className={`
                  transition-all duration-200
                  ${
                    isDraggingOver
                      ? "text-text-on-accent"
                      : "text-accent-primary group-hover:text-text-on-accent"
                  }
                `}
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
              <FileText
                size={13}
                className="text-text-muted"
                aria-hidden="true"
              />
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

        <div
          className="flex items-center gap-4 w-full max-w-lg mb-8"
          role="separator"
          aria-hidden="true"
        >
          <div className="flex-1 h-px bg-border-toolbar" />
          <span className="text-xs text-text-muted font-medium tracking-widest">
            OR
          </span>
          <div className="flex-1 h-px bg-border-toolbar" />
        </div>

        <div
          className="flex flex-col sm:flex-row gap-3 w-full max-w-lg mb-14"
          role="group"
          aria-label="Document actions"
        >
          <button
            onClick={openNewDocument}
            className="
            flex-1 flex items-center justify-center gap-2
            px-6 py-3.5
            bg-accent-primary hover:bg-accent-primary-hover
            text-text-on-accent
            rounded-xl font-semibold text-sm
            transition-all duration-150 active:scale-95
            shadow-sm cursor-pointer
          "
            aria-label="Create a new blank document"
          >
            <Plus size={18} strokeWidth={2.5} aria-hidden="true" />
            New Document
          </button>

          <button
            onClick={handleOpenFileClick}
            className="
            flex-1 flex items-center justify-center gap-2
            px-6 py-3.5
            bg-transparent hover:bg-accent-secondary
            text-text-primary
            border border-border-input
            rounded-xl font-semibold text-sm
            transition-all duration-150 active:scale-95
            shadow-sm cursor-pointer
          "
            aria-label="Open an existing .docx or .txt file from your computer"
          >
            <FolderOpen size={18} strokeWidth={2} aria-hidden="true" />
            Open File
          </button>
        </div>

        <section
          className="w-full max-w-lg"
          aria-labelledby="recent-docs-heading"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock
              size={14}
              className="text-text-secondary"
              aria-hidden="true"
            />
            <h2
              id="recent-docs-heading"
              className="text-xs font-semibold text-text-secondary uppercase tracking-widest"
            >
              Recent Documents
            </h2>
          </div>

          <div
            className="
            flex flex-col items-center justify-center
            py-12 px-6
            border border-border-toolbar
            rounded-2xl bg-editor
            text-center
          "
            role="status"
            aria-label="No recent documents found"
          >
            <div
              className="w-12 h-12 rounded-full bg-accent-secondary flex items-center justify-center mb-4"
              aria-hidden="true"
            >
              <FileX
                size={22}
                className="text-accent-primary"
                strokeWidth={1.8}
              />
            </div>

            <p className="text-sm font-medium text-text-primary mb-1">
              No recent documents yet
            </p>
            <p className="text-xs text-text-muted leading-relaxed max-w-xs">
              Documents you create or open will appear here so you can pick up
              right where you left off.
            </p>
          </div>
        </section>

        <footer className="mt-12 text-center">
          <p className="text-xs text-text-muted">
            Your documents are saved locally in your browser.{" "}
            <span className="text-accent-primary font-medium">
              No account needed.
            </span>
          </p>
        </footer>
      </div>
    </>
  );
};

export default WelcomePage;
