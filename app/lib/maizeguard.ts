export type QualityKey = "good" | "broken" | "impurity" | "mold_risk";
export type Risk = "Low" | "Medium" | "High" | "Needs review" | "Unclear";

export type AnalyzeResponse = {
  key?: QualityKey;
  label?: string;
  rawLabel?: string;
  confidence?: number;
  confidenceRaw?: number;
  confidencePercent?: number;
  raw_label?: string;
  confidence_percent?: number;
  needsReview?: boolean;
  probabilities?: Record<string, number>;
  needs_review?: boolean;
  review_reason?: string | null;
  risk?: Risk | string;
  action?: string;
  recommendation?: string;
  input_width?: number;
  input_height?: number;
  inference_view?: string;
  view_count?: number;
  view_predictions?: ViewPrediction[];
  top2_margin?: number;
  detail?: string;
  source?: string;
};

export type ViewPrediction = {
  view: string;
  label: string;
  confidence: number;
};

export type BackendStatus = "checking" | "online" | "offline";

export type UploadMeta = {
  name: string;
  type: string;
  sizeKb: number;
  width?: number;
  height?: number;
};

export type Scenario = {
  label: string;
  shortLabel: string;
  confidence: number;
  risk: Risk;
  action: string;
  detail: string;
  priority: string;
  tone: "success" | "warning" | "danger";
};

export type DisplayResult = Scenario & {
  needsReview?: boolean;
  rawLabel?: string;
  probabilities?: Record<string, number>;
  source?: string;
  reviewReason?: string | null;
  inputWidth?: number;
  inputHeight?: number;
  inferenceView?: string;
  viewCount?: number;
  viewPredictions?: ViewPrediction[];
  top2Margin?: number;
};

export const MAX_MB = 8;

export const MODEL_API_URL =
  process.env.NEXT_PUBLIC_MODEL_API_URL ??
  process.env.MODEL_API_URL ??
  "https://honorineigiraneza-maizeguard-backend.hf.space";

export function sanitizeModelApiUrl(url: string) {
  return url.trim()
    .replace("http://0.0.0.0", "http://127.0.0.1")
    .replace("https://0.0.0.0", "https://127.0.0.1")
    .replace(/\/docs\/?$/, "")
    .replace(/\/redoc\/?$/, "")
    .replace(/\/openapi\.json\/?$/, "");
}

export function normalizedModelApiUrl() {
  return sanitizeModelApiUrl(MODEL_API_URL);
}

export const scenarios: Record<QualityKey, Scenario> = {
  good: {
    label: "Good maize grain",
    shortLabel: "Good",
    confidence: 94,
    risk: "Low",
    action: "Store safely or prepare for sale",
    detail: "The batch appears clean and suitable for normal storage with routine monitoring.",
    priority: "Classified as good only when most checks agree and no strong risk evidence appears.",
    tone: "success",
  },
  broken: {
    label: "Broken or damaged grain",
    shortLabel: "Broken",
    confidence: 87,
    risk: "Medium",
    action: "Sort before storage",
    detail: "Remove visibly damaged kernels before storage or sale to reduce rejection risk.",
    priority: "Broken kernels receive priority over good maize when enough patch evidence is detected.",
    tone: "warning",
  },
  impurity: {
    label: "Impurity-contaminated grain",
    shortLabel: "Impurity",
    confidence: 89,
    risk: "Medium",
    action: "Clean and re-screen",
    detail: "Separate stones, husks, dust and foreign matter before aggregation or sale.",
    priority: "Impurity evidence is prioritized because foreign matter reduces batch value.",
    tone: "warning",
  },
  mold_risk: {
    label: "Visible mold-risk grain",
    shortLabel: "Mold risk",
    confidence: 91,
    risk: "High",
    action: "Do not store — refer for checking",
    detail: "Visible mold risk requires careful handling and further quality assessment.",
    priority: "Mold-risk evidence has the highest priority, even if some patches look good.",
    tone: "danger",
  },
};

export const history = [
  { site: "Kayonza cooperative", result: "Good maize grain", risk: "Low" as Risk, time: "09:12" },
  { site: "Nyagatare market", result: "Impurity-contaminated", risk: "Medium" as Risk, time: "10:25" },
  { site: "Local sample test", result: "Visible mold-risk grain", risk: "High" as Risk, time: "11:04" },
];

