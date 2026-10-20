describe("checkout", () => {
  beforeEach(() => {
    cy.visit("app/index.html");
  });

  it("lists the cart items", () => {
    cy.get("[data-cy=item]").should("have.length", 2);
  });

  it("applies the discount to the total", () => {
    cy.get("[data-cy=total]").should("have.text", "Total: $37.80");
  });

  it("adds up the item prices", () => {
    cy.get("[data-cy=item]").then(($items) => {
      const sum = [...$items].reduce((s, el) => s + Number(el.dataset.price), 0);
      expect(sum).to.equal(45);
    });
  });
});
