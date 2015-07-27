import settings from '../../../extension/build/js/config.js';
import option_storage from "../options/OptionStorage";
import debug from '../helper/Debug';
import _ from 'underscore';

class SettingsReader {
    constructor(option_storage, config) {
        debug.log('[reader] boot');
        this.storage = option_storage;
        this.config = config;
    }

    load() {
        return new Promise((resolve, reject) => {
            this.storage.all().then((items) => {
                this.saved = items;
                resolve(true);
            });
        });
    }

    get(option) {
        let key = this.storage._convertKey(option);

        if (_.has(this.saved, key) == -1) {
            return this.config[option];
        }

        if (this.saved[key] == null || this.saved[key] == undefined || this.saved[key] == "") {
            return this.config[option];
        }

        return this.saved[key];
    }

}

export default new SettingsReader(option_storage, settings);
