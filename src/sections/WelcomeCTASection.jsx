import { Plus, FolderOpen } from "lucide-react";

const WelcomeCTASection = ({ openNewDocument, handleOpenFileClick }) => {
  return (
    <div
      className="flex flex-col sm:flex-row gap-3 w-full max-w-lg mb-14"
      role="group"
      aria-label="Document actions"
    >
      <button
        onClick={openNewDocument}
        className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-accent-primary hover:bg-accent-primary-hover text-text-on-accent rounded-xl font-semibold text-sm transition-all duration-150 active:scale-95 shadow-sm cursor-pointer"
        aria-label="Create a new blank document"
      >
        <Plus size={18} strokeWidth={2.5} aria-hidden="true" />
        New Document
      </button>

      <button
        onClick={handleOpenFileClick}
        className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent hover:bg-accent-secondary text-text-primary border border-border-input rounded-xl font-semibold text-sm transition-all duration-150 active:scale-95 shadow-sm cursor-pointer"
        aria-label="Open an existing .docx or .txt file from your computer"
      >
        <FolderOpen size={18} strokeWidth={2} aria-hidden="true" />
        Open File
      </button>
    </div>
  );
};

export default WelcomeCTASection;
