
// chrome.runtime.onInstalled.addListener(function()){
//     alert("Installed Extension! Welcome <3");
// }

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({color: '#3aa757'}, function() {
      console.log("The color is green.");
    });
  });

  // {
//     "name": "Shopping List Extension",
//     "version": "1.0",
//     "description": "Build an Extension!",
//     "background": {
//         "scripts": [
//             "background.js"
//         ],
//         "persistent": false
//     },
//     "manifest_version": 2
// }