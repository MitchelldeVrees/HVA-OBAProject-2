/**
 * Repository responsible for all user data from server - CRUD
 * Make sure all functions are using the async keyword when interacting with network!
 *
 * @author Pim Meijer
 */
class UserRepository {

    constructor() {
        this.route = "/user";
    }

    /**
     * async function that handles a Promise from the networkmanager
     * @param username
     * @param password
     * @returns {Promise<user>}
     */
    async login(username, password) {
        return await networkManager
            .doRequest(`${this.route}/login`, {"username": username, "password": password}, "POST");
    }

    async get (userId){
        return await networkManager
            .doRequest(`${this.route}`, {id:userId},"GET");
    }

    async getUser (username){
        return await networkManager
            .doRequest(`${this.route}`, {username:username},"GET");
    }

    async getUser(username) {
        return await networkManager
            .doRequest(`${this.route}/info`, {username: username}, "POST");
    }
}