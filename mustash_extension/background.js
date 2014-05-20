// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {

  chrome.tabs.executeScript({
    file: 'loadScripts.js'
  });

  // No tabs or host permissions needed!

  chrome.tabs.executeScript({ file: "jquery.js" }, function() {
    chrome.tabs.executeScript({ file: "moment.js" }, function() {

       chrome.tabs.executeScript({
        file: 'mint/plugin/mustash.user.js'
      });

      chrome.tabs.executeScript({
        file: 'click-mustash-button.js'
      });
    })
  });

});
