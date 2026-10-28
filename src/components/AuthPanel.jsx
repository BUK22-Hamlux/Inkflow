import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { login, register } from "../lib/api";

const AuthPanel = ({ onAuthenticated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegistering = mode === "register";

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const authenticate = isRegistering ? register : login;
      const result = await authenticate({ name, email, password });
      onAuthenticated(result);
      setIsOpen(false);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed right-5 top-5 z-40 rounded-lg border border-border-input bg-editor px-4 py-2 text-sm font-medium text-text-primary shadow-sm hover:bg-accent-secondary"
      >
        Sign in
      </button>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-overlay p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            className="w-full max-w-md rounded-xl border border-border-toolbar bg-modal p-6 shadow-modal"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 id="auth-modal-title" className="text-lg font-semibold text-text-primary">
                {isRegistering ? "Create your account" : "Sign in to InkFlow"}
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="toolbar-btn"
                aria-label="Close sign in dialog"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {isRegistering && (
                <label className="flex flex-col gap-1 text-sm text-text-secondary">
                  Name (optional)
                  <input
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="rounded-lg border border-border-input bg-editor px-3 py-2 text-text-primary"
                  />
                </label>
              )}
              <label className="flex flex-col gap-1 text-sm text-text-secondary">
                Email
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="rounded-lg border border-border-input bg-editor px-3 py-2 text-text-primary"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-text-secondary">
                Password
                <input
                  type="password"
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                  minLength={isRegistering ? 8 : undefined}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="rounded-lg border border-border-input bg-editor px-3 py-2 text-text-primary"
                />
              </label>
              {error && <p className="text-sm text-danger" role="alert">{error}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 rounded-lg bg-accent-primary px-4 py-2.5 text-sm font-medium text-text-on-accent disabled:opacity-60"
              >
                {isSubmitting ? "Please wait..." : isRegistering ? "Create account" : "Sign in"}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-text-secondary">
              {isRegistering ? "Already have an account?" : "New to InkFlow?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMode(isRegistering ? "login" : "register");
                }}
                className="font-medium text-accent-primary hover:underline"
              >
                {isRegistering ? "Sign in" : "Create an account"}
              </button>
            </p>
          </section>
        </div>
      )}
    </>
  );
};

export default AuthPanel;
