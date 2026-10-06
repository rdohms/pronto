import debug from '../helper/Debug.js';
import type { SourceAdapter } from '../../types/source-adapter.js';
import type { TokenStorage } from '../identity/TokenStorage.js';
import type { Talk, Bio, User, ApiResponse } from '../../types/index.js';

/**
 * Symposium API client — fetches talks, bios, and user info.
 * Implements the SourceAdapter interface so it can be swapped for
 * other sources (Sessionize, Papercall, etc.) without changing call sites.
 *
 * All jQuery $.ajax replaced with native fetch().
 */
export class SymposiumApiClient implements SourceAdapter {
  private readonly base_url: string;
  private readonly storage: TokenStorage;
  private access_token: string | null = null;
  private current_user: User | null = null;

  constructor(base_url: string, storage: TokenStorage) {
    this.base_url = `${base_url}/api`;
    this.storage = storage;
    void this.loadToken();
  }

  loadToken(callback: (() => void) | null = null): void {
    this.storage.getToken().then((token) => {
      this.access_token = token;
      callback?.();
    });
  }

  private async _makeRequest<T>(url: string): Promise<T> {
    debug.log('[api] making request with token:', url, this.access_token);

    const response = await fetch(`${this.base_url}${url}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.access_token ?? ''}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      // Remove stale token on auth errors
      if (response.status === 401) {
        this.storage.removeToken();
      }
      if (
        response.status === 400 &&
        (await response.text()).includes('access token')
      ) {
        this.storage.removeToken();
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  private async _ensureUserInfo(): Promise<void> {
    if (this.current_user !== null) return;

    const response = await this._makeRequest<ApiResponse<User>>('/me');
    this.current_user = response.data;
  }

  async getLoggedUserData(): Promise<User> {
    const response = await this._makeRequest<ApiResponse<User>>('/me');
    return response.data;
  }

  async getUserTalks(): Promise<Talk[]> {
    await this._ensureUserInfo();
    const response = await this._makeRequest<ApiResponse<Talk[]>>(
      `/user/${this.current_user!.id}/talks/`
    );
    return response.data;
  }

  async getTalkInfo(talk_id: string): Promise<Talk> {
    const response = await this._makeRequest<ApiResponse<Talk>>(`/talks/${talk_id}`);
    return response.data;
  }

  async getBios(): Promise<Bio[]> {
    await this._ensureUserInfo();
    const response = await this._makeRequest<ApiResponse<Bio[]>>(
      `/user/${this.current_user!.id}/bios/`
    );
    return response.data;
  }

  async getBio(bio_id: string): Promise<Bio> {
    const response = await this._makeRequest<ApiResponse<Bio>>(`/bios/${bio_id}`);
    return response.data;
  }
}
