import $ from 'jquery';
import Mustache from 'mustache';

class TalkLister {

    constructor (api) {
        this.api = api;
    }

    _renderTalk(talk) {
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

    _activateButtons() {
        var fillButtons = document.querySelectorAll('.talk');

        for (var i = 0; i < fillButtons.length; i++) {
            fillButtons[i].addEventListener('click', e => {
                this.triggerFormFill(e);
            });
        }
    }

    _sendTalkData(data) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {type: "FILL_TALK", talk_data: data}, function(response) {
                ga('send', 'event', 'extension', 'active_on', response.url);
                if (response.success) {
                    window.close();
                }
            });

            ga('send', 'event', 'talk', 'fill_requested', data.title);
        });
    }

    populateList() {
        $(".loading-warning").show();

        this.api.getUserTalks(
            (data) => {

                $(".talk-list > ul").html();

                for (var item of data) {
                    this._renderTalk(item);
                }

                this._activateButtons();

                $(".loading-warning").fadeOut();
            },
            (data) => {

                let template = $('#pronto-talk-error-template').html();
                var rendered = Mustache.render(template, {
                    message: "Unable to load talks from Symposium, sorry!",
                    details: response.status + ": " + response.statusText
                });

                $(".talk-list > ul").html(rendered);
                $(".loading-warning").fadeOut();
            }
        );
    }

    triggerFormFill(e) {

        let talk_id = $(e.currentTarget).data("talkId");

        this.api.getTalkInfo(talk_id, talk => {
            this._sendTalkData(talk.attributes);
        });

    }

}

export default TalkLister;
