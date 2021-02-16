/**
 * Controller responsible for all events in the scanner view.
 *
 * @author Alec Wouda
 */

class scannerController {

    barcodefound = false;

    constructor(book) {
        this.bookViewRepository = new BookViewRepository("boekenOverzichtDetailsScanner");

        $.get("views/scanner.html")
            .done((data) => this.setup(data, book))
            .fail(() => this.error());

    }



    setup(data, book) {
        //Load the welcome-content into memory
        this.scannerView = $(data);


        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.scannerView);

        if (book === undefined){
            this.scanner();
            return false;
        }else {
            this.fetchBooks(book);
        }

    }


    scanner(){
        Quagga.init({
            inputStream : {
                name : "Live",
                type : "LiveStream",
                target: document.getElementById('barcode-scanner')
            },
            decoder : {
                readers : ["ean_reader",]
            }
        }, function(err) {
            if (err) {
                console.log(err);
                return
            }
            console.log("Initialization finished. Ready to start");
            Quagga.start();

        });
        Quagga.onDetected(this.obaRequest);

    }


    async obaRequest(data){
        if (this.barcodefound){
            this.barcodefound = true;
        }

        if (data){
            Quagga.stop();
        }

        if (confirm("Klik hier om een resultaat te zoeken")){
            let bookID = data.codeResult.code;
            app.loadController(CONTROLLER_SCANNER_BOEKEN_DETAIL, bookID);
        }

    }


    /**
     * async function that retrieves a book by its id via repository
     * @param bookId the book id to retrieve
     */
    async fetchBooks(bookId) {
        const responseBook = this.scannerView.find(".card-index");
        try {
            let resultCount = 0;
            //await keyword 'stops' code until data is returned - can only be used in async function
            const bookData = await this.bookViewRepository.get(bookId);

            const obj = JSON.parse(bookData);


            let x = "";
            let i;


                if (obj.results.length !== 0) {

                    const cover = obj.results[0].coverimages[1];
                    let summaries = obj.results[0].summaries;
                    if (summaries === undefined){
                        summaries = "Bevat geen beschrijving";
                    }
                    const title = obj.results[0].titles[0];
                    $('#card-index').append(`<div class="card" style="width: 18rem;">
                    <img class="card-img-top" src=${cover} alt="Card image cap"></div>       
                    <div class="card-body">
                        <h5 class="card-title">${title}</h5>
                        <p class="card-text">${summaries}</p>
                        <a  href="#" class="btn btn-primary boekenOverzichtDetailed" data-id="${bookId}">Zie meer info</a>
                    </div>`)


                } else {
                    $('#card-indexFoute').append(`<div class="card" style="width: 18rem;">
                    <img class="card-img-top" src="geen resultaat" alt=""></div>       
                    <div class="card-body">
                        <h5 class="card-title">Geen geldig resultaat gevonden!</h5>
                        <p>Probeer opnieuw te scannen</p>
                    </div>`);

                    resultCount++;
                }


                $('.boekenOverzichtDetailed').on("click", function () {

                        for (i in obj.results) {

                            let book = obj.results[i];
                            const chosenBook = book.id;
                            app.loadController(CONTROLLER_BOEKEN_OVERZICHT_DETAIL, chosenBook);

                        }
                    }
                )
        responseBook
            .text(x);

    } catch
    (e) {
        console.log("error while fetching rooms", e);

        //for now just show every error on page, normally not all errors are appropriate for user
        responseBook.text(e);
    }
}

    //Called when the login.html fails to load
    error() {
        $(".content").html("Failed to load content!");
    }
}
