import fuzzy from 'fuzzy';
import debug from '../helper/Debug.js';
import type { FormField } from './FormField.js';

interface FieldEntry {
  input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  label: string;
  keywords: string[];
  field: FormField;
}

interface MatchCandidate {
  field: FormField;
  score: number;
  words: string;
  label: string;
}

/**
 * Fuzzy-matches form field labels against Symposium data property names
 * to determine which field should receive which value.
 *
 * Replaces _.max() (Underscore) with native Array.reduce().
 */
export class FuzzyMapper {
  private readonly inputs: FieldEntry[];
  private skipped: FormField[] = [];

  constructor(inputs: FieldEntry[]) {
    this.inputs = inputs;
    this.reset();
  }

  reset(): void {
    this.skipped = [];
  }

  flagSkippedField(field: FormField): void {
    this.skipped.push(field);
  }

  isFieldSkipped(field: FormField): boolean {
    return this.skipped.includes(field);
  }

  match(keywords: string[]): FormField | undefined {
    debug.log('[fuzzy] match called for:', keywords);

    const matches: MatchCandidate[] = [];

    for (const name of keywords) {
      for (const fieldEntry of this.inputs) {
        if (this.isFieldSkipped(fieldEntry.field)) continue;

        const results = fuzzy.filter(name, fieldEntry.keywords);

        if (results.length === 0) continue;

        // Replace _.max() with native reduce — find the highest scoring result
        const best = results.reduce((prev, curr) => (curr.score > prev.score ? curr : prev));

        if (best.score > 40) {
          matches.push({
            field: fieldEntry.field,
            score: best.score,
            words: name,
            label: fieldEntry.label,
          });
        }
      }
    }

    matches.sort((a, b) => b.score - a.score);

    const selected = matches.shift();

    if (selected === undefined) {
      return undefined;
    }

    this.flagSkippedField(selected.field);
    debug.log('[fuzzy] match:', keywords, selected);

    return selected.field;
  }
}
