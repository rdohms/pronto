import { SymposiumApiClient } from './api/SymposiumApiClient.js';
import { TokenStorage } from './identity/TokenStorage.js';
import { TokenFetcher } from './identity/TokenFetcher.js';
import { ProntoOptions } from './options/ProntoOptions.js';
import option_storage from './options/OptionStorage.js';
import settings from './options/SettingsReader.js';
import { trackPageView } from './analytics.js';

// Options page entry point.
// Waits for settings to load from chrome.storage, then bootstraps the options UI.

void settings.load().then(() => {
  const token_storage = new TokenStorage();
  const api = new SymposiumApiClient(settings.get('base_url'), token_storage);
  const fetcher = new TokenFetcher(
    settings.get('client_id'),
    settings.get('client_secret'),
    settings.get('base_url'),
    token_storage
  );

  new ProntoOptions(fetcher, api, option_storage);

  void trackPageView('/options.html');
});
