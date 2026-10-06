import { describe, it, expect, vi } from 'vitest';
import { FuzzyMapper } from '../../../src/js/form/FuzzyMapper.js';
import { FormField } from '../../../src/js/form/FormField.js';

function makeField(labelText: string, keywords?: string[]) {
  const input = document.createElement('input');
  const field = new FormField(input);
  return {
    input,
    label: labelText,
    keywords: keywords ?? labelText.toLowerCase().split(/\s+/),
    field,
  };
}

describe('FuzzyMapper', () => {
  describe('match()', () => {
    it('matches an exact keyword', () => {
      const titleField = makeField('Title', ['title']);
      const mapper = new FuzzyMapper([titleField]);
      const matched = mapper.match(['title']);
      expect(matched).toBe(titleField.field);
    });

    it('returns undefined when no match found', () => {
      const titleField = makeField('Title', ['title']);
      const mapper = new FuzzyMapper([titleField]);
      const matched = mapper.match(['xyz_not_matching_anything']);
      expect(matched).toBeUndefined();
    });

    it('skips fields below score threshold of 40', () => {
      // 'xyz' should not fuzzy match 'title' with score > 40
      const titleField = makeField('Title', ['title']);
      const mapper = new FuzzyMapper([titleField]);
      const matched = mapper.match(['xyz']);
      expect(matched).toBeUndefined();
    });

    it('does not match the same field twice', () => {
      const titleField = makeField('Talk Title', ['title', 'talk title']);
      const mapper = new FuzzyMapper([titleField]);

      const first = mapper.match(['title']);
      expect(first).toBe(titleField.field);

      // Once marked as used, a second match call should not return it again
      const second = mapper.match(['title']);
      expect(second).toBeUndefined();
    });

    it('picks the highest-scoring match from multiple fields', () => {
      const titleField = makeField('Title', ['title']);
      const descField = makeField('Description', ['description']);
      const mapper = new FuzzyMapper([titleField, descField]);

      const matched = mapper.match(['title']);
      expect(matched).toBe(titleField.field);
    });

    it('reset() clears skipped fields', () => {
      const titleField = makeField('Title', ['title']);
      const mapper = new FuzzyMapper([titleField]);

      const first = mapper.match(['title']);
      expect(first).toBe(titleField.field);

      mapper.reset();

      const second = mapper.match(['title']);
      expect(second).toBe(titleField.field);
    });
  });
});
