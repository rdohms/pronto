import debug from '../helper/Debug.js';
import type { TalkLister } from './TalkLister.js';
import type { BioLister } from './BioLister.js';
import type { TokenStorage } from '../identity/TokenStorage.js';

/**
 * Popup controller.
 * Checks for token presence on load, then either shows the talk/bio lists
 * or redirects to the options page.
 *
 * MV3: Replaced chrome.tabs.insertCSS / chrome.tabs.executeScript
 * with chrome.scripting.insertCSS / chrome.scripting.executeScript.
 * All jQuery replaced with native DOM APIs.
 */
export class Popup {
  private readonly talks: TalkLister;
  private readonly bios: BioLister;
  private readonly storage: TokenStorage;

  constructor(talks: TalkLister, bios: BioLister, storage: TokenStorage) {
    this.talks = talks;
    this.bios = bios;
    this.storage = storage;

    this._initTabs();
    void this._checkTokenPresence();
  }

  private _initTabs(): void {
    document.querySelectorAll<HTMLElement>('.tab-nav__item').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-nav__item').forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        const panelId = btn.getAttribute('aria-controls');
        if (panelId) document.getElementById(panelId)?.classList.add('active');
      });
    });
  }

  private async _checkTokenPresence(): Promise<void> {
    const hasToken = await this.storage.hasToken();
    debug.log('[popup] token present?', hasToken);

    if (hasToken) {
      await this._setup();
    } else {
      this._redirectToOptions();
    }
  }

  private async _setup(): Promise<void> {
    await this._injectCodeInCurrentTab();
    void this.talks.populateList();
    void this.bios.populateList();
  }

  private async _injectCodeInCurrentTab(): Promise<void> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    // Content scripts and CSS cannot be injected into browser-internal URLs (chrome://, about:, etc.)
    const url = tab.url ?? '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      debug.log('[popup] skipping code injection on non-web URL:', url);
      return;
    }

    const tabId = tab.id;

    try {
      // MV3: use chrome.scripting instead of deprecated chrome.tabs.insertCSS/executeScript
      await Promise.all([
        chrome.scripting.insertCSS({
          target: { tabId },
          files: ['build/css/injected.css'],
        }),
        chrome.scripting.executeScript({
          target: { tabId },
          files: ['build/js/pronto-content.js'],
        }),
      ]);
    } catch (err) {
      debug.log('[popup] script injection failed:', err);
    }
  }

  private _redirectToOptions(): void {
    document.querySelector('.loading-talks')?.setAttribute('style', 'display:none');

    const optionsAlert = document.querySelector<HTMLElement>('.options-alert');
    if (optionsAlert) optionsAlert.style.display = '';

    const goToOptionsBtn = document.getElementById('go-to-options');
    debug.log('[popup] button', goToOptionsBtn);

    goToOptionsBtn?.addEventListener('click', () => {
      debug.log('[popup] clicked go-to-options:', chrome.runtime.openOptionsPage);
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.open(chrome.runtime.getURL('options.html'));
      }
      window.close();
    });
  }
}
