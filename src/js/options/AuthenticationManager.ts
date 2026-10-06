import debug from '../helper/Debug.js';
import type { TokenFetcher } from '../identity/TokenFetcher.js';
import type { SymposiumApiClient } from '../api/SymposiumApiClient.js';
import { trackEvent } from '../analytics.js';

/**
 * Manages the login/logout UI state on the options page.
 * All jQuery replaced with native DOM APIs.
 */
export class AuthenticationManager {
  private readonly fetcher: TokenFetcher;
  private readonly api: SymposiumApiClient;

  private loggedInDiv: HTMLElement;
  private loginDiv: HTMLElement;
  private loadingDiv: HTMLElement;
  private userNameEl: HTMLElement;
  private logoutBtn: HTMLElement;
  private loginBtn: HTMLElement;
  private registerBtn: HTMLElement;

  constructor(fetcher: TokenFetcher, api: SymposiumApiClient) {
    this.fetcher = fetcher;
    this.api = api;
    this._setup();
  }

  private _requireEl(selector: string): HTMLElement {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) throw new Error(`AuthenticationManager: required element not found: ${selector}`);
    return el;
  }

  private _setup(): void {
    this.loggedInDiv = this._requireEl('.logged_in');
    this.loginDiv = this._requireEl('.not_logged_in');
    this.loadingDiv = this._requireEl('.loading');
    this.userNameEl = this._requireEl('#info-fullname');
    this.logoutBtn = this._requireEl('#btn-logout');
    this.loginBtn = this._requireEl('#btn-login');
    this.registerBtn = this._requireEl('#btn-register');

    this.loadingDiv.style.display = 'none';

    this._attachButtonActions();

    this.fetcher.storage.hasToken().then((hasToken) => {
      this.toggleOptions(hasToken);
    });
  }

  private _attachButtonActions(): void {
    this.loginBtn.addEventListener('click', () => {
      this.loadingDiv.style.display = '';
      this.loginDiv.style.display = 'none';
      this.initiateInteractiveSignIn();
    });

    this.logoutBtn.addEventListener('click', () => {
      this.fetcher.storage.removeToken();
      this.toggleOptions(false);
    });

    this.registerBtn.addEventListener('click', () => {
      window.location.href = 'https://symposiumapp.com/sign-up';
    });
  }

  initiateInteractiveSignIn(): void {
    void trackEvent('initiate_interactive_signin', { category: 'extension' });

    this.fetcher.getToken(true, (error) => {
      if (error) {
        debug.log('[auth] getToken error:', error);
        this.toggleOptions(false);
      } else {
        this.api.loadToken(() => {
          this.toggleOptions(true);
        });
      }
    });
  }

  getUserData(callback: (user: { name?: string; first_name?: string }) => void): void {
    this.api
      .getLoggedUserData()
      .then((response) => {
        debug.log('[auth] logged user data:', response);
        callback(response.attributes);
      })
      .catch((err) => {
        debug.log('[auth] failed to get user data:', err);
        this.fetcher.storage.removeToken();
        this.toggleOptions(false);
      });
  }

  toggleOptions(hasToken: boolean): void {
    if (hasToken) {
      this.loadingDiv.style.display = '';
      this.loginDiv.style.display = 'none';
      this.loggedInDiv.style.display = 'none';
      this.getUserData((user) => {
        this.loadingDiv.style.display = 'none';
        this.userNameEl.textContent = user.name ?? user.first_name ?? '';
        this.loggedInDiv.style.display = '';
      });
    } else {
      this.loadingDiv.style.display = 'none';
      this.loginDiv.style.display = '';
      this.loggedInDiv.style.display = 'none';
    }
  }
}
