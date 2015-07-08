import debug from '../helper/Debug';

class TokenStorage {
    constructor() {
        this.storageKey = 'pronto_access_token';
        chrome.storage.sync.get(null, data => {
            debug.log("[storage] current contents:", data);
        });
    }

    hasToken() {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(this.storageKey, (storage) => {

                if (storage.hasOwnProperty(this.storageKey) == false) {
                    resolve(false)
                }

                if (storage[this.storageKey] == null) {
                    resolve(false);
                }

                resolve(true);
            });
        });
    }

    getToken() {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(this.storageKey, (storage) => {
                debug.log('[storage] getToken:', storage[this.storageKey]);
                if (storage.hasOwnProperty(this.storageKey)) {
                    resolve(storage[this.storageKey]);
                } else {
                    resolve(null);
                }
            });
        });
    }

    saveToken(access_token) {
        debug.log('[storage] saveToken:', access_token);
        chrome.storage.sync.set({[this.storageKey]: access_token});
    }

    removeToken() {
        debug.log('[storage] removeToken');
        chrome.storage.sync.remove(this.storageKey);
    }
}

export default TokenStorage;
