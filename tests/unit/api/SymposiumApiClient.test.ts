import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SymposiumApiClient } from '../../../src/js/api/SymposiumApiClient.js';
import { TokenStorage } from '../../../src/js/identity/TokenStorage.js';

// Mock fetch for API calls
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function makeApiResponse<T>(data: T) {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve({ data }),
    text: () => Promise.resolve(''),
  };
}

describe('SymposiumApiClient', () => {
  let storage: TokenStorage;
  let client: SymposiumApiClient;

  const mockUser = {
    id: 'user-1',
    attributes: { first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com' },
  };

  const mockTalks = [
    {
      id: 'talk-1',
      attributes: {
        title: 'TypeScript for Extension Developers',
        type: 'seminar',
        level: 'intermediate',
        length: 45,
        description: 'A deep dive',
        organizer_notes: '',
        slides: '',
      },
    },
  ];

  const mockBios = [
    {
      id: 'bio-1',
      attributes: {
        nickname: 'Jane Dev',
        body: 'Jane is a developer...',
      },
    },
  ];

  beforeEach(() => {
    storage = new TokenStorage();
    storage.saveToken('fake-access-token');
    client = new SymposiumApiClient('https://symposiumapp.com', storage);
    mockFetch.mockReset();
  });

  describe('getUserTalks()', () => {
    it('fetches talks after resolving user info', async () => {
      mockFetch
        .mockResolvedValueOnce(makeApiResponse(mockUser))  // /me
        .mockResolvedValueOnce(makeApiResponse(mockTalks)); // /user/:id/talks/

      const talks = await client.getUserTalks();
      expect(talks).toHaveLength(1);
      expect(talks[0]?.attributes.title).toBe('TypeScript for Extension Developers');
    });

    it('sends Authorization header with Bearer token', async () => {
      mockFetch
        .mockResolvedValueOnce(makeApiResponse(mockUser))
        .mockResolvedValueOnce(makeApiResponse(mockTalks));

      await client.getUserTalks();

      const [_url, options] = mockFetch.mock.calls[0]!;
      expect((options as RequestInit).headers).toMatchObject({
        Authorization: 'Bearer fake-access-token',
      });
    });
  });

  describe('getBios()', () => {
    it('returns bios array', async () => {
      mockFetch
        .mockResolvedValueOnce(makeApiResponse(mockUser))
        .mockResolvedValueOnce(makeApiResponse(mockBios));

      const bios = await client.getBios();
      expect(bios[0]?.attributes.nickname).toBe('Jane Dev');
    });
  });

  describe('getTalkInfo()', () => {
    it('fetches a single talk by id', async () => {
      mockFetch.mockResolvedValueOnce(makeApiResponse(mockTalks[0]));

      const talk = await client.getTalkInfo('talk-1');
      expect(talk.id).toBe('talk-1');
    });
  });

  describe('getBio()', () => {
    it('fetches a single bio by id', async () => {
      mockFetch.mockResolvedValueOnce(makeApiResponse(mockBios[0]));

      const bio = await client.getBio('bio-1');
      expect(bio.id).toBe('bio-1');
    });
  });

  describe('error handling', () => {
    it('removes token on 401 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: () => Promise.resolve(''),
        json: () => Promise.resolve({}),
      });

      await expect(client.getLoggedUserData()).rejects.toThrow();
      const token = await storage.getToken();
      expect(token).toBeNull();
    });
  });
});
