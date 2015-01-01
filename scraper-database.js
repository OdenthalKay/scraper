var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

// Connection URL
var url = process.env.DATABASE_URL;

var execute = function(strategy, collectionName, callback, document) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to database");
        var collection = db.collection(collectionName);
        
        if (strategy === loadStrategy) {
            loadStrategy(collection, collectionName, db, callback);
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

var loadStrategy = function(collection, collectionName, db, callback) {
    collection.find().toArray(function(err, result) {
        assert.equal(err, null);
        assert.equal(result.length, 1, "Collection contains more than one element.");
        console.dir(result);
        console.log("Loaded Document from collection " + collectionName);
        callback(null, result);
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
exports.load = function(collectionName, callback) {
    execute(loadStrategy, collectionName, callback);
};
exports.save = function(collectionName, document) {
    // Callback isn't necessary, because asserts are sufficent
    execute(saveStrategy, collectionName, null, document);
}
