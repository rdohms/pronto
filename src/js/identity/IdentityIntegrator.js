var $ = require('jquery');

class IdentityIntegrator {

    constructor (fetcher, api) {
        this.fetcher = fetcher;
        this.api = api;

        this._setup();
    }

    _setup() {

        this.loggedInDiv = $('#logged');
        this.loginDiv    = $('#login');
        this.loading     = $('#loading');

        this.userName = $('.user-name');
        this.logoutBtn = $('#logout-btn');
        this.loginBtn  = $('#login-btn');

        this.loading.hide();

        this.loginBtn.on("click", e => {
            this.loading.slideDown();
            this.loginDiv.hide();
            this.initiateInteractiveSignIn();
        });

        this.logoutBtn.on("click", e => {
            this.fetcher.storage.removeToken();
            this.toggleOptions(false);
        });

        this.fetcher.storage.hasToken().then(hasToken => {
            this.toggleOptions(hasToken);
        });
    }

    initiateInteractiveSignIn() {
        ga('send', 'event', 'extension', 'initiate_interactive_signin');
        this.fetcher.getToken(true, (error, access_token) => {
            if (error) {
                this.toggleOptions(false);
            } else {
                this.api.loadToken(() => {
                    this.toggleOptions(true);
                })

            }
        });
    }

    getUserData(callback) {
        this.api.getLoggedUserData(
            (response) => {
                callback(response.data.attributes);
            }
        );
    }

    toggleOptions(hasToken) {
        if (hasToken) {
            this.loading.slideUp();
            this.loginDiv.hide();
            this.getUserData((user) => {
                this.userName.text(user.first_name);
                this.loggedInDiv.show();
            });
        } else {
            this.loading.hide();
            this.loginDiv.show();
            this.loggedInDiv.hide();
        }
    }
}

export {IdentityIntegrator};
