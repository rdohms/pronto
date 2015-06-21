var $ = require('jquery');

class TokenFetcher {

    constructor (id, secret, storage) {

        this.clientId = id;
        this.clientSecret = secret;

        this.redirectUri = chrome.identity.getRedirectURL('provider_cb');
        this.redirectRegExp = new RegExp(this.redirectUri + '[#\?](.*)');

        this.base_url = 'http://symp.oss.dev/'


        this.storage = storage;
        this.access_token = this.storage.getToken();

        this.currentCallback = function () {
            new Error('No currentCallback');
        }
    }

    getToken(interactive, callback) {

        this.currentCallback = callback;

        // We already have a token, abort process
        if (this.access_token) {
            this.currentCallback(null, this.access_token);
            return;
        }

        let options = {
            interactive: interactive,
            url: this._getAuthUrl()
        }

        chrome.identity.launchWebAuthFlow(options, redirectUri => {
            console.log('launchWebAuthFlow completed', chrome.runtime.lastError,redirectUri);

            if (chrome.runtime.lastError) {
              this.currentCallback(new Error(chrome.runtime.lastError));
              return;
            }

            let matches = redirectUri.match(this.redirectRegExp);

            if (matches && matches.length > 1)
              this._handleProviderResponse(
                  this._parseRedirectFragments(matches[1])
              );
            else
              this.currentCallback(new Error('Invalid redirect URI'));
        });

    }

    _setAccessToken(access_token) {
        this.access_token = access_token;
        console.log('Setting access_token: ', access_token);

        this.storage.saveToken(access_token);
        this.currentCallback(null, access_token);
    }

    _handleProviderResponse(values) {
        console.log('providerResponse', values);

        if (values.hasOwnProperty('access_token'))
          this._setAccessToken(values.access_token);
        else if (values.hasOwnProperty('code'))
          this._exchangeCodeForToken(values.code);
        else
          this.currentCallback(new Error('Neither access_token nor code avialable.'));
    }

    _parseRedirectFragments(fragment) {
        let pairs = fragment.split(/&/);
        let values = {};

        pairs.forEach(function(pair) {
          var nameval = pair.split(/=/);
          values[nameval[0]] = nameval[1];
        });

        return values;
    }

    _exchangeCodeForToken(code) {

        $.post(
            this._getAccessTokenUrl(code),
            this._getCodeExchangeData(code),
            (response) => {
                if (response.hasOwnProperty('access_token')) {
                  this._setAccessToken(response.access_token);
                } else {
                  this.currentCallback(new Error('Cannot obtain access_token from code.'));
                }
        }).fail(() => {
            this.currentCallback(new Error('Code Exchange failed.'));
        });
    }

    _getAuthUrl() {
        let encodedUri = encodeURIComponent(this.redirectUri);
        return `${this.base_url}oauth/authorize?client_id=${this.clientId}&redirect_uri=${encodedUri}&response_type=code`;
    }

    _getAccessTokenUrl(code) {
        return `${this.base_url}oauth/access-token`;
    }

    _getCodeExchangeData(code) {
        return {
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': this.redirectUri,
            'client_id': this.clientId,
            'client_secret': this.clientSecret
        }
    }
}

export {TokenFetcher};
