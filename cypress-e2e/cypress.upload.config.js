// Cypress 13+ config: no cypress-cloud. `currents run upload` reads the file
// written in `after:run`, and the screenshots and videos next to it.
const fs = require("fs");

module.exports = {
  video: true,
  screenshotOnRunFailure: true,
  retries: { runMode: 1, openMode: 0 },
  e2e: {
    supportFile: false,
    specPattern: "cypress/e2e/**/*.cy.js",
    setupNodeEvents(on) {
      on("after:run", (results) => {
        fs.mkdirSync("results", { recursive: true });
        fs.writeFileSync(
          `results/cypress-results-${process.env.MACHINE_INDEX ?? 1}.json`,
          JSON.stringify(results)
        );
      });
    },
  },
};
