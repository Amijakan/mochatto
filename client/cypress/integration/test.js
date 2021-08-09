describe("Server tests", () => {
	const name = `Cy_${Cypress._.random(1000)}`
	it("joins", () => {
		cy.task("connect");
		cy.task("join", name).then(
			user => {
				expect(name).to.eq(user.name);
			}
		);
	});
	it("requests", () => {
		cy.task("connect");
		cy.task("requestUsers").then(
			users => {
				expect(users).to.have.length(1);
			}
		);
	});
	it("clears", () => {
		cy.task("connect");
		cy.task("clearUsers");
		cy.task("requestUsers").then(
			users => {
				expect(users).to.have.length(0);
			}
		);
	});
});
