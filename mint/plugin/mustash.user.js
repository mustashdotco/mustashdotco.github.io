// ==UserScript==
// @name       Mustash
// @namespace  http://mustash.co
// @version    0.1
// @description  See your subscriptions in your mint page
// @require     https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js
// @match      http*://*.mint.com/transaction.event*
// @copyright  2012+, Mustash.co
// ==/UserScript==

function callWhenReady(selector, callback) {
    if ($(selector).closest('body').length) {
        callback.call();
    } else {
        setTimeout(function () {
            callWhenReady(selector, callback);
        }, 1);
    }
}

function loadHack() {
    $("#controls-add").after("<a class='button' style='margin-left: 16px; width: 195px;' href='javascript://' id='controls-subscriptions' title='View your subscriptions with Mustash.co'>Your subscriptions with Mustash.co</a>");
}

callWhenReady(".firstdate",loadHack);
