/**
 * hier komt code om de boeken in te laten, voor de blokken. Dit komt er dynamisch in te staan.
 *
 * @author Thijs van der Pouw Kraan
 */

class boekenOverzichtController {
    constructor() {
        this.bookViewRepository = new BookViewRepository("boekenOverzichtZoeken");

        $.get("views/boekenOverzicht.html")
            .done((data) => this.setup(data))
            .fail(() => this.error());
    }

    //Called when the boekenOverzicht.html has been loaded
    setup(data) {
        //Load the welcome-content into memory
        this.boekenOverzichtView = $(data);

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.boekenOverzichtView);

        this.boekenOverzichtView.find(".boekenOverzicht").on("click", (event) => this.boekenZoeken(event))
    }

    async boekenZoeken(event) {
        event.preventDefault();

        const zoekQuery = this.boekenOverzichtView.find("#queryInput").val();

        $(`#card-index`).html("");
        $(`#card-indexFoute`).html("");

        this.fetchBooks(zoekQuery);
    }

    /**
     * async function that retrieves books by its id via repository
     * @param bookId the room id to retrieve
     */
    async fetchBooks(bookId) {
        const responseBook = this.boekenOverzichtView.find(".card-title");
        try {
            //await keyword 'stops' code until data is returned - can only be used in async function
            const bookData = await this.bookViewRepository.get(bookId);
            this.json = JSON.parse(bookData);
            this.pageData = this.paginate(this.json['meta']['page-count']);

            this.changePage(1);

        } catch (e) {

            console.log("error while fetching rooms", e);

            //for now just show every error on page, normally not all errors are appropriate for user
            responseBook.text(e);
        }

        this.setupPagination();

        $("ul.pagination > li.pagination-item > a.pagination-link").click((event) => {

            let pageNumber = parseInt($(event.target).text());

            $("#books-list").empty();
            this.changePage(pageNumber);
        });
    }

    changePage(pageNumber = 1) {

        $("#books-list").empty();
        $("ul.pagination").remove();
        this.pageData = this.paginate(this.json['meta']['page-count'], pageNumber);

        for (let i = this.pageData.startIndex; i <= this.pageData.endIndex; i++) {

            $("<div  style='margin: 15%;  border: 1px solid rgba(0, 0, 0, .125); border-radius: .25rem;'></div>").appendTo($("#books-list"));
            $("<img />", {src: this.json['results'][i]['coverimages'][1]}).appendTo($("#books-list"));
            $("<p></p>", {text: this.json['results'][i]['titles']}).appendTo($("#books-list"));
            $("<p></p>", {text: this.json['results'][i]['summaries']}).appendTo($("#books-list"));
            $("<a></a>", {text: "Zie meer info", class: "btn btn-primary boekenOverzichtDetailed"}).attr("data-id", this.json['results'][i]['id']).appendTo($("#books-list"));
            $("<br>").appendTo($("#books-list"));
            $("<br>").appendTo($("#books-list"));
        }

        $('.boekenOverzichtDetailed').on("click", function () {

                const chosenBook = $(this).data("id");
                const leenbaar = "false";
                app.loadController(CONTROLLER_BOEKEN_OVERZICHT_DETAIL, chosenBook, leenbaar);
            }
        );
    }

    paginate(totalItems, currentPage= 1, pageSize= 10, maxPages= 10) {
        // calculate total pages
        let totalPages = Math.ceil(totalItems / pageSize);

        // ensure current page isn't out of range
        if (currentPage < 1) {

            currentPage = 1;
        } else if (currentPage > totalPages) {

            currentPage = totalPages;
        }

        let startPage, endPage;
        if (totalPages <= maxPages) {
            // total pages less than max so show all pages
            startPage = 1;
            endPage = totalPages;
        } else {
            // total pages more than max so calculate start and end pages
            let maxPagesBeforeCurrentPage = Math.floor(maxPages / 2);
            let maxPagesAfterCurrentPage = Math.ceil(maxPages / 2) - 1;
            if (currentPage <= maxPagesBeforeCurrentPage) {
                // current page near the start
                startPage = 1;
                endPage = maxPages;
            } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
                // current page near the end
                startPage = totalPages - maxPages + 1;
                endPage = totalPages;
            } else {
                // current page somewhere in the middle
                startPage = currentPage - maxPagesBeforeCurrentPage;
                endPage = currentPage + maxPagesAfterCurrentPage;
            }
        }

        // calculate start and end item indexes
        let startIndex = (currentPage - 1) * pageSize;
        let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

        // create an array of pages to ng-repeat in the pager control
        let pages = Array.from(Array((endPage + 1) - startPage).keys()).map(i => startPage + i);

        // return object with all pager properties required by the view
        return {
            totalItems: totalItems,
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
            startIndex: startIndex,
            endIndex: endIndex,
            pages: pages
        };
    }

    //Called when the login.html fails to load
    error() {
        $(".content").html("Failed to load content!");
    }

    setupPagination() {
        // hier gaan we die elementen bouwen.
        let $ul  = $("<ul>", {class: "pagination"}).insertAfter($("#books-list"));
        for (let i = this.pageData.currentPage; i <= this.pageData.endPage; i++) {
            $("<a>", {class: `pagination-link page-link-${i}`, text: i}).appendTo($("<li>", {class: `pagination-item item-${i}`}).appendTo($ul));
        }
    }
}
