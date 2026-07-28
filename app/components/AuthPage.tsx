"use client";

import {
  useState,
  type FormEvent,
} from "react";

import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { Navbar } from "./Navbar";

import {
  isSupabaseConfigured,
  sendMagicLink,
} from "../lib/supabaseClient";

type AuthPageProps = {
  mode: "login" | "register";
};

type MessageState = {
  type: "success" | "error";
  text: string;
} | null;

export function AuthPage({
  mode,
}: AuthPageProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] =
    useState<MessageState>(null);
  const [busy, setBusy] = useState(false);

  const title =
    mode === "login"
      ? "Login to MaizeGuard"
      : "Create MaizeGuard access";

  const description =
    mode === "login"
      ? "Use your email to return to your saved maize screening history."
      : "Create passwordless access so each assessment can be saved under your account.";

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail) {
      setMessage({
        type: "error",
        text: "Enter your email address first.",
      });

      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      const configured =
        isSupabaseConfigured();

      if (!configured) {
        throw new Error(
          "Supabase environment variables were not loaded. Check .env.local and restart Next.js."
        );
      }

      await sendMagicLink(
        cleanEmail,
        mode === "register"
      );

      setMessage({
        type: "success",
        text:
          mode === "login"
            ? "Magic link sent. Check your email to log in."
            : "Registration link sent. Check your email to create your access.",
      });
    } catch (error) {
      console.error(
        "Magic-link submission failed:",
        error
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unknown authentication error occurred.";

      setMessage({
        type: "error",
        text: `Could not send magic link: ${errorMessage}`,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8f4] text-ink">
      <Navbar darkText />

      <section className="grid min-h-screen grid-cols-1 pt-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden overflow-hidden bg-black lg:block">
          <img
            src="/farmers-maize-harvest-background.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,8,0.25),rgba(5,10,8,0.9))]" />

          <div className="relative z-10 flex h-full flex-col justify-end p-12 text-white">
            <h1 className="mt-5 max-w-lg font-display text-5xl font-semibold leading-tight">
              Keep every maize screening
              result connected to the right
              user.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-white/80">
              MaizeGuard stores result
              summaries only: class, risk,
              confidence, action, file name,
              and image dimensions. Raw
              uploaded images are not saved.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center px-5 py-12 md:px-8">
          <div className="w-full max-w-xl">
            <a
              href="/"
              className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-primary transition hover:text-[#2d7447]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to maize screening
            </a>

            <div className="rounded-[1.75rem] border border-border bg-white p-6 shadow-xl shadow-black/[0.04] md:p-8">
              <div>
                <h1 className="font-display text-4xl font-semibold leading-tight text-ink">
                  {title}
                </h1>

                <p className="mt-3 text-sm leading-6 text-ink-soft">
                  {description}
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-8"
              >
                <label className="block">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">
                    Email address
                  </span>

                  <input
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    placeholder="name@example.com"
                    className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-primary"
                  />
                </label>

                <button
                  type="submit"
                  disabled={busy}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#2d7447] disabled:cursor-not-allowed disabled:bg-ink-soft"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}

                  {busy
                    ? "Sending..."
                    : "Send magic link"}
                </button>
              </form>

              {message ? (
                <div
                  aria-live="polite"
                  className={
                    message.type === "success"
                      ? "mt-4 rounded-2xl border border-success/20 bg-success/5 px-4 py-3 text-sm leading-6 text-success"
                      : "mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                  }
                >
                  {message.text}
                </div>
              ) : null}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-success/20 bg-success/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-success">
                    <ShieldCheck className="h-4 w-4" />
                    No password storage
                  </div>

                  <p className="mt-1 text-xs leading-5 text-ink-soft">
                    Supabase sends a secure
                    email link instead of
                    storing app passwords.
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-surface-2 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Result history
                  </div>

                  <p className="mt-1 text-xs leading-5 text-ink-soft">
                    Saved summaries keep each
                    screening result connected
                    to the signed-in user.
                  </p>
                </div>
              </div>

              <p className="mt-6 text-center text-sm text-ink-soft">
                {mode === "login"
                  ? "Need access?"
                  : "Already have access?"}{" "}
                <a
                  href={
                    mode === "login"
                      ? "/register"
                      : "/login"
                  }
                  className="font-bold text-primary"
                >
                  {mode === "login"
                    ? "Register"
                    : "Login"}
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}