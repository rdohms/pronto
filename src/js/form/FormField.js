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

export {FormField};
