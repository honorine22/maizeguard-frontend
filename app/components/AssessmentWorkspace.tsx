"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ChevronDown,
  FileImage,
  Layers3,
  Loader2,
  RotateCcw,
  Upload,
  WifiOff,
} from "lucide-react";
import { ConfidenceRing, ReportMetric } from "./AssessmentWidgets";
import type { SavedAssessmentInput } from "../lib/supabaseClient";
import {
  MAX_MB,
  formatModelLabel,
  isBackendReviewLabel,
  isUnsupportedBackendLabel,
  modelApiBaseUrl,
  modelPredictUrl,
  normalizeQualityKey,
  priorityRules,
  readImageDimensions,
  resultRiskIsUnclear,
  scenarios,
  toneClasses,
  type AnalyzeResponse,
  type BackendStatus,
  type DisplayResult,
  type QualityKey,
  type Risk,
  type UploadMeta,
} from "../lib/maizeguard";

type AssessmentWorkspaceProps = {
  onAssessmentComplete?: (assessment: SavedAssessmentInput | null) => void;
  eyebrow?: string;
  title?: string;
  compact?: boolean;
  copy?: Partial<AssessmentWorkspaceCopy>;
};

export type AssessmentWorkspaceCopy = {
  readyToAssess: string;
  assessingImage: string;
  assessmentCompleted: string;
  modelApiUnavailable: string;
  backendOnline: string;
  checkingBackend: string;
  backendOffline: string;
  dropToUpload: string;
  dropPhoto: string;
  fileTypes: string;
  modelClasses: string;
  modelClassesSubtitle: string;
  classesCount: string;
  good: string;
  broken: string;
  impurity: string;
  moldRisk: string;
  lowRisk: string;
  mediumRisk: string;
  highRisk: string;
  prediction: string;
  assessmentResult: string;
  screeningReport: string;
  originalImageAnalyzed: string;
  result: string;
  backendLabel: string;
  confidence: string;
  risk: string;
  recommendedAction: string;
  backendEvidence: string;
  topPrediction: string;
  uploadToShowProbabilities: string;
  analyzeAnother: string;
  replaceImage: string;
  privacyTitle: string;
  privacyDescription: string;
  privacyLink: string;
  farmerGuidanceTitle: string;
  farmerGuidanceSubtitle: string;
  confidenceMeaning: string;
  evidenceByClass: string;
  practicalSteps: string;
  strongConfidence: string;
  mediumConfidence: string;
  lowConfidence: string;
  strongConfidenceText: string;
  mediumConfidenceText: string;
  lowConfidenceText: string;
  goodSteps: string[];
  brokenSteps: string[];
  impuritySteps: string[];
  moldRiskSteps: string[];
  reviewSteps: string[];
};

const defaultCopy: AssessmentWorkspaceCopy = {
  readyToAssess: "Ready to assess",
  assessingImage: "Assessing image...",
  assessmentCompleted: "Assessment completed",
  modelApiUnavailable: "Model API unavailable",
  backendOnline: "Backend online",
  checkingBackend: "Checking backend",
  backendOffline: "Backend offline",
  dropToUpload: "Drop to upload",
  dropPhoto: "Drop photo or click to browse",
  fileTypes: "JPG, PNG, WebP, up to",
  modelClasses: "Model classes",
  modelClassesSubtitle: "Four categories available for maize screening.",
  classesCount: "4 classes",
  good: "Good",
  broken: "Broken",
  impurity: "Impurity",
  moldRisk: "Mold risk",
  lowRisk: "Low risk",
  mediumRisk: "Medium risk",
  highRisk: "High risk",
  prediction: "Prediction",
  assessmentResult: "Assessment result",
  screeningReport: "Screening report",
  originalImageAnalyzed: "Original image analyzed",
  result: "Result",
  backendLabel: "Backend label",
  confidence: "Confidence",
  risk: "Risk",
  recommendedAction: "Recommended action",
  backendEvidence: "Backend model evidence",
  topPrediction: "Top prediction",
  uploadToShowProbabilities: "Upload a photo to show class probabilities from the model API.",
  analyzeAnother: "Analyze another",
  replaceImage: "Replace",
  privacyTitle: "Privacy",
  privacyDescription:
    "The image is sent to the model for prediction only and is not stored by MaizeGuard. Avoid faces, documents, or private information.",
  privacyLink: "Read privacy policy",
  farmerGuidanceTitle: "What this means for the farmer",
  farmerGuidanceSubtitle: "The percentages are converted into storage, sorting, cleaning, or review decisions.",
  confidenceMeaning: "Confidence meaning",
  evidenceByClass: "Evidence by class",
  practicalSteps: "Practical next steps",
  strongConfidence: "Strong model signal",
  mediumConfidence: "Useful but check the sample",
  lowConfidence: "Uncertain result",
  strongConfidenceText: "The model is confident. Use the recommendation, but still check the physical batch before a final decision.",
  mediumConfidenceText: "The model has a useful signal. Inspect the sample and repeat with a clearer photo if the batch is important.",
  lowConfidenceText: "The model is uncertain. Do not rely on this result alone; take another photo or ask for manual review.",
  goodSteps: [
    "Keep the maize dry and off the floor.",
    "Store in a clean bag or container.",
    "Monitor moisture and insects during storage.",
  ],
  brokenSteps: [
    "Separate broken kernels before storage or sale.",
    "Use sorted broken grain quickly where appropriate.",
    "Re-screen the cleaner batch after sorting.",
  ],
  impuritySteps: [
    "Remove stones, husks, dust, and foreign material.",
    "Clean the batch before weighing or selling.",
    "Take another photo after cleaning to confirm improvement.",
  ],
  moldRiskSteps: [
    "Do not mix this batch with clean maize.",
    "Avoid storage until the batch is checked.",
    "Refer the sample for quality or safety review.",
  ],
  reviewSteps: [
    "Take a clearer close-up photo of shelled maize.",
    "Check that the image contains maize only.",
    "Ask for manual review before storage, sale, or consumption.",
  ],
};

