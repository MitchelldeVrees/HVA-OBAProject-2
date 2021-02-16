/**
 * Server application - contains all server config and api endpoints
 *
 * @author Pim Meijer & Stephen Smit & Mitchell de Vries
 */
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const db = require("./utils/databaseHelper");
const cryptoHelper = require("./utils/cryptoHelper");
const corsConfig = require("./utils/corsConfigHelper");
const xml2js = require('xml2js');
let parser = new xml2js.Parser();
const app = express();
const https = require("https");

//logger lib  - 'short' is basic logging info
app.use(morgan("short"));

//init mysql connectionpool
const connectionPool = db.init();

//parsing request bodies from json to javascript objects
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//CORS config - Cross Origin Requests
app.use(corsConfig);

// ------ ROUTES - add all api endpoints here ------
const httpOkCode = 200;
const badRequestCode = 400;
const authorizationErrCode = 401;
const obaPublicKey = "1e19898c87464e239192c8bfe422f280";
const obaSecret = "4289fec4e962a33118340c888699438d";

//Updates the password from a user
app.put("/user", (req, res) => {
    const username = req.body.username;
    const hashedPassword = cryptoHelper.getHashedPassword(req.body.password);

    db.handleQuery(connectionPool, {
            query: "UPDATE user SET password = ? WHERE username = ?",
            values: [hashedPassword, username]
        }, (data) => {
            res.status(httpOkCode).json(data);
        }, (err) => res.status(badRequestCode).json({reason: err})
    );
});

//Takes the user information from the database
app.post("/user/info", (req, res) => {
    const username = req.body.username;
    db.handleQuery(connectionPool, {
        query: "SELECT  lidmaatschapSoort, naamPashouder, geboortedatum FROM user WHERE username = ?",
        values: [username]
    }, (data) => {
        if (username > 1) {
            res.status(httpOkCode).json(data);
        } else {
            res.status(authorizationErrCode).json({reason: "FOUT!!"});
        }

    }, (err) => res.status(badRequestCode).json({reason: err}));
});


app.post("/user", (req, res) => {
    let username = req.body.username;
   db.handleQuery(connectionPool, {
       query: "SELECT * FROM user WHERE username=?",
       value: [username]
   },(data) => {
       res.status(httpOkCode).json(data);
   },(err) => res.status(badRequestCode).json({reason: err})
   );
});

//Used 
app.post("/user/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const hashedPassword = cryptoHelper.getHashedPassword(password);

    db.handleQuery(connectionPool, {
        query: "SELECT username, password FROM user WHERE username = ? AND password = ?",
        values: [username, hashedPassword]
    }, (data) => {
        if (data.length === 1) {
            //return just the username for now, never send password back!
            res.status(httpOkCode).json({"username": data[0].username});
        } else {
            //wrong username
            res.status(authorizationErrCode).json({reason: "Ongeldige barcode of pincode"});
        }

    }, (err) => res.status(badRequestCode).json({reason: err}));
});

//Deletes row in user_leent_boek table
app.post("/inleveren", (req, res) => {
    const username = req.body.username;
    const isbn = req.body.isbn;

    db.handleQuery(connectionPool, {
        query: "DELETE FROM user_leent_boek WHERE isbn = ?",
        values: [isbn]
    }, (data) => { res.status(httpOkCode).json(data);
    }, (err) => res.status(badRequestCode).json({reason: err}))
});

//Fetches ip address of user
app.get("/inleveren/ipAdres", (req, res) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (ip.substr(0,7) === ":ffff:") {
        ip = ip.substr(7);
    }
    res.send(ip);
});

//Fetches certified ip addresses from the database
app.get("/inleveren/certifiedAddresses", (req, res) => {
    db.handleQuery(connectionPool, {
        query: "SELECT * FROM Ip_address"
    }, (data) => {
        res.status(httpOkCode).json(data);
    }, (err) => res.status(badRequestCode).json({reason: err}))
});

