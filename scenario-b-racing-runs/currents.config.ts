import { CurrentsConfig } from "@currents/playwright";

/**
 * Deliberately without the Argos `onFinish` hook the repo root config carries —
 * these scenarios only exercise the GitHub run comment.
 */
const config: CurrentsConfig = {
  projectId: process.env.CURRENTS_PROJECT_ID || "mdXsz8",
  recordKey: process.env.CURRENTS_RECORD_KEY || "KPEvZL0LDYzcZH3U",
  ciBuildId: process.env.CURRENTS_CI_BUILD_ID || Date.now().toString(),
};

export default config;
