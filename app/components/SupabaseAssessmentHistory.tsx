"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, CloudOff, Database, LogIn, LogOut, ShieldCheck } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import {
  isSupabaseConfigured,
  listenToCurrentUser,
  loadAssessmentHistory,
  saveAssessment,
  signOutOfSupabase,
  type SavedAssessment,
  type SavedAssessmentInput,
} from "../lib/supabaseClient";

type Props = {
  latestAssessment: SavedAssessmentInput | null;
  onHistoryChange?: (items: SavedAssessment[]) => void;
  table?: boolean;
  copy?: Partial<SupabaseHistoryCopy>;
};

export type SupabaseHistoryCopy = {
  userHistory: string;
  savedAssessments: string;
  subtitle: string;
  configuredMessage: string;
  signedInAs: string;
  privacyNote: string;
  signInPrompt: string;
  loginToSave: string;
  signOut: string;
  working: string;
  savedMessage: string;
  missingTableMessage: string;
  loadError: string;
  saveError: string;
  savingMessage: string;
  emptySignedIn: string;
  emptySignedOut: string;
  result: string;
  backendLabel: string;
  risk: string;
  confidence: string;
  action: string;
  file: string;
  time: string;
};

const defaultCopy: SupabaseHistoryCopy = {
  userHistory: "User history",
  savedAssessments: "Saved assessments",
  subtitle: "Supabase keeps user-specific result history after sign-in.",
  configuredMessage:
    "Supabase is optional and is not configured in this environment. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to enable sign-in and saved assessment history.",
  signedInAs: "Signed in as",
  privacyNote:
    "Only the prediction summary and file metadata are saved. Uploaded images are not stored in Supabase by this frontend.",
  signInPrompt: "Sign in on the dedicated login page to save and review assessment history.",
  loginToSave: "Login to save results",
  signOut: "Sign out",
  working: "Working...",
  savedMessage: "Assessment saved to your Supabase history.",
  missingTableMessage:
    "Supabase is connected, but the assessments table is missing. Run supabase/assessments.sql in the Supabase SQL editor.",
  loadError: "Could not load saved assessment history.",
  saveError: "Could not save this assessment. Confirm you are signed in and the Supabase assessments table exists.",
  savingMessage: "Saving assessment history...",
  emptySignedIn: "Analyze a maize image to save the first result.",
  emptySignedOut: "Sign in to view saved results.",
  result: "Result",
  backendLabel: "Backend label",
  risk: "Risk",
  confidence: "Confidence",
  action: "Action",
  file: "File",
  time: "Time",
};

function formatTime(item: SavedAssessment) {
  if (!item.created_at) return "Just now";
  return new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function historyErrorMessage(error: unknown, copy: SupabaseHistoryCopy, mode: "load" | "save" = "load") {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("assessments") || message.includes("PGRST205")) {
    return copy.missingTableMessage;
  }
  if (message.toLowerCase().includes("sign in") || message.toLowerCase().includes("auth")) {
    return copy.saveError;
  }
  return mode === "save" ? copy.saveError : copy.loadError;
}

