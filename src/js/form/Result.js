import FormField from "./FormField";
import $ from 'jquery';

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

export default Result;
