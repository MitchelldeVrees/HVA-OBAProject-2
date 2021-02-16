class InleverenRepository {
    constructor() {
        this.route = "/inleveren"
    }

    async getIpAdres() {
        return await networkManager
            .doRequest(`${this.route}/ipadres`, {},"GET")
    }

    async getCertifiedAddresses() {
        return  await networkManager
            .doRequest(`${this.route}/certifiedAddresses`, {}, "GET")
    }

    async inleveren(isbn) {
        return await networkManager
            .doRequest(`${this.route}`, {"isbn": isbn},"POST");
    }

    async boekBijwerken(isbn) {
        return await networkManager
            .doRequest(`${this.route}`, {"isbn": isbn}, "PUT");
    }

}