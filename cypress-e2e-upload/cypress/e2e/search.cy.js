describe("search", () => {
  it("accepts a query", () => {
    cy.visit("app/index.html");
    cy.get("[data-cy=search]").type("mug").should("have.value", "mug");
  });
});
