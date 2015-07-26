import SymposiumApiClient from "./api/SymposiumApiClient";
import TokenStorage from "./identity/TokenStorage";
import TokenFetcher from "./identity/TokenFetcher";
import ProntoOptions from "./options/ProntoOptions";
import option_storage from "./options/OptionStorage";
import ga from './analytics.js';
import settings from '../../extension/build/js/config.js';

let storage  = new TokenStorage();
let api      = new SymposiumApiClient(settings.base_url, storage);
let fetcher  = new TokenFetcher(
    settings.client_id,
    settings.client_secret,
    settings.base_url,
    storage
);

let identity = new ProntoOptions(fetcher, api, option_storage);

ga('send', 'pageview', '/options.html');
