import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TokenFetcher } from '../../../src/js/identity/TokenFetcher.js';
import { TokenStorage } from '../../../src/js/identity/TokenStorage.js';

describe('TokenFetcher', () => {
  let storage: TokenStorage;
  let fetcher: TokenFetcher;

  beforeEach(() => {
    storage = new TokenStorage();
    fetcher = new TokenFetcher('test-client-id', 'test-client-secret', 'https://symposiumapp.com', storage);
  });

  it('short-circuits if token is already cached', () => {
    // Manually set access_token on fetcher
    (fetcher as unknown as { access_token: string }).access_token = 'existing-token';

    const cb = vi.fn();
    fetcher.getToken(false, cb);

    expect(cb).toHaveBeenCalledWith(null, 'existing-token');
    expect(chrome.identity.launchWebAuthFlow).not.toHaveBeenCalled();
  });

  it('exchanges code for access token and invokes callback', async () => {
    const fakeCode = 'fake-auth-code-123';
    const fakeToken = 'fake-access-token-456';

    vi.mocked(chrome.identity.launchWebAuthFlow).mockImplementation((options, cb) => {
      cb(`https://fake-id.chromiumapp.org/provider_cb?code=${fakeCode}`);
    });

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ access_token: fakeToken }),
      })
    );

    const cb = vi.fn();
    fetcher.getToken(true, cb);

    // Wait for the async code exchange to resolve
    await vi.waitFor(() => {
      expect(cb).toHaveBeenCalledWith(null, fakeToken);
    });

    // Check token was stored
    const stored = await storage.getToken();
    expect(stored).toBe(fakeToken);
  });

  it('invokes callback with error when launchWebAuthFlow fails with runtime.lastError', () => {
    vi.mocked(chrome.identity.launchWebAuthFlow).mockImplementation((options, cb) => {
      chrome.runtime.lastError = { message: 'User cancelled auth' };
      cb(undefined);
      chrome.runtime.lastError = undefined;
    });

    const cb = vi.fn();
    fetcher.getToken(true, cb);

    expect(cb).toHaveBeenCalledWith(expect.any(Error));
    expect(cb.mock.calls[0]![0]!.message).toBe('User cancelled auth');
  });

  it('invokes callback with error when code exchange fetch fails', async () => {
    vi.mocked(chrome.identity.launchWebAuthFlow).mockImplementation((options, cb) => {
      cb('https://fake-id.chromiumapp.org/provider_cb?code=bad-code');
    });

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
      })
    );

    const cb = vi.fn();
    fetcher.getToken(true, cb);

    await vi.waitFor(() => {
      expect(cb).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
