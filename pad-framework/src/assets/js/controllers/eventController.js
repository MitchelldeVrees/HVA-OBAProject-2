class eventController {
    constructor() {
        this.geleendeBoekRepository = new GeleendeBoekRepository();

        $.get("views/home.html")
            .done((data) => this.setup(data))
            .fail(() => this.error());
    }

//Called when the login.html has been loaded
    setup(data) {
        //Load the login-content into memory
        this.loginView = $(data);

        this.loginView.find(".login-form").on("submit", (e) => this.handleLogin(e));

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.loginView);

        this.fetchLeningen();
    }


    async fetchLeningen() {

        const username = sessionManager.get("username");
        const leenData = await this.geleendeBoekRepository.getLeenInfo(username);
        const today = new Date();

        for (let i = 0; i < leenData.length; i++) {

            let title = leenData[i].title;
            let isbn = leenData[i].isbn;
            let inleverdatum = new Date(leenData[i].inleverdatum);
            let inleverdatumString = new Date(inleverdatum).toISOString().slice(0, 10);

            if (today < inleverdatum) {
                $('#card-index').append(`<div class="card" style="width: 18rem; margin-bottom: 10px">
                    <div class="card-body">
                        <h5 class="card-title">${title}</h5>
                        <p class="card-text">ISBN: ${isbn}</p>
                        <p class="card-text">Inleverdatum: ${inleverdatumString}</p>
                    </div>`);


            } else {
                const differenceInDays = (inleverdatum - today) / (1000 * 3600 * 24);
                const diffenceInDaysRounded = Math.round(differenceInDays);
                const boete = diffenceInDaysRounded * -0.05;
                const boeteRounded = Math.round(boete * 100) / 100;

                $('#card-index').append(`<div class="card" style="width: 18rem; margin-bottom: 10px; border-color: red">
                    <div class="card-body">
                        <h5 class="card-title">${title}</h5>
                        <p class="card-text">ISBN: ${isbn}</p>
                        <p class="card-text">Inleverdatum: ${inleverdatumString}</p>
                        <p class="card-text">Boete: ${boeteRounded} euro</p>
                    </div>`);

                $('#alert').append(`<div class="alert"
                    <h5 class="alert"> ${title} is over de inleverdatum </h5></div>`);
            }
        }
    }

    //Called when the home.html failed to load
    error() {
        $(".content").html("Failed to load content!");
    }
}