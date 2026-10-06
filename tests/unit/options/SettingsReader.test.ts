import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OptionStorage } from '../../../src/js/options/OptionStorage.js';

// We need to test SettingsReader in isolation from the singleton.
// Import the class directly and construct it with mocked dependencies.

// Mock import.meta.env before importing SettingsReader
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_BASE_URL: 'https://symposiumapp.com',
      VITE_CLIENT_ID: 'test-client',
      VITE_CLIENT_SECRET: 'test-secret',
      VITE_DEBUG: 'false',
      VITE_ANALYTICS: 'false',
    },
  },
});

// Import after stubbing env
const { default: SettingsReaderClass } = await import('../../../src/js/options/SettingsReader.js');

describe('SettingsReader', () => {
  let optionStorage: OptionStorage;

  beforeEach(() => {
    optionStorage = new OptionStorage();
  });

  describe('get() — Bug #2 regression', () => {
    it('falls back to config when key not in saved storage', async () => {
      // Simulate no user-saved value: storage is empty
      const reader = SettingsReaderClass;
      await reader.load();

      const url = reader.get('base_url');
      // Should return the env-based default, not undefined
      expect(url).toBeDefined();
      expect(typeof url).toBe('string');
      expect(url.length).toBeGreaterThan(0);
    });

    it('returns saved value when present in storage', async () => {
      // Save a custom base_url
      optionStorage.set('base_url', 'https://my-custom-symposium.com');

      const reader = SettingsReaderClass;
      await reader.load();

      const url = reader.get('base_url');
      expect(url).toBe('https://my-custom-symposium.com');
    });

    it('falls back to config when saved value is empty string', async () => {
      optionStorage.set('base_url', '');

      const reader = SettingsReaderClass;
      await reader.load();

      const url = reader.get('base_url');
      // Empty string saved → should fall back to config default
      expect(url.length).toBeGreaterThan(0);
    });
  });

  describe('load()', () => {
    it('resolves to true', async () => {
      const reader = SettingsReaderClass;
      const result = await reader.load();
      expect(result).toBe(true);
    });
  });
});
