'use strict';
var config    = require('./../util/config');
class Widget {
    constructor(driver, locator) {
        var Actionbot = require('./../util/Actionbot');
        this.actionbot = new Actionbot(driver);
        this.driver    = driver;
        this.locator   = locator;
    }
    getTimeout(methodName) {
        var out;
        var property = 'tests.widgets.timeouts' + this.pageName + '.' + methodName;
        if (config.has(property)) {
            return config.get(property);
        }
        property = 'tests.widgets.timeouts' + this.pageName + '.default';
        if (config.has(property)) {
            return config.get(property);
        }
        return false;
    }

   get root() {
       //getting a WebElement is considered to be a costly operation, so it could be tamping to save the WebElement
       //reference rather then fetching it every time, but it could result in stale element exception
       return this.actionbot.getElement(this.locator, {steps:false});
   }
}

module.exports = Widget;