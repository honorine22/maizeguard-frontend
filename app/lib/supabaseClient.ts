"use client";

import {
  createClient,
  type SupabaseClient,
  type User,
} from "@supabase/supabase-js";

import type {
  DisplayResult,
  UploadMeta,
} from "./maizeguard";

export type SavedAssessmentInput = {
  fileName: string;
  result: Partial<DisplayResult>;
  upload?: UploadMeta | null;
};

export type SavedAssessment = {
  id: string;
  label: string;
  raw_label?: string | null;
  risk: string;
  confidence: number;
  action: string;
  file_name: string;
  image_width?: number | null;
  image_height?: number | null;
  created_at?: string | null;
};

type SupabaseConfig = {
  configured: boolean;
  url: string;
  publishableKey: string;
};

let supabaseClient: SupabaseClient | null = null;

function loadSupabaseConfig(): SupabaseConfig {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";

  const publishableKey =
    process.env
      .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";

  return {
    configured: Boolean(url && publishableKey),
    url,
    publishableKey,
  };
}

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) {
    return supabaseClient;
  }

  const config = loadSupabaseConfig();

  if (!config.configured) {
    console.error("Supabase configuration is missing", {
      urlExists: Boolean(config.url),
      publishableKeyExists: Boolean(
        config.publishableKey
      ),
    });

    return null;
  }

  try {
    supabaseClient = createClient(
      config.url,
      config.publishableKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );

    return supabaseClient;
  } catch (error) {
    console.error(
      "Could not create Supabase client:",
      error
    );

    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  const config = loadSupabaseConfig();

  return config.configured;
}

export async function getCurrentUser() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } =
    await supabase.auth.getUser();

  if (error) {
    console.warn(
      "Could not retrieve current user:",
      error.message
    );

    return null;
  }

  return data.user;
}

export function listenToCurrentUser(
  onChange: (user: User | null) => void
) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    onChange(null);
    return () => undefined;
  }

  const { data } =
    supabase.auth.onAuthStateChange(
      (_event, session) => {
        onChange(session?.user ?? null);
      }
    );

  void supabase.auth
    .getUser()
    .then(({ data: current, error }) => {
      if (error) {
        onChange(null);
        return;
      }

      onChange(current.user ?? null);
    })
    .catch((error) => {
      console.error(
        "Could not check current user:",
        error
      );

      onChange(null);
    });

  return () => {
    data.subscription.unsubscribe();
  };
}

export async function sendMagicLink(
  email: string,
  shouldCreateUser = true
): Promise<void> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Check .env.local and restart Next.js."
    );
  }

  if (typeof window === "undefined") {
    throw new Error(
      "Magic links must be requested from the browser."
    );
  }

  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail) {
    throw new Error("Enter a valid email address.");
  }

  const redirectTo = window.location.origin;

  console.log("Requesting Supabase magic link", {
    redirectTo,
    emailProvided: Boolean(cleanEmail),
  });

  const { error } =
    await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser,
      },
    });

  if (error) {
    console.error("Supabase magic-link error", {
      message: error.message,
      code: error.code,
      status: error.status,
    });

    const errorCode = error.code
      ? ` (${error.code})`
      : "";

    throw new Error(
      `${error.message}${errorCode}`
    );
  }
}

export async function signOutOfSupabase() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return;
  }

  const { error } =
    await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function loadAssessmentHistory(): Promise<
  SavedAssessment[]
> {
  const supabase = getSupabaseClient();
  const user = await getCurrentUser();

  if (!supabase || !user) {
    return [];
  }

  const { data, error } = await supabase
    .from("assessments")
    .select(
      "id,label,raw_label,risk,confidence,action,file_name,image_width,image_height,created_at"
    )
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    })
    .limit(8);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function saveAssessment(
  assessment: SavedAssessmentInput
) {
  const supabase = getSupabaseClient();
  const user = await getCurrentUser();

  if (!supabase) {
    throw new Error(
      "Supabase is not configured."
    );
  }

  if (!user) {
    throw new Error(
      "Sign in before saving assessment history."
    );
  }

  const payload = {
    user_id: user.id,
    label:
      assessment.result.label ??
      "Needs review",
    raw_label:
      assessment.result.rawLabel ?? null,
    risk: String(
      assessment.result.risk ??
        "Needs review"
    ),
    confidence: Number(
      assessment.result.confidence ?? 0
    ),
    action:
      assessment.result.action ??
      "Review result",
    file_name:
      assessment.fileName ??
      assessment.upload?.name ??
      "uploaded-image",
    image_width:
      assessment.upload?.width ?? null,
    image_height:
      assessment.upload?.height ?? null,
  };

  const { data, error } = await supabase
    .from("assessments")
    .insert(payload)
    .select(
      "id,label,raw_label,risk,confidence,action,file_name,image_width,image_height,created_at"
    )
    .single();

  if (error) {
    throw error;
  }

  return data;
}