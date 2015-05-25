class FormField {

    constructor(input) {
        this.input = input;
    }

    highlightFilled() {
        this.input.addClass("pronto-filled");
    }

    highlightLocated() {
        this.input.addClass("pronto-located");
    }
}

class Result {

    constructor() {
        this.filledInputs = [];
    }

    displaySummary() {

        let count = this.filledInputs.length;

        let html = `
        <div id="pronto-summary">
            <span><i class="fa fa-check"></i> pronto!</span>
            ${count} fields were filled automatically for you.
        </div>`;

        $('body').append(html);
        $('#pronto-summary').slideDown().delay(7000).slideUp();
    }

    flagFilledInput($input) {

        if ($input instanceof FormField === false) {
            $input = new FormField($input);
        }

        this.filledInputs.push($input);
        $input.highlightFilled();
    }
}

class FormHandler {

    constructor(alternateInputDataLabels) {

        this.alternateInputDataLabels = alternateInputDataLabels;
        this.inputs = [];
        this._gatherFormFields();
        this.debug = false;

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
                this.inputs.push({
                    input: $input,
                    label: $label,
                    labelText: $label.text(),
                    keywords: this.stringToKeywords($label.text())
                });

                if (this.debug) {
                    new FormField($input).highlightLocated();
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
                field.input.val(value);
                this.currentResult.flagFilledInput(field.input);
            }
        });
    }
}

var filler = new FormHandler(alternateInputDataNames);

filler.mapDataToForm({
    title: "Composer the Right Way",
    type: "seminar",
    length: "60",
    level: "beginner",
    description: "this is my description or abstract",
    outline: "this is the outline",
    organizer_notes: "here are some notes"
});
