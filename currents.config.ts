import { CurrentsConfig } from "@currents/playwright";

const config: CurrentsConfig = {
  projectId: process.env.CURRENTS_PROJECT_ID || "mdXsz8",
  recordKey: process.env.CURRENTS_RECORD_KEY || "KPEvZL0LDYzcZH3U",
  ciBuildId: Date.now().toString(),
  orchestration: {
    skipReporterInjection: true,
    onFinish: async () => {
      try {
        const execa = await import("execa");
        const resultUpload = await execa("npx", [
          "argos",
          "upload",
          "./screenshots",
        ]);
        console.log(resultUpload);
        const resultFinalize = await execa("npx", ["argos", "finalize"]);
        console.log(resultFinalize);
      } catch (e) {
        console.error(e);
      }
    },
  },
};

export default config;
