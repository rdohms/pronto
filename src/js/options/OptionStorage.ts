import debug from '../helper/Debug.js';

/**
 * Persists user-configurable option values in chrome.storage.sync.
 * Keys are prefixed with 'pronto_option_' to avoid collisions.
 */
export class OptionStorage {
  private readonly KEY_PREFIX = 'pronto_option_';

  set(key: string, value: string): void {
    debug.log('[storage] setting', key, value);
    chrome.storage.sync.set({ [this._convertKey(key)]: value });
  }

  has(key: string): Promise<boolean> {
    debug.log('[storage] looking up', key);
    const storageKey = this._convertKey(key);

    return new Promise((resolve) => {
      chrome.storage.sync.get(storageKey, (storage) => {
        if (!Object.prototype.hasOwnProperty.call(storage, storageKey)) {
          return resolve(false);
        }
        if (storage[storageKey] == null) {
          return resolve(false);
        }
        return resolve(true);
      });
    });
  }

  get(key: string, defaultValue: string | null = null): Promise<string | null> {
    debug.log('[storage] retrieving', key);
    const storageKey = this._convertKey(key);

    return new Promise((resolve) => {
      chrome.storage.sync.get(storageKey, (storage) => {
        if (!Object.prototype.hasOwnProperty.call(storage, storageKey)) {
          return resolve(defaultValue);
        }
        if (storage[storageKey] == null) {
          return resolve(defaultValue);
        }
        debug.log('[storage] found', storageKey, storage[storageKey]);
        return resolve(storage[storageKey] as string);
      });
    });
  }

  remove(key: string): void {
    debug.log('[storage] removing', key);
    chrome.storage.sync.remove(this._convertKey(key));
  }

  all(): Promise<Record<string, unknown>> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(null, (items) => {
        resolve(items);
      });
    });
  }

  _convertKey(key: string): string {
    return `${this.KEY_PREFIX}${key}`;
  }
}

export default new OptionStorage();
