"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DragEvent, ReactNode } from "react";
import {
  AlertTriangle, ArrowRight, BarChart3, Camera, CheckCircle2, ChevronDown,
  ClipboardCheck, Database, ExternalLink, FileImage, FlaskConical, Layers3,
  Leaf, LineChart, Loader2, Menu, PackageCheck, PlayCircle, RotateCcw,
  Upload, WifiOff, X,
} from "lucide-react";

type QualityKey = "good" | "broken" | "impurity" | "mold_risk";
type Risk = "Low" | "Medium" | "High" | "Needs review" | "Unclear";

type AnalyzeResponse = {
  key?: QualityKey; label?: string; rawLabel?: string;
  confidence?: number; confidenceRaw?: number; confidencePercent?: number;
  raw_label?: string; confidence_percent?: number;
  needsReview?: boolean; probabilities?: Record<string, number>;
  needs_review?: boolean; review_reason?: string | null;
  risk?: Risk | string; action?: string; recommendation?: string;
  input_width?: number; input_height?: number; inference_view?: string;
  view_count?: number; view_predictions?: ViewPrediction[];
  top2_margin?: number;
  detail?: string; source?: string;
};

type ViewPrediction = {
  view: string;
  label: string;
  confidence: number;
};

type BackendStatus = "checking" | "online" | "offline";

type UploadMeta = {
  name: string;
  type: string;
  sizeKb: number;
  width?: number;
  height?: number;
};

type Scenario = {
  label: string; shortLabel: string; confidence: number; risk: Risk;
  action: string; detail: string; priority: string;
  tone: "success" | "warning" | "danger";
};
type DisplayResult = Scenario & {
  needsReview?: boolean; rawLabel?: string;
  probabilities?: Record<string, number>; source?: string;
  reviewReason?: string | null;
  inputWidth?: number; inputHeight?: number; inferenceView?: string;
  viewCount?: number; viewPredictions?: ViewPrediction[];
  top2Margin?: number;
};

const MAX_MB = 8;
const MODEL_API_URL =
  process.env.NEXT_PUBLIC_MODEL_API_URL ??
  "https://honorineigiraneza-maizeguard-backend.hf.space";

function modelPredictUrl() {
  return MODEL_API_URL.endsWith("/predict")
    ? MODEL_API_URL
    : `${MODEL_API_URL.replace(/\/$/, "")}/predict`;
}

function normalizeQualityKey(label?: string): QualityKey | null {
  const value = label?.toLowerCase().trim() ?? "";

  if (
    value.includes("unsupported") ||
    value.includes("not_maize") ||
    value.includes("not maize") ||
    value.includes("outside")
  ) {
    return null;
  }

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
    return "mold_risk";
  }

  return null;
}

const scenarios: Record<QualityKey, Scenario> = {
  good: {
    label: "Good maize grain", shortLabel: "Good", confidence: 94, risk: "Low",
    action: "Store safely or prepare for sale",
    detail: "The batch appears clean and suitable for normal storage with routine monitoring.",
    priority: "Classified as good only when most checks agree and no strong risk evidence appears.",
    tone: "success"
  },
  broken: {
    label: "Broken or damaged grain", shortLabel: "Broken", confidence: 87, risk: "Medium",
    action: "Sort before storage",
    detail: "Remove visibly damaged kernels before storage or sale to reduce rejection risk.",
    priority: "Broken kernels receive priority over good maize when enough patch evidence is detected.",
    tone: "warning"
  },
  impurity: {
    label: "Impurity-contaminated grain", shortLabel: "Impurity", confidence: 89, risk: "Medium",
    action: "Clean and re-screen",
    detail: "Separate stones, husks, dust and foreign matter before aggregation or sale.",
    priority: "Impurity evidence is prioritized because foreign matter reduces batch value.",
    tone: "warning"
  },
  mold_risk: {
    label: "Visible mold-risk grain", shortLabel: "Mold risk", confidence: 91, risk: "High",
    action: "Do not store — refer for checking",
    detail: "Visible mold risk requires careful handling and further quality assessment.",
    priority: "Mold-risk evidence has the highest priority, even if some patches look good.",
    tone: "danger"
  },
};

