var $ = require('jquery');
import {FormFiller} from "./form/FormFiller";

let alternates = require("./form/alternate_names");
let ga         = require('./analytics.js');
require("babelify/polyfill");

var filler = new FormFiller(alternates.inputDataNames, true);

ga('send', 'pageview', '/content.html');
