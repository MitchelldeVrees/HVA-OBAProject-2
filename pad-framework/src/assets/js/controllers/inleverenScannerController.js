/**
 * Controller responsible for all events in the scanner view.
 *
 * @author Faris Abahri & Stephen Smit
 */

class inleverenScannerController {

    barcodefound = false;

    constructor(isbn, book) {
        this.inleverenRepository = new InleverenRepository();
        this.isbn = isbn;

        $.get("views/inleverenScanner.html")
            .done((data) => this.setup(data, isbn, book))
            .fail(() => this.error());

    }


    setup(data, book) {
        //Load the welcome-content into memory
        this.inleverenScannerView = $(data);

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.inleverenScannerView);


            this.scanner();

    }


    scanner() {
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: document.getElementById('inlever-scanner')    // Or '#yourElement' (optional)
            },
            decoder: {
                readers: ["ean_reader",]
            }
        }, function (err) {
            if (err) {
                console.log(err);
                return
            }
            console.log("Initialization finished. Ready to start");
            Quagga.start();

        });
        Quagga.onDetected((data) => this.obaRequest(data));
    }


    async obaRequest(data) {

        if (this.barcodefound) {

            this.barcodefound = true;
        }

        if (data) {

            Quagga.stop();
        }

        if (confirm("Klik hier om een resultaat te zoeken")) {

            const gevondenIsbn = data.codeResult.code;
        }

        this.inleveren();
    }

    async inleveren() {

        await this.inleverenRepository.inleveren(this.isbn);
        await this.inleverenRepository.boekBijwerken(this.isbn);

        alert("Uw boek is ingeleverd!");
    }



}
