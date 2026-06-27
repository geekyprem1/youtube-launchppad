import { RuleSet } from "../../core/scoring";
import { CoachFeatures } from "./features";

export const coachContextRulesV1: RuleSet = {
  version: "v1.0",
  rules: {
    urgency: {
      weight: 60, 
      label: "Intervention Urgency",
      calculate: (f: CoachFeatures) => f.urgencyScore
    },
    activity: {
      weight: 40,
      label: "Creator Activity",
      calculate: (f: CoachFeatures) => f.activityScore
    }
  }
};
