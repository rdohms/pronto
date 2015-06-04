class SymposiumAPI {
    constructor() {
        this.base_url = 'http://symp.oss.dev';
    }

    getTalkInfo(id, callback) {
        let jqxhr = $.get( this.base_url + "/api/talks/" + id, function(response) {
            callback(response.data.attributes);
        })
        .fail(function() {
           alert( "error" );
        });
    }
}

class FormField {

    constructor(input) {
        this.input = input;
    }

    highlightSkipped() {
        this.input.addClass("pronto-skipped");
    }

    highlightFilled() {
        this.input.addClass("pronto-filled");
    }

    highlightLocated() {
        this.input.addClass("pronto-located");
    }

    setValue(value, result) {

        if (result.wasFilled(this)) {
            return;
        }

        let currentValue = this.input.val();

        if (currentValue !== null && currentValue.length != 0) {
            this.highlightSkipped();
            result.addSkippedField(this);
            return;
        }

        this.input.val(value);
        //TODO: this will expand to handle dropdowns, radios, etc..

        this.highlightFilled();
        result.addFilledField(this);
    }
}

class Result {

    constructor() {
        this.reset();
    }

    reset() {
        this.filledInputs = [];
        this.skippedInputs = [];

        $('#pronto-summary').remove();
    }

    wasFilled(input) {
        return (this.filledInputs.indexOf(input) != -1);
    }

    displaySummary() {

        let html = `
        <div id="pronto-summary">
            <span class="pronto-header"><i class="fa fa-check"></i> pronto!</span>
            <span class="pronto-filled-info">${this.filledInputs.length} fields were filled automatically for you.</span>
            <span class="pronto-skipped-info">${this.skippedInputs.length} fields were skipped due to existing text.</span>
        </div>`;

        $('body').append(html);
        $('#pronto-summary').slideDown().delay(7000).slideUp();
    }

    addFilledField($input) {

        if ($input instanceof FormField === false) {
            $input = new FormField($input);
        }

        this.filledInputs.push($input);
    }

    addSkippedField($input) {

        if ($input instanceof FormField === false) {
            $input = new FormField($input);
        }

        this.skippedInputs.push($input);
    }

}

class FormHandler {

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
                    this.fillTalkData(request.talk_id);
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

    fillTalkData(id) {
        this.api.getTalkInfo(id, talk => {
            this.mapDataToForm(talk);
        });
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

var filler = new FormHandler(alternateInputDataNames, new SymposiumAPI(), true);
