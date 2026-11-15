import { useState } from "react";
import { FileText, FileType, LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";
import { exportDocument } from "../../utils/exportDocument";
import ModalShell from "./ModalShell";

const ExportModal = ({ editor, title, pageSettings, onClose }) => {
  const [exporting, setExporting] = useState("");

  const handleExport = async (format) => {
    setExporting(format);
    try {
      await exportDocument({ editor, title, pageSettings, format });
      toast.success(`Downloaded ${format.toUpperCase()} document.`);
      onClose();
    } catch (error) {
      console.error("Document export failed:", error);
      toast.error(error.message || "The document could not be exported.");
    } finally {
      setExporting("");
    }
  };

  return (
    <ModalShell title="Export document" onClose={onClose} width="max-w-md">
      <p className="mb-4 text-sm text-text-secondary">Choose a file format to download.</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button type="button" disabled={Boolean(exporting)} onClick={() => handleExport("pdf")} className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-md border border-border-input p-3 text-sm hover:bg-accent-secondary disabled:opacity-50">
          {exporting === "pdf" ? <LoaderCircle className="animate-spin" size={20} /> : <FileType size={20} />}
          Download PDF
        </button>
        <button type="button" disabled={Boolean(exporting)} onClick={() => handleExport("docx")} className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-md border border-border-input p-3 text-sm hover:bg-accent-secondary disabled:opacity-50">
          {exporting === "docx" ? <LoaderCircle className="animate-spin" size={20} /> : <FileText size={20} />}
          Download Word document
        </button>
      </div>
    </ModalShell>
  );
};

export default ExportModal;
