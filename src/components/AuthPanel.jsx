import { useState } from "react";
import { login, register, saveToken } from "../lib/api";

const AuthPanel = ({ onAuthenticated }) => {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegistering = mode === "register";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const authenticate = isRegistering ? register : login;
      const result = await authenticate({ name, email, password });
      saveToken(result.token);
      await onAuthenticated();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <details className="w-full max-w-lg mb-8">
      <summary className="cursor-pointer text-center text-sm font-medium text-accent-primary">
        Sign in or create an account
      </summary>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
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
          className="rounded-lg bg-accent-primary px-4 py-2 text-sm font-medium text-text-on-accent disabled:opacity-60"
        >
          {isSubmitting ? "Please wait..." : isRegistering ? "Create account" : "Sign in"}
        </button>
        <button
          type="button"
          onClick={() => {
            setError("");
            setMode(isRegistering ? "login" : "register");
          }}
          className="text-sm text-accent-primary"
        >
          {isRegistering ? "Have an account? Sign in" : "Create an account"}
        </button>
      </form>
    </details>
  );
};

export default AuthPanel;