const history = [
  { site: "Kayonza cooperative", result: "Good maize grain", risk: "Low" as Risk, time: "09:12" },
  { site: "Nyagatare market", result: "Impurity-contaminated", risk: "Medium" as Risk, time: "10:25" },
  { site: "Local sample test", result: "Visible mold-risk grain", risk: "High" as Risk, time: "11:04" },
];
const metrics = [
  { label: "Public sources", value: "3" },
  { label: "Classes mapped", value: "4" },
  { label: "Training stack", value: "PyTorch" },
  { label: "Backend API", value: "Ready" },
];
const datasetSources = [
  {
    name: "CK-CNN", purpose: "Good / defective / impurity",
    detail: "Main public dataset for kernel-level quality categories used in training.",
    href: "https://github.com/vision-cidis/CK-CNNLW"
  },
  {
    name: "GrainSet maize", purpose: "Visual grain quality",
    detail: "Additional maize grain data used to support public-only training.",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10632488/"
  },
  {
    name: "EfficientMaize", purpose: "Good / bad support",
    detail: "Used as extra good and broad bad maize support, without forcing unclear labels.",
    href: "https://data.mendeley.com/datasets/r6vvm5jkh6/1"
  },
];
const navItems = [
  { label: "Project", href: "#project" },
  { label: "How it works", href: "#scan" },
  { label: "Workflow", href: "#results" },
  { label: "Demo", href: "#data" },
];
const priorityRules = [
  { label: "Mold risk", tone: "bg-danger text-white" },
  { label: "Impurity", tone: "bg-primary text-primary-foreground" },
  { label: "Broken", tone: "bg-warning text-white" },
  { label: "Good", tone: "bg-success text-white" },
];

function toneClasses(tone: Scenario["tone"]) {
  if (tone === "success") return {
    chip: "bg-success/10 text-success border-success/25",
    ring: "stroke-success", icon: "bg-success/10 text-success",
    panel: "border-success/20 bg-success/5",
  };
  if (tone === "danger") return {
    chip: "bg-danger/10 text-danger border-danger/25",
    ring: "stroke-danger", icon: "bg-danger/10 text-danger",
    panel: "border-danger/20 bg-danger/5",
  };
  return {
    chip: "bg-warning/10 text-warning border-warning/25",
    ring: "stroke-warning", icon: "bg-warning/10 text-warning",
    panel: "border-warning/20 bg-warning/5",
  };
}

const formatModelLabel = (l?: string) =>
  !l ? "Not available" : l.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const topProbabilities = (p?: Record<string, number>) =>
  Object.entries(p ?? {})
    .sort(([, a], [, b]) => b - a).slice(0, 4)
    .map(([label, value]) => ({ label, percent: Math.round(value * 100) }));

function isBackendReviewLabel(label?: string) {
  const value = label?.toLowerCase().trim() ?? "";
  return value === "needs_review" || value === "needs review";
}

function isUnsupportedBackendLabel(label?: string) {
  const value = label?.toLowerCase().trim() ?? "";
  return (
    value.includes("unsupported") ||
    value.includes("not_maize") ||
    value.includes("not maize") ||
    value.includes("outside")
  );
}

function resultRiskIsUnclear(risk?: Risk | string) {
  const value = risk?.toLowerCase().trim() ?? "";
  return value === "unclear" || value === "needs review";
}

function modelApiBaseUrl() {
  return MODEL_API_URL.replace(/\/predict$/, "").replace(/\/$/, "");
}

function formatFileType(type: string) {
  return type.replace("image/", "").toUpperCase() || "Image";
}

