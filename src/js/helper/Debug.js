import settings from '../../../extension/build/js/config.js';

class Debug {
    constructor (enabled) {
        this.enabled = enabled;
    }

    log(...messages) {
        if (this.enabled == false) {
            return;
        }

        console.log(...messages);
    }
}

export default new Debug(settings.debug);
