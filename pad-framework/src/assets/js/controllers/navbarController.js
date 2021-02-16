/**
 * Responsible for handling the actions happening on sidebar view
 *
 * @author Lennard Fonteijn, Pim Meijer
 */
class NavbarController {

    constructor() {

        $.get("views/navbar.html")
            .done((data) => this.setup(data))
            .fail(() => this.error());
    }

    //Called when the navbar.html has been loaded
    setup(data) {
        //Load the sidebar-content into memory
        const sidebarView = $(data);

        sidebarView.find('ul.navbar-nav').children().each((index, element) => {
            // checks if the current hash is the same as the data-controller link.
            if(location.hash.substr(1) == $(element).find('a').attr('data-controller')){

                $(element).find('a').toggleClass('active');
            }else{

                $(element).find('a').removeClass('active');
            }
        });

        //Find all anchors and register the click-event
        sidebarView.find("a").on("click", this.handleClickMenuItem);

        if(!sessionManager.get("username")){
            sidebarView.find("a[data-controller='logout']").parent().remove();
            sidebarView.find("a[data-controller='scanner']").parent().remove();
            sidebarView.find("a[data-controller='inleveren']").parent().remove();
            sidebarView.find("a[data-controller='boekenOverzicht']").parent().remove();
            sidebarView.find("a[data-controller='lenen']").parent().remove();
            sidebarView.find("a[data-controller='account']").parent().remove();
            sidebarView.find("a[data-controller='home']").parent().remove();
            sidebarView.find("a[data-controller='login']").parent().remove();
        }

        if(sessionManager.get("username")) {
            sidebarView.find("a[data-controller='login']").parent().remove();
        }

        //Empty the sidebar-div and add the resulting view to the page
        $(".sidebar").empty().append(sidebarView);

    }

    handleClickMenuItem() {
        //Get the data-controller from the clicked element (this)
        const controller = $(this).attr("data-controller");
        //Pass the action to a new function for further processing
        app.loadController(controller);
        location.reload(true);

        location.reload(true);
        //Return false to prevent reloading the page
        return false;
    }


    //Called when the login.html failed to load
    error() {
        $(".content").html("Failed to load the sidebar!");
    }
}
