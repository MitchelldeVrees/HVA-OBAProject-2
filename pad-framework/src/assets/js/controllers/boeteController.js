/**
 * Controller responsible for showing the fines
 *
 * @author Mitchell de Vries
 */

class boeteController {

    constructor() {


        this.geleendeBoekRepository = new GeleendeBoekRepository();


        this.boete.bind(this);

        $.get("views/inleveren.html")
            .done((data) => this.setup(data))
            .fail(() => this.error())
    }

    setup(data, book) {
        //Load the welcome-content into memory
        this.inleverenScannerView = $(data);


        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.inleverenScannerView);

        this.boeteCard();

    }

    boete(inleverdatum, today) {
        const differenceInDays = (today - inleverdatum) / (1000 * 3600 * 24);
        const diffenceInDaysRounded = Math.round(differenceInDays);


        const boete = diffenceInDaysRounded * 0.05;
        const boeteRounded = Math.round(boete * 100) / 100;
        
        return boeteRounded.toFixed(2);


    }

    async boeteCard() {

        const username = sessionManager.get("username");
        const leenData = await this.geleendeBoekRepository.getLeenInfo(username);
        const today = new Date();

        let temp, i, clone;

        temp = $("template")[0];

        for (i in leenData) {

            let title = leenData[i].title;
            const isbn = leenData[i].isbn;
            let inleverdatum = new Date(leenData[i].inleverdatum);
            let inleverdatumString = new Date(inleverdatum).toISOString().slice(0, 10);
            let boete = this.boete(inleverdatum, today);
            if (this.boete(inleverdatum, today) > 0) {

                temp.content.querySelector(".inlevertitle").textContent = "Titel: " + title;
                temp.content.querySelector(".inlevertext").textContent = "ISBN: " + isbn + "\n" + "inleverdatum: " + inleverdatumString;

                if (boete > 0.05) {
                    temp.content.querySelector("#afbetalen").textContent = "Boete: \u20AC" + (boete);
                }

                    temp.content.querySelector("#inleverButton").textContent = "Afbetalen";
                    temp.content.querySelector("#inleverButton").setAttribute("class", "Afbetalen");


                clone = document.importNode(temp.content, true);
                $("#card-index").append(clone);


                this.afbetalenButton(isbn);

            }
        }

        this.boete();

    }

    catch(e) {
        console.log("error while fetching ", e);
    }

    afbetalenButton(isbn) {
        const afbetalenButton = $(".Afbetalen");
        this.afbetalenRepository = new AfbetalenRepository();
        afbetalenButton.on("click", async () => {

                console.log("AfbetalenButton");
                const username = sessionManager.get("username");

                await this.afbetalenRepository.afbetalen(isbn, username);
                inleverenPagina(this);
            }
        );
    }


//Called when the home.html failed to load
    error() {
        $(".content").html("Failed to load content!");
    }

}
