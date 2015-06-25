var $ = require('jquery');
let debug = require('../helper/Debug');

class SymposiumApiClient {
    constructor(base_url, storage) {
        this.base_url = base_url + "/api";
        this.current_user = null;
        this.jQuery = $;

        this.storage = storage;
        this.access_token = null;

        this.loadToken();
    }

    loadToken(callback = null) {
        this.storage.getToken().then(token => {
            this.access_token = token;

            if (callback != null) {
                callback();
            }
        });
    }

    _makeRequest(url, callback, error_callback = null) {

        debug.log('[api] making request with token:', url, this.access_token);

        if (error_callback == null) {
            error_callback = response => {
                debug.log('[api] error:', response);
                this.error_response = response;
            };
        }

        $.ajax({
          url : this.base_url + url,
          headers: { "Authorization": `Bearer ${this.access_token}` },
          type : 'GET',
        })
        .done(callback)
        .fail(response => {
            if (response.status == 400 && response.responseText.includes('access token')) {
                this.storage.removeToken();
            }

            if (response.status == 401) {
                this.storage.removeToken();
            }

            error_callback();
        });

    }

    _ensureUserInfo() {

        return new Promise( (resolve, reject) => {

            if (this.current_user != null) {
                resolve();
            }

            this.getLoggedUserData(response => {
                this.current_user = response.data;
                resolve();
            },
            response => {
                reject(Error("Load User failed"));
            });

        });

    }

    getLoggedUserData(callback, error_callback = null) {
        this._makeRequest(
            "/me",
            callback,
            error_callback
        );
    }

    getUserTalks(callback, error_callback = null) {

        let promise = this._ensureUserInfo();

        promise.then( result => {
            this._makeRequest(
                "/user/" + this.current_user.id + "/talks/",
                response => {
                    callback(response.data);
                },
                error_callback
            );
        });
    }

    getTalkInfo(talk_id, callback, error_callback = null) {

        this._makeRequest(
            "/talks/" + talk_id,
            response => {
                callback(response.data);
            },
            error_callback
        );
    }

    getBios(callback, error_callback = null) {

        let promise = this._ensureUserInfo();

        promise.then( result => {
            this._makeRequest(
                "/user/" + this.current_user.id + "/bios/",
                response => {
                    callback(response.data);
                },
                error_callback
            );
        });


    }

    getBio(bio_id, callback, error_callback = null) {
        this._makeRequest(
            "/bios/" + bio_id,
            response => {
                callback(response.data);
            },
            error_callback
        );
    }
}

export {SymposiumApiClient};
