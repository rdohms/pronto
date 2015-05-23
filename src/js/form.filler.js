
class FormHandler {
    constructor() {
        this.inputs = [];
        this.gatherFormFields();
    }

    gatherFormFields() {

        var $rawInputs = $(':input');

        $rawInputs.each(function(i, input) {
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
                    keywords: this.convertLabelToKeywords($label.text())
                });
        	}
        }.bind(this))
    }

    convertLabelToKeywords(label) {
        var keywords = label.split(/[(\s|/)+]/);

        keywords = keywords.map(
            function(string) { return string.toLowerCase(); }
        );

        return keywords;
    }

    fillField(name, value) {

        this.inputs.forEach(field => {
            if (field.keywords.indexOf(name) != -1) {
                field.input.val(value);
            }
        });

    }

    fillForm(data) {
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                let val = data[key];

                this.fillField(key, val);
            }
        }
    }
}

var filler = new FormHandler();
// filler.fillField('title', 'some title from symp');
filler.fillForm({
    title: "Composer the Right Way",
    type: "seminar",
    length: "60",
    level: "beginner",
    description: "this is my description or abstract",
    outline: "this is the outline",
    organizer_notes: "here are some notes"
});
