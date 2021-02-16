/**
 * Test for selecting a book to return
 *
 * @author Faris Abahri
 */

//Context: Selecting book to return
describe("returnselection", function () {
    //Run before each test in this context
    beforeEach(() => {
        //Set user as logged in
        const session = {"username": "test"};
        localStorage.setItem("session", JSON.stringify(session));

        //Go to the specific URL
        cy.visit("http://localhost:8080/#inleveren");
    });

    //Test: Validate book cards
    it("validate book cards", function () {

        //Start a fake server
        cy.server();

        //Add a stub with the URL /inleveren/ipAdres as a GET
        //Respond with a JSON-object when requested
        //Give the stub the alias: @ipAdres
        cy.route("GET", "/inleveren/ipAdres", {}).as("ipAdres");

        //Add a stub with the URL /geleendeBoeken/leningen as a GET
        //Respond with a JSON-object when requested
        //Give the stub the alias: @leningen
        cy.route("GET", "/geleendeBoeken/leningen", {"username": "22000002345678"}).as("leningen");
        
        //Find body of the card, check if it exists.
        cy.get(".card-body").should("exist");

        //Find title of the book in the card, check if it exists.
        cy.get(".card-title").should("exist");

        //Find text in the card with information regarding the book, check if it exists.
        cy.get(".card-text").should("exist");

        //Find button in the card to return the book, check if it exists.
        cy.get(".btn").should("exist");
    });

//Test: Successful selection
    it("Successful selection", function () {
        //Start a fake server
        cy.server();

        //Add a stub with the URL /inleveren as a POST
        //Respond with a JSON-object when requested
        //Give the stub the alias: @login
        cy.route("POST", "/inleveren", {"isbn": "test"}).as("inleveren");

        //Find button for inleveren, check if it exists.
        cy.get(".btn").click();

        //Wait for the @inleveren-stub to be called by the click-event.
        cy.wait("@inleveren");

        //The @inleveren-stub is called, check the contents of the incoming request.
        cy.get("@inleveren").should((xhr) => {
            //The isbn should match the correct length
            expect(xhr.request.body.isbn).length(13);
        });

        //After a successful selection, the URL should now contain #inleverenScanner.
        cy.url().should("contain", "#inleverenScanner");
    });

    //Test: Failed selection
    it("Failed selection", function () {
        //Start a fake server
        cy.server();

        //Add a stub with the URL /inleveren as a POST
        //Respond with a JSON-object when requested and set the status-code tot 401.
        //Give the stub the alias: @inleveren
        cy.route({
            method: "GET",
            url: "/inleveren",
            response: {
                reason: "ERROR"
            },
            status: 401
        }).as("inleveren");

        //After a failed selection, an element containing our error-message should be shown.
        cy.get(".error").should("exist").should("contain", "ERROR");
    });
    
});
