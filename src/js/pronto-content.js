require("babelify/polyfill");

import FormFiller from "./form/FormFiller";
import ga from './analytics.js';
import dataCfg from "./form/alternate_names";
var filler = new FormFiller(dataCfg, true);

ga('send', 'pageview', '/content.html');
