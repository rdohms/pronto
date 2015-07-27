import SymposiumApiClient from "./api/SymposiumApiClient";
import TokenStorage from "./identity/TokenStorage";
import TokenFetcher from "./identity/TokenFetcher";
import ProntoOptions from "./options/ProntoOptions";
import option_storage from "./options/OptionStorage";
import ga from './analytics.js';
import settings from './options/SettingsReader';

settings.load().then( () => {

    let token_storage  = new TokenStorage();
    let api      = new SymposiumApiClient(settings.get('base_url'), token_storage);
    let fetcher  = new TokenFetcher(
        settings.get('client_id'),
        settings.get('client_secret'),
        settings.get('base_url'),
        token_storage
    );

    let options = new ProntoOptions(fetcher, api, option_storage);

    ga('send', 'pageview', '/options.html');

});
