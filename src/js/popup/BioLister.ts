import debug from '../helper/Debug.js';
import { trackEvent } from '../analytics.js';
import type { SymposiumApiClient } from '../api/SymposiumApiClient.js';
import type { Bio, BioAttributes } from '../../types/index.js';

interface SettingsProvider {
  get(key: string): string;
}

/**
 * Renders the bios list in the popup.
 * Uses native <template> elements instead of Mustache.
 * All jQuery replaced with native DOM APIs.
 *
 * Bug #3 fix: restored the error handler body which was entirely commented out.
 *
 * clipboard-tool Bower package replaced with native navigator.clipboard.writeText().
 */
export class BioLister {
  private readonly api: SymposiumApiClient;
  private readonly settings: SettingsProvider;
  private loadingEl: HTMLElement | null;

  constructor(
    api: SymposiumApiClient,
    settings: SettingsProvider
  ) {
    this.api = api;
    this.settings = settings;
    this.loadingEl = document.querySelector<HTMLElement>('.loading-warning');
  }

  private _renderBio(bio: Bio): void {
    const template = document.getElementById('pronto-bio-template') as HTMLTemplateElement | null;
    if (!template) return;

    const clone = template.content.cloneNode(true) as DocumentFragment;

    const li = clone.querySelector<HTMLElement>('[data-bio-id]');
    if (li) li.dataset['bioId'] = bio.id;

    const title = clone.querySelector<HTMLElement>('.title');
    if (title) title.textContent = bio.attributes.nickname;

    const summary = clone.querySelector<HTMLElement>('.summary');
    if (summary) summary.textContent = bio.attributes.body.substring(0, 100);

    const copyBtn = clone.querySelector<HTMLElement>('.btn-copy-bio');
    if (copyBtn) copyBtn.dataset['summary'] = bio.attributes.body;

    const viewLink = clone.querySelector<HTMLAnchorElement>('.action-view');
    if (viewLink) viewLink.href = `${this.settings.get('base_url')}/bios/${bio.id}`;

    const editLink = clone.querySelector<HTMLAnchorElement>('.action-edit');
    if (editLink) editLink.href = `${this.settings.get('base_url')}/bios/${bio.id}/edit`;

    document.querySelector('.bio-list > ul')?.prepend(clone);
  }

  private _activateButtons(): void {
    document.querySelectorAll<HTMLElement>('.bio').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        void this.triggerFormFill(e);
      });
    });

    document.querySelectorAll<HTMLElement>('.btn-copy-bio').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const summaryText = (e.currentTarget as HTMLElement).dataset['summary'] ?? '';

        // Bug #3 fix: navigator.clipboard replaces the removed clipboard-tool Bower package
        void navigator.clipboard.writeText(summaryText).then(() => {
          debug.log('[bio] copied to clipboard');
        });
      });
    });
  }

  private async _sendBioData(data: Partial<BioAttributes>): Promise<void> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) return;

    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'FILL_BIO',
      bio_data: { body: data.body ?? '' },
    });

    void trackEvent('fill_bio', { nickname: String(data.nickname ?? '') });
    void trackEvent('extension_active_on', { url: response?.url ?? '' });

    if (response?.success) {
      window.close();
    }
  }

  async populateList(): Promise<void> {
    if (this.loadingEl) this.loadingEl.style.display = '';

    try {
      const bios = await this.api.getBios();
      const listEl = document.querySelector('.bio-list > ul');
      if (listEl) listEl.innerHTML = '';

      for (const bio of bios) {
        this._renderBio(bio);
      }

      this._activateButtons();
    } catch (err) {
      // Bug #3 fix: restored error handler (was entirely commented out)
      debug.log('[bios] failed to load:', err);
      this._renderError('Unable to load bios from Symposium, sorry!', String(err));
    } finally {
      if (this.loadingEl) this.loadingEl.style.display = 'none';
    }
  }

  private _renderError(message: string, details: string): void {
    const template = document.getElementById(
      'pronto-bio-error-template'
    ) as HTMLTemplateElement | null;
    if (!template) return;

    const clone = template.content.cloneNode(true) as DocumentFragment;
    clone.querySelector<HTMLElement>('.message')!.textContent = message;
    clone.querySelector<HTMLElement>('.details')!.textContent = details;

    document.querySelector('.bio-list > ul')?.appendChild(clone);
  }

  async triggerFormFill(e: Event): Promise<void> {
    const target = e.currentTarget as HTMLElement;
    const bioId = target.dataset['bioId'];
    if (!bioId) return;

    const bio = await this.api.getBio(bioId);
    await this._sendBioData(bio.attributes);
  }
}
