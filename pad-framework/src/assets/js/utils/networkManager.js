
/**
 * Implementation of a network manager that does an Ajax request to specified rout
 *
 * @author Lennard Fonteijn & Pim Meijer
 */
class NetworkManager {
    /**
     * Does an AJAX request to server(NodeJS)
     * @param route - for example /user/login
     * @param data - for example {username: "test", password: "test}
     * @param method - either GET or POST depending on the database use
     * @returns {Promise<unknown>}
     */
    YESdoRequest(route, data = {}, method) {
        const json = JSON.stringify(data);

        const url = baseUrl + route;

        console.log(`Doing request to ${url}\nJSON: ${json}`);

        //TODO: Maak een if statement die verandert wanneer er een POST of GET functie wordt gebruikt

        if(method === "POST") {
            return new Promise((resolve, reject) => {

                $.ajax({
                    url: url,
                    type: "POST",
                    dataType: 'json',
                    contentType: 'application/json; charset=UTF-8',
                    data: json,
                    success: resolve,
                    error: (xhr, ajaxOptions, thrownError) => this.__onFail(xhr, reject)
                });
            });
        } else if(method === "GET") {
            return new Promise((resolve, reject) => {

                $.ajax({
                    url: url,
                    type: "GET",
                    contentType: 'charset=UTF-8',
                    data: data,
                    success: resolve,
                    error: (xhr, ajaxOptions, thrownError) => this.__onFail(xhr, reject)
                });
            });
        } else if(method === "PUT") {
            return new Promise((resolve, reject) => {

                $.ajax({
                    url: url,
                    type: "PUT",
                    dataType: 'json',
                    contentType: 'application/json; charset=UTF-8',
                    data: json,
                    success: resolve,
                    error: (xhr, ajaxOptions, thrownError) => this.__onFail(xhr, reject)
                });
            });
        }
    }

    /**
     * generic fail handler which is always executed, add more specific error handling in controller
     * @param xhr
     * @param reject callback from Promise
     * @private
     */
    __onFail(xhr, reject) {
        //400 is bad request, request has been arrived at server but server cant process it into a response
        if(!this.canParseJson(xhr.responseText)) {
            reject({code: 1000, reason: "Unknown server error, no valid json response"});
            return;
        }

        //ideally use the json from canParseJson
        const data = JSON.parse(xhr.responseText);

        if(xhr.status === 400) {
            console.log(`bad request error 400 ${data.reason}`);
        }

        reject({code: xhr.status, reason: data.reason});
    }

    canParseJson(json) {
        try {
            JSON.parse(json);
        } catch (e) {
            return false;
        }
        return true;
    }
}