import {Popup} from "./popup/Popup";
import {TalkLister} from "./popup/TalkLister";
import {SymposiumApiClient} from "./api/SymposiumApiClient";
import {TokenStorage} from "./identity/TokenStorage";

// let jQuery = require('jquery');
// require('../../build/js/bootstrap.min.js');

let storage  = new TokenStorage();
let api = new SymposiumApiClient(storage);

let talks = new TalkLister(api);
let popup = new Popup(talks, storage);
console.log("Ready to go");
