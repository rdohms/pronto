import debug from '../helper/Debug.js';
import type { TokenStorage } from './TokenStorage.js';

/**
 * Handles the OAuth2 web-auth flow via chrome.identity.launchWebAuthFlow,
 * then exchanges the auth code for an access token.
 *
 * All jQuery ($.post) replaced with native fetch().
 */
export class TokenFetcher {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly redirectRegExp: RegExp;
  private readonly base_url: string;
  readonly storage: TokenStorage;
  private access_token: string | null = null;
  private currentCallback: ((error: Error | null, token?: string) => void) | null = null;

  constructor(id: string, secret: string, base_url: string, storage: TokenStorage) {
    this.clientId = id;
    this.clientSecret = secret;
    this.redirectUri = chrome.identity.getRedirectURL('provider_cb');
    this.redirectRegExp = new RegExp(`${this.redirectUri}[#?](.*)`);
    this.base_url = base_url;
    this.storage = storage;

    this.storage.getToken().then((token) => {
      this.access_token = token;
    });
  }

  getToken(interactive: boolean, callback: (error: Error | null, token?: string) => void): void {
    this.currentCallback = callback;

    // We already have a token — short-circuit
    if (this.access_token) {
      this.currentCallback(null, this.access_token);
      return;
    }

    const options: chrome.identity.WebAuthFlowOptions = {
      interactive,
      url: this._getAuthUrl(),
    };

    debug.log('[fetcher] identity options:', options);

    chrome.identity.launchWebAuthFlow(options, (redirectUri) => {
      debug.log('[fetcher] launchWebAuthFlow completed', chrome.runtime.lastError, redirectUri);

      if (chrome.runtime.lastError) {
        this.currentCallback?.(new Error(chrome.runtime.lastError.message));
        return;
      }

      if (!redirectUri) {
        this.currentCallback?.(new Error('No redirect URI returned'));
        return;
      }

      const matches = redirectUri.match(this.redirectRegExp);
      if (matches && matches.length > 1) {
        this._handleProviderResponse(this._parseRedirectFragments(matches[1]!));
      } else {
        this.currentCallback?.(new Error('Invalid redirect URI'));
      }
    });
  }

  private async _setAccessToken(access_token: string): Promise<void> {
    this.access_token = access_token;
    debug.log('[fetcher] setting access_token:', access_token);
    await this.storage.saveToken(access_token);
    this.currentCallback?.(null, access_token);
  }

  private _handleProviderResponse(values: Record<string, string>): void {
    debug.log('[fetcher] handling provider response:', values);

    if (Object.prototype.hasOwnProperty.call(values, 'access_token')) {
      void this._setAccessToken(values['access_token']!);
    } else if (Object.prototype.hasOwnProperty.call(values, 'code')) {
      void this._exchangeCodeForToken(values['code']!);
    } else {
      this.currentCallback?.(new Error('Neither access_token nor code available.'));
    }
  }

  private _parseRedirectFragments(fragment: string): Record<string, string> {
    const pairs = fragment.split(/&/);
    const values: Record<string, string> = {};
    for (const pair of pairs) {
      const [name, val] = pair.split(/=/);
      if (name) values[name] = val ?? '';
    }
    return values;
  }

  private async _exchangeCodeForToken(code: string): Promise<void> {
    try {
      const response = await fetch(this._getAccessTokenUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(this._getCodeExchangeData(code)).toString(),
      });

      if (!response.ok) {
        debug.log('[fetcher] code exchange HTTP error:', response.status);
        this.currentCallback?.(new Error(`Code exchange failed with status ${response.status}`));
        return;
      }

      const data = (await response.json()) as Record<string, unknown>;

      if (Object.prototype.hasOwnProperty.call(data, 'access_token')) {
        await this._setAccessToken(data['access_token'] as string);
      } else {
        debug.log('[fetcher] no access_token in response');
        this.currentCallback?.(new Error('Cannot obtain access_token from code.'));
      }
    } catch (err) {
      debug.log('[fetcher] failed to exchange code:', err);
      this.currentCallback?.(err instanceof Error ? err : new Error(String(err)));
    }
  }

  private _getAuthUrl(): string {
    const encodedUri = encodeURIComponent(this.redirectUri);
    return `${this.base_url}/oauth/authorize?client_id=${this.clientId}&redirect_uri=${encodedUri}&response_type=code`;
  }

  private _getAccessTokenUrl(): string {
    return `${this.base_url}/oauth/token`;
  }

  private _getCodeExchangeData(code: string): Record<string, string> {
    return {
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUri,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    };
  }
}
