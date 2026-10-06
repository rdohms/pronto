import debug from '../helper/Debug.js';
import { trackEvent } from '../analytics.js';
import type { SymposiumApiClient } from '../api/SymposiumApiClient.js';
import type { Talk, TalkAttributes } from '../../types/index.js';

interface SettingsProvider {
  get(key: string): string;
}

/**
 * Renders the talks list in the popup.
 * Uses native <template> elements instead of Mustache.
 * All jQuery replaced with native DOM APIs.
 */
export class TalkLister {
  private readonly api: SymposiumApiClient;
  private readonly settings: SettingsProvider;

  constructor(api: SymposiumApiClient, settings: SettingsProvider) {
    this.api = api;
    this.settings = settings;
  }

  private _renderTalk(talk: Talk): void {
    const template = document.getElementById('pronto-talk-template') as HTMLTemplateElement | null;
    if (!template) return;

    const clone = template.content.cloneNode(true) as DocumentFragment;

    const li = clone.querySelector<HTMLElement>('[data-talk-id]');
    if (li) li.dataset['talkId'] = talk.id;

    const title = clone.querySelector<HTMLElement>('.title');
    if (title) title.textContent = talk.attributes.title;

    const info = clone.querySelector<HTMLElement>('.info');
    if (info) info.textContent = `${talk.attributes.type} / ${talk.attributes.level} / ${talk.attributes.length} mins`;

    const viewLink = clone.querySelector<HTMLAnchorElement>('.action-view');
    if (viewLink) viewLink.href = `${this.settings.get('base_url')}/talks/${talk.id}`;

    const editLink = clone.querySelector<HTMLAnchorElement>('.action-edit');
    if (editLink) editLink.href = `${this.settings.get('base_url')}/talks/${talk.id}/edit`;

    document.querySelector('.talk-list > ul')?.prepend(clone);
  }

  private _activateButtons(): void {
    document.querySelectorAll<HTMLElement>('.talk').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        void this.triggerFormFill(e);
      });
    });
  }

  private async _sendTalkData(data: Partial<TalkAttributes>): Promise<void> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) return;

    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'FILL_TALK',
      talk_data: data,
    });

    void trackEvent('fill_talk', { title: String(data.title ?? '') });
    void trackEvent('extension_active_on', { url: response?.url ?? '' });

    if (response?.success) {
      window.close();
    }
  }

  async populateList(): Promise<void> {
    const loadingEl = document.querySelector<HTMLElement>('.loading-warning');
    if (loadingEl) loadingEl.style.display = '';

    try {
      const talks = await this.api.getUserTalks();
      const listEl = document.querySelector('.talk-list > ul');
      if (listEl) listEl.innerHTML = '';

      for (const talk of talks) {
        this._renderTalk(talk);
      }

      this._activateButtons();
    } catch (err) {
      debug.log('[talks] failed to load:', err);
      this._renderError('Unable to load talks from Symposium, sorry!', String(err));
    } finally {
      if (loadingEl) loadingEl.style.display = 'none';
    }
  }

  private _renderError(message: string, details: string): void {
    const template = document.getElementById('pronto-talk-error-template') as HTMLTemplateElement | null;
    if (!template) return;

    const clone = template.content.cloneNode(true) as DocumentFragment;
    clone.querySelector<HTMLElement>('.message')!.textContent = message;
    clone.querySelector<HTMLElement>('.details')!.textContent = details;

    document.querySelector('.talk-list > ul')?.appendChild(clone);
  }

  async triggerFormFill(e: Event): Promise<void> {
    const target = e.currentTarget as HTMLElement;
    const talkId = target.dataset['talkId'];
    if (!talkId) return;

    const talk = await this.api.getTalkInfo(talkId);
    await this._sendTalkData(talk.attributes);
  }
}
