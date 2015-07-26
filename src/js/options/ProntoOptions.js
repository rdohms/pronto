import $ from 'jquery';
import _ from 'underscore';
import debug from '../helper/Debug';
import AuthenticationManager from './AuthenticationManager';

class ProntoOptions {

    constructor(fetcher, api, storage) {
        this.fetcher = fetcher;
        this.api = api;
        this.storage = storage;

        this.auth = new AuthenticationManager(fetcher, api);

        this.inputs = [];
        this._loadOptionInputs();
        this._initValues();
        this._setupAutoSave();
    }

    _loadOptionInputs() {
        this.inputs = $(':input[type="text"]');
    }

    _initValues() {

        this.inputs.each((index, element) => {
            element = $(element);

            this.storage.get(element.attr('id')).then(value => {
                element.val(value);
            })
        });

    }

    _setupAutoSave() {
        this.inputs.each((index, element) => {
            let $element = $(element);

            $element.on('blur', (event) => {
                let $input = $(event.target);

                this._signalInputState('saving', $input);
                this.saveValue($input.attr('id'), $input.val());
                this._signalInputState('saved', $input);
            });

            $element.on('focus', (event) => {
                let $input = $(event.target);

                this._signalInputState('editing', $input);
            });
        });
    }

    _signalInputState(state, $input) {

        switch (state) {
            case 'editing':
                $input.closest('.form-group').removeClass('has-success');
                $input.siblings('.form-control-feedback').removeClass('fa-check');
            case 'saving':
                $input.closest('.form-group').removeClass('has-success');
                $input.siblings('.form-control-feedback').removeClass('fa-check');
                break;
            case 'saved':
                $input.closest('.form-group').addClass('has-success');
                $input.siblings('.form-control-feedback').addClass('fa-check');
                break;
            default:
        }
    }

    saveValue(key, value) {
        debug.log('[options] saving:', key, value);

        if (value === undefined) {
            return;
        }

        this.storage.set(key, value);
    }
}

export default ProntoOptions;
