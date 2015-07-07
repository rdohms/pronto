var $ = require('jquery');
import {FormFiller} from "./form/FormFiller";


let dataCfg = require("./form/alternate_names");
let ga      = require('./analytics.js');

require("babelify/polyfill");

var filler = new FormFiller(dataCfg, true);

ga('send', 'pageview', '/content.html');
