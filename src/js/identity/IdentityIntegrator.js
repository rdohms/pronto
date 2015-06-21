var $ = require('jquery');

class IdentityIntegrator {

    constructor (fetcher, api) {
        this.fetcher = fetcher;
        this.api = api;


        this._setup();
    }

    _setup() {

        this.loginBtn = $('#login');
        this.profileDiv = $('.user-info');
        this.userName = $('.user-name');
        this.logoutBtn = $('#logout')

        if (this.fetcher.storage.hasToken()) {
            this.loginBtn.hide();
            this.showUserData((user) => {
                this.profileDiv.show();
                this.userName.text(user);
            });
        } else {
            this.loginBtn.show();
            this.profileDiv.hide();
        }

        console.log("I'm done rendering... btw...", this.fetcher.storage.hasToken());

        this.loginBtn.on("click", e => {
            this.initiateInteractiveSignIn();
        });

        this.loginBtn.on("click", e => {
            this.fetcher.storage.removeToken();
        });
    }

    initiateInteractiveSignIn() {
        console.log("initiating handshake");

        this.fetcher.getToken(true, function(error, access_token) {
            if (error) {
                //showButton(signin_button);
                console.log(error);
            } else {
                //this.api.setToken(access_token);
                console.log("We gotz token", access_token);
                //getUserInfo(true);
            }
        });
    }

    showUserData(callback) {
        this.api.getLoggedUserData(
            (data) => {
                console.log(data);
            }
        );
    }
}

export {IdentityIntegrator};
