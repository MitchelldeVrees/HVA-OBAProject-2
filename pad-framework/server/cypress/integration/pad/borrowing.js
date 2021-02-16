/**
 * Test for borrowing books
 *
 * @author Stephen Smit
 */

//Context: Borrowing books
describe("borrowing", function () {
    //Run before each test in this context
    beforeEach(() => {
        //Set user as logged in
        const session = {"username": "test"};
        localStorage.setItem("session", JSON.stringify(session));

        //Go to the specific URL
        cy.visit("http://localhost:8080/#boekenOverzichtDetailed");

        //start fake server
        cy.server();

        //Add a stub with the URL /details as a GET
        //Respond with a JSON-object found in fixture folder
        //Give the stub the alias: @boekDetails
        cy.route("GET", "/details", "fixture:bookDetailsResponse").as("boekDetails");

        //Add a stub with the URL /availability as a GET
        //Respond with a JSON-object found in fixture folder
        //Give the stub the alias: @availability
        cy.route("GET", "/availability", "fixture:bookAvailabilityResponse").as("availability");

        //Wait for the @boekDetails to be called when opening the page
        cy.wait("@boekDetails");

        //The @boekDetails is called, check the contents of the incoming request.
        cy.get("@boekDetails").should((xhr) => {
            expect(xhr.request.body.id).equals("|oba-catalogus|875341");
        });

        //Wait for the @availability after @boekDetails has finished
        cy.wait("@availability");

        //The @availability is called, check the contents of the incoming request.
        cy.get("@availability").should((xhr) => {
            expect(xhr.request.body.id).equals("|oba-catalogus|875341");
        });
    });

    //Test: Validate book info
    it("validate detailed book info", () => {
        //Find card with main book information, check if exist
        cy.get("#card-indexMain").should("exist");

        //Find button for borrowing, check if exist
        cy.get(".btn").should("exist");

        //Find card with book availability, check if exist
        cy.get("#card-indexAvailability").should("exist");

        //Find card with book details, check if exist
        cy.get("#card-indexDetail").should("exist");
    })

    //Test: Book has already been borrowed
    it("Book already borrowed", () => {
        //Add a stub with the URL /geleendeBoeken/lenen as a GET
        //Respond with a JSON-object when requested
        //Give the stub the alias: @geleendBoek
        cy.route("GET", "geleendeBoeken/lenen", {"isGeleend": 1}).as("geleendBoek");

        //Find the button and click it
        cy.get(".btn").click();

        //Wait for the @geleendBoek to be called by the click-event
        cy.wait("@geleendBoek");

        //The @geleendBoek is called, check the contents of the incoming request.
        cy.get("@geleendBoek").should((xhr) => {
            //The isbn should match the isbn found on the page
            expect(xhr.request.body.isbn).equals("9789027668745");
        });

        //checks if a alert window shows with the correct text
        cy.on('window:alert', (str) => {
            expect(str).to.equal(`Dit boek is al geleend`)
        })
        }
    )

    //Test: Borrowing a book
    it("Succesful borrowing a book", () => {
        //Add a stub with the URL /geleendeBoeken/lenen as a GET
        //Respond with a JSON-object when requested
        //Give the stub the alias: @geleendBoek
        cy.route("GET", "geleendeBoeken/lenen", {"isGeleend": 0}).as("geleendBoek");

        //Add a stub with the URL /geleendeBoeken/lenen as a POST
        //Respond with a JSON-object when requested
        //Give the stub the alias @plaatsLening
        cy.route("POST", "geleendeBoeken/lenen", {"result": true}).as("plaatsLening");

        //Add a stub with the URL /geleendeBoeken/lenen as a PUT
        //Respond with a JSON-object when requested
        //Give the stub the alias @statusGeleend
        cy.route("PUT", "geleendeBoeken/lenen", {"result": true}).as("statusGeleend");

        //Find the button and click it
        cy.get(".btn").click();

        //Wait for the @geleendBoek to be called by the click-event
        cy.wait("@geleendBoek");

        //The @geleendBoek is called, check the contents of the incoming request
        cy.get("@geleendBoek").should((xhr) => {
            //The isbn should match the isbn found on the page
            expect(xhr.request.body.isbn).equals("9789027668745");
        });

        //Wait for the @plaatsLening to be called after @geleendBoek has finished
        cy.wait("@plaatsLening");

        //@plaatsLening is called, check the contents of the incoming request
        cy.get("@plaatsLening").should((xhr) => {
            //the username should match the username of the session
            expect(xhr.request.body.username).equals("test");

            //The isbn should match the isbn found on the page
            expect(xhr.request.body.isbn).equals("9789027668745");
        })

        //Wait for the @statusGeleend to be called after @plaatsLening has finished
        cy.wait("@statusGeleend");

        //@statusGeleend is called, check the contents of the incoming request
        cy.get("@statusGeleend").should((xhr) => {
            //The isbn should match the isbn found on the page
            expect(xhr.request.body.isbn).equals("9789027668745");
        })

        //After succesfully borrowing the book, the URL should now contain #home.
        cy.url().should("contain", "#home");
    })
})