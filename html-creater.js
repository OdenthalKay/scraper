var jade = require("jade");
var cache = require("./cache.js");

var spiegelLogoPath = "./img/spiegel-logo.svg";

exports.create = function() {
    var fn = jade.compileFile('./jade/genre-table.jade', null);

    var locals = {
        genres: [{
            name: "Sachbuch",
            magazineLogo: spiegelLogoPath,
            books: cache.jsonResult.sachbuchBooks
        }, {
            name: "Belletristik",
            magazineLogo: spiegelLogoPath,
            books: cache.jsonResult.belletristikBooks
        }, ]
    };

    var html = fn(locals);
    return html;
};