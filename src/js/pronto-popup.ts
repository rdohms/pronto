import { Popup } from './popup/Popup.js';
import { TalkLister } from './popup/TalkLister.js';
import { BioLister } from './popup/BioLister.js';
import { SymposiumApiClient } from './api/SymposiumApiClient.js';
import { TokenStorage } from './identity/TokenStorage.js';
import settings from './options/SettingsReader.js';
import { trackPageView } from './analytics.js';

// Popup entry point.
// Waits for settings to load from chrome.storage, then bootstraps the popup UI.

void settings.load().then(() => {
  const storage = new TokenStorage();
  const api = new SymposiumApiClient(settings.get('base_url'), storage);

  const talks = new TalkLister(api, settings);
  const bios = new BioLister(api, settings);

  new Popup(talks, bios, storage);

  void trackPageView('/popup.html');
});
