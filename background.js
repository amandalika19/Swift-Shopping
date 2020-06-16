
// chrome.runtime.onInstalled.addListener(function()){
//     alert("Installed Extension! Welcome <3");
// }

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({color: '#3aa757'}, function() {
      console.log("The color is green.");
    });
  });