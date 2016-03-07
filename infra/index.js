require('./jasmine.config');
var exportFilesRecursive = require('./exportFilesRecursive');

var normalizedPath = __dirname;

var modulesToExport = exportFilesRecursive(normalizedPath, {exclude:'index'});
var out = {};
module.exports = out;
for (var key in modulesToExport) {
    out[key] = function(){return modulesToExport[key];}();
}
