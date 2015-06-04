class TalkLister {

    constructor () {
        this.base_url = "http://symp.oss.dev";
        this._injectCodeInCurrentTab();
        this._populateTalks();
    }

    _injectCodeInCurrentTab() {
        chrome.tabs.insertCSS(null, { file: "build/css/font-awesome.css" });
        chrome.tabs.insertCSS(null, { file: "build/css/injected.css" });

        chrome.tabs.executeScript(null, { file: "build/js/jquery.min.js" }, function() {
            chrome.tabs.executeScript(null, { file: "build/js/pronto-form.js" });
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

        $(".talk-list > ul").append(rendered);
    }

    _populateTalks() {
        $('.loading').show();

        let jqxhr = $.get( this.base_url + "/api/user/1/talksx/", (response) => {

            $(".talk-list > ul").html();

            for (var item of response.data) {
                this._renderTalkDiv(item);
            }

            this._activateButtons();

            $('.loading').fadeOut();
        })
        .fail(function(response) {

            let template = $('#pronto-talk-error-template').html();
            var rendered = Mustache.render(template, {
                message: "Unable to load talks from Symposium, sorry!",
                details: response.status + ": " + response.statusText
            });
    
            $(".talk-list > ul").html(rendered);
            $('.loading').fadeOut();
        });
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

let pronto = new TalkLister();
