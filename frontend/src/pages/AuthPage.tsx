import {
  type FormEvent,
  useState,
} from "react";

import axios from "axios";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../features/auth";


type Mode = "login" | "register";

function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: { message?: string } }
      | undefined;
    return data?.error?.message ?? "The request could not be completed.";
  }
  return "The request could not be completed.";
}

export function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("register");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "register") {
        await register({
          full_name: fullName.trim(),
          email: email.trim(),
          password,
        });
        navigate("/onboarding", { replace: true });
      } else {
        await login({ email: email.trim(), password });
      }
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setError(null);
    setPassword("");
  }

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="auth-brand-lockup">
          <span className="auth-brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <strong>AI Prompt Studio</strong>
        </div>

        <div className="auth-brand-copy">
          <span>Build · Test · Compare</span>
          <h1>Better prompts start with a better workspace.</h1>
          <p>
            Keep prompts, regression history, and your own model
            credentials together in one focused workspace.
          </p>
        </div>

        <div className="auth-privacy-card">
          <strong>Your provider keys stay yours.</strong>
          <p>
            BYOK credentials are encrypted server-side and scoped to
            the active workspace.
          </p>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-mode-tabs" role="tablist">
            <button
              type="button"
              className={mode === "register" ? "is-active" : ""}
              onClick={() => changeMode("register")}
            >
              Create account
            </button>
            <button
              type="button"
              className={mode === "login" ? "is-active" : ""}
              onClick={() => changeMode("login")}
            >
              Sign in
            </button>
          </div>

          <header>
            <span className="page-eyebrow">
              {mode === "register" ? "Start your workspace" : "Welcome back"}
            </span>
            <h2>
              {mode === "register"
                ? "Create your Prompt Studio account"
                : "Sign in to Prompt Studio"}
            </h2>
            <p>
              {mode === "register"
                ? "Your private workspace is created automatically. We’ll guide you through connecting a model and running your first prompt."
                : "Continue where you left off."}
            </p>
          </header>

          <form onSubmit={handleSubmit}>
            {mode === "register" && (
              <label>
                <span>Name</span>
                <input
                  type="text"
                  value={fullName}
                  autoComplete="name"
                  minLength={2}
                  maxLength={120}
                  required
                  placeholder="Your name"
                  onChange={(event) => setFullName(event.target.value)}
                />
              </label>
            )}

            <label>
              <span>Email</span>
              <input
                type="email"
                value={email}
                autoComplete="email"
                required
                placeholder="you@example.com"
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label>
              <span>Password</span>
              <input
                type="password"
                value={password}
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
                minLength={mode === "register" ? 10 : 1}
                required
                placeholder={
                  mode === "register"
                    ? "At least 10 characters"
                    : "Your password"
                }
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {error && <div className="auth-error">{error}</div>}

            <button
              type="submit"
              className="auth-submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Please wait..."
                : mode === "register"
                  ? "Create workspace"
                  : "Sign in"}
            </button>
          </form>

          <p className="auth-form-footnote">
            Session tokens are stored in an HttpOnly cookie and can be
            revoked server-side.
          </p>
        </div>
      </section>
    </main>
  );
}
