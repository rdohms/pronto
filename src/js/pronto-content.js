import {FormFiller} from "./form/FormFiller";

let alternates = require("./form/alternate_names");
require("babelify/polyfill");

var filler = new FormFiller(alternates.inputDataNames, true);
