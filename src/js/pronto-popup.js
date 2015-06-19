import {TalkLister} from "./popup/TalkLister";
import {SymposiumApiClient} from "./api/SymposiumApiClient";

// let jQuery = require('jquery');
// require('../../build/js/bootstrap.min.js');

let pronto = new TalkLister(new SymposiumApiClient());
