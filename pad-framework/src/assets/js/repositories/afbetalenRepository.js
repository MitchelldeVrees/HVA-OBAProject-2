class AfbetalenRepository {

    constructor() {
        this.route = "/afbetalen"
    }

    async afbetalen(isbn, username) {
        return await networkManager
            .doRequest(`${this.route}`, {"isbn" : isbn, "username" : username}, "PUT");
    }
}