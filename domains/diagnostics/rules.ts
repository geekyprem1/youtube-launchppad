import { RuleSet } from "../../core/scoring";
import { DiagnosticFeatures } from "./features";

export const growthScoreRulesV1: RuleSet = {
  version: "v1.2",
  rules: {
    ctr: {
      weight: 35,
      label: "Click-Through Rate",
      calculate: (f: DiagnosticFeatures) => f.ctrScore
    },
    retention: {
      weight: 35,
      label: "Audience Retention",
      calculate: (f: DiagnosticFeatures) => f.retentionScore
    },
    seo: {
      weight: 15,
      label: "SEO Optimization",
      calculate: (f: DiagnosticFeatures) => f.seoScore
    },
    consistency: {
      weight: 15,
      label: "Upload Consistency",
      calculate: (f: DiagnosticFeatures) => f.consistencyScore
    }
  }
};
