/**
 * FE-OTO-ACCESS-PLAN Phase F — pure logic smoke tests (no DB).
 * Run: node scripts/smoke-fe-oto-access.mjs
 *
 * Mirrors lib/features.ts canAccess rules for CI / local verify.
 */

const FE_FEATURES = [
  "video_engine",
  "video_engine_history",
  "thumbnail_basic",
  "thumbnail_history",
];

const ALL_ACCESS_PLANS = ["elite", "creator_pro", "ultimate"];
const ALL_FEATURES = [
  "video_engine",
  "voice_studio",
  "toolkit",
  "clickbait",
  "video_creation_pro",
  "predictor",
  "ideas",
  "competitors",
  "keywords",
  "retention",
  "channel_engine",
  "optimize",
  "video_kit",
];

const OTO_UNLOCKS = {
  oto1: ["video_kit"],
  oto2: ["voice_studio"],
  oto3: ["clickbait"],
  oto4: ["optimize"],
  oto5: ["channel_engine", "ideas", "competitors", "keywords"],
  oto6: ["predictor"],
  oto7: ["retention"],
  oto8: ["toolkit"],
  oto9: ["video_creation_pro", "voice_studio", "clickbait", "video_kit"],
  oto12: "all",
};

function canAccess(plan, unlockedOtos, featureKey, { isAdmin } = {}) {
  if (isAdmin) return true;
  if (ALL_ACCESS_PLANS.includes(plan)) return true;

  const otos = unlockedOtos || [];
  if (otos.map((o) => o.toLowerCase()).includes("oto12")) return true;

  for (const id of otos) {
    const unlocks = OTO_UNLOCKS[id.toLowerCase()];
    if (!unlocks) continue;
    if (unlocks === "all") return true;
    if (unlocks.includes(featureKey)) return true;
  }

  if (plan === "fe") return FE_FEATURES.includes(featureKey);
  if (plan === "free") return false;

  // legacy starter/pro — minimal smoke: starter has ideas
  if (plan === "starter" && featureKey === "ideas") return true;
  if (plan === "pro" && ["ideas", "competitors", "retention"].includes(featureKey))
    return true;

  return false;
}

const cases = [
  // F1 free
  ["free", [], "video_engine", false, "free locks VE"],
  ["free", [], "voice_studio", false, "free locks voice"],
  ["free", [], "thumbnail_basic", false, "free locks thumb"],
  // FE open core
  ["fe", [], "video_engine", true, "FE opens VE"],
  ["fe", [], "thumbnail_basic", true, "FE opens thumb"],
  ["fe", [], "video_engine_history", true, "FE opens VE history"],
  // FE locked extras
  ["fe", [], "voice_studio", false, "FE locks voice"],
  ["fe", [], "toolkit", false, "FE locks toolkit"],
  ["fe", [], "video_kit", false, "FE locks kit"],
  ["fe", [], "predictor", false, "FE locks predictor"],
  ["fe", [], "channel_engine", false, "FE locks channel"],
  // OTO unlocks
  ["fe", ["oto2"], "voice_studio", true, "oto2 unlocks voice"],
  ["fe", ["oto2"], "toolkit", false, "oto2 does not unlock toolkit"],
  ["fe", ["oto1"], "video_kit", true, "oto1 unlocks kit"],
  ["fe", ["oto5"], "ideas", true, "oto5 unlocks ideas"],
  ["fe", ["oto5"], "channel_engine", true, "oto5 unlocks channel"],
  // F2 Infinity
  ["fe", ["oto12"], "voice_studio", true, "oto12 all voice"],
  ["fe", ["oto12"], "toolkit", true, "oto12 all toolkit"],
  ["fe", ["oto12"], "predictor", true, "oto12 all predictor"],
  ["free", ["oto12"], "video_engine", true, "oto12 even on free"],
  // F3 Admin
  ["free", [], "voice_studio", true, "admin bypass", { isAdmin: true }],
  ["fe", [], "toolkit", true, "admin bypass toolkit", { isAdmin: true }],
  // Legacy tiers
  ["ultimate", [], "voice_studio", true, "ultimate all"],
  ["elite", [], "clickbait", true, "elite all"],
];

let fail = 0;
for (const [plan, otos, feat, expected, name, opts] of cases) {
  const got = canAccess(plan, otos, feat, opts || {});
  const ok = got === expected;
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}: canAccess(${plan}, ${JSON.stringify(otos)}, ${feat}) => ${got} (want ${expected})`);
}

// Sanity: every ALL_FEATURES true under oto12
for (const f of ALL_FEATURES) {
  const got = canAccess("fe", ["oto12"], f);
  if (!got) {
    fail++;
    console.log(`FAIL  oto12 missing ${f}`);
  }
}

console.log("");
console.log(fail === 0 ? "ALL SMOKE CASES PASSED" : `${fail} FAILED`);
process.exit(fail === 0 ? 0 : 1);
