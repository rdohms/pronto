import FormField from "./FormField";
import Result from "./Result";
import FuzzyMapper from "./FuzzyMapper";
import debug from '../helper/Debug';
import $ from 'jquery';

class FormFiller {

    constructor(config) {

        this.config = config;
        this.inputs = [];
        this._gatherFormFields();
        this.debug = false;

        this._setupListeners();
    }

    _setupListeners() {
        chrome.runtime.onMessage.addListener(
            (request, sender, sendResponse) => {
                debug.log('[form] received message:', request);
                if (request.type == "FILL_TALK") {
                    this.fillForm(request.talk_data);
                    sendResponse({success: true, url: window.location.href});
                }
                if (request.type == "FILL_BIO") {
                    this.fillForm(request.bio_data);
                    sendResponse({success: true, url: window.location.href});
                }
        });
    }

    _gatherFormFields() {

        var $rawInputs = $(':input');

        $rawInputs.each((i, input) => {
        	var $input = $(input);
        	var $elt = $input.parent();
        	var $label;

            // Find label by using "for" attribute
            if ($input.attr('id')) {
                var $form = $input.closest('form');
                var $for_label = $form.find('label[for="' + $input.attr('id') + '"]');
                if ($for_label.length) {
                    this.assignLabel($input, $for_label);
                    return;
                }
            }

            // Iterate elements to find label for field
        	while ($elt.find(':input').length === 1) {

                if ($elt.is('label')) {
        			this.assignLabel($input, $elt);
        			break;
        		} else if ($elt.children('label').length) {
                    this.assignLabel($input, $elt.children('label').first());
        			break
        		}

        		$elt = $elt.parent();
        	}

        })

    }

    assignLabel($input, $label) {
        let field = new FormField($input);

        this.inputs.push({
            input: $input,
            label: $label.text(),
            keywords: this.stringToKeywords($label.text()).concat($label.text()),
            field: field
        });

        if (this.debug) {
            field.highlightLocated();
        }
    }

    stringToKeywords(label) {

        let keywords = label.split(/[(\s|/|_)+]/)
            .map( string => { return string.toLowerCase(); } );

        return keywords;
    }

    fillForm(data) {

        let mapper = new FuzzyMapper(this.inputs);
        mapper.reset();
        this.currentResult = new Result();

        for (var key in data) {
            if (! data.hasOwnProperty(key)) {
                continue;
            }

            if (this.config.ignoredData.includes(key)) {
                continue;
            }

            let field = mapper.match(this.expandDataLabelKeywords(key));
            this.populateFormField(field, data[key], key);
        }

        this.currentResult.displaySummary();
    }

    expandDataLabelKeywords(label) {
        let labelKeywords = this.stringToKeywords(label);

        if (label in this.config.alternateDataNames) {
            labelKeywords = labelKeywords.concat(this.config.alternateDataNames[label]);
        }

        return labelKeywords;
    }

    populateFormField(field, value, property) {
        if (field == undefined) {
            return;
        }

        field.setValue(value, property, this.currentResult)
    }
}

export default FormFiller;
