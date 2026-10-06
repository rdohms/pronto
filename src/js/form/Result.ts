import type { FormField } from './FormField.js';

/**
 * Tracks which fields were filled or skipped during a form-fill operation
 * and displays a summary banner on the page when done.
 */
export class Result {
  private filledInputs: FormField[] = [];
  private skippedInputs: FormField[] = [];

  constructor() {
    this.reset();
  }

  reset(): void {
    this.filledInputs = [];
    this.skippedInputs = [];
    document.getElementById('pronto-summary')?.remove();
  }

  wasFilled(input: FormField): boolean {
    return this.filledInputs.includes(input);
  }

  addFilledField(input: FormField): void {
    this.filledInputs.push(input);
  }

  addSkippedField(input: FormField): void {
    this.skippedInputs.push(input);
  }

  displaySummary(): void {
    const existing = document.getElementById('pronto-summary');
    existing?.remove();

    const div = document.createElement('div');
    div.id = 'pronto-summary';
    div.innerHTML = `
      <span class="pronto-header">&#10003; pronto!</span>
      <span class="pronto-filled-info">${this.filledInputs.length} fields were filled automatically for you.</span>
      <span class="pronto-skipped-info">${this.skippedInputs.length} fields were skipped due to existing text.</span>
    `;

    document.body.appendChild(div);

    // Animate: slide down, wait 7s, slide up
    div.style.display = 'none';
    requestAnimationFrame(() => {
      div.style.display = '';
      div.classList.add('pronto-summary--visible');
      setTimeout(() => {
        div.classList.remove('pronto-summary--visible');
        div.classList.add('pronto-summary--hidden');
        div.addEventListener('transitionend', () => div.remove(), { once: true });
      }, 7000);
    });
  }
}