//Updates the status of a book to returned to the library
app.put("/inleveren", (req, res) => {
    const isbn = req.body.isbn;

    db.handleQuery(connectionPool, {
            query: "UPDATE Book SET isGeleend = 0 WHERE isbn = ?",
            values: [isbn]
        }, (data) => { res.status(httpOkCode).json(data);
        }, (err) => res.status(badRequestCode).json({reason: err})
    )
});

app.put("/afbetalen", (req, res) => {
    const isbn = req.body.isbn;
    const today = new Date().toISOString().slice(0, 10);
    const username = req.body.username;

    db.handleQuery(connectionPool, {
            query: "UPDATE user_leent_boek SET inleverdatum = ? WHERE isbn = ? AND username = ?",
            values: [today, isbn, username]
        }, (data) => { res.status(httpOkCode).json(data);
        }, (err) => res.status(badRequestCode).json({reason: err})
    )
});

//Searches borrowed books of a user
app.get("/geleendeBoeken/leningen", (req, res) => {
    const username = req.query.username;

    db.handleQuery(connectionPool, {
        query: "SELECT b.isbn, u.inleverdatum, b.title FROM user_leent_boek u " +
            "INNER JOIN book b ON b.isbn = u.isbn WHERE username = ?",
        values: [username]
    }, (data) => { res.status(httpOkCode).json(data);
    }, (err) => res.status(badRequestCode).json({reason: err}))
});

app.get("/geleendeBoeken/lenen/boete", (req, res) => {
    const username = req.query.username;

    db.handleQuery(connectionPool, {
        query: "SELECT inleverdatum, isbn, username FROM pad_oba_9_dev.user_leent_boek WHERE username = ?",
        values: [username]
    }, (data) => { res.status(httpOkCode).json(data);
    }, (err) => res.status(badRequestCode).json({reason: err}))
});

//Updates the status of a book to borrowed
app.get("/geleendeBoeken/lenen", (req, res) => {
    const isbn = req.query.isbn;

    db.handleQuery(connectionPool, {
        query: "select isGeleend from book where isbn = ?",
        values: [isbn]
    }, (data) => {
        res.status(httpOkCode).json(data);
    }, (err) => res.status(badRequestCode).json({reason: err}))
});

//Adds a user-book combo to the database
app.post("/geleendeBoeken/lenen", (req, res) => {
    const username = req.body.username;
    const isbn = req.body.isbn;

    //Creates dates for borrowing and returning books
    const dagen = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"]
    const maanden = ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus",
        "September", "Oktober", "November", "December"];
    const today = new Date();
    const leendatum = dagen[today.getDay()] + " " + today.getDate() + " " +
        maanden[today.getMonth()] + " " + today.getFullYear();
    const leenweken = 3;
    const inleverdag = new Date(today.setDate(today.getDate() + (leenweken * 7)));
    const inleverdatum = dagen[inleverdag.getDay()] + " " + inleverdag.getDate() + " " +
        maanden[inleverdag.getMonth()] + " " + inleverdag.getFullYear();


    db.handleQuery(connectionPool, {
        query: "INSERT INTO user_leent_boek(username, isbn, leendatum, inleverdatum) VALUES(?,?,?,?)",
        values: [username, isbn, leendatum, inleverdatum]
    }, (data) => { res.status(httpOkCode).json(data);
    }, (err) => res.status(badRequestCode).json({reason: err}))
});

//Updates a specific book to borrowed
app.put("/geleendeBoeken/lenen", (req, res) => {
    const isbn = req.body.isbn;

    db.handleQuery(connectionPool, {
        query: "UPDATE Book SET isGeleend = 1 WHERE isbn = ?",
        values: [isbn]
    }, (data) => { res.status(httpOkCode).json(data);
    }, (err) => res.status(badRequestCode).json({reason: err})
    )
});

