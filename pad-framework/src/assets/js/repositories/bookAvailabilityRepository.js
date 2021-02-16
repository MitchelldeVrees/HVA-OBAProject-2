class BookAvailabilityRepository {

    constructor() {
        this.route = "/availability"
    }

    /**
     * async function to get information of book data in the OBA API by its id via networkmanager
     * [id: bookId] - "id" is also called id in database! Make sure this is always the same
     * @param bookId
     * @returns {Promise<bookData>}
     */
    async get(bookId) {
        return await networkManager
            // .doRequest(`${this.route}?id=`, {id: roomId});
            .doRequest(this.route, {id: bookId}, "GET");
    }
}