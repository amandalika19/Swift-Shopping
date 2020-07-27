var savedLinks = [];

var STORAGE_KEY = "List:1.0";


chrome.runtime.onMessage.addListener(
   function (request, sender, sendResponse) {
      if (request.action === window.toReadActions.getCurrentState) {
         getExtensionState(request, sender, sendResponse);
      } else if (request.action === window.toReadActions.addLink) {
         addLink(request, sender, sendResponse);
      } else if (request.action === window.toReadActions.removeLink) {
         removeLink(request, sender, sendResponse);
      } else if (request.action === window.toReadActions.openLink) {
         openLink(request, sender, sendResponse);
      }
   });

restoreExtensionData();

function restoreExtensionData() {
      var storageDataString = localStorage[STORAGE_KEY];
   
      if (storageDataString) {
         var data = JSON.parse(storageDataString);
         savedLinks = data.savedLinks;
      } else {
         savedLinks = [];
      }
   
      initBadge();
}


function getExtensionState(request, sender, sendResponse) {
   var preferences = {
      savedLinks: savedLinks
   };

   sendResponse(preferences);
}

function addLink(request, sender, sendResponse) {
   chrome.tabs.query({
         currentWindow: true,
         active: true
      },
      currentTabReceivedCallback
   );
}

function currentTabReceivedCallback(tabArray) {
   if (tabArray.length) {
      var currentTab = tabArray[0];

      var url = currentTab.url;
      var isLinkSaved = _.some(savedLinks, {
         url: url
      });
      if (isLinkSaved) {
         return;
      }

      var newLinkData = {
         linkId: new Date().getTime(),
         url: currentTab.url,
         title: currentTab.title
      };
      
      var favIconUrl;
      if (currentTab.favIconUrl) {
         favIconUrl = currentTab.favIconUrl;
      }

      convertImgToDataURLviaCanvas(favIconUrl, function (dataUrl) {
         newLinkData.favicon = dataUrl;
         savedLinks.push(newLinkData);
         commitChanges();
      });
   }
}

function convertImgToDataURLviaCanvas(url, callback, outputFormat) {
   var img = new Image();
   img.crossOrigin = 'Anonymous';
   img.onload = function () {
      var canvas = document.createElement('CANVAS');
      var ctx = canvas.getContext('2d');
      var dataURL;
      canvas.height = this.height;
      canvas.width = this.width;
      ctx.drawImage(this, 0, 0);
      dataURL = canvas.toDataURL(outputFormat);
      callback(dataURL);
      canvas = null;
   };
   img.src = url;
}

function removeLink(request, sender, sendResponse) {
   var linkId = request.data.linkId;
   removeLinkById(linkId);
   commitChanges();
}

function removeLinkById(linkId) {
   _.remove(savedLinks, {
      linkId: linkId
   });
}

function openLink(request, sender, sendResponse) {
   var linkId = request.data.linkId;
   var link = _.find(savedLinks, {
      linkId: linkId
   });

   chrome.tabs.create({
      url: link.url,
      active: true
   });
}

function commitChanges() {
   updateLinkCoundBadge();

      var extensionState = {
         savedLinks: savedLinks
      };
   
      localStorage[STORAGE_KEY] = JSON.stringify(extensionState);

   var refreshPopupMessage = {
      action: window.toReadActions.refreshPopup,
      data: {
         savedLinks: savedLinks
      }
   };
   chrome.runtime.sendMessage(refreshPopupMessage);
}

function updateLinkCoundBadge() {
   chrome.browserAction.setBadgeText({
      text: savedLinks ? savedLinks.length.toString() : "0"
   });
}

function initBadge() {
   chrome.browserAction.setBadgeBackgroundColor({
      color: [0, 0, 0, 255]
   });
   chrome.browserAction.setTitle({
      title: 'Swift-Shopping'
   });

   updateLinkCoundBadge();
}


window.toReadActions = {
   getCurrentState: "getCurrentState",
   addLink: "addLink",
   removeLink: "removeLink",
   refreshPopup: "refreshPopup",
   openLink: "openLink"
};