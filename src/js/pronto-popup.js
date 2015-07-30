import Popup from "./popup/Popup";
import TalkLister from "./popup/TalkLister";
import BioLister from "./popup/BioLister";
import SymposiumApiClient from "./api/SymposiumApiClient";
import TokenStorage from "./identity/TokenStorage";
import ga from './analytics.js';
import settings from './options/SettingsReader';

settings.load().then( () => {

    let storage  = new TokenStorage();
    let api      = new SymposiumApiClient(
        settings.get('base_url'),
        storage
    );

    let talks = new TalkLister(api);
    let bios = new BioLister(api, settings);
    let popup = new Popup(talks, bios, storage);

    $(function () {
      $('[data-toggle="tooltip"]').tooltip()
    })

    ga('send', 'pageview', '/popup.html');

});
