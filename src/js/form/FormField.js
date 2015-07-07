var _ = require('underscore');

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

    setValue(value, property, result) {

        if (result.wasFilled(this)) {
            return;
        }

        if (this.input.is('select')) {
            this.fillDropdown(value, property, result);
        } else if (this.input.is(':checkbox')) {
            this.fillRegular(value, property, result);
            //TODO: handle checkboxes
        } else if (this.input.is(':radio')) {
            this.fillRegular(value, property, result);
            //TODO: handle radios
        } else {
            this.fillRegular(value, property, result);
        }

        this.highlightFilled();
        result.addFilledField(this);
    }

    fillRegular(value, property, result) {
        let currentValue = this.input.val();

        if (currentValue !== null && currentValue.length != 0) {
            this.highlightSkipped();
            result.addSkippedField(this);
            return;
        }

        this.input.val(value);
    }

    fillDropdown(value, property, result) {
        let dataCfg = require("./alternate_names");

        let allValues = dataCfg.alternateOptions[property][value];
        allValues.push(value);

        _.each(allValues, (possibleValue) => {
            if (this.input.children(`option[value='${possibleValue}']`).length == 0) {
                return;
            }

            this.input.val(possibleValue);
        });
    }
}

export {FormField};