const modelClassGuide: Array<{
  key: QualityKey;
  labelKey: "good" | "broken" | "impurity" | "moldRisk";
  riskKey: "lowRisk" | "mediumRisk" | "highRisk";
  width: number;
  bar: string;
}> = [
  { key: "good", labelKey: "good", riskKey: "lowRisk", width: 36, bar: "bg-success" },
  { key: "broken", labelKey: "broken", riskKey: "mediumRisk", width: 64, bar: "bg-warning" },
  { key: "impurity", labelKey: "impurity", riskKey: "mediumRisk", width: 64, bar: "bg-warning" },
  { key: "mold_risk", labelKey: "moldRisk", riskKey: "highRisk", width: 100, bar: "bg-danger" },
];

const evidenceColors: Record<string, string> = {
  good: "bg-success",
  broken: "bg-warning",
  impurity: "bg-warning",
  mold_risk: "bg-danger",
};

const evidenceLabels: Record<QualityKey, keyof AssessmentWorkspaceCopy> = {
  good: "good",
  broken: "broken",
  impurity: "impurity",
  mold_risk: "moldRisk",
};

function confidenceBand(confidence: number, copy: AssessmentWorkspaceCopy) {
  if (confidence >= 85) {
    return { label: copy.strongConfidence, detail: copy.strongConfidenceText, tone: "text-success bg-success/10 border-success/20" };
  }
  if (confidence >= 65) {
    return { label: copy.mediumConfidence, detail: copy.mediumConfidenceText, tone: "text-warning bg-warning/10 border-warning/20" };
  }
  return { label: copy.lowConfidence, detail: copy.lowConfidenceText, tone: "text-danger bg-danger/10 border-danger/20" };
}

function farmerStepKey(result: DisplayResult): "goodSteps" | "brokenSteps" | "impuritySteps" | "moldRiskSteps" | "reviewSteps" {
  if (result.needsReview || resultRiskIsUnclear(result.risk)) return "reviewSteps";

  const qualityKey = normalizeQualityKey(result.rawLabel ?? result.label);
  if (qualityKey === "good") return "goodSteps";
  if (qualityKey === "broken") return "brokenSteps";
  if (qualityKey === "impurity") return "impuritySteps";
  if (qualityKey === "mold_risk") return "moldRiskSteps";
  if (result.risk === "High") return "moldRiskSteps";
  if (result.risk === "Medium") return "brokenSteps";
  return "goodSteps";
}

function evidenceRows(result: DisplayResult) {
  const probabilities = result.probabilities;
  if (probabilities && Object.keys(probabilities).length > 0) {
    return (Object.keys(evidenceLabels) as QualityKey[])
      .map((key) => ({ key, percent: Math.round((probabilities[key] ?? 0) * 100) }))
      .sort((a, b) => b.percent - a.percent);
  }

  const key = normalizeQualityKey(result.rawLabel ?? result.label) ?? "good";
  return (Object.keys(evidenceLabels) as QualityKey[])
    .map((itemKey) => ({ key: itemKey, percent: itemKey === key ? result.confidence : 0 }))
    .sort((a, b) => b.percent - a.percent);
}

