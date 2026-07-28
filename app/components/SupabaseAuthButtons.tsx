"use client";

import { useEffect, useState } from "react";
import { LogIn, LogOut, UserPlus } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import {
  isSupabaseConfigured,
  listenToCurrentUser,
  signOutOfSupabase,
} from "../lib/supabaseClient";

type Props = {
  darkText?: boolean;
  mobile?: boolean;
};

export function SupabaseAuthButtons({ darkText = false, mobile = false }: Props) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);

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

  if (user) {
    const signOutClasses = darkText
      ? "border-slate-300 bg-slate-50 text-[#141f17] shadow-sm hover:border-primary/40 hover:bg-white hover:text-primary"
      : "border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white hover:text-ink";

    return (
      <button
        type="button"
        onClick={() => void signOutOfSupabase()}
        className={mobile
          ? "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm font-bold text-ink transition hover:text-primary"
          : `hidden min-w-[112px] items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold transition md:inline-flex ${signOutClasses}`}
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    );
  }

  const secondaryClasses = darkText
    ? "border-slate-300 bg-slate-50 text-[#141f17] shadow-sm hover:border-primary/40 hover:bg-white hover:text-primary"
    : "border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white hover:text-ink";
  const primaryClasses = darkText
    ? "border-primary bg-primary text-white shadow-sm hover:bg-[#2d7447]"
    : "border-white/25 bg-white text-ink hover:bg-primary hover:text-white";

  const disabledClasses = configured === false ? "opacity-70" : "";

  return (
    <div className={mobile ? "grid grid-cols-2 gap-2" : "hidden items-center gap-2 md:flex"}>
      <a
        href="/login"
        className={`inline-flex min-w-[96px] items-center justify-center gap-2 border px-4 py-2 text-sm font-bold transition ${
          mobile ? "rounded-xl" : "rounded-lg"
        } ${secondaryClasses} ${disabledClasses}`}
      >
        <LogIn className="h-4 w-4" />
        Login
      </a>
      {/* <a
        href="/register"
        className={`inline-flex min-w-[112px] items-center justify-center gap-2 border px-4 py-2 text-sm font-bold transition ${
          mobile ? "rounded-xl" : "rounded-lg"
        } ${primaryClasses} ${disabledClasses}`}
      >
        <UserPlus className="h-4 w-4" />
        Register
      </a> */}
    </div>
  );
}
