import debug from '../helper/Debug';

class OptionStorage {
    constructor() {

    }

    set(key, value) {
        debug.log('[storage] setting', key, value);
        chrome.storage.sync.set({[this._convertKey(key)]: value});
    }

    has(key) {
        debug.log('[storage] looking up', key);
        key = this._convertKey(key);

        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(key, (storage) => {

                if (storage.hasOwnProperty(key) == false) {
                    return resolve(false)
                }

                if (storage[key] == null) {
                    return resolve(false);
                }

                return resolve(true);
            });
        });
    }

    get(key, defaultValue = null) {
        debug.log('[storage] retrieving', key);
        key = this._convertKey(key);

        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(key, (storage) => {

                if (storage.hasOwnProperty(key) == false) {
                    return resolve(defaultValue)
                }

                if (storage[key] == null) {
                    return resolve(defaultValue);
                }

                debug.log('[storage] found', key, storage[key]);
                return resolve(storage[key]);
            });
        });
    }


    remove(key) {
        debug.log('[storage] removing', key, value);
        chrome.storage.sync.remove(this._convertKey(key));
    }

    _convertKey(key) {

        return 'pronto_option_'+key;
    }
}

export default new OptionStorage();
