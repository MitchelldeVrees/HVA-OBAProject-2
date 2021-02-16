/**
 * Controller responsible for handing in books
 *
 * @author Faris Abahri & Stephen Smit
 */

class inleverenController {

    constructor() {

        this.inleverenRepository = new InleverenRepository();
        this.geleendeBoekRepository = new GeleendeBoekRepository();
        this.boete.bind(this);

        $.get("views/inleveren.html")
            .done((data) => this.setup(data))
            .fail(() => this.error())
    }

    setup(data) {
        this.inleverenView = $(data);

        $(".content").empty().append(this.inleverenView);

        this.checkIpAdres();

        this.fetchLeningen();
    }

    async checkIpAdres() {

        const username = sessionManager.get("username");
        const ipAdres = await this.inleverenRepository.getIpAdres(username);
        const ipSplit = ipAdres.split(":");
        let userIp = ipSplit[0]; //The user ip based on the connected network
        // let userIp = "92.108.14.91"; //Uncomment to make the code work on localhost
        const ipArray = await this.inleverenRepository.getCertifiedAddresses();

        let ipCheck = true;
        for (let i = 0; i < ipArray.length; i++) {

            if (userIp === ipArray[i].ipaddress) {

                ipCheck = true;
            }
        }

        if (ipCheck === false) {

            $(".content").empty();
            alert("U bent niet verbonden  met het OBA netwerk!");
        }

    }

    boete(inleverdatum, today) {
        const differenceInDays = (inleverdatum - today) / (1000 * 3600 * 24);
        const diffenceInDaysRounded = Math.round(differenceInDays);
        const boete = diffenceInDaysRounded * -0.05;
        const boeteRounded = Math.round(boete * 100) / 100;

        return boeteRounded.toFixed(2);
    }

    async fetchLeningen() {

        try {

            const username = sessionManager.get("username");
            const leenData = await this.geleendeBoekRepository.getLeenInfo(username);
            const today = new Date();

            let temp, i, clone;

            temp = $("template")[0];

            for (i in leenData) {

                let title = leenData[i].title;
                let isbn = leenData[i].isbn;
                let inleverdatum = new Date(leenData[i].inleverdatum);
                let inleverdatumString = new Date(inleverdatum).toISOString().slice(0, 10);
                let boete = this.boete(inleverdatum, today);


                temp.content.querySelector(".inlevertitle").textContent = "Titel: " + title;
                temp.content.querySelector(".inlevertext").textContent = "ISBN: " + isbn + "\n" + "inleverdatum: " + inleverdatumString;

                if (boete > 0.05) {
                    temp.content.querySelector("#afbetalen").textContent = "Boete: \u20AC" + boete;



                    temp.content.querySelector("#inleverButton").textContent = "Afbetalen";
                    temp.content.querySelector("#inleverButton").setAttribute("class", "Afbetalen");


                } else {
                    temp.content.querySelector("#inleverButton").textContent = "Inleveren";
                    temp.content.querySelector("#inleverButton").setAttribute("class", "Inleveren");
                }


                clone = document.importNode(temp.content, true);
                $("#card-index").append(clone);
            }

            this.boete();
            this.afbetalenButton();
            this.inleverenButton();

        } catch (e) {
            console.log("error while fetching ", e);
        }
    }


    afbetalenButton() {

        const afbetalenButton = $(".Afbetalen");

        afbetalenButton.on("click", function () {
                boete(this);
            }
        );
    }

    inleverenButton() {

        const inleverButton = $(".Inleveren");

        inleverButton.on("click", function () {
                inleveren(this);
            }
        );
    }


    //Called when the home.html failed to load
    error() {
        $(".content").html("Failed to load content!");
    }
}
