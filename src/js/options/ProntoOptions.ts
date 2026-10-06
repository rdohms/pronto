import debug from '../helper/Debug.js';
import { AuthenticationManager } from './AuthenticationManager.js';
import type { TokenFetcher } from '../identity/TokenFetcher.js';
import type { SymposiumApiClient } from '../api/SymposiumApiClient.js';
import type { OptionStorage } from './OptionStorage.js';

/**
 * Options page controller.
 * Manages auth UI and auto-saves text input values to chrome.storage.
 * All jQuery and Underscore replaced with native DOM APIs.
 */
export class ProntoOptions {
  private readonly fetcher: TokenFetcher;
  private readonly api: SymposiumApiClient;
  private readonly storage: OptionStorage;
  private readonly auth: AuthenticationManager;
  private inputs: NodeListOf<HTMLInputElement> = document.querySelectorAll<HTMLInputElement>(
    'input[type="text"]'
  );

  constructor(fetcher: TokenFetcher, api: SymposiumApiClient, storage: OptionStorage) {
    this.fetcher = fetcher;
    this.api = api;
    this.storage = storage;

    this.auth = new AuthenticationManager(fetcher, api);

    this._loadOptionInputs();
    this._initValues();
    this._setupAutoSave();
  }

  private _loadOptionInputs(): void {
    this.inputs = document.querySelectorAll<HTMLInputElement>('input[type="text"]');
  }

  private _initValues(): void {
    this.inputs.forEach((element) => {
      this.storage.get(element.id).then((value) => {
        element.value = value ?? '';
      });
    });
  }

  private _setupAutoSave(): void {
    this.inputs.forEach((element) => {
      element.addEventListener('blur', (event) => {
        const input = event.target as HTMLInputElement;
        this._signalInputState('saving', input);
        this.saveValue(input.id, input.value);
        this._signalInputState('saved', input);
      });

      element.addEventListener('focus', (event) => {
        const input = event.target as HTMLInputElement;
        this._signalInputState('editing', input);
      });
    });
  }

  private _signalInputState(state: 'editing' | 'saving' | 'saved', input: HTMLInputElement): void {
    const formGroup = input.closest<HTMLElement>('.form-group');
    const feedback = input.parentElement?.querySelector<HTMLElement>('.form-control-feedback');

    switch (state) {
      case 'editing':
      case 'saving':
        formGroup?.classList.remove('has-success');
        feedback?.classList.remove('fa-check');
        break;
      case 'saved':
        formGroup?.classList.add('has-success');
        feedback?.classList.add('fa-check');
        break;
    }
  }

  saveValue(key: string, value: string | undefined): void {
    debug.log('[options] saving:', key, value);
    if (value === undefined) return;
    this.storage.set(key, value);
  }
}
