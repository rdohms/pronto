import raw_settings from'../../extension/build/js/config.js';
import debug from './helper/Debug';

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-64498910-1', 'auto');
ga('set', 'checkProtocolTask', null);

if (raw_settings.analytics == false) {
    ga = function(...arg) {
        debug.log('[analytics] call:', ...arg);
    }
}

export default ga;
