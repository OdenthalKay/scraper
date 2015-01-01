var jade = require("jade");
var cache = require("./cache.js");

var spiegelLogoPath = "./img/spiegel-logo.svg";
var focusLogoPath = "./img/focus-logo.png";

exports.create = function() {
    var fn = jade.compileFile('./jade/layout.jade', null);

    var locals = {
        magazines: [{
            genres: [{
                name: "Sachbuch",
                magazineLogo: spiegelLogoPath,
                books: cache.jsonResult.spiegel.sachbuchBooks
            }, {
                name: "Belletristik",
                magazineLogo: spiegelLogoPath,
                books: cache.jsonResult.spiegel.belletristikBooks
            }, ]
        }, {
            genres: [{
                name: "Sachbuch",
                magazineLogo: focusLogoPath,
                books: cache.jsonResult.focus.sachbuchBooks
            }, {
                name: "Belletristik",
                magazineLogo: focusLogoPath,
                books: cache.jsonResult.focus.belletristikBooks
            }, ]
        }]
    };

    var html = fn(locals);
    return html;
};