import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MODEL_API_URL = process.env.MODEL_API_URL ?? "http://127.0.0.1:8000";

function modelPredictUrl() {
  return MODEL_API_URL.endsWith("/predict")
    ? MODEL_API_URL
    : `${MODEL_API_URL.replace(/\/$/, "")}/predict`;
}

type QualityKey = "good" | "broken" | "impurity" | "mold";

type ModelApiResponse = {
  label: string;
  raw_label?: string;
  confidence: number;
  confidence_percent?: number;
  confidencePercent?: number;
  needs_review?: boolean;
  needsReview?: boolean;
  review_reason?: string | null;
  probabilities?: Record<string, number>;
  risk: string;
  action: string;
  recommendation?: string;
  detail?: string;
};

function normalizeLabel(label: string): QualityKey | null {
  const value = label.toLowerCase().trim();

  if (value.includes("needs_review") || value.includes("needs review")) {
    return null;
  }

  if (
    value.includes("good") ||
    value.includes("healthy") ||
    value.includes("normal")
  ) {
    return "good";
  }

  if (
    value.includes("broken") ||
    value.includes("damage") ||
    value.includes("defect")
  ) {
    return "broken";
  }

  if (
    value.includes("impurity") ||
    value.includes("dirty") ||
    value.includes("foreign")
  ) {
    return "impurity";
  }

  if (
    value.includes("mold") ||
    value.includes("rotten") ||
    value.includes("fung")
  ) {
    return "mold";
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        {
          error: "No image file was uploaded.",
          label: "Needs review",
          confidence: 0,
          confidenceRaw: 0,
          confidencePercent: 0,
          needsReview: true,
          risk: "Needs review",
          action: "Upload an image",
          detail: "Please choose a maize image before analyzing.",
          source: "upload-error",
        },
        { status: 400 }
      );
    }

    const modelFormData = new FormData();

    // Your FastAPI endpoint expects the uploaded field to be called "image".
    modelFormData.append("image", image, image.name);

    const response = await fetch(modelPredictUrl(), {
      method: "POST",
      body: modelFormData,
      cache: "no-store",
    });

    if (!response.ok) {
      const details = await response.text();

      return NextResponse.json(
        {
          error: "Model API failed.",
          details,
          label: "Needs review",
          confidence: 0,
          confidenceRaw: 0,
          confidencePercent: 0,
          needsReview: true,
          risk: "Needs review",
          action: "Needs review",
          detail:
            "The prediction server returned an error. Check the model server terminal.",
          source: "model-api-error",
        },
        { status: response.status }
      );
    }

    const result = (await response.json()) as ModelApiResponse;
    const needsReview =
      result.needs_review ?? result.needsReview ?? result.label === "needs_review";
    const key = normalizeLabel(result.raw_label ?? result.label);

    if (!key && !needsReview) {
      return NextResponse.json(
        {
          error: "Unsupported model label.",
          label: "Needs review",
          confidence: 0,
          confidenceRaw: 0,
          confidencePercent: 0,
          needsReview: true,
          risk: "Needs review",
          action: "Needs review",
          detail: `The model returned an unsupported label: ${result.label}`,
          source: "model-api-error",
        },
        { status: 502 }
      );
    }

    const confidenceRaw = Number(result.confidence ?? 0);

    const confidencePercent = Number(
      result.confidence_percent ??
        result.confidencePercent ??
        confidenceRaw * 100
    );

    return NextResponse.json({
      key: key ?? "mold",
      label: needsReview ? "Needs review" : result.label,
      rawLabel: result.raw_label ?? result.label,
      confidence: Math.round(confidencePercent),
      confidenceRaw,
      confidencePercent,
      needsReview,
      reviewReason: result.review_reason ?? null,
      probabilities: result.probabilities ?? {},
      risk: needsReview ? "Needs review" : result.risk,
      action: needsReview ? "Needs review" : result.action,
      detail:
        result.review_reason ??
        result.recommendation ??
        result.detail ??
        "",
      source: "model-api",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Could not reach the model API.",
        details: error instanceof Error ? error.message : "Unknown error",
        label: "Needs review",
        confidence: 0,
        confidenceRaw: 0,
        confidencePercent: 0,
        needsReview: true,
        risk: "Needs review",
        action: "Model server unavailable",
        detail:
          "Start the MaizeGuard model server, then upload the image again.",
        source: "model-api-error",
      },
      { status: 502 }
    );
  }
}
