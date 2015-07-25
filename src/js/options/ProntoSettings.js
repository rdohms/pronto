class ProntoSettings {
    constructor() {
        window.addEvent("domready", this._createSettings());
    }

    _createSettings() {
        var settings = new FancySettings("Pronto!", "icon.png");

        var connectBtn = settings.create({
            "tab": "Connect",
            "group": "Connect to API",
            "name": "connectBtn",
            "type": "button",
            "label": "Authenticate: ",
            "text": "Authenticate"
        });

        connectBtn.addEvent("action", function () {
            alert("You clicked me!");
        });

        var endpoint = settings.create({
            "tab": "Custom Symposium",
            "group": "API",
            "name": "endpoint",
            "type": "text",
            "label": "Base Url",
            "text": "http://symposiumapp.com"
        });

        var client_id = settings.create({
            "tab": "Custom Symposium",
            "group": "API",
            "name": "client_id",
            "type": "text",
            "label": "Client ID",
            "text": "your client id"
        });

        var client_secret = settings.create({
            "tab": "Custom Symposium",
            "group": "API",
            "name": "client_secret",
            "type": "text",
            "label": "Client Secret",
            "text": "your client secret"
        });

        settings.align([
            endpoint,
            client_id,
            client_secret
        ]);

    }
}

export default new ProntoSettings();
