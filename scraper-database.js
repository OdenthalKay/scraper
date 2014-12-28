var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

// Connection URL
var url = 'mongodb://user:password@ds047940.mongolab.com:47940/scraperdatabase';

var execute = function(strategy, collectionName, document) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        var collection = db.collection(collectionName);
        
        if (strategy === loadStrategy) {
            loadStrategy(collection, collectionName, db);
        } else if (strategy === saveStrategy) {
            deleteOldDocument(collection);
            saveStrategy(collection, collectionName, document, db);
        }
    });
};

var deleteOldDocument = function(collection) {
    collection.remove({}, function(err){
        assert.equal(err, null);
    });
};

var loadStrategy = function(collection, collectionName, db) {
    collection.find().toArray(function(err, result) {
        assert.equal(err, null);
        assert.equal(result.length, 1, "Collection contains more than one element.");
        console.dir(result);
        console.log("Loaded Document from collection " + collectionName);
        db.close();
    });
};

var saveStrategy = function(collection, collectionName, document, db) {
    collection.insert(document, function(err, result) {
        assert.equal(err, null);
        console.log("Inserted 1 document into collection " + collectionName);
        db.close();
    });
};

// PUBLIC
exports.load = function(collectionName) {
    execute(loadStrategy, collectionName);
};
exports.save = function(collectionName, document) {
    execute(saveStrategy, collectionName, document);
}
