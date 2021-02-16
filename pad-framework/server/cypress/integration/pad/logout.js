/**
 * Test for logging out
 *
 * @author Alec Wouda
 */

//Context: Logging out
describe("Logout", function () {
    //Run before each test in this context
    beforeEach(() => {
        //Set user as logged in
        const session = {"username": "test"};
        localStorage.setItem("session", JSON.stringify(session));

        //Go to the specific URL
        cy.visit("http://localhost:8080/#home");
    });

    //Test: Validate if logout works
    it("Logging out", function () {

        //Find logout button in view, check if exist
        cy.get(".logout").should("exist");

        //Click on button
        cy.get('.logout').click();

        //Check if redirect is to login page
        cy.url().should('include', '#login');

    });

    //Test: Check if buttons are gone after logging out
    it('If logged out buttons gone', function () {
        //Go to login page
        cy.visit("http://localhost:8080/#login");

        //Check if all buttons are gone
        cy.get(".home").should('not.exist');
        cy.get(".overzicht").should('not.exist');
        cy.get(".scanner").should('not.exist');
        cy.get(".inleveren").should('not.exist');
        cy.get(".logout").should('not.exist');
        cy.get(".account").should('not.exist');
    });

    //Test: Check if session is empty when logged out
    it('session gone', function () {
        //Visit home page
        cy.visit("http://localhost:8080/#home");

        //Check if logout button exists
        cy.get(".logout").should('exist');

        //Click on button
        cy.get(".logout").click();

        //Check if url is valid
        cy.url().should('include', '#login');

        //Check if logout button is gone
        cy.get(".logout").should('not.exist');

        //Empty localstorage
        localStorage.clear();

        //Check if session is null
        expect(localStorage.getItem("session")).to.eq(null);
    });


});