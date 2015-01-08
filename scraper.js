var request = require("request");
var cheerio = require("cheerio");
var async = require("async");
var trim = require("trim");
var iconv = require('iconv-lite');
var database = require("./scraper-database.js");
var amazon = require("./amazon-ASIN.js");

var BOOK_COUNT = 20;
var AWS_REQUEST_DELAY = 800;
var SPIEGEL_URL = {
    sachbuch: "http://www.spiegel.de/kultur/spiegel-bestseller-hardcover-a-458991.html",
    belletristik: "http://www.spiegel.de/kultur/spiegel-bestseller-hardcover-a-458991.html"
};
var FOCUS_URL = {
    sachbuch: "http://www.weltbild.de/1/focus-sachbuch/focus-bestseller-hardcover-sachbuch.html",
    belletristik: "http://www.weltbild.de/1/focus-bestseller/focus-bestsellerliste.html?ceid=259659847"
};
var sachbuch = "sachbuch";
var belletristik = "belletristik";
var SPIEGEL = "spiegel";
var FOCUS = "focus";

function Book(title, autor) {
    var that = {};
    that.title = title;
    that.autor = autor;
    return that;
}

function DatabaseDocument(spiegelData, focusData) {
    var that = {
        spiegel: spiegelData,
        focus: focusData
    };

    return that;
}

