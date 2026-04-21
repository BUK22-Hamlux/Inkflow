import { Clock, FileX } from "lucide-react";
import SkeletonCard from "../components/UI/SkeletonCard";
import DocumentCard from "../components/UI/DocumentCard";

const RecentDocumentsSection = ({
  isLoadingDocs,
  documents,
  handleOpenDocument,
  handleDeleteDocument,
}) => {
  return (
    <section className="w-full max-w-lg" aria-labelledby="recent-docs-heading">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={14} className="text-text-secondary" aria-hidden="true" />
        <h2
          id="recent-docs-heading"
          className="text-xs font-semibold text-text-secondary uppercase tracking-widest"
        >
          Recent Documents
        </h2>
      </div>

      {/* Loading skeletons */}
      {isLoadingDocs && (
        <ul
          className="space-y-2"
          aria-label="Loading recent documents"
          aria-busy="true"
        >
          {[1, 2, 3].map((n) => (
            <SkeletonCard key={n} />
          ))}
        </ul>
      )}

      {!isLoadingDocs && documents.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-12 px-6 border border-border-toolbar rounded-2xl bg-editor text-center"
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
      )}

      {/* Document list */}
      {!isLoadingDocs && documents.length > 0 && (
        <ul
          className="space-y-2"
          aria-label={`${documents.length} recent document${documents.length === 1 ? "" : "s"}`}
          role="list"
        >
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onOpen={handleOpenDocument}
              onDelete={handleDeleteDocument}
            />
          ))}
        </ul>
      )}
    </section>
  );
};

export default RecentDocumentsSection;
