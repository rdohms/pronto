import {FormField} from "./FormField";
import {Result} from "./Result";

class FormFiller {

    constructor(alternateInputDataLabels, api, debug) {

        this.alternateInputDataLabels = alternateInputDataLabels;
        this.inputs = [];
        this._gatherFormFields();
        this.api = api;
        this.debug = debug;

        this._setupListeners();
    }

    _setupListeners() {
        chrome.runtime.onMessage.addListener(
            (request, sender, sendResponse) => {

                if (request.type == "FILL_TALK") {
                    this.mapDataToForm(request.talk_data);
                    sendResponse({success: true});
                }
        });
    }

    _gatherFormFields() {

        var $rawInputs = $(':input');

        $rawInputs.each((i, input) => {
        	var $input = $(input);
        	var $elt = $input.parent();
        	var $label;
        	while ($elt.find(':input').length === 1) {
        		if ($elt.is('label')) {
        			$label = $elt;
        			break;
        		} else if ($elt.children('label').length) {
        			$label = $elt.children('label').first();
        			break
        		}
        		$elt = $elt.parent();
        	}

        	if ($label) {

                let field = new FormField($input);

                this.inputs.push({
                    input: $input,
                    label: $label,
                    labelText: $label.text(),
                    keywords: this.stringToKeywords($label.text()),
                    field: field
                });

                if (this.debug) {
                    field.highlightLocated();
                }
        	}
        })
    }


    stringToKeywords(label) {

        let keywords = label.split(/[(\s|/|_)+]/)
            .map( string => { return string.toLowerCase(); } );

        return keywords;
    }

    mapDataToForm(data) {

        this.currentResult = new Result();

        for (var key in data) {
            if (! data.hasOwnProperty(key)) {
                continue;
            }

            this.expandDataLabelKeywords(key).forEach(name => {
                this.populateFormField(name, data[key]);
            });
        }

        this.currentResult.displaySummary();
    }

    expandDataLabelKeywords(label) {
        let labelKeywords = this.stringToKeywords(label);

        if (label in this.alternateInputDataLabels) {
            labelKeywords = labelKeywords.concat(this.alternateInputDataLabels[label]);
        }

        return labelKeywords;
    }

    populateFormField(name, value) {
        this.inputs.forEach(field => {
            if (field.keywords.indexOf(name) != -1) {

                field.field.setValue(value, this.currentResult)
            }
        });
    }
}

export {FormFiller};
