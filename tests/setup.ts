/**
 * Global test setup — installs Chrome API mocks before every test.
 * Uses vi.stubGlobal to make chrome.* available in jsdom.
 */
import { vi } from 'vitest';

// ─── chrome.storage.sync mock ────────────────────────────────────────────────

const storageData: Record<string, unknown> = {};

const storageSyncMock = {
  get: vi.fn((key: string | string[] | null, callback: (result: Record<string, unknown>) => void) => {
    if (key === null) {
      callback({ ...storageData });
      return;
    }
    const keys = Array.isArray(key) ? key : [key];
    const result: Record<string, unknown> = {};
    for (const k of keys) {
      if (Object.prototype.hasOwnProperty.call(storageData, k)) {
        result[k] = storageData[k];
      }
    }
    callback(result);
  }),
  set: vi.fn((items: Record<string, unknown>, callback?: () => void) => {
    Object.assign(storageData, items);
    callback?.();
  }),
  remove: vi.fn((key: string | string[], callback?: () => void) => {
    const keys = Array.isArray(key) ? key : [key];
    for (const k of keys) delete storageData[k];
    callback?.();
  }),
  clear: vi.fn((callback?: () => void) => {
    for (const k of Object.keys(storageData)) delete storageData[k];
    callback?.();
  }),
};

const storageLocalMock = { ...storageSyncMock };

// ─── chrome.tabs mock ─────────────────────────────────────────────────────────

const tabsMock = {
  query: vi.fn((_query: object, callback: (tabs: { id: number }[]) => void) => {
    callback([{ id: 1 }]);
  }),
  sendMessage: vi.fn(
    (_tabId: number, _message: object, callback?: (response: unknown) => void) => {
      callback?.({ success: true, url: 'https://example-cfp.com' });
    }
  ),
};

// ─── chrome.scripting mock ───────────────────────────────────────────────────

const scriptingMock = {
  executeScript: vi.fn(() => Promise.resolve([])),
  insertCSS: vi.fn(() => Promise.resolve()),
};

// ─── chrome.runtime mock ─────────────────────────────────────────────────────

const runtimeMock = {
  onMessage: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
  lastError: undefined as chrome.runtime.LastError | undefined,
  openOptionsPage: vi.fn(),
  getURL: vi.fn((path: string) => `chrome-extension://fake-id/${path}`),
};

// ─── chrome.identity mock ─────────────────────────────────────────────────────

const identityMock = {
  getRedirectURL: vi.fn((path: string) => `https://fake-id.chromiumapp.org/${path}`),
  launchWebAuthFlow: vi.fn(),
};

// ─── Install global chrome mock ──────────────────────────────────────────────

vi.stubGlobal('chrome', {
  storage: {
    sync: storageSyncMock,
    local: storageLocalMock,
  },
  tabs: tabsMock,
  scripting: scriptingMock,
  runtime: runtimeMock,
  identity: identityMock,
});

// ─── Reset storage state between tests ───────────────────────────────────────

beforeEach(() => {
  for (const k of Object.keys(storageData)) delete storageData[k];
  vi.clearAllMocks();

  // Re-install callbacks after clearAllMocks
  storageSyncMock.get.mockImplementation(
    (key: string | string[] | null, callback: (result: Record<string, unknown>) => void) => {
      if (key === null) { callback({ ...storageData }); return; }
      const keys = Array.isArray(key) ? key : [key];
      const result: Record<string, unknown> = {};
      for (const k of keys) {
        if (Object.prototype.hasOwnProperty.call(storageData, k)) result[k] = storageData[k];
      }
      callback(result);
    }
  );

  storageSyncMock.set.mockImplementation((items: Record<string, unknown>, cb?: () => void) => {
    Object.assign(storageData, items);
    cb?.();
  });

  storageSyncMock.remove.mockImplementation((key: string | string[], cb?: () => void) => {
    const keys = Array.isArray(key) ? key : [key];
    for (const k of keys) delete storageData[k];
    cb?.();
  });

  tabsMock.query.mockImplementation((_q: object, cb: (tabs: { id: number }[]) => void) => {
    cb([{ id: 1 }]);
  });

  tabsMock.sendMessage.mockImplementation(
    (_id: number, _msg: object, cb?: (r: unknown) => void) => {
      cb?.({ success: true, url: 'https://example-cfp.com' });
    }
  );

  scriptingMock.executeScript.mockResolvedValue([]);
  scriptingMock.insertCSS.mockResolvedValue(undefined);
});
