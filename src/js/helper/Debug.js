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

var settings = require('../../../extension/build/js/config.js');
module.exports = new Debug(settings.debug);
