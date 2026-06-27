export interface RawCoachContext {
  userId: string;
  recentUploads: number; // last 30 days
  currentGoal: string;
  unresolvedIssues: number;
}

export async function fetchCoachContext(userId: string): Promise<RawCoachContext> {
  // Mock data fetch for the AI Coach's memory of the user
  return {
    userId,
    recentUploads: 2, // Below ideal frequency
    currentGoal: "Reach 100k subscribers by Q4",
    unresolvedIssues: 3, // From diagnostics
  };
}
