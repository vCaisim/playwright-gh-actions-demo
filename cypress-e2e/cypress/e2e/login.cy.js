describe("login", () => {
  beforeEach(() => {
    cy.visit("app/index.html");
  });

  it("shows the title", () => {
    cy.get("[data-cy=title]").should("contain", "Shop");
  });

  it("signs in with valid credentials", () => {
    cy.get("[data-cy=email]").type("user@example.com");
    cy.get("[data-cy=password]").type("correct-password");
    cy.get("[data-cy=submit]").click();
    cy.get("[data-cy=message]").should("have.text", "Welcome back");
  });
});
