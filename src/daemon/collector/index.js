export function initCollector() {
  var s = window.document.createElement("script");
  s.src = chrome.extension.getURL("daemon/overload.js"); //CHROME
  (document.head||document.documentElement).appendChild(s);
}
