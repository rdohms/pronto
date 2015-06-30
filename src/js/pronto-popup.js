import {Popup} from "./popup/Popup";
import {TalkLister} from "./popup/TalkLister";
import {SymposiumApiClient} from "./api/SymposiumApiClient";
import {TokenStorage} from "./identity/TokenStorage";

let settings = require('../../extension/build/js/config.js');
let ga       = require('./analytics.js');

let storage  = new TokenStorage();
let api = new SymposiumApiClient(
    settings.base_url,
    storage
);

let talks = new TalkLister(api);
let popup = new Popup(talks, storage);

ga('send', 'pageview', '/popup.html');
