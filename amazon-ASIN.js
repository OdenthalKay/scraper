/*

Find the correspoding ASIN number for a book
and generate the referal URL.

*/

var OperationHelper = require('apac').OperationHelper;

var PREFIX = "http://www.amazon.de/dp/";
var ASSOCIATE_ID = "top20bestse0a-21";

var opHelper = new OperationHelper({
    awsId:     'AKIAJDBHWANJAYR2MWSQ',
    awsSecret: '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',
    assocId:   ASSOCIATE_ID,
    // Nur auf der deutschen Amazon-Seite suchen!
    endPoint: "ecs.amazonaws.de"
});

opHelper.execute('ItemSearch', {
  'SearchIndex': 'Books',
  'Keywords': 'er ist wieder da',
  'ResponseGroup': 'ItemAttributes,Offers'
}, function(err, results) { 
        var item = results.ItemSearchResponse.Items[0].Item[0];
        var URI = generateURI(item.ASIN);
        console.log(URI);
});

var generateURI = function(ASIN) {
    return PREFIX + ASIN + "/tag="+ASSOCIATE_ID;
};