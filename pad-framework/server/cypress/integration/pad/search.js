/**
 * Test for searching a book
 *
 * @author Thijs van der Pouw kraan
 */


describe("search", function () {
    //Run before each test in this context
    beforeEach(() => {
        //Set user as logged in
        const session = {"username": "test"};
        localStorage.setItem("session", JSON.stringify(session));

        //Go to the specified URL
        cy.visit("http://localhost:8080/#boekenOverzicht");
    });


            //Test: Validate search form
            it("Valid Search form", function () {
                //Find the field for the search bar, check if it exists.
                cy.get("#queryInput").should("exist");

                //Find the field for the submit button, check if it exists.
                cy.get(".btn").should("exist");

            });

        it("successful search", function () {
            cy.server();

            cy.route("GET", "/oba/search", {"bookId": "test"}).as("search");

            cy.route({
                url: "/oba/search",
                method: 'GET',
            response: {
                "meta": {
                    "time-taken": "79"
                },
                "record": {
                    "id": "|oba-catalogus|875341",
                    "frabl": {
                        "key1": "de reus van mikkie",
                        "key2": "paul van loon",
                        "cnt": "1",
                        "value": "143FEB9930F360A0"
                    },
                    "detailLink": "http://zoeken.oba.nl/detail/Paul-van-Loon/Een-mooi-geheim/Boek/?itemid=%7coba-catalogus%7c875341",
                    "titles": [
                        "Een mooi geheim",
                        "Een mooi geheim / Paul van Loon"
                    ],
                    "isbn": [
                        "9789027668745"
                    ],
                    "coverimages": [
                        "https://cover.biblion.nl/coverlist.dll?doctype=morebutton&bibliotheek=oba&style=0&ppn=314216960&isbn=9789027668745&lid=&aut=&ti=&size=120",
                        "https://v112.nbc.bibliotheek.nl/thumbnail?uri=http://data.bibliotheek.nl/ggc/ppn/314216960&token=c1322402"
                    ],
                    "formats": [
                        {
                            "text": "Boek",
                            "icon": "/assets/resources/img/mat/book.png?skin=oba&bld=20200602.094047"
                        }
                    ],
                    "authors": [
                        "Paul van Loon",
                        "Daniëlle Schothorst",
                        "Richard van de Waarsenburg"
                    ],
                    "authorsDetailed": [
                        {
                            "full": "Paul van Loon",
                            "firstname": "Paul",
                            "lastname": "Loon",
                            "creatortype": "person"
                        },
                        {
                            "full": "Daniëlle Schothorst",
                            "lastname": "Daniëlle Schothorst",
                            "creatortype": "organization"
                        },
                        {
                            "full": "Richard van de Waarsenburg",
                            "lastname": "Richard van de Waarsenburg",
                            "creatortype": "organization"
                        }
                    ],
                    "year": "2008",
                    "year": "2008",
                    "publisher": [
                        "Zwijsen, Tilburg, 2008"
                    ],
                    "subject-topical": [
                        "Klein zijn",
                        "Fantasievriendjes",
                        "Grootvaders",
                        "Pesten"
                    ],
                    "languages": [
                        "Nederlands"
                    ],
                    "summaries": [
                        "Mikkie wordt op school erg geplaagd, omdat hij zo klein is. Hij heeft echter een groot geheim. Alleen opa gelooft echt wat hij vertelt. AVI-M4. Vanaf ca. 7 jaar."
                    ],
                    "description": [
                        "33 p",
                        "33 p: ill ; 22 cm"
                    ],
                    "note": "Oorspr. titel: De reus van Mikkie. - 1990. - (Neushoorn ; 5)",
                    "series": [
                        {
                            "text": "Lees! met Paul van Loon $ [Groep 4]"
                        }
                    ],
                    "undup": {
                        "alsoAvailableAsCount": "2",
                        "items": [
                            {
                                "key1": "de reus van mikkie",
                                "key2": "paul van loon",
                                "cnt": "1",
                                "value": "143FEB9930F360A0"
                            }
                        ]
                    }
                }
            }
        }).as("search");


        cy.get("#queryInput").type( "test");

        cy.get(".btn").click();

        cy.wait("@search");

        cy.get("@search").should((xhr) => {
            expect(xhr.request.params.id).equals("test");
        });

        //after a succesful search, the url

    });

});

