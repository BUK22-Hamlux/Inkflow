import { useRef, useState, useEffect } from "react";
import { useEditorContext } from "../context/EditorContext";
import { Upload } from "lucide-react";
import { Toaster } from "react-hot-toast";
import useDropZone from "../hooks/useDropZone";
import {
  getAllDocuments,
  generateDocId,
  saveDocument,
} from "../utils/localStorage";
import WelcomeHeader from "../sections/WelcomeHeader";
import DragAndDropSection from "../sections/DragAndDropSection";
import RecentDocumentsSection from "../sections/RecentDocumentsSection";
import WelcomeCTASection from "../sections/WelcomeCTASection";

const WelcomePage = () => {
  const { openNewDocument, openExistingDocument } = useEditorContext();
  const fileInputRef = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  useEffect(() => {
    const loadDocuments = () => {
      const allDocs = getAllDocuments();
      const sorted = [...allDocs].sort(
        (a, b) => new Date(b.lastEditedAt) - new Date(a.lastEditedAt),
      );
      setDocuments(sorted);
      setIsLoadingDocs(false);
    };

    loadDocuments();
  }, []);

  const handleOpenFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileDrop = (html, fileName) => {
    const docTitle = fileName.replace(/\.(docx|txt)$/i, "");
    const id = generateDocId();

    const newDoc = {
      id,
      title: docTitle,
      content: html,
      isHtml: true,
      wordCount: html
        .replace(/<[^>]*>/g, "")
        .split(/\s+/)
        .filter(Boolean).length,
      preview: html.replace(/<[^>]*>/g, "").slice(0, 120),
      createdAt: new Date().toISOString(),
      lastEditedAt: new Date().toISOString(),
    };

    saveDocument(newDoc);
    openExistingDocument(newDoc);
  };

  const handleOpenDocument = (doc) => {
    openExistingDocument(doc);
  };

  const handleDeleteDocument = (deletedId) => {
    setDocuments((prev) => prev.filter((d) => d.id !== deletedId));
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
      <Toaster />

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
            className="fixed inset-0 z-50 border-4 border-dashed border-accent-primary bg-accent-secondary/60 flex flex-col items-center justify-center pointer-events-none"
            role="status"
            aria-live="polite"
            aria-label="Release to open file"
          >
            <div className="w-24 h-24 rounded-full bg-accent-primary flex items-center justify-center mb-6 animate-bounce">
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
          </div>
        )}

        {isProcessing && (
          <div
            className="fixed inset-0 z-50 bg-overlay flex flex-col items-center justify-center"
            role="status"
            aria-live="polite"
            aria-label="Opening your file, please wait"
          >
            <div className="w-16 h-16 rounded-2xl bg-editor flex items-center justify-center mb-4 shadow-modal">
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

        {/* ── Header ─────────────────────────────────────── */}
        <WelcomeHeader />

        {/* ── Drag and Drop Section ─────────────────────────────────────── */}
        <DragAndDropSection
          isDraggingOver={isDraggingOver}
          fileInputRef={fileInputRef}
          handleFileInputChange={handleFileInputChange}
          handleOpenFileClick={handleOpenFileClick}
        />

        {/* ── Divider ─────────────────────────────────────── */}
        <div
          className="flex items-center gap-4 w-full max-w-lg mb-8"
          role="separator"
          aria-hidden="true"
        >
          <div className="flex-1 h-px bg-border-toolbar" />
          <span className="text-xs text-text-muted font-medium uppercase tracking-widest">
            or
          </span>
          <div className="flex-1 h-px bg-border-toolbar" />
        </div>

        {/* ── CTA Buttons ─────────────────────────────────── */}
        <WelcomeCTASection
          openNewDocument={openNewDocument}
          handleOpenFileClick={handleOpenFileClick}
        />

        {/* ── Recent Documents ─────────────────────────────── */}
        <RecentDocumentsSection
          isLoadingDocs={isLoadingDocs}
          documents={documents}
          handleOpenDocument={handleOpenDocument}
          handleDeleteDocument={handleDeleteDocument}
        />

        {/* ── Footer ──────────────────────────────────────── */}
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
