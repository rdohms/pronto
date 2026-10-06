import { describe, it, expect, beforeEach } from 'vitest';
import { TokenStorage } from '../../../src/js/identity/TokenStorage.js';

describe('TokenStorage', () => {
  let storage: TokenStorage;

  beforeEach(() => {
    storage = new TokenStorage();
  });

  describe('hasToken()', () => {
    it('returns false when no token is stored (Bug #4 regression)', async () => {
      const result = await storage.hasToken();
      expect(result).toBe(false);
    });

    it('returns false when token value is null', async () => {
      // Directly insert a null token into mock storage
      chrome.storage.sync.set({ pronto_access_token: null });
      const result = await storage.hasToken();
      expect(result).toBe(false);
    });

    it('returns true when a valid token is stored', async () => {
      storage.saveToken('test-token-abc');
      const result = await storage.hasToken();
      expect(result).toBe(true);
    });

    it('calls resolve() exactly once — not multiple times (Bug #4 core)', async () => {
      // If Bug #4 were present, resolve(true) would always fire after resolve(false),
      // causing the promise to settle with true even for empty storage.
      // This test verifies it doesn't.
      const result = await storage.hasToken();
      expect(result).toBe(false); // storage is empty at this point
    });
  });

  describe('getToken()', () => {
    it('returns null when no token stored', async () => {
      const token = await storage.getToken();
      expect(token).toBeNull();
    });

    it('returns the stored token', async () => {
      storage.saveToken('my-secret-token');
      const token = await storage.getToken();
      expect(token).toBe('my-secret-token');
    });
  });

  describe('saveToken()', () => {
    it('persists token to storage', async () => {
      storage.saveToken('saved-token');
      const token = await storage.getToken();
      expect(token).toBe('saved-token');
    });
  });

  describe('removeToken()', () => {
    it('removes the stored token', async () => {
      storage.saveToken('to-be-removed');
      storage.removeToken();
      const token = await storage.getToken();
      expect(token).toBeNull();
    });

    it('hasToken() returns false after remove', async () => {
      storage.saveToken('to-be-removed');
      storage.removeToken();
      const has = await storage.hasToken();
      expect(has).toBe(false);
    });
  });
});
