var fuzzy = require('fuzzy');
let debug = require('../helper/Debug');
var _ = require('underscore');

class FuzzyMapper {

    constructor(inputs) {
        this.inputs = inputs;
        this.reset();
    }

    reset() {
        this.skipped = [];
    }

    flagSkippedField(field) {
        this.skipped.push(field);
    }

    isFieldSkipped(field) {
        return (this.skipped.indexOf(field) != -1);
    }

    match(keywords) {
        debug.log('[fuzzy] match called for:', keywords);

        let matches = [];
        let label_matches = [];

        keywords.forEach(name => {

            this.inputs.forEach(field => {

                if (this.isFieldSkipped(field)) {
                    return;
                }

                let results = fuzzy.filter(name, field.keywords);

                var maxObj = _.max(results, function (res) {
                  return res.score;
                });

                var maxIndex = results.indexOf(maxObj);

                if (maxIndex > -1 && results[maxIndex].score > 40) {
                    let highestRanked = results[maxIndex];
                    matches.push({
                        field: field.field,
                        score: highestRanked.score,
                        words: name,
                        label: field.label
                    });
                }
            })

        });

        matches.sort(function (a,b) {
            return b.score - a.score
        });

        let selected_field = matches.shift();

        if (selected_field == undefined) {
            return;
        }

        this.flagSkippedField(selected_field.field);
        debug.log('[fuzzy] match:', keywords, selected_field);

        return selected_field.field;
    }
}

export {FuzzyMapper};
