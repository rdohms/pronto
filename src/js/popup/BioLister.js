
import $ from 'jquery';
import Mustache from 'mustache';
import debug from '../helper/Debug';

class BioLister {

    constructor (api, settings) {
        this.api = api;
        this.loading_div = $(".loading-warning");
        this.settings = settings;
    }

    _renderBio(bio) {
        let template = $('#pronto-bio-template').html();

        Mustache.parse(template);   // optional, speeds up future uses

        var rendered = Mustache.render(template, {
            id: bio.id,
            nickname: bio.attributes.nickname,
            short_description: bio.attributes.body.substring(0, 100),
            summary: bio.attributes.body,
            view_link: `${this.settings.get('base_url')}/bios/${bio.id}`,
            edit_link: `${this.settings.get('base_url')}/bios/${bio.id}/edit`

        });

        $(".bio-list > ul").prepend(rendered);
    }

    _activateButtons() {
        var fillButtons = document.querySelectorAll('.bio');

        for (var i = 0; i < fillButtons.length; i++) {
            fillButtons[i].addEventListener('click', e => {
                this.triggerFormFill(e);
            });
        }

        $('.btn-copy-bio').on('click', (e) => {
            var Clipboard = require('clipboard-tool');
            e.stopPropagation();
            Clipboard.write($(e.currentTarget).data('summary'));
            debug.log('[bio] copied');
        });
    }

    _sendBioData(data) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {type: "FILL_BIO", bio_data: {body: data.body}}, function(response) {
                ga('send', 'event', 'extension', 'active_on', response.url);
                if (response.success) {
                    window.close();
                }
            });

            ga('send', 'event', 'bio', 'fill_requested', data.nickname);
        });
    }

    populateList() {
        this.loading_div.show();

        this.api.getBios(
            (data) => {

                $(".bio-list > ul").html();

                for (var item of data) {
                    this._renderBio(item);
                }

                this._activateButtons();

                this.loading_div.fadeOut();
            },
            (data) => {

                // let template = $('#pronto-talk-error-template').html();
                // var rendered = Mustache.render(template, {
                //     message: "Unable to load talks from Symposium, sorry!",
                //     details: response.status + ": " + response.statusText
                // });
                //
                // $(".talk-list > ul").html(rendered);
                // $(".loading-talks").fadeOut();
            }
        );
    }

    triggerFormFill(e) {

        let bio_id = $(e.currentTarget).data("bioId");

        this.api.getBio(bio_id, bio => {
            this._sendBioData(bio.attributes);
        });

    }

}

export default BioLister;
