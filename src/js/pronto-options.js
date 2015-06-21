import {SymposiumApiClient} from "./api/SymposiumApiClient";
import {TokenStorage} from "./identity/TokenStorage";
import {TokenFetcher} from "./identity/TokenFetcher";
import {IdentityIntegrator} from "./identity/IdentityIntegrator";

// let jQuery = require('jquery');
// require('../../build/js/bootstrap.min.js');

console.log("Hello from Options!");

let storage  = new TokenStorage();
let api = new SymposiumApiClient(storage);

let fetcher  = new TokenFetcher(1, 'hoihfoipqwe', storage);
let identity = new IdentityIntegrator(fetcher, api);
