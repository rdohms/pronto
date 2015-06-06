import {FormFiller} from "./form/FormFiller";
import {SymposiumApiClient} from "./api/SymposiumApiClient";

let alternates = require("./form/alternate_names");
require("babelify/polyfill");

var filler = new FormFiller(alternates.inputDataNames, new SymposiumApiClient(), true);
