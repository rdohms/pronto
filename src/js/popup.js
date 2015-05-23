function click(e) {
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
