/**
 * -- THIS IS AN EXAMPLE REPOSITORY WITH EXAMPLE DATA FROM DB --
 * Repository responsible for all room related data from server - CRUD
 * Make sure all functions are using the async keyword when interacting with `networkManager`!
 *
 * @author Pim Meijer
 */
class BookViewRepository {

    constructor(boek) {

        if (boek == "boekenOverzichtZoeken") {
            this.route = "/oba/search";
        }
        if (boek == "boekenOverzichtDetails") {
            this.route = "/details";
        }
        if (boek == "boekenOverzichtDetailsScanner") {
            this.route = "/oba/search";
        }

    }

    /**
     * async function to get information of book data in the OBA API by its id via networkmanager
     * [id: bookId] - "id" is also called id in database! Make sure this is always the same
     * @param bookId
     * @returns {Promise<bookData>}
     */
    async get(bookId) {
        return await networkManager
            .doRequest(this.route, {id: bookId}, "GET");
    }

}