export function AssessmentWorkspace({
  onAssessmentComplete,
  eyebrow = "Prediction workspace",
  title = "Upload a batch photo and review the result.",
  compact = false,
  copy: copyOverride,
}: AssessmentWorkspaceProps) {
  const copy = useMemo(() => ({ ...defaultCopy, ...copyOverride }), [copyOverride]);
  const [selected, setSelected] = useState<QualityKey | null>("good");
  const [fileName, setFileName] = useState("sample-maize-batch.jpg");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(copy.readyToAssess);
  const [analysisResult, setAnalysisResult] = useState<Partial<DisplayResult> | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadMeta, setUploadMeta] = useState<UploadMeta | null>(null);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("checking");
  const [backendModel, setBackendModel] = useState("MobileNetV3");
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => {
    let cancelled = false;

    async function checkBackend() {
      setBackendStatus("checking");
      try {
        const response = await fetch(modelApiBaseUrl(), { cache: "no-store" });
        if (!response.ok) throw new Error("Backend health check failed.");
        const contentType = response.headers.get("content-type") ?? "";
        const result = contentType.includes("application/json")
          ? ((await response.json()) as { model?: string })
          : {};
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
    ...baseResult,
    ...analysisResult,
    tone:
      analysisResult?.needsReview || resultRiskIsUnclear(analysisResult?.risk)
        ? "warning"
        : analysisResult?.tone ?? baseResult.tone,
  };
  const tones = toneClasses(result.tone);
  const confidenceInfo = confidenceBand(result.confidence, copy);
  const farmerSteps = copy[farmerStepKey(result)];
  const classEvidence = evidenceRows(result);
  const showSkeleton = isAnalyzing && !analysisResult;
  const backendStatusLabel =
    backendStatus === "online"
        ? copy.backendOnline
      : backendStatus === "checking"
        ? copy.checkingBackend
        : copy.backendOffline;
  const backendStatusClasses =
    backendStatus === "online"
      ? "border-success/25 bg-success/10 text-success"
      : backendStatus === "checking"
        ? "border-warning/25 bg-warning/10 text-warning"
        : "border-danger/25 bg-danger/10 text-danger";

  const analyzeFile = useCallback(async (file: File) => {
    setFileName(file.name);
    const nextPreview = URL.createObjectURL(file);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return nextPreview;
    });
    setUploadMeta({
      name: file.name,
      type: file.type,
      sizeKb: Math.max(1, Math.round(file.size / 1024)),
    });
    setAnalysisResult(null);
    onAssessmentComplete?.(null);
    setSelected(null);
    setIsAnalyzing(true);
    setLastUpdated(copy.assessingImage);

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

      try {
        apiResult = (await response.json()) as AnalyzeResponse;
      } catch {
        apiResult = {};
      }

      const backendLabel = apiResult.label ?? apiResult.raw_label;
      const backendRawLabel = apiResult.raw_label ?? apiResult.rawLabel ?? apiResult.label;
      const predicted =
        apiResult.key ??
        normalizeQualityKey(backendLabel) ??
        normalizeQualityKey(backendRawLabel);
      const isUnsupported =
        isUnsupportedBackendLabel(backendLabel) ||
        isUnsupportedBackendLabel(backendRawLabel);

      if (!response.ok || (!predicted && !isUnsupported)) {
        setSelected(null);
        setAnalysisResult({
          label: "Needs review",
          confidence: 0,
          risk: "Needs review",
          action: "Model unavailable",
          detail: apiResult.detail ?? apiResult.review_reason ?? "The backend model API did not return a usable prediction.",
          needsReview: true,
          tone: "warning",
        });
        setLastUpdated(copy.modelApiUnavailable);
        return;
      }

      const nextBase = predicted ? scenarios[predicted] : scenarios.good;
      const needsReview =
        isUnsupported ||
        (apiResult.needsReview ?? apiResult.needs_review ?? false);
      const confidence =
        apiResult.confidencePercent ??
        apiResult.confidence_percent ??
        (typeof apiResult.confidence === "number" && apiResult.confidence <= 1
          ? apiResult.confidence * 100
          : apiResult.confidence);
      const confidencePercent = typeof confidence === "number" ? Math.round(confidence) : nextBase.confidence;
      const impurityAtFullConfidence = predicted === "impurity" && confidencePercent >= 100;
      const shouldShowNeedsReview =
        needsReview ||
        isBackendReviewLabel(apiResult.label) ||
        impurityAtFullConfidence;
      const reviewReason =
        apiResult.review_reason ??
        (impurityAtFullConfidence
          ? "The model returned impurity with 100% confidence. This can happen on unsupported or unusual images, so the result should be reviewed before use."
          : null);

      setSelected(predicted ?? null);
      const nextResult: Partial<DisplayResult> = {
        label: shouldShowNeedsReview ? "Needs review" : formatModelLabel(apiResult.label ?? nextBase.label),
        confidence: confidencePercent,
        risk: isUnsupported || shouldShowNeedsReview
          ? "Needs review"
          : (apiResult.risk as Risk) ?? nextBase.risk,
        action: isUnsupported
          ? "Upload a clear maize image"
          : shouldShowNeedsReview
            ? "Needs review"
            : apiResult.action ?? nextBase.action,
        detail: apiResult.recommendation ?? reviewReason ?? apiResult.detail ?? nextBase.detail,
        needsReview: shouldShowNeedsReview,
        rawLabel: backendRawLabel,
        probabilities: apiResult.probabilities,
        source: "model-api",
        reviewReason,
        inputWidth: apiResult.input_width,
        inputHeight: apiResult.input_height,
        inferenceView: apiResult.inference_view,
        viewCount: apiResult.view_count,
        viewPredictions: apiResult.view_predictions,
        top2Margin: apiResult.top2_margin,
      };

      setAnalysisResult(nextResult);
      onAssessmentComplete?.({
        fileName: file.name,
        result: nextResult,
        upload: {
          name: file.name,
          type: file.type,
          sizeKb: Math.max(1, Math.round(file.size / 1024)),
          width: apiResult.input_width,
          height: apiResult.input_height,
        },
      });
      setLastUpdated(response.ok ? copy.assessmentCompleted : copy.assessmentCompleted);
    } catch {
      setSelected(null);
      setAnalysisResult({
        label: "Needs review",
        confidence: 0,
        risk: "Needs review",
        action: "Needs review",
        detail: "The backend model API is not reachable. Check the Hugging Face Space and CORS settings, then try again.",
        needsReview: true,
        tone: "warning",
      });
      setLastUpdated(copy.modelApiUnavailable);
    } finally {
      setIsAnalyzing(false);
    }
  }, [copy, onAssessmentComplete]);

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
  }, [analyzeFile]);

  function clearUpload() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFileName("sample-maize-batch.jpg");
    setAnalysisResult(null);
    onAssessmentComplete?.(null);
    setUploadMeta(null);
    setSelected("good");
    setLastUpdated(copy.readyToAssess);
    setUploadError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) validateAndAnalyze(file);
  }

  return (
    <section id="scan" className="scroll-mt-24">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className={`mt-3 max-w-2xl font-display font-semibold leading-tight text-ink ${
            compact ? "text-3xl md:text-4xl" : "text-4xl md:text-5xl"
          }`}>
            {title}
          </h2>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <span
            role="status"
            aria-live="polite"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm"
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-primary" />
            )}
            {lastUpdated}
          </span>
          <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm ${backendStatusClasses}`}>
            {backendStatus === "checking" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : backendStatus === "online" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <WifiOff className="h-4 w-4" />
            )}
            {backendStatusLabel}
          </span>
        </div>
      </div>

      {!compact && (
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase text-ink-soft">Model service</p>
            <p className="mt-1 truncate text-sm font-semibold text-ink">{backendModel}</p>
          </div>
          <div className="rounded-2xl border border-border bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase text-ink-soft">Integration</p>
            <p className="mt-1 text-sm font-semibold text-ink">Direct backend upload</p>
          </div>
          <div className="rounded-2xl border border-border bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase text-ink-soft">Image sent as</p>
            <p className="mt-1 text-sm font-semibold text-ink">Original file</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl bg-white p-6 shadow-xl shadow-black/[0.04] md:p-8">
          <label
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`group flex min-h-[22rem] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-4 text-center transition sm:p-5 ${
              dragOver
                ? "scale-[1.01] border-primary bg-primary/5"
                : "border-border bg-surface-2 hover:border-primary/50 hover:bg-surface-3/70"
            }`}
          >
            {previewUrl ? (
              <div className="relative flex w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-white p-2 shadow-sm">
                <img
                  src={previewUrl}
                  alt="Selected maize batch"
                  className="block max-h-[32rem] w-full object-contain"
                />
                <span className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-lg border border-border bg-white/95 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur">
                  <Camera className="h-3.5 w-3.5" />
                  {copy.replaceImage}
                </span>
              </div>
            ) : (
              <>
                <span className={`grid h-20 w-20 place-items-center rounded-2xl text-white shadow-sm transition group-hover:-translate-y-1 ${dragOver ? "scale-110 bg-primary" : "bg-primary"}`}>
                  <Upload className="h-8 w-8" />
                </span>
                <p className="mt-5 text-base font-semibold text-ink">
                  {dragOver ? copy.dropToUpload : copy.dropPhoto}
                </p>
                <p className="mt-1 text-sm text-ink-soft">{copy.fileTypes} {MAX_MB} MB</p>
              </>
            )}
            {previewUrl && (
              <span className="mt-4 inline-flex max-w-full items-center gap-2 truncate text-sm font-semibold text-ink">
                <FileImage className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate">{fileName}</span>
              </span>
            )}
            <input
              ref={inputRef}
              className="sr-only"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) validateAndAnalyze(file);
              }}
            />
          </label>

          {uploadError && (
            <p role="alert" className="mt-3 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
              <AlertTriangle className="h-4 w-4" />
              {uploadError}
            </p>
          )}

          <div className="mt-4 rounded-2xl border border-border bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
              {copy.privacyTitle}
            </p>
            <p className="mt-1 text-xs leading-5 text-ink-soft">{copy.privacyDescription}</p>
            <a
              href="/privacy-policy"
              className="mt-2 inline-flex text-xs font-bold text-primary underline-offset-4 hover:underline"
            >
              {copy.privacyLink}
            </a>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-surface-2/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-soft">
                {copy.modelClasses}
              </p>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink-soft">
                {copy.classesCount}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {modelClassGuide.map((item) => (
                <span
                  key={item.key}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                    selected === item.key
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border bg-white text-ink-soft"
                  }`}
                >
                  {copy[item.labelKey]}
                </span>
              ))}
            </div>
          </div>

          {!compact && (
            <>
              <div className="mt-4 rounded-2xl border border-border bg-surface-2/70 p-5">
                <div className="flex items-start gap-3">
                  <Layers3 className="mt-0.5 h-5 w-5 shrink-0 text-clay" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase text-ink">Mixed-risk priority</p>
                    <p className="mt-1.5 text-sm leading-6 text-ink-soft">{result.priority}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {priorityRules.map((rule, index) => (
                        <span key={rule.label} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${rule.tone}`}>
                          {index + 1}. {rule.label}
                        </span>
                      ))}
                    </div>
                    {uploadMeta ? (
                      <p className="mt-3 text-xs text-ink-soft">
                        Current upload: {uploadMeta.sizeKb} KB
                        {uploadMeta.width && uploadMeta.height ? `, ${uploadMeta.width} x ${uploadMeta.height}px` : ""}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="flex flex-wrap items-start justify-between gap-4 mt-4">
              <div>
                <p className="text-[11px] font-bold uppercase text-primary">{copy.farmerGuidanceTitle}</p>
                <p className="mt-1 text-sm leading-6 text-ink-soft">{copy.farmerGuidanceSubtitle}</p>
              </div>
              <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${confidenceInfo.tone}`}>
                {confidenceInfo.label}
              </span>
            </div>

            <div className="mt-4 rounded-xl border border-border bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">
                {copy.practicalSteps}
              </p>
              <ol className="mt-3 grid gap-2 sm:grid-cols-3">
                {farmerSteps.map((step, index) => (
                  <li key={step} className="flex gap-2 text-sm leading-5 text-ink-soft">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
        </div>

        <div
          id="results"
          aria-busy={isAnalyzing}
          className="scroll-mt-24 rounded-3xl bg-white p-6 shadow-xl shadow-black/[0.04] md:p-8"
        >
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-clay">{copy.assessmentResult}</p>
              {showSkeleton ? (
                <div className="mt-3 h-10 w-3/4 animate-pulse rounded-lg bg-muted" />
              ) : (
                <h3 className="mt-3 font-display text-3xl font-semibold leading-[1.05] text-ink md:text-4xl">
                  {result.label}
                </h3>
              )}
            </div>
            <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${tones.icon}`}>
              {isAnalyzing ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : result.needsReview || result.risk === "High" ? (
                <AlertTriangle className="h-6 w-6" />
              ) : (
                <CheckCircle2 className="h-6 w-6" />
              )}
            </div>
          </div>

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
              <p className="text-[11px] font-bold uppercase text-ink">{copy.screeningReport}</p>
              <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-ink-soft">
                {copy.originalImageAnalyzed}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <ReportMetric label={copy.result} value={showSkeleton ? copy.assessingImage : result.label} />
              <ReportMetric label={copy.backendLabel} value={formatModelLabel(result.rawLabel ?? result.label)} />
              <ReportMetric label={copy.confidence} value={showSkeleton ? copy.assessingImage : `${result.confidence}%`} />
              <ReportMetric label={copy.risk} value={String(result.risk)} />
            </div>
            {result.reviewReason ? (
              <div className="mt-3">
                <ReportMetric label="Review note" value={result.reviewReason} />
              </div>
            ) : null}
          </div>

          <div className={`mt-6 rounded-2xl border p-5 ${tones.panel}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase text-primary">{copy.recommendedAction}</p>
                <h4 className="mt-1.5 font-display text-2xl font-semibold leading-snug text-ink">
                  {result.action}
                </h4>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{result.detail}</p>
              </div>
              {previewUrl && (
                <button
                  type="button"
                  onClick={clearUpload}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                >
                  <RotateCcw className="h-4 w-4" />
                  {copy.analyzeAnother}
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-white p-5">

            <div className="mt-4 rounded-xl border border-border bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">
                {copy.evidenceByClass}
              </p>
              <div className="mt-4 space-y-3">
                {classEvidence.map((item) => (
                  <div key={item.key}>
                    <div className="mb-1.5 flex items-center justify-between gap-4 text-xs">
                      <span className="font-semibold text-ink">{copy[evidenceLabels[item.key]]}</span>
                      <span className="font-bold tabular-nums text-ink-soft">{item.percent}%</span>
                    </div>
                    <div
                      className="h-2.5 overflow-hidden rounded-full bg-white"
                      role="progressbar"
                      aria-valuenow={item.percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${evidenceColors[item.key]}`}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {(result.inferenceView || result.viewPredictions?.length || result.top2Margin !== undefined) && (
            <div className="mt-4 rounded-2xl border border-border bg-white">
              <button
                type="button"
                onClick={() => setEvidenceOpen((value) => !value)}
                aria-expanded={evidenceOpen}
                className="flex w-full items-center justify-between gap-3 p-5"
              >
                <span className="text-left">
                  <span className="block text-[11px] font-bold uppercase text-ink">{copy.backendEvidence}</span>
                  <span className="mt-1 block text-sm text-ink-soft">
                    {copy.topPrediction}:{" "}
                    <span className="font-semibold text-ink">
                      {formatModelLabel(result.rawLabel ?? result.label)}
                    </span>
                  </span>
                </span>
                <ChevronDown className={`h-5 w-5 text-ink-soft transition ${evidenceOpen ? "rotate-180" : ""}`} />
              </button>
              {evidenceOpen && (
                <div className="border-t border-border p-5 pt-4">
                  <div className="rounded-xl border border-border bg-surface-2 p-4">
                    <div className="grid gap-3 text-xs text-ink-soft sm:grid-cols-3">
                      {result.inferenceView && (
                        <div>
                          <p className="font-bold uppercase text-ink">View</p>
                          <p className="mt-1">{formatModelLabel(result.inferenceView)}</p>
                        </div>
                      )}
                      {result.viewCount !== undefined && (
                        <div>
                          <p className="font-bold uppercase text-ink">Checks</p>
                          <p className="mt-1">{result.viewCount} image view{result.viewCount === 1 ? "" : "s"}</p>
                        </div>
                      )}
                      {result.top2Margin !== undefined && (
                        <div>
                          <p className="font-bold uppercase text-ink">Top-2 margin</p>
                          <p className="mt-1">{Math.round(result.top2Margin * 100)}%</p>
                        </div>
                      )}
                    </div>
                    {result.viewPredictions?.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {result.viewPredictions.map((view) => (
                          <span
                            key={`${view.view}-${view.label}`}
                            className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink"
                          >
                            {formatModelLabel(view.view)}: {formatModelLabel(view.label)} - {Math.round(view.confidence * 100)}%
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