export const metrics = [
  { label: "Public sources", value: "3" },
  { label: "Classes mapped", value: "4" },
  { label: "Training stack", value: "PyTorch" },
  { label: "Backend API", value: "Ready" },
];

export const datasetSources = [
  {
    name: "CK-CNN",
    purpose: "Good / defective / impurity",
    detail: "Main public dataset for kernel-level quality categories used in training.",
    href: "https://github.com/vision-cidis/CK-CNNLW",
  },
  {
    name: "GrainSet maize",
    purpose: "Visual grain quality",
    detail: "Additional maize grain data used to support public-only training.",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10632488/",
  },
  {
    name: "EfficientMaize",
    purpose: "Good / bad support",
    detail: "Used as extra good and broad bad maize support, without forcing unclear labels.",
    href: "https://data.mendeley.com/datasets/r6vvm5jkh6/1",
  },
];

export const priorityRules = [
  { label: "Mold risk", tone: "bg-danger text-white" },
  { label: "Impurity", tone: "bg-primary text-primary-foreground" },
  { label: "Broken", tone: "bg-warning text-white" },
  { label: "Good", tone: "bg-success text-white" },
];

export function modelPredictUrl() {
  const url = normalizedModelApiUrl();
  return url.endsWith("/predict")
    ? url
    : `${url.replace(/\/$/, "")}/predict`;
}

export function modelApiBaseUrl() {
  return normalizedModelApiUrl().replace(/\/predict\/?$/, "").replace(/\/$/, "");
}

export function normalizeQualityKey(label?: string): QualityKey | null {
  const value = label?.toLowerCase().trim() ?? "";

  if (
    value.includes("unsupported") ||
    value.includes("not_maize") ||
    value.includes("not maize") ||
    value.includes("outside") ||
    value.includes("needs_review") ||
    value.includes("needs review")
  ) {
    return null;
  }

  if (value.includes("good") || value.includes("healthy") || value.includes("normal")) {
    return "good";
  }
  if (value.includes("broken") || value.includes("damage") || value.includes("defect")) {
    return "broken";
  }
  if (value.includes("impurity") || value.includes("dirty") || value.includes("foreign")) {
    return "impurity";
  }
  if (value.includes("mold") || value.includes("rotten") || value.includes("fung")) {
    return "mold_risk";
  }

  return null;
}

export function toneClasses(tone: Scenario["tone"]) {
  if (tone === "success") {
    return {
      chip: "bg-success/10 text-success border-success/25",
      ring: "stroke-success",
      icon: "bg-success/10 text-success",
      panel: "border-success/20 bg-success/5",
    };
  }
  if (tone === "danger") {
    return {
      chip: "bg-danger/10 text-danger border-danger/25",
      ring: "stroke-danger",
      icon: "bg-danger/10 text-danger",
      panel: "border-danger/20 bg-danger/5",
    };
  }
  return {
    chip: "bg-warning/10 text-warning border-warning/25",
    ring: "stroke-warning",
    icon: "bg-warning/10 text-warning",
    panel: "border-warning/20 bg-warning/5",
  };
}

export const formatModelLabel = (label?: string) =>
  !label ? "Not available" : label.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const topProbabilities = (probabilities?: Record<string, number>) =>
  Object.entries(probabilities ?? {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([label, value]) => ({ label, percent: Math.round(value * 100) }));

export function isBackendReviewLabel(label?: string) {
  const value = label?.toLowerCase().trim() ?? "";
  return value === "needs_review" || value === "needs review";
}

export function isUnsupportedBackendLabel(label?: string) {
  const value = label?.toLowerCase().trim() ?? "";
  return (
    value.includes("unsupported") ||
    value.includes("not_maize") ||
    value.includes("not maize") ||
    value.includes("outside")
  );
}

export function resultRiskIsUnclear(risk?: Risk | string) {
  const value = risk?.toLowerCase().trim() ?? "";
  return value === "unclear" || value === "needs review";
}

export function readImageDimensions(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const dimensions = { width: image.naturalWidth, height: image.naturalHeight };
      URL.revokeObjectURL(objectUrl);
      resolve(dimensions);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read image dimensions."));
    };
    image.src = objectUrl;
  });
}
