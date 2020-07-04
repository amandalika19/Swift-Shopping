$(function () {
   var links = [];

   initPopupState();
   initHandlers();
   initRefreshStateHandler();

   function initPopupState() {
      var getPreferencesMessage = {
         action: window.toReadActions.getCurrentState
      };

      chrome.runtime.sendMessage(getPreferencesMessage, function (response) {
         links = response.savedLinks;
         console.log(links);
         rebuildList();
      });
   }

   function initRefreshStateHandler() {
      chrome.runtime.onMessage.addListener(
         function (request, sender, sendResponse) {
            if (request.action === window.toReadActions.refreshPopup) {
               links = request.data.savedLinks;
               rebuildList();
            }
         }
      )
   }

   function initHandlers() {
      $("#addLink").click(createLinkClick);
      $(document).on("click", ".link", openLinkClick);
      $(document).on("click", ".remove", removeLinkClick);
   }

   function createLinkClick(e) {
      e.stopPropagation();

      var newParamsMessage = {
         action: window.toReadActions.addLink
      };

      chrome.runtime.sendMessage(newParamsMessage);
   }

   function removeLinkClick(e) {
      e.stopPropagation();
      e.preventDefault();
      
      var linkId = $(this).data("linkId");
      var removeMessage = {
         action: window.toReadActions.removeLink,
         data: {
            linkId: linkId
         }
      };

      chrome.runtime.sendMessage(removeMessage);
      return false;
   }

   function openLinkClick(e) {
      e.stopPropagation();
      e.preventDefault();
      
      var linkId = $(this).data("linkId");
      var openMessage = {
         action: window.toReadActions.openLink,
         data: {
            linkId: linkId
         }
      };

      chrome.runtime.sendMessage(openMessage);
      return false;
   }

   function rebuildList() {
      var markup = '<div class="link" data-link-id="<%= linkId %>">' +
                     '<div class="link-favicon-column">' +
                        '<img src="<%= favicon %>" />' +
                     '</div>' +
                     '<div class="link-info-column">' +
                        '<div class="link-title" title="<%= title %>"><%= title %></div>' +
                        '<div class="link-url" title="<%= url %>"><%= url %></div>' +
                     '</div>' +
                     '<div class="link-delete-column">' +
                        '<a href="#" title="Remove">' +
                        '  <i class="remove glyphicon glyphicon-remove-sign glyphicon-white" data-link-id="<%= linkId %>"></i>' +
                        '</a>' +
                     '</div>' +
                  '</div>';

      var templateFn = _.template(markup);
      $("#savedLinks").empty();

      if (links && links.length) {
         var linksMarkup = '';
         for (var i = 0; i < links.length; i++) {
            linksMarkup += templateFn(links[i]);
         }
         $("#savedLinks").html(linksMarkup);
      }

   }
});