var exportFilesRecursive = require('./../infra/exportFilesRecursive');

var normalizedPath = __dirname;

var modulesToExport = exportFilesRecursive(normalizedPath, {exclude:'index', include:'Page'});
var out = {};
module.exports = out;
for (var key in modulesToExport) {
    out[key] = function(){return modulesToExport[key];}();
}
