/*

Find the correspoding ASIN number for a book
and generate the referal URL.

*/

var config = require("./config.js");
var OperationHelper = require('apac').OperationHelper;

var PREFIX = "http://www.amazon.de/dp/";

var opHelper = new OperationHelper({
    awsId: config.AWS_ACCESS_KEY,
    awsSecret: config.AWS_SECRET_KEY,
    assocId: config.ASSOCIATE_ID,
    // Nur auf der deutschen Amazon-Seite suchen!
    endPoint: "ecs.amazonaws.de"
});

var generateURL = function(ASIN) {
    return PREFIX + ASIN + "/tag=" + config.ASSOCIATE_ID;
};

exports.generateAsinURL = function(title, callback) {
    opHelper.execute('ItemSearch', {
        'SearchIndex': 'Books',
        'Keywords': title,
        'ResponseGroup': 'ItemAttributes,Offers'
    }, function(err, results) {
        // HTTP request went wrong
        if (err) {
            return callback(err);
        }
        // Successful request, but wrong parameters for instance
        if (results.ItemSearchErrorResponse) {
            return callback(new Error(results.ItemSearchErrorResponse.Error[0].Message[0]));
        }
        if (results.ItemSearchResponse.Items[0].TotalResults[0] === "0") {
            return callback(new Error("No book found!"));
        }
        
        var item = results.ItemSearchResponse.Items[0].Item[0];
        var URL = generateURL(item.ASIN);
        callback(null, URL);
    });
}