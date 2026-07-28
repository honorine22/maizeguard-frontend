import { describe, expect, it } from "vitest";
import {
  formatModelLabel,
  isBackendReviewLabel,
  isUnsupportedBackendLabel,
  modelApiBaseUrl,
  modelPredictUrl,
  normalizeQualityKey,
  sanitizeModelApiUrl,
  topProbabilities,
} from "./maizeguard";

describe("MaizeGuard frontend contract helpers", () => {
  it("normalizes backend class labels into the four product classes", () => {
    expect(normalizeQualityKey("good")).toBe("good");
    expect(normalizeQualityKey("broken")).toBe("broken");
    expect(normalizeQualityKey("impurity")).toBe("impurity");
    expect(normalizeQualityKey("mold_risk")).toBe("mold_risk");
    expect(normalizeQualityKey("unsupported_image")).toBeNull();
  });

  it("builds the deployed backend predict URL from the configured base URL", () => {
    expect(modelApiBaseUrl()).toBe("https://honorineigiraneza-maizeguard-backend.hf.space");
    expect(modelPredictUrl()).toBe("https://honorineigiraneza-maizeguard-backend.hf.space/predict");
  });

  it("accepts browser-unfriendly local docs URLs and turns them into an API base URL", () => {
    expect(sanitizeModelApiUrl("http://0.0.0.0:8000/docs")).toBe("http://127.0.0.1:8000");
    expect(sanitizeModelApiUrl("http://127.0.0.1:8000/openapi.json")).toBe("http://127.0.0.1:8000");
  });

  it("recognizes review and unsupported backend labels", () => {
    expect(isBackendReviewLabel("needs_review")).toBe(true);
    expect(isUnsupportedBackendLabel("unsupported_image")).toBe(true);
    expect(isUnsupportedBackendLabel("broken")).toBe(false);
  });

  it("formats model labels and sorts class probabilities for display", () => {
    expect(formatModelLabel("mold_risk")).toBe("Mold Risk");
    expect(topProbabilities({ broken: 0.71, good: 0.12, mold_risk: 0.16, impurity: 0.01 })).toEqual([
      { label: "broken", percent: 71 },
      { label: "mold_risk", percent: 16 },
      { label: "good", percent: 12 },
      { label: "impurity", percent: 1 },
    ]);
  });
});
