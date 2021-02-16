//Always visit #login page and click on the login button
describe("login", function () {
    beforeEach(() => {
        cy.visit("http://localhost:8080/#login");
        cy.contains('Inloggen').click();
    });

    it("Valid login form", function () {
        //Check if Username, Password and btn exist on the login form
        cy.get('.username').should("exist");

        cy.get('.password').should("exist");

        cy.get('.btn').should("exist");
    });


    it("Successful login", function () {

        cy.server();
        //get the POST /user/login from app.js
        cy.route("POST", "/user/login", {"username": "22000002345678"}).as("login");

        //add text in the Username and Password form.
        //after that press the loginbtn
        cy.get('.username').type("22000002345678");

        cy.get('.password').type("1");

        cy.get('.Loginbtn').click();

        cy.wait("@login");
        //check if the username and password are the same as filled in above
        cy.get("@login").should((xhr) => {
            expect(xhr.request.body.username).equals("22000002345678");
            expect(xhr.request.body.password).equals("1");
        })

        cy.url().should('include', '#home');
    });

    it("Failed login", function () {
        cy.server();
        //Get the error from app.js
        cy.route({
            method: "POST", url: "/user/login",
            response: {
                reason: "ERROR"
            }, status: 401
        }).as("login");


        cy.get('.username').type("22000002345678");

        cy.get('.password').type("1");

        cy.get('.Loginbtn').click();

        cy.wait("@login");
        //Check if the error exists and contain the value error
        cy.get(".error").should("exist").should("contain", "ERROR");
    });
});