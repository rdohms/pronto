# Pronto!

Pronto is a tool to facilitate the submission process to Calls for Papers. Its a chrome extension that will help you fill in the forms pulling data about your talks stored elsewhere.

Our initial goal is to import talks from Symposium App ([symposiumapp.com](http://symposiumapp.com)) and give you the option to rapid-fill the CfP form with data from that talk. It will attempt to figure out the right fields for the right information so it should be compatible with most CfP forms, not just OpenCFP.

It will provide a fair balance between flooding CfP's and avoiding the Copy/Paste process regular speakers need to go through everyday.

## Example

This is a working example of the application filling a form with initial static sample data from symposium.

![Working sample](resources/example-1.gif?raw=true)

## Install

Pronto! is currently only available on Google Chrome and can be installed on the [WebStore](https://chrome.google.com/webstore/detail/pronto/ceppkbmiglldpkelkicajinlfdkbpihh).

After installing it, you will see the pronto! button (![icon](resources/icon16.png)) on your extension bar and upon clicking you may be prompted to visit the options page and configure your API token for SymposiumApp.

The extension will guide you through the handshake process.

Once you have setup the api, clicking the button on the extension bar should list your talks

![list of talks](resources/talk-list.jpg)

By clicking on the icon next to it should fill the form and show you a summary.

![summary](resources/summary.jpg)
