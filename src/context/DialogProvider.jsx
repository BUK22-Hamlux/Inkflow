import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import DialogContext from "./dialogContext";

const DEFAULT_DIALOG = {
  type: "prompt",
  title: "",
  description: "",
  confirmLabel: "OK",
  cancelLabel: "Cancel",
  variant: "default",
  fields: [],
};

const Dialog = ({ dialog, onCancel, onConfirm }) => {
  const [values, setValues] = useState(() =>
    Object.fromEntries(
      (dialog.fields ?? []).map((field) => [field.name, field.value ?? ""]),
    ),
  );

  const firstField = dialog.fields?.[0];
  const isDanger = dialog.variant === "danger";

  const handleSubmit = (event) => {
    event.preventDefault();
    onConfirm(values);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-[var(--overlay-bg)]"
        onClick={onCancel}
        aria-hidden="true"
      />

      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-dialog-title"
        aria-describedby={dialog.description ? "app-dialog-description" : undefined}
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-lg bg-modal shadow-modal border border-border-toolbar overflow-hidden"
      >
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border-toolbar">
          <div>
            <h2
              id="app-dialog-title"
              className="text-sm font-semibold text-text-primary"
            >
              {dialog.title}
            </h2>
            {dialog.description && (
              <p
                id="app-dialog-description"
                className="mt-1 text-xs leading-5 text-text-secondary"
              >
                {dialog.description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Close dialog"
            className="toolbar-btn shrink-0"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {dialog.fields?.length > 0 && (
          <div className="px-5 py-4 space-y-3">
            {dialog.fields.map((field) => (
              <label key={field.name} className="block">
                <span className="block mb-1.5 text-xs font-medium text-text-secondary">
                  {field.label}
                </span>
                {field.type === "textarea" ? (
                  <textarea
                    autoFocus={field.name === firstField?.name}
                    value={values[field.name] ?? ""}
                    placeholder={field.placeholder}
                    rows={field.rows ?? 3}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        [field.name]: event.target.value,
                      }))
                    }
                    className="w-full min-h-20 rounded-md border border-border-input bg-editor px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                  />
                ) : (
                  <input
                    autoFocus={field.name === firstField?.name}
                    type={field.type ?? "text"}
                    value={values[field.name] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        [field.name]: event.target.value,
                      }))
                    }
                    className="w-full h-9 rounded-md border border-border-input bg-editor px-3 text-sm text-text-primary outline-none focus:border-accent-primary"
                  />
                )}
              </label>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 px-5 py-4 bg-accent-secondary/40 border-t border-border-toolbar">
          <button
            type="button"
            onClick={onCancel}
            className="h-8 px-3 rounded-md text-xs font-medium text-text-secondary hover:bg-modal hover:text-text-primary"
          >
            {dialog.cancelLabel}
          </button>
          <button
            type="submit"
            className={`h-8 px-3 rounded-md text-xs font-semibold text-text-on-accent ${
              isDanger
                ? "bg-danger hover:opacity-90"
                : "bg-accent-primary hover:bg-accent-primary-hover"
            }`}
          >
            {dialog.confirmLabel}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
};

export const DialogProvider = ({ children }) => {
  const [dialog, setDialog] = useState(null);
  const resolverRef = useRef(null);

  const openDialog = useCallback((options) => {
    setDialog({ ...DEFAULT_DIALOG, ...options });

    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const closeDialog = useCallback((value) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setDialog(null);
  }, []);

  const prompt = useCallback(
    (options) => openDialog({ type: "prompt", ...options }),
    [openDialog],
  );

  const confirm = useCallback(
    (options) => openDialog({ type: "confirm", ...options, fields: [] }),
    [openDialog],
  );

  return (
    <DialogContext.Provider value={{ prompt, confirm }}>
      {children}
      {dialog && (
        <Dialog
          dialog={dialog}
          onCancel={() => closeDialog(null)}
          onConfirm={(values) => closeDialog(values)}
        />
      )}
    </DialogContext.Provider>
  );
};
