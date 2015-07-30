import $ from 'jquery';
import debug from '../helper/Debug';

class Popup {

    constructor(talks, bios, storage) {

        this.talks = talks;
        this.bios = bios;
        this.storage = storage;

        this._checkTokenPresence();
    }

    _checkTokenPresence() {

        this.storage.hasToken().then(hasToken => {

            debug.log('[popup] token present?', hasToken);

            if (hasToken) {
                this._setup();
            } else {
                this._redirectToOptions();
            }
        });

    }

    _setup() {
        this._injectCodeInCurrentTab();
        this.talks.populateList();
        this.bios.populateList();
    }

    _injectCodeInCurrentTab() {
            chrome.tabs.insertCSS(null, { file: "build/css/font-awesome.css" });
            chrome.tabs.insertCSS(null, { file: "build/css/injected.css" });

            chrome.tabs.executeScript(null, { file: "build/js/pronto-content.js" });
    }

    _redirectToOptions() {

        debug.log('[popup] button', $('#go-to-options'));
        $('#go-to-options').on('click', () => {
            debug.log('[popup] clicked go-to-options:', chrome.runtime.openOptionsPage);
            if (chrome.runtime.openOptionsPage) {
                chrome.runtime.openOptionsPage();
            } else {
                window.open(chrome.runtime.getURL('options.html'));
            }
            window.close();
        });

        $(".loading-talks").hide();
        $('.options-alert').slideDown();
    }


}

export default Popup;