export function SupabaseAssessmentHistory({ latestAssessment, onHistoryChange, table = false, copy: copyOverride }: Props) {
  const copy = useMemo(() => ({ ...defaultCopy, ...copyOverride }), [copyOverride]);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<SavedAssessment[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const lastSavedKey = useRef<string | null>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let active = true;

    try {
      const ready = isSupabaseConfigured();
      if (!active) return;
      setConfigured(ready);
      if (ready) cleanup = listenToCurrentUser(setUser);
    } catch {
      setConfigured(false);
    }

    return () => {
      active = false;
      cleanup?.();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setItems([]);
      onHistoryChange?.([]);
      return;
    }

    loadAssessmentHistory()
      .then((nextItems) => {
        setItems(nextItems);
        onHistoryChange?.(nextItems);
      })
      .catch((error) => setMessage(historyErrorMessage(error, copy)));
  }, [copy, onHistoryChange, user]);

  useEffect(() => {
    if (!user || !latestAssessment) return;

    const key = [
      latestAssessment.fileName,
      latestAssessment.result.label,
      latestAssessment.result.confidence,
      latestAssessment.result.rawLabel,
    ].join("|");

    if (lastSavedKey.current === key) return;
    lastSavedKey.current = key;

    setBusy(true);
    saveAssessment(latestAssessment)
      .then(() => loadAssessmentHistory())
      .then((nextItems) => {
        setItems(nextItems);
        onHistoryChange?.(nextItems);
      })
      .then(() => setMessage(copy.savedMessage))
      .catch((error) => {
        lastSavedKey.current = null;
        setMessage(historyErrorMessage(error, copy, "save"));
      })
      .finally(() => setBusy(false));
  }, [copy, latestAssessment, onHistoryChange, user]);

  if (configured === false) {
    return (
      <div className="rounded-3xl border border-border bg-white p-6 shadow-sm md:p-7">
        <div className="flex items-center gap-2">
          <CloudOff className="h-5 w-5 text-warning" />
          <h2 className="font-display text-xl font-semibold text-ink">{copy.userHistory}</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-ink-soft">{copy.configuredMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-white p-6 shadow-sm md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">{copy.savedAssessments}</h2>
            <p className="mt-1 text-sm text-ink-soft">{copy.subtitle}</p>
          </div>
        </div>

        {user ? (
          <button
            type="button"
            onClick={() => void signOutOfSupabase()}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 hover:text-primary"
          >
            <LogOut className="h-4 w-4" />
            {copy.signOut}
          </button>
        ) : null}
      </div>

      {user ? (
        <div className="mt-4 rounded-2xl border border-success/20 bg-success/5 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-success">
            <ShieldCheck className="h-4 w-4" />
            {copy.signedInAs} {user.email ?? "MaizeGuard user"}
          </div>
          <p className="mt-1 text-xs leading-5 text-ink-soft">{copy.privacyNote}</p>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-border bg-surface-2 p-4">
          <p className="text-sm leading-6 text-ink-soft">{copy.signInPrompt}</p>
          <a
            href="/login"
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#2d7447]"
          >
            <LogIn className="h-4 w-4" />
            {copy.loginToSave}
          </a>
        </div>
      )}

      {message ? (
        <p className="mt-3 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-ink-soft">
          {busy ? copy.working : message}
        </p>
      ) : null}

      {table ? (
        <div className="mt-5 overflow-hidden rounded-2xl border border-border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">
                <tr>
                  <th className="px-4 py-3">{copy.result}</th>
                  <th className="px-4 py-3">{copy.backendLabel}</th>
                  <th className="px-4 py-3">{copy.risk}</th>
                  <th className="px-4 py-3">{copy.confidence}</th>
                  <th className="px-4 py-3">{copy.action}</th>
                  <th className="px-4 py-3">{copy.file}</th>
                  <th className="px-4 py-3">{copy.time}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {items.length ? items.map((item) => (
                  <tr key={item.id} className="align-top">
                    <td className="px-4 py-3 font-semibold text-ink">{item.label}</td>
                    <td className="px-4 py-3 text-ink-soft">{item.raw_label ?? item.label}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                        {item.risk}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink">{item.confidence}%</td>
                    <td className="max-w-xs px-4 py-3 text-ink-soft">{item.action}</td>
                    <td className="px-4 py-3 text-ink-soft">{item.file_name}</td>
                    <td className="px-4 py-3 tabular-nums text-ink-soft">{formatTime(item)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td className="px-4 py-4 text-ink-soft" colSpan={7}>
                      {user ? copy.emptySignedIn : copy.emptySignedOut}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
      <ul className="mt-5 divide-y divide-border overflow-hidden rounded-2xl border border-border">
        {items.length ? items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-4 bg-white p-4">
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{item.label}</p>
              <p className="mt-0.5 truncate text-sm text-ink-soft">
                {item.file_name} · {item.confidence}% confidence
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {item.risk}
              </span>
              <p className="mt-1 text-xs tabular-nums text-ink-soft">{formatTime(item)}</p>
            </div>
          </li>
        )) : (
          <li className="bg-white p-4 text-sm leading-6 text-ink-soft">
            {user ? copy.emptySignedIn : copy.emptySignedOut}
          </li>
        )}
      </ul>
      )}
    </div>
  );
}

export function SupabaseAssessmentSaver({ latestAssessment, onHistoryChange, copy: copyOverride }: Props) {
  const copy = useMemo(() => ({ ...defaultCopy, ...copyOverride }), [copyOverride]);
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const lastSavedKey = useRef<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return undefined;
    return listenToCurrentUser(setUser);
  }, []);

  useEffect(() => {
    if (!user || !latestAssessment) return;

    const key = [
      latestAssessment.fileName,
      latestAssessment.result.label,
      latestAssessment.result.confidence,
      latestAssessment.result.rawLabel,
    ].join("|");

    if (lastSavedKey.current === key) return;
    lastSavedKey.current = key;

    setStatus("saving");
    setMessage(copy.savingMessage);
    saveAssessment(latestAssessment)
      .then(() => loadAssessmentHistory())
      .then((nextItems) => {
        onHistoryChange?.(nextItems);
        setStatus("saved");
        setMessage(copy.savedMessage);
      })
      .catch((error) => {
        lastSavedKey.current = null;
        setStatus("error");
        setMessage(historyErrorMessage(error, copy, "save"));
      });
  }, [copy, latestAssessment, onHistoryChange, user]);

  if (!message || !user) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl border border-border bg-white p-4 text-sm shadow-xl shadow-black/10">
      <div className={`flex items-start gap-3 ${status === "error" ? "text-danger" : "text-success"}`}>
        {status === "error" ? (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        ) : (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        )}
        <p className="leading-5 text-ink">{message}</p>
      </div>
    </div>
  );
}
