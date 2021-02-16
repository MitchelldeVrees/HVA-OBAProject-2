/**
 * Entry point front end application - there is also an app.js for the backend (server folder)!
 *
 * Available: `sessionManager` or `networkManager` or `app.loadController(..)`
 *
 * You only want one instance of this class, therefor always use `app`.
 *
 * @author Lennard Fonteijn & Pim Meijer
 */
const CONTROLLER_SIDEBAR = "sidebar";
const CONTROLLER_LOGIN = "login";
const CONTROLLER_LOGOUT = "logout";
const CONTROLLER_WELCOME = "welcome";
const CONTROLLER_EVENT = "home";
const CONTROLLER_BOEKEN_OVERZICHT = "boekenOverzicht";
const CONTROLLER_BOEKEN_OVERZICHT_DETAIL = "boekenOverzichtDetailed";
const CONTROLLER_SCANNER_BOEKEN_DETAIL = "boekenScannerDetailed";
const CONTROLLER_ACCOUNT = "account";
const CONTROLLER_SCANNER = "scanner";
const CONTROLLER_BOEKHERKEND = "boekherkend";
const CONTROLLER_INLEVEREN = "inleveren";
const CONTROLLER_INLEVERENSCANNER = "inleverenScanner";
const CONTROLLER_BOETE = "boete"
const CONTROLLER_INLEVERENSCANNER_BOEKEN_DETAIL = "inleverenScannerDetailed";

const sessionManager = new SessionManager();
const networkManager = new NetworkManager();

class App {

    init() {
        //Always load the sidebar
        this.loadController(CONTROLLER_SIDEBAR);

        //Attempt to load the controller from the URL, if it fails, fall back to the welcome controller.
        this.loadControllerFromUrl(CONTROLLER_WELCOME);
    }


    /**
     * Loads a controller
     * @param name - name of controller - see constants
     * @param controllerData - data to pass from on controller to another
     * @returns {boolean} - successful controller change
     */
    loadController(name, controllerData) {
        console.log("loadController: " + name);

        if (controllerData) {
            console.log(controllerData);
        } else {
            controllerData = {};
        }

        switch (name) {
            case CONTROLLER_SIDEBAR:
                new NavbarController();
                break;

            case CONTROLLER_LOGIN:
                this.setCurrentController(name);
                this.isLoggedIn(() => new WelcomeController(), () => new LoginController());
                break;

            case CONTROLLER_LOGOUT:
                this.setCurrentController(name);
                this.handleLogout();
                break;

            case CONTROLLER_ACCOUNT:
                this.setCurrentController(name);
                this.isLoggedIn(() => new accountController(), () => new LoginController());
                break;

            case CONTROLLER_SCANNER:
                this.setCurrentController(name);
                this.isLoggedIn(() => new scannerController(), () => new LoginController());

                break;

            case CONTROLLER_BOEKHERKEND:
                this.setCurrentController(name);
                this.isLoggedIn(() => new BoekherkendController(), () => new LoginController());

                break;

            case CONTROLLER_BOEKEN_OVERZICHT:
                this.setCurrentController(name);
                this.isLoggedIn(() => new boekenOverzichtController(), () => new LoginController());
                break;

            case CONTROLLER_BOEKEN_OVERZICHT_DETAIL:
                this.setCurrentController(name);
                this.isLoggedIn(() => new boekenOverzichtDetailedController(controllerData), () => new LoginController());
                break;

            case CONTROLLER_SCANNER_BOEKEN_DETAIL:
                this.setCurrentController(name);
                this.isLoggedIn(() => new scannerController(controllerData), () => new LoginController());
                break;

            case CONTROLLER_WELCOME:
                this.setCurrentController(name);
                this.isLoggedIn(() => new WelcomeController(), () => new LoginController());
                break;

            case CONTROLLER_EVENT:
                this.setCurrentController(name);
                this.isLoggedIn(() => new eventController(), () => new LoginController());
                break;

            case CONTROLLER_INLEVEREN:
                this.setCurrentController(name);
                this.isLoggedIn(() => new inleverenController(), () => new LoginController());
                break;

            case CONTROLLER_INLEVERENSCANNER:
                this.setCurrentController(name);
                this.isLoggedIn(() => new inleverenScannerController(controllerData), () => new LoginController());
                break;

            case CONTROLLER_BOETE:
                this.setCurrentController(name);
                this.isLoggedIn(() => new boeteController(controllerData), () => new LoginController());
                break;


            case CONTROLLER_INLEVERENSCANNER_BOEKEN_DETAIL:
                this.setCurrentController(name);
                this.isLoggedIn(() => new inleverenScannerController(controllerData), () => new LoginController());
                break;

            default:
                return false;
        }

        return true;
    }

    /**
     * Alternative way of loading controller by url
     * @param fallbackController
     */
    loadControllerFromUrl(fallbackController) {
        const currentController = this.getCurrentController();

        if (currentController) {
            if (!this.loadController(currentController)) {
                this.loadController(fallbackController);
            }
        } else {
            this.loadController(fallbackController);
        }
    }

    getCurrentController() {
        return location.hash.slice(1);
    }

    setCurrentController(name) {
        location.hash = name;
    }

    /**
     * Convenience functions to handle logged-in states
     * @param whenYes - function to execute when user is logged in
     * @param whenNo - function to execute when user is logged in
     */
    isLoggedIn(whenYes, whenNo) {
        if (sessionManager.get("username")) {
            whenYes();
        } else {
            whenNo();
        }
    }

    /**
     * Removes username via sessionManager and loads the login screen
     */
    handleLogout() {
        sessionManager.remove("username");

        //go to login screen
        this.loadController(CONTROLLER_LOGIN);
    }
}

const app = new App();

//When the DOM is ready, kick off our application.
$(function () {
    app.init();
});