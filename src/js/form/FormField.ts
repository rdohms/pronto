import dataCfg from './alternate_names.js';
import type { Result } from './Result.js';

/**
 * Represents a single form input on the CfP page.
 * Handles filling, skipping, and visual highlighting.
 *
 * Bug #1 fix: `fillDropdown` now guards against undefined `alternateOptions[property]`
 * before attempting to access the value map.
 */
export class FormField {
  private readonly input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

  constructor(input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
    this.input = input;
  }

  highlightSkipped(): void {
    this.input.classList.add('pronto-skipped');
  }

  highlightFilled(): void {
    this.input.classList.add('pronto-filled');
  }

  highlightLocated(): void {
    this.input.classList.add('pronto-located');
  }

  setValue(value: string, property: string, result: Result): void {
    if (result.wasFilled(this)) {
      return;
    }

    if (this.input.tagName.toLowerCase() === 'select') {
      this.fillDropdown(value, property, result);
    } else {
      // Handles text inputs, textareas, checkboxes, radios
      // TODO: add proper checkbox/radio support
      this.fillRegular(value, result);
    }

    this.highlightFilled();
    result.addFilledField(this);
  }

  private fillRegular(value: string, result: Result): void {
    const currentValue = this.input.value;

    if (currentValue !== null && currentValue.length !== 0) {
      this.highlightSkipped();
      result.addSkippedField(this);
      return;
    }

    this.input.value = value;
  }

  private fillDropdown(value: string, property: string, result: Result): void {
    // Bug #1 fix: guard against missing alternateOptions[property] or alternateOptions[property][value]
    const propertyOptions = dataCfg.alternateOptions[property];
    if (!propertyOptions) {
      // No alternate options for this property — try direct value match only
      this.trySetSelectValue(value);
      return;
    }

    const valueAliases = propertyOptions[value] ?? [];
    const allValues = [...valueAliases, value];

    for (const possibleValue of allValues) {
      const option = (this.input as HTMLSelectElement).querySelector<HTMLOptionElement>(
        `option[value="${possibleValue}"]`
      );
      if (option) {
        this.input.value = possibleValue;
        return;
      }
    }
  }

  private trySetSelectValue(value: string): void {
    const option = (this.input as HTMLSelectElement).querySelector<HTMLOptionElement>(
      `option[value="${value}"]`
    );
    if (option) {
      this.input.value = value;
    }
  }
}
