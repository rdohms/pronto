var $ = require('jquery');
var Mustache = require('mustache');

class TalkLister {

    constructor (api) {
        this.api = api;
        this.base_url = "http://symp.oss.dev";

        this._injectCodeInCurrentTab();
        this._populateTalks();
    }

    _injectCodeInCurrentTab() {
        chrome.tabs.insertCSS(null, { file: "build/css/font-awesome.css" });
        chrome.tabs.insertCSS(null, { file: "build/css/injected.css" });

        chrome.tabs.executeScript(null, { file: "build/js/jquery.min.js" }, function() {
            chrome.tabs.executeScript(null, { file: "build/js/pronto-content.js" });
        });
    }

    _activateButtons() {
      var fillButtons = document.querySelectorAll('.fill-this-talk');

      for (var i = 0; i < fillButtons.length; i++) {
          fillButtons[i].addEventListener('click', e => {
              this.initiateFormFill(e);
          });
      }
    }

    _renderTalkDiv(talk) {

        let template = $('#pronto-talk-template').html();

        Mustache.parse(template);   // optional, speeds up future uses

        var rendered = Mustache.render(template, {
            title: talk.attributes.title,
            type: talk.attributes.type,
            level: talk.attributes.level,
            length: talk.attributes.length,
            id: talk.id
        });

        $(".talk-list > ul").prepend(rendered);
    }

    _populateTalks() {
        $(".loading-talks").show();

        this.api.getUserTalks(
            (data) => {

                $(".talk-list > ul").html();

                for (var item of data) {
                    this._renderTalkDiv(item);
                }

                this._activateButtons();

                $(".loading-talks").fadeOut();
            },
            (data) => {

                let template = $('#pronto-talk-error-template').html();
                var rendered = Mustache.render(template, {
                    message: "Unable to load talks from Symposium, sorry!",
                    details: response.status + ": " + response.statusText
                });

                $(".talk-list > ul").html(rendered);
                $(".loading-talks").fadeOut();
            }
        );
    }

    initiateFormFill(e) {

        let talk_id = $(e.currentTarget).data("talkId");

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {type: "FILL_TALK", talk_id: talk_id}, function(response) {
                if (response.success) {
                    window.close();
                }
            });
        });
    }

}

export {TalkLister};
