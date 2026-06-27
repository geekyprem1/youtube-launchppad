import { RawCoachContext } from "./data";

export interface CoachFeatures {
  urgencyScore: number; // 0-100 (high if they are falling behind goals)
  activityScore: number; // 0-100 (high if they are uploading frequently)
}

export function extractCoachFeatures(raw: RawCoachContext): CoachFeatures {
  // Urgency is high if they have unresolved issues from diagnostics
  const urgencyScore = Math.min(100, raw.unresolvedIssues * 33);
  
  // Activity is high if they upload at least 4 times a month (weekly)
  const activityScore = Math.min(100, (raw.recentUploads / 4) * 100);

  return {
    urgencyScore,
    activityScore
  };
}