// Basisklasse
// Template Method Pattern
var Scraper = function(URL) {
    var that = {};

    // ein HTTP-GET request
    var scrapeRequest = function(URL, strategy, callback) {
        request.get({
            uri: URL,
            encoding: null
        }, function(error, response, html) {
            if (error) {
                return callback(error);
            }

            // NUR BEIM SPIEGEL!
            if (that.magazineName === SPIEGEL) {
                html = iconv.decode(html, 'iso-8859-1');
            }

            if (response.statusCode == 200) {
                var results = strategy(html);
                callback(null, results);
            }
        });
    };

    // Sachbuch und Belletristik sequentiell hintereinander scrapen
    var execRequests = function(callback) {
        async.waterfall([
            function(callback) {
                scrapeRequest(URL.sachbuch, that.scrapeSachbuchStrategy, callback);
            },
            function(sachbuchResult, callback) {
                scrapeRequest(URL.belletristik, that.scrapeBelletristikStrategy, function(err, belletristikResult) {
                    if (err) {
                        return callback(err);
                    }
                    // gebündeltes Resultat zurückgeben
                    var result = {
                        sachbuchBooks: sachbuchResult,
                        belletristikBooks: belletristikResult
                    };
                    callback(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                return callback(err);
            }
            return callback(null, result);
        });
    };

    // PUBLIC
    that.URL = URL;
    that.scrapeSachbuchStrategy = function(html) {
        console.log('This method must be overriden!');
    };
    that.scrapeBelletristikStrategy = function(html) {
        console.log('This method must be overriden!');
    };

    that.scrape = function(callback) {
        execRequests(function(err, result) {
            if (err) {
                return console.log(err);
            }
            console.log("Finished scraping!");
            callback(null, result);
        });
    };

    return that;
};

var FocusScraper = function(URL) {
    var that = Scraper(URL);

    // PRIVATE
    var scrapeStrategy = function(html) {
        var $ = cheerio.load(html);
        var books = [];

        // scrape
        var $bstListItems = $(".items.clearfix li");
        var $boxContentBoxes = $bstListItems.find(".contentbox");

        // Sachbuch
        for (var i = 0; i < 20; i++) {
            var title = $($boxContentBoxes[i]).find(".title.hyphenate").text();
            var autor = $($boxContentBoxes[i]).find(".author").text();
            var book = Book(trim(title), trim(autor));
            books.push(book);
        }

        return books;
    }

    // PUBLIC
    that.magazineName = FOCUS;
    that.scrapeSachbuchStrategy = function(html) {
        return scrapeStrategy(html, sachbuch);
    };
    that.scrapeBelletristikStrategy = function(html) {
        return scrapeStrategy(html, belletristik);
    };

    return that;
};

// Konkrete Klassen
var SpiegelScraper = function(URL) {
    var that = Scraper(URL);

    // PRIVATE
    var $ = {};
    var scrapeTableCells = function($cells, index) {
        var belletristikCellDomElement = $cells[index];
        var $belletristikCell = $(belletristikCellDomElement);
        var $title = $belletristikCell.find('.bsttitel');
        var $autor = $belletristikCell.find('.bstautor');
        return Book($title.text(), $autor.text());
    };
    var scrapeStrategy = function(html, index) {
        $ = cheerio.load(html);
        var books = [];

        // Tabelle für Bestenliste zeilenweise durchsuchen
        var $tableRows = $(".bst tr");
        for (var i = 1; i < $tableRows.length; i++) {
            var rowDomElem = $tableRows[i];
            var $row = $(rowDomElem);
            var $cells = $row.find("td");

            var book = scrapeTableCells($cells, index);
            books.push(book);
        }

        return books;
    };

    // PUBLIC
    that.magazineName = SPIEGEL;
    that.scrapeSachbuchStrategy = function(html) {
        return scrapeStrategy(html, 2, sachbuch);
    };
    that.scrapeBelletristikStrategy = function(html) {
        return scrapeStrategy(html, 0, belletristik);
    };

    return that;
};

/*
ACHTUNG: die einzelnen ergebnisse müssen zusammengeührt werden,
NICHT einzelne bücher zurückgeben im callback!!
*/
var embedAmazonData = function(books, index, callback) {
    console.log("embed Amazon Data...");
    var book = books[index];
    amazon.getData(book.title, function(err, data) {
        if (err) {


            return callback(err);
        }

        // Set Data
        book.URL = data.URL;
        book.image = data.image;

        // Return Result, if it was the last book
        index = index + 1;
        if (index == books.length) {
            console.log("finished embedding amazon data.");
            return callback(null, books);
        }

        // WICHTIG: Der callback muss weitergegeben werden!
        // Verhindern, dass zu viele requests in kurzer Zeit ausgeführt werden
        setTimeout(function() {
            embedAmazonData(books, index, callback);
        }, AWS_REQUEST_DELAY);
    });
};

exports.SPIEGEL_URL = SPIEGEL_URL;
exports.FOCUS_URL = FOCUS_URL;
exports.BOOK_COUNT = BOOK_COUNT;
exports.SpiegelScraper = SpiegelScraper;
exports.focusScraper = FocusScraper();



// Test
function main() {
    var spiegelScraper = SpiegelScraper(SPIEGEL_URL);
    var focusScraper = FocusScraper(FOCUS_URL);

    spiegelScraper.scrape(function(err, result) {
        //'Iterator'-Funktion: sequentielle ausführung von callbacks
        embedAmazonData(result.sachbuchBooks, 0, function(error, sachbuchBooksWithAmazonData) {
            if (error) {
                return console.log(error);
            }
            console.dir(sachbuchBooksWithAmazonData);
            console.log("Finished embedding amazon data in sachbuch books.");
            console.log("Now embedding amazon data in belletristik books...");
            embedAmazonData(result.belletristikBooks, 0, function(error, belletristikBooksWithAmazonData) {
                if (error) {
                    return console.log(error);
                }
                console.log("Finished embedding amazon data in belletristik books.");
                var spiegelData = {
                    sachbuchBooks: sachbuchBooksWithAmazonData,
                    belletristikBooks: belletristikBooksWithAmazonData
                };

                console.log("=== Now scraping focus... ===");
                focusScraper.scrape(function(err, result) {
                    console.dir(result);

                    // 'Iterator'-Funktion: sequentielle ausführung von callbacks
                    embedAmazonData(result.sachbuchBooks, 0, function(error, sachbuchBooksWithAmazonData) {
                        if (error) {
                            return console.log(error);
                        }
                        console.dir(sachbuchBooksWithAmazonData);
                        console.log("Finished embedding amazon data in sachbuch books.");
                        console.log("Now embedding amazon data in belletristik books...");
                        embedAmazonData(result.belletristikBooks, 0, function(error, belletristikBooksWithAmazonData) {
                            if (error) {
                                return console.log(error);
                            }
                            console.log("Finished embedding amazon data in belletristik books.");
                            var focusData = {
                                sachbuchBooks: sachbuchBooksWithAmazonData,
                                belletristikBooks: belletristikBooksWithAmazonData
                            };

                            var document = DatabaseDocument(spiegelData, focusData);
                            console.log("=== Final database document ===");
                            console.dir(document);
                            database.save("spiegel-und-focus", document);
                        });
                    });
                });
            });
        });
    });
}
main();
