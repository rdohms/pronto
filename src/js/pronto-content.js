require("babelify/polyfill");

import FormFiller from "./form/FormFiller";
import ga from './analytics.js';

let dataCfg = require("./form/alternate_names");
var filler = new FormFiller(dataCfg, true);

ga('send', 'pageview', '/content.html');