function readImageDimensions(file: File) {
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

export default function Home() {
  const [selected, setSelected] = useState<QualityKey | null>("good");
  const [fileName, setFileName] = useState("sample-maize-batch.jpg");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("Ready to assess");
  const [analysisResult, setAnalysisResult] = useState<Partial<DisplayResult> | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadMeta, setUploadMeta] = useState<UploadMeta | null>(null);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("checking");
  const [backendModel, setBackendModel] = useState("MobileNetV3");
  const [evidenceOpen, setEvidenceOpen] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  useEffect(() => {
    let cancelled = false;

    async function checkBackend() {
      setBackendStatus("checking");
      try {
        const response = await fetch(modelApiBaseUrl(), { cache: "no-store" });
        if (!response.ok) throw new Error("Backend health check failed.");
        const result = (await response.json()) as { model?: string };
        if (!cancelled) {
          setBackendStatus("online");
          setBackendModel(result.model ?? "MobileNetV3");
        }
      } catch {
        if (!cancelled) setBackendStatus("offline");
      }
    }

    void checkBackend();

    return () => {
      cancelled = true;
    };
  }, []);

  const baseResult = scenarios[selected ?? "good"];
  const result: DisplayResult = {
    ...baseResult, ...analysisResult,
    tone:
      analysisResult?.needsReview ||
      resultRiskIsUnclear(analysisResult?.risk)
        ? "warning"
        : analysisResult?.tone ?? baseResult.tone,
  };
  const tones = toneClasses(result.tone);
  const showSkeleton = isAnalyzing && !analysisResult;
  const backendStatusLabel =
    backendStatus === "online"
      ? "Backend online"
      : backendStatus === "checking"
        ? "Checking backend"
        : "Backend offline";
  const backendStatusClasses =
    backendStatus === "online"
      ? "border-success/25 bg-success/10 text-success"
      : backendStatus === "checking"
        ? "border-warning/25 bg-warning/10 text-warning"
        : "border-danger/25 bg-danger/10 text-danger";

  const validateAndAnalyze = useCallback((file: File) => {
    setUploadError(null);
    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload an image file (JPG, PNG, WebP).");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setUploadError(`Image is larger than ${MAX_MB} MB. Use a smaller photo.`);
      return;
    }
    void analyzeFile(file);
  }, []);

  async function analyzeFile(file: File) {
    setFileName(file.name);
    const nextPreview = URL.createObjectURL(file);
    setPreviewUrl((cur) => { if (cur) URL.revokeObjectURL(cur); return nextPreview; });
    setUploadMeta({
      name: file.name,
      type: file.type,
      sizeKb: Math.max(1, Math.round(file.size / 1024)),
    });
    setAnalysisResult(null);
    setSelected(null);
    setIsAnalyzing(true);
    setLastUpdated("Assessing image…");

    readImageDimensions(file)
      .then((dimensions) => {
        setUploadMeta((current) => current ? { ...current, ...dimensions } : current);
      })
      .catch(() => undefined);

    try {
      const formData = new FormData();
      formData.append("image", file, file.name);
      const response = await fetch(modelPredictUrl(), { method: "POST", body: formData });
      let apiResult: AnalyzeResponse = {};
      try { apiResult = (await response.json()) as AnalyzeResponse; } catch { apiResult = {}; }
      const backendLabel = apiResult.label ?? apiResult.raw_label;
      const backendRawLabel = apiResult.raw_label ?? apiResult.rawLabel ?? apiResult.label;
      const predicted =
        apiResult.key ??
        normalizeQualityKey(backendLabel) ??
        normalizeQualityKey(backendRawLabel);
      const isUnsupported = isUnsupportedBackendLabel(backendLabel) || isUnsupportedBackendLabel(backendRawLabel);

      if (!response.ok || (!predicted && !isUnsupported)) {
        setSelected(null);
        setAnalysisResult({
          label: "Needs review", confidence: 0, risk: "Needs review",
          action: "Model unavailable",
          detail: apiResult.detail ?? apiResult.review_reason ?? "The backend model API did not return a usable prediction.",
          needsReview: true, tone: "warning",
        });
        setLastUpdated("Model API unavailable");
        return;
      }
      const nextBase = predicted ? scenarios[predicted] : scenarios.good;
      const needsReview = isUnsupported || (apiResult.needsReview ?? apiResult.needs_review ?? false);
      const confidence =
        apiResult.confidencePercent ??
        apiResult.confidence_percent ??
        (typeof apiResult.confidence === "number" && apiResult.confidence <= 1
          ? apiResult.confidence * 100
          : apiResult.confidence);
      setSelected(predicted ?? null);
      setAnalysisResult({
        label:
          needsReview || isBackendReviewLabel(apiResult.label)
            ? "Needs review"
            : formatModelLabel(apiResult.label ?? nextBase.label),
        confidence: typeof confidence === "number" ? Math.round(confidence) : nextBase.confidence,
        risk: isUnsupported ? "Needs review" : (apiResult.risk as Risk) ?? (needsReview ? "Needs review" : nextBase.risk),
        action: isUnsupported ? "Upload a clear maize image" : apiResult.action ?? (needsReview ? "Needs review" : nextBase.action),
        detail: apiResult.recommendation ?? apiResult.review_reason ?? apiResult.detail ?? nextBase.detail,
        needsReview,
        rawLabel: backendRawLabel,
        probabilities: apiResult.probabilities,
        source: "model-api",
        reviewReason: apiResult.review_reason ?? null,
        inputWidth: apiResult.input_width,
        inputHeight: apiResult.input_height,
        inferenceView: apiResult.inference_view,
        viewCount: apiResult.view_count,
        viewPredictions: apiResult.view_predictions,
        top2Margin: apiResult.top2_margin,
      });
      setLastUpdated(response.ok ? "Assessment completed" : "Preview assessment completed");
    } catch {
      setSelected(null);
      setAnalysisResult({
        label: "Needs review", confidence: 0, risk: "Needs review", action: "Needs review",
        detail: "The backend model API is not reachable. Check the Hugging Face Space and CORS settings, then try again.",
        needsReview: true, tone: "warning",
      });
      setLastUpdated("Model API unavailable");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function clearUpload() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFileName("sample-maize-batch.jpg");
    setAnalysisResult(null);
    setUploadMeta(null);
    setSelected("good");
    setLastUpdated("Ready to assess");
    setUploadError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndAnalyze(file);
  }

  return (
    <main className="min-h-screen bg-[#f6f8f4] text-ink">
      {/* HEADER (sticky) */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all ${scrolled ? "bg-black/55 backdrop-blur-md shadow-lg shadow-black/20" : "bg-transparent"
          }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <a href="#project" className="flex items-center gap-2 text-lg font-semibold text-white">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary"><Leaf className="h-4 w-4" /></span>
            <span><span className="text-[#f3c84f]">MaizeGuard</span> Rwanda</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium text-white/85 md:flex">
            {navItems.map((i) => (
              <a key={i.href} href={i.href} className="transition hover:text-white">{i.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href="#scan"
              className="hidden items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#2d7447] md:inline-flex">
              View demo <ArrowRight className="h-4 w-4" />
            </a>
            <button type="button" onClick={() => setNavOpen((v) => !v)}
              aria-label="Toggle menu" aria-expanded={navOpen}
              className="grid h-10 w-10 place-items-center rounded-lg text-white md:hidden">
              {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {navOpen && (
          <div className="border-t border-white/10 bg-black/80 backdrop-blur md:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col px-5 py-3">
              {navItems.map((i) => (
                <a key={i.href} href={i.href} onClick={() => setNavOpen(false)}
                  className="border-b border-white/10 py-3 text-sm font-medium text-white/90 last:border-0">
                  {i.label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="project" className="relative min-h-screen overflow-hidden bg-black text-white">
        <img src="/farmers-maize-harvest-background.jpg" alt=""
          className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,9,7,0.92)_0%,rgba(5,10,8,0.78)_40%,rgba(7,10,8,0.45)_75%,rgba(7,10,8,0.25)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.05)_40%,rgba(0,0,0,0.7)_100%)]" />
        <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-5 pb-16 pt-32 md:px-8 lg:grid-cols-[1fr_360px]">
          <div className="max-w-3xl">
            <h1 className="font-display text-5xl font-normal leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl md:text-7xl">
              Know your maize before storage or sale.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/85">
              Upload a maize image to get instant quality insights, a confidence score,
              and practical post-harvest guidance.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#scan"
                className="group inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-black/30 transition hover:-translate-y-0.5 hover:bg-[#2d7447]">
                <Upload className="h-4 w-4" /> Assess a sample
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </a>
              <a href="#scan"
                className="inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white hover:text-ink">
                <PlayCircle className="h-4 w-4" /> See how it works
              </a>
            </div>
            <dl className="mt-12 grid max-w-3xl grid-cols-3 gap-8 border-t border-white/15 pt-6 text-white/80">
              {[
                ["13.8%", "Maize can be lost after harvest"],
                ["Buyer rejection", "Poor quality can reduce market value"],
                ["Act early", "Know whether to dry, sort, clean, or refer"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display text-2xl leading-tight text-white sm:text-3xl">
                    {value}
                  </dt>
                  <dd className="mt-2 text-sm tracking-[0.12em]">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/5 p-1 shadow-2xl backdrop-blur">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem]">
                <img src="/farmers-maize-harvest-background.jpg" alt="" className="h-full w-full object-cover" />
               
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-5">
                  <p className="font-display text-xl text-white">Quality check</p>
                  <p className="mt-1 text-sm text-white/70">Post-harvest workflow</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WORKSPACE */}
      <section id="scan" className="px-5 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay">Assessment workspace</p>
              <h2 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight text-ink md:text-5xl">
                Upload a batch photo and review the result.
              </h2>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <span
                role="status"
                aria-live="polite"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm"
              >
                {isAnalyzing
                  ? <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  : <CheckCircle2 className="h-4 w-4 text-primary" />}
                {lastUpdated}
              </span>
              <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm ${backendStatusClasses}`}>
                {backendStatus === "checking"
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : backendStatus === "online"
                    ? <CheckCircle2 className="h-4 w-4" />
                    : <WifiOff className="h-4 w-4" />}
                {backendStatusLabel}
              </span>
            </div>
          </div>

          <div className="mb-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-white px-4 py-3 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">Model service</p>
              <p className="mt-1 truncate text-sm font-semibold text-ink">{backendModel}</p>
            </div>
            <div className="rounded-2xl border border-border bg-white px-4 py-3 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">Integration</p>
              <p className="mt-1 text-sm font-semibold text-ink">Direct backend upload</p>
            </div>
            <div className="rounded-2xl border border-border bg-white px-4 py-3 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">Image sent as</p>
              <p className="mt-1 text-sm font-semibold text-ink">Original file</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            {/* UPLOAD */}
            <div className="rounded-3xl bg-white p-6 shadow-xl shadow-black/[0.04] md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-2xl font-semibold text-ink">Batch image</h3>
                  <p className="mt-1.5 text-sm leading-6 text-ink-soft">
                    Use a clear photo of shelled maize on a plain surface. JPG / PNG / WebP, up to {MAX_MB} MB.
                  </p>
                </div>
                <div className="flex gap-2">
                  {previewUrl && (
                    <button type="button" onClick={clearUpload}
                      className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-white text-ink-soft shadow-sm transition hover:-translate-y-0.5 hover:text-danger"
                      title="Clear photo" aria-label="Clear photo">
                      <RotateCcw className="h-5 w-5" />
                    </button>
                  )}
                  <button type="button" onClick={() => inputRef.current?.click()}
                    className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-white text-primary shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40"
                    title="Open camera" aria-label="Open camera">
                    <Camera className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Sample chips first (lower commitment) */}
              <div className="mt-6">
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(scenarios) as [QualityKey, Scenario][]).map(([key, item]) => {
                    const isSelected = selected === key && !previewUrl;
                    return (
                      <button key={key} type="button"
                        onClick={() => {
                          clearUpload();
                          setSelected(key);
                          setLastUpdated("Sample condition selected");
                        }}
                        aria-pressed={isSelected}
                        className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${isSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-white text-ink hover:border-primary/40 hover:text-primary"
                          }`}>
                        {item.shortLabel}
                        <span className={`ml-2 text-[10px] font-medium ${isSelected ? "text-primary-foreground/75" : "text-ink-soft"}`}>
                          {item.risk}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dropzone */}
              <label
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`group mt-5 flex min-h-[22rem] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-4 text-center transition sm:p-5
                  ${dragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-border bg-surface-2 hover:border-primary/50 hover:bg-surface-3/70"}`}>
                {previewUrl ? (
                  <div className="relative flex w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-white p-2 shadow-sm">
                    <img src={previewUrl} alt="Selected maize batch" className="block max-h-[32rem] w-full object-contain" />
                    <span className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-lg border border-border bg-white/95 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur">
                      <Camera className="h-3.5 w-3.5" /> Replace
                    </span>
                  </div>
                ) : (
                  <>
                    <span className={`grid h-20 w-20 place-items-center rounded-2xl text-white shadow-sm transition group-hover:-translate-y-1 ${dragOver ? "bg-primary scale-110" : "bg-primary"}`}>
                      <Upload className="h-8 w-8" />
                    </span>
                    <p className="mt-5 text-base font-semibold text-ink">
                      {dragOver ? "Drop to upload" : "Drop photo or click to browse"}
                    </p>
                    <p className="mt-1 text-sm text-ink-soft">JPG, PNG, WebP · up to {MAX_MB} MB</p>
                  </>
                )}
                {previewUrl && (
                  <span className="mt-4 inline-flex max-w-full items-center gap-2 truncate text-sm font-semibold text-ink">
                    <FileImage className="h-4 w-4 shrink-0 text-primary" />
                    <span className="truncate">{fileName}</span>
                  </span>
                )}
                <input ref={inputRef} className="sr-only" type="file" accept="image/*"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) validateAndAnalyze(f); }} />
              </label>
              {uploadError && (
                <p role="alert" className="mt-3 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
                  <AlertTriangle className="h-4 w-4" /> {uploadError}
                </p>
              )}
              {/* Priority */}
              <div className="mt-4 rounded-2xl border border-border bg-surface-2/70 p-5">
                <div className="flex items-start gap-3">
                  <Layers3 className="mt-0.5 h-5 w-5 shrink-0 text-clay" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink">Mixed-risk priority</p>
                    <p className="mt-1.5 text-sm leading-6 text-ink-soft">{result.priority}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {priorityRules.map((rule, i) => (
                        <span key={rule.label} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${rule.tone}`}>
                          {i + 1}. {rule.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RESULT */}
            <div id="results"
              aria-busy={isAnalyzing}
              className="flex flex-col rounded-3xl bg-white p-6 shadow-xl shadow-black/[0.04] md:p-8">
              <div className="flex items-start justify-between gap-5">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay">Assessment result</p>
                  {showSkeleton ? (
                    <div className="mt-3 h-10 w-3/4 animate-pulse rounded-lg bg-muted" />
                  ) : (
                    <h3 className="mt-3 font-display text-3xl font-semibold leading-[1.05] text-ink md:text-4xl">
                      {result.label}
                    </h3>
                  )}
                </div>
                <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${tones.icon}`}>
                  {isAnalyzing ? <Loader2 className="h-6 w-6 animate-spin" />
                    : result.needsReview || result.risk === "High" ? <AlertTriangle className="h-6 w-6" />
                      : <CheckCircle2 className="h-6 w-6" />}
                </div>
              </div>

              {/* Status row + confidence ring */}
              <div className="mt-6 flex items-center gap-5">
                <ConfidenceRing percent={result.confidence} className={tones.ring} loading={showSkeleton} />
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${tones.chip}`}>
                    {result.needsReview ? "Needs review" : `${result.risk} risk`}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink">
                    {result.source === "model-api" ? "Live API" : "Demo state"}
                  </span>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-border bg-surface-2 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink">Screening report</p>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-ink-soft">
                    Original image analyzed
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <ReportMetric label="Result" value={showSkeleton ? "Analyzing..." : result.label} />
                  <ReportMetric label="Backend label" value={formatModelLabel(result.rawLabel ?? result.label)} />
                  <ReportMetric label="Confidence" value={showSkeleton ? "Analyzing..." : `${result.confidence}%`} />
                  <ReportMetric label="Risk" value={String(result.risk)} />
                </div>
                {(result.inputWidth && result.inputHeight) || result.reviewReason ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {result.reviewReason ? (
                      <ReportMetric label="Review note" value={result.reviewReason} />
                    ) : null}
                  </div>
                ) : null}
              </div>

              {/* Action */}
              <div className={`mt-6 rounded-2xl border p-5 ${tones.panel}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Recommended action</p>
                    <h4 className="mt-1.5 font-display text-2xl font-semibold leading-snug text-ink">{result.action}</h4>
                    <p className="mt-2 text-sm leading-6 text-ink-soft">{result.detail}</p>
                  </div>
                  {previewUrl && (
                    <button type="button" onClick={clearUpload}
                      className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary">
                      <RotateCcw className="h-4 w-4" />
                      Analyze another
                    </button>
                  )}
                </div>
              </div>

              {/* Evidence (collapsible) */}
              <div className="mt-4 rounded-2xl border border-border bg-white">
                <button type="button"
                  onClick={() => setEvidenceOpen((v) => !v)}
                  aria-expanded={evidenceOpen}
                  className="flex w-full items-center justify-between gap-3 p-5">
                  <span className="text-left">
                    <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-ink">Backend model evidence</span>
                    <span className="mt-1 block text-sm text-ink-soft">
                      Top prediction: <span className="font-semibold text-ink">{formatModelLabel(result.rawLabel ?? result.label)}</span>
                    </span>
                  </span>
                  <ChevronDown className={`h-5 w-5 text-ink-soft transition ${evidenceOpen ? "rotate-180" : ""}`} />
                </button>
                {evidenceOpen && (
                  <div className="border-t border-border p-5 pt-4">
                    {topProbabilities(result.probabilities).length > 0 ? (
                      <div className="space-y-3">
                        {topProbabilities(result.probabilities).map((item) => (
                          <div key={item.label}>
                            <div className="mb-1 flex items-center justify-between text-xs">
                              <span className="font-semibold text-ink">{formatModelLabel(item.label)}</span>
                              <span className="font-medium text-ink-soft">{item.percent}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-muted"
                              role="progressbar" aria-valuenow={item.percent} aria-valuemin={0} aria-valuemax={100}>
                              <div className="h-full rounded-full bg-primary transition-all duration-700"
                                style={{ width: `${item.percent}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm leading-6 text-ink-soft">
                        Upload a photo to show class probabilities from the model API.
                      </p>
                    )}
                    {(result.inferenceView || result.viewPredictions?.length || result.top2Margin !== undefined) && (
                      <div className="mt-5 rounded-xl border border-border bg-surface-2 p-4">
                        <div className="grid gap-3 text-xs text-ink-soft sm:grid-cols-3">
                          {result.inferenceView && (
                            <div>
                              <p className="font-bold uppercase tracking-[0.12em] text-ink">View</p>
                              <p className="mt-1">{formatModelLabel(result.inferenceView)}</p>
                            </div>
                          )}
                          {result.viewCount !== undefined && (
                            <div>
                              <p className="font-bold uppercase tracking-[0.12em] text-ink">Checks</p>
                              <p className="mt-1">{result.viewCount} image view{result.viewCount === 1 ? "" : "s"}</p>
                            </div>
                          )}
                          {result.top2Margin !== undefined && (
                            <div>
                              <p className="font-bold uppercase tracking-[0.12em] text-ink">Top-2 margin</p>
                              <p className="mt-1">{Math.round(result.top2Margin * 100)}%</p>
                            </div>
                          )}
                        </div>
                        {result.viewPredictions?.length ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {result.viewPredictions.map((view) => (
                              <span key={`${view.view}-${view.label}`}
                                className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink">
                                {formatModelLabel(view.view)}: {formatModelLabel(view.label)} · {Math.round(view.confidence * 100)}%
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Step icon={<ClipboardCheck className="h-4 w-4" />} title="Assess" text="Image is uploaded and prepared." />
                <Step icon={<LineChart className="h-4 w-4" />} title="Classify" text="The model checks visible quality." />
                <Step icon={<Database className="h-4 w-4" />} title="Recommend" text="The result becomes an action." />
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* METRICS + HISTORY */}
      <section className="px-5 pb-20 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm md:p-7">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-semibold text-ink">Training readiness</h2>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {metrics.map((m) => (
                <div key={m.label} className="rounded-2xl border border-border bg-surface-2 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">{m.label}</p>
                  <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">{m.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm md:p-7">
            <div className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-semibold text-ink">Recent assessments</h2>
            </div>
            <ul className="mt-5 divide-y divide-border overflow-hidden rounded-2xl border border-border">
              {history.map((item) => (
                <li key={`${item.site}-${item.time}`}
                  className="flex items-center justify-between gap-4 bg-white p-4 transition hover:bg-surface-2/60">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold
                      ${item.risk === "High" ? "bg-danger/10 text-danger"
                        : item.risk === "Medium" ? "bg-warning/10 text-warning"
                          : "bg-success/10 text-success"}`}>
                      {item.site[0]}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{item.site}</p>
                      <p className="mt-0.5 truncate text-sm text-ink-soft">{item.result}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold
                      ${item.risk === "High" ? "bg-danger/10 text-danger"
                        : item.risk === "Medium" ? "bg-warning/10 text-warning"
                          : "bg-success/10 text-success"}`}>
                      {item.risk}
                    </span>
                    <span className="text-xs font-medium tabular-nums text-ink-soft">{item.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* DATA */}
      <section id="data" className="px-5 pb-24 md:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] bg-white shadow-sm">
          <div className="grid gap-10 p-6 md:grid-cols-[0.85fr_1.15fr] md:items-end md:p-10">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                <FlaskConical className="h-3.5 w-3.5" /> Public training data
              </p>
              <h2 className="mt-5 font-display text-3xl font-semibold leading-tight text-ink md:text-4xl">
                Public datasets prepared for the maize quality model.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-ink-soft">
                Local farmer images are kept for manual testing only. Training relies on public
                datasets to keep the model workflow consistent and reproducible.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {datasetSources.map((s) => (
                <a key={s.name} href={s.href} target="_blank" rel="noreferrer"
                  className="group relative flex flex-col rounded-2xl border border-border bg-surface-2 p-5 transition hover:-translate-y-1 hover:border-clay/40 hover:bg-white hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-clay/10 text-clay">
                      <FlaskConical className="h-4 w-4" />
                    </div>
                    <ExternalLink className="h-4 w-4 text-ink-soft transition group-hover:text-clay" />
                  </div>
                  <p className="mt-5 font-display text-lg font-semibold text-ink">{s.name}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-primary">{s.purpose}</p>
                  <p className="mt-3 text-sm leading-6 text-ink-soft">{s.detail}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-white px-5 py-10 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-sm text-ink-soft">
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-primary" />
            <span className="font-medium text-ink">MaizeGuard Rwanda</span>
            <span>· Field assessment prototype</span>
          </div>
          <p>Post-harvest decision support · {new Date().getFullYear()}</p>
        </div>
      </footer>
    </main>
  );
}

function ConfidenceRing({ percent, className, loading }:
  { percent: number; className: string; loading?: boolean }) {
  const r = 28, c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div className="relative h-20 w-20 shrink-0">
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
        <circle cx="32" cy="32" r={r} className="fill-none stroke-muted" strokeWidth="6" />
        <circle cx="32" cy="32" r={r}
          className={`fill-none transition-all duration-700 ${className}`}
          strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={loading ? c : offset} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="font-display text-lg font-semibold leading-none text-ink tabular-nums">
            {loading ? "–" : `${percent}%`}
          </div>
          <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-ink-soft">conf</div>
        </div>
      </div>
    </div>
  );
}

function Step({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-2 p-4">
      <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">{icon}</div>
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-1 text-xs leading-5 text-ink-soft">{text}</p>
    </div>
  );
}

function ReportMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-white px-3 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold leading-5 text-ink">{value}</p>
    </div>
  );
}
