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
let debug = new Debug(settings.debug);

export default debug;
