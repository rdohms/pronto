class TokenStorage {
    constructor() {
        this.storageKey = 'pronto_access_token';
        chrome.storage.sync.get(null, data => { console.log(data); });
    }

    hasToken() {
        let promise = new Promise((resolve, reject) => {
            chrome.storage.sync.get(this.storageKey, (storage) => {
                resolve(storage.hasOwnProperty(this.storageKey));
            });
        });

        promise.then((hasKey) => {
            return hasKey;
        });
    }

    getToken() {
        let promise = new Promise((resolve, reject) => {
            chrome.storage.sync.get(this.storageKey, (storage) => {
                console.log(storage, storage[this.storageKey]);
                if (storage.hasOwnProperty(this.storageKey)) {
                    resolve(storage[this.storageKey]);
                } else {
                    resolve(null);
                }
            });
        });

        promise.then((token) => {
            return token;
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
