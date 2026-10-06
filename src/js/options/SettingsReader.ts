import option_storage, { OptionStorage } from './OptionStorage.js';
import debug from '../helper/Debug.js';
import type { ProntoConfig } from '../../types/index.js';

/**
 * Reads extension settings, merging chrome.storage.sync user overrides
 * with compile-time defaults from Vite environment variables.
 *
 * Bug #2 fix: the original code used `_.has(this.saved, key) == -1` which
 * compared a boolean to -1 (always false), meaning the config fallback
 * never triggered. Fixed to use a proper boolean check.
 */
export class SettingsReader {
  private readonly storage: OptionStorage;
  private readonly config: ProntoConfig;
  private saved: Record<string, unknown> = {};

  constructor(storage: OptionStorage, config: ProntoConfig) {
    debug.log('[reader] boot');
    this.storage = storage;
    this.config = config;
  }

  load(): Promise<boolean> {
    return new Promise((resolve) => {
      this.storage.all().then((items) => {
        this.saved = items;
        resolve(true);
      });
    });
  }

  get(option: keyof ProntoConfig): string {
    const key = this.storage._convertKey(option);

    // Bug #2 fix: Object.prototype.hasOwnProperty returns a boolean;
    // the old _.has() == -1 comparison was always falsy.
    if (!Object.prototype.hasOwnProperty.call(this.saved, key)) {
      return String(this.config[option]);
    }

    const saved = this.saved[key];
    if (saved == null || saved === '') {
      return String(this.config[option]);
    }

    return String(saved);
  }
}

// Build-time config from Vite environment variables
const buildConfig: ProntoConfig = {
  base_url: import.meta.env.VITE_BASE_URL as string,
  client_id: import.meta.env.VITE_CLIENT_ID as string,
  client_secret: import.meta.env.VITE_CLIENT_SECRET as string,
  debug: import.meta.env.VITE_DEBUG === 'true',
  analytics: import.meta.env.VITE_ANALYTICS === 'true',
};

export default new SettingsReader(option_storage, buildConfig);
