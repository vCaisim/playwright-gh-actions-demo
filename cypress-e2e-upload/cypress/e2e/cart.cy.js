describe("cart", () => {
  beforeEach(() => {
    cy.visit("app/index.html");
  });

  // Fails on the first attempt and passes on the retry, so the run has a
  // flaky test.
  it("keeps the cart after a reload", () => {
    cy.reload();
    cy.get("[data-cy=item]").should(
      "have.length",
      Cypress.currentRetry === 0 ? 3 : 2
    );
  });
});
