import $ from 'jquery';

class AuthenticationManager {
    constructor(fetcher, api) {
        this.fetcher = fetcher;
        this.api = api;

        this._setup();
    }

    _setup() {

        this.loggedInDiv = $('.logged_in');
        this.loginDiv = $('.not_logged_in');
        this.loading = $('.loading');

        this.userName = $('#info-fullname');
        this.logoutBtn = $('#btn-logout');
        this.loginBtn = $('#btn-login');
        this.registerBtn = $('#btn-register');

        this.loading.hide();

        this._attachButtonActions();

        this.fetcher.storage.hasToken().then(hasToken => {
            this.toggleOptions(hasToken);
        });
    }

    _attachButtonActions() {
        this.loginBtn.on("click", e => {
            this.loading.slideDown();
            this.loginDiv.hide();
            this.initiateInteractiveSignIn();
        });

        this.logoutBtn.on("click", e => {
            this.fetcher.storage.removeToken();
            this.toggleOptions(false);
        });

        this.registerBtn.on("click", e => {
            window.location.href = 'http://symposiumapp.com/sign-up';
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

export default AuthenticationManager;
