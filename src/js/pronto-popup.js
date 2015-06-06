import {TalkLister} from "./popup/TalkLister";
import {SymposiumApiClient} from "./api/SymposiumApiClient";

let pronto = new TalkLister(new SymposiumApiClient());
