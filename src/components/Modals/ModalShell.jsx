import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const ModalShell = ({ title, onClose, children, width = "max-w-xl" }) => {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/40 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full ${width} max-h-[90dvh] overflow-hidden rounded-lg border border-border-toolbar bg-modal text-text-primary shadow-modal`}
      >
        <header className="flex items-center justify-between border-b border-border-toolbar px-4 py-3">
          <h2 className="text-base font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="flex h-8 w-8 items-center justify-center rounded hover:bg-accent-secondary">
            <X size={18} />
          </button>
        </header>
        <div className="max-h-[calc(90dvh-56px)] overflow-y-auto p-4">{children}</div>
      </section>
    </div>,
    document.body,
  );
};

export default ModalShell;
