/*
* parse CLI args
*/
var args = function parseArgs() {
    var out = {};
    process.argv.forEach(function (x) {
        var split = x.split("=");
        if (split.length != 2) return;
        out[split[0]] = split[1];
    });
    return out;
}();

module.exports = args;