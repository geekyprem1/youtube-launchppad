import { z } from "zod";
import { logError } from "../logger";

/**
 * Validates a JSON string against a Zod schema.
 * @param jsonString The raw JSON string from an LLM.
 * @param schema The Zod schema to validate against.
 * @param fallback A safe fallback object to return if validation completely fails.
 * @returns The parsed and validated object, or the fallback.
 */
export function validateAIResponse<T>(
  jsonString: string,
  schema: z.ZodSchema<T>,
  fallback: T
): T {
  try {
    // Strip markdown code block wrappers if they exist
    const cleaned = jsonString.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    const parsed = JSON.parse(cleaned);
    return schema.parse(parsed);
  } catch (err) {
    logError("AI_VALIDATION", err);
    return fallback;
  }
}
