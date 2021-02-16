class GeleendeBoekRepository {

    constructor() {
        this.route = "/geleendeBoeken"
    }

    async get(username) {
        return await networkManager
            .doRequest(`${this.route}`, {"username": username}, "GET");
    }

    async lenenMogelijk(isbn) {
        return await networkManager
            .doRequest(`${this.route}/lenen`, {"isbn": isbn}, "GET")
    }

    async lenen(username, isbn) {
        return await networkManager
            .doRequest(`${this.route}/lenen`, {"username": username, "isbn": isbn}, "POST")
    }

    async getLeenInfo(username) {
        return await networkManager
            .doRequest(`${this.route}/leningen`, {"username": username}, "GET");
    }

    async boekBijwerken(isbn) {
        return await networkManager
            .doRequest(`${this.route}/lenen`, {"isbn": isbn}, "PUT");
    }

    async boete(username) {
        return await networkManager
            .doRequest(`${this.route}/lenen/boete`, {"username": username}, "GET");
    }
}