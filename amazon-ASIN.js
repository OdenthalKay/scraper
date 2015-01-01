/*

Find the correspoding ASIN number for a book
and generate the referal URL.

*/

var OperationHelper = require('apac').OperationHelper;

var PREFIX = "http://www.amazon.de/dp/";

var opHelper = new OperationHelper({
    awsId: process.env.AWS_ACCESS_KEY,
    awsSecret: process.env.AWS_SECRET_KEY,
    assocId: process.env.ASSOCIATE_ID,
    // Nur auf der deutschen Amazon-Seite suchen!
    endPoint: "ecs.amazonaws.de"
});

var generateURL = function(ASIN) {
    return PREFIX + ASIN + "/tag=" + config.ASSOCIATE_ID;
};

/*
Data:
- ASIN
- cover image
*/
exports.getData = function(bookTitle, callback) {
    opHelper.execute('ItemSearch', {
        'SearchIndex': 'Books',
        'Keywords': bookTitle,
        'ResponseGroup': 'ItemAttributes,Offers,Images'
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
        var image = item.MediumImage[0].URL[0];

        var amazonResult = {
            URL: URL,
            image: image
        };

        callback(null, amazonResult);
    });
};
