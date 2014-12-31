var jade = require("jade");
var cache = require("./cache.js");

exports.create = function() {
    var fn = jade.compileFile('./genre-table.jade', null);

    var locals = {
        genres: [{
            name: "Sachbuch",
            magazineLogo: "./img/spiegel-logo.svg",
            books: cache.jsonResult.sachbuchBooks
        }, {
            name: "Belletristik",
            magazineLogo: "./img/spiegel-logo.svg",
            books: cache.jsonResult.belletristikBooks
        }, ]
    };

    var html = fn(locals);
    console.log(html);

    return html;
};