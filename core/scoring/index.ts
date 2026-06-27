export interface ScoreRule {
  weight: number;
  calculate: (features: any) => number; // Returns a 0-100 score for this specific rule
  label: string;
}

export interface RuleSet {
  version: string;
  rules: Record<string, ScoreRule>;
}

export interface ScoringResult {
  total: number;
  version: string;
  breakdown: Record<string, { value: number; label: string; impact: string }>;
}

export function calculateScore(features: any, ruleSet: RuleSet): ScoringResult {
  let totalScore = 0;
  let totalWeight = 0;
  const breakdown: Record<string, { value: number; label: string; impact: string }> = {};

  for (const [key, rule] of Object.entries(ruleSet.rules)) {
    const rawScore = Math.max(0, Math.min(100, rule.calculate(features)));
    const weightedScore = rawScore * (rule.weight / 100);
    
    totalScore += weightedScore;
    totalWeight += rule.weight;
    
    let impact = "neutral";
    if (rawScore >= 80) impact = "strong";
    else if (rawScore < 40) impact = "weak";
    
    breakdown[key] = {
      value: Math.round(weightedScore), // Contribution to the total
      label: rule.label,
      impact
    };
  }
  
  // Normalize if weights don't exactly equal 100
  if (totalWeight > 0 && totalWeight !== 100) {
    totalScore = (totalScore / totalWeight) * 100;
  }

  return {
    total: Math.round(totalScore),
    version: ruleSet.version,
    breakdown
  };
}
