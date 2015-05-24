
class FormHandler {

    constructor(alternateInputDataLabels) {

        this.alternateInputDataLabels = alternateInputDataLabels;
        this.inputs = [];
        this._gatherFormFields();
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
        	}
        })
    }


    stringToKeywords(label) {

        let keywords = label.split(/[(\s|/|_)+]/)
            .map( string => { return string.toLowerCase(); } );

        return keywords;
    }

    mapDataToForm(data) {
        for (var key in data) {
            if (! data.hasOwnProperty(key)) {
                continue;
            }

            this.expandDataLabelKeywords(key).forEach(name => {
                this.populateFormField(name, data[key]);
            });
        }
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
