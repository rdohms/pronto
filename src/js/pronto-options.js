import SymposiumApiClient from "./api/SymposiumApiClient";
import TokenStorage from "./identity/TokenStorage";
import TokenFetcher from "./identity/TokenFetcher";
import IdentityIntegrator from "./identity/IdentityIntegrator";
import ga from './analytics.js';
import settings from '../../extension/build/js/config.js';
import ProntoSettings from './options/ProntoSettings';

let storage  = new TokenStorage();
let api      = new SymposiumApiClient(settings.base_url, storage);
let fetcher  = new TokenFetcher(
    settings.client_id,
    settings.client_secret,
    settings.base_url,
    storage
);

let identity = new IdentityIntegrator(fetcher, api);

ga('send', 'pageview', '/options.html');
