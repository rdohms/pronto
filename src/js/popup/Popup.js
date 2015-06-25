var $ = require('jquery');
let debug = require('../helper/Debug');

class Popup {

    constructor(talks, storage) {

        this.talks = talks;
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

        document.querySelector('#go-to-options').addEventListener(function() {
          if (chrome.runtime.openOptionsPage) {
            // New way to open options pages, if supported (Chrome 42+).
            chrome.runtime.openOptionsPage();
          } else {
            // Reasonable fallback.
            window.open(chrome.runtime.getURL('options.html'));
          }
        });
    }

    _injectCodeInCurrentTab() {
            chrome.tabs.insertCSS(null, { file: "build/css/font-awesome.css" });
            chrome.tabs.insertCSS(null, { file: "build/css/injected.css" });

            chrome.tabs.executeScript(null, { file: "build/js/jquery.min.js" }, function() {
                chrome.tabs.executeScript(null, { file: "build/js/pronto-content.js" });
            });
    }

    _redirectToOptions() {
        $(".loading-talks").hide();
        $('.options-alert').slideDown();
    }


}

export {Popup};
