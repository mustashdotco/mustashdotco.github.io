// ==UserScript==
// @name       Mustash
// @namespace  http://mustash.co
// @version    0.1
// @description  See your subscriptions in your mint page
// @require     https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.0.0/moment.min.js
// @match      http*://*.mint.com/transaction.event*
// @copyright  2012+, Mustash.co
// ==/UserScript==

function AppMeasurement() {};

var SUBSCRIPTION_DESCRIPTIONS_TO_CHECK_FOR = [
    "Netflix",
    "Amazon Prime", 
    "Birch Box", 
    "Zipcar",
    "Dollar Shave Club",
    "Hulu",
    "Dropbox",
    "Adobe",
    "Prezi",
    "Spotify",
    "Pandora"
];

var SUBSCRIPTION_ORIGINAL_DESCRIPTIONS_TO_CHECK_FOR = [
    "AmazonPrime Membership"
];

function callWhenReady(selector, callback) {
    if ($(selector).closest('body').length) {
        callback.call();
    } else {
        setTimeout(function () {
            callWhenReady(selector, callback);
        }, 1);
    }
}

function CSVToArray(strData, strDelimiter) {
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");
    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp((
    // Delimiters.
    "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
    // Quoted fields.
    "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
    // Standard fields.
    "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];
    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;
    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec(strData)) {
        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[1];
        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push([]);
        }
        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[2]) {
            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            var strMatchedValue = arrMatches[2].replace(
            new RegExp("\"\"", "g"), "\"");
        } else {
            // We found a non-quoted value.
            var strMatchedValue = arrMatches[3];
        }
        // Now that we have our value string, let's add
        // it to the data array.
        arrData[arrData.length - 1].push(strMatchedValue);
    }
    // Return the parsed data.
    return (arrData);
}

function CSV2JSON(csv) {
    var array = CSVToArray(csv);
    var objArray = [];
    for (var i = 1; i < array.length; i++) {
        objArray[i - 1] = {};
        for (var k = 0; k < array[0].length && k < array[i].length; k++) {
            var key = array[0][k];
            objArray[i - 1][key] = array[i][k]
        }
    }

    var json = JSON.stringify(objArray);
    var str = json.replace(/},/g, "},\r\n");

    return JSON.parse(str);
}

function loadHack() {
    $("#controls-add").after("<a class='button' style='margin-left: 16px; width: 195px;' href='javascript://' id='controls-subscriptions' title='View your subscriptions with Mustash.co'>Your subscriptions with Mustash.co</a>");
    $(".table-main").prepend("<iframe id='mustash' src='https://mustashdotco.github.io/mint/#[]' style='width: 923px;height: 561px;z-index: 100000;position: absolute;display: block;' class='hide'></iframe>");
    
    $("#controls-subscriptions").on("click", function () { 
        var mySubscriptions = {};
        $.ajax({
            url: $("#transactionExport").attr("href"),
        })
        .done(function( csvAsString ) {
            if ( console && console.log ) {
                var transactions = CSV2JSON(csvAsString);
                for(i in transactions) { 
                    var transaction = transactions[i];
                    if (SUBSCRIPTION_DESCRIPTIONS_TO_CHECK_FOR.indexOf(transaction.Description) > -1 || SUBSCRIPTION_ORIGINAL_DESCRIPTIONS_TO_CHECK_FOR.indexOf(transaction["Original Description"]) > -1) {
                        if (mySubscriptions.hasOwnProperty(transaction.Description)) {
                           	mySubscriptions[transaction.Description]["firstTransactionDate"] = transaction.Date;
                            mySubscriptions[transaction.Description]["total"] += parseInt(transaction.Amount);
                        } else {
                            mySubscriptions[transaction.Description] = {};
                            mySubscriptions[transaction.Description]["name"] = transaction.Description;
                            mySubscriptions[transaction.Description]["monthly"] = transaction.Amount;
                            mySubscriptions[transaction.Description]["total"] = parseInt(transaction.Amount);
                            mySubscriptions[transaction.Description]["lastTransactionDate"] = transaction.Date;
                            mySubscriptions[transaction.Description]["firstTransactionDate"] = transaction.Date;
                        }
                    }
                }
                var subscriptionArray = [];
                for(i in mySubscriptions) { 
                    mySubscriptions[i]["time"] = moment().diff(mySubscriptions[i]["firstTransactionDate"], 'days');
                    subscriptionArray.push(mySubscriptions[i])
                }
                $("#mustash").attr('src','https://mustashdotco.github.io/mint/#' + JSON.stringify(mySubscriptions));
                $("#mustash").removeClass("hide");
            }
        });
    });
}

callWhenReady(".firstdate",loadHack);
