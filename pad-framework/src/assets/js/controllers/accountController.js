/**
 * Controller responsible for all events in the account view
 *
 * @author Stephen Smit
 * @author Mitchell de Vries
 */
class accountController {


    constructor() {
        this.userRepository = new UserRepository();

        $.get("views/account.html")
            .done((data) => this.setup(data))
            .fail(() => this.error());
    }

    setup(data) {
        //Load the welcome-content into memory
        this.accountView = $(data);

        //Set the name in the view from the session
        this.accountView.find(".name").html(sessionManager.get("username"));

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.accountView);
        this.accountView.ready(() => this.getUser());
    }

    async getUser(){
        let user = sessionManager.get("username");
        const userdata = await this.userRepository.getUser(user);

        $('#naam').append(userdata[0].naamPashouder);
        $('#lidmaatschap').append(userdata[0].lidmaatschapSoort);
        $('#barcode').append(user);
        $('#pincode').append(userdata[0].geboortedatum);

    }
    //Called when the login.html fails to load
    error() {
        $(".content").html("Failed to load content!");
    }
}



