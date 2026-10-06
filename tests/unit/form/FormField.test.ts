import { describe, it, expect, beforeEach } from 'vitest';
import { FormField } from '../../../src/js/form/FormField.js';
import { Result } from '../../../src/js/form/Result.js';

function makeInput(type = 'text', value = ''): HTMLInputElement {
  const input = document.createElement('input');
  input.type = type;
  input.value = value;
  return input;
}

function makeSelect(options: { value: string; label: string }[]): HTMLSelectElement {
  const select = document.createElement('select');
  for (const opt of options) {
    const el = document.createElement('option');
    el.value = opt.value;
    el.textContent = opt.label;
    select.appendChild(el);
  }
  return select;
}

describe('FormField', () => {
  let result: Result;

  beforeEach(() => {
    result = new Result();
  });

  describe('setValue() — text inputs', () => {
    it('fills an empty input', () => {
      const input = makeInput('text', '');
      const field = new FormField(input);
      field.setValue('My Talk', 'title', result);
      expect(input.value).toBe('My Talk');
    });

    it('skips a non-empty input', () => {
      const input = makeInput('text', 'existing content');
      const field = new FormField(input);
      field.setValue('My Talk', 'title', result);
      // Should NOT overwrite
      expect(input.value).toBe('existing content');
      expect(input.classList.contains('pronto-skipped')).toBe(true);
    });

    it('does not fill the same field twice', () => {
      const input = makeInput('text', '');
      const field = new FormField(input);
      field.setValue('First Value', 'title', result);
      field.setValue('Second Value', 'title', result);
      expect(input.value).toBe('First Value');
    });
  });

  describe('setValue() — highlights', () => {
    it('adds pronto-filled class after fill', () => {
      const input = makeInput('text', '');
      const field = new FormField(input);
      field.setValue('value', 'title', result);
      expect(input.classList.contains('pronto-filled')).toBe(true);
    });
  });

  describe('fillDropdown() — Bug #1 regression', () => {
    it('does not crash when alternateOptions[property] is undefined', () => {
      const select = makeSelect([
        { value: 'talk', label: 'Talk' },
        { value: 'workshop', label: 'Workshop' },
      ]);
      const field = new FormField(select);

      // 'slides' has no alternateOptions entry — Bug #1 would crash here
      expect(() => {
        field.setValue('http://slides.example.com', 'slides', result);
      }).not.toThrow();
    });

    it('fills a select with a direct value match when no alternates', () => {
      const select = makeSelect([
        { value: 'beginner', label: 'Beginner' },
        { value: 'advanced', label: 'Advanced' },
      ]);
      const field = new FormField(select);
      field.setValue('beginner', 'level', result);
      expect(select.value).toBe('beginner');
    });

    it('fills a select using an alternate option value', () => {
      const select = makeSelect([
        { value: 'tutorial', label: 'Tutorial' },
        { value: 'talk', label: 'Talk' },
      ]);
      const field = new FormField(select);
      // 'workshop' maps to 'tutorial' via alternateOptions
      field.setValue('workshop', 'type', result);
      expect(select.value).toBe('tutorial');
    });

    it('does not crash when alternateOptions[property][value] is undefined', () => {
      const select = makeSelect([{ value: 'foo', label: 'Foo' }]);
      const field = new FormField(select);
      // 'level' exists in alternateOptions but 'expert' does not
      expect(() => {
        field.setValue('expert', 'level', result);
      }).not.toThrow();
    });
  });
});
