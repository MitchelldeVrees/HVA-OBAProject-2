/**
 * hier komt code om de boeken in te laten, voor de blokken. Dit komt er dynamisch in te staan.
 *
 * @author Thijs van der Pouw Kraan
 */

class boekenOverzichtDetailedController {

    constructor(book, leenbaar) {

        this.bookViewRepository = new BookViewRepository("boekenOverzichtDetails");
        this.bookAvailabilityRepository = new BookAvailabilityRepository();
        this.geleendeBoekRepository = new GeleendeBoekRepository();

        $.get("views/boekenOverzichtDetailed.html")
            .done((data) => this.setup(data, book, leenbaar))
            .fail(() => this.error());
    }

    //Called when the boekenOverzicht.html has been loaded
    setup(data, book, leenbaar) {

        this.boekenOverzichtView = $(data);

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.boekenOverzichtView);

        this.boekenOverzichtView.find(".boekLenen").show();

        if(leenbaar === "false") {

            this.boekenOverzichtView.find(".boekLenen").hide();
        }

        this.fetchBooks(book);

        this.boekenOverzichtView.find(".boekLenen").on("click", () => this.boekLenen())
    }

    /**
     * async function that retrieves a book by its id via repository
     * @param bookId the room id to retrieve
     */
    async fetchBooks(bookId) {

        const responseBook = this.boekenOverzichtView.find(".card-title");
        try {

            let resultCount = 0;
            //await keyword 'stops' code until data is returned - can only be used in async function
            const bookData = await this.bookViewRepository.get(bookId);
            const availObj = await this.bookAvailabilityRepository.get(bookId);

            let bookAmountTotal = 0;
            let bookPlaces = "";
            for(let i = 0; i < availObj.aquabrowser.locations[0].location.length; i++) {

                let isBeschikbaar = true;

                if(availObj.aquabrowser.locations[0].location[i].$.available === "false") {

                    isBeschikbaar = false;
                }

                let iets = availObj.aquabrowser.locations[0].location[i].items[0].item.length;
                let bookAmount = 0;
                for(let j = 0; j < iets; j++) {

                    if(availObj.aquabrowser.locations[0].location[i].items[0].item[j].$.available === "true") {

                        bookAmount++;
                        bookAmountTotal++;
                    }
                }

                if(isBeschikbaar) {

                    bookPlaces += availObj.aquabrowser.locations[0].location[i].$.name + " " + bookAmount + "<br>";
                }
            }

            const obj = JSON.parse(bookData);
            let x = "";


            if (obj.record.length !== 0) {

                const cover = obj.record.coverimages[1];
                let summaries = obj.record.summaries;

                if (summaries === undefined){

                    summaries = "Bevat geen beschrijving";
                }

                const title = obj.record.titles[0];
                const isbn = obj.record.isbn;
                this.isbn = isbn;
                const author = obj.record.authors[0];
                const publisher = obj.record.publisher;
                const languages = obj.record.languages;

                $('#card-indexMain').append(`<div class="card mb-3" style="float:left; width: 18rem;">
                    <img class = "img-responsive" src=${cover} alt="Card image cap"></div>       
                    <div class="card-body" style="float: left;">
                        <h5 class="card-title" style="margin-bottom: unset !important;">${title}</h5>
                        <p class="card-text">${author}</p>
                        <p class="card-text">${summaries}</p>
                    </div>
                </div>`);


                $('#card-indexAvailability').append(`<div class="card mb-3" style="float:left; width: 100%; 
                    border: unset !important">     
                   <div class="row">
                        <div class="col-12">
                              <div class="card-body" style="float: left;">
                                    <h5 class="card-title" style="margin-bottom: unset !important;">Nu beschikbaar in</h5>
                                    <p class="card-text">${bookPlaces}</p>
                                    <p class="card-text">Aantal exemplaren: ${bookAmountTotal}</p>
                              </div>
                        </div>
                     </div>
                </div>`);


                $('#card-indexDetail').append(`<div class="card mb-3" style="float:left; width: 100%; 
                    border: unset !important">     
                    <div class="card-body" style="float: left;">
                        <h5 class="card-title">Details</h5>
                         <hr>
                        <div class="row">
                            <div class="col-12">
                                <div class="row">
                                    <div class="col-6">
                                        <p class="card-text">Title: </p>
                                    </div>
                                    <div class="col-6">
                                        <p class="card-text">${title}</p>
                                    </div>
                                </div>
                             </div>
                             <div class="col-12">
                                <div class="row">
                                    <div class="col-6">
                                        <p class="card-text">ISBN: </p>
                                    </div>
                                    <div class="col-6">
                                        <p class="card-text">${isbn}</p>
                                    </div>
                                </div>
                             </div>                            
                             <div class="col-12">
                                <div class="row">
                                    <div class="col-6">
                                        <p class="card-text">Auteur:</p>
                                    </div>
                                    <div class="col-6">
                                        <p class="card-text">${author}</p>
                                    </div>
                                </div>
                             </div>
                             <div class="col-12">
                                <div class="row">
                                    <div class="col-6">
                                        <p class="card-text">Uitgever: </p>
                                    </div>
                                    <div class="col-6">
                                        <p class="card-text">${publisher}</p>
                                    </div>
                                </div>
                             </div>
                             <div class="col-12">
                                <div class="row">
                                    <div class="col-6">
                                        <pclass="card-text">Taal: </p>
                                    </div>
                                    <div class="col-6">
                                        <p class="card-text">${languages}</p>
                                    </div>
                                </div>
                             </div>                
                        </div> 
                    </div>
                </div>`);
            } else {

                $('#card-indexFoute').append(`<div class="card" style="width: 18rem;">
                    <img class="card-img-top" src="geen resultaat" alt=""></div>       
                    <div class="card-body">
                        <h5 class="card-title">Pas uw zoekresultaat aan!</h5>
                        <p>Het lijkt erop dat uw zoekresultaat niet overeenkomt</p>
                        <p>met de gegevens in onze biblitoheek. </p>
                        <p>Kijk of er een spelfout in uw zoekresultaat zit </p>
                        <p> of gebruik een andere zoekresultaat.</p>
                    </div>`);

                resultCount++;
            }

            responseBook.text(x);

        } catch (e) {
            console.log("error while fetching rooms", e);

            //for now just show every error on page, normally not all errors are appropriate for user
            responseBook.text(e);
        }
    }

    async boekLenen() {

        const username = sessionManager.get("username");
        const isbn = this.isbn[0];
        const isbn2 = this.isbn[1];
        let gevondenIsbn = 1;
        let isGeleend = await this.geleendeBoekRepository.lenenMogelijk(isbn);

        if(isGeleend.length === 0) {

            if(isbn !== undefined) {

                isGeleend = await this.geleendeBoekRepository.lenenMogelijk(isbn2);
                gevondenIsbn = 2;
            }
        }

        const isBeschikbaar = isGeleend[0].isGeleend;

        if(isBeschikbaar !== 1 && gevondenIsbn === 1) {

            await this.geleendeBoekRepository.lenen(username, isbn);
            await this.geleendeBoekRepository.boekBijwerken(isbn);
            app.loadController(CONTROLLER_EVENT);
        } else if(isBeschikbaar !== 1 && gevondenIsbn === 2) {

            await this.geleendeBoekRepository.lenen(username, isbn2);
            await this.geleendeBoekRepository.boekBijwerken(isbn2);
            app.loadController(CONTROLLER_EVENT);
        } else {

            alert("Dit boek is al geleend");
        }
    }

    //Called when the login.html fails to load
    error() {
        $(".content").html("Failed to load content!");
    }
}
