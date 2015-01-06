
var amazon = require("./amazon-ASIN.js");

var main = function() {
    
    
    //console.log(process.env.AWS_ACCESS_KEY);
    amazon.getData("Passagier 23", function(err, result) {
        console.dir(result);
    });
};
main();