var request = require("request");
var cheerio = require("cheerio");
var trim = require("trim");
var iconv = require('iconv-lite');
var database = require("./scraper-database.js");
var amazon = require("./amazon-ASIN.js");

var BOOK_COUNT = 20;
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

function Book(title, autor, genre) {
    var that = {};
    that.title = title;
    that.autor = autor;
    that.genre = genre;
    return that;
}

function Result(sachbuchBooks, belletristikBooks) {
    var that = {
        sachbuchBooks: sachbuchBooks,
        belletristikBooks: belletristikBooks
    };

    return that;
}

// Basisklasse
// Template Method Pattern
var Scraper = function(URL) {
    var that = {};
    that.URL = URL;
    that.scrapeSachbuchStrategy = function(html) {
        console.log('This method must be overriden!');
    };
    that.scrapeBelletristikStrategy = function(html) {
        console.log('This method must be overriden!');
    };
    that.scrape = function(callback) {
        var sachbuchResults = [];
        var belletristikResults = [];

        // Zuerst den Request für Sachbuch ausführen...
        request.get({
            uri: URL.sachbuch,
            encoding: null
        }, function(error, response, html) {
            if (error) {
                return callback(error);
            }

            // html dekodieren
            html = iconv.decode(html, 'iso-8859-1');
            if (response.statusCode == 200) {
                sachbuchResults = that.scrapeSachbuchStrategy(html);

                // ...und danach den Request für Belletristik
                request.get({
                    uri: URL.belletristik,
                    encoding: null
                }, function(error, response, html) {
                    if (error) {
                        return callback(error);
                    }

                    // html dekodieren
                    html = iconv.decode(html, 'iso-8859-1');
                    if (response.statusCode == 200) {
                        belletristikResults = that.scrapeBelletristikStrategy(html);
                        // gebündeltes Resultat zurückgeben
                        var result = Result(sachbuchResults, belletristikResults);
                        return callback(null, result);
                    }
                });
            }
        });
    };
    that.logResult = function(result) {
        var book = {};
        console.log("Sachbuch Top 20:");
        for (var i = 0; i < BOOK_COUNT; i++) {
            book = result.sachbuchBooks[i];
            console.log("====" + (i + 1) + "====");
            console.log(book.title);
            console.log(book.autor);
        }

        console.log("\n\nBelletristik Top 20:");
        for (var i = 0; i < BOOK_COUNT; i++) {
            book = result.belletristikBooks[i];
            console.log("====" + (i + 1) + "====");
            console.log(book.title);
            console.log(book.autor);
        }
    };

    return that;
};

var FocusScraper = function(URL) {
    var that = Scraper(URL);

    // PRIVATE
    var scrapeStrategy = function(html, genre) {
        var $ = cheerio.load(html);
        var books = [];

        // scrape
        var $bstListItems = $(".items.clearfix li");
        var $boxContentBoxes = $bstListItems.find(".contentbox");

        // Sachbuch
        for (var i = 0; i < 20; i++) {
            var title = $($boxContentBoxes[i]).find(".title.hyphenate").text();
            var autor = $($boxContentBoxes[i]).find(".author").text();
            var book = Book(trim(title), trim(autor), genre);
            books.push(book);
        }

        return books;
    }

    // PUBLIC
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
    var scrapeTableCells = function($cells, index, genre) {
        var belletristikCellDomElement = $cells[index];
        var $belletristikCell = $(belletristikCellDomElement);
        var $title = $belletristikCell.find('.bsttitel');
        var $autor = $belletristikCell.find('.bstautor');
        return Book($title.text(), $autor.text(), genre);
    };
    var scrapeStrategy = function(html, index, genre) {
        $ = cheerio.load(html);
        var books = [];

        // Tabelle für Bestenliste zeilenweise durchsuchen
        var $tableRows = $(".bst tr");
        for (var i = 1; i < $tableRows.length; i++) {
            var rowDomElem = $tableRows[i];
            var $row = $(rowDomElem);
            var $cells = $row.find("td");

            var book = scrapeTableCells($cells, index, genre);
            books.push(book);
        }

        return books;
    };

    // PUBLIC
    that.scrapeSachbuchStrategy = function(html) {
        return scrapeStrategy(html, 2, sachbuch);
    };
    that.scrapeBelletristikStrategy = function(html) {
        return scrapeStrategy(html, 0, belletristik);
    };

    return that;
};

exports.SPIEGEL_URL = SPIEGEL_URL;
exports.FOCUS_URL = FOCUS_URL;
exports.BOOK_COUNT = BOOK_COUNT;
exports.SpiegelScraper = SpiegelScraper;
exports.focusScraper = FocusScraper();

// Test
function main() {

    var embedURL = function(books, index) {
        console.log("generiere URL...");
        var book = books[index];
        amazon.generateAsinURL(book.title, function(err, url) {
            if (err) {
                return console.log(err);
            }

            book.URL = url;
            console.log(url);
            index = index + 1;

            if (index == books.length) {
                console.log("finished embedding urls.");
                return;
            }
            embedURL(books, index);
        });
    };

    var spiegelScraper = SpiegelScraper(SPIEGEL_URL);
    spiegelScraper.scrape(function(err, result) {
        console.log('finished.');
        // 'Iterator'-Funktion: sequentielle ausführung von callbacks
        embedURL(result.sachbuchBooks, 0);
        spiegelScraper.logResult(result);

    });
}
main();
