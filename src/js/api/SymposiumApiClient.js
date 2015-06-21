var $ = require('jquery');

class SymposiumApiClient {
    constructor(storage) {
        this.base_url = 'http://symp.oss.dev/api';
        this.current_user = null;
        this.jQuery = $;

        this.access_token = storage.getToken();
    }

    _makeRequest(url, callback, error_callback = null) {
        if (error_callback == null) {
            error_callback = response => {
                this.error_response = response;
            };
        }

        this.jQuery.get(this.base_url + url, callback).fail(error_callback);

        $.ajax({
          url : this.base_url + url,
          headers: { "Authorization": `Bearer ${this.access_token}` },
          type : 'GET',
        })
        .done(callback)
        .fail(error_callback);

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