//Searches for bookresults in OBA library according to given query
//example request: localhost:3000/search?q=mooi
app.get("/oba/search", (req, res) => {
    const url = `https://zoeken.oba.nl/api/v1/search/?q=${req.query.id}&authorization=${obaPublicKey}&refine=true&output=json&pagesize=25`;
    const request = https.get(url, {
        timeout: 10000,
        headers: {
            "AquaBrowser": obaSecret,
            "Content-Type": "application/json; charset=utf-8;"
        },
    }, (obaResponse) => {
        let bodyChunks = [];
        obaResponse.on('data', (chunk) => {
            // process streamed parts here...
            bodyChunks.push(chunk);
        }).on("end", () => {
            const json = Buffer.concat(bodyChunks).toString();
            //INFO: Sometimes no valid json comes back from OBA api
            //because output=json is in beta :(

            // hiermee veranderen we de json STRING in een json OBJECT sgoed
            //send to the one who request this route(eg. front-end), it's already json so dont use .json(..)
            res.status(httpOkCode).send(json);
        })
    });

    request.on("error", err => {
        res.status(badRequestCode).json({reason: err})
    });

    request.end();
});

//Kijkt of String met JSON geparsed kan worden
function isValidJSONString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

//Kijkt of een String met XML geparsed kan worden
function isValidSyntaxStructure (text) {
    try {
        parser.parseString(text);
    } catch (e) {
        return false;
    }

    return true;
}

//Haalt de boek beschikbaarheid uit de OBA API
//example request: localhost:3000/availability?id=|oba-catalogus|1085085
app.get("/availability", (req, res) => {
    const url = `https://zoeken.oba.nl/api/v1/availability/?authorization=${obaPublicKey}&id=${req.query.id}`;
    const request = https.get(url, {
        timeout: 10000,
        headers: {
            "AquaBrowser": obaSecret,
            "Content-Type": "application/json; charset=utf-8;"
        },
    }, (obaResponse) => {
        let bodyChunks = [];
        obaResponse.on('data', (chunk) => {
            bodyChunks.push(chunk);
        }).on("end", () => {
            const apiResponse = Buffer.concat(bodyChunks).toString();

            //check of de response een valid json is
            if(isValidJSONString(apiResponse)) {
                res.status(httpOkCode).send(apiResponse);
            } else if(isValidSyntaxStructure(apiResponse)){
                parser.parseString(apiResponse, (err, result) => {
                    if(err){
                        res.status(500);
                    } else {
                        console.log(result);
                        res.status(httpOkCode).send(result);
                    }
                });

                //als de response zowel geen json als xml format is
            } else {
                console.error(apiResponse);
                res.status(badRequestCode).json({
                    reason: "Geen geldig json of xml format",
                    apiResponse: apiResponse
                });
            }
        })
    });

    request.on("error", err => {
        res.status(badRequestCode).json({reason: err})
    });

    request.end();
});

//Haalt adhv boek id de boekinfo van een enkel boek uit de OBA APi
//example request: localhost:3000/details?id=|oba-catalogus|1085085
app.get("/details", (req, res) => {
    const url = `https://zoeken.oba.nl/api/v1/details/?authorization=${obaPublicKey}&id=${req.query.id}&output=json`;
    const request = https.get(url, {
        timeout: 10000,
        headers: {
            "AquaBrowser": obaSecret,
            "Content-Type": "application/json; charset=utf-8;"
        },
    }, (obaResponse) => {
        let bodyChunks = [];
        obaResponse.on('data', (chunk) => {
            // process streamed parts here...
            bodyChunks.push(chunk);
        }).on("end", () => {
            const apiResponse = Buffer.concat(bodyChunks).toString();
            //INFO: Sometimes no valid json comes back from OBA api
            //because output=json is in beta :(

            //send to the one who request this route(eg. front-end), it's already json so dont use .json(..)
            res.status(httpOkCode).send(apiResponse);
        })
    });

    request.on("error", err => {
        res.status(badRequestCode).json({reason: err})
    });

    request.end();
});


//------- END ROUTES -------

module.exports = app;
