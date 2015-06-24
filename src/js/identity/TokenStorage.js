
// TODO: make this async

// TODO: make popup check this first, and trigger options page if empty

class TokenStorage {
    constructor() {
        this.storageKey = 'pronto_access_token';
        chrome.storage.sync.get(null, data => {
            console.log("Debug (all stored data):", data);
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
                console.log("getToken:", storage[this.storageKey]);
                if (storage.hasOwnProperty(this.storageKey)) {
                    resolve(storage[this.storageKey]);
                } else {
                    resolve(null);
                }
            });
        });
    }

    saveToken(access_token) {
        chrome.storage.sync.set({[this.storageKey]: access_token});
    }

    removeToken() {
        chrome.storage.sync.remove(this.storageKey);
    }
}

export {TokenStorage};
