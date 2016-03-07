'use strict';

var fs = require("fs");
function exportFilesRecursive(path, opt) {
    path = path || '.';
    var content = fs.readdirSync(path);
    var files = content.filter(function(file) {
        var filter = true;
        if (file.indexOf('.js') === -1) {
            return false;
        }
        if(!!opt.include) {
            var p = new RegExp(opt.include,"g");
            filter = p.test(file);
            //console.log(p,'test(',file,') ->', filter);
        }
        
        if(!!opt.exclude && !!filter) {
            var p = new RegExp(opt.exclude,"g");
            filter = !p.test(file);
            //console.log(p,'test(',file,') ->', filter);
        }
        return filter;
        
    });
    var childPages = content.filter(function(file) {
        return file.indexOf('.js') === -1;
    }).map(function(folder) {
        return exportFilesRecursive(path + '/' + folder, opt);
    });
    var out = {};
    files.forEach(function(file) {
        var fileName = file.replace('.js', '');
        var filePath = path + '/' + file;
        out[fileName] = require(filePath);
    });
    return out;
}

module.exports = exportFilesRecursive;