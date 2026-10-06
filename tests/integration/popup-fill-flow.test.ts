import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FormFiller } from '@/js/form/FormFiller.ts';
import dataCfg from '@/js/form/alternate_names.ts';
import type { FillTalkMessage } from '@/types/index.ts';

describe('FormFiller — integration: FILL_TALK message → form fill', () => {
  let onMessageCallback: (
    request: unknown,
    sender: unknown,
    sendResponse: (r: unknown) => void
  ) => void;

  beforeEach(() => {
    // Capture the onMessage listener registered by FormFiller
    (chrome.runtime.onMessage.addListener as ReturnType<typeof vi.fn>).mockImplementation(
      (cb: typeof onMessageCallback) => {
        onMessageCallback = cb;
      }
    );

    // Set up a simple form in the DOM
    document.body.innerHTML = `
      <form>
        <label for="talk-title">Title</label>
        <input id="talk-title" type="text" name="title" />

        <label for="talk-description">Description</label>
        <textarea id="talk-description" name="description"></textarea>

        <label for="talk-level">Level</label>
        <select id="talk-level" name="level">
          <option value="">Select...</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </form>
    `;

    // Instantiate FormFiller — it will call chrome.runtime.onMessage.addListener
    new FormFiller(dataCfg);
  });

  it('fills title and description fields when FILL_TALK message received', () => {
    const message: FillTalkMessage = {
      type: 'FILL_TALK',
      talk_data: {
        title: 'Modern Chrome Extensions',
        description: 'A talk about MV3 and TypeScript',
        level: 'intermediate',
      },
    };

    const sendResponse = vi.fn();
    onMessageCallback(message, {}, sendResponse);

    const titleInput = document.querySelector<HTMLInputElement>('#talk-title');
    const descInput = document.querySelector<HTMLTextAreaElement>('#talk-description');
    const levelSelect = document.querySelector<HTMLSelectElement>('#talk-level');

    expect(titleInput?.value).toBe('Modern Chrome Extensions');
    expect(descInput?.value).toBe('A talk about MV3 and TypeScript');
    expect(levelSelect?.value).toBe('intermediate');
  });

  it('sends success response after filling', () => {
    const message: FillTalkMessage = {
      type: 'FILL_TALK',
      talk_data: { title: 'My Talk' },
    };

    const sendResponse = vi.fn();
    onMessageCallback(message, {}, sendResponse);

    expect(sendResponse).toHaveBeenCalledWith({
      success: true,
      url: expect.any(String),
    });
  });

  it('skips fields that already have values', () => {
    const titleInput = document.querySelector<HTMLInputElement>('#talk-title')!;
    titleInput.value = 'Existing Title';

    const message: FillTalkMessage = {
      type: 'FILL_TALK',
      talk_data: { title: 'New Title' },
    };

    const sendResponse = vi.fn();
    onMessageCallback(message, {}, sendResponse);

    expect(titleInput.value).toBe('Existing Title');
    expect(titleInput.classList.contains('pronto-skipped')).toBe(true);
  });

  it('ignores fields in ignoredData config', () => {
    const message: FillTalkMessage = {
      type: 'FILL_TALK',
      talk_data: {
        title: 'My Talk',
        created_at: '2024-01-01',  // should be ignored
        updated_at: '2024-01-02',  // should be ignored
      },
    };

    const sendResponse = vi.fn();
    // Should not throw
    expect(() => onMessageCallback(message, {}, sendResponse)).not.toThrow();
  });
});
