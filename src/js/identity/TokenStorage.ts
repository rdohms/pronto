import debug from '../helper/Debug.js';

/**
 * Manages the access token in chrome.storage.sync.
 *
 * Bug #4 fix: hasToken() previously called resolve() multiple times in the same
 * callback (no else branches), so resolve(true) always fired even when earlier
 * conditions had already resolved false. Fixed with early returns.
 */
export class TokenStorage {
  private readonly storageKey = 'pronto_access_token';

  constructor() {
    chrome.storage.sync.get(null, (data) => {
      debug.log('[storage] current contents:', data);
    });
  }

  hasToken(): Promise<boolean> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(this.storageKey, (storage) => {
        // Bug #4 fix: use early returns so resolve() is called exactly once
        if (!Object.prototype.hasOwnProperty.call(storage, this.storageKey)) {
          return resolve(false);
        }
        if (storage[this.storageKey] == null) {
          return resolve(false);
        }
        return resolve(true);
      });
    });
  }

  getToken(): Promise<string | null> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(this.storageKey, (storage) => {
        debug.log('[storage] getToken:', storage[this.storageKey]);
        if (Object.prototype.hasOwnProperty.call(storage, this.storageKey)) {
          resolve(storage[this.storageKey] as string | null);
        } else {
          resolve(null);
        }
      });
    });
  }

  saveToken(access_token: string): Promise<void> {
    debug.log('[storage] saveToken:', access_token);
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [this.storageKey]: access_token }, resolve);
    });
  }

  removeToken(): Promise<void> {
    debug.log('[storage] removeToken');
    return new Promise((resolve) => {
      chrome.storage.sync.remove(this.storageKey, resolve);
    });
  }
}
