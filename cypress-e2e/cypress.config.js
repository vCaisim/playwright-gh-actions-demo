const { defineConfig } = require("cypress");
const { cloudPlugin } = require("cypress-cloud/plugin");

module.exports = defineConfig({
  video: true,
  screenshotOnRunFailure: true,
  retries: { runMode: 1, openMode: 0 },
  e2e: {
    supportFile: "cypress/support/e2e.js",
    specPattern: "cypress/e2e/**/*.cy.js",
    setupNodeEvents(on, config) {
      return cloudPlugin(on, config);
    },
  },
});
