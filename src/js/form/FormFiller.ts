import { FormField } from './FormField.js';
import { Result } from './Result.js';
import { FuzzyMapper } from './FuzzyMapper.js';
import debug from '../helper/Debug.js';
import type { AlternateNamesConfig } from './alternate_names.js';
import type { ProntoMessage, FillResponse } from '../../types/index.js';

interface FieldEntry {
  input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  label: string;
  keywords: string[];
  field: FormField;
}

/**
 * Content-script entry class.
 * Gathers all labelled form fields on the page, listens for FILL_TALK / FILL_BIO
 * messages from the popup, and fuzzy-matches + fills the form.
 *
 * All jQuery replaced with native DOM APIs.
 */
export class FormFiller {
  private readonly config: AlternateNamesConfig;
  private inputs: FieldEntry[] = [];
  private readonly debugMode: boolean;
  private currentResult: Result | null = null;

  constructor(config: AlternateNamesConfig, debugMode = false) {
    this.config = config;
    this.debugMode = debugMode;
    this._gatherFormFields();
    this._setupListeners();
  }

  private _setupListeners(): void {
    chrome.runtime.onMessage.addListener(
      (request: ProntoMessage, _sender, sendResponse: (r: FillResponse) => void) => {
        debug.log('[form] received message:', request);
        if (request.type === 'FILL_TALK') {
          this.fillForm(request.talk_data);
          sendResponse({ success: true, url: window.location.href });
        }
        if (request.type === 'FILL_BIO') {
          this.fillForm(request.bio_data);
          sendResponse({ success: true, url: window.location.href });
        }
      }
    );
  }

  private _gatherFormFields(): void {
    const rawInputs = document.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >('input, select, textarea');

    rawInputs.forEach((input) => {
      // Strategy 1: find label via <label for="id"> attribute
      if (input.id) {
        const form = input.closest('form');
        const forLabel = (form ?? document).querySelector<HTMLLabelElement>(
          `label[for="${input.id}"]`
        );
        if (forLabel) {
          this.assignLabel(input, forLabel);
          return;
        }
      }

      // Strategy 2: walk up ancestors looking for a wrapping <label>
      // or a sibling <label> in a container with only this input
      let el: Element | null = input.parentElement;
      while (el) {
        const inputs = el.querySelectorAll('input, select, textarea');
        if (inputs.length !== 1) break;

        if (el.tagName.toLowerCase() === 'label') {
          this.assignLabel(input, el as HTMLLabelElement);
          break;
        }

        const childLabel = el.querySelector<HTMLLabelElement>('label');
        if (childLabel) {
          this.assignLabel(input, childLabel);
          break;
        }

        el = el.parentElement;
      }
    });
  }

  assignLabel(
    input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
    label: HTMLElement
  ): void {
    const field = new FormField(input);
    const labelText = label.textContent ?? '';

    this.inputs.push({
      input,
      label: labelText,
      keywords: this.stringToKeywords(labelText).concat([labelText]),
      field,
    });

    if (this.debugMode) {
      field.highlightLocated();
    }
  }

  stringToKeywords(label: string): string[] {
    return label
      .split(/[\s/_()+]+/)
      .map((s) => s.toLowerCase())
      .filter((s) => s.length > 0);
  }

  fillForm(data: Record<string, unknown>): void {
    const mapper = new FuzzyMapper(this.inputs);
    mapper.reset();
    this.currentResult = new Result();

    for (const key of Object.keys(data)) {
      if (this.config.ignoredData.includes(key)) continue;

      const value = data[key];
      if (typeof value !== 'string' && typeof value !== 'number') continue;

      const field = mapper.match(this.expandDataLabelKeywords(key));
      this.populateFormField(field, String(value), key);
    }

    this.currentResult.displaySummary();
  }

  private expandDataLabelKeywords(label: string): string[] {
    const labelKeywords = this.stringToKeywords(label);

    if (label in this.config.alternateDataNames) {
      return labelKeywords.concat(this.config.alternateDataNames[label] ?? []);
    }

    return labelKeywords;
  }

  private populateFormField(field: FormField | undefined, value: string, property: string): void {
    if (field === undefined) return;
    field.setValue(value, property, this.currentResult!);
  }
}
