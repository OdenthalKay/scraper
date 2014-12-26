/* global describe it expect */

var scraper = require("../scraper.js");

describe("scraped spiegel results", function() {
    it("should be of the expected count", function(done) {
        var spiegelScraper = scraper.SpiegelScraper(scraper.SPIEGEL_URL);
        spiegelScraper.scrape(function(err, result) {
            expect(result.sachbuchBooks.length).toBe(scraper.BOOK_COUNT);
            expect(result.belletristikBooks.length).toBe(scraper.BOOK_COUNT);
            done();
        });
    });
});