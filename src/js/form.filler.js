
var formHandler = {

    gatherFormFields: function () {

        var $rawInputs = $(':input'),
            $inputs = [];

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
                console.log(formHandler.convertLabelToKeywords($label.text()));

                $inputs.push({
                    input: $input,
                    label: $label,
                    labelText: $label.text(),
                    keywords: formHandler.convertLabelToKeywords($label.text())
                });
        	}
        })

        return $inputs;

    },

    convertLabelToKeywords: function (label) {
        var keywords = label.split(/[(\s|/)+]/);

        keywords = keywords.map(
            function(string) { return string.toLowerCase(); }
        );

        return keywords;
    }

};

console.log(formHandler.gatherFormFields());
