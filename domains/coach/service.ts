import { fetchCoachContext } from "./data";
import { extractCoachFeatures } from "./features";
import { scoreCoachContext } from "./scoring";
import { buildCoachPromptV1 } from "./prompts/v1";
import { generateAIResponse } from "../../core/openrouter";
import { validateAIResponse } from "../../core/validation";
import { CoachAnalysisSchema, CoachRequest } from "./types";
import { APIResponse } from "../../types/api";

const FALLBACK_ANALYSIS = {
  reply: "I'm having trouble connecting to my brain right now. Can we try again in a moment?",
  suggested_actions: []
};

export async function processCoachChat(userId: string, request: CoachRequest): Promise<APIResponse> {
  // 1. Data Layer
  const rawContext = await fetchCoachContext(userId);

  // 2. Feature Extraction
  const features = extractCoachFeatures(rawContext);

  // 3. Scoring Engine (Context Urgency)
  const { contextScore } = scoreCoachContext(features);

  const metricsForLLM = {
    urgency_level: contextScore.total,
    current_goal: rawContext.currentGoal,
    unresolved_issues: rawContext.unresolvedIssues,
    recent_uploads: rawContext.recentUploads,
  };

  // 4. AI Reasoning
  const prompt = buildCoachPromptV1(metricsForLLM, request.messages);
  const aiRawResponse = await generateAIResponse(
    [{ role: "user", content: prompt }], 
    { json: true, promptVersion: "coach.v1" }
  );

  // 5. Validation Layer
  const analysis = validateAIResponse(aiRawResponse, CoachAnalysisSchema, FALLBACK_ANALYSIS);

  // 6. Universal Contract Response
  return {
    version: {
      scoring: "1.0",
      rules: contextScore.version,
      prompt: "v1.0"
    },
    metrics: {
      context_score: contextScore.total,
    },
    analysis,
  } as any; 
}
