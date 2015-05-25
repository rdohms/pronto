function click(e) {

    window.close();

    chrome.tabs.insertCSS(null, { file: "build/css/font-awesome.css" });
    chrome.tabs.insertCSS(null, { file: "build/css/injected.css" });

    chrome.tabs.executeScript(null, { file: "build/js/jquery.min.js" }, function() {
        chrome.tabs.executeScript(null, { file: "build/js/pronto.js" });
    });

}

document.addEventListener('DOMContentLoaded', function () {
  var divs = document.querySelectorAll('a');
  console.log(divs);
  for (var i = 0; i < divs.length; i++) {
    divs[i].addEventListener('click', click);
  }
});
