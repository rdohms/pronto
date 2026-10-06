import { FormFiller } from './form/FormFiller.js';
import dataCfg from './form/alternate_names.js';

// Content script entry point.
// Instantiates FormFiller which registers the chrome.runtime.onMessage listener.
// The popup will inject this script into the active tab via chrome.scripting.executeScript.

const filler = new FormFiller(dataCfg);

// Suppress unused variable warning — FormFiller registers its own listener in constructor
void filler;